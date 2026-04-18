import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

type Props = {
  enabled: boolean;
  speed?: number;
  children: ReactNode;
};

export function RotatingGroup({ enabled, speed = 0.35, children }: Props) {
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current && enabled) {
      ref.current.rotation.y += delta * speed;
    }
  });

  return <group ref={ref}>{children}</group>;
}
