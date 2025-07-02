import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface OrganicShapeProps {
    visualProps: {
      geometryType?: 'fluid' | 'torus' | 'tetrahedron' | 'sphere';
      complexity?: number;
      deformationStrength?: number;
      scale?: number;
      valence?: number;
      baseColor?: THREE.Color;
      accentColor?: THREE.Color;
    };
    hovered: boolean;
  }

export function OrganicShape({ visualProps, hovered }: OrganicShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Crear geometría procedural orgánica
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const count = 32 // Reduced resolution for better performance
    const positions = new Float32Array(count * count * 3)
    const normals = new Float32Array(count * count * 3)
    const uvs = new Float32Array(count * count * 2)
    
    let idx = 0
    let uvIdx = 0
    
    // Función para crear formas orgánicas versión más variada:
    const shapeFunction = (u: number, v: number, target: THREE.Vector3) => {
      const theta = u * Math.PI * 2
      const phi = v * Math.PI
      
      // Safe defaults for properties
      const complexity = visualProps.complexity ?? 0.5
      const deformationStrength = visualProps.deformationStrength ?? 0.5
      const scale = visualProps.scale ?? 1
      
      let r = 0.5 // Base radius
      
      // Simplified shape generation
      switch(visualProps.geometryType) {
        case 'fluid':
          r = 0.5 + Math.sin(phi * 2) * 0.2
          r += Math.sin(theta * 3) * 0.1 * complexity
          break
        case 'torus':
          r = 0.7 + Math.cos(phi * 2) * 0.3
          break
        case 'tetrahedron':
          r = 0.5 + Math.abs(Math.sin(theta * 3)) * 0.2
          break
        default: // sphere
          r = 0.5 + Math.sin(phi * 2) * 0.1 * complexity
      }
      
      // Add controlled deformation
      r += Math.sin(theta * 2) * 0.1 * deformationStrength
      
      // Scale adjustment
      r *= scale
      
      // Convert to cartesian coordinates
      target.x = r * Math.sin(phi) * Math.cos(theta)
      target.y = r * Math.cos(phi)
      target.z = r * Math.sin(phi) * Math.sin(theta)
      
      // Check for NaN values
      if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z)) {
        console.warn('NaN detected in shape calculation')
        target.set(0, 0, 0)
      }
    } 
    // Generar vértices
    const vertex = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const u = i / (count - 1)
        const v = j / (count - 1)
        
        shapeFunction(u, v, vertex)
        
        positions[idx] = vertex.x
        positions[idx + 1] = vertex.y
        positions[idx + 2] = vertex.z
        
        // Calcular normales
        vertex.normalize()
        normals[idx] = vertex.x
        normals[idx + 1] = vertex.y
        normals[idx + 2] = vertex.z
        
        uvs[uvIdx] = u
        uvs[uvIdx + 1] = v
        
        idx += 3
        uvIdx += 2
      }
    }
    
    // Crear índices para las caras
    const indices: number[] = []
    for (let i = 0; i < count - 1; i++) {
      for (let j = 0; j < count - 1; j++) {
        const a = i * count + j
        const b = i * count + j + 1
        const c = (i + 1) * count + j
        const d = (i + 1) * count + j + 1
        
        indices.push(a, b, d)
        indices.push(a, d, c)
      }
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    
    // Forzar el cálculo de la boundingSphere
    geo.computeBoundingSphere()
    
    return geo
  }, [visualProps])
  
  // Material con gradientes
  const material = useMemo(() => {
    const defaultColor = new THREE.Color(0x666666)
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: visualProps.baseColor || defaultColor },
        accentColor: { value: visualProps.accentColor || defaultColor },
        hovered: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          
          vec3 pos = position;
          
          // Animación sutil
          pos += normal * sin(time + uv.x * 10.0) * 0.02;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        uniform vec3 baseColor;
        uniform vec3 accentColor;
        uniform float hovered;
        
        void main() {
          // Gradiente suave
          vec3 color = mix(baseColor, accentColor, vUv.y);
          
          // Efecto fresnel
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 1.5);
          color += fresnel * 0.3;
          
          // Hover
          color += hovered * 0.2;
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true
    })
  }, [visualProps])
  
  // Animación
  useFrame((state) => {
    if (meshRef.current && material) {
      meshRef.current.rotation.y += 0.002
      material.uniforms.time.value = state.clock.elapsedTime
      material.uniforms.hovered.value = THREE.MathUtils.lerp(
        material.uniforms.hovered.value,
        hovered ? 1 : 0,
        0.1
      )
    }
  })
  
  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  )
}