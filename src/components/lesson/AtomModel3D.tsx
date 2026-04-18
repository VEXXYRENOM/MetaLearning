import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * نموذج بور للذرة — نسخة هولوغرام مستقبلية فاخرة
 * نواة بلازما متوهجة + مدارات نيون + إلكترونات كريستالية
 */
export function AtomModel3D() {
  const electronGrp1 = useRef<THREE.Group>(null);
  const electronGrp2 = useRef<THREE.Group>(null);
  const electronGrp3 = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.5;
      coreRef.current.scale.setScalar(1 + Math.sin(t * 5) * 0.05);
    }
    if (electronGrp1.current) electronGrp1.current.rotation.z = t * 2.5;
    if (electronGrp2.current) electronGrp2.current.rotation.x = t * 2.5;
    if (electronGrp3.current) electronGrp3.current.rotation.y = t * 2.5;
  });

  return (
    <>
      <Environment preset="studio" />

      <group scale={1.2}>
        {/* ═══ النواة (بلازما متوهجة كريستالية) ═══ */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshPhysicalMaterial
            color="#00f2fe"
            emissive="#4facfe"
            emissiveIntensity={2.5}
            roughness={0.05}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={3}
            toneMapped={false}
          />
        </mesh>
        {/* توهج خارجي للنواة */}
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshPhysicalMaterial
            color="#00f2fe"
            emissive="#4facfe"
            emissiveIntensity={1}
            transparent
            opacity={0.15}
            roughness={0}
            toneMapped={false}
          />
        </mesh>

        {/* ═══ مدار 1 (حلقة نيون) ═══ */}
        <group ref={electronGrp1}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.5, 0.025, 16, 100]} />
            <meshPhysicalMaterial
              color="#a78bfa"
              emissive="#7c3aed"
              emissiveIntensity={1}
              transparent
              opacity={0.5}
              roughness={0.05}
              clearcoat={1}
              envMapIntensity={2}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[1.5, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={2}
              roughness={0.02}
              clearcoat={1}
              envMapIntensity={3}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* ═══ مدار 2 ═══ */}
        <group ref={electronGrp2}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <torusGeometry args={[1.5, 0.025, 16, 100]} />
            <meshPhysicalMaterial
              color="#22d3ee"
              emissive="#06b6d4"
              emissiveIntensity={1}
              transparent
              opacity={0.5}
              roughness={0.05}
              clearcoat={1}
              envMapIntensity={2}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={2}
              roughness={0.02}
              clearcoat={1}
              envMapIntensity={3}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* ═══ مدار 3 ═══ */}
        <group ref={electronGrp3} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <mesh>
            <torusGeometry args={[1.5, 0.025, 16, 100]} />
            <meshPhysicalMaterial
              color="#f472b6"
              emissive="#ec4899"
              emissiveIntensity={1}
              transparent
              opacity={0.5}
              roughness={0.05}
              clearcoat={1}
              envMapIntensity={2}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[1.5, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshPhysicalMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={2}
              roughness={0.02}
              clearcoat={1}
              envMapIntensity={3}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}
