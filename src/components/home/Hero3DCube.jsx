'use client'

import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

function Cube() {
  const meshRef = useRef()
  const wireRef = useRef()
  const { pointer } = useThree()

  // Violet-to-emerald gradient via vertex colors
  const gradientMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#7c3aed',
        emissive: '#4c1d95',
        emissiveIntensity: 0.15,
        metalness: 0.3,
        roughness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        transparent: true,
        opacity: 0.92,
      }),
    []
  )

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#a78bfa',
        wireframe: true,
        transparent: true,
        opacity: 0.15,
      }),
    []
  )

  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Slow auto-rotation
    meshRef.current.rotation.y += delta * 0.3
    meshRef.current.rotation.x += delta * 0.15

    // Mouse-follow tilt
    const targetRotX = pointer.y * 0.3
    const targetRotZ = -pointer.x * 0.2
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.02
    meshRef.current.rotation.z += (targetRotZ - meshRef.current.rotation.z) * 0.02

    // Sync wireframe overlay
    if (wireRef.current) {
      wireRef.current.rotation.copy(meshRef.current.rotation)
      wireRef.current.position.copy(meshRef.current.position)
    }
  })

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
      <group>
        {/* Main cube */}
        <RoundedBox
          ref={meshRef}
          args={[2.2, 2.2, 2.2]}
          radius={0.15}
          smoothness={4}
          material={gradientMaterial}
          castShadow
        />
        {/* Wireframe overlay — slightly larger */}
        <RoundedBox
          ref={wireRef}
          args={[2.35, 2.35, 2.35]}
          radius={0.15}
          smoothness={4}
          material={wireMaterial}
        />
        {/* Inner glow sphere */}
        <mesh>
          <sphereGeometry args={[1.1, 24, 24]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.06}
          />
        </mesh>
      </group>
    </Float>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        color="#e9d5ff"
        castShadow
      />
      <directionalLight
        position={[-3, -2, 4]}
        intensity={0.4}
        color="#10b981"
      />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#7c3aed" />
    </>
  )
}

export function Hero3DCube() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Lights />
          <Cube />
          <Environment preset="city" environmentIntensity={0.3} />
        </Canvas>
      </Suspense>
    </div>
  )
}
