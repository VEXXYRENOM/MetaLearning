import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * إناء فخاري تقليدي ثلاثي الأبعاد
 * يُصنع باستخدام LatheGeometry (شكل دوراني)
 * مع زخارف ونقوش تقليدية + قرص خزاف دوار
 */
export function Pottery3D() {
  const groupRef = useRef<THREE.Group>(null);
  const vaseRef = useRef<THREE.Mesh>(null);
  const wheelRef = useRef<THREE.Mesh>(null);

  // منحنى الإناء (profile)
  const vaseGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),        // القاعدة المركزية
      new THREE.Vector2(0.25, 0),      // حافة القاعدة
      new THREE.Vector2(0.28, 0.05),   // تقعر القاعدة
      new THREE.Vector2(0.35, 0.15),   // بداية البطن
      new THREE.Vector2(0.5, 0.4),     // بطن الإناء
      new THREE.Vector2(0.55, 0.6),    // أوسع نقطة
      new THREE.Vector2(0.5, 0.8),     // بداية التضيق
      new THREE.Vector2(0.38, 1.0),    // العنق
      new THREE.Vector2(0.3, 1.1),     // أضيق نقطة في العنق
      new THREE.Vector2(0.32, 1.15),   // بداية الفتحة
      new THREE.Vector2(0.38, 1.2),    // حافة الفتحة (خارج)
      new THREE.Vector2(0.35, 1.22),   // حافة علوية
      new THREE.Vector2(0.3, 1.2),     // داخل الحافة
    ];
    return new THREE.LatheGeometry(points, 48);
  }, []);

  // إناء ثاني أصغر (كوب)
  const cupGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.15, 0),
      new THREE.Vector2(0.18, 0.02),
      new THREE.Vector2(0.2, 0.1),
      new THREE.Vector2(0.22, 0.2),
      new THREE.Vector2(0.25, 0.35),
      new THREE.Vector2(0.27, 0.38),
      new THREE.Vector2(0.25, 0.4),
    ];
    return new THREE.LatheGeometry(points, 32);
  }, []);

  // طبق صغير
  const plateGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.35, 0),
      new THREE.Vector2(0.4, 0.02),
      new THREE.Vector2(0.42, 0.04),
      new THREE.Vector2(0.4, 0.06),
    ];
    return new THREE.LatheGeometry(points, 32);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }
    if (vaseRef.current) {
      vaseRef.current.rotation.y = t * 0.3;
    }
    if (wheelRef.current) {
      wheelRef.current.rotation.y = t * 2;
    }
  });

  const clayColor = "#c68642";
  const clayDark = "#8b5e3c";
  const glazeColor = "#2563eb";

  return (
    <group ref={groupRef} position={[0, -0.5, 0]} scale={1.1}>
      {/* === قرص الخزاف (Potter's Wheel) === */}
      <group position={[0, -0.1, 0]}>
        {/* القاعدة */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.3, 24]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
        {/* القرص الدوار */}
        <mesh ref={wheelRef} position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 32]} />
          <meshStandardMaterial
            color="#8b7355"
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        {/* حلقات القرص */}
        {[0.15, 0.3, 0.45, 0.55].map((r, i) => (
          <mesh key={`ring-${i}`} position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.005, 8, 32]} />
            <meshBasicMaterial color="#6d5d45" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* === الإناء الرئيسي === */}
      <mesh ref={vaseRef} geometry={vaseGeometry} position={[0, 0.05, 0]}>
        <meshPhysicalMaterial
          color={clayColor}
          emissive={clayDark}
          emissiveIntensity={0.1}
          roughness={0.65}
          metalness={0.02}
          clearcoat={0.3}
          clearcoatRoughness={0.5}
        />
      </mesh>

      {/* زخارف الإناء (خطوط أفقية) */}
      {[0.35, 0.55, 0.75, 0.95].map((y, i) => (
        <mesh key={`band-${i}`} position={[0, y + 0.05, 0]}>
          <torusGeometry args={[
            0.35 + Math.sin(y * 2.5) * 0.18,
            0.008,
            8, 32
          ]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? glazeColor : "#b91c1c"}
            emissive={i % 2 === 0 ? "#1d4ed8" : "#991b1b"}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>
      ))}

      {/* نقوش مثلثة / زيجزاج */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = 0.52;
        return (
          <mesh key={`zigzag-${i}`}
            position={[Math.cos(angle) * r, 0.65, Math.sin(angle) * r]}
            rotation={[0, -angle, Math.PI / 4]}
            scale={[0.02, 0.04, 0.01]}
          >
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={0.5}
              roughness={0.3}
            />
          </mesh>
        );
      })}

      {/* === كوب صغير بجانب الإناء === */}
      <mesh geometry={cupGeometry} position={[0.8, 0.05, 0.3]}>
        <meshPhysicalMaterial
          color="#a0522d"
          roughness={0.7}
          metalness={0.02}
          clearcoat={0.2}
        />
      </mesh>

      {/* === طبق === */}
      <mesh geometry={plateGeometry} position={[-0.7, 0.05, 0.2]}>
        <meshPhysicalMaterial
          color={clayColor}
          roughness={0.6}
          clearcoat={0.4}
        />
      </mesh>
      {/* زخرفة الطبق */}
      <mesh position={[-0.7, 0.07, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.3, 32]} />
        <meshStandardMaterial
          color={glazeColor}
          emissive="#1d4ed8"
          emissiveIntensity={0.2}
          roughness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* === أدوات الخزاف === */}
      {/* أداة التشكيل */}
      <mesh position={[0.5, 0.12, -0.5]} rotation={[0, 0.5, Math.PI / 12]}>
        <cylinderGeometry args={[0.012, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#6d5d45" roughness={0.8} />
      </mesh>
      {/* إسفنجة */}
      <mesh position={[0.65, 0.08, -0.4]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#f5deb3" roughness={0.95} />
      </mesh>

      {/* إضاءة */}
      <pointLight position={[1, 2, 1]} intensity={1} color="#fff5e6" distance={5} />
      <pointLight position={[-1, 1.5, 0.5]} intensity={0.5} color="#fbbf24" distance={3} />
    </group>
  );
}
