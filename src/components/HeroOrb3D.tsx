import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function AnimatedBrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.18;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.12) * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -clock.getElapsedTime() * 0.3;
      innerRef.current.rotation.z = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <>
      {/* Stars background */}
      <Stars radius={80} depth={50} count={800} factor={3} saturation={0} fade speed={0.5} />

      {/* Outer glowing orb */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
        <mesh ref={meshRef}>
          <Sphere args={[2.2, 128, 128]}>
            <MeshDistortMaterial
              color="#2563EB"
              attach="material"
              distort={0.42}
              speed={1.8}
              roughness={0.1}
              metalness={0.6}
              transparent
              opacity={0.85}
              wireframe={false}
            />
          </Sphere>
        </mesh>
      </Float>

      {/* Inner wireframe sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh ref={innerRef}>
          <Sphere args={[1.5, 32, 32]}>
            <meshStandardMaterial
              color="#0EA5E9"
              wireframe
              transparent
              opacity={0.25}
            />
          </Sphere>
        </mesh>
      </Float>

      {/* Orbiting ring 1 */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.8, 0.025, 16, 100]} />
        <meshStandardMaterial color="#7C3AED" transparent opacity={0.5} />
      </mesh>

      {/* Orbiting ring 2 */}
      <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[3.2, 0.018, 16, 100]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.35} />
      </mesh>

      {/* Ambient + directional lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#DBEAFE" />
      <directionalLight position={[-5, -3, -3]} intensity={0.8} color="#7C3AED" />
      <pointLight position={[0, 0, 4]} intensity={1.2} color="#2563EB" />
    </>
  );
}

export default function HeroOrb3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <AnimatedBrain />
    </Canvas>
  );
}
