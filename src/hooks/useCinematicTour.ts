// src/hooks/useCinematicTour.ts
// Cinematic camera tour for MetaLearning 3D lessons
// Smoothly animates through 4 keyframe rotations for the model group

import { useRef, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 4 cinematic keyframe rotations for the model
const TOUR_KEYFRAMES: { rotation: [number, number, number]; label: string }[] = [
  { rotation: [0, 0, 0], label: "الواجهة الأمامية" },
  { rotation: [0, -Math.PI / 2, 0], label: "الجانب الأيمن" },
  { rotation: [Math.PI / 4, 0, 0], label: "المنظور العلوي" },
  { rotation: [Math.PI / 8, Math.PI / 4, 0], label: "الزاوية الإبداعية" },
];

const HOLD_DURATION  = 2.2; // seconds to hold at each keyframe
const TRAVEL_DURATION = 1.6; // seconds to move between keyframes

export type TourStatus = "idle" | "touring" | "paused";

export function useCinematicTour() {
  const [status, setStatus] = useState<TourStatus>("idle");
  const [frameLabel, setFrameLabel] = useState("");
  const groupRotation = useRef(new THREE.Euler(0, 0, 0));

  // Internal state stored in refs to avoid re-renders inside useFrame
  const tourRef = useRef({
    active:    false,
    frame:     0,
    elapsed:   0,
    phase:     "hold" as "travel" | "hold",
    fromRot:   new THREE.Vector3(),
    toRot:     new THREE.Vector3(),
  });

  const startTour = useCallback(() => {
    const r = tourRef.current;
    r.active  = true;
    r.frame   = 0;
    r.elapsed = 0;
    r.phase   = "travel";
    
    // Capture current rotation
    r.fromRot.set(groupRotation.current.x, groupRotation.current.y, groupRotation.current.z);
    const kf = TOUR_KEYFRAMES[0];
    r.toRot.set(...kf.rotation);
    
    setStatus("touring");
    setFrameLabel(kf.label);
  }, []);

  const stopTour = useCallback(() => {
    tourRef.current.active = false;
    setStatus("idle");
    setFrameLabel("");
    // smoothly return to 0? Or just leave it. Leaving it is fine.
  }, []);

  const toggleTour = useCallback(() => {
    if (tourRef.current.active) stopTour();
    else startTour();
  }, [startTour, stopTour]);

  // Runs every frame
  useFrame((_, delta) => {
    const r = tourRef.current;
    if (!r.active) return;

    r.elapsed += delta;
    const duration = r.phase === "travel" ? TRAVEL_DURATION : HOLD_DURATION;

    if (r.elapsed >= duration) {
      // Snap to target exactly at the end of the phase
      groupRotation.current.set(r.toRot.x, r.toRot.y, r.toRot.z);
      r.elapsed = 0;

      if (r.phase === "travel") {
        r.phase = "hold";
      } else {
        // Advance to next keyframe
        r.frame = (r.frame + 1) % TOUR_KEYFRAMES.length;
        const kf = TOUR_KEYFRAMES[r.frame];
        r.fromRot.set(groupRotation.current.x, groupRotation.current.y, groupRotation.current.z);
        r.toRot.set(...kf.rotation);
        r.phase = "travel";
        setFrameLabel(kf.label);
      }
      return;
    }

    // Smooth easing (easeInOutCubic)
    const t = r.elapsed / duration;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (r.phase === "travel") {
      const current = new THREE.Vector3().lerpVectors(r.fromRot, r.toRot, ease);
      groupRotation.current.set(current.x, current.y, current.z);
    }
  });

  return { status, frameLabel, toggleTour, stopTour, tourRotation: groupRotation.current };
}
