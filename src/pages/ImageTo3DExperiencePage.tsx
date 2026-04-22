import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Stars } from "@react-three/drei";

import {
  UploadCloud,
  Activity,
  Hand,
  RefreshCw,
  Search,
  Cpu,
  ChevronLeft,
  Box,
  Bot,
  CloudLightning,
  CheckCircle,
  Wifi,
  Send,
  Wand2,
  Scissors,
} from "lucide-react";

import { DepthMesh3D } from "../components/experience/DepthMesh3D";
import { HandFollowGroup } from "../components/experience/HandFollowGroup";
import { True3DViewer } from "../components/experience/True3DViewer";
import { Procedural3DObject } from "../components/experience/Procedural3DObject";
import { useMediaPipe } from "../hooks/useMediaPipe";

import { generateImageTo3D } from "../services/threeDGenerationService";
import { matchPromptToPresetModel, translateForCategory, detectCategory3D } from "../services/freeAiEngine";
import { searchGlobal3DModels } from "../services/globalModelSearchService";
import { huggingfaceTextTo3DPipeline } from "../services/huggingfaceTextTo3D";
import "../ai-lab.css";

// ── Helpers ────────────────────────────────────────────────────────────────

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

// ── Stage Tracker Data ─────────────────────────────────────────────────────

export type SF3DStatus = "REMOVING_BG" | "CONNECTING" | "UPLOADING" | "PROCESSING" | "SUCCEEDED" | "FAILED";

interface Stage {
  key: SF3DStatus;
  label: string;
  icon: React.ElementType;
}

// STAGES moved inside component for t() access


// getStageIndex moved inside component for STAGES access


// ── Component ──────────────────────────────────────────────────────────────

