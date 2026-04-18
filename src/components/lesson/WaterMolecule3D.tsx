import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * جزيء الماء H₂O ثلاثي الأبعاد
 * يعرض: ذرة أكسجين مركزية + ذرتي هيدروجين + الروابط التساهمية
 * الزاوية بين الروابط 104.5 درجة (الزاوية الحقيقية لجزيء الماء)
 */
export function WaterMolecule3D() {
  const groupRef = useRef<THREE.Group>(null);
  const o1Ref = useRef<THREE.Mesh>(null);
  const h1Ref = useRef<THREE.Mesh>(null);
  const h2Ref = useRef<THREE.Mesh>(null);

  const bondAngle = (104.5 * Math.PI) / 180; // الزاوية الحقيقية لـ H₂O
  const bondLength = 1.2;

  // مواقع ذرات الهيدروجين بالنسبة للأكسجين
  const h1Pos: [number, number, number] = [
    bondLength * Math.sin(bondAngle / 2),
    -bondLength * Math.cos(bondAngle / 2),
    0,
  ];
  const h2Pos: [number, number, number] = [
    -bondLength * Math.sin(bondAngle / 2),
    -bondLength * Math.cos(bondAngle / 2),
    0,
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }
    // اهتزاز حراري خفيف
    if (o1Ref.current) {
      const p = 1 + Math.sin(t * 3) * 0.04;
      o1Ref.current.scale.setScalar(p);
    }
    if (h1Ref.current) {
      h1Ref.current.position.x = h1Pos[0] + Math.sin(t * 5) * 0.04;
      h1Ref.current.position.y = h1Pos[1] + Math.cos(t * 5) * 0.03;
    }
    if (h2Ref.current) {
      h2Ref.current.position.x = h2Pos[0] + Math.cos(t * 5 + 1) * 0.04;
      h2Ref.current.position.y = h2Pos[1] + Math.sin(t * 5 + 1) * 0.03;
    }
  });

  // حساب موقع ودوران الرابطة التساهمية بين نقطتين
  const Bond = ({ from, to }: { from: [number, number, number]; to: [number, number, number] }) => {
    const midpoint: [number, number, number] = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2,
      (from[2] + to[2]) / 2,
    ];
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const dz = to[2] - from[2];
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const theta = Math.atan2(dx, dy);

    return (
      <mesh position={midpoint} rotation={[0, 0, -theta]}>
        <cylinderGeometry args={[0.06, 0.06, length, 16]} />
        <meshStandardMaterial
          color="#94a3b8"
          emissive="#64748b"
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
    );
  };

  return (
    <group ref={groupRef} scale={1.1}>
      {/* ذرة الأكسجين (O) - أحمر */}
      <mesh ref={o1Ref} position={[0, 0, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshPhysicalMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* حرف O */}
      {/* تمثيل بصري - حلقة حول الأكسجين */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.01, 16, 64]} />
        <meshBasicMaterial color="#fca5a5" transparent opacity={0.4} />
      </mesh>

      {/* ذرة الهيدروجين 1 (H) - أبيض/أزرق فاتح */}
      <mesh ref={h1Ref} position={h1Pos}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          emissive="#93c5fd"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* ذرة الهيدروجين 2 (H) - أبيض/أزرق فاتح */}
      <mesh ref={h2Ref} position={h2Pos}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          emissive="#93c5fd"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* الروابط التساهمية */}
      <Bond from={[0, 0, 0]} to={h1Pos} />
      <Bond from={[0, 0, 0]} to={h2Pos} />

      {/* أزواج الإلكترونات الحرة (Lone Pairs) - سحب إلكترونية*/}
      <mesh position={[0, 0.5, 0.5]} scale={[0.6, 0.3, 0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0.5, -0.5]} scale={[0.6, 0.3, 0.6]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.25} />
      </mesh>

      {/* خط زاوية الرابطة 104.5° */}
      <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.35, 0.008, 8, 32, bondAngle]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
