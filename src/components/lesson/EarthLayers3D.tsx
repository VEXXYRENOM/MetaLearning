import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * طبقات الأرض ثلاثية الأبعاد (مقطع عرضي)
 * يعرض: القشرة، الوشاح العلوي، الوشاح السفلي، اللب الخارجي، اللب الداخلي
 * مع تأثير القطع لإظهار الطبقات الداخلية
 */
export function EarthLayers3D() {
  const groupRef = useRef<THREE.Group>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
    }
    // نبض اللب الداخلي (حرارة)
    if (innerCoreRef.current) {
      const pulse = 1 + Math.sin(t * 2) * 0.05;
      innerCoreRef.current.scale.setScalar(pulse);
    }
  });

  // قطع ربع الكرة لإظهار الطبقات
  const clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
  ];

  const HalfSphere = ({
    radius,
    color,
    emissive,
    emissiveIntensity = 0,
    opacity = 1,
    transmission = 0,
  }: {
    radius: number;
    color: string;
    emissive?: string;
    emissiveIntensity?: number;
    opacity?: number;
    transmission?: number;
  }) => (
    <mesh>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive || color}
        emissiveIntensity={emissiveIntensity}
        roughness={0.5}
        metalness={0.1}
        side={THREE.DoubleSide}
        clippingPlanes={clippingPlanes}
        clipShadows
        transparent={opacity < 1 || transmission > 0}
        opacity={opacity}
        transmission={transmission}
      />
    </mesh>
  );

  return (
    <group ref={groupRef} scale={1.0}>
      {/* اللب الداخلي (Inner Core) - حديد صلب */}
      <mesh ref={innerCoreRef}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshPhysicalMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={2}
          roughness={0.2}
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* اللب الخارجي (Outer Core) - حديد سائل */}
      <HalfSphere
        radius={0.55}
        color="#f97316"
        emissive="#ea580c"
        emissiveIntensity={1.2}
      />

      {/* الوشاح السفلي (Lower Mantle) */}
      <HalfSphere
        radius={0.85}
        color="#dc2626"
        emissive="#b91c1c"
        emissiveIntensity={0.5}
      />

      {/* الوشاح العلوي (Upper Mantle) */}
      <HalfSphere
        radius={1.15}
        color="#ea580c"
        emissive="#c2410c"
        emissiveIntensity={0.3}
      />

      {/* القشرة (Crust) */}
      <HalfSphere
        radius={1.3}
        color="#15803d"
        emissive="#166534"
        emissiveIntensity={0.1}
      />

      {/* المحيطات (سطح مائي شفاف) */}
      <mesh>
        <sphereGeometry args={[1.32, 64, 64]} />
        <meshPhysicalMaterial
          color="#0ea5e9"
          transmission={0.6}
          opacity={0.3}
          transparent
          roughness={0}
          thickness={0.1}
          ior={1.33}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* الغلاف الجوي (هالة خفيفة) */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* خطوط الفصل بين الطبقات (حلقات) */}
      {[0.25, 0.55, 0.85, 1.15, 1.3].map((r, i) => (
        <group key={i}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.005, r + 0.005, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <ringGeometry args={[r - 0.005, r + 0.005, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
