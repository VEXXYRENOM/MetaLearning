import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * مقطع تشريحي لجهاز النطق (الحنجرة والبلعوم)
 * يعرض: الحنجرة، الأحبال الصوتية، تجويف الفم، اللسان، الحلق
 * مع حركة اهتزاز للأحبال الصوتية
 */
export function VocalAnatomy3D() {
  const groupRef = useRef<THREE.Group>(null);
  const vocalCord1 = useRef<THREE.Mesh>(null);
  const vocalCord2 = useRef<THREE.Mesh>(null);
  const tongueRef = useRef<THREE.Mesh>(null);
  const uvulaRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }

    // اهتزاز الأحبال الصوتية
    if (vocalCord1.current && vocalCord2.current) {
      const vibration = Math.sin(t * 25) * 0.02;
      vocalCord1.current.position.x = -0.04 + vibration;
      vocalCord2.current.position.x = 0.04 - vibration;
      // تغيير اللون أثناء الاهتزاز
      const intensity = 0.3 + Math.abs(Math.sin(t * 3)) * 0.7;
      (vocalCord1.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      (vocalCord2.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
    }

    // حركة اللسان
    if (tongueRef.current) {
      tongueRef.current.rotation.x = Math.sin(t * 0.5) * 0.08;
      tongueRef.current.position.y = 0.15 + Math.sin(t * 0.8) * 0.03;
    }

    // حركة اللهاة
    if (uvulaRef.current) {
      uvulaRef.current.rotation.z = Math.sin(t * 1.2) * 0.15;
    }
  });

  const skinColor = "#f5c6a0";
  const mucosaColor = "#e88b8b";
  const muscleColor = "#c0504d";

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      {/* === الرأس (مقطع جانبي) === */}
      {/* الجمجمة الخارجية (نصف) */}
      <mesh position={[0, 0.6, 0]} scale={[0.6, 0.75, 0.55]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI]} />
        <meshPhysicalMaterial
          color={skinColor}
          roughness={0.7}
          metalness={0.02}
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* === تجويف الفم === */}
      <mesh position={[0, 0.2, 0.25]} scale={[0.35, 0.15, 0.3]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={mucosaColor}
          emissive="#c74848"
          emissiveIntensity={0.2}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* الحنك (سقف الفم) */}
      <mesh position={[0, 0.38, 0.2]} scale={[0.3, 0.08, 0.25]}>
        <sphereGeometry args={[1, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d4908a" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* === اللسان === */}
      <mesh ref={tongueRef} position={[0, 0.15, 0.3]} scale={[0.2, 0.08, 0.25]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={muscleColor}
          emissive="#a03535"
          emissiveIntensity={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* === اللهاة (Uvula) === */}
      <mesh ref={uvulaRef} position={[0, 0.28, -0.05]}>
        <capsuleGeometry args={[0.025, 0.05, 8, 8]} />
        <meshStandardMaterial
          color="#e06060"
          emissive="#c04040"
          emissiveIntensity={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* === البلعوم (Pharynx) === */}
      <mesh position={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.12, 0.1, 0.5, 16, 1, true]} />
        <meshStandardMaterial
          color={mucosaColor}
          roughness={0.6}
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* === الحنجرة (Larynx) === */}
      <group position={[0, -0.4, 0.05]}>
        {/* غضروف الحنجرة */}
        <mesh position={[0, 0, 0.05]} scale={[0.15, 0.12, 0.1]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#e8d5b0"
            roughness={0.7}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* === الأحبال الصوتية === */}
        <mesh ref={vocalCord1} position={[-0.04, 0, 0]}>
          <capsuleGeometry args={[0.015, 0.1, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        <mesh ref={vocalCord2} position={[0.04, 0, 0]}>
          <capsuleGeometry args={[0.015, 0.1, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* تمثيل الصوت (موجات) */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`wave-${i}`} position={[0, 0.15 + i * 0.08, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.03 + i * 0.015, 0.003, 8, 24]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4 - i * 0.07} />
          </mesh>
        ))}
      </group>

      {/* === القصبة الهوائية (Trachea) === */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.4, 16, 1, true]} />
        <meshStandardMaterial color="#f0c8a8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* حلقات غضروفية */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`trachea-ring-${i}`} position={[0, -0.55 - i * 0.08, 0]}>
          <torusGeometry args={[0.085, 0.01, 8, 24]} />
          <meshStandardMaterial color="#e0d0b0" roughness={0.7} />
        </mesh>
      ))}

      {/* === المريء (Esophagus) === */}
      <mesh position={[0, -0.7, -0.1]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 12, 1, true]} />
        <meshStandardMaterial color="#d4908a" roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* === الأسنان === */}
      {/* الفك العلوي */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI / 9) * (i - 3.5);
        const r = 0.25;
        return (
          <mesh key={`tooth-up-${i}`}
            position={[Math.sin(angle) * r, 0.32, 0.2 + Math.cos(angle) * r * 0.3]}
          >
            <boxGeometry args={[0.03, 0.04, 0.025]} />
            <meshStandardMaterial color="#f5f5f0" roughness={0.3} metalness={0.05} />
          </mesh>
        );
      })}
      {/* الفك السفلي */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI / 9) * (i - 3.5);
        const r = 0.24;
        return (
          <mesh key={`tooth-dn-${i}`}
            position={[Math.sin(angle) * r, 0.06, 0.2 + Math.cos(angle) * r * 0.3]}
          >
            <boxGeometry args={[0.028, 0.035, 0.022]} />
            <meshStandardMaterial color="#f0f0e8" roughness={0.3} metalness={0.05} />
          </mesh>
        );
      })}

      {/* === الأنف (تجويف) === */}
      <mesh position={[0, 0.55, 0.35]} scale={[0.08, 0.12, 0.1]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={mucosaColor} roughness={0.6} />
      </mesh>

      {/* إضاءة داخلية */}
      <pointLight position={[0, 0.2, 0.5]} intensity={0.8} color="#fff5e6" distance={3} />
      <pointLight position={[0, -0.3, 0.3]} intensity={0.4} color="#fbbf24" distance={2} />
    </group>
  );
}
