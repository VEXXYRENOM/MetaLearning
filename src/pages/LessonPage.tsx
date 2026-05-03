import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
  type ChangeEvent,
} from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { OrbitControls, Html, Bounds } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { QRCodeSVG } from "qrcode.react";
import { getLesson, type LessonKind } from "../data/lessons";
import { supabase } from "../services/supabaseClient";
import { GltfScene } from "../components/lesson/GltfScene";
import { ArtifactGltfModel } from "../components/experience/ArtifactGltfModel";
import { RotatingGroup } from "../components/lesson/RotatingGroup";
import { SceneBackdrop } from "../components/lesson/SceneBackdrop";
import { ImageTo3dVolume } from "../components/lesson/ImageTo3dVolume";
import { useMediaPipe } from "../hooks/useMediaPipe";
import { HandTrackedModel } from "../components/lesson/HandTrackedModel";
import { HandLight } from "../components/lesson/HandLight";
import { ImageCropModal } from "../components/lesson/ImageCropModal";
import { ThreeErrorBoundary } from "../components/ThreeErrorBoundary";
import { MetaTags } from "../components/MetaTags";
import { showToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { LessonQA } from "../components/lesson/LessonQA";
import { QuizEditor } from "../components/lesson/QuizEditor";
import { QuizOverlay } from "../components/lesson/QuizOverlay";
import { LessonRating } from "../components/lesson/LessonRating";
import { useClassroomSync, type CameraState } from "../hooks/useClassroomSync";
import { useHotspots, HotspotMarker, PendingHotspotMarker, HotspotForm } from "../components/lesson/HotspotSystem";
import { Target, Brain } from "lucide-react";
import { useLearningAnalytics } from "../lib/learningAnalytics";
import { AITutorCard } from "../components/AITutorCard";
import { useCinematicTour } from "../hooks/useCinematicTour";
import { ExplodedView } from "../components/lesson/ExplodedView";
import { DynamicEnvironment } from "../components/lesson/DynamicEnvironment";
import { useTranslation } from "react-i18next";

// ── Premium 3D loading spinner shown while lazy components load ──────────────
const ThreeDLoading = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', minHeight: '400px',
    color: '#94a3b8', gap: '16px',
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }}/>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: '0.9rem' }}>جاري تحميل النموذج ثلاثي الأبعاد...</span>
  </div>
);

// --- Lazy Load remaining procedural 3D Assets (not yet replaced by GLB) ---
const FunctionGraph3D = lazy(() => import("../components/lesson/FunctionGraph3D").then(m => ({ default: m.FunctionGraph3D })));
const GeometricVolumes3D = lazy(() => import("../components/lesson/GeometricVolumes3D").then(m => ({ default: m.GeometricVolumes3D })));
const CarthageRuins3D = lazy(() => import("../components/lesson/CarthageRuins3D").then(m => ({ default: m.CarthageRuins3D })));
const KairouanMosque3D = lazy(() => import("../components/lesson/KairouanMosque3D").then(m => ({ default: m.KairouanMosque3D })));
const ArabicLetters3D = lazy(() => import("../components/lesson/ArabicLetters3D").then(m => ({ default: m.ArabicLetters3D })));
const VocalAnatomy3D = lazy(() => import("../components/lesson/VocalAnatomy3D").then(m => ({ default: m.VocalAnatomy3D })));
const RoomObjects3D = lazy(() => import("../components/lesson/RoomObjects3D").then(m => ({ default: m.RoomObjects3D })));
const ColorWheel3D = lazy(() => import("../components/lesson/ColorWheel3D").then(m => ({ default: m.ColorWheel3D })));
const Pottery3D = lazy(() => import("../components/lesson/Pottery3D").then(m => ({ default: m.Pottery3D })));
const PaintingFrame3D = lazy(() => import("../components/lesson/PaintingFrame3D").then(m => ({ default: m.PaintingFrame3D })));
const OrthographicProjection3D = lazy(() => import("../components/lesson/OrthographicProjection3D").then(m => ({ default: m.OrthographicProjection3D })));
const Vectors3D = lazy(() => import("../components/lesson/Vectors3D").then(m => ({ default: m.Vectors3D })));
const Transformations3D = lazy(() => import("../components/lesson/Transformations3D").then(m => ({ default: m.Transformations3D })));
const StatisticsProbability3D = lazy(() => import("../components/lesson/StatisticsProbability3D").then(m => ({ default: m.StatisticsProbability3D })));
const Sequences3D = lazy(() => import("../components/lesson/Sequences3D").then(m => ({ default: m.Sequences3D })));
const MathematicalLogic3D = lazy(() => import("../components/lesson/MathematicalLogic3D").then(m => ({ default: m.MathematicalLogic3D })));
const RobotKinematics3D = lazy(() => import("../components/lesson/RobotKinematics3D").then(m => ({ default: m.RobotKinematics3D })));

