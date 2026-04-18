import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Canvas } from "@react-three/fiber";
import { Link, Navigate, useParams } from "react-router-dom";
import { OrbitControls } from "@react-three/drei";
import { QRCodeSVG } from "qrcode.react";
import { getLesson, type LessonKind } from "../data/lessons";
import { GltfScene } from "../components/lesson/GltfScene";
import { ArtifactGltfModel } from "../components/experience/ArtifactGltfModel";
import { RotatingGroup } from "../components/lesson/RotatingGroup";
import { SceneBackdrop } from "../components/lesson/SceneBackdrop";
import { ImageTo3dVolume } from "../components/lesson/ImageTo3dVolume";
import { BeatingHeart3D } from "../components/lesson/BeatingHeart3D";
import { AtomModel3D } from "../components/lesson/AtomModel3D";
import { SolarSystem3D } from "../components/lesson/SolarSystem3D";
import { Pyramid3D } from "../components/lesson/Pyramid3D";
import { PlatonicSolids3D } from "../components/lesson/PlatonicSolids3D";
import { AnimalCell3D } from "../components/lesson/AnimalCell3D";
import { PlantCell3D } from "../components/lesson/PlantCell3D";
import { WaterMolecule3D } from "../components/lesson/WaterMolecule3D";
import { DNAHelix3D } from "../components/lesson/DNAHelix3D";
import { EarthLayers3D } from "../components/lesson/EarthLayers3D";
import { Volcano3D } from "../components/lesson/Volcano3D";
import { WaterCycle3D } from "../components/lesson/WaterCycle3D";
import { LungsModel3D } from "../components/lesson/LungsModel3D";
import { EyeAnatomy3D } from "../components/lesson/EyeAnatomy3D";
import { FunctionGraph3D } from "../components/lesson/FunctionGraph3D";
import { GeometricVolumes3D } from "../components/lesson/GeometricVolumes3D";
import { Colosseum3D } from "../components/lesson/Colosseum3D";
import { CarthageRuins3D } from "../components/lesson/CarthageRuins3D";
import { KairouanMosque3D } from "../components/lesson/KairouanMosque3D";
import { ArabicLetters3D } from "../components/lesson/ArabicLetters3D";
import { VocalAnatomy3D } from "../components/lesson/VocalAnatomy3D";
import { RoomObjects3D } from "../components/lesson/RoomObjects3D";
import { ColorWheel3D } from "../components/lesson/ColorWheel3D";
import { Pottery3D } from "../components/lesson/Pottery3D";
import { PaintingFrame3D } from "../components/lesson/PaintingFrame3D";
import { ImageCropModal } from "../components/lesson/ImageCropModal";
import { useHandTracking } from "../hooks/useHandTracking";
import { HandTrackedModel } from "../components/lesson/HandTrackedModel";
import { HandLight } from "../components/lesson/HandLight";
import { OrthographicProjection3D } from "../components/lesson/OrthographicProjection3D";
import { Vectors3D } from "../components/lesson/Vectors3D";
import { Transformations3D } from "../components/lesson/Transformations3D";
import { StatisticsProbability3D } from "../components/lesson/StatisticsProbability3D";
import { Sequences3D } from "../components/lesson/Sequences3D";
import { MathematicalLogic3D } from "../components/lesson/MathematicalLogic3D";
import { RobotKinematics3D } from "../components/lesson/RobotKinematics3D";
/** خريطة تربط كل نوع درس إجرائي بالمكون ثلاثي الأبعاد المناسب */
const PROCEDURAL_COMPONENTS: Partial<Record<LessonKind, React.FC>> = {
  "procedural-heart": BeatingHeart3D,
  "procedural-atom": AtomModel3D,
  "procedural-solarsystem": SolarSystem3D,
  "procedural-earth-layers": EarthLayers3D,
  "procedural-animal-cell": AnimalCell3D,
  "procedural-plant-cell": PlantCell3D,
  "procedural-water-molecule": WaterMolecule3D,
  "procedural-dna": DNAHelix3D,
  "procedural-volcano": Volcano3D,
  "procedural-water-cycle": WaterCycle3D,
  "procedural-lungs": LungsModel3D,
  "procedural-eye": EyeAnatomy3D,
  "procedural-pyramid": Pyramid3D,
  "procedural-platonic": PlatonicSolids3D,
  "procedural-function-graph": FunctionGraph3D,
  "procedural-geometric-volumes": GeometricVolumes3D,
  "procedural-colosseum": Colosseum3D,
  "procedural-carthage": CarthageRuins3D,
  "procedural-kairouan": KairouanMosque3D,
  "procedural-arabic-letters": ArabicLetters3D,
  "procedural-vocal-anatomy": VocalAnatomy3D,
  "procedural-room-objects": RoomObjects3D,
  "procedural-color-wheel": ColorWheel3D,
  "procedural-pottery": Pottery3D,
  "procedural-painting": PaintingFrame3D,
  "procedural-orthographic": OrthographicProjection3D,
  "procedural-vectors": Vectors3D,
  "procedural-transformations": Transformations3D,
  "procedural-statistics": StatisticsProbability3D,
  "procedural-sequences": Sequences3D,
  "procedural-logic": MathematicalLogic3D,
  "procedural-kinematics": RobotKinematics3D,
};