export function ImageTo3DExperiencePage({ defaultInputType = "image" }: { defaultInputType?: "image" | "text" }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const STAGES: Stage[] = [
    { key: "REMOVING_BG", label: t("generation_stages.removing_bg"),  icon: Scissors    },
    { key: "CONNECTING",  label: t("generation_stages.connecting"),   icon: Wifi        },
    { key: "UPLOADING",   label: t("generation_stages.uploading"),    icon: Send        },
    { key: "PROCESSING",  label: t("generation_stages.processing"),   icon: Wand2       },
    { key: "SUCCEEDED",   label: t("generation_stages.completed"),    icon: CheckCircle },
  ];

  const inputType = defaultInputType;

  function getStageIndex(status: string | null): number {
    if (!status) return -1;
    return STAGES.findIndex((s: Stage) => s.key === status);
  }

  const [textPrompt, setTextPrompt]   = useState("");

  const [imageUri, setImageUri]       = useState<string | null>(null);
  const [processing, setProcessing]   = useState(false);
  const [mode, setMode]               = useState<"2.5d" | "3d" | "procedural">("procedural");
  const [displacementScale, setDisplacementScale] = useState(0.65);
  const [procedural3DCategory, setProcedural3DCategory] = useState<string | null>(null);

  const [sf3dStatus,   setSf3dStatus]   = useState<string | null>(null);
  const [sf3dMessage,  setSf3dMessage]  = useState<string>("");
  const [sf3dProgress, setSf3dProgress] = useState(0);
  const [sf3dError,    setSf3dError]    = useState<string | null>(null);
  const [true3dGlbUrl, setTrue3dGlbUrl] = useState<string | null>(null);

  // Controls
  const [biological,    setBiological]    = useState(true);
  const [handTracking,  setHandTracking]  = useState(false);
  const [autoRotate,    setAutoRotate]    = useState(true);

  // Animated percentage display (smooth counter)
  const displayRef   = useRef(0);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    if (!processing) { displayRef.current = 0; setDisplayPct(0); return; }
    const id = setInterval(() => {
      if (displayRef.current < sf3dProgress) {
        displayRef.current = Math.min(displayRef.current + 1, sf3dProgress);
        setDisplayPct(displayRef.current);
      }
    }, 25);
    return () => clearInterval(id);
  }, [sf3dProgress, processing]);

  const { videoRef, palm, ready: handsReady, error: handsError } =
    useMediaPipe({ enabled: handTracking && Boolean(imageUri) });

  // ── Image Pick & Pipeline ──────────────────────────────────────────────

  const onPickImage = useCallback(async (file: File | null) => {
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setSf3dStatus("FAILED");
      setSf3dError("❌ صيغة غير مدعومة! يرجى رفع صورة JPG أو PNG أو WEBP.");
      setImageUri(null);
      return;
    }

    // Validate size (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSf3dStatus("FAILED");
      setSf3dError("❌ الصورة كبيرة جداً! الحد الأقصى هو 10 ميغابايت.");
      setImageUri(null);
      return;
    }

    setProcessing(true);
    setImageUri(null);
    setTrue3dGlbUrl(null);
    setSf3dStatus(null);
    setSf3dMessage("");
    setSf3dError(null);
    setSf3dProgress(0);
    displayRef.current = 0;

    try {
      const uri = await fileToDataUri(file);

      if (mode === "3d") {
        const result = await generateImageTo3D(uri, (p, s, msg) => {
          setSf3dProgress(p);
          setSf3dStatus(s);
          setSf3dMessage(msg);
        });
        setTrue3dGlbUrl(result.modelUrl);
        setImageUri(uri);
        setProcessing(false);
      } else {
        setTimeout(() => {
          setImageUri(uri);
          setProcessing(false);
        }, 200);
      }
    } catch (err: any) {
      console.error("[ImageTo3D]", err);
      setSf3dStatus("FAILED");
      setSf3dError(err?.message || "حدث خطأ غير متوقع.");
      setProcessing(false);
    }
  }, [mode]);

  // ── Text To 3D Logic ───────────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    setProcessing(false);
    setSf3dStatus("FAILED");
    setSf3dError("تم إلغاء التوليد بنجاح.");
    setSf3dProgress(0);
  }, []);

  const handleTextSubmit = async () => {
    if (!textPrompt.trim()) return;
    
    setProcessing(true);
    setImageUri(null);
    setTrue3dGlbUrl(null);
    setSf3dError(null);
    setProcedural3DCategory(null);
    setSf3dStatus("CONNECTING");
    setSf3dMessage("🧠 جاري تحليل و فهم طلبك...");
    setSf3dProgress(5);
    displayRef.current = 5;

    const SVG_PLACEHOLDER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==";

    // ── الأولوية 1: مطابقة الدروس الجاهزة ─────────────────────────────
    const presetId = matchPromptToPresetModel(textPrompt);
    if (presetId) {
      setSf3dMessage("✅ تم إيجاد درس تفاعلي مطابق!");
      setSf3dProgress(80);
      setTimeout(() => {
        setSf3dProgress(100);
        setSf3dStatus("SUCCEEDED");
        setProcessing(false);
        navigate(`/lesson/${presetId}`);
      }, 1000);
      return;
    }

    // ── الأولوية 2: البحث في مكتبات المجسمات المجانية (سريع وموثوق) ──
    setSf3dProgress(20);
    try {
      const globalResult = await searchGlobal3DModels(textPrompt, (msg) => {
        setSf3dMessage(msg);
      });
      if (globalResult) {
        setSf3dProgress(100);
        setSf3dStatus("SUCCEEDED");
        setSf3dMessage(`🎉 ${globalResult.name} — ${globalResult.source}`);
        setMode("3d");
        setTrue3dGlbUrl(globalResult.url);
        setImageUri(SVG_PLACEHOLDER);
        setTextPrompt("");
        setProcessing(false);
        return;
      }
    } catch (err: any) {
      console.warn("Global search failed:", err);
    }

    // ── الأولوية 3: توليد AI حقيقي عبر HuggingFace (نص → صورة → 3D) ──────
    setSf3dProgress(35);
    setSf3dMessage("🤖 لم يُعثر على مجسم جاهز، جاري التوليد بالذكاء الاصطناعي...");
    try {
      const glbUrl = await huggingfaceTextTo3DPipeline(
        textPrompt,
        (progress, _status, message) => {
          // Scale HF progress (0→100) into our range (35→95)
          const scaled = 35 + Math.round(progress * 0.60);
          setSf3dProgress(scaled);
          setSf3dStatus("PROCESSING");
          setSf3dMessage(message);
        }
      );
      setSf3dProgress(100);
      setSf3dStatus("SUCCEEDED");
      setSf3dMessage("🎉 تم توليد المجسم بالذكاء الاصطناعي بنجاح!");
      setMode("3d");
      setTrue3dGlbUrl(glbUrl);
      setImageUri(SVG_PLACEHOLDER);
      setTextPrompt("");
      setProcessing(false);
      return;
    } catch (aiErr: any) {
      console.warn("[Text-to-3D] HuggingFace AI generation failed, falling back to Procedural:", aiErr);
      setSf3dMessage("⚠️ الذكاء الاصطناعي غير متاح الآن، جاري بناء مجسم إجرائي...");
    }

    // ── الأولوية 4: مجسم Three.js إجرائي (الملاذ الأخير — يعمل دائماً) ──
    setSf3dProgress(90);
    const englishWord = await translateForCategory(textPrompt);
    const category = detectCategory3D(englishWord);
    await new Promise(r => setTimeout(r, 400));
    setSf3dProgress(100);
    setSf3dStatus("SUCCEEDED");
    setSf3dMessage("✅ تم بناء مجسم إجرائي استناداً على تصنيف الموضوع.");
    setProcedural3DCategory(category);
    setMode("procedural");
    setImageUri("placeholder");
    setTextPrompt("");
    setProcessing(false);
  };

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (true3dGlbUrl?.startsWith("blob:")) URL.revokeObjectURL(true3dGlbUrl);
    };
  }, [true3dGlbUrl]);


  // ── Render helpers ─────────────────────────────────────────────────────

  const currentStageIdx = getStageIndex(sf3dStatus);

  function renderStageTracker() {
    return (
      <div className="stage-tracker">
        {STAGES.map((stage, i) => {
          const isDone   = i < currentStageIdx;
          const isActive = i === currentStageIdx;
          const cls = isDone ? "done" : isActive ? "active" : "";
          return (
            <div key={stage.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div className="stage-item">
                <div className={`stage-dot ${cls}`} />
                <span className={`stage-label ${cls}`}>{stage.label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`stage-connector ${isDone ? "done" : ""}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── JSX ────────────────────────────────────────────────────────────────

  return (
    <div className="ai-lab-layout" dir="ltr">

      {/* ─── HEADER ─── */}
      <header className="ai-lab-header">
        <Link className="ai-back-btn" to="/experience/hub">
          <ChevronLeft size={20} /> Back to Hub
        </Link>
        <div className="ai-lab-title">
          <Cpu className="title-icon" />
          <h1>{inputType === "image" ? "IMAGE TO 3D ENGINE" : "TEXT TO 3D ENGINE"}</h1>
        </div>
        <div className="ai-system-status" style={{ color: "#4ade80" }}>
          <span
            className="live-dot pulse-dot"
            style={{
              backgroundColor: "#4ade80",
              boxShadow: `0 0 10px #4ade80`,
            }}
          />
          Free Neural Engine Online
        </div>
      </header>

      <div className="ai-lab-body">

        {/* ─── LEFT CONTROL PANEL ─── */}
        <aside className="ai-cyber-panel">

          <div className="panel-section">
            <h3 className="cyber-title"><Wand2 size={18} /> Creation Mode</h3>

            {/* Tabs removed as we now have a Hub page to choose between them */}


            {/* Render Text Input Field OR Image Dropzone */}
            {inputType === "text" ? (
              <div style={{ direction: 'rtl' }}>
                <textarea 
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder="مثال: قلب إنسان ينجب، هرم مصري قديم، أو سيارة المستقبل..."
                  disabled={processing}
                  style={{
                    width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '12px',
                    padding: '16px', color: 'white', fontSize: '1rem', resize: 'none',
                    outline: 'none', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                  }}
                />
                <button 
                  onClick={handleTextSubmit}
                  disabled={processing || !textPrompt.trim()}
                  style={{
                    width: '100%', marginTop: '12px', padding: '14px', borderRadius: '12px',
                    background: 'linear-gradient(90deg, #7c3aed, #c026d3)', border: 'none',
                    color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                    opacity: (processing || !textPrompt.trim()) ? 0.5 : 1,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                  }}>
                  {processing ? <RefreshCw className="pulse-fast" size={20} /> : <Wand2 size={20} />}
                  {processing ? 'جاري التوليد بذكاء...' : 'توليد السحر الـ 3D الآن'}
                </button>
              </div>
            ) : (
              <label className={`ai-upload-dropzone ${processing ? "disabled" : ""}`}
                style={{ borderColor: "rgba(56, 189, 248, 0.4)" }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden-file-input"
                  disabled={processing}
                  onChange={e => void onPickImage(e.target.files?.[0] ?? null)}
                />
                <UploadCloud size={48} className="upload-icon" style={{ color: "#38bdf8" }} />
                <div className="upload-text">
                  {processing ? "Processing..." : "اسحب الصورة هنا أو اضغط للرفع"}
                </div>
                <small className="ai-badge-small">
                  <Box size={12} style={{ display: "inline", marginRight: 4 }} />
                  Instant · Local Displacement · Offline Engine
                </small>
              </label>
            )}

            <div className="cyber-toggles-list mt-6 mb-2">
              <label className="cyber-toggle-item" style={{ borderColor: mode === "3d" ? "#a855f7" : "" }}>
                <div className="toggle-info">
                  <CloudLightning size={16} color={mode === "3d" ? "#a855f7" : "#fff"} />
                  <span style={{ color: mode === "3d" ? "#a855f7" : "#fff", fontWeight: "bold" }}>
                    True 3D Mode (Stable Fast 3D API)
                  </span>
                  <small>Requires HF Space, may fail if free limit reached.</small>
                </div>
                <input
                  type="checkbox"
                  className="cyber-checkbox"
                  checked={mode === "3d"}
                  onChange={e => setMode(e.target.checked ? "3d" : "2.5d")}
                  disabled={processing}
                />
                <span className="cyber-slider" />
              </label>
            </div>


            {/* Success state */}
            {imageUri && !processing && mode !== "3d" && (
              <div className="ai-progress-container mt-4" style={{ borderColor: "#38bdf8" }}>
                <div className="ai-progress-text" style={{ color: "#38bdf8" }}>✅ Local 3D Engine Generated</div>
              </div>
            )}

            {/* Error state */}
            {sf3dStatus === "FAILED" && !processing && (
              <div className="ai-progress-container mt-4" style={{ borderColor: "#ef4444" }}>
                <span style={{ color: "#ef4444", fontSize: "0.85rem", direction: "rtl", display: "block" }}>
                  ⚠️ {sf3dError || "فشل التوليد. حاول مرة أخرى."}
                </span>
              </div>
            )}
          </div>

          <div className="panel-section mt-6">
            <h3 className="cyber-title"><Activity size={18} /> Scene Settings</h3>

            <div className="cyber-toggles-list mt-4">
              <label className="cyber-toggle-item"
                style={{ opacity: mode === "3d" ? 0.3 : 1, pointerEvents: mode === "3d" ? "none" : "auto" }}>
                <div className="toggle-info">
                  <Activity size={16} /> Bio-Rhythm Pulse
                  <small>Subtle breathing animation on the mesh</small>
                </div>
                <input type="checkbox" className="cyber-checkbox" checked={biological}
                  onChange={e => setBiological(e.target.checked)} />
                <span className="cyber-slider" />
              </label>

              <label className="cyber-toggle-item">
                <div className="toggle-info">
                  <Hand size={16} /> Hand Tracking (AR)
                  <small>Control the 3D view with your hand gestures</small>
                </div>
                <input type="checkbox" className="cyber-checkbox" checked={handTracking}
                  onChange={e => setHandTracking(e.target.checked)} />
                <span className="cyber-slider" />
              </label>

              <label className="cyber-toggle-item">
                <div className="toggle-info">
                  <RefreshCw size={16} /> Auto-Rotation
                </div>
                <input type="checkbox" className="cyber-checkbox" checked={autoRotate}
                  onChange={e => setAutoRotate(e.target.checked)} />
                <span className="cyber-slider" />
              </label>

            </div>

            {mode === "2.5d" && (
              <div className="cyber-slider-wrap mt-6">
                <label><Search size={16} /> 3D Depth Intensity</label>
                <input
                  type="range"
                  className="cyber-range"
                  min={0.05} max={0.8} step={0.01}
                  value={displacementScale}
                  onChange={e => setDisplacementScale(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="spacer" />

          <div className="cyber-hint-box text-center" style={{ direction: "rtl" }}>
            مجاني تمامًا · يعمل محلياً في متصفحك بشكل فوري وبدون انتظار السيرفرات بفضل MetaLearning Engine.
          </div>
        </aside>

        {/* ─── MAIN 3D STAGE ─── */}
        <main className="ai-hologram-stage">

          {/* Webcam HUD */}
          <div className={`hud-webcam-frame ${handTracking ? "active" : ""}`}>
            <div className="hud-corner top-left" /><div className="hud-corner top-right" />
            <div className="hud-corner bottom-left" /><div className="hud-corner bottom-right" />
            <video ref={videoRef} playsInline muted autoPlay className="hud-video-feed" />
            <div className="hud-scan-line" />
            {handsError  && <div className="hud-status error">{handsError}</div>}
            {!handsError &&  handsReady  && <div className="hud-status success">TRACKING LAUNCHED</div>}
            {!handsError && !handsReady  && handTracking && <div className="hud-status warn">AWAITING OPTICS...</div>}
          </div>

          {/* ── Empty state ── */}
          {!imageUri && !processing && (
            <div className="empty-hologram-state">
              <Cpu size={80} className="empty-icon pulse-fast" />
              <h2>Hologram Stage Awaiting Input</h2>
              <p>Type what you want to imagine or upload an image to generate an interactive 3D mesh instantly.</p>
            </div>
          )}

          {/* ── Processing state: Thinking Robot ── */}
          {processing && (
            <div className="empty-hologram-state loading-state">
              <div className="neural-robot-container">
                <div className="robot-halo" />
                <Bot size={72} className="robot-thinking" />
                <div className="laser-beam" />
                <div className="thinking-dots">
                  <div className="thinking-dot" />
                  <div className="thinking-dot" />
                  <div className="thinking-dot" />
                </div>
              </div>

              <div className="progress-percentage">{displayPct}%</div>
              
              {mode === "3d" && renderStageTracker()}

              <p className="progress-message" dir="rtl">{sf3dMessage}</p>

              <div className="ai-progress-track mt-4" style={{ width: "260px", height: "5px", marginBottom: "8px" }}>
                <div
                  className="ai-progress-fill"
                  style={{
                    width: `${Math.max(3, sf3dProgress)}%`,
                    background: "linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)",
                    boxShadow: "0 0 12px #a855f7",
                  }}
                />
              </div>
              
              <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px" }}>
                {sf3dProgress > 0 && sf3dProgress < 100 ? `⏳ الوقت المتبقي تقريباً: ${Math.max(1, Math.ceil((100 - sf3dProgress) / 15))} ثانية` : ""}
              </div>

              <button 
                onClick={handleCancel}
                style={{
                  background: "transparent",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                إلغاء العملية (Cancel)
              </button>
            </div>
          )}

          {/* ── 3D Canvas ── */}
          <Canvas
            className="hologram-canvas"
            shadows
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            style={{
              opacity: (!processing && imageUri) ? 1 : 0,
              pointerEvents: (!processing && imageUri) ? "auto" : "none",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <spotLight position={[8, 10, 8]}  intensity={2.5} castShadow angle={0.3} penumbra={0.4} />
              <spotLight position={[-8, -5, 5]} intensity={0.8} color="#a78bfa" />
              <pointLight position={[0, -5, 3]} intensity={0.6} color="#4facfe" />

              <Environment preset="city" />
              <Stars radius={80} depth={40} count={800} factor={3} fade speed={0.3} />
              <ContactShadows position={[0, -2.2, 0]} opacity={0.5} scale={12} blur={3} far={4} />

            {!processing && imageUri && (
                mode === "procedural" && procedural3DCategory ? (
                  <Procedural3DObject
                    category={procedural3DCategory}
                    autoRotate={autoRotate}
                    pulse={biological}
                  />
                ) : mode === "3d" && true3dGlbUrl ? (
                  handTracking && palm ? (
                    <HandFollowGroup palm={palm}>
                      <True3DViewer url={true3dGlbUrl} />
                    </HandFollowGroup>
                  ) : (
                    <True3DViewer url={true3dGlbUrl} />
                  )
                ) : mode === "2.5d" ? (
                  handTracking && palm ? (
                    <HandFollowGroup palm={palm}>
                      <DepthMesh3D
                        imageDataUri={imageUri}
                        displacementScale={displacementScale}
                        autoRotate={false}
                        pulse={biological}
                      />
                    </HandFollowGroup>
                  ) : (
                    <DepthMesh3D
                      imageDataUri={imageUri}
                      displacementScale={displacementScale}
                      autoRotate={autoRotate}
                      pulse={biological}
                    />
                  )
                ) : null
              )}

              <OrbitControls
                enablePan
                enabled={!handTracking || !palm}
                minDistance={1.5}
                maxDistance={12}
                autoRotate={mode === "3d" ? autoRotate : false}
                autoRotateSpeed={1.5}
              />
            </Suspense>
          </Canvas>

          <div className="hud-overlay-text">
            <span>Powered by</span>
            <strong>MetaLearning 3D ENGINE Free</strong>
          </div>
        </main>
      </div>
    </div>
  );
}
