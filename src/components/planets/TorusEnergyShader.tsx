// src/TorusEnergyShader.tsx

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Shader de Shadertoy adaptado para volumétrico interno
const shadertoyVolumetricVertex = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vPosition = position;
    
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const shadertoyVolumetricFragment = `
#define T time
#define PI 3.141596

uniform float time;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_valence;
uniform vec3 u_cameraPosition;
uniform vec2 u_resolution;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Función de rotación 2D del Shadertoy original
mat2 rotate(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
}

// SDF para caja 2D del original
float sdBox2d(vec2 p, vec2 s) {
    p = abs(p) - s;
    return length(max(p, 0.0)) + min(max(p.x, p.y), 0.0);
}

void main() {
    // Convertir coordenadas UV a coordenadas de raymarching
    vec2 uv = (vUv * 2.0 - 1.0);
    
    // Usar la posición 3D para crear profundidad
    vec3 rayOrigin = u_cameraPosition;
    vec3 rayDir = normalize(vWorldPosition - u_cameraPosition);
    
    // Simular el setup del Shadertoy original pero en 3D
    vec3 ro = vec3(0.0, 0.0, -4.0);
    vec3 rd = normalize(vec3(uv, 1.0));
    
    // Ajustar según la posición 3D del objeto
    ro += vPosition * 0.5;
    
    vec3 col = vec3(0.0);
    vec3 p;
    float z = 0.0;
    float d;
    
    // Parámetro temporal modulado por emociones (del original)
    float t = sin(T * (0.5 + u_intensity)) * 0.5 + 0.5;
    
    // Raymarching loop (adaptado del Shadertoy)
    for(float i = 0.0; i < 60.0; i++) {
        p = ro + rd * z;
        
        // Rotación emocional
        p.yz *= rotate(PI/3.0 + u_valence * 0.5);
        
        //------- SDF del torus (del Shadertoy original) -------
        float r1 = 1.2 * (0.5 + u_intensity * 0.5); // Radio mayor
        float r2 = 0.25 * (0.3 + u_complexity * 0.7); // Radio menor
        
        vec2 cp = vec2(length(p.xz) - r1, p.y);
        float a = atan(p.x, p.z);
        
        // Rotación y deformación del original
        cp *= rotate(a * 4.0 + T * (0.5 + u_intensity * 0.5));
        cp.y = abs(cp.y) - 0.5 * (0.5 + u_complexity * 0.5);
        
        // Deformación emocional (del original adaptado)
        vec2 boxSize = vec2(0.08, 0.25 * (sin(4.0 * a + T * u_intensity) * 0.5 + 0.5));
        d = sdBox2d(cp, boxSize) - 0.08;
        
        // Efectos volumétricos del original
        d = abs(d) + 0.008;
        d *= 0.25;
        
        // Colores emocionales (mejorados del original)
        vec3 baseColor;
        if (u_valence > 0.0) {
            // Emociones positivas: colores cálidos vibrantes
            baseColor = vec3(4.0, 3.0, 1.5) + sin(vec3(3, 2, 1) + p.x + u_valence * 2.0);
        } else if (u_valence < 0.0) {
            // Emociones negativas: colores fríos intensos
            baseColor = vec3(1.5, 2.5, 4.0) + sin(vec3(1, 2, 3) + p.x + abs(u_valence) * 2.0);
        } else {
            // Emociones neutras: balance dinámico
            baseColor = vec3(2.5, 2.5, 2.5) + sin(vec3(3, 2, 1) + p.x + T * 0.5);
        }
        
        // Intensidad del glow (del original)
        float glowIntensity = (1.0 + u_intensity * 2.0) / d;
        col += baseColor * glowIntensity;
        
        z += d;
        if(z > 8.0 || d < 1e-3) break;
    }
    
    // Post-procesamiento del original
    col = tanh(col / (3e3 * (0.5 + u_intensity * 0.5)));
    
    // Fade hacia los bordes para integración 3D
    float edgeFade = 1.0 - smoothstep(0.6, 1.0, length(uv));
    col *= edgeFade;
    
    // Alpha mucho más intenso
    float alpha = length(col) * 2.5 * edgeFade * (0.5 + u_intensity);
    
    gl_FragColor = vec4(col * 2.0, alpha);
}
`;