// ── Cinematic Tour Controller (lives inside Canvas for camera access) ─────────
export function CinematicTourController({ onStatusChange, children }: { onStatusChange: (label: string, touring: boolean) => void, children: React.ReactNode }) {
  const { status, frameLabel, toggleTour, tourRotation } = useCinematicTour();

  const prevLabel = React.useRef("");
  if (frameLabel !== prevLabel.current) {
    prevLabel.current = frameLabel;
    onStatusChange(frameLabel, status === "touring");
  }

  React.useEffect(() => {
    (window as any).__cinematicToggle = toggleTour;
    return () => { delete (window as any).__cinematicToggle; };
  }, [toggleTour]);

  return <group rotation={tourRotation}>{children}</group>;
}

/** خريطة تربط الأنواع الإجرائية المتبقية بمكوناتها */
const PROCEDURAL_COMPONENTS: Partial<Record<LessonKind, React.FC>> = {
  // Biology/Science — still procedural (no GLB yet)
  "procedural-animal-cell": () => null, // fallback — shouldn't be reached
  "procedural-plant-cell":  () => null,
  // Math
  "procedural-function-graph":    FunctionGraph3D,
  "procedural-geometric-volumes": GeometricVolumes3D,
  "procedural-orthographic":      OrthographicProjection3D,
  "procedural-vectors":           Vectors3D,
  "procedural-transformations":   Transformations3D,
  "procedural-statistics":        StatisticsProbability3D,
  "procedural-sequences":         Sequences3D,
  "procedural-logic":             MathematicalLogic3D,
  "procedural-kinematics":        RobotKinematics3D,
  // History/Languages/Art
  "procedural-carthage":          CarthageRuins3D,
  "procedural-kairouan":          KairouanMosque3D,
  "procedural-arabic-letters":    ArabicLetters3D,
  "procedural-vocal-anatomy":     VocalAnatomy3D,
  "procedural-room-objects":      RoomObjects3D,
  "procedural-color-wheel":       ColorWheel3D,
  "procedural-pottery":           Pottery3D,
  "procedural-painting":          PaintingFrame3D,
};

function isProcedural(kind: LessonKind): boolean {
  return kind.startsWith("procedural-");
}

/** True if the id looks like a Supabase UUID (e.g. "3f7a-bc12-...") */
function isUUID(id: string | undefined): boolean {
  return !!id && id.length > 20 && id.includes("-");
}

