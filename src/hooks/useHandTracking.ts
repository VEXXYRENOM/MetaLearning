import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Hands, Results, Landmark } from "@mediapipe/hands";

export interface HandData {
  landmarks: Landmark[];
  palmPosition: { x: number; y: number; z: number };
  pinchDistance: number;
  indexFingerTip: { x: number; y: number; z: number };
  isPinching: boolean;
  // خصائص للإيماءات المتقدمة
  zoomFactor: number;
  rotationAngle: { x: number; y: number };
}

export function useHandTracking(videoRef: RefObject<HTMLVideoElement>) {
  const [handData, setHandData] = useState<HandData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const cameraRef = useRef<Camera | null>(null);
  const handsRef = useRef<Hands | null>(null);

  // لحفظ القيم عبر الإطارات وحساب التغيرات
  const pinchState = useRef({ isPinching: false, baseDistance: 0, baseZoom: 1 });
  const rotationState = useRef({ prevX: 0, prevY: 0, angleX: 0, angleY: 0, isGrabbed: false });

  const onResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      const wrist = landmarks[0];
      const middleMCP = landmarks[9];
      const palmPosition = {
        x: (wrist.x + middleMCP.x) / 2,
        y: (wrist.y + middleMCP.y) / 2,
        z: (wrist.z + middleMCP.z) / 2,
      };

      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const dz = thumbTip.z - indexTip.z;
      const pinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      const isCurrentlyPinching = pinchDistance < 0.05; // 5% of screen width

      // حساب التكبير (Zoom Factor)
      let currentZoom = pinchState.current.baseZoom;
      if (isCurrentlyPinching) {
        if (!pinchState.current.isPinching) {
          // بدء قرصة جديدة
          pinchState.current.isPinching = true;
          pinchState.current.baseDistance = pinchDistance;
        } else {
          // أثناء القرصة، نحسب الفرق كعامل تكبير
          const ratio = (pinchState.current.baseDistance - pinchDistance) * 10;
          currentZoom = Math.max(0.2, currentZoom - ratio);
          pinchState.current.baseDistance = pinchDistance; // تحديث مستمر لنعومة الحركة
        }
      } else {
        pinchState.current.isPinching = false;
      }
      pinchState.current.baseZoom = currentZoom;

      // حساب الدوران (Fist to Grab / Rotation)
      // نعرف اليد المغلقة (قبضة/إمساك) أذا كان طول الأصابع الممدودة أقصر من مسافة معينة للمركز
      const middleTip = landmarks[12];
      const fingerLength = Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2));
      const isGrabbed = fingerLength < 0.15; // عتبة تقديرية لغلق اليد

      if (isGrabbed) {
        if (!rotationState.current.isGrabbed) {
          rotationState.current.isGrabbed = true;
          rotationState.current.prevX = palmPosition.x;
          rotationState.current.prevY = palmPosition.y;
        } else {
          // إذا كانت اليد مقبوضة ومتحركة، قم بحساب الدوران
          const deltaX = palmPosition.x - rotationState.current.prevX;
          const deltaY = palmPosition.y - rotationState.current.prevY;
          
          rotationState.current.angleY += deltaX * Math.PI * 1.5; // الدوران الأفقي
          rotationState.current.angleX += deltaY * Math.PI * 1.5; // الدوران الرأسي
          
          rotationState.current.prevX = palmPosition.x;
          rotationState.current.prevY = palmPosition.y;
        }
      } else {
        rotationState.current.isGrabbed = false;
      }

      setHandData({
        landmarks,
        palmPosition, // القيم من 0 لـ 1 (حيث 0,0 أعلى اليسار)
        pinchDistance,
        indexFingerTip: { x: indexTip.x, y: indexTip.y, z: indexTip.z },
        isPinching: isCurrentlyPinching,
        zoomFactor: currentZoom,
        rotationAngle: { x: rotationState.current.angleX, y: rotationState.current.angleY }
      });
    } else {
      setHandData(null);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!videoRef.current) return;
    setIsLoading(true);

    if (!handsRef.current) {
      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      hands.onResults(onResults);
      handsRef.current = hands;
    }

    if (!cameraRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current && !videoRef.current.paused) {
            await handsRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      camera.start().then(() => {
        setIsActive(true);
        setIsLoading(false);
      }).catch((err) => {
        console.error("Camera start error:", err);
        setIsLoading(false);
      });
      cameraRef.current = camera;
    }
  }, [videoRef, onResults]);

  const stopTracking = useCallback(() => {
    setIsActive(false);
    setIsLoading(false);
    
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
    setHandData(null);
    
    // إعادة تعيين الحالات عند الإيقاف
    pinchState.current = { isPinching: false, baseDistance: 0, baseZoom: 1 };
    rotationState.current = { prevX: 0, prevY: 0, angleX: 0, angleY: 0, isGrabbed: false };
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    handData,
    startTracking,
    stopTracking,
    isActive,
    isLoading
  };
}
