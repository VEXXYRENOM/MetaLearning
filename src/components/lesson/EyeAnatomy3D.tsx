import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * تشريح العين البشرية — نسخة متحفية طبية فاخرة
 * إضاءة HDRI + خامات زجاجية وكريستالية
 * بؤبؤ متحرك + عدسة متكيفة
 */
export function EyeAnatomy3D() {
  const groupRef = useRef<THREE.Group>(null);
  const pupilRef = useRef<THREE.Mesh>(null);
  const lensRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }
    if (pupilRef.current) {
      const dilate = 0.15 + Math.sin(t * 0.5) * 0.05;
      pupilRef.current.scale.set(dilate / 0.15, dilate / 0.15, 1);
    }
    if (lensRef.current) {
      const focus = 1 + Math.sin(t * 0.3) * 0.1;
      lensRef.current.scale.set(1, focus, 1);
    }
  });

  const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  return (
    <>
      <Environment preset="studio" />

      <group ref={groupRef} scale={1.3}>
        {/* ═══ الصلبة (بياض العين) — بورسلان طبي ═══ */}
        <mesh>
          <sphereGeometry args={[1.0, 64, 64]} />
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.2}
            metalness={0.02}
            clearcoat={0.8}
            clearcoatRoughness={0.05}
            envMapIntensity={2}
            side={THREE.DoubleSide}
            clippingPlanes={[clipPlane]}
            clipShadows
          />
        </mesh>

        {/* ═══ المشيمية (أوعية دموية) — سيليكون أحمر داكن ═══ */}
        <mesh>
          <sphereGeometry args={[0.95, 48, 48]} />
          <meshPhysicalMaterial
            color="#7f1d1d"
            roughness={0.25}
            clearcoat={0.5}
            envMapIntensity={1.5}
            side={THREE.DoubleSide}
            clippingPlanes={[clipPlane]}
          />
        </mesh>

        {/* ═══ الشبكية — طبقة ذهبية لامعة ═══ */}
        <mesh>
          <sphereGeometry args={[0.9, 48, 48]} />
          <meshPhysicalMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.4}
            roughness={0.15}
            clearcoat={0.6}
            envMapIntensity={2}
            side={THREE.DoubleSide}
            clippingPlanes={[clipPlane]}
          />
        </mesh>

        {/* ═══ الجسم الزجاجي (كريستال شفاف) ═══ */}
        <mesh>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshPhysicalMaterial
            color="#dbeafe"
            transmission={0.95}
            transparent
            opacity={0.1}
            roughness={0}
            ior={1.34}
            thickness={3}
            clearcoat={1}
            envMapIntensity={2}
            clippingPlanes={[clipPlane]}
          />
        </mesh>

        {/* ═══ القرنية (عدسة زجاجية لامعة) ═══ */}
        <mesh position={[0, 0, 0.85]} scale={[0.45, 0.45, 0.3]}>
          <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transmission={0.9}
            transparent
            opacity={0.2}
            roughness={0}
            ior={1.376}
            thickness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={3}
          />
        </mesh>

        {/* ═══ القزحية (حلقة ياقوتية) ═══ */}
        <mesh position={[0, 0, 0.7]}>
          <ringGeometry args={[0.15, 0.35, 48]} />
          <meshPhysicalMaterial
            color="#1d4ed8"
            emissive="#2563eb"
            emissiveIntensity={0.4}
            roughness={0.1}
            clearcoat={0.9}
            envMapIntensity={2.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* تفاصيل القزحية */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          return (
            <mesh
              key={`iris-${i}`}
              position={[Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0.701]}
              rotation={[0, 0, angle]}
              scale={[0.01, 0.1, 0.01]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshPhysicalMaterial
                color="#1e40af"
                transparent opacity={0.5}
                roughness={0.1}
                clearcoat={0.5}
                envMapIntensity={2}
              />
            </mesh>
          );
        })}

        {/* ═══ البؤبؤ (أوبسيديان أسود لامع) ═══ */}
        <mesh ref={pupilRef} position={[0, 0, 0.72]}>
          <circleGeometry args={[0.15, 32]} />
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.02}
            envMapIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* ═══ العدسة (كريستال مصقول) ═══ */}
        <mesh ref={lensRef} position={[0, 0, 0.5]} scale={[0.3, 0.3, 0.15]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshPhysicalMaterial
            color="#fef3c7"
            transmission={0.85}
            transparent
            opacity={0.3}
            roughness={0}
            ior={1.42}
            thickness={1.5}
            clearcoat={1}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* ═══ العصب البصري ═══ */}
        <mesh position={[0.15, -0.1, -1.1]} rotation={[0.1, 0, 0.15]}>
          <cylinderGeometry args={[0.1, 0.08, 0.8, 16]} />
          <meshPhysicalMaterial
            color="#fbbf24"
            roughness={0.2}
            clearcoat={0.6}
            envMapIntensity={1.8}
          />
        </mesh>

        {/* البقعة العمياء */}
        <mesh position={[0.15, -0.1, -0.88]}>
          <circleGeometry args={[0.1, 24]} />
          <meshPhysicalMaterial
            color="#fef08a"
            emissive="#eab308"
            emissiveIntensity={0.6}
            roughness={0.1}
            clearcoat={0.8}
            envMapIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* النقرة المركزية */}
        <mesh position={[0, 0, -0.89]}>
          <circleGeometry args={[0.08, 24]} />
          <meshPhysicalMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={0.7}
            roughness={0.1}
            clearcoat={0.8}
            envMapIntensity={2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* عضلات العين */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh
            key={`muscle-${i}`}
            position={[Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, -0.5]}
            rotation={[Math.sin(angle) * 0.5, Math.cos(angle) * 0.5, 0]}
          >
            <cylinderGeometry args={[0.03, 0.04, 0.8, 8]} />
            <meshPhysicalMaterial
              color="#ef4444"
              transparent opacity={0.7}
              roughness={0.2}
              clearcoat={0.5}
              envMapIntensity={1.5}
            />
          </mesh>
        ))}

        {/* إضاءة خاصة بالقزحية */}
        <pointLight position={[0, 0, 1.5]} intensity={0.4} color="#3b82f6" distance={3} />
      </group>

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}
