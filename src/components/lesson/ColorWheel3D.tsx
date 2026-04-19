import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * عجلة الألوان ثلاثية الأبعاد
 * 12 شريحة لونية (الألوان الأساسية والثانوية والثالثية)
 * مع حلقات متداخلة تمثل التشبع والسطوع
 */
export function ColorWheel3D() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Group>(null);

  // 12 لون في عجلة الألوان
  const hueColors = useMemo(() => {
    const colors: string[] = [];
    for (let i = 0; i < 12; i++) {
      const hue = (i / 12) * 360;
      colors.push(`hsl(${hue}, 100%, 50%)`);
    }
    return colors;
  }, []);

  const pastelColors = useMemo(() => {
    const colors: string[] = [];
    for (let i = 0; i < 12; i++) {
      const hue = (i / 12) * 360;
      colors.push(`hsl(${hue}, 60%, 75%)`);
    }
    return colors;
  }, []);

  const darkColors = useMemo(() => {
    const colors: string[] = [];
    for (let i = 0; i < 12; i++) {
      const hue = (i / 12) * 360;
      colors.push(`hsl(${hue}, 80%, 30%)`);
    }
    return colors;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.08;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.05;
    }
  });

  // شريحة لونية (قطاع دائري)
  const Slice = ({ index, total, innerR, outerR, color, height = 0.12 }: {
    index: number; total: number; innerR: number; outerR: number;
    color: string; height?: number;
  }) => {
    const startAngle = (index / total) * Math.PI * 2;
    const endAngle = ((index + 1) / total) * Math.PI * 2;
    
    

    // شكل القطاع
    const shape = new THREE.Shape();
    const segments = 16;
    shape.moveTo(Math.cos(startAngle) * innerR, Math.sin(startAngle) * innerR);
    for (let i = 0; i <= segments; i++) {
      const a = startAngle + (i / segments) * (endAngle - startAngle);
      shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
    }
    for (let i = segments; i >= 0; i--) {
      const a = startAngle + (i / segments) * (endAngle - startAngle);
      shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
    }

    const extrudeSettings = { depth: height, bevelEnabled: false };

    return (
      <mesh position={[0, 0, -height / 2]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.25}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
        />
      </mesh>
    );
  };

  return (
    <group ref={groupRef} rotation={[Math.PI / 6, 0, 0]} scale={1.1}>
      {/* الحلقة الخارجية - ألوان داكنة */}
      <group ref={outerRingRef}>
        {darkColors.map((color, i) => (
          <Slice key={`outer-${i}`} index={i} total={12} innerR={1.1} outerR={1.5} color={color} height={0.08} />
        ))}
      </group>

      {/* الحلقة الوسطى - ألوان كاملة التشبع */}
      {hueColors.map((color, i) => (
        <Slice key={`mid-${i}`} index={i} total={12} innerR={0.65} outerR={1.08} color={color} height={0.14} />
      ))}

      {/* الحلقة الداخلية - ألوان فاتحة */}
      <group ref={innerRingRef}>
        {pastelColors.map((color, i) => (
          <Slice key={`inner-${i}`} index={i} total={12} innerR={0.28} outerR={0.63} color={color} height={0.1} />
        ))}
      </group>

      {/* المركز - دائرة بيضاء */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.15, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* حلقة زخرفية */}
      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 8, 48]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.015, 8, 48]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* إضاءة */}
      <pointLight position={[0, 2, 2]} intensity={1} color="#ffffff" distance={6} />
    </group>
  );
}
