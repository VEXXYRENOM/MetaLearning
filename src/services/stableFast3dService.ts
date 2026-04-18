/**
 * Stable Fast 3D Pipeline
 * ─────────────────────────────────────────────────────────────
 * FREE Tier:
 *   1. Remove background locally with @imgly/background-removal (ONNX, in-browser)
 *   2. Send the clean PNG to stabilityai/stable-fast-3d on HF Spaces via @gradio/client
 *   3. Return a blob: URL for the resulting .glb file
 *
 * Premium Tier (fal.ai):  plug in fal.ai endpoint once credits are available.
 */

import { removeBackground } from "@imgly/background-removal";
import { huggingfaceImageTo3dPipeline, HFTaskStatus } from "./huggingfaceImageTo3d";

// ── Types ──────────────────────────────────────────────────────────────────

export type SF3DStatus =
  | "REMOVING_BG"
  | "CONNECTING"
  | "UPLOADING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED";

export type SF3DProgressCallback = (
  progress: number,
  status: SF3DStatus,
  message: string
) => void;

// ── Utility ────────────────────────────────────────────────────────────────

function dataUriToBlob(dataUri: string): Blob {
  const [header, b64] = dataUri.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ── Main Pipeline ──────────────────────────────────────────────────────────

export async function stableFast3dPipeline(
  imageDataUri: string,
  onProgress: SF3DProgressCallback
): Promise<string> {

  // ── Step 1: Remove Background (local, in-browser ONNX) ──────────────────
  onProgress(5, "REMOVING_BG", "إزالة الخلفية بالذكاء الاصطناعي المحلي...");

  const rawBlob = dataUriToBlob(imageDataUri);
  let cleanBlob: Blob;

  try {
    cleanBlob = await removeBackground(rawBlob, {
      model: "isnet_fp16", // use isnet_fp16 for faster processing
      output: { format: "image/png", quality: 1 },
      // Force fetching WASM from the official CDN to bypass Vite/local WASM loading issues
      publicPath: "https://static.imgly.com/@imgly/background-removal/1.7.0/",
    });
    onProgress(22, "CONNECTING", "تمت إزالة الخلفية ✓  جاري الاتصال بالخادم...");
  } catch (bgErr) {
    console.warn("[SF3D] BG removal failed, using original image.", bgErr);
    cleanBlob = rawBlob;
    onProgress(22, "CONNECTING", "جاري الاتصال بـ Stable Fast 3D...");
  }

  // ── Step 2: Call the free HuggingFace Pipeline ─────────────────────────
  try {
    const glbUrl = await huggingfaceImageTo3dPipeline(cleanBlob, (p: number, hfStatus: HFTaskStatus, msg?: string) => {
      // Map HFTaskStatus to SF3DStatus
      let mappedStatus: SF3DStatus = "PROCESSING";
      if (hfStatus === "CONNECTING") mappedStatus = "CONNECTING";
      if (hfStatus === "IN_PROGRESS") mappedStatus = "PROCESSING";
      if (hfStatus === "SUCCEEDED") mappedStatus = "SUCCEEDED";
      if (hfStatus === "FAILED") mappedStatus = "FAILED";
      
      onProgress(22 + (p * 0.78), mappedStatus, msg || "جاري المعالجة مجاناً...");
    });
    
    return glbUrl;
  } catch (err: any) {
    throw new Error(`توقف خادم Hugging Face المجاني: \n${err.message || String(err)}`);
  }
}
