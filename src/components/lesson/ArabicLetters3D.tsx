import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";

/**
 * حروف عربية ثلاثية الأبعاد عائمة في الفضاء
 * حروف متوهجة تدور وتطفو بألوان متنوعة
 */
export function ArabicLetters3D() {
  const groupRef = useRef<THREE.Group>(null);
  const letterRefs = useRef<THREE.Group[]>([]);

  const letters = [
    { char: "أ", color: "#ef4444", emissive: "#dc2626", x: -1.2, y: 0.8, z: 0 },
    { char: "ب", color: "#3b82f6", emissive: "#2563eb", x: -0.4, y: -0.2, z: 0.5 },
    { char: "ت", color: "#22c55e", emissive: "#16a34a", x: 0.6, y: 0.5, z: -0.3 },
    { char: "ث", color: "#f59e0b", emissive: "#d97706", x: 1.2, y: -0.4, z: 0.2 },
    { char: "ج", color: "#a855f7", emissive: "#9333ea", x: -0.8, y: -0.8, z: -0.4 },
    { char: "ح", color: "#ec4899", emissive: "#db2777", x: 0.2, y: 1.0, z: 0.3 },
    { char: "خ", color: "#14b8a6", emissive: "#0d9488", x: 1.0, y: 0.2, z: -0.5 },
    { char: "د", color: "#f97316", emissive: "#ea580c", x: -0.6, y: 0.3, z: 0.6 },
    { char: "ر", color: "#6366f1", emissive: "#4f46e5", x: 0.8, y: -0.7, z: 0.4 },
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }

    letterRefs.current.forEach((ref, i) => {
      if (ref) {
        const phase = i * 0.7;
        // طفو عمودي
        ref.position.y = letters[i].y + Math.sin(t * 0.8 + phase) * 0.15;
        // دوران فردي
        ref.rotation.y = Math.sin(t * 0.5 + phase) * 0.3;
        ref.rotation.x = Math.sin(t * 0.3 + phase) * 0.1;
        // نبض الحجم
        const pulse = 1 + Math.sin(t * 1.5 + phase) * 0.08;
        ref.scale.setScalar(pulse);
      }
    });
  });

  return (
    <group ref={groupRef} scale={0.9}>
      {letters.map((l, i) => (
        <group
          key={i}
          ref={(el) => { if (el) letterRefs.current[i] = el; }}
          position={[l.x, l.y, l.z]}
        >
          {/* الحرف ثلاثي الأبعاد */}
          <Text
            fontSize={0.5}
            font="/fonts/NotoSansArabic-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            {l.char}
            <meshPhysicalMaterial
              color={l.color}
              emissive={l.emissive}
              emissiveIntensity={0.8}
              roughness={0.15}
              metalness={0.3}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </Text>

          {/* هالة متوهجة خلف الحرف */}
          <mesh position={[0, 0, -0.05]}>
            <circleGeometry args={[0.35, 24]} />
            <meshBasicMaterial
              color={l.emissive}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* خطوط ربط بين الحروف */}
      {letters.slice(0, -1).map((l, i) => {
        const next = letters[i + 1];
        const points = [
          new THREE.Vector3(l.x, l.y, l.z),
          new THREE.Vector3(next.x, next.y, next.z),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`line-${i}`} geometry={geo}>
            {/* @ts-ignore */}
            <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
          </line>
        );
      })}

      {/* جسيمات زخرفية */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 3;
        const y = (Math.random() - 0.5) * 2.5;
        const z = (Math.random() - 0.5) * 2;
        return (
          <mesh key={`particle-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={0.4 + Math.random() * 0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}
