import { removeBackground } from "@imgly/background-removal";

/**
 * دالة لاستخراج الكائن وإزالة الخلفية المشتتة مدعومة بالذكاء الاصطناعي على جهاز المستخدم.
 */
export async function processImageBackground(
  imageSrc: string,
  onProgress?: (progressText: string) => void
): Promise<string> {
  try {
    const response = await fetch(imageSrc);
    const imageBlob = await response.blob();

    // تشغيل نموذج إزالة الخلفية
    const transparentBlob = await removeBackground(imageBlob, {
      progress: (key: string, current: number, total: number) => {
        if (onProgress) {
          const percent = total > 0 ? Math.round((current / total) * 100) : 0;
          onProgress(`تحميل مكونات الذكاء الاصطناعي (${key}): ${percent}%`);
        }
      },
    });

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(transparentBlob);
    });
  } catch (error) {
    console.error("خطأ أثناء إزالة الخلفية:", error);
    throw new Error("لم نتمكن من إزالة الخلفية، يرجى المحاولة بصورة أخرى.");
  }
}
