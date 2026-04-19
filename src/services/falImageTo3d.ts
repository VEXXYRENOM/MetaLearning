/**
 * Fal.ai API API Wrapper for Text/Image to 3D Generation
 * Extracted from test_fal.mjs
 */

export const LOCAL_PROXY_ENDPOINT = "/api/fal/generate-3d";

export interface FalResponse {
  "3d_model_url"?: string;
  glb_url?: string;
  [key: string]: any;
}

export type FalProgressCallback = (progress: number, status: string, message: string) => void;

/**
 * Sends an image to the local proxy which forwards it to Fal.ai.
 * The proxy protects the API key.
 */
export async function falGenerate3DFromImage(
  imageUrlOrBase64: string, 
  onProgress?: FalProgressCallback
): Promise<string> {
  
  onProgress?.(40, "UPLOADING", "جاري نقل الصورة عبر الخادم الآمن...");

  const res = await fetch(LOCAL_PROXY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      image_url: imageUrlOrBase64
    })
  });

  onProgress?.(80, "PROCESSING", "البيانات وصلت! الذكاء الاصطناعي يقوم بالنحت الآن (Fal.ai)...");
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fal.ai API error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as FalResponse;
  
  const modelUrl = json.model_url || json[0]?.url || json.url || json.model || json["3d_model_url"];
  
  if (!modelUrl) {
    console.error("Unexpected fal.ai response:", json);
    throw new Error("لم يتم العثور على رابط المجسم في استجابة Fal.ai");
  }

  onProgress?.(100, "SUCCEEDED", "تم الانتهاء بنجاح!");
  return modelUrl;
}

/**
 * Super-fast Text-to-3D wrapper. 
 * Converts Text -> Image (Pollinations) -> GLB (Fal AI)
 */
export async function falGenerate3DFromText(
  prompt: string,
  onProgress?: FalProgressCallback
): Promise<string> {
  onProgress?.(10, "REMOVING_BG", "توليد صورة سريعة من النص (تفكير بصري)...");
  
  // 1. Convert Text to Image instantly via Pollinations AI
  const safePrompt = encodeURIComponent(prompt);
  // Using nologo=true and dimensions ideal for objects
  const imageUrl = `https://pollinations.ai/p/${safePrompt}?width=512&height=512&nologo=true`;

  onProgress?.(30, "CONNECTING", "تم التخيل! جاري إرسال الإحداثيات لطباعة الـ 3D...");

  // 2. Feed the generated Image URL directly to Fal
  return await falGenerate3DFromImage(imageUrl, onProgress);
}