export function LessonPage() {
  const { t, i18n } = useTranslation();
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get("session") ?? "");
  const { profile } = useAuth();
  const isTeacher = profile?.role === "teacher";

  const [resolvedLesson, setResolvedLesson] = useState(() => getLesson(lessonId));
  const [dbLoading, setDbLoading] = useState(false);
  const [cachedGlbUrl, setCachedGlbUrl] = useState<string | null>(null);
  const [cacheChecked, setCacheChecked] = useState(false);
  // Standardize ID for DB features (QA, Hotspots, Analytics)
  const [dbLessonId, setDbLessonId] = useState<string | null>(isUUID(lessonId) ? lessonId! : null);

  // If lessonId is a Supabase UUID, fetch model_key from DB to resolve the preset
  useEffect(() => {
    if (isUUID(lessonId) && !resolvedLesson) {
      setDbLoading(true);
      supabase
        .from("lessons")
        .select("model_key")
        .eq("id", lessonId)
        .maybeSingle()  // ← maybeSingle avoids 406 when row not found
        .then(({ data }) => {
          if (data?.model_key) {
            const found = getLesson(data.model_key);
            setResolvedLesson(found ?? undefined);
          }
          setDbLoading(false);
        });
    }
  }, [lessonId, resolvedLesson]);

  // Resolve dbLessonId from sessionId if lessonId is a slug
  useEffect(() => {
    if (sessionId && !isUUID(dbLessonId || undefined)) {
      supabase
        .from("sessions")
        .select("lesson_id")
        .eq("id", sessionId)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.lesson_id) setDbLessonId(data.lesson_id);
        });
    } else if (isUUID(lessonId) && dbLessonId !== lessonId) {
      setDbLessonId(lessonId!);
    }
  }, [sessionId, lessonId, dbLessonId]);

  // If student joins without sessionId, try to find an active session for this lesson
  useEffect(() => {
    if (!sessionId && lessonId && !isTeacher) {
      // Try query by UUID first, then by slug (model_key)
      const query = isUUID(lessonId) 
        ? supabase.from("sessions").select("id").eq("lesson_id", lessonId)
        : supabase.from("sessions").select("id, lessons!inner(model_key)").eq("lessons.model_key", lessonId);

      query
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }: any) => {
          if (data?.id) {
            setSessionId(data.id);
          }
        });
    }
  }, [lessonId, sessionId, isTeacher]);

  // Check generated_assets cache for pre-baked GLB versions of this lesson
  useEffect(() => {
    if (!resolvedLesson?.id) {
      // No preset to check — render procedural immediately
      setCacheChecked(true);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from('generated_assets')
          .select('glb_url')
          .eq('prompt_hash', resolvedLesson.id)
          .maybeSingle();
        if (data?.glb_url) {
          setCachedGlbUrl(data.glb_url);
        }
      } catch {
        // Ignore errors silently
      } finally {
        // Always mark as checked so canvas can render
        setCacheChecked(true);
      }
    })();
  }, [resolvedLesson?.id]);

  // Use resolvedLesson everywhere (replaces the old `lesson` variable)
  const lesson = resolvedLesson;
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
  
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [showQuizOverlay, setShowQuizOverlay] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  
  const [showAITutor, setShowAITutor] = useState(false);
  const [bloomEnabled, setBloomEnabled] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourLabel, setTourLabel]       = useState("");
  const [explodedView, setExplodedView] = useState(false);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const [remoteCam, setRemoteCam] = useState<CameraState | null>(null);
  const { handData, startTracking, stopTracking, isActive, isLoading } = useMediaPipe({ enabled: false, videoRef });

  // ── X-1: Live Classroom Sync ──────────────────────────────────────────────
  const { broadcastCamera } = useClassroomSync({
    sessionId,
    role: isTeacher ? "teacher" : "student",
    teacherId: profile?.id ?? "",
    onRemoteUpdate: (cam) => {
      setRemoteCam(cam);
    },
  });

  // Apply remote camera to OrbitControls (students only)
  useEffect(() => {
    if (!remoteCam || isTeacher) return;
    const oc = orbitRef.current;
    if (!oc) return;
    const { position, target } = remoteCam;
    oc.object.position.set(...position);
    oc.target.set(...target);
    oc.update();
  }, [remoteCam, isTeacher]);
  // ─────────────────────────────────────────────────────────────────────────

  // ── X-2: Spatial Annotator (Hotspots) ────────────────────────────────────
  const {
    hotspots,
    pendingPos,
    placingMode,
    setPlacingMode,
    handleModelClick,
    saveHotspot,
    deleteHotspot,
    cancelPending,
  } = useHotspots(dbLessonId || undefined, isTeacher);
  // ─────────────────────────────────────────────────────────────────────────

  // ── X-3: Spatial Analytics Engine ────────────────────────────────────────
  const { trackHotspotClick, trackQuizAnswer } = useLearningAnalytics({
    lessonId: dbLessonId || "",
    studentId: profile?.id || "",
    sessionId: sessionId,
    enabled: !isTeacher && isUUID(dbLessonId || ""),
    onEnd: (duration) => {
      // Could auto-trigger AI Tutor here
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

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
      showToast({ type: 'success', title: 'Link Copied!', message: 'Lesson URL copied to clipboard' });
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
      showToast({ type: 'error', title: 'Copy Failed', message: 'Could not access clipboard' });
    }
  };

  const requestFullscreen = () => {
    const el = canvasHostRef.current;
    if (!el) return;
    void el.requestFullscreen?.();
  };

  // Show loading while resolving UUID from Supabase
  if (dbLoading) {
    return (
      <div style={{
        height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#0a0e14", color: "#a78bfa", gap: "1rem"
      }}>
        <div style={{ width: 48, height: 48, border: "4px solid #a78bfa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Loading lesson…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!lesson) {
    return <Navigate to="/" replace />;
  }

  const gltfSource = (lesson.kind === "gltf-url" || lesson.kind === "gltf-artifact" || lesson.kind === "local-model") ? lesson.gltfUrl : null;
  const effectiveGltfUrl =
    cachedGlbUrl || (lesson.kind === "gltf-upload" ? uploadUrl : gltfSource);

  // If we have a cached GLB, completely disable the procedural components logic
  const isProceduralLesson = isProcedural(lesson.kind) && !cachedGlbUrl;
  // Don't show canvas until cache check completes for procedural, but show immediately for known GLBs
  const showCanvas = (cacheChecked || Boolean(effectiveGltfUrl)) && (isProceduralLesson || Boolean(effectiveGltfUrl) || Boolean(cachedGlbUrl));
  const isHeart = lesson.id === "heart" && !cachedGlbUrl;
  const ProceduralComponent = PROCEDURAL_COMPONENTS[lesson.kind as LessonKind] || null;

  return (
    <div className="lesson-layout">
      <MetaTags
        title={lesson.titleEn || lesson.titleAr}
        description={`Interactive 3D lesson: ${lesson.titleEn || lesson.titleAr}. Powered by MetaLearning AI.`}
        path={`/lesson/${lessonId}`}
      />
      {dbLessonId && profile && (
        <LessonQA lessonId={dbLessonId} studentId={profile.id} isTeacher={isTeacher} />
      )}
      {showQuizEditor && dbLessonId && <QuizEditor lessonId={dbLessonId} onClose={() => setShowQuizEditor(false)} />}
      {showQuizOverlay && dbLessonId && (
        <QuizOverlay 
          lessonId={dbLessonId} 
          onClose={() => setShowQuizOverlay(false)} 
          onComplete={(score) => {
            setQuizScore(score);
            trackQuizAnswer("quiz_overall", score > 50, `Score: ${score}`);
          }}
        />
      )}
      {showAITutor && profile?.role === 'student' && (
        <AITutorCard
          studentId={profile.id}
          lessonId={dbLessonId || ""}
          sessionId={sessionId}
          onClose={() => setShowAITutor(false)}
        />
      )}
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
        <Link className="lesson-back" to={
          profile?.role === "teacher" ? "/teacher/create"
          : profile?.role === "creator" ? "/creator/lab"
          : profile?.role === "admin"   ? "/admin"
          : profile?.role === "student" ? "/student/dashboard"
          : "/"
        }>
          ← {profile?.role === "teacher" ? "لوحة المعلم" : profile?.role === "student" ? "لوحتي" : "الرئيسية"}
        </Link>
        <p className="lesson-subject">{lesson.subjectAr}</p>
        <h1 className="lesson-title">{i18n.language === 'ar' ? lesson.titleAr : (lesson.titleEn || lesson.titleAr)}</h1>
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
          <h2 className="lesson-h2">{i18n.language === 'ar' ? 'العرض' : 'View'}</h2>
          <div className="lesson-row">
            <button
              type="button"
              className="lesson-btn"
              onClick={() => setModelScale((s) => Math.max(0.45, s - 0.15))}
            >
              {i18n.language === 'ar' ? 'تصغير' : 'Zoom Out'}
            </button>
            <button
              type="button"
              className="lesson-btn"
              onClick={() => setModelScale((s) => Math.min(2.2, s + 0.15))}
            >
              {i18n.language === 'ar' ? 'تكبير' : 'Zoom In'}
            </button>
            <button
              type="button"
              className="lesson-btn ghost"
              onClick={() => setModelScale(1)}
            >
              {i18n.language === 'ar' ? 'إعادة ضبط' : 'Reset'}
            </button>
          </div>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            {i18n.language === 'ar' ? 'تدوير تلقائي (حول المحور الرأسي)' : 'Auto Rotate'}
          </label>
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={xrayMode}
              onChange={(e) => setXrayMode(e.target.checked)}
            />
            {i18n.language === 'ar' ? 'رؤية استكشافية (X-Ray Mode)' : 'X-Ray Mode'}
          </label>
          <button
            type="button"
            className="lesson-btn ghost full-width"
            onClick={requestFullscreen}
          >
            {i18n.language === 'ar' ? 'ملء الشاشة (المشهد)' : 'Fullscreen Scene'}
          </button>
          <button
            type="button"
            className={`lesson-btn full-width ${bloomEnabled ? 'primary' : 'ghost'}`}
            style={bloomEnabled ? { background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', border: 'none' } : {}}
            onClick={() => setBloomEnabled(v => !v)}
          >
            {bloomEnabled ? (i18n.language === 'ar' ? '✨ وضع السينمائي: تشغيل' : '✨ Cinematic: ON') : (i18n.language === 'ar' ? '✨ وضع السينمائي: إيقاف' : '✨ Cinematic: OFF')}
          </button>
          <button
            type="button"
            className={`lesson-btn full-width ${explodedView ? 'primary' : 'ghost'}`}
            style={explodedView ? { background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', border: 'none' } : {}}
            onClick={() => setExplodedView(v => !v)}
          >
            {explodedView ? (i18n.language === 'ar' ? '🔩 إعادة التجميع' : '🔩 Reassemble') : (i18n.language === 'ar' ? '💥 تفكيك المجسم' : '💥 Explode View')}
          </button>
          <button
            type="button"
            className={`lesson-btn full-width ${isTourActive ? 'primary' : 'ghost'}`}
            style={isTourActive ? { background: 'linear-gradient(135deg, #0ea5e9, #10b981)', color: '#fff', border: 'none' } : {}}
            onClick={() => (window as any).__cinematicToggle?.()}
          >
            {isTourActive
              ? `⏹ إيقاف الجولة  •  ${tourLabel}`
              : '▶ جولة سينمائية'}
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
          <h2 className="lesson-h2">التفاعل والتقييم</h2>
          <div className="lesson-row" style={{ flexDirection: "column", gap: "10px" }}>
            {isTeacher ? (
              <>
                <button type="button" className="lesson-btn" onClick={() => {
                  if (dbLessonId) setShowQuizEditor(true);
                  else showToast(i18n.language === 'ar' ? "الاختبارات الذكية متوفرة فقط للدروس المخصصة." : "AI Quizzes are only available for custom lessons.", "error");
                }}>
                  {i18n.language === 'ar' ? 'إدارة الاختبار' : 'Manage Quiz'}
                </button>
                <button 
                  type="button" 
                  className={`lesson-btn ${placingMode ? 'primary' : ''}`}
                  onClick={() => setPlacingMode(!placingMode)}
                  style={placingMode ? { background: '#06b6d4', color: '#000', borderColor: '#06b6d4' } : {}}
                >
                  <Target size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} /> 
                  {placingMode ? "إلغاء وضع النقاط" : "إضافة نقاط تفاعلية (Hotspot)"}
                </button>
              </>
            ) : (
              <button type="button" className="lesson-btn primary" onClick={() => {
                  if (dbLessonId) setShowQuizOverlay(true);
                  else showToast(i18n.language === 'ar' ? "هذا الدرس الافتراضي لا يحتوي على اختبار." : "This preset lesson has no quiz.", "error");
                }}>
                {i18n.language === 'ar' ? 'إجراء الاختبار' : 'Take Quiz'}
              </button>
            )}
            {!isTeacher && profile && isUUID(lessonId) && (
              <button
                className="lesson-btn ghost full-width"
                onClick={() => setShowAITutor(true)}
              >
                {i18n.language === 'ar' ? 'تحدث مع المعلم الذكي' : 'Feedback (AI Tutor)'}
              </button>
            )}
          </div>
          
          {!isTeacher && lessonId && profile && (
            <div style={{ marginTop: "1rem" }}>
              <LessonRating lessonId={lessonId} studentId={profile.id} />
            </div>
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
        
        {/* Render Hotspot Form outside canvas for crisp text */}
        {pendingPos && profile && isTeacher && (
          <HotspotForm
            teacherId={profile.id}
            onSave={saveHotspot}
            onCancel={cancelPending}
          />
        )}

        <div className="lesson-main-stage" style={{ zIndex: 1 }}>
          <div className="lesson-canvas-inner">
            {!showCanvas && (
              <div className="canvas-placeholder">
                <p>ارفع ملف GLB من الشريط الجانبي لعرضه هنا.</p>
              </div>
            )}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              style={{
                position: isActive ? "absolute" : "fixed",
                top: isActive ? 0 : "-9999px",
                left: isActive ? 0 : "-9999px",
                width: isActive ? "100%" : "1px",
                height: isActive ? "100%" : "1px",
                objectFit: "cover",
                zIndex: 0,
                transform: "scaleX(-1)", // Mirror the camera feed
              }}
            />
            {showCanvas && (
              <ThreeErrorBoundary>
              <React.Suspense fallback={<ThreeDLoading />}>
            <Canvas
                shadows={false}
                camera={{ fov: 45 }}
                gl={{ antialias: false, alpha: isActive, powerPreference: "high-performance" }}
                style={isActive ? { background: "transparent" } : {}}
                dpr={1}
                onPointerMissed={clearSelection}
              >
                <Suspense fallback={
                  <Html center>
                    <div style={{ color: '#38bdf8', fontFamily: 'system-ui', textAlign: 'center', width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #0f172a', borderTopColor: '#38bdf8', borderRadius: '50%', marginBottom: '10px' }} />
                      <div style={{ fontWeight: 'bold' }}>جاري الحوسبة (Building 3D Mesh)...</div>
                    </div>
                  </Html>
                }>
                  {/* 🌍 Dynamic Environment — adapts to lesson subject */}
                  {!isActive && (
                    <DynamicEnvironment
                      subjectEn={lesson.subjectEn}
                      subjectAr={lesson.subjectAr}
                    />
                  )}
                  {isActive && handData && (
                    <HandLight x={handData.palmPosition.x} y={handData.palmPosition.y} />
                  )}
                  {isActive && (
                    <ambientLight intensity={0.3} />
                  )}
                  <RotatingGroup enabled={autoRotate && !isActive} speed={0.42}>
                    <HandTrackedModel handData={isActive ? handData : null} baseScale={1}>
                      <Bounds fit clip observe margin={1.2}>
                      {/* 🎥 Cinematic Tour Controller wraps the models to rotate them */}
                      <CinematicTourController
                        onStatusChange={(label, touring) => {
                          setTourLabel(label);
                          setIsTourActive(touring);
                          if (touring) setAutoRotate(false);
                        }}
                      >
                      <group onPointerUp={handleModelClick}>
                        {isHeart && teacherImageUrl && (
                          <ImageTo3dVolume
                            key={teacherImageUrl}
                            url={teacherImageUrl}
                            modelScale={modelScale}
                            depthScale={0.45}
                          />
                        )}
                        {!isHeart && isProceduralLesson && ProceduralComponent && (
                          <group scale={[modelScale, modelScale, modelScale]}>
                            <ProceduralComponent />
                          </group>
                        )}
                        {!isProceduralLesson && effectiveGltfUrl && lesson.kind === "gltf-artifact" && !cachedGlbUrl && (
                          <ExplodedView exploded={explodedView}>
                            <group scale={[2.5, 2.5, 2.5]}>
                              <ArtifactGltfModel url={effectiveGltfUrl} modelScale={modelScale} />
                            </group>
                          </ExplodedView>
                        )}
                        {!isProceduralLesson && effectiveGltfUrl && (lesson.kind !== "gltf-artifact" || cachedGlbUrl) && (
                          <ExplodedView exploded={explodedView}>
                            <GltfScene
                              url={effectiveGltfUrl}
                              modelScale={cachedGlbUrl ? modelScale * 1.5 : modelScale * 0.08}
                              selectedName={selectedGltfName}
                              onSelectName={onGltfSelect}
                              xrayMode={xrayMode}
                            />
                          </ExplodedView>
                        )}
                        
                        {/* Hotspot Markers */}
                        {hotspots?.map((hs) => (
                          <HotspotMarker 
                            key={hs.id} 
                            hotspot={hs} 
                            isTeacher={isTeacher} 
                            onDelete={deleteHotspot}
                            onClick={() => trackHotspotClick(hs.id, hs.title)}
                          />
                        ))}
                        {pendingPos && <PendingHotspotMarker position={pendingPos} />}
                      </group>
                      </CinematicTourController>
                      </Bounds>
                    </HandTrackedModel>
                  </RotatingGroup>

                  <OrbitControls
                    ref={orbitRef}
                    makeDefault
                    enablePan
                    minDistance={1.2}
                    maxDistance={12}
                    target={[0, 0.1, 0]}
                    onChange={() => {
                      if (!isTeacher || !orbitRef.current) return;
                      const cam = orbitRef.current.object;
                      const tgt = orbitRef.current.target;
                      broadcastCamera({
                        position: [cam.position.x, cam.position.y, cam.position.z],
                        target: [tgt.x, tgt.y, tgt.z],
                      });
                    }}
                  />

                  {/* ✨ Cinematic Post-Processing (Disabled on Mobile for FPS) */}
                  {bloomEnabled && !isActive && !isMobile && (
                    <EffectComposer>
                      <Bloom
                        intensity={1.2}
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        kernelSize={KernelSize.LARGE}
                        blendFunction={BlendFunction.ADD}
                        mipmapBlur
                      />
                      <Vignette
                        offset={0.3}
                        darkness={0.7}
                        blendFunction={BlendFunction.NORMAL}
                      />
                    </EffectComposer>
                  )}

                </Suspense>
              </Canvas>
              </React.Suspense>
              </ThreeErrorBoundary>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
