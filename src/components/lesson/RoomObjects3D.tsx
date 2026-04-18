import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * غرفة ثلاثية الأبعاد لتعليم مفردات الأشياء
 * تعرض: طاولة، كرسي، كتاب، لمبة، ساعة حائط، نافذة
 * أثاث ملون بأسلوب كرتوني تعليمي مبهج
 */
export function RoomObjects3D() {
  const groupRef = useRef<THREE.Group>(null);
  const clockHandRef = useRef<THREE.Mesh>(null);
  const lampLightRef = useRef<THREE.PointLight>(null);
  const bookRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
    }
    // عقارب الساعة
    if (clockHandRef.current) {
      clockHandRef.current.rotation.z = -t * 0.5;
    }
    // وميض اللمبة
    if (lampLightRef.current) {
      lampLightRef.current.intensity = 1.5 + Math.sin(t * 3) * 0.3;
    }
    // الكتاب يتأرجح قليلاً
    if (bookRef.current) {
      bookRef.current.rotation.z = Math.sin(t * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]} scale={0.85}>
      {/* === الغرفة === */}
      {/* الأرضية */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
      </mesh>
      {/* أرضية خشبية (خطوط) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`floor-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-1.5 + i * 0.28, 0.002, 0]}>
          <planeGeometry args={[0.01, 3.5]} />
          <meshBasicMaterial color="#c4a570" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* الجدار الخلفي */}
      <mesh position={[0, 1, -1.75]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* الجدار الأيسر */}
      <mesh position={[-1.75, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#e0d8c8" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* === الطاولة === */}
      <group position={[0, 0, 0]}>
        {/* سطح الطاولة */}
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.7]} />
          <meshStandardMaterial color="#8B4513" roughness={0.6} metalness={0.05} />
        </mesh>
        {/* أرجل الطاولة */}
        {[[-0.55, 0.3, -0.3], [0.55, 0.3, -0.3], [-0.55, 0.3, 0.3], [0.55, 0.3, 0.3]].map((pos, i) => (
          <mesh key={`table-leg-${i}`} position={pos as [number, number, number]}>
            <boxGeometry args={[0.05, 0.6, 0.05]} />
            <meshStandardMaterial color="#6d3a1a" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* === الكرسي === */}
      <group position={[0, 0, 0.7]}>
        {/* مقعد */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.45, 0.04, 0.4]} />
          <meshStandardMaterial color="#1e90ff" roughness={0.5} />
        </mesh>
        {/* ظهر الكرسي */}
        <mesh position={[0, 0.7, -0.18]}>
          <boxGeometry args={[0.45, 0.55, 0.04]} />
          <meshStandardMaterial color="#1e90ff" roughness={0.5} />
        </mesh>
        {/* أرجل */}
        {[[-0.18, 0.2, -0.15], [0.18, 0.2, -0.15], [-0.18, 0.2, 0.15], [0.18, 0.2, 0.15]].map((pos, i) => (
          <mesh key={`chair-leg-${i}`} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#333" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* === الكتاب === */}
      <group ref={bookRef} position={[-0.2, 0.65, -0.1]}>
        {/* غلاف */}
        <mesh>
          <boxGeometry args={[0.25, 0.04, 0.18]} />
          <meshStandardMaterial color="#dc2626" roughness={0.6} />
        </mesh>
        {/* صفحات */}
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[0.23, 0.03, 0.17]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.8} />
        </mesh>
      </group>

      {/* === اللمبة (مصباح مكتب) === */}
      <group position={[0.4, 0.63, -0.15]}>
        {/* القاعدة */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.04, 16]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* الذراع */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
          <meshStandardMaterial color="#555" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* رأس المصباح */}
        <mesh position={[0, 0.38, 0.03]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.08, 0.1, 16, 1, true]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* لمبة */}
        <mesh position={[0, 0.35, 0.03]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color="#fef3c7" />
        </mesh>
        <pointLight ref={lampLightRef} position={[0, 0.35, 0.05]} intensity={1.5} color="#fbbf24" distance={2.5} />
      </group>

      {/* === ساعة الحائط === */}
      <group position={[0.5, 1.5, -1.73]}>
        {/* إطار الساعة */}
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 32]} />
          <meshStandardMaterial color="#333" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* وجه الساعة */}
        <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.18, 32]} />
          <meshStandardMaterial color="#fefce8" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* علامات الساعات */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          return (
            <mesh key={`hour-${i}`}
              position={[Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0.02]}
            >
              <sphereGeometry args={[0.008, 6, 6]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          );
        })}
        {/* عقرب الساعات */}
        <mesh ref={clockHandRef} position={[0, 0, 0.025]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.008, 0.1, 0.005]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        {/* عقرب الدقائق */}
        <mesh position={[0, 0, 0.03]} rotation={[0, 0, Math.PI / 3]}>
          <boxGeometry args={[0.005, 0.14, 0.004]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
      </group>

      {/* === النافذة === */}
      <group position={[-1.73, 1.2, -0.5]}>
        {/* إطار */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.7, 0.6, 0.04]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.5} />
        </mesh>
        {/* زجاج */}
        <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[0.62, 0.52]} />
          <meshPhysicalMaterial
            color="#87CEEB"
            transmission={0.6}
            transparent
            opacity={0.4}
            roughness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* خط وسط النافذة */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.02, 0.6, 0.045]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.5} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.045]} />
          <meshStandardMaterial color="#f5f5f0" roughness={0.5} />
        </mesh>
      </group>

      {/* إضاءة عامة */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 2.5, 0]} intensity={0.8} color="#fff5e6" distance={5} />
    </group>
  );
}
