import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Center } from "@react-three/drei";
import * as THREE from "three";

/**
 * قلب ثلاثي الأبعاد — نسخة سيليكون طبي فاخر
 * يستخدم MeshPhysicalMaterial + إضاءة HDRI استوديو
 * نبض "Lub-Dub" واقعي مع ظلال ناعمة
 */
export function BeatingHeart3D() {
  const meshRef = useRef<THREE.Mesh>(null);

  const heartShape = useMemo(() => {
    const x = 0, y = 0;
    const shape = new THREE.Shape();
    shape.moveTo(x + 5, y + 5);
    shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 6,
    bevelEnabled: true,
    bevelSegments: 24,
    steps: 6,
    bevelSize: 1.5,
    bevelThickness: 1.5,
  }), []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.elapsedTime;
      const beat1 = Math.max(0, Math.sin(t * Math.PI * 2 * 1.15));
      const beat2 = Math.max(0, Math.sin(t * Math.PI * 2 * 1.15 + 1.1));
      const pulse = 1 + (beat1 * 0.12 + beat2 * 0.05);
      meshRef.current.scale.set(pulse, pulse, pulse);
      meshRef.current.rotation.y = Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <>
      <Environment preset="studio" />

      <Center>
        <group rotation={[Math.PI, 0, 0]} scale={[0.062, 0.062, 0.062]}>
          <mesh ref={meshRef} castShadow receiveShadow>
            <extrudeGeometry args={[heartShape, extrudeSettings]} />
            <meshPhysicalMaterial
              color="#ef152a"
              emissive="#3a040b"
              emissiveIntensity={0.5}
              roughness={0.08}
              metalness={0.05}
              transmission={0.4}
              thickness={3}
              ior={1.4}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              envMapIntensity={2.5}
            />
          </mesh>
        </group>
      </Center>

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.5}
        scale={6}
        blur={2.5}
        far={4}
      />
    </>
  );
}
