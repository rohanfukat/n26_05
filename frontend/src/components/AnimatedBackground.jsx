import React, { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

function Globe() {
  const globeRef = useRef()

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.06
      globeRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      const radius = 7 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  return (
    <group ref={globeRef}>
      {/* Wireframe Globe — white */}
      <mesh>
        <sphereGeometry args={[3.6, 96, 96]} />
        <meshStandardMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.55}
          emissive="#ffffff"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Outer soft glow */}
      <mesh scale={1.06}>
        <sphereGeometry args={[3.6, 64, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
        />
      </mesh>

      {/* Particle field — white */}
      <Points positions={particles} stride={3}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.035}
          sizeAttenuation
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  )
}

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Deep black background */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at center, #111118 0%, #070709 55%, #000000 100%)' }}
      />

      {/* Very subtle white glow at center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_40%)]" />

      {/* 3D Globe */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
          <pointLight position={[-5, -5, -5]} intensity={1} color="#ffffff" />
          <Globe />
        </Suspense>
      </Canvas>
    </div>
  )
}