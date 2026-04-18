import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "../../lib/cropImage";
import { processImageBackground } from "../../lib/removeBackground";
import "react-easy-crop/react-easy-crop.css";

type Props = {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  /** بعد قص ناجح: رابط كائن للصورة المقصوصة (يُفترض أن يُحرَّر لاحقاً) */
  onApplyCropped: (objectUrl: string) => void;
  /** استخدام الصورة كاملة بدون قص */
  onApplyFull: () => void;
};

export function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onApplyCropped,
  onApplyFull,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>("");

  useEffect(() => {
    if (imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setErr(null);
    }
  }, [imageSrc]);

  const onCropComplete = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setErr("حدّد منطقة القص أولاً.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const reader = new FileReader();
      const dataUri = await new Promise<string>((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = () => rej(reader.error);
        reader.readAsDataURL(blob);
      });
      onApplyCropped(dataUri);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "تعذر قص الصورة.");
    } finally {
      setBusy(false);
    }
  };

  const handleApplyWithAI = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      setErr("حدّد منطقة القص أولاً.");
      return;
    }
    setErr(null);
    setBusy(true);
    setProgressMsg("جاري معالجة وقص الصورة...");
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const reader = new FileReader();
      const dataUri = await new Promise<string>((res, rej) => {
        reader.onload = () => res(reader.result as string);
        reader.onerror = () => rej(reader.error);
        reader.readAsDataURL(blob);
      });
      
      setProgressMsg("جاري إزالة الخلفية بالوكيل الذكي... نرجو الانتظار قليلاً أو تنزيل المكتبات لأول مرة 🤖✨");
      const transparentUri = await processImageBackground(dataUri, (msg) => {
         setProgressMsg(msg);
      });
      
      onApplyCropped(transparentUri);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "تعذر إزالة الخلفية. جرب القص العادي.");
    } finally {
      setBusy(false);
      setProgressMsg("");
    }
  };

  if (!open || !imageSrc) {
    return null;
  }

  return (
    <div className="crop-modal-overlay" role="dialog" aria-modal="true">
      <div className="crop-modal">
        <h2 className="crop-modal-title">قص الرسم (إزالة الهوامش والزوائد)</h2>
        <p className="crop-modal-desc">
          حرّك الإطار وكبّر الصورة بالشريط لاختيار جزء الرسم فقط. ما خارجه لن
          يُعرض في المشهد ثلاثي الأبعاد.
        </p>

        <div className="crop-modal-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>

        <label className="crop-zoom-label">
          تكبير المعاينة
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>

        {err && (
          <p className="lesson-hint-warn" role="status">
            {err}
          </p>
        )}
        {busy && progressMsg && (
          <p className="img3d-status" role="status" style={{color: "var(--accent)", marginTop: "0.5rem"}}>
            {progressMsg}
          </p>
        )}

        <div className="crop-modal-actions">
          <button
            type="button"
            className="lesson-btn primary"
            disabled={busy}
            onClick={handleApplyWithAI}
          >
            {busy ? "جاري..." : "قص وإزالة الخلفية بالـ AI ✨"}
          </button>
          <button
            type="button"
            className="lesson-btn"
            disabled={busy}
            onClick={handleApplyCrop}
          >
            {busy ? "جاري…" : "قص فقط (بالخلفية)"}
          </button>
          <button
            type="button"
            className="lesson-btn"
            disabled={busy}
            onClick={onApplyFull}
          >
            بدون قص (الصورة كاملة)
          </button>
          <button
            type="button"
            className="lesson-btn ghost"
            disabled={busy}
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
