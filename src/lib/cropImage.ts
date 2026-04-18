import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = src;
  });
}

/** يُرجع Blob للصورة المقصوصة (PNG) من منطقة بكسل مطلقة. */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("تعذر إنشاء سياق الرسم.");
  }

  const w = Math.max(1, Math.floor(pixelCrop.width));
  const h = Math.max(1, Math.floor(pixelCrop.height));
  canvas.width = w;
  canvas.height = h;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    w,
    h
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("فشل تصدير الصورة."));
      },
      "image/png",
      0.92
    );
  });
}
