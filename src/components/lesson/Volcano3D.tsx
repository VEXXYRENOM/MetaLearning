import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * بركان ثلاثي الأبعاد مع حمم بركانية
 * يعرض: جسم البركان، فوهة، حمم متدفقة، دخان
 */
export function Volcano3D() {
  const groupRef = useRef<THREE.Group>(null);
  const lavaRef = useRef<THREE.Mesh>(null);
  const smokeRefs = useRef<THREE.Mesh[]>([]);
  const particleRefs = useRef<THREE.Mesh[]>([]);

  // شكل البركان باستخدام LatheGeometry
  const volcanoShape = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    // قاعدة عريضة تتضيق نحو الأعلى
    pts.push(new THREE.Vector2(0, 0));
    pts.push(new THREE.Vector2(2.0, 0));
    pts.push(new THREE.Vector2(1.8, 0.3));
    pts.push(new THREE.Vector2(1.5, 0.6));
    pts.push(new THREE.Vector2(1.2, 0.9));
    pts.push(new THREE.Vector2(0.9, 1.2));
    pts.push(new THREE.Vector2(0.6, 1.5));
    pts.push(new THREE.Vector2(0.5, 1.65));
    pts.push(new THREE.Vector2(0.45, 1.75)); // حافة الفوهة
    pts.push(new THREE.Vector2(0.5, 1.7)); // داخل الفوهة (lip)
    pts.push(new THREE.Vector2(0.35, 1.5)); // قاع الفوهة
    pts.push(new THREE.Vector2(0, 1.5));
    return pts;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.1;
    }
    // حركة الحمم
    if (lavaRef.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.15;
      lavaRef.current.scale.set(s, 1 + Math.sin(t * 2) * 0.3, s);
      lavaRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.1;
    }
    // حركة الدخان
    smokeRefs.current.forEach((smoke, i) => {
      if (smoke) {
        const speed = 0.4 + i * 0.1;
        const phase = i * 1.5;
        const cycleT = ((t * speed + phase) % 4) / 4;
        smoke.position.y = 1.8 + cycleT * 3;
        smoke.position.x = Math.sin(t * 0.5 + phase) * cycleT * 0.5;
        smoke.position.z = Math.cos(t * 0.4 + phase) * cycleT * 0.4;
        const scale = 0.1 + cycleT * 0.8;
        smoke.scale.setScalar(scale);
        (smoke.material as THREE.MeshBasicMaterial).opacity = 0.3 * (1 - cycleT);
      }
    });
    // جسيمات الحمم المتطايرة
    particleRefs.current.forEach((p, i) => {
      if (p) {
        const phase = i * 0.8;
        const cycleT = ((t * 1.2 + phase) % 2.5) / 2.5;
        const angle = (i / 6) * Math.PI * 2;
        p.position.y = 1.8 + cycleT * 2 - cycleT * cycleT * 1.5;
        p.position.x = Math.sin(angle) * cycleT * 0.8;
        p.position.z = Math.cos(angle) * cycleT * 0.8;
        (p.material as THREE.MeshBasicMaterial).opacity = 1 - cycleT;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={0.9}>
      {/* جسم البركان */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[volcanoShape, 48]} />
        <meshStandardMaterial
          color="#57534e"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* تفاصيل سطح البركان (طبقة أغمق) */}
      <mesh scale={[0.99, 0.99, 0.99]}>
        <latheGeometry args={[volcanoShape, 48]} />
        <meshStandardMaterial
          color="#292524"
          roughness={1}
          metalness={0}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* الحمم داخل الفوهة */}
      <mesh ref={lavaRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#f97316"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* توهج حول الفوهة */}
      <mesh position={[0, 1.7, 0]}>
        <ringGeometry args={[0.3, 0.55, 32]} />
        <meshBasicMaterial
          color="#f97316"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* سيول الحمم (خطوط على جانب البركان) */}
      {[0, 1.2, 2.5, 4.0].map((rot, i) => (
        <mesh
          key={`lava-flow-${i}`}
          position={[
            Math.sin(rot) * 0.45,
            1.2 - i * 0.15,
            Math.cos(rot) * 0.45,
          ]}
          rotation={[0.3 + i * 0.1, rot, 0]}
          scale={[0.08, 0.5 + i * 0.2, 0.08]}
        >
          <cylinderGeometry args={[0.5, 1, 1, 8]} />
          <meshStandardMaterial
            color="#dc2626"
            emissive="#f97316"
            emissiveIntensity={1.5}
            transparent
            opacity={0.7 - i * 0.1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* الدخان */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={`smoke-${i}`}
          ref={(el) => { if (el) smokeRefs.current[i] = el; }}
          position={[0, 2, 0]}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#78716c" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* جسيمات حمم متطايرة */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={`particle-${i}`}
          ref={(el) => { if (el) particleRefs.current[i] = el; }}
          position={[0, 2, 0]}
        >
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={1} />
        </mesh>
      ))}

      {/* الأرضية */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#365314" roughness={1} />
      </mesh>
    </group>
  );
}