// Shader para planeta emocional
const planetVertex = `
uniform float time;
uniform float u_intensity;
uniform float u_complexity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Ruido simple para rotación planetaria
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Deformación muy sutil del planeta basada en emociones
    vec3 pos = position;
    float displacement = sin(position.x * 10.0 + time * 0.5) * 
                        sin(position.y * 8.0 + time * 0.3) * 
                        sin(position.z * 12.0 + time * 0.7) * 
                        0.01 * u_intensity; // Muy sutil
    
    pos += normal * displacement;
    
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const planetFragment = `
uniform float time;
uniform float u_intensity;
uniform float u_complexity;
uniform float u_valence;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWorldPosition;

// Función de ruido para texturas planetarias
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for(int i = 0; i < 4; i++) {
        value += amplitude * smoothNoise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    // Coordenadas esféricas para el planeta
    vec3 spherePos = normalize(vPosition);
    vec2 sphereUV = vec2(
        atan(spherePos.z, spherePos.x) / (2.0 * 3.14159) + 0.5,
        acos(spherePos.y) / 3.14159
    );
    
    // Rotación lenta del planeta
    sphereUV.x += time * 0.02;
    
    // Generar continentes emocionales
    float continents = fbm(sphereUV * 8.0 + time * 0.01);
    float details = fbm(sphereUV * 20.0 + time * 0.005) * 0.3;
    float surface = continents + details;
    
    // Colores base del planeta según valencia emocional
    vec3 oceanColor, landColor, atmosphereColor;
    
    if (u_valence > 0.0) {
        // Emociones positivas - espectro de luz dorada y jade
        if (u_valence > 0.7) {
            // Éxtasis de conexión (Sábado) - dorados iridiscentes
            oceanColor = vec3(0.2, 0.4, 0.6);      // Océano aguamarina profundo
            landColor = vec3(0.9, 0.7, 0.3);       // Tierra dorada luminosa
            atmosphereColor = vec3(1.0, 0.9, 0.6); // Atmósfera dorada
        } else if (u_valence > 0.5) {
            // Momento de belleza fugaz (Miércoles) - cristales y cielos
            oceanColor = vec3(0.3, 0.6, 0.8);      // Océano cristalino
            landColor = vec3(0.8, 0.9, 0.7);       // Tierra jade pálido
            atmosphereColor = vec3(0.9, 0.9, 0.8); // Atmósfera perla
        } else {
            // Anticipación melancólica (Lunes) - rosas antiguos y grises
            oceanColor = vec3(0.4, 0.5, 0.6);      // Océano gris perla
            landColor = vec3(0.7, 0.6, 0.6);       // Tierra rosa empolvado
            atmosphereColor = vec3(0.8, 0.7, 0.7); // Atmósfera malva
        }
    } else if (u_valence < 0.0) {
        // Emociones negativas - espectros de índigo y ámbar quemado
        if (u_valence < -0.5) {
            // Tormenta de autoexigencia (Martes) - tormentas eléctricas
            oceanColor = vec3(0.1, 0.2, 0.4);      // Océano tormenta profunda
            landColor = vec3(0.3, 0.2, 0.4);       // Tierra púrpura oscura
            atmosphereColor = vec3(0.4, 0.3, 0.5); // Atmósfera eléctrica
        } else {
            // Culpa social difusa (Viernes) - cobres oxidados
            oceanColor = vec3(0.3, 0.3, 0.4);      // Océano plomo
            landColor = vec3(0.5, 0.4, 0.3);       // Tierra cobre oxidado
            atmosphereColor = vec3(0.6, 0.5, 0.4); // Atmósfera bronce
        }
    } else {
        // Emociones neutras/contemplativas - espectros oceánicos
        if (u_complexity > 0.8) {
            // Introspección oceánica (Jueves) - profundidades marinas
            oceanColor = vec3(0.2, 0.4, 0.5);      // Océano abismal
            landColor = vec3(0.4, 0.5, 0.5);       // Tierra gris verdosa
            atmosphereColor = vec3(0.5, 0.6, 0.6); // Atmósfera niebla marina
        } else {
            // Quietud existencial (Domingo) - tonos tierra serenos
            oceanColor = vec3(0.4, 0.5, 0.5);      // Océano sage
            landColor = vec3(0.6, 0.6, 0.5);       // Tierra avena
            atmosphereColor = vec3(0.7, 0.7, 0.6); // Atmósfera lino
        }
    }
    
    // Añadir topografía emocional sutil - SOLO en base intensity para no sobrecargar
    float topography = 0.0;
    if (u_intensity > 0.7) {
        // Solo planetas muy intensos tienen topografía marcada
        topography = sin(sphereUV.x * 30.0) * sin(sphereUV.y * 20.0) * 0.03 * (u_intensity - 0.7);
        surface += topography;
    }
    
    // Mezclar océano y tierra
    vec3 planetSurface = mix(oceanColor, landColor, smoothstep(0.3, 0.7, surface));
    
    // Añadir variaciones por intensidad emocional
    float intensity = u_intensity;
    planetSurface += vec3(intensity * 0.2) * sin(surface * 10.0 + time);
    
    // Añadir complejidad emocional como "clima"
    float weather = fbm(sphereUV * 15.0 + time * 0.1) * u_complexity;
    planetSurface = mix(planetSurface, atmosphereColor, weather * 0.3);
    
    // Iluminación planetaria
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
    float NdotL = max(0.0, dot(vNormal, lightDir));
    
    // Terminator (línea día/noche) suave
    float terminator = smoothstep(0.0, 0.2, NdotL);
    
    // Lado oscuro del planeta (emociones inconscientes)
    vec3 nightSide = planetSurface * 0.1 + atmosphereColor * 0.05;
    
    // Mezclar día y noche
    vec3 finalColor = mix(nightSide, planetSurface * NdotL, terminator);
    
    // Atmósfera sutil en los bordes
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), 2.0);
    finalColor += atmosphereColor * fresnel * 0.2;
    
    // Brillo emocional
    finalColor *= (0.8 + intensity * 0.4);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface TorusEnergyShaderProps {
  intensity?: number;
  complexity?: number;
  valence?: number;
}

