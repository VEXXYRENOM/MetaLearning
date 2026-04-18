import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";

/**
 * الجهاز التنفسي — نسخة سيليكون طبي فاخر
 * رئتان من السيليكون الوردي اللامع + قصبة بيضاء كريستالية
 * مع حركة تنفس واقعية + إضاءة HDRI
 */
export function LungsModel3D() {
  const groupRef = useRef<THREE.Group>(null);
  const leftLungRef = useRef<THREE.Mesh>(null);
  const rightLungRef = useRef<THREE.Mesh>(null);
  const diaphragmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const breathCycle = Math.sin(t * 0.8);
    const inflate = 1 + breathCycle * 0.08;

    if (leftLungRef.current) {
      leftLungRef.current.scale.set(inflate, inflate * 1.02, inflate);
    }
    if (rightLungRef.current) {
      rightLungRef.current.scale.set(inflate, inflate * 1.02, inflate);
    }
    if (diaphragmRef.current) {
      diaphragmRef.current.position.y = -1.6 - breathCycle * 0.15;
      diaphragmRef.current.scale.y = 1 + breathCycle * 0.2;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }
  });

  const LungShape = ({
    side,
    lungRef,
  }: {
    side: "left" | "right";
    lungRef: React.RefObject<THREE.Mesh>;
  }) => {
    const xSign = side === "left" ? -1 : 1;
    return (
      <group position={[xSign * 0.55, -0.3, 0]}>
        {/* الرئة الرئيسية (سيليكون طبي) */}
        <mesh ref={lungRef} scale={[0.8, 1, 0.6]}>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshPhysicalMaterial
            color="#fda4af"
            emissive="#f43f5e"
            emissiveIntensity={0.3}
            roughness={0.12}
            metalness={0.05}
            transmission={0.35}
            thickness={2.5}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
            ior={1.35}
            envMapIntensity={2}
          />
        </mesh>
        {/* الفصوص */}
        <mesh position={[xSign * 0.1, 0.3, 0]} scale={[0.6, 0.5, 0.45]}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshPhysicalMaterial
            color="#fb7185"
            transmission={0.5}
            transparent
            opacity={0.5}
            roughness={0.1}
            clearcoat={0.6}
            envMapIntensity={1.8}
          />
        </mesh>
        {/* الشعب الهوائية */}
        {[0, 1, 2].map((i) => {
          const angle = ((i - 1) * Math.PI) / 6;
          return (
            <mesh
              key={i}
              position={[
                xSign * (0.0 + Math.sin(angle) * 0.2),
                0.2 - i * 0.25,
                Math.cos(angle) * 0.15,
              ]}
              rotation={[0, 0, xSign * (0.2 + i * 0.15)]}
            >
              <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
              <meshPhysicalMaterial
                color="#fecdd3"
                emissive="#fda4af"
                emissiveIntensity={0.4}
                roughness={0.15}
                clearcoat={0.6}
                envMapIntensity={1.8}
              />
            </mesh>
          );
        })}
        {/* الحويصلات الهوائية (كرات لؤلؤية) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const theta = (i / 8) * Math.PI * 2;
          const r = 0.45 + Math.random() * 0.2;
          return (
            <mesh
              key={`alveoli-${i}`}
              position={[
                xSign * r * Math.cos(theta) * 0.6,
                -0.4 + Math.sin(theta) * 0.3,
                r * Math.sin(theta) * 0.4,
              ]}
            >
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshPhysicalMaterial
                color="#fecdd3"
                emissive="#f43f5e"
                emissiveIntensity={0.6}
                transparent
                opacity={0.8}
                roughness={0.08}
                clearcoat={0.9}
                envMapIntensity={2}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  return (
    <>
      <Environment preset="studio" />

      <Center>
        <group ref={groupRef} scale={1.2}>
          {/* القصبة الهوائية (كريستال أبيض) */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.8, 16, 8, true]} />
            <meshPhysicalMaterial
              color="#fecdd3"
              roughness={0.15}
              clearcoat={0.7}
              envMapIntensity={1.8}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* حلقات الغضروف (فضية لامعة) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={`ring-${i}`} position={[0, 0.5 + i * 0.15, 0]}>
              <torusGeometry args={[0.105, 0.018, 12, 24]} />
              <meshPhysicalMaterial
                color="#e2e8f0"
                roughness={0.1}
                metalness={0.4}
                clearcoat={0.9}
                envMapIntensity={2.5}
              />
            </mesh>
          ))}

          {/* الانقسام */}
          <mesh position={[-0.15, 0.35, 0]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.06, 0.08, 0.4, 12]} />
            <meshPhysicalMaterial color="#fecdd3" roughness={0.15} clearcoat={0.7} envMapIntensity={1.8} />
          </mesh>
          <mesh position={[0.15, 0.35, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.06, 0.08, 0.4, 12]} />
            <meshPhysicalMaterial color="#fecdd3" roughness={0.15} clearcoat={0.7} envMapIntensity={1.8} />
          </mesh>

          {/* الرئتان */}
          <LungShape side="left" lungRef={leftLungRef as React.RefObject<THREE.Mesh>} />
          <LungShape side="right" lungRef={rightLungRef as React.RefObject<THREE.Mesh>} />

          {/* الحجاب الحاجز */}
          <mesh ref={diaphragmRef} position={[0, -1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.2, 32]} />
            <meshPhysicalMaterial
              color="#f97316"
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              roughness={0.2}
              clearcoat={0.5}
              envMapIntensity={1.5}
            />
          </mesh>
        </group>
      </Center>

      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.5}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}
