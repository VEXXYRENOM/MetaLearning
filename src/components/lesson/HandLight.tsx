import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PointLight } from "three";

interface HandLightProps {
  x: number;
  y: number;
}

/** نقطة ضوء ترافق يد المستخدم وتُلقي ظلالاً دافئة على المجسم */
export function HandLight({ x, y }: HandLightProps) {
  const lightRef = useRef<PointLight>(null);

  useFrame(({ viewport }) => {
    if (!lightRef.current) return;
    const tx = (0.5 - x) * viewport.width;
    const ty = (0.5 - y) * viewport.height;
    lightRef.current.position.set(tx, ty, 2.5);
  });

  return (
    <pointLight
      ref={lightRef}
      color="#ff7755"
      intensity={3.5}
      distance={8}
      decay={2}
      castShadow
    />
  );
}
