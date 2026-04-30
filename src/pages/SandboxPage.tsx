import { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, Search } from "lucide-react";
import { LESSONS, ALL_SUBJECTS, LessonDef } from "../data/lessons";

// ─── Design tokens (same as StudentDashboard) ─────────────────
const C = {
  bg:          "linear-gradient(160deg,#EBF4FF 0%,#DBEAFE 40%,#E0F2FE 70%,#F0F9FF 100%)",
  card:        "rgba(255, 255, 255, 0.55)",
  border:      "rgba(255,255,255,0.8)",
  textPrimary: "#0f1f3d",
  textMuted:   "#6b7280",
  indigo:      "#2563EB",
};

// ─── Simple procedural sphere per lesson ─────────────────────
const SUBJECT_COLORS: Record<string, string> = {
  "علم الأحياء": "#10b981",
  "الكيمياء":    "#06b6d4",
  "الفيزياء":    "#6366f1",
  "الجغرافيا":   "#f59e0b",
  "الرياضيات":   "#a855f7",
  "التاريخ":     "#ef4444",
  "اللغات":      "#3b82f6",
  "الفنون":      "#f43f5e",
};

function ModelPreview({ lesson }: { lesson: LessonDef }) {
  const color = SUBJECT_COLORS[lesson.subjectAr] ?? "#6366f1";
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <mesh>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.7}
          wireframe={false}
        />
      </mesh>
      <Html center position={[0, -3, 0]}>
        <div style={{ color: "#0f1f3d", textAlign: "center", whiteSpace: "nowrap",
          fontSize: "1rem", fontWeight: 800,
          textShadow: "0 2px 10px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,0.5)" }}>
          {lesson.emoji} {lesson.titleAr}
        </div>
      </Html>
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={1.5}
      />
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export function SandboxPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang.startsWith("ar");
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState<string>(ALL_SUBJECTS[0]);
  const [selectedLesson, setSelectedLesson] = useState<LessonDef | null>(null);
  const [search, setSearch] = useState("");

  const filteredLessons = LESSONS.filter(l => {
    const matchSubject = l.subjectAr === selectedSubject;
    const matchSearch = search.trim() === "" || l.titleAr.includes(search) || (l.blurbAr ?? "").includes(search);
    return matchSubject && matchSearch;
  });

  const displayLesson = selectedLesson ?? filteredLessons[0] ?? null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}
      style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Header ─────────────────────────────── */}
      <header style={{
        display: "flex", alignItems: "center", gap: "16px",
        padding: "1rem 1.5rem",
        borderBottom: `1px solid ${C.border}`,
        background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50
      }}>
        <button
          onClick={() => navigate("/student/dashboard")}
          style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted,
            padding: "8px", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: C.textPrimary, margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            🔬 {t("sandbox.title", "Open Sandbox")}
          </h1>
          <p style={{ color: C.textMuted, margin: 0, fontSize: "0.8rem" }}>
            {t("sandbox.subtitle", "Free 3D exploration — no PIN required")}
          </p>
        </div>
      </header>

      {/* ── Layout ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", flexDirection: window.innerWidth < 768 ? "column" : "row" }}>

        {/* LEFT PANEL — Subject tabs + lesson list */}
        <aside style={{
          width: window.innerWidth < 768 ? "100%" : "320px", flexShrink: 0,
          borderInlineEnd: window.innerWidth < 768 ? "none" : `1px solid ${C.border}`,
          borderBottom: window.innerWidth < 768 ? `1px solid ${C.border}` : "none",
          display: "flex", flexDirection: "column",
          background: "rgba(255,255,255,0.4)", overflowY: "auto",
          maxHeight: window.innerWidth < 768 ? "50vh" : "auto"
        }}>
          {/* Subject tabs */}
          <div style={{ padding: "1rem", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {ALL_SUBJECTS.map(sub => (
                <button
                  key={sub}
                  onClick={() => { setSelectedSubject(sub); setSelectedLesson(null); }}
                  style={{
                    background: selectedSubject === sub
                      ? `${SUBJECT_COLORS[sub] ?? C.indigo}33`
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedSubject === sub
                      ? (SUBJECT_COLORS[sub] ?? C.indigo) + "77"
                      : C.border}`,
                    color: selectedSubject === sub ? C.textPrimary : C.textMuted,
                    padding: "5px 12px", borderRadius: "999px",
                    fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${C.border}`, position: "relative" }}>
              <Search size={14} style={{ position: "absolute", insetInlineStart: "1.75rem", top: "50%", transform: "translateY(-50%)", color: C.textMuted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("sandbox.search", "Search lessons...")}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.6)", border: `1px solid ${C.border}`,
                borderRadius: "10px", padding: "8px 12px 8px 32px",
                color: C.textPrimary, fontSize: "0.85rem", outline: "none",
                boxShadow: "inset 0 2px 4px rgba(37,99,235,0.02)"
              }}
            />
          </div>

          {/* Lesson list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
            {filteredLessons.length === 0 ? (
              <p style={{ color: C.textMuted, textAlign: "center", padding: "2rem 1rem", fontSize: "0.85rem" }}>
                {t("sandbox.no_results", "No lessons found.")}
              </p>
            ) : filteredLessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                style={{
                  width: "100%", textAlign: "start", background: displayLesson?.id === lesson.id
                    ? `${SUBJECT_COLORS[lesson.subjectAr] ?? C.indigo}18`
                    : "transparent",
                  border: `1px solid ${displayLesson?.id === lesson.id
                    ? (SUBJECT_COLORS[lesson.subjectAr] ?? C.indigo) + "44"
                    : "transparent"}`,
                  borderRadius: "10px", padding: "10px 12px",
                  cursor: "pointer", marginBottom: "2px",
                  display: "flex", alignItems: "center", gap: "10px",
                  transition: "all 0.15s"
                }}
              >
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{lesson.emoji}</span>
                <div>
                  <div style={{ color: C.textPrimary, fontWeight: 600, fontSize: "0.85rem" }}>{lesson.titleAr}</div>
                  <div style={{ color: C.textMuted, fontSize: "0.75rem", marginTop: "2px" }}>
                    {lesson.blurbAr?.slice(0, 50)}...
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN — 3D Canvas + info overlay */}
        <main style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
          {displayLesson ? (
            <>
              {/* 3D Canvas */}
              <div style={{ flex: 1 }}>
                <Canvas
                  camera={{ position: [0, 0, 8], fov: 45 }}
                  style={{ background: "radial-gradient(ellipse at center, #E0F2FE 0%, #DBEAFE 100%)" }}
                  dpr={[1, 2]}
                  gl={{ antialias: true, preserveDrawingBuffer: true }}
                >
                  <Suspense fallback={null}>
                    <ModelPreview lesson={displayLesson} />
                  </Suspense>
                </Canvas>
              </div>

              {/* Info strip */}
              <div style={{
                padding: "1rem 1.5rem",
                background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)",
                borderTop: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "12px"
              }}>
                <div>
                  <h2 style={{ color: C.textPrimary, margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 700 }}>
                    {displayLesson.emoji} {displayLesson.titleAr}
                  </h2>
                  <p style={{ color: C.textMuted, margin: 0, fontSize: "0.85rem" }}>
                    {displayLesson.blurbAr}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/lesson/${displayLesson.id}`)}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    border: "none", padding: "12px 24px", borderRadius: "12px",
                    color: "white", fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px",
                    fontSize: "0.95rem", boxShadow: "0 4px 15px rgba(99,102,241,0.4)",
                    flexShrink: 0
                  }}
                >
                  <Play size={16} fill="white" />
                  {t("sandbox.open_full", "Open Full Lesson")}
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: C.textMuted, fontSize: "1rem" }}>
                {t("sandbox.select", "Select a lesson from the sidebar.")}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