function isProcedural(kind: LessonKind): boolean {
  return kind.startsWith("procedural-");
}

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = getLesson(lessonId);

  const [modelScale, setModelScale] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [xrayMode, setXrayMode] = useState(false);
  const [selectedGltfName, setSelectedGltfName] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copyDone, setCopyDone] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [teacherImageUrl, setTeacherImageUrl] = useState<string | null>(null);
  const [teacherImageName, setTeacherImageName] = useState<string | null>(null);
  const [teacherImageHint, setTeacherImageHint] = useState<string | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, startTracking, stopTracking, isActive, isLoading } = useHandTracking(videoRef);


  useEffect(() => {
    const u = new URL(window.location.href);
    u.hash = "";
    setShareUrl(u.toString());
  }, [lessonId]);

  useEffect(() => {
    return () => {
      if (uploadUrl) URL.revokeObjectURL(uploadUrl);
    };
  }, [uploadUrl]);

  useEffect(() => {
    return () => {
      if (teacherImageUrl) URL.revokeObjectURL(teacherImageUrl);
    };
  }, [teacherImageUrl]);

  useEffect(() => {
    return () => {
      if (rawImageForCrop) URL.revokeObjectURL(rawImageForCrop);
    };
  }, [rawImageForCrop]);

  const onGltfSelect = useCallback((name: string | null) => {
    setSelectedGltfName(name);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGltfName(null);
  }, []);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadName(f.name);
    setUploadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setSelectedGltfName(null);
  };

  const onTeacherImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setTeacherImageHint(null);
    if (!f.type.startsWith("image/")) {
      setTeacherImageHint("يرجى اختيار ملف صورة (JPG أو PNG…).");
      e.target.value = "";
      return;
    }
    const maxBytes = 12 * 1024 * 1024;
    if (f.size > maxBytes) {
      setTeacherImageHint("الملف كبير جداً. الحد الأقصى 12 ميغابايت.");
      e.target.value = "";
      return;
    }

    setTeacherImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setRawImageForCrop((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setTeacherImageName(f.name);
    setCropModalOpen(true);
    e.target.value = "";
  };

  const handleCropApplied = useCallback((croppedObjectUrl: string) => {
    setRawImageForCrop((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTeacherImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return croppedObjectUrl;
    });
    setCropModalOpen(false);
  }, []);

  const handleCropUseFull = useCallback(async () => {
    if (!rawImageForCrop) { setCropModalOpen(false); return; }
    try {
      const res = await fetch(rawImageForCrop);
      const blob = await res.blob();
      const reader = new FileReader();
      const dataUri = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      URL.revokeObjectURL(rawImageForCrop);
      setRawImageForCrop(null);
      setTeacherImageUrl(dataUri);
    } catch {
      // fallback: use blob url as-is
      setTeacherImageUrl(rawImageForCrop);
      setRawImageForCrop(null);
    }
    setCropModalOpen(false);
  }, [rawImageForCrop]);

  const handleCropCancel = useCallback(() => {
    setRawImageForCrop((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTeacherImageName(null);
    setCropModalOpen(false);
  }, []);

  const clearTeacherImage = () => {
    setTeacherImageHint(null);
    setTeacherImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setTeacherImageName(null);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  };

  const requestFullscreen = () => {
    const el = canvasHostRef.current;
    if (!el) return;
    void el.requestFullscreen?.();
  };

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const gltfSource = (lesson.kind === "gltf-url" || lesson.kind === "gltf-artifact") ? lesson.gltfUrl : null;
  const effectiveGltfUrl =
    lesson.kind === "gltf-upload" ? uploadUrl : gltfSource;

  const isProceduralLesson = isProcedural(lesson.kind);
  const showCanvas = isProceduralLesson || Boolean(effectiveGltfUrl);
  const isHeart = lesson.kind === "procedural-heart";
  const ProceduralComponent = PROCEDURAL_COMPONENTS[lesson.kind] || null;

  return (
    <div className="lesson-layout">
      {isHeart && (
        <ImageCropModal
          open={cropModalOpen}
          imageSrc={rawImageForCrop}
          onClose={handleCropCancel}
          onApplyCropped={handleCropApplied}
          onApplyFull={handleCropUseFull}
        />
      )}

      <aside className="lesson-sidebar">
        <Link className="lesson-back" to="/">
          ← الرئيسية
        </Link>
        <p className="lesson-subject">{lesson.subjectAr}</p>
        <h1 className="lesson-title">{lesson.titleAr}</h1>
        <p className="lesson-blurb">{lesson.blurbAr}</p>

        {isHeart && (
          <section className="lesson-section">
            <h2 className="lesson-h2">صورة الدرس → قص ثم 3D</h2>
            <p className="lesson-muted small-gap">
              بعد اختيار الصورة يفتح <strong>قص تفاعلي</strong>: اختر منطقة الرسم
              فقط وأزل الهوامش والزوائد، ثم تُعرض النتيجة في الفضاء ثلاثي
              الأبعاد.
            </p>
            <label className="file-label img-file">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="file-input"
                onChange={onTeacherImageChange}
              />
              <span className="file-btn img-file-btn">
                اختيار صورة (JPG، PNG…)
              </span>
            </label>
            {teacherImageName && (
              <p className="lesson-muted small-gap">
                الملف: <strong>{teacherImageName}</strong>
              </p>
            )}
            {teacherImageUrl && (
              <button
                type="button"
                className="lesson-btn ghost full-width"
                onClick={clearTeacherImage}
              >
                إزالة الصورة وإيقاف النموذج
              </button>
            )}
            {teacherImageHint && (
              <p className="lesson-hint-warn" role="status">
                {teacherImageHint}
              </p>
            )}
            <p className="lesson-muted tiny">
              ملاحظة: الصورة تبقى على هذا المتصفح حتى نربط لاحقاً خادماً لحفظ
              دروس الأستاذ.
            </p>
          </section>
        )}

        {lesson.kind === "gltf-upload" && (
          <section className="lesson-section">
            <h2 className="lesson-h2">رفع نموذج</h2>
            <label className="file-label">
              <input
                type="file"
                accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                className="file-input"
                onChange={onFileChange}
              />
              <span className="file-btn">اختيار ملف .glb / .gltf</span>
            </label>
            {uploadName && (
              <p className="lesson-muted small-gap">
                الملف: <strong>{uploadName}</strong>
              </p>
            )}
            {!uploadUrl && (
              <p className="lesson-muted small-gap">
                بعد الرفع يظهر النموذج في المشهد ويمكن مشاركة رابط هذه الصفحة
                مع التلاميذ.
              </p>
            )}
          </section>
        )}

        <section className="lesson-section">
          <h2 className="lesson-h2">العرض</h2>
          <div className="lesson-row">
            <button
              type="button"
              className="lesson-btn"
              onClick={() => setModelScale((s) => Math.max(0.45, s - 0.15))}
            >
              تصغير
            </button>
            <button
              type="button"
              className="lesson-btn"
              onClick={() => setModelScale((s) => Math.min(2.2, s + 0.15))}
            >
              تكبير
            </button>
            <button
              type="button"
              className="lesson-btn ghost"
              onClick={() => setModelScale(1)}
            >
              إعادة ضبط
            </button>
          </div>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            تدوير تلقائي (حول المحور الرأسي)
          </label>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={xrayMode}
              onChange={(e) => setXrayMode(e.target.checked)}
            />
            رؤية استكشافية (X-Ray Mode)
          </label>
          <button
            type="button"
            className="lesson-btn ghost full-width"
            onClick={requestFullscreen}
          >
            ملء الشاشة (المشهد)
          </button>
          <button
            type="button"
            className={`lesson-btn full-width ar-toggle-btn ${isActive ? "active" : ""}`}
            style={{ marginTop: "1rem", padding: "0.8rem" }}
            onClick={isActive ? stopTracking : startTracking}
            disabled={isLoading}
          >
            {isLoading ? "جاري تشغيل الكاميرا..." : isActive ? "إيقاف التتبع باليد (AR)" : "تشغيل التتبع باليد (AR)"}
          </button>

        </section>

        <section className="lesson-section">
          <h2 className="lesson-h2">شرح</h2>
          {isHeart && teacherImageUrl && (
            <div className="lesson-card">
              <strong>عرض ثلاثي الأبعاد للصورة المقصوصة</strong>
              <p className="lesson-detail">
                ما يظهر في المشهد هو المنطقة التي اخترتها في نافذة القص فقط،
                ثم تُعرض كلوحة في الفضاء وتدور مع الإعدادات أعلاه.
              </p>
            </div>
          )}
          {isHeart && !teacherImageUrl && (
            <p className="lesson-muted">
              اختر صورة ثم قص الرسم لإزالة الزوائد قبل عرضه في المشهد.
            </p>
          )}
          {!isHeart && selectedGltfName && (
            <div className="lesson-card">
              <strong>اسم الجزء (في الملف)</strong>
              <p className="lesson-detail">{selectedGltfName}</p>
              <p className="lesson-muted tiny">
                يمكن تسمية الأجزاء في Blender ووضع وصف عربي لاحقاً عبر لوحة
                الأستاذ.
              </p>
              <button
                type="button"
                className="lesson-link"
                onClick={() => setSelectedGltfName(null)}
              >
                إلغاء التحديد
              </button>
            </div>
          )}
          {!isHeart && !selectedGltfName && (
            <p className="lesson-muted">
              {effectiveGltfUrl
                ? "اضغط على جزء من النموذج إن وُجدت أجزاء منفصلة."
                : "ارفع نموذجاً أولاً."}
            </p>
          )}
        </section>

        <section className="lesson-section">
          <h2 className="lesson-h2">مشاركة مع التلاميذ</h2>
          <div className="lesson-row">
            <button type="button" className="lesson-btn primary" onClick={copyLink}>
              {copyDone ? "تم نسخ الرابط" : "نسخ الرابط"}
            </button>
            <button
              type="button"
              className="lesson-btn"
              onClick={() => setShowQr((v) => !v)}
            >
              {showQr ? "إخفاء QR" : "رمز QR"}
            </button>
          </div>
          {showQr && shareUrl && (
            <div className="qr-box">
              <QRCodeSVG value={shareUrl} size={168} level="M" />
              <p className="qr-hint">يفتح نفس الدرس على جهاز التلميذ.</p>
            </div>
          )}
        </section>
      </aside>

      <main className="lesson-canvas-host" ref={canvasHostRef}>
        <video
          ref={videoRef}
          playsInline
          style={{
            display: isActive ? "block" : "none",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
            zIndex: 0,
          }}
        />
        {/* AR HUD overlay */}
        {isActive && (
          <div className="ar-hud">
            {!handData && (
              <div className="ar-hud-prompt">
                <div className="ar-scan-ring" />
                <p>ضع يدك أمام الكاميرا ✋</p>
              </div>
            )}
            {handData && (
              <div className="ar-status-badge">
                <span className="ar-dot" /> يد مكتشفة · القلب على يدك
              </div>
            )}
          </div>
        )}
        <div className="lesson-main-stage" style={{ zIndex: 1 }}>
          <div className="lesson-canvas-inner">
            {!showCanvas && (

              <div className="canvas-placeholder">
                <p>ارفع ملف GLB من الشريط الجانبي لعرضه هنا.</p>
              </div>
            )}
            {showCanvas && (
              <Canvas
                shadows
                camera={{ position: [0, 0.35, 4.1], fov: 45 }}
                gl={{ antialias: true, alpha: isActive }}
                style={isActive ? { background: "transparent" } : {}}
                dpr={[1, 2]}
                onPointerMissed={clearSelection}
              >
                <Suspense fallback={null}>
                  {!isActive && <SceneBackdrop />}
                  {isActive && handData && (
                    <HandLight x={handData.palmPosition.x} y={handData.palmPosition.y} />
                  )}
                  {isActive && (
                    <ambientLight intensity={0.3} />
                  )}
                  <RotatingGroup enabled={autoRotate && !isActive} speed={0.42}>
                    <HandTrackedModel handData={isActive ? handData : null} baseScale={1}>
                      {isHeart && teacherImageUrl && (
                        <ImageTo3dVolume
                          key={teacherImageUrl}
                          url={teacherImageUrl}
                          modelScale={modelScale}
                          depthScale={0.45}
                        />
                      )}
                      {isHeart && !teacherImageUrl && <BeatingHeart3D />}
                      {!isHeart && isProceduralLesson && ProceduralComponent && (
                        <group scale={[modelScale, modelScale, modelScale]}>
                          <ProceduralComponent />
                        </group>
                      )}
                      {!isProceduralLesson && effectiveGltfUrl && lesson.kind === "gltf-artifact" && (
                        <group scale={[2.5, 2.5, 2.5]}>
                          <ArtifactGltfModel url={effectiveGltfUrl} modelScale={modelScale} />
                        </group>
                      )}
                      {!isProceduralLesson && effectiveGltfUrl && lesson.kind !== "gltf-artifact" && (
                        <GltfScene
                          url={effectiveGltfUrl}
                          modelScale={modelScale * 0.08}
                          selectedName={selectedGltfName}
                          onSelectName={onGltfSelect}
                          xrayMode={xrayMode}
                        />
                      )}
                    </HandTrackedModel>
                  </RotatingGroup>
                  <OrbitControls
                    enablePan
                    minDistance={1.2}
                    maxDistance={12}
                    target={[0, 0.1, 0]}
                  />
                </Suspense>
              </Canvas>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
