import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * جامع عقبة بن نافع (القيروان) — نسخة متحفية بخامات فاخرة
 * رخام أبيض + قباب خضراء لامعة + أهلّة ذهبية + قاعدة مصقولة
 * بيئة إضاءة HDRI لإبراز جمال العمارة الإسلامية
 */
export function KairouanMosque3D() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  // خامة الجدران (رخام عاجي)
  const wallMat = {
    color: "#f8f0e0",
    roughness: 0.2,
    metalness: 0.02,
    clearcoat: 0.6,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.8,
  };

  // خامة القبة الخضراء (مينا لامع)
  const domeMat = {
    color: "#1a7340",
    roughness: 0.15,
    metalness: 0.4,
    clearcoat: 0.9,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.2,
  };

  // خامة الأهلّة الذهبية
  const goldMat = {
    color: "#d4a843",
    metalness: 0.95,
    roughness: 0.08,
    envMapIntensity: 3,
  };

  return (
    <>
      <Environment preset="studio" />

      <group ref={groupRef} position={[0, -0.6, 0]} scale={0.9}>
        {/* === الأسوار الخارجية (رخام فاخر) === */}
        <mesh position={[0, 0.4, 1.2]} castShadow>
          <boxGeometry args={[2.6, 0.8, 0.08]} />
          <meshPhysicalMaterial {...wallMat} />
        </mesh>
        <mesh position={[0, 0.4, -1.2]} castShadow>
          <boxGeometry args={[2.6, 0.8, 0.08]} />
          <meshPhysicalMaterial {...wallMat} />
        </mesh>
        <mesh position={[-1.3, 0.4, 0]} castShadow>
          <boxGeometry args={[0.08, 0.8, 2.48]} />
          <meshPhysicalMaterial {...wallMat} color="#f0e6d0" />
        </mesh>
        <mesh position={[1.3, 0.4, 0]} castShadow>
          <boxGeometry args={[0.08, 0.8, 2.48]} />
          <meshPhysicalMaterial {...wallMat} color="#f0e6d0" />
        </mesh>

        {/* شرفات على الأسوار */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={`battlement-${i}`} position={[-1.2 + i * 0.13, 0.85, 1.2]}>
            <boxGeometry args={[0.05, 0.08, 0.06]} />
            <meshPhysicalMaterial {...wallMat} />
          </mesh>
        ))}

        {/* === المئذنة (3 طوابق مع خضراء وذهب) === */}
        <group position={[1.0, 0, 1.0]}>
          {/* الطابق الأول */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[0.45, 1.2, 0.45]} />
            <meshPhysicalMaterial {...wallMat} />
          </mesh>
          {/* نوافذ */}
          {[0, 1, 2, 3].map((j) => (
            <mesh key={`mw1-${j}`}
              position={[
                Math.cos((j / 4) * Math.PI * 2) * 0.23,
                0.5, Math.sin((j / 4) * Math.PI * 2) * 0.23
              ]}
              rotation={[0, (j / 4) * Math.PI * 2, 0]}
            >
              <planeGeometry args={[0.08, 0.15]} />
              <meshPhysicalMaterial color="#3d2b1a" roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* الطابق الثاني */}
          <mesh position={[0, 1.45, 0]} castShadow>
            <boxGeometry args={[0.35, 0.5, 0.35]} />
            <meshPhysicalMaterial {...wallMat} />
          </mesh>
          {/* أقواس المئذنة مع حلية */}
          {[0, 1, 2, 3].map((j) => (
            <mesh key={`ma-${j}`}
              position={[
                Math.cos((j / 4) * Math.PI * 2) * 0.18,
                1.45, Math.sin((j / 4) * Math.PI * 2) * 0.18
              ]}
              rotation={[0, (j / 4) * Math.PI * 2, 0]}
            >
              <torusGeometry args={[0.05, 0.01, 8, 12, Math.PI]} />
              <meshPhysicalMaterial {...goldMat} />
            </mesh>
          ))}
          {/* الطابق الثالث */}
          <mesh position={[0, 1.9, 0]} castShadow>
            <boxGeometry args={[0.25, 0.3, 0.25]} />
            <meshPhysicalMaterial {...wallMat} />
          </mesh>
          {/* القبة الصغيرة (خضراء لامعة) */}
          <mesh position={[0, 2.15, 0]}>
            <sphereGeometry args={[0.1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial {...domeMat} />
          </mesh>
          {/* الهلال (ذهب خالص) */}
          <mesh position={[0, 2.32, 0]}>
            <torusGeometry args={[0.035, 0.008, 12, 24, Math.PI * 1.3]} />
            <meshPhysicalMaterial {...goldMat} />
          </mesh>
          {/* عصا الهلال */}
          <mesh position={[0, 2.25, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.12, 8]} />
            <meshPhysicalMaterial {...goldMat} />
          </mesh>
        </group>

        {/* === القبة الرئيسية (فوق المحراب) === */}
        <group position={[0, 0.8, -0.8]}>
          {/* قاعدة مثمنة */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.55, 0.3, 8]} />
            <meshPhysicalMaterial {...wallMat} />
          </mesh>
          {/* القبة الخضراء العظيمة */}
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.45, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshPhysicalMaterial {...domeMat} />
          </mesh>
          {/* الهلال فوق القبة */}
          <mesh position={[0, 0.95, 0]}>
            <torusGeometry args={[0.04, 0.008, 12, 24, Math.PI * 1.3]} />
            <meshPhysicalMaterial {...goldMat} />
          </mesh>
          <mesh position={[0, 0.87, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
            <meshPhysicalMaterial {...goldMat} />
          </mesh>
        </group>

        {/* === سقف القاعة === */}
        <mesh position={[0, 0.82, -0.3]}>
          <boxGeometry args={[2.4, 0.04, 1.7]} />
          <meshPhysicalMaterial
            color="#7a6b5a"
            roughness={0.3}
            clearcoat={0.5}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* === الفناء الداخلي === */}
        <mesh position={[0, 0.01, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 1.2]} />
          <meshPhysicalMaterial
            color="#f0e6d3"
            roughness={0.25}
            clearcoat={0.5}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* === الأقواس حول الفناء (رخام لامع) === */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = -1.05 + i * 0.3;
          return (
            <group key={`af-${i}`} position={[x, 0, 0.9]}>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.03, 0.035, 0.7, 12]} />
                <meshPhysicalMaterial
                  color="#f0e8d8"
                  roughness={0.15}
                  clearcoat={0.8}
                  envMapIntensity={2}
                />
              </mesh>
              <mesh position={[0, 0.72, 0]}>
                <torusGeometry args={[0.12, 0.015, 12, 16, Math.PI]} />
                <meshPhysicalMaterial {...goldMat} metalness={0.7} color="#c9953a" />
              </mesh>
            </group>
          );
        })}

        {/* الأعمدة الجانبية */}
        {Array.from({ length: 5 }).map((_, i) => {
          const z = -0.1 + i * 0.25;
          return (
            <group key={`side-${i}`}>
              <group position={[-1.15, 0, z]}>
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.025, 0.03, 0.7, 10]} />
                  <meshPhysicalMaterial color="#f0e8d8" roughness={0.15} clearcoat={0.8} envMapIntensity={2} />
                </mesh>
              </group>
              <group position={[1.15, 0, z]}>
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.025, 0.03, 0.7, 10]} />
                  <meshPhysicalMaterial color="#f0e8d8" roughness={0.15} clearcoat={0.8} envMapIntensity={2} />
                </mesh>
              </group>
            </group>
          );
        })}

        {/* === بئر في الفناء === */}
        <group position={[0, 0, 0.5]}>
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.12, 16]} />
            <meshPhysicalMaterial {...wallMat} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 16, 1, true]} />
            <meshPhysicalMaterial
              color="#3a8ab5"
              roughness={0.1}
              metalness={0.15}
              clearcoat={1}
              envMapIntensity={2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* ═══ قاعدة العرض المتحفية ═══ */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[3.5, 3.5]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.05}
            reflectivity={1}
            envMapIntensity={2}
          />
        </mesh>

        {/* حافة ذهبية */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.55, 0.02, 3.55]} />
          <meshPhysicalMaterial {...goldMat} metalness={0.85} color="#b8882f" />
        </mesh>

        {/* ═══ إضاءة مسرحية ═══ */}
        <spotLight position={[2, 4, 2]} angle={0.4} penumbra={0.8} intensity={2.5} color="#fff5e6" castShadow />
        <spotLight position={[-2, 3, -1]} angle={0.5} penumbra={0.9} intensity={1.2} color="#ffecd2" />
        <pointLight position={[0, 3, 0]} intensity={0.8} color="#fff5e6" />
        {/* إضاءة خاصة على الهلال الذهبي */}
        <pointLight position={[1.0, 2.5, 1.0]} intensity={0.6} color="#ffd700" distance={3} />
      </group>

      <ContactShadows
        position={[0, -0.62, 0]}
        opacity={0.6}
        scale={8}
        blur={2.5}
        far={4}
      />
    </>
  );
}
