import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import type { Results, Landmark } from "@mediapipe/hands";

/** 
 * التردد الموصى به لمعالجة إطارات اليد (15 FPS) 
 * لتحرير المعالج لعمليات Three.js والرسم ثلاثي الأبعاد.
 */
const HAND_PROCESS_FPS = 15;
const HAND_FRAME_INTERVAL_MS = 1000 / HAND_PROCESS_FPS;

const HANDS_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240";

export interface HandLandmark2D { x: number; y: number }

export interface HandData {
  landmarks: Landmark[];
  palmPosition: { x: number; y: number; z: number };
  pinchDistance: number;
  indexFingerTip: { x: number; y: number; z: number };
  isPinching: boolean;
  zoomFactor: number;
  rotationAngle: { x: number; y: number };
}

/**
 * Hook موحد للتعامل مع MediaPipe Hands.
 * يدعم كلا من التحميل التلقائي (مثل useMediaPipeHands سابقاً) 
 * والتحكم اليدوي (مثل useHandTracking سابقاً).
 */
export function useMediaPipe(config: {
  enabled?: boolean;
  videoRef?: RefObject<HTMLVideoElement>;
  modelComplexity?: 0 | 1;
} = {}) {
  const { enabled = true, videoRef: externalVideoRef, modelComplexity = 0 } = config;

  const [internalVideoEl, setInternalVideoEl] = useState<HTMLVideoElement | null>(null);
  const [handData, setHandData] = useState<HandData | null>(null);
  const [palm, setPalm] = useState<HandLandmark2D | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const lastProcessedAt = useRef(0);

  // States for gesture tracking
  const pinchState = useRef({ isPinching: false, baseDistance: 0, baseZoom: 1 });
  const rotationState = useRef({ prevX: 0, prevY: 0, angleX: 0, angleY: 0, isGrabbed: false });

  // Callback ref for components that don't pass their own RefObject
  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    setInternalVideoEl(node);
  }, []);

  const videoElement = externalVideoRef?.current || internalVideoEl;

  const onResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Calculate palm position (midpoint of wrist and middle finger MCP)
      const wrist = landmarks[0];
      const middleMCP = landmarks[9];
      const palmPosition = {
        x: (wrist.x + middleMCP.x) / 2,
        y: (wrist.y + middleMCP.y) / 2,
        z: (wrist.z + middleMCP.z) / 2,
      };

      // Simple 2D palm for backward compatibility
      setPalm({ x: palmPosition.x, y: palmPosition.y });

      // Calculate pinch
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const dz = thumbTip.z - indexTip.z;
      const pinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const isCurrentlyPinching = pinchDistance < 0.05;

      // Zoom calculation
      let currentZoom = pinchState.current.baseZoom;
      if (isCurrentlyPinching) {
        if (!pinchState.current.isPinching) {
          pinchState.current.isPinching = true;
          pinchState.current.baseDistance = pinchDistance;
        } else {
          const ratio = (pinchState.current.baseDistance - pinchDistance) * 10;
          currentZoom = Math.max(0.2, currentZoom - ratio);
          pinchState.current.baseDistance = pinchDistance;
        }
      } else {
        pinchState.current.isPinching = false;
      }
      pinchState.current.baseZoom = currentZoom;

      // Rotation calculation (Grab gesture)
      const middleTip = landmarks[12];
      const fingerLength = Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2));
      const isGrabbed = fingerLength < 0.15;

      if (isGrabbed) {
        if (!rotationState.current.isGrabbed) {
          rotationState.current.isGrabbed = true;
          rotationState.current.prevX = palmPosition.x;
          rotationState.current.prevY = palmPosition.y;
        } else {
          const deltaX = palmPosition.x - rotationState.current.prevX;
          const deltaY = palmPosition.y - rotationState.current.prevY;
          rotationState.current.angleY += deltaX * Math.PI * 1.5;
          rotationState.current.angleX += deltaY * Math.PI * 1.5;
          rotationState.current.prevX = palmPosition.x;
          rotationState.current.prevY = palmPosition.y;
        }
      } else {
        rotationState.current.isGrabbed = false;
      }

      setHandData({
        landmarks,
        palmPosition,
        pinchDistance,
        indexFingerTip: { x: indexTip.x, y: indexTip.y, z: indexTip.z },
        isPinching: isCurrentlyPinching,
        zoomFactor: currentZoom,
        rotationAngle: { x: rotationState.current.angleX, y: rotationState.current.angleY }
      });
    } else {
      setHandData(null);
      setPalm(null);
    }
  }, []);

  const stopTracking = useCallback(() => {
    setIsActive(false);
    setIsLoading(false);

    // 1. Stop MediaPipe Camera processor
    if (cameraRef.current) {
      try { cameraRef.current.stop(); } catch (_) {}
      cameraRef.current = null;
    }

    // 2. Stop MediaPipe Hands model
    if (handsRef.current) {
      try { handsRef.current.close(); } catch (_) {}
      handsRef.current = null;
    }

    // 3. Stop getUserMedia stream (turns off the green light)
    const videoEl = externalVideoRef?.current || internalVideoEl;
    if (videoEl?.srcObject) {
      try {
        (videoEl.srcObject as MediaStream)
          .getTracks()
          .forEach(track => track.stop());
      } catch (_) {}
      videoEl.srcObject = null;
    }

    // 4. Reset states
    setHandData(null);
    setPalm(null);
    pinchState.current  = { isPinching: false, baseDistance: 0, baseZoom: 1 };
    rotationState.current = { prevX: 0, prevY: 0, angleX: 0, angleY: 0, isGrabbed: false };
  }, [externalVideoRef, internalVideoEl]);

  const startTracking = useCallback(async () => {
    if (!videoElement) return;
    setIsLoading(true);
    setError(null);

    try {
      if (!handsRef.current) {
        const { Hands } = await import("@mediapipe/hands");
        const hands = new Hands({
          locateFile: (file) => file.endsWith(".data") || file.endsWith(".tflite") 
            ? `${HANDS_CDN}/${file}` 
            : `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });
        hands.onResults(onResults);
        handsRef.current = hands;
      }

      if (!cameraRef.current) {
        const { Camera } = await import("@mediapipe/camera_utils");
        const camera = new Camera(videoElement, {
          onFrame: async () => {
            if (!videoElement || !handsRef.current || videoElement.paused) return;
            const now = performance.now();
            if (now - lastProcessedAt.current < HAND_FRAME_INTERVAL_MS) return;
            lastProcessedAt.current = now;
            await handsRef.current.send({ image: videoElement });
          },
          width: 320,
          height: 240
        });
        await camera.start();
        cameraRef.current = camera;
        setIsActive(true);
      }
    } catch (err) {
      console.error("MediaPipe Start Error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [videoElement, modelComplexity, onResults]);

  // Handle auto-start if enabled
  useEffect(() => {
    if (enabled && videoElement) {
      void startTracking();
    } else if (!enabled) {
      stopTracking();
    }
    return () => {
      if (enabled) stopTracking();
    };
  }, [enabled, videoElement, startTracking, stopTracking]);

  return {
    videoRef: videoRefCallback, // for useMediaPipeHands compatibility
    palm,                      // for useMediaPipeHands compatibility
    handData,                  // for useHandTracking compatibility
    startTracking,
    stopTracking,
    isActive,
    isLoading,
    ready: isActive,           // for useMediaPipeHands compatibility
    error
  };
}
