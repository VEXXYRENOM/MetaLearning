import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * الخلية النباتية ثلاثية الأبعاد
 * تعرض: الجدار الخلوي (مربع)، الغشاء، النواة، البلاستيدات الخضراء، الفجوة المركزية
 */
export function PlantCell3D() {
  const groupRef = useRef<THREE.Group>(null);
  const vacuoleRef = useRef<THREE.Mesh>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const chloroplastRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
    }
    // نبض الفجوة المركزية
    if (vacuoleRef.current) {
      const p = 1 + Math.sin(t * 0.5) * 0.04;
      vacuoleRef.current.scale.set(p, p * 0.9, p);
    }
    // دوران النواة
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = t * 0.3;
    }
    // حركة البلاستيدات
    chloroplastRefs.current.forEach((c, i) => {
      if (c) {
        const phase = i * 1.2;
        c.rotation.z = Math.sin(t * 0.5 + phase) * 0.3;
        c.position.y += Math.sin(t * 0.3 + phase) * 0.001;
      }
    });
  });

  return (
    <group ref={groupRef} scale={1.1}>
      {/* الجدار الخلوي (شكل مستطيل - مميز للخلية النباتية) */}
      <mesh>
        <boxGeometry args={[2.8, 2.2, 2.2]} />
        <meshPhysicalMaterial
          color="#84cc16"
          transmission={0.6}
          transparent
          opacity={0.2}
          roughness={0.3}
          thickness={0.3}
          ior={1.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* حواف الجدار */}
      <mesh>
        <boxGeometry args={[2.8, 2.2, 2.2]} />
        <meshBasicMaterial color="#65a30d" wireframe transparent opacity={0.3} />
      </mesh>

      {/* الغشاء الخلوي (داخل الجدار) */}
      <mesh>
        <boxGeometry args={[2.6, 2.0, 2.0]} />
        <meshPhysicalMaterial
          color="#a3e635"
          transmission={0.7}
          transparent
          opacity={0.15}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* الفجوة المركزية (كبيرة - مميزة للخلية النباتية) */}
      <mesh ref={vacuoleRef} position={[0.1, 0, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          transmission={0.8}
          transparent
          opacity={0.3}
          roughness={0}
          thickness={1}
          ior={1.33}
        />
      </mesh>

      {/* النواة */}
      <mesh ref={nucleusRef} position={[-0.6, 0.3, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color="#7c3aed"
          emissive="#6d28d9"
          emissiveIntensity={0.6}
          roughness={0.2}
          clearcoat={1}
        />
      </mesh>
      {/* النوية */}
      <mesh position={[-0.55, 0.35, 0.1]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={1} />
      </mesh>

      {/* البلاستيدات الخضراء (Chloroplasts) - أقراص خضراء */}
      {[
        [0.7, 0.6, 0.5],
        [-0.3, -0.5, 0.7],
        [0.5, -0.3, -0.6],
        [-0.8, -0.4, -0.3],
        [0.9, 0.1, -0.4],
        [-0.4, 0.7, -0.5],
        [0.3, -0.7, 0.3],
        [-0.7, 0.1, 0.6],
      ].map((pos, i) => (
        <mesh
          key={`chloro-${i}`}
          ref={(el) => { if (el) chloroplastRefs.current[i] = el; }}
          position={pos as [number, number, number]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
          scale={[1, 0.35, 0.7]}
        >
          <capsuleGeometry args={[0.08, 0.12, 8, 12]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#16a34a"
            emissiveIntensity={0.5}
            roughness={0.4}
          />
        </mesh>
      ))}

      {/* الشبكة الإندوبلازمية */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`er-${i}`}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 0.5 - 0.6,
            (i - 1.5) * 0.15 + 0.3,
            Math.sin((i / 4) * Math.PI * 2) * 0.5,
          ]}
          rotation={[(i * Math.PI) / 4, 0, 0]}
        >
          <torusGeometry args={[0.12, 0.015, 8, 24]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* الميتوكوندريا */}
      {[
        [0.9, -0.6, 0],
        [-0.9, -0.2, 0.5],
      ].map((pos, i) => (
        <mesh
          key={`mito-${i}`}
          position={pos as [number, number, number]}
          scale={[1, 0.4, 0.4]}
          rotation={[0, 0, i * 0.8]}
        >
          <capsuleGeometry args={[0.08, 0.2, 12, 12]} />
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}
