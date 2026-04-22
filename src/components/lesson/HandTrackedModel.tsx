import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { HandData } from "../../hooks/useMediaPipe";

interface HandTrackedModelProps {
  handData: HandData | null;
  baseScale?: number;
  children: React.ReactNode;
}

export function HandTrackedModel({
  handData,
  baseScale = 1,
  children,
}: HandTrackedModelProps) {
  const groupRef = useRef<Group>(null);
  const { viewport } = useThree();

  // Track the current actual scale, animated smoothly
  const currentScale = useRef(baseScale);

  // Smoothly update position and scale
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (handData) {
      // The video is mirrored (scaleX(-1)), so we flip X: x=0 becomes right (positive), x=1 becomes left (negative)
      const targetX = (0.5 - handData.palmPosition.x) * viewport.width;
      // Y is top (0) to bottom (1). ThreeJS is top (+height/2) to bottom (-height/2)
      const targetY = (0.5 - handData.palmPosition.y) * viewport.height;
      
      // We can use z to bring it forward/backward
      const targetZ = -handData.palmPosition.z * 5 + 1;

      // Smooth interpolation for position
      groupRef.current.position.lerp(
        { x: targetX, y: targetY, z: targetZ },
        10 * delta
      );

      // Handle simple pinch-to-zoom logic
      let targetDynamicScale = baseScale;
      
      if (handData.pinchDistance > 0.05) {
        const spreadMultiplier = 1 + (handData.pinchDistance - 0.08) * 3;
        targetDynamicScale = baseScale * Math.max(0.5, spreadMultiplier);
      }

      currentScale.current += (targetDynamicScale - currentScale.current) * 8 * delta;

      // --- Raycasting Simulation with Index Finger ---
      // Map index finger tip to Normalized Device Coordinates (-1 to +1)
      const px = (0.5 - handData.indexFingerTip.x) * 2;
      const py = (0.5 - handData.indexFingerTip.y) * 2;
      
      // Override the global pointer so R3F's own event system triggers onPointerOver/Out/etc.
      state.pointer.set(px, py);
      state.raycaster.setFromCamera(state.pointer, state.camera);

    } else {
      // Return to center if no hand detected
      groupRef.current.position.lerp(
        { x: 0, y: 0.1, z: 0 },
        5 * delta
      );
      currentScale.current += (baseScale - currentScale.current) * 5 * delta;
    }

    // Apply scale smoothly
    groupRef.current.scale.set(
      currentScale.current,
      currentScale.current,
      currentScale.current
    );
  });

  return <group ref={groupRef}>{children}</group>;
}
