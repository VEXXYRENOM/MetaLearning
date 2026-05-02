import { useMemo, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import { Mesh, MeshStandardMaterial } from "three";

type Props = {
  url: string;
  modelScale: number;
  selectedName: string | null;
  onSelectName: (name: string | null) => void;
  xrayMode?: boolean;
};

function setMeshHighlight(mesh: Mesh, selected: boolean, xrayMode: boolean) {
  const mats = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];
  for (const mat of mats) {
    if (mat.isMaterial) {
      // standard or standard-like materials
      if ("emissive" in mat && "emissiveIntensity" in mat) {
        (mat as MeshStandardMaterial).emissive.set(selected ? "#1a4a7a" : "#000000");
        (mat as MeshStandardMaterial).emissiveIntensity = selected ? 0.45 : 0;
      }
      mat.transparent = true;
      mat.opacity = xrayMode && !selected ? 0.25 : 1.0;
    }
  }
}

export function GltfScene({
  url,
  modelScale,
  selectedName,
  onSelectName,
  xrayMode = false,
}: Props) {
  const { scene } = useGLTF(url, "https://www.gstatic.com/draco/versioned/decoders/1.5.5/");
  const clone = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    clone.traverse((child) => {
      if (child instanceof Mesh) {
        const sel = Boolean(selectedName && child.name === selectedName);
        setMeshHighlight(child, sel, xrayMode);
      }
    });
  }, [clone, selectedName, xrayMode]);

  return (
    <Center>
      <group scale={[modelScale, modelScale, modelScale]}>
        <primitive
          object={clone}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            const o = e.object;
            const label = o.name?.trim() || "جزء بدون اسم";
            onSelectName(label);
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            if (e.object instanceof Mesh) {
              document.body.style.cursor = "pointer";
              const label = e.object.name?.trim() || "جزء بدون اسم";
              onSelectName(label);
            }
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        />
      </group>
    </Center>
  );
}
