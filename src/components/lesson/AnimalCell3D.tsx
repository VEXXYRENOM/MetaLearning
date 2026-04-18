import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * الخلية الحيوانية ثلاثية الأبعاد — نسخة مختبر طبي فاخر
 * غشاء زجاجي شفاف يعكس إضاءة HDRI + نواة بنفسجية متوهجة
 * ميتوكوندريا لامعة + شبكة إندوبلازمية نيون + جهاز جولجي كريستالي
 */
export function AnimalCell3D() {
  const membraneRef = useRef<THREE.Mesh>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const nucleolusRef = useRef<THREE.Mesh>(null);
  const mito1Ref = useRef<THREE.Mesh>(null);
  const mito2Ref = useRef<THREE.Mesh>(null);
  const mito3Ref = useRef<THREE.Mesh>(null);
  const erRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (membraneRef.current) {
      const pulse = 1 + Math.sin(t * 0.8) * 0.03;
      membraneRef.current.scale.set(pulse, pulse * 0.85, pulse);
      membraneRef.current.rotation.y = t * 0.1;
    }
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = t * 0.3;
      nucleusRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }
    if (nucleolusRef.current) {
      const np = 1 + Math.sin(t * 2) * 0.08;
      nucleolusRef.current.scale.setScalar(np);
    }
    if (mito1Ref.current) {
      mito1Ref.current.position.x = 0.9 + Math.sin(t * 0.7) * 0.15;
      mito1Ref.current.position.z = Math.cos(t * 0.7) * 0.15;
      mito1Ref.current.rotation.z = t * 0.5;
    }
    if (mito2Ref.current) {
      mito2Ref.current.position.x = -0.7 + Math.cos(t * 0.6) * 0.12;
      mito2Ref.current.position.z = 0.5 + Math.sin(t * 0.6) * 0.12;
      mito2Ref.current.rotation.z = -t * 0.4;
    }
    if (mito3Ref.current) {
      mito3Ref.current.position.x = 0.2 + Math.sin(t * 0.5 + 1) * 0.1;
      mito3Ref.current.position.z = -0.8 + Math.cos(t * 0.5 + 1) * 0.1;
      mito3Ref.current.rotation.z = t * 0.3;
    }
    if (erRef.current) {
      erRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <>
      <Environment preset="studio" />

      <group scale={1.3}>
        {/* ═══ الغشاء الخلوي (زجاج أكريليك طبي شفاف) ═══ */}
        <mesh ref={membraneRef}>
          <sphereGeometry args={[1.6, 64, 64]} />
          <meshPhysicalMaterial
            color="#88d4ab"
            transmission={0.8}
            opacity={0.25}
            transparent
            roughness={0.05}
            thickness={0.8}
            ior={1.4}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.5}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ═══ النواة (كريستال بنفسجي متوهج) ═══ */}
        <mesh ref={nucleusRef} position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshPhysicalMaterial
            color="#5b21b6"
            emissive="#7c3aed"
            emissiveIntensity={0.8}
            roughness={0.08}
            metalness={0.15}
            transmission={0.4}
            thickness={3}
            clearcoat={1}
            clearcoatRoughness={0.05}
            ior={1.5}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* ═══ النوية (Nucleolus) — لؤلؤة مشعة ═══ */}
        <mesh ref={nucleolusRef} position={[0.1, 0.05, 0.15]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshPhysicalMaterial
            color="#c026d3"
            emissive="#a21caf"
            emissiveIntensity={1.2}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.03}
            envMapIntensity={3}
          />
        </mesh>

        {/* الغلاف النووي */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.015, 16, 64]} />
          <meshPhysicalMaterial color="#a78bfa" transparent opacity={0.6} roughness={0.1} clearcoat={0.8} envMapIntensity={2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]}>
          <torusGeometry args={[0.55, 0.012, 16, 64]} />
          <meshPhysicalMaterial color="#a78bfa" transparent opacity={0.4} roughness={0.1} clearcoat={0.8} envMapIntensity={2} />
        </mesh>

        {/* ═══ الميتوكوندريا (كبسولات نحاسية لامعة) ═══ */}
        <mesh ref={mito1Ref} position={[0.9, 0, 0]} scale={[1, 0.5, 0.5]}>
          <capsuleGeometry args={[0.12, 0.3, 16, 16]} />
          <meshPhysicalMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={0.5}
            roughness={0.12}
            metalness={0.3}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
          />
        </mesh>
        <mesh ref={mito2Ref} position={[-0.7, 0.1, 0.5]} scale={[1, 0.5, 0.5]} rotation={[0, 0, 0.8]}>
          <capsuleGeometry args={[0.1, 0.25, 16, 16]} />
          <meshPhysicalMaterial
            color="#fb923c"
            emissive="#ea580c"
            emissiveIntensity={0.4}
            roughness={0.12}
            metalness={0.3}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
          />
        </mesh>
        <mesh ref={mito3Ref} position={[0.2, -0.2, -0.8]} scale={[1, 0.5, 0.5]} rotation={[0, 0, -0.5]}>
          <capsuleGeometry args={[0.09, 0.22, 16, 16]} />
          <meshPhysicalMaterial
            color="#fdba74"
            emissive="#ea580c"
            emissiveIntensity={0.4}
            roughness={0.12}
            metalness={0.3}
            clearcoat={0.8}
            envMapIntensity={2}
          />
        </mesh>

        {/* ═══ الشبكة الإندوبلازمية (حلقات نيون شفافة) ═══ */}
        <group ref={erRef}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 5) * Math.PI * 2) * 0.8,
                (i - 2) * 0.15,
                Math.sin((i / 5) * Math.PI * 2) * 0.8,
              ]}
              rotation={[(i * Math.PI) / 5, (i * Math.PI) / 3, 0]}
            >
              <torusGeometry args={[0.2, 0.025, 12, 32]} />
              <meshPhysicalMaterial
                color="#22d3ee"
                emissive="#06b6d4"
                emissiveIntensity={0.8}
                transparent
                opacity={0.6}
                roughness={0.05}
                clearcoat={1}
                envMapIntensity={2}
              />
            </mesh>
          ))}
        </group>

        {/* ═══ الريبوسومات (حبيبات ذهبية لامعة) ═══ */}
        {Array.from({ length: 20 }).map((_, i) => {
          const theta = (i / 20) * Math.PI * 2;
          const phi = Math.acos(2 * ((i + 0.5) / 20) - 1);
          const r = 0.9 + Math.random() * 0.4;
          return (
            <mesh
              key={`ribo-${i}`}
              position={[
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.cos(phi) * 0.7,
                r * Math.sin(phi) * Math.sin(theta),
              ]}
            >
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshPhysicalMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={1.2}
                roughness={0.08}
                metalness={0.6}
                clearcoat={1}
                envMapIntensity={3}
              />
            </mesh>
          );
        })}

        {/* ═══ جهاز جولجي (صفائح كريستالية زرقاء) ═══ */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={`golgi-${i}`}
            position={[-0.5, 0.5 + i * 0.08, -0.4]}
            rotation={[0.3, 0.5, 0]}
            scale={[1, 0.15, 0.6]}
          >
            <capsuleGeometry args={[0.08 + i * 0.02, 0.15, 8, 16]} />
            <meshPhysicalMaterial
              color="#06b6d4"
              transparent
              opacity={0.7 - i * 0.1}
              roughness={0.08}
              clearcoat={0.9}
              clearcoatRoughness={0.05}
              envMapIntensity={2}
            />
          </mesh>
        ))}

        {/* إضاءة داخلية */}
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#7c3aed" distance={3} />
      </group>

      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.5}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}
