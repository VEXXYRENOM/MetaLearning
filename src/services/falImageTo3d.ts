/**
 * Fal.ai API Wrapper for Image/Text to 3D Generation
 * Sends requests through the secure Vercel proxy (api/fal/generate-3d.js).
 * Includes:
 *  - X-MetaLearning-Client-Secret (proxy auth)
 *  - X-User-Id + X-User-Plan (for Supabase-backed rate limiting)
 */

import { supabase } from './supabaseClient';

export const LOCAL_PROXY_ENDPOINT = "/api/fal/generate-3d";

export interface FalResponse {
  "3d_model_url"?: string;
  glb_url?: string;
  model_url?: string;
  url?: string;
  model?: string;
  [key: string]: unknown;
}

export type FalProgressCallback = (progress: number, status: string, message: string) => void;

/**
 * Builds the secure headers for every proxy request.
 * - Client secret validates this is our app (not an external script)
 * - User ID + Plan are used by the proxy to rate-limit per user in Supabase
 */
async function buildProxyHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 1. Client secret (shared between frontend and Vercel function)
  const proxySecret = import.meta.env.VITE_PROXY_SECRET as string | undefined;
  if (proxySecret) {
    headers["X-MetaLearning-Client-Secret"] = proxySecret;
  }

  // 2. User identity for per-user rate limiting (authenticated users get
  //    higher trust and their own quota tracked by UUID, not IP)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      headers["X-User-Id"] = session.user.id;
      // Fetch plan from profile for accurate limit enforcement
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", session.user.id)
        .single();
      if (profile?.plan) {
        headers["X-User-Plan"] = profile.plan;
      }
    }
  } catch {
    // Non-fatal: fall back to IP-based rate limiting in the proxy
  }

  return headers;
}

/**
 * Sends an image (URL or base64) to the proxy → Fal.ai pipeline.
 * Returns the GLB model URL.
 */
export async function falGenerate3DFromImage(
  imageUrlOrBase64: string,
  onProgress?: FalProgressCallback
): Promise<string> {

  onProgress?.(40, "UPLOADING", "جاري نقل الصورة عبر الخادم الآمن...");

  const headers = await buildProxyHeaders();

  const res = await fetch(LOCAL_PROXY_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ image_url: imageUrlOrBase64 }),
  });

  onProgress?.(80, "PROCESSING", "البيانات وصلت! الذكاء الاصطناعي يقوم بالنحت الآن (Fal.ai)...");

  if (res.status === 429) {
    const json = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(json.error || "لقد تجاوزت الحد اليومي للتوليد. قم بالترقية للـ Pro.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fal.ai API error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as FalResponse;

  const modelUrl = json.model_url
    ?? json.url
    ?? json.model
    ?? json["3d_model_url"]
    ?? json.glb_url;

  if (!modelUrl) {
    console.error("Unexpected fal.ai response:", json);
    throw new Error("لم يتم العثور على رابط المجسم في استجابة Fal.ai");
  }

  onProgress?.(100, "SUCCEEDED", "تم الانتهاء بنجاح!");
  return modelUrl as string;
}

/**
 * Text-to-3D: converts text → image (Pollinations) → GLB (Fal.ai)
 */
export async function falGenerate3DFromText(
  prompt: string,
  onProgress?: FalProgressCallback
): Promise<string> {
  onProgress?.(10, "REMOVING_BG", "توليد صورة سريعة من النص (تفكير بصري)...");

  const safePrompt = encodeURIComponent(prompt);
  const imageUrl = `https://pollinations.ai/p/${safePrompt}?width=512&height=512&nologo=true`;

  onProgress?.(30, "CONNECTING", "تم التخيل! جاري إرسال الإحداثيات لطباعة الـ 3D...");

  return await falGenerate3DFromImage(imageUrl, onProgress);
}
