import { useState, useEffect } from 'react';
import * as THREE from 'three';

const DEPTH_MAP_SIZE = 256; // High quality 256x256 depth grid

export interface DepthResult {
  imageTexture: THREE.Texture;
  depthTexture: THREE.DataTexture;
  aspect: number;
}

/**
 * Converts an uploaded image DataURI into a depth map + texture set.
 * Uses Canvas 2D luminance analysis + Sobel edge detection.
 * 100% offline, unlimited usage, processes in < 100ms.
 */
export function useLocalDepthMap(imageDataUri: string | null): {
  result: DepthResult | null;
  loading: boolean;
} {
  const [result, setResult] = useState<DepthResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!imageDataUri) {
      setResult(null);
      return;
    }

    setLoading(true);

    // Clean up previous textures to avoid GPU memory leaks
    setResult((prev) => {
      if (prev) {
        prev.imageTexture.dispose();
        prev.depthTexture.dispose();
      }
      return null;
    });

    const img = new Image();
    img.onload = () => {
      // ─── Step 1: Create image texture for Three.js ───
      const imageTexture = new THREE.Texture(img);
      imageTexture.needsUpdate = true;
      imageTexture.colorSpace = THREE.SRGBColorSpace;

      // ─── Step 2: Compute depth map via Canvas API ───
      const S = DEPTH_MAP_SIZE;
      const canvas = document.createElement('canvas');
      canvas.width = S;
      canvas.height = S;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, S, S);
      const { data: px } = ctx.getImageData(0, 0, S, S);

      // Helper: get perceived luminance of pixel at (x, y)
      const lum = (x: number, y: number) => {
        const cx = Math.max(0, Math.min(S - 1, x));
        const cy = Math.max(0, Math.min(S - 1, y));
        const i = (cy * S + cx) * 4;
        return 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      };

      const depthData = new Uint8Array(S * S);

      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const L = lum(x, y);

          // Sobel edge detection (adds fine surface detail)
          const gx =
            -lum(x - 1, y - 1) - 2 * lum(x - 1, y) - lum(x - 1, y + 1) +
            lum(x + 1, y - 1) + 2 * lum(x + 1, y) + lum(x + 1, y + 1);
          const gy =
            -lum(x - 1, y - 1) - 2 * lum(x, y - 1) - lum(x + 1, y - 1) +
            lum(x - 1, y + 1) + 2 * lum(x, y + 1) + lum(x + 1, y + 1);
          const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5);

          // Edge falloff to avoid sharp borders on the mesh
          const ex = x / S, ey = y / S;
          const borderFade = Math.min(ex, 1 - ex, ey, 1 - ey) * 10;
          const fade = Math.min(1, borderFade);

          // Combine luminance + edges → depth
          const raw = L * 0.65 + edge * 0.55;
          depthData[y * S + x] = Math.min(255, raw * fade) | 0;
        }
      }

      const depthTexture = new THREE.DataTexture(
        depthData,
        S,
        S,
        THREE.RedFormat,
        THREE.UnsignedByteType
      );
      depthTexture.needsUpdate = true;
      depthTexture.wrapS = THREE.ClampToEdgeWrapping;
      depthTexture.wrapT = THREE.ClampToEdgeWrapping;

      setResult({
        imageTexture,
        depthTexture,
        aspect: img.naturalWidth / img.naturalHeight,
      });
      setLoading(false);
    };

    img.onerror = () => {
      setLoading(false);
    };

    img.src = imageDataUri;
  }, [imageDataUri]);

  return { result, loading };
}
