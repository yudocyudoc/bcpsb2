// src/components/observatory/OrganicPulse.tsx - Versión con Embeddings
import { useRef, useState, useCallback, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MoodEntryWithEmbedding } from '@/services/observatoryService'

interface OrganicPulseProps {
  entry: MoodEntryWithEmbedding
  position: [number, number, number]
  onClicked: (entry: MoodEntryWithEmbedding) => void
}

// El mismo shader vertex (sin cambios)
const organicVertexShader = `
  uniform float time;
  uniform float pulseIntensity;
  uniform float deformationStrength;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Función de ruido simplex (misma que antes)
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }
  
  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }
  
  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    // Deformación orgánica basada en ruido + embedding
    vec3 pos = position;
    float noise1 = snoise(pos * 3.0 + time * 0.5);
    float noise2 = snoise(pos * 6.0 + time * 0.8);
    float noise3 = snoise(pos * 12.0 + time * 1.2);
    
    // Combinamos múltiples octavas de ruido con intensidad controlada por embedding
    float displacement = (noise1 * 0.4 + noise2 * 0.3 + noise3 * 0.2) * deformationStrength;
    
    // Pulsación orgánica
    float pulse = sin(time * 2.0) * 0.1 * pulseIntensity;
    
    pos += normal * (displacement + pulse);
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// Shader fragment mejorado para colores emocionales
const organicFragmentShader = `
  uniform float time;
  uniform vec3 baseColor;
  uniform vec3 accentColor;
  uniform float pulseIntensity;
  uniform float emotionalIntensity;
  uniform float isHovered;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Color base emocional
    vec3 color = baseColor;
    
    // Efecto de fresnel para bordes luminosos
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - dot(vNormal, viewDirection);
    fresnel = pow(fresnel, 1.5);
    
    // Pulsación de color interna basada en intensidad emocional
    float pulse = sin(time * 3.0) * 0.5 + 0.5;
    vec3 innerGlow = mix(baseColor, accentColor, pulse) * emotionalIntensity;
    
    // Variación de color emocional en la superficie
    float surfaceVariation = sin(vPosition.x * 10.0 + time) * 
                           cos(vPosition.y * 8.0 + time * 1.2) * 
                           sin(vPosition.z * 12.0 + time * 0.8);
    vec3 emotionalColor = mix(baseColor, accentColor, surfaceVariation * 0.3 + 0.5);
    
    // Efecto de hover
    float hoverEffect = isHovered * 0.3;
    
    // Combinamos efectos
    color = mix(emotionalColor, emotionalColor * 1.5, fresnel * 0.4);
    color += innerGlow * 0.4;
    color += vec3(hoverEffect);
    
    // Intensidad emocional afecta el brillo general
    color *= (0.8 + emotionalIntensity * 0.4);
    
    // Suavizado final
    color = smoothstep(0.0, 1.0, color);
    
    gl_FragColor = vec4(color, 0.85 + emotionalIntensity * 0.15);
  }
`

// Mapeo de embeddings a colores emocionales
function getEmotionalColors(embedding: number[]) {
  if (!embedding || embedding.length < 6) {
    // Fallback a colores deterministas
    return {
      hue: Math.random() * 360,
      saturation: 0.7,
      lightness: 0.6,
      intensity: 0.5,
      deformation: 0.15
    }
  }

  // Mapear dimensiones del embedding a propiedades visuales
  const rawHue = Math.abs(embedding[0] * embedding[1] * 1000) % 360
  const saturation = Math.min(Math.abs(embedding[2]) * 2, 1.0)
  const lightness = 0.4 + Math.min(Math.abs(embedding[3]) * 0.6, 0.5)
  const intensity = Math.min(Math.abs(embedding[4]) * 2, 1.0)
  const deformation = 0.1 + Math.min(Math.abs(embedding[5]) * 0.3, 0.25)

  return {
    hue: rawHue,
    saturation: Math.max(saturation, 0.4), // Mínimo para que sea vibrante
    lightness: Math.max(lightness, 0.3),   // Mínimo para que sea visible
    intensity,
    deformation
  }
}

export function OrganicPulse({ entry, position, onClicked }: OrganicPulseProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [hovered, setHovered] = useState(false)

  // Propiedades visuales basadas en embedding emocional
  const visualProps = useMemo(() => {
    const emotionalProps = getEmotionalColors(entry.embedding || [])
    
    const baseColor = new THREE.Color().setHSL(
      emotionalProps.hue / 360, 
      emotionalProps.saturation, 
      emotionalProps.lightness
    )
    
    // Color de acento (complementario)
    const accentColor = new THREE.Color().setHSL(
      (emotionalProps.hue + 180) % 360 / 360,
      emotionalProps.saturation * 0.8,
      emotionalProps.lightness * 1.2
    )
    
    return {
      baseColor,
      accentColor,
      scale: 0.7 + emotionalProps.intensity * 0.6,
      pulseIntensity: 0.3 + emotionalProps.intensity * 0.7,
      emotionalIntensity: emotionalProps.intensity,
      deformationStrength: emotionalProps.deformation,
      rotationSpeed: 0.002 + emotionalProps.intensity * 0.008
    }
  }, [entry.embedding, entry.id])

  // Material shader orgánico con propiedades emocionales
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: organicVertexShader,
      fragmentShader: organicFragmentShader,
      uniforms: {
        time: { value: 0 },
        baseColor: { value: visualProps.baseColor },
        accentColor: { value: visualProps.accentColor },
        pulseIntensity: { value: visualProps.pulseIntensity },
        emotionalIntensity: { value: visualProps.emotionalIntensity },
        deformationStrength: { value: visualProps.deformationStrength },
        isHovered: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [visualProps])

  // Animación orgánica
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime()
      materialRef.current.uniforms.isHovered.value = hovered ? 1 : 0
    }
    
    if (meshRef.current) {
      // Rotación basada en intensidad emocional
      meshRef.current.rotation.y += visualProps.rotationSpeed
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.3
      
      // Escala suave con hover
      const targetScale = hovered ? visualProps.scale * 1.15 : visualProps.scale
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05)
    }
  })

  const handleClick = useCallback((event: any) => {
    event.stopPropagation()
    onClicked(entry)
  }, [entry, onClicked])

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        material={shaderMaterial}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 3]} />
        <primitive object={shaderMaterial} ref={materialRef} />
      </mesh>
      
      {/* Aura emocional cuando hover */}
      {hovered && (
        <mesh position={[0, 0, 0]} scale={1.8}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial 
            color={visualProps.accentColor} 
            transparent 
            opacity={0.08 + visualProps.emotionalIntensity * 0.05} 
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  )
}