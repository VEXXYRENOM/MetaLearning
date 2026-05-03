// src/hooks/useCinematicTour.ts
// Cinematic camera tour for MetaLearning 3D lessons
// Smoothly animates through 4 keyframe positions around the model

import { useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// 4 cinematic keyframe positions around the model
const TOUR_KEYFRAMES: { position: [number, number, number]; target: [number, number, number]; label: string }[] = [
  { position: [0, 0.35, 4.1],   target: [0, 0.1, 0], label: "الواجهة الأمامية"  },
  { position: [4.1, 1.2, 0],   target: [0, 0.1, 0], label: "الجانب الأيمن"     },
  { position: [0, 3.5, 1.2],   target: [0, 0,   0], label: "المنظور العلوي"    },
  { position: [-3.5, 0.8, 2.5], target: [0, 0.1, 0], label: "الزاوية الإبداعية" },
];

const HOLD_DURATION  = 2.2; // seconds to hold at each keyframe
const TRAVEL_DURATION = 1.6; // seconds to move between keyframes

export type TourStatus = "idle" | "touring" | "paused";

export function useCinematicTour() {
  const { camera } = useThree();
  const [status, setStatus]     = useState<TourStatus>("idle");
  const [frameLabel, setFrameLabel] = useState("");

  // Internal state stored in refs to avoid re-renders inside useFrame
  const tourRef = useRef({
    active:    false,
    frame:     0,
    elapsed:   0,
    phase:     "hold" as "travel" | "hold",
    fromPos:   new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toPos:     new THREE.Vector3(),
    toTarget:  new THREE.Vector3(),
    currentTarget: new THREE.Vector3(0, 0.1, 0),
  });

  const startTour = useCallback(() => {
    const r = tourRef.current;
    r.active  = true;
    r.frame   = 0;
    r.elapsed = 0;
    r.phase   = "travel";
    // Capture current camera pos as starting point
    r.fromPos.copy(camera.position);
    r.fromTarget.copy(r.currentTarget);
    const kf = TOUR_KEYFRAMES[0];
    r.toPos.set(...kf.position);
    r.toTarget.set(...kf.target);
    setStatus("touring");
    setFrameLabel(kf.label);
  }, [camera]);

  const stopTour = useCallback(() => {
    tourRef.current.active = false;
    setStatus("idle");
    setFrameLabel("");
  }, []);

  const toggleTour = useCallback(() => {
    if (tourRef.current.active) stopTour();
    else startTour();
  }, [startTour, stopTour]);

  // Runs every frame — drives the camera smoothly
  useFrame((_, delta) => {
    const r = tourRef.current;
    if (!r.active) return;

    r.elapsed += delta;
    const duration = r.phase === "travel" ? TRAVEL_DURATION : HOLD_DURATION;

    if (r.elapsed >= duration) {
      // Snap to target exactly at the end of the phase
      camera.position.copy(r.toPos);
      r.currentTarget.copy(r.toTarget);
      camera.lookAt(r.currentTarget);

      r.elapsed = 0;

      if (r.phase === "travel") {
        // Now hold at this keyframe
        r.phase = "hold";
      } else {
        // Advance to next keyframe
        r.frame = (r.frame + 1) % TOUR_KEYFRAMES.length;
        const kf = TOUR_KEYFRAMES[r.frame];
        r.fromPos.copy(camera.position);
        r.fromTarget.copy(r.currentTarget);
        r.toPos.set(...kf.position);
        r.toTarget.set(...kf.target);
        r.phase = "travel";
        setFrameLabel(kf.label);
      }
      return;
    }

    // Smooth easing (easeInOutCubic)
    const t = r.elapsed / duration;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (r.phase === "travel") {
      camera.position.lerpVectors(r.fromPos, r.toPos, ease);
      r.currentTarget.lerpVectors(r.fromTarget, r.toTarget, ease);
      camera.lookAt(r.currentTarget);
    }
  });

  return { status, frameLabel, toggleTour, stopTour };
}
