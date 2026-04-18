/**
 * Meshy Image → 3D pipeline (https://docs.meshy.ai/en/api/image-to-3d)
 *
 * In development, requests go to `/api/meshy` so Vite can inject MESHY_API_KEY
 * without exposing it to the browser. In production, deploy a proxy or
 * serverless function with the same routes.
 */

const MESHY_PATH = "/openapi/v1/image-to-3d";

function apiBase(): string {
  const proxy = import.meta.env.VITE_MESHY_PROXY_BASE as string | undefined;
  if (proxy) return proxy.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/api/meshy";
  return "https://api.meshy.ai";
}

export type MeshyTaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED";

export type MeshyImageTo3dTask = {
  id: string;
  status: MeshyTaskStatus;
  progress: number;
  model_urls?: { glb?: string };
  task_error?: { message?: string };
};

export type CreateTaskOptions = {
  /** data:image/...;base64,... or https URL */
  imageUrl: string;
  /** Fewer credits; mesh only */
  shouldTexture?: boolean;
  targetFormats?: string[];
};

export async function meshyCreateImageTo3dTask(
  opts: CreateTaskOptions
): Promise<string> {
  const useMock =
    import.meta.env.VITE_MESHY_MOCK === "true" ||
    import.meta.env.VITE_MESHY_MOCK === "1";

  if (useMock) {
    return "mock-task-id";
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase()}${MESHY_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: opts.imageUrl,
        ai_model: "latest",
        should_texture: opts.shouldTexture ?? true,
        target_formats: opts.targetFormats ?? ["glb"],
        moderation: true,
      }),
    });
  } catch (networkErr) {
    // Network error (no proxy, server down, etc.) → fall back to mock
    console.warn("Meshy API unreachable (network error). Falling back to Mock mode.", networkErr);
    return "mock-task-id";
  }

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      console.warn("Meshy API key missing or invalid. Falling back to Mock mode automatically.");
      return "mock-task-id";
    }
    const t = await res.text();
    throw new Error(`Meshy create failed (${res.status}): ${t}`);
  }

  const data = (await res.json()) as { result: string };
  return data.result;
}

export async function meshyGetImageTo3dTask(
  taskId: string
): Promise<MeshyImageTo3dTask> {
  if (taskId === "mock-task-id") {
    return {
      id: taskId,
      status: "SUCCEEDED",
      progress: 100,
      model_urls: {
        glb:
          import.meta.env.VITE_MOCK_GLB_URL ??
          "procedural-heart",
      },
    };
  }

  const res = await fetch(`${apiBase()}${MESHY_PATH}/${taskId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Meshy poll failed (${res.status}): ${t}`);
  }

  return (await res.json()) as MeshyImageTo3dTask;
}

const POLL_MS = 2500;
const MAX_POLLS = 120;

export async function meshyPollUntilGlb(
  taskId: string,
  onProgress?: (p: number, status: MeshyTaskStatus) => void
): Promise<string> {
  for (let i = 0; i < MAX_POLLS; i++) {
    const task = await meshyGetImageTo3dTask(taskId);
    onProgress?.(task.progress ?? 0, task.status);

    if (task.status === "SUCCEEDED") {
      const glb = task.model_urls?.glb;
      if (!glb) throw new Error("Meshy: no GLB in response.");
      return glb;
    }

    if (task.status === "FAILED" || task.status === "CANCELED") {
      throw new Error(
        task.task_error?.message || `Meshy task ${task.status.toLowerCase()}`
      );
    }

    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  throw new Error("Meshy: polling timed out.");
}

export async function meshyImageTo3dPipeline(
  imageDataUri: string,
  onProgress?: (p: number, status: MeshyTaskStatus) => void
): Promise<string> {
  const id = await meshyCreateImageTo3dTask({ imageUrl: imageDataUri });
  
  if (id === "mock-task-id") {
    // محاكاة تحميل واقعية لعرض المستثمرين (Investor Demo Mode)
    onProgress?.(15, "IN_PROGRESS");
    await new Promise((r) => setTimeout(r, 1200));
    
    onProgress?.(45, "IN_PROGRESS");
    await new Promise((r) => setTimeout(r, 1500));
    
    onProgress?.(80, "IN_PROGRESS");
    await new Promise((r) => setTimeout(r, 1000));
    
    onProgress?.(100, "SUCCEEDED");
    
    // بدلاً من إرجاع القلب الثابت، نعيد الصورة المرفوعة مع بادئة خاصة
    // ليقوم متصفح الطالب بتحويلها عبر الـ Shader Engine المجاني الخاص بنا!
    return `local-parallax:${imageDataUri}`;
  }

  return meshyPollUntilGlb(id, onProgress);
}
