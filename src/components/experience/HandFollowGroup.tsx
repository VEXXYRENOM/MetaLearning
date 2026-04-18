import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { ReactNode } from "react";
import type { Group } from "three";
import { Vector3 } from "three";
import type { HandLandmark2D } from "../../hooks/useMediaPipeHands";

type Props = {
  palm: HandLandmark2D | null;
  mirror?: boolean;
  children: ReactNode;
};

const _unproj = new Vector3();
const _dir = new Vector3();

/**
 * يضع النموذج أمام الكاميرا على امتداد شعاع يمر بإحداثيات اليد المعيّنة.
 */
export function HandFollowGroup({
  palm,
  mirror = true,
  children,
}: Props) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    if (!palm) {
      g.visible = false;
      return;
    }
    g.visible = true;

    const x = mirror ? 1 - palm.x : palm.x;
    const ndcX = x * 2 - 1;
    const ndcY = -(palm.y * 2 - 1);

    const dist = 2.6;
    _unproj.set(ndcX, ndcY, 0.5);
    _unproj.unproject(camera);
    _dir.copy(_unproj).sub(camera.position).normalize();
    const pos = camera.position.clone().add(_dir.multiplyScalar(dist));
    g.position.copy(pos);
    g.lookAt(camera.position);
  });

  return <group ref={groupRef}>{children}</group>;
}
