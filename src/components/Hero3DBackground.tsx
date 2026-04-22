import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const AmbientParticles = () => {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 1000;
  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i * 3] = (Math.random() - 0.5) * 40;
      a[i * 3 + 1] = (Math.random() - 0.5) * 30;
      a[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return a;
  }, []);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.02; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#06b6d4" transparent opacity={0.6} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

const FloatingShapes = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[-2, 1, 0]} rotation={[0.5, 0.5, 0]}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshPhysicalMaterial color="#a855f7" metalness={0.8} roughness={0.2} wireframe />
      </mesh>
      <mesh position={[2, -1, -2]} rotation={[0, 0.5, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial color="#06b6d4" metalness={0.5} roughness={0.1} clearcoat={1} transmission={0.9} />
      </mesh>
    </group>
  );
};

export default function Hero3DBackground() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <AmbientParticles />
      <FloatingShapes />
    </Canvas>
  );
}
