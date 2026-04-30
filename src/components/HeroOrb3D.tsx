import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function Scene() {
  const mainRef  = useRef<THREE.Mesh>(null);
  const wireRef  = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mainRef.current)  { mainRef.current.rotation.y  = t * 0.15;  mainRef.current.rotation.x  = Math.sin(t * 0.1) * 0.12; }
    if (wireRef.current)  { wireRef.current.rotation.y  = -t * 0.25; wireRef.current.rotation.z  = t * 0.18; }
    if (ring1Ref.current) { ring1Ref.current.rotation.z = t * 0.22; }
    if (ring2Ref.current) { ring2Ref.current.rotation.z = -t * 0.16; ring2Ref.current.rotation.x = t * 0.1; }
  });

  return (
    <>
      <Stars radius={100} depth={60} count={700} factor={2.5} saturation={0} fade speed={0.4} />

      {/* Main distorted orb — centered at origin */}
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={1.0}>
        <mesh ref={mainRef} position={[0, 0, 0]}>
          <Sphere args={[2.6, 128, 128]}>
            <MeshDistortMaterial
              color="#2563EB"
              distort={0.42}
              speed={1.6}
              roughness={0.05}
              metalness={0.5}
              transparent
              opacity={0.38}
            />
          </Sphere>
        </mesh>
      </Float>

      {/* Inner wireframe sphere */}
      <Float speed={2.2} rotationIntensity={0.4} floatIntensity={0.7}>
        <mesh ref={wireRef} position={[0, 0, 0]}>
          <Sphere args={[1.8, 36, 36]}>
            <meshStandardMaterial color="#0EA5E9" wireframe transparent opacity={0.18} />
          </Sphere>
        </mesh>
      </Float>

      {/* Orbiting ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.2, 0.3, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[3.2, 0.022, 16, 120]} />
        <meshStandardMaterial color="#7C3AED" transparent opacity={0.35} />
      </mesh>

      {/* Orbiting ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 6, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[3.7, 0.015, 16, 120]} />
        <meshStandardMaterial color="#0EA5E9" transparent opacity={0.25} />
      </mesh>

      {/* Satellite 1 */}
      <Float speed={3.5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[3.8, 1.8, -1]}>
          <Sphere args={[0.28, 32, 32]}>
            <MeshDistortMaterial color="#7C3AED" distort={0.4} speed={2} transparent opacity={0.65} />
          </Sphere>
        </mesh>
      </Float>

      {/* Satellite 2 */}
      <Float speed={2.8} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh position={[-3.5, -1.5, -2]}>
          <Sphere args={[0.2, 32, 32]}>
            <MeshDistortMaterial color="#0EA5E9" distort={0.3} speed={1.5} transparent opacity={0.55} />
          </Sphere>
        </mesh>
      </Float>

      {/* Lights */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[6, 6, 6]}  intensity={1.0} color="#DBEAFE" />
      <directionalLight position={[-6,-4,-4]} intensity={0.5} color="#7C3AED" />
      <pointLight position={[0, 0, 5]} intensity={0.8} color="#2563EB" />
    </>
  );
}

export default function HeroOrb3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 52 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  );
}
