// src/components/lesson/ExplodedView.tsx
// Exploded View for MetaLearning 3D Lessons
// Smoothly animates all direct children of a GLTF model outward from the center

import { useRef, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ExplodedViewProps {
  children: React.ReactNode;
  exploded: boolean;       // controlled by parent (toggle button)
  strength?: number;       // how far apart pieces fly (default 1.5)
  speed?: number;          // animation speed (default 4)
}

interface PartData {
  object: THREE.Object3D;
  originalPos: THREE.Vector3;
  explodedPos: THREE.Vector3;
}

export function ExplodedView({
  children,
  exploded,
  strength = 1.5,
  speed = 4,
}: ExplodedViewProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const partsRef = useRef<PartData[]>([]);
  const initializedRef = useRef(false);

  // After the model loads, capture all direct children's original positions
  // and compute their "exploded" positions (outward from centroid)
  const initParts = useCallback(() => {
    const group = groupRef.current;
    if (!group || initializedRef.current) return;

    // Gather all mesh-level children (skip empty groups)
    const parts: PartData[] = [];
    const centroid = new THREE.Vector3();
    const childCount = group.children.length;

    // Compute centroid of all children world positions
    group.children.forEach((child) => {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      centroid.add(worldPos);
    });
    if (childCount > 0) centroid.divideScalar(childCount);

    group.children.forEach((child) => {
      const originalPos = child.position.clone();

      // Direction = from centroid to child (in local space)
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);

      let dir = worldPos.clone().sub(centroid).normalize();

      // If child is at the centroid, pick a random outward direction
      if (dir.length() < 0.01) {
        dir = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();
      }

      // Exploded position = original + direction * strength
      const explodedPos = originalPos.clone().add(dir.multiplyScalar(strength));

      parts.push({ object: child, originalPos, explodedPos });
    });

    // If the model has only 1 child (common in GLB), go one level deeper
    if (parts.length === 1 && group.children[0].children.length > 1) {
      parts.length = 0; // clear
      const subGroup = group.children[0];
      const subCentroid = new THREE.Vector3();
      subGroup.children.forEach((c) => {
        const wp = new THREE.Vector3();
        c.getWorldPosition(wp);
        subCentroid.add(wp);
      });
      if (subGroup.children.length > 0) {
        subCentroid.divideScalar(subGroup.children.length);
      }

      subGroup.children.forEach((child) => {
        const originalPos = child.position.clone();
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);

        let dir = worldPos.clone().sub(subCentroid).normalize();
        if (dir.length() < 0.01) {
          dir = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();
        }
        const explodedPos = originalPos.clone().add(dir.multiplyScalar(strength));
        parts.push({ object: child, originalPos, explodedPos });
      });
    }

    partsRef.current = parts;
    initializedRef.current = true;
  }, [strength]);

  // Re-initialize when model changes (new GLB loaded)
  useEffect(() => {
    initializedRef.current = false;
    partsRef.current = [];
  }, [children]);

  // Animate every frame
  useFrame((_, delta) => {
    // Try to initialize if not yet done (model may not be loaded on first frame)
    if (!initializedRef.current) {
      initParts();
      return;
    }

    const lerpFactor = Math.min(1, speed * delta);

    partsRef.current.forEach(({ object, originalPos, explodedPos }) => {
      const target = exploded ? explodedPos : originalPos;
      object.position.lerp(target, lerpFactor);
    });
  });

  return <group ref={groupRef}>{children}</group>;
}