export const TorusEnergyShader = ({
  intensity = 0.5,
  complexity = 0.5,
  valence = 0.0
}: TorusEnergyShaderProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const volumetricRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);

  // Material volumétrico con Shadertoy
  const volumetricMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        u_intensity: { value: intensity },
        u_complexity: { value: complexity },
        u_valence: { value: valence },
        u_cameraPosition: { value: new THREE.Vector3() },
        u_resolution: { value: new THREE.Vector2(800, 600) }
      },
      vertexShader: shadertoyVolumetricVertex,
      fragmentShader: shadertoyVolumetricFragment,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, []);

  // Material para planeta emocional
  const planetMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        u_intensity: { value: intensity },
        u_complexity: { value: complexity },
        u_valence: { value: valence }
      },
      vertexShader: planetVertex,
      fragmentShader: planetFragment,
      transparent: false
    });
  }, []);

  // Actualizar uniforms
  useMemo(() => {
    if (volumetricMaterial) {
      volumetricMaterial.uniforms.u_intensity.value = intensity;
      volumetricMaterial.uniforms.u_complexity.value = complexity;
      volumetricMaterial.uniforms.u_valence.value = valence;
    }
    if (planetMaterial) {
      planetMaterial.uniforms.u_intensity.value = intensity;
      planetMaterial.uniforms.u_complexity.value = complexity;
      planetMaterial.uniforms.u_valence.value = valence;
    }
  }, [intensity, complexity, valence, volumetricMaterial, planetMaterial]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Actualizar tiempo y posición de cámara
    if (volumetricMaterial) {
      volumetricMaterial.uniforms.time.value = time;
      volumetricMaterial.uniforms.u_cameraPosition.value.copy(state.camera.position);
    }

    if (planetMaterial) {
      planetMaterial.uniforms.time.value = time;
    }

    // Rotaciones suaves del grupo completo
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.1 * (1 + intensity * 0.5);
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.05 * intensity;
    }

    // Rotación independiente del volumen interno
    if (volumetricRef.current) {
      volumetricRef.current.rotation.y = time * 0.15 * (1 + complexity);
      volumetricRef.current.rotation.z = Math.sin(time * 0.3) * 0.1 * valence;
    }

    // Animación de satélites-pensamientos
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.2; // Órbita más lenta, más contemplativa
      particlesRef.current.children.forEach((child, i) => {
        const phase = time * (0.5 + i * 0.05) + i * Math.PI * 2 / 18; // Movimiento más lento
        child.position.y = Math.sin(phase) * 0.15 * intensity;
        
        // Escala dinámica sutil para simular "respiración" de pensamientos
        const scale = 1 + Math.sin(phase * 3) * 0.1 * intensity;
        child.scale.setScalar(scale);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planeta emocional central */}
      <mesh>
        <sphereGeometry args={[0.6, 64, 64]} />
        <primitive object={planetMaterial} attach="material" />
      </mesh>

      {/* Satélites-pensamientos energéticos (raymarching) */}
      <group ref={volumetricRef}>
        {/* Múltiples planos orientados para crear volumen */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              rotation={[0, angle, 0]}
              position={[0, 0, 0]}
              scale={[0.8, 0.8, 0.8]} // Más pequeños, como satélites
            >
              <planeGeometry args={[1.6, 1.6, 64, 64]} />
              <primitive object={volumetricMaterial} attach="material" />
            </mesh>
          );
        })}
        
        {/* Planos verticales adicionales */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={`v${i}`}
              rotation={[Math.PI / 2, 0, angle]}
              position={[0, 0, 0]}
              scale={[0.8, 0.8, 0.8]}
            >
              <planeGeometry args={[1.6, 1.6, 64, 64]} />
              <primitive object={volumetricMaterial} attach="material" />
            </mesh>
          );
        })}
      </group>

      {/* Satélites-pensamientos orbitando */}
      <group ref={particlesRef}>
        {/* Pensamientos primarios - Más grandes, representan patrones dominantes */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 1.2 + Math.sin(i * 2) * 0.3;
          const height = Math.cos(i * 3) * 0.4;
          
          // Colores para pensamientos - MÁS VISIBLES
          let thoughtColor = "#ffffff";
          let thoughtEmissive = "#ffffff";
          
          if (valence > 0.5) {
            thoughtColor = "#ffd700"; // Dorado brillante
            thoughtEmissive = "#ffeb3b"; // Amarillo emisivo
          } else if (valence > 0) {
            thoughtColor = "#e6e6fa"; // Lavanda claro
            thoughtEmissive = "#dda0dd"; // Lavanda emisivo
          } else if (valence < -0.3) {
            thoughtColor = "#87ceeb"; // Azul cielo (más claro)
            thoughtEmissive = "#4fc3f7"; // Azul claro emisivo
          } else {
            thoughtColor = "#c0c0c0"; // Plata (más claro que antes)
            thoughtEmissive = "#b0b0b0"; // Plata emisiva
          }
          
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
            >
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshStandardMaterial 
                color={thoughtColor}
                transparent
                opacity={0.9} // Más opacos
                emissive={thoughtEmissive}
                emissiveIntensity={0.4 + intensity * 0.3} // Más brillantes
                roughness={0.2} // Más brillosos
                metalness={0.2}
              />
            </mesh>
          );
        })}
        
        {/* Creencias subyacentes - Más pequeñas pero con formas distintivas */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 0.9 + Math.sin(i * 4) * 0.2;
          const height = Math.cos(i * 5) * 0.3;
          
          // Colores para creencias - MÁS CONTRASTANTES
          let beliefColor = "#ffffff";
          let beliefEmissive = "#ffffff";
          
          if (complexity > 0.8) {
            beliefColor = "#8b4513"; // Marrón silla de montar (más cálido)
            beliefEmissive = "#a0522d"; // Marrón silla más claro
          } else if (complexity > 0.6) {
            beliefColor = "#9370db"; // Púrpura medio (más vibrante)
            beliefEmissive = "#ba55d3"; // Púrpura más claro
          } else if (complexity > 0.4) {
            beliefColor = "#cd853f"; // Marrón arena (más cálido)
            beliefEmissive = "#daa520"; // Dorado vara
          } else {
            beliefColor = "#778899"; // Gris pizarra claro
            beliefEmissive = "#95a5a6"; // Gris más claro
          }
          
          return (
            <mesh
              key={`belief${i}`}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
            >
              {/* Uso octahedron para creencias, diferenciándolas de pensamientos */}
              <octahedronGeometry args={[0.025, 0]} />
              <meshStandardMaterial 
                color={beliefColor}
                transparent
                opacity={0.8 + complexity * 0.2}
                emissive={beliefEmissive}
                emissiveIntensity={0.2 + complexity * 0.2} // Menos brillantes que pensamientos
                roughness={0.6} // Mantener más rugosas que pensamientos
                metalness={0.4} // Más metálicas para diferencia
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};