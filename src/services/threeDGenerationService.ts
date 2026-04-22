/**
 * threeDGenerationService.ts
 *
 * Unified 3D generation service with automatic provider fallback.
 *
 * Priority order:
 *  1. Fal.ai (fastest, production quality)
 *  2. Meshy (image-to-3D API)
 *  3. HuggingFace Stable-Fast-3D (free, but slower)
 *
 * Usage:
 *   import { generateImageTo3D } from './threeDGenerationService';
 *   const { modelUrl, provider } = await generateImageTo3D(imageDataUri, onProgress);
 */

import { falGenerate3DFromImage } from './falImageTo3d';
import { meshyImageTo3dPipeline } from './meshyImageTo3d';
import { huggingfaceImageTo3dPipeline } from './huggingfaceImageTo3d';

export type GenerationResult = {
  modelUrl: string;
  provider: 'fal' | 'meshy' | 'huggingface';
};

export type ProgressCallback = (progress: number, status: string, message: string) => void;

/**
 * Convert a data-URI or URL string to a Blob (needed for Huggingface).
 */
async function dataUriToBlob(dataUri: string): Promise<Blob> {
  const res = await fetch(dataUri);
  return res.blob();
}

/**
 * Main entry point. Tries each provider in order until one succeeds.
 * Falls back automatically on network/API errors.
 */
export async function generateImageTo3D(
  imageUrlOrDataUri: string,
  onProgress?: ProgressCallback
): Promise<GenerationResult> {

  // ── Provider 1: Fal.ai ──────────────────────────────────────────────────────
  try {
    onProgress?.(5, 'CONNECTING', 'جاري الاتصال بـ Fal.ai...');
    const modelUrl = await falGenerate3DFromImage(imageUrlOrDataUri, onProgress);
    return { modelUrl, provider: 'fal' };
  } catch (falError) {
    console.warn('[3D Service] Fal.ai failed, trying Meshy...', falError);
    onProgress?.(10, 'FALLBACK', 'Fal.ai غير متاح، جاري التبديل إلى Meshy...');
  }

  // ── Provider 2: Meshy ────────────────────────────────────────────────────────
  try {
    const modelUrl = await meshyImageTo3dPipeline(
      imageUrlOrDataUri,
      (p, status) => onProgress?.(p, status, `Meshy: ${status}`)
    );
    return { modelUrl, provider: 'meshy' };
  } catch (meshyError) {
    console.warn('[3D Service] Meshy failed, trying HuggingFace...', meshyError);
    onProgress?.(10, 'FALLBACK', 'Meshy غير متاح، جاري التبديل إلى HuggingFace...');
  }

  // ── Provider 3: HuggingFace (last resort) ───────────────────────────────────
  const imageBlob = await dataUriToBlob(imageUrlOrDataUri);
  const modelUrl = await huggingfaceImageTo3dPipeline(
    imageBlob,
    (p, status, msg) => onProgress?.(p, status, msg ?? `HuggingFace: ${status}`)
  );
  return { modelUrl, provider: 'huggingface' };
}
