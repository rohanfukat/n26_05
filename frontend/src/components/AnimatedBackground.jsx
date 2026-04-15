import React, { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { useTheme } from '../context/ThemeContext'

function Globe() {
  const globeRef = useRef()

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.22
      globeRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.25) * 0.08
    }
  })

  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3)

    for (let i = 0; i < 2000; i++) {
      const radius = 7 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }

    return positions
  }, [])

  return (
    <group ref={globeRef}>
      {/* Main Wireframe Globe */}
      <mesh>
        <sphereGeometry args={[3.6, 96, 96]} />
        <meshStandardMaterial
          color="#60a5fa"
          wireframe
          transparent
          opacity={1}
          emissive="#3b82f6"
          emissiveIntensity={3}
        />
      </mesh>

      {/* Outer Glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[3.6, 64, 64]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Particle Field */}
      <Points positions={particles} stride={3}>
        <PointMaterial
          transparent
          color="#93c5fd"
          size={0.045}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  )
}

export default function AnimatedBackground() {
  const { isDark } = useTheme()

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, #0f172a 0%, #020617 60%, #000000 100%)'
            : 'radial-gradient(circle at center, #dbeafe 0%, #eff6ff 55%, #ffffff 100%)',
        }}
      />

      {/* Soft Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_35%)]" />

      {/* 3D Globe */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={2} />
          <directionalLight position={[5, 5, 5]} intensity={3} />
          <pointLight position={[-5, -5, -5]} intensity={2} color="#60a5fa" />

          <Globe />
        </Suspense>
      </Canvas>
    </div>
  )
}