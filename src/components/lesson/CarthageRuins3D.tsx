import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * آثار قرطاج القديمة — نسخة متحفية كريستالية
 * أعمدة من الكريستال المصقول على قاعدة سوداء فاخرة
 * مع إضاءة HDRI وظلال واقعية
 */
export function CarthageRuins3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  // عمود كورنثي مفصل بخامة رخامية فاخرة
  const Column = ({ position, height, broken = false, tilt = 0 }: {
    position: [number, number, number];
    height: number;
    broken?: boolean;
    tilt?: number;
  }) => {
    const actualHeight = broken ? height * 0.45 : height;
    const flutingCount = 12;

    return (
      <group position={position} rotation={[tilt, 0, tilt * 0.5]}>
        {/* القاعدة (Base) */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
          <meshPhysicalMaterial
            color="#f5efe3"
            roughness={0.15}
            clearcoat={0.8}
            clearcoatRoughness={0.05}
            envMapIntensity={2}
          />
        </mesh>

        {/* جذع العمود */}
        <mesh position={[0, actualHeight / 2 + 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, actualHeight, flutingCount]} />
          <meshPhysicalMaterial
            color="#f0e8d8"
            roughness={0.18}
            metalness={0.03}
            clearcoat={0.7}
            clearcoatRoughness={0.08}
            envMapIntensity={2}
          />
        </mesh>

        {/* خطوط العمود العمودية (Fluting) */}
        {Array.from({ length: flutingCount }).map((_, i) => {
          const a = (i / flutingCount) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * 0.09,
                actualHeight / 2 + 0.08,
                Math.sin(a) * 0.09,
              ]}
            >
              <cylinderGeometry args={[0.008, 0.008, actualHeight * 0.95, 4]} />
              <meshPhysicalMaterial
                color="#e8ddc8"
                roughness={0.2}
                clearcoat={0.5}
                envMapIntensity={1.5}
              />
            </mesh>
          );
        })}

        {/* التاج (Capital) */}
        {!broken && (
          <group position={[0, actualHeight + 0.08, 0]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.1, 0.09, 0.04, 16]} />
              <meshPhysicalMaterial
                color="#f5efe3"
                roughness={0.15}
                clearcoat={0.8}
                envMapIntensity={2}
              />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.22, 0.04, 0.22]} />
              <meshPhysicalMaterial
                color="#ede3d0"
                roughness={0.15}
                clearcoat={0.8}
                envMapIntensity={2}
              />
            </mesh>
            {/* زخرفة التاج */}
            {[0, 1, 2, 3].map((j) => (
              <mesh
                key={j}
                position={[
                  Math.cos((j / 4) * Math.PI * 2) * 0.09,
                  0.03,
                  Math.sin((j / 4) * Math.PI * 2) * 0.09,
                ]}
                scale={[0.03, 0.04, 0.03]}
              >
                <sphereGeometry args={[1, 8, 8]} />
                <meshPhysicalMaterial
                  color="#f0e6d3"
                  roughness={0.12}
                  clearcoat={0.9}
                  envMapIntensity={2.2}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* قطعة مكسورة على الأرض */}
        {broken && (
          <mesh
            position={[0.15, 0.03, 0.1]}
            rotation={[Math.PI / 2, 0, 0.7]}
          >
            <cylinderGeometry args={[0.07, 0.08, 0.2, 8]} />
            <meshPhysicalMaterial
              color="#e8dcc8"
              roughness={0.2}
              clearcoat={0.6}
              envMapIntensity={1.8}
            />
          </mesh>
        )}
      </group>
    );
  };

  return (
    <>
      <Environment preset="studio" />

      <group ref={groupRef} position={[0, -0.4, 0]} scale={1.3}>
        {/* === صف الأعمدة الأمامي === */}
        <Column position={[-0.8, 0, 0.5]} height={1.5} />
        <Column position={[-0.4, 0, 0.5]} height={1.5} />
        <Column position={[0, 0, 0.5]} height={1.5} />
        <Column position={[0.4, 0, 0.5]} height={1.5} broken />
        <Column position={[0.8, 0, 0.5]} height={1.5} broken />

        {/* === صف الأعمدة الخلفي === */}
        <Column position={[-0.8, 0, -0.3]} height={1.2} broken />
        <Column position={[-0.4, 0, -0.3]} height={1.4} />
        <Column position={[0.4, 0, -0.3]} height={1.3} broken tilt={0.05} />

        {/* === العارضة العلوية (Entablature) === */}
        <mesh position={[-0.4, 1.65, 0.5]} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.2]} />
          <meshPhysicalMaterial
            color="#f0e6d3"
            roughness={0.15}
            clearcoat={0.8}
            envMapIntensity={2}
          />
        </mesh>
        <mesh position={[-0.4, 1.7, 0.5]}>
          <boxGeometry args={[1.0, 0.03, 0.22]} />
          <meshPhysicalMaterial
            color="#ede3d0"
            roughness={0.15}
            clearcoat={0.8}
            envMapIntensity={2}
          />
        </mesh>

        {/* === بقايا جدار === */}
        <mesh position={[-1.1, 0.3, 0.1]} rotation={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.7]} />
          <meshPhysicalMaterial
            color="#e8dcc8"
            roughness={0.25}
            clearcoat={0.5}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* === أحجار متناثرة === */}
        {[
          [-0.5, 0.03, 0.8], [0.6, 0.025, -0.1], [-0.9, 0.02, -0.5],
          [0.3, 0.035, 0.9], [0.9, 0.02, 0.4], [-0.2, 0.03, -0.6],
          [0.7, 0.025, -0.4], [-0.6, 0.02, 0.2],
        ].map(([x, s, z], i) => (
          <mesh key={`stone-${i}`} position={[x as number, (s as number) / 2, z as number]} rotation={[0.3 * i, 0.5 * i, 0.2 * i]}>
            <boxGeometry args={[s as number * 2, (s as number) * 1.5, (s as number) * 1.8]} />
            <meshPhysicalMaterial
              color="#e0d4be"
              roughness={0.3}
              clearcoat={0.4}
              envMapIntensity={1.5}
            />
          </mesh>
        ))}

        {/* ═══ قاعدة العرض المتحفية ═══ */}
        <mesh position={[0, -0.06, 0.1]} receiveShadow>
          <boxGeometry args={[3.2, 0.12, 2.8]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.08}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            envMapIntensity={2.2}
          />
        </mesh>

        {/* حافة ذهبية */}
        <mesh position={[0, -0.01, 0.1]}>
          <boxGeometry args={[3.25, 0.01, 2.85]} />
          <meshPhysicalMaterial
            color="#c9953a"
            metalness={0.9}
            roughness={0.12}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* أرضية أثرية حجرية */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.1]}>
          <planeGeometry args={[3, 2.5]} />
          <meshPhysicalMaterial
            color="#d4c4a8"
            roughness={0.35}
            clearcoat={0.3}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* ═══ إضاءة مسرحية ═══ */}
        <spotLight position={[2, 4, 2]} angle={0.4} penumbra={0.8} intensity={2.5} color="#fff5e6" castShadow />
        <spotLight position={[-2, 3, -1]} angle={0.5} penumbra={0.9} intensity={1.2} color="#ffe0b2" />
        <pointLight position={[0, 2.5, 0.5]} intensity={0.5} color="#ffd485" />
      </group>

      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={0.6}
        scale={8}
        blur={2.5}
        far={4}
      />
    </>
  );
}
