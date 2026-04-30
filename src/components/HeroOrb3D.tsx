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
    if (mainRef.current)  { mainRef.current.rotation.y  = t * 0.12; mainRef.current.rotation.x = Math.sin(t * 0.08) * 0.1; }
    if (wireRef.current)  { wireRef.current.rotation.y  = -t * 0.2; wireRef.current.rotation.z = t * 0.15; }
    if (ring1Ref.current) { ring1Ref.current.rotation.z = t * 0.18; }
    if (ring2Ref.current) { ring2Ref.current.rotation.z = -t * 0.13; ring2Ref.current.rotation.x = t * 0.08; }
  });

  return (
    <>
      <Stars radius={120} depth={60} count={500} factor={2} saturation={0} fade speed={0.3} />

      {/* Main orb — very transparent so text is readable */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.8}>
        <mesh ref={mainRef}>
          <Sphere args={[2.8, 128, 128]}>
            <MeshDistortMaterial
              color="#4A90D9"
              distort={0.35}
              speed={1.4}
              roughness={0.1}
              metalness={0.3}
              transparent
              opacity={0.22}
            />
          </Sphere>
        </mesh>
      </Float>

      {/* Wireframe */}
      <Float speed={2} rotationIntensity={0.35} floatIntensity={0.6}>
        <mesh ref={wireRef}>
          <Sphere args={[2.0, 32, 32]}>
            <meshStandardMaterial color="#2563EB" wireframe transparent opacity={0.12} />
          </Sphere>
        </mesh>
      </Float>

      {/* Ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2.3, 0.2, 0]}>
        <torusGeometry args={[3.5, 0.018, 16, 120]} />
        <meshStandardMaterial color="#7C3AED" transparent opacity={0.25} />
      </mesh>

      {/* Ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 5, 0]}>
        <torusGeometry args={[4.1, 0.012, 16, 120]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.18} />
      </mesh>

      {/* Satellite */}
      <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
        <mesh position={[4, 1.5, -1.5]}>
          <Sphere args={[0.22, 32, 32]}>
            <MeshDistortMaterial color="#7C3AED" distort={0.4} speed={2} transparent opacity={0.55} />
          </Sphere>
        </mesh>
      </Float>

      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 8, 8]}  intensity={0.8} color="#BFDBFE" />
      <directionalLight position={[-6,-4,-4]} intensity={0.3} color="#C4B5FD" />
      <pointLight position={[0, 0, 6]} intensity={0.6} color="#60A5FA" />
    </>
  );
}

export default function HeroOrb3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  );
}
