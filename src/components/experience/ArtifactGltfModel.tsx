import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, useGLTF, Environment, ContactShadows, Float, Bounds } from "@react-three/drei";
import type { Group } from "three";

type Props = {
  url: string;
  modelScale?: number;
};

export function ArtifactGltfModel({ url, modelScale = 1 }: Props) {
  const { scene } = useGLTF(url, "https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
  const clone = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Rotation lente pour effet musée
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <>
      {/* إضاءة محيطية واقعية (HDRI) لتعزيز خامات PBR كالمعادن والخشب */}
      <Environment preset="studio" />
      
      <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
        <Center bottom>
          <group ref={groupRef} scale={modelScale}>
            <primitive object={clone} />
          </group>
        </Center>
      </Float>

      {/* ظلال التلامس الناعمة أسفل القطعة الأثرية */}
      <ContactShadows 
        position={[0, 0, 0]} 
        opacity={0.6} 
        scale={20} 
        blur={2} 
        far={4} 
        resolution={512}
        frames={1}
        color="#000000" 
      />
    </>
  );
}

// تحميل مسبق للنموذج لتجنب التقطيع مع تفعيل Draco
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.5/";
useGLTF.preload("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb", DRACO_PATH);
useGLTF.preload("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AntiqueCamera/glTF-Binary/AntiqueCamera.glb", DRACO_PATH);
