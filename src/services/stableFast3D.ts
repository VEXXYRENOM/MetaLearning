/**
 * Stable Fast 3D — Free API via Hugging Face Spaces
 * Model: stabilityai/stable-fast-3d
 * Uses @gradio/client to call the Gradio API endpoint.
 */

import { Client } from "@gradio/client";

export type SF3DStatus =
  | "REMOVING_BG"
  | "CONNECTING"
  | "UPLOADING"
  | "GENERATING"
  | "DOWNLOADING"
  | "SUCCEEDED"
  | "FAILED";

export type SF3DProgressCallback = (
  percent: number,
  status: SF3DStatus,
  message?: string
) => void;

const HF_SPACE = "stabilityai/stable-fast-3d";

/**
 * Converts a base64 data URI to a Blob.
 */
function dataUriToBlob(dataUri: string): Blob {
  const [header, base64] = dataUri.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Fetches a GLB blob from a URL and converts to an Object URL.
 */
async function fetchGlbAsObjectUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download GLB: ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Calls the stabilityai/stable-fast-3d Gradio Space and returns a GLB Object URL.
 * Progress is reported via the callback.
 */
export async function stableFast3DPipeline(
  imageDataUri: string,
  onProgress?: SF3DProgressCallback
): Promise<string> {
  // Step 1: Connect to Space
  onProgress?.(5, "CONNECTING", "الاتصال بخوادم Hugging Face...");
  let client: InstanceType<typeof Client>;
  try {
    client = await Client.connect(HF_SPACE);
  } catch (err) {
    throw new Error(
      "تعذر الاتصال بمساحة Hugging Face. تأكد من اتصالك بالإنترنت."
    );
  }

  // Step 2: Prepare image blob
  onProgress?.(15, "UPLOADING", "رفع الصورة إلى الخادم...");
  const imageBlob = dataUriToBlob(imageDataUri);

  // Step 3: Call the prediction endpoint
  onProgress?.(25, "GENERATING", "الذكاء الاصطناعي يبني المجسم ثلاثي الأبعاد...");

  let result: { data: unknown[] };
  try {
    result = (await client.predict("/run", {
      image: imageBlob,
      foreground_ratio: 0.85,
      remesh_option: "None",
      vertex_count: -1,
    })) as { data: unknown[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`فشل توليد المجسم: ${msg}`);
  }

  // Step 4: Extract GLB URL from result
  onProgress?.(80, "DOWNLOADING", "تحميل ملف المجسم...");

  // The Gradio Space returns the GLB as a file object in data[0]
  const fileObj = (result.data as Array<{ url?: string; path?: string; name?: string }>)[0];
  let glbUrl: string | undefined;

  if (fileObj && typeof fileObj === "object") {
    glbUrl = fileObj.url ?? fileObj.path;
  } else if (typeof result.data?.[0] === "string") {
    glbUrl = result.data[0] as string;
  }

  if (!glbUrl) {
    throw new Error("لم يتم استقبال ملف المجسم من الـ API.");
  }

  // Step 5: Download GLB and create a local Object URL
  const objectUrl = await fetchGlbAsObjectUrl(glbUrl);

  onProgress?.(100, "SUCCEEDED", "تم اكتمال المجسم ثلاثي الأبعاد!");
  return objectUrl;
}
