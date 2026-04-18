import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * مدرج الكولوسيوم الروماني — نسخة متحفية مصنوعة من الرخام الأبيض
 * يعرض كتحفة فنية مصغرة على قاعدة خشبية مصقولة مع إضاءة HDRI
 */
export function Colosseum3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  // خامة الرخام العتيق (Marble Material)
  const marbleMat = useMemo(() => ({
    color: "#f0e6d3",
    metalness: 0.02,
    roughness: 0.25,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    reflectivity: 0.8,
    envMapIntensity: 1.8,
  }), []);

  // خامة الرخام المظلل (للأجزاء الداخلية)
  const darkMarbleMat = useMemo(() => ({
    color: "#d4c4a8",
    metalness: 0.02,
    roughness: 0.35,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.4,
  }), []);

  // أقواس على محيط دائري مع خامة فاخرة
  const Arches = ({ radius, y, count, height, archWidth }: {
    radius: number; y: number; count: number; height: number; archWidth: number;
  }) => {
    const arches = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // العمود الأيسر
      arches.push(
        <mesh key={`pillar-l-${y}-${i}`}
          position={[
            Math.cos(angle - archWidth / radius / 2) * radius,
            y + height / 2,
            Math.sin(angle - archWidth / radius / 2) * radius
          ]}
          rotation={[0, -angle, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, height, 0.06]} />
          <meshPhysicalMaterial {...marbleMat} />
        </mesh>
      );
      // العمود الأيمن
      arches.push(
        <mesh key={`pillar-r-${y}-${i}`}
          position={[
            Math.cos(angle + archWidth / radius / 2) * radius,
            y + height / 2,
            Math.sin(angle + archWidth / radius / 2) * radius
          ]}
          rotation={[0, -angle, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, height, 0.06]} />
          <meshPhysicalMaterial {...marbleMat} />
        </mesh>
      );
      // قوس علوي
      arches.push(
        <mesh key={`arch-${y}-${i}`}
          position={[x, y + height, z]}
          rotation={[0, -angle + Math.PI / 2, 0]}
        >
          <torusGeometry args={[archWidth / 2, 0.025, 8, 16, Math.PI]} />
          <meshPhysicalMaterial {...marbleMat} />
        </mesh>
      );
    }
    return <>{arches}</>;
  };

  // الجدار الخارجي
  const WallRing = ({ radius, y, height, opacity = 1 }: {
    radius: number; y: number; height: number; opacity?: number;
  }) => (
    <mesh position={[0, y + height / 2, 0]} castShadow>
      <cylinderGeometry args={[radius, radius + 0.02, height, 64, 1, true]} />
      <meshPhysicalMaterial
        {...marbleMat}
        side={THREE.DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );

  // المدرجات الداخلية
  const Tiers = () => {
    const tiers = [];
    for (let i = 0; i < 8; i++) {
      const r = 0.5 + i * 0.1;
      const h = 0.08;
      const y = i * h;
      tiers.push(
        <mesh key={`tier-${i}`} position={[0, y, 0]}>
          <cylinderGeometry args={[r, r + 0.02, h, 48, 1, true]} />
          <meshPhysicalMaterial
            color={i % 2 === 0 ? "#e8dcc8" : "#f0e6d3"}
            roughness={0.3}
            metalness={0.02}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
            envMapIntensity={1.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
      tiers.push(
        <mesh key={`tier-top-${i}`} position={[0, y + h / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.02, r + 0.02, 48]} />
          <meshPhysicalMaterial
            color="#ede3d0"
            roughness={0.25}
            clearcoat={0.6}
            side={THREE.DoubleSide}
            envMapIntensity={1.6}
          />
        </mesh>
      );
    }
    return <>{tiers}</>;
  };

  return (
    <>
      <Environment preset="studio" />

      <group ref={groupRef} position={[0, -0.2, 0]} scale={1.3}>
        {/* === الجدار الخارجي - 3 طوابق === */}
        <WallRing radius={1.45} y={0} height={0.4} />
        <WallRing radius={1.4} y={0.4} height={0.35} />
        <WallRing radius={1.35} y={0.75} height={0.3} opacity={0.85} />

        {/* الجزء المدمر */}
        <mesh position={[0.4, 1.15, 0]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[0.8, 0.2, 0.06]} />
          <meshPhysicalMaterial {...darkMarbleMat} />
        </mesh>

        {/* === الأقواس === */}
        <Arches radius={1.45} y={0} count={32} height={0.35} archWidth={0.2} />
        <Arches radius={1.4} y={0.4} count={32} height={0.3} archWidth={0.18} />
        <Arches radius={1.35} y={0.75} count={32} height={0.25} archWidth={0.16} />

        {/* المدرجات */}
        <Tiers />

        {/* أرضية الساحة */}
        <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.48, 48]} />
          <meshPhysicalMaterial
            color="#ddd0b8"
            roughness={0.4}
            clearcoat={0.3}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* أنفاق تحت الأرضية */}
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((angle, i) => (
          <mesh key={`tunnel-${i}`}
            position={[Math.cos(angle) * 0.25, -0.01, Math.sin(angle) * 0.25]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[0.06, 0.35]} />
            <meshPhysicalMaterial color="#8b7355" roughness={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}

        {/* ═══ قاعدة العرض المتحفية (خشب مصقول داكن) ═══ */}
        <mesh position={[0, -0.08, 0]} receiveShadow>
          <cylinderGeometry args={[1.9, 2.0, 0.14, 64]} />
          <meshPhysicalMaterial
            color="#2a1f14"
            metalness={0.05}
            roughness={0.2}
            clearcoat={0.9}
            clearcoatRoughness={0.08}
            reflectivity={0.9}
            envMapIntensity={2}
          />
        </mesh>

        {/* حافة نحاسية للقاعدة */}
        <mesh position={[0, -0.02, 0]}>
          <torusGeometry args={[1.95, 0.02, 16, 64]} />
          <meshPhysicalMaterial
            color="#b87333"
            metalness={0.9}
            roughness={0.12}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* إضاءة مسرحية */}
        <spotLight position={[3, 4, 2]} angle={0.4} penumbra={0.8} intensity={2.5} color="#fff5e6" castShadow />
        <spotLight position={[-2, 3, -1]} angle={0.5} penumbra={0.9} intensity={1.2} color="#ffe0b2" />
        <pointLight position={[0, 2, 0]} intensity={0.6} color="#ffd485" />
      </group>

      <ContactShadows
        position={[0, -0.35, 0]}
        opacity={0.65}
        scale={8}
        blur={2.5}
        far={4}
      />
    </>
  );
}
