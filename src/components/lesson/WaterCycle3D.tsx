import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * دورة الماء في الطبيعة ثلاثية الأبعاد
 * يعرض: تبخر، تكاثف (سحب)، هطول (أمطار)، تجمع (محيط)، جبال
 */
export function WaterCycle3D() {
  const groupRef = useRef<THREE.Group>(null);
  const cloudRefs = useRef<THREE.Group[]>([]);
  const rainRefs = useRef<THREE.Mesh[]>([]);
  const sunRef = useRef<THREE.Mesh>(null);
  const steamRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
    }
    // حركة الشمس
    if (sunRef.current) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.08;
      sunRef.current.scale.setScalar(pulse);
    }
    // حركة السحب
    cloudRefs.current.forEach((cloud, i) => {
      if (cloud) {
        cloud.position.x = -1 + Math.sin(t * 0.2 + i) * 0.3;
        cloud.position.y = 1.8 + Math.sin(t * 0.3 + i * 0.5) * 0.1;
      }
    });
    // قطرات المطر
    rainRefs.current.forEach((drop, i) => {
      if (drop) {
        const phase = i * 0.4;
        const cycleT = ((t * 2 + phase) % 2) / 2;
        drop.position.y = 1.6 - cycleT * 2;
        drop.position.x = -0.5 + (i % 3) * 0.3;
        drop.position.z = -0.2 + (i % 2) * 0.4;
        (drop.material as THREE.MeshBasicMaterial).opacity = cycleT < 0.9 ? 0.7 : 0;
      }
    });
    // بخار الماء (التبخر)
    steamRefs.current.forEach((steam, i) => {
      if (steam) {
        const phase = i * 0.8;
        const cycleT = ((t * 0.6 + phase) % 3) / 3;
        steam.position.y = -0.3 + cycleT * 2.2;
        steam.position.x = 1.0 + Math.sin(t * 0.5 + phase) * 0.3;
        const s = 0.05 + cycleT * 0.15;
        steam.scale.setScalar(s);
        (steam.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - cycleT);
      }
    });
  });

  // شكل الجبل
  const mountainShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.5, -0.6);
    shape.lineTo(-1.5, -0.6);
    shape.lineTo(-0.8, 0.6);
    shape.lineTo(-0.3, 1.0);
    shape.lineTo(0.1, 0.7);
    shape.lineTo(0.5, 0.3);
    shape.lineTo(1.0, -0.6);
    shape.lineTo(2.5, -0.6);
    shape.lineTo(-2.5, -0.6);
    return shape;
  }, []);

  const Cloud = ({ position }: { position: [number, number, number] }) => (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.2, 0.05, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-0.15, 0.05, 0.1]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.05, 0.12, -0.05]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.85} />
      </mesh>
    </group>
  );

  return (
    <group ref={groupRef} scale={0.85} position={[0, -0.3, 0]}>
      {/* الشمس */}
      <mesh ref={sunRef} position={[2.0, 2.2, -1]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
      {/* أشعة الشمس */}
      <mesh position={[2.0, 2.2, -1]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* المحيط / الماء */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshPhysicalMaterial
          color="#0284c7"
          transmission={0.4}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.1}
          ior={1.33}
        />
      </mesh>

      {/* الجبل */}
      <mesh position={[-0.5, 0, -0.5]}>
        <extrudeGeometry args={[mountainShape, { depth: 1.5, bevelEnabled: false }]} />
        <meshStandardMaterial color="#57534e" roughness={0.85} />
      </mesh>
      {/* ثلج قمة الجبل */}
      <mesh position={[-0.8, 0.95, 0.2]}>
        <coneGeometry args={[0.3, 0.2, 8]} />
        <meshStandardMaterial color="#f0f9ff" roughness={0.3} />
      </mesh>

      {/* السحب */}
      {[[-0.5, 1.8, 0.2], [-1.2, 1.9, -0.3], [0.3, 2.0, 0.0]].map((pos, i) => (
        <group
          key={`cloud-${i}`}
          ref={(el) => { if (el) cloudRefs.current[i] = el; }}
        >
          <Cloud position={pos as [number, number, number]} />
        </group>
      ))}

      {/* قطرات المطر */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`rain-${i}`}
          ref={(el) => { if (el) rainRefs.current[i] = el; }}
          position={[0, 1.5, 0]}
          scale={[0.3, 1, 0.3]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* بخار الماء (سهام تبخر) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={`steam-${i}`}
          ref={(el) => { if (el) steamRefs.current[i] = el; }}
          position={[1, 0, 0]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* سهام توضيحية - دورة (أنابيب منحنية) */}
      {/* سهم التبخر ↑ */}
      <mesh position={[1.5, 0.8, 0.3]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      {/* سهم التكاثف → */}
      <mesh position={[-0.2, 2.1, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
      </mesh>
      {/* سهم الهطول ↓ */}
      <mesh position={[-0.5, 1.0, 0.3]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.08, 0.2, 8]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
