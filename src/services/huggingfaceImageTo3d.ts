import { Client } from "@gradio/client";

export type HFTaskStatus =
  | "PENDING"
  | "CONNECTING"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED";

const SPACE_ID = "stabilityai/stable-fast-3d";
const TIMEOUT_MS = 90_000; // 90 seconds max
const MAX_RETRIES = 2;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`TIMEOUT:${ms}`)),
      ms
    );
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

/**
 * يتصل بنموذج Stable Fast 3D على HuggingFace ويُنتج ملف GLB.
 * يدعم retry تلقائي ويُحلل جميع أنواع أخطاء Gradio.
 */
export async function huggingfaceImageTo3dPipeline(
  imageBlob: Blob,
  onProgress?: (p: number, status: HFTaskStatus, msg?: string) => void
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      onProgress?.(
        attempt === 1 ? 15 : 20,
        "CONNECTING",
        attempt === 1
          ? "الاتصال بخوادم الذكاء الاصطناعي..."
          : `إعادة المحاولة (${attempt}/${MAX_RETRIES})...`
      );

      const app = await withTimeout(
        Client.connect(SPACE_ID),
        20_000
      );

      onProgress?.(40, "IN_PROGRESS", "جاري بناء المجسم ثلاثي الأبعاد...");

      const result = (await withTimeout(
        app.predict("/run", [
          imageBlob,   // image
          0.5,         // foreground_ratio
          512,         // texture resolution
          "none",      // remesh option
        ]),
        TIMEOUT_MS
      )) as any;

      onProgress?.(88, "IN_PROGRESS", "استخراج ملف المجسم...");

      // Extract GLB URL from Gradio response
      const data = result?.data;
      let glbUrl = "";

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item?.url?.includes(".glb") || item?.name?.includes(".glb")) {
            glbUrl = item.url ?? item.name;
            break;
          }
        }
        // Fallback: first item with a url
        if (!glbUrl) {
          for (const item of data) {
            if (item?.url) { glbUrl = item.url; break; }
          }
        }
      }

      if (!glbUrl) {
        console.error("Gradio raw result:", JSON.stringify(result));
        throw new Error("NO_GLB: لم يُعثر على ملف المجسم في استجابة الخادم");
      }

      onProgress?.(100, "SUCCEEDED", "تم توليد المجسم بنجاح! 🎉");
      return glbUrl;

    } catch (err: any) {
      lastError = err;
      const msg: string = err?.message ?? "";
      console.warn(`HuggingFace attempt ${attempt} failed:`, msg);

      // Non-retriable errors — fail immediately
      if (
        msg.includes("NO_GLB") ||
        msg.includes("MODERATION") ||
        msg.includes("400")
      ) {
        break;
      }

      // Retriable: space sleeping, 503, network blip
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
    }
  }

  // Map error to a user-friendly Arabic/English message
  const raw = lastError?.message ?? "";
  if (raw.includes("TIMEOUT")) {
    throw new Error(
      "انتهت مهلة الاتصال بخوادم Hugging Face (90s). قد تكون الخوادم مشغولة جداً — حاول مجدداً لاحقاً أو استخدم الوضع المحلي."
    );
  }
  if (raw.includes("resolve app config") || raw.includes("metadata") || raw.includes("503")) {
    throw new Error(
      "مساحة Stable Fast 3D في وضع السكون أو مشغولة. قد تستغرق الاستعادة دقيقة — أو استخدم الوضع المحلي 2.5D الآن."
    );
  }
  throw new Error(
    raw || "حدث خطأ غير متوقع أثناء التوليد. يرجى المحاولة مرة أخرى."
  );
}
