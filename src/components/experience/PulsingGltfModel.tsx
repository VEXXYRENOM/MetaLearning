import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import type { Group } from "three";

type Props = {
  url: string;
  /** مقياس عالمي تقريبي */
  modelScale: number;
  /** نبضة «حيوية» مناسبة للأعضاء / النماذج الحيوية */
  pulse: boolean;
};

export function PulsingGltfModel({ url, modelScale, pulse }: Props) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const base = modelScale;
    const beat = pulse
      ? 1 + Math.sin(clock.elapsedTime * Math.PI * 2 * 1.1) * 0.045
      : 1;
    g.scale.setScalar(base * beat);
  });

  return (
    <Center>
      <group ref={groupRef}>
        <primitive object={clone} />
      </group>
    </Center>
  );
}
