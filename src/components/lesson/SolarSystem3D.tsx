import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function SolarSystem3D() {
  const earthOrbit = useRef<THREE.Group>(null);
  const marsOrbit = useRef<THREE.Group>(null);
  const jupiterOrbit = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (earthOrbit.current) earthOrbit.current.rotation.y = t * 0.5;
    if (marsOrbit.current) marsOrbit.current.rotation.y = t * 0.3;
    if (jupiterOrbit.current) jupiterOrbit.current.rotation.y = t * 0.1;
  });

  return (
    <group scale={1.2}>
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fb923c" emissiveIntensity={2} />
      </mesh>

      {/* Earth Orbit */}
      <group ref={earthOrbit}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        {/* Moon */}
        <mesh position={[1.35, 0, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Mars Orbit */}
      <group ref={marsOrbit}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
        <mesh position={[1.8, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Jupiter Orbit */}
      <group ref={jupiterOrbit}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.01, 16, 100]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
        <mesh position={[2.5, 0, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#d97706" />
        </mesh>
      </group>
    </group>
  );
}
