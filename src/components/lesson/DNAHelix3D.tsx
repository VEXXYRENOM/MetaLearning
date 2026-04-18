import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/**
 * الحمض النووي DNA — نسخة هولوغرام مختبر متقدم
 * أعمدة فقرية كريستالية + قواعد نيتروجينية لامعة + إضاءة HDRI
 */
export function DNAHelix3D() {
  const groupRef = useRef<THREE.Group>(null);

  const baseColors = {
    A: "#ef4444",
    T: "#3b82f6",
    G: "#22c55e",
    C: "#f59e0b",
  };

  const basePairs: Array<["A" | "T" | "G" | "C", "A" | "T" | "G" | "C"]> = [
    ["A", "T"], ["G", "C"], ["T", "A"], ["C", "G"],
    ["A", "T"], ["G", "C"], ["A", "T"], ["T", "A"],
    ["G", "C"], ["C", "G"], ["A", "T"], ["G", "C"],
    ["T", "A"], ["C", "G"], ["A", "T"], ["G", "C"],
  ];

  const helixData = useMemo(() => {
    const points1: THREE.Vector3[] = [];
    const points2: THREE.Vector3[] = [];
    const numSteps = basePairs.length;
    const radius = 0.7;
    const heightPerStep = 0.28;
    const totalHeight = numSteps * heightPerStep;
    const offset = totalHeight / 2;

    for (let i = 0; i <= numSteps; i++) {
      const angle = (i / numSteps) * Math.PI * 4;
      const y = i * heightPerStep - offset;
      points1.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));
      points2.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius));
    }
    return { points1, points2, numSteps, radius, heightPerStep, offset };
  }, []);

  const curve1 = useMemo(() => new THREE.CatmullRomCurve3(helixData.points1), [helixData]);
  const curve2 = useMemo(() => new THREE.CatmullRomCurve3(helixData.points2), [helixData]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <>
      <Environment preset="studio" />

      <group ref={groupRef} scale={1.0}>
        {/* ═══ العمود الفقري 1 (كريستال بنفسجي) ═══ */}
        <mesh>
          <tubeGeometry args={[curve1, 128, 0.07, 12, false]} />
          <meshPhysicalMaterial
            color="#a78bfa"
            emissive="#7c3aed"
            emissiveIntensity={0.6}
            roughness={0.08}
            metalness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* ═══ العمود الفقري 2 (كريستال سماوي) ═══ */}
        <mesh>
          <tubeGeometry args={[curve2, 128, 0.07, 12, false]} />
          <meshPhysicalMaterial
            color="#67e8f9"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
            roughness={0.08}
            metalness={0.35}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* ═══ القواعد النيتروجينية (كبسولات لامعة) ═══ */}
        {basePairs.map((pair, i) => {
          const angle = (i / helixData.numSteps) * Math.PI * 4;
          const y = i * helixData.heightPerStep - helixData.offset;
          const x1 = Math.cos(angle) * helixData.radius;
          const z1 = Math.sin(angle) * helixData.radius;
          const x2 = Math.cos(angle + Math.PI) * helixData.radius;
          const z2 = Math.sin(angle + Math.PI) * helixData.radius;

          const midX = (x1 + x2) / 2;
          const midZ = (z1 + z2) / 2;
          const dx = x2 - x1;
          const dz = z2 - z1;
          const length = Math.sqrt(dx * dx + dz * dz);
          const rot = Math.atan2(dz, dx);

          return (
            <group key={i}>
              {/* القاعدة اليسرى */}
              <mesh
                position={[x1 + (x2 - x1) * 0.25, y, z1 + (z2 - z1) * 0.25]}
                rotation={[0, -rot, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.045, 0.045, length * 0.45, 8]} />
                <meshPhysicalMaterial
                  color={baseColors[pair[0]]}
                  emissive={baseColors[pair[0]]}
                  emissiveIntensity={0.7}
                  roughness={0.1}
                  metalness={0.2}
                  clearcoat={0.8}
                  clearcoatRoughness={0.1}
                  envMapIntensity={2}
                />
              </mesh>
              {/* القاعدة اليمنى */}
              <mesh
                position={[x1 + (x2 - x1) * 0.75, y, z1 + (z2 - z1) * 0.75]}
                rotation={[0, -rot, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.045, 0.045, length * 0.45, 8]} />
                <meshPhysicalMaterial
                  color={baseColors[pair[1]]}
                  emissive={baseColors[pair[1]]}
                  emissiveIntensity={0.7}
                  roughness={0.1}
                  metalness={0.2}
                  clearcoat={0.8}
                  clearcoatRoughness={0.1}
                  envMapIntensity={2}
                />
              </mesh>
              {/* رابطة هيدروجينية (لؤلؤة مضيئة) */}
              <mesh position={[midX, y, midZ]}>
                <sphereGeometry args={[0.04, 12, 12]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  emissive="#ffffff"
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.7}
                  roughness={0.02}
                  clearcoat={1}
                  envMapIntensity={3}
                  toneMapped={false}
                />
              </mesh>
            </group>
          );
        })}

        {/* إضاءة داخلية */}
        <pointLight position={[0, 0, 0]} intensity={0.3} color="#7c3aed" distance={4} />
      </group>

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}
