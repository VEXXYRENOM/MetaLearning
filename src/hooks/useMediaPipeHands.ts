import { useCallback, useEffect, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HANDS_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240";

export type HandLandmark2D = { x: number; y: number };

/**
 * كاميرا + MediaPipe Hands — يعيد callback ref للـ video لضمان بدء التتبع بعد ربط العنصر.
 */
export function useMediaPipeHands(enabled: boolean) {
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [palm, setPalm] = useState<HandLandmark2D | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    setVideoEl(node);
  }, []);

  useEffect(() => {
    if (!enabled || !videoEl) {
      setPalm(null);
      setReady(false);
      return;
    }

    let camera: Camera | null = null;
    let hands: Hands | null = null;
    let cancelled = false;

    const start = async () => {
      try {
        setError(null);
        hands = new Hands({
          locateFile: (file) => `${HANDS_CDN}/${file}`,
        });
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });
        hands.onResults((results) => {
          if (cancelled) return;
          const lm = results.multiHandLandmarks?.[0]?.[9];
          if (lm) {
            setPalm({ x: lm.x, y: lm.y });
          } else {
            setPalm(null);
          }
        });

        camera = new Camera(videoEl, {
          onFrame: async () => {
            if (hands && videoEl) await hands.send({ image: videoEl });
          },
          width: 640,
          height: 480,
        });
        await camera.start();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setReady(false);
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      void camera?.stop();
      hands?.close();
      setReady(false);
      setPalm(null);
    };
  }, [enabled, videoEl]);

  return { videoRef, palm, ready, error };
}
