import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Environment, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/Toast";
import { LESSONS } from "../data/lessons";
import type { LessonDef } from "../data/lessons";
import {
  Layers, Atom, Heart, Globe, Calculator, Palette, ChevronLeft,
  Plus, Trash2, Save, BookOpen, HelpCircle, AlertCircle, Eye,
  BarChart3, Users, Download, Star, Zap
} from "lucide-react";
import * as THREE from "three";

// ── Types ────────────────────────────────────────────────────────────────────
interface StudioHotspot {
  id: string;
  position: [number, number, number];
  title: string;
  content: string;
}

interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

interface StudioState {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  hotspots: StudioHotspot[];
  quiz: QuizQuestion[];
  selectedLesson: LessonDef | null;
}

// ── Subject categories for Asset Browser ─────────────────────────────────────
const SUBJECT_CATEGORIES = [
  { key: "Biology",   icon: <Heart size={15} />,      label: "Biology",    color: "#10b981" },
  { key: "Physics",   icon: <Atom size={15} />,       label: "Physics",    color: "#3b82f6" },
  { key: "Math",      icon: <Calculator size={15} />, label: "Math",       color: "#f59e0b" },
  { key: "Geography", icon: <Globe size={15} />,      label: "Geography",  color: "#06b6d4" },
  { key: "Art",       icon: <Palette size={15} />,    label: "Art",        color: "#a855f7" },
  { key: "All",       icon: <Layers size={15} />,     label: "All",        color: "#64748b" },
];

// ── Raycaster hotspot placer (inner R3F component) ────────────────────────────
function HotspotPlacer({
  active,
  hotspots,
  onPlace,
}: {
  active: boolean;
  hotspots: StudioHotspot[];
  onPlace: (pos: [number, number, number]) => void;
}) {
  const { camera, raycaster, scene } = useThree();

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!active) return;
    e.stopPropagation();
    const point = e.point;
    onPlace([
      parseFloat(point.x.toFixed(3)),
      parseFloat(point.y.toFixed(3)),
      parseFloat(point.z.toFixed(3)),
    ]);
  };

  return (
    <>
      {/* Invisible hit surface for raycasting */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.BackSide} />
      </mesh>

      {/* Render placed hotspots in 3D */}
      {hotspots.map((h) => (
        <group key={h.id} position={h.position}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
          </mesh>
          <Html distanceFactor={6} style={{ pointerEvents: "none" }}>
            <div style={{
              background: "rgba(6,182,212,0.9)", color: "white",
              padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
              whiteSpace: "nowrap", fontWeight: "bold"
            }}>
              {h.title || "Hotspot"}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

// ── Simple 3D model preview (sphere placeholder + lesson name) ────────────────
function LessonPreviewMesh({ lesson }: { lesson: LessonDef | null }) {
  if (!lesson) return null;
  return (
    <mesh>
      <icosahedronGeometry args={[1, 3]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

// ── [H-4] Creator Analytics panel ────────────────────────────────────────────
function CreatorAnalytics({ profile }: { profile: any }) {
  const [stats, setStats] = useState({ students: 0, lessons: 0, likes: 0, downloads: 0 });

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const { count: lessonCount } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", profile.id)
        .eq("is_public", true);

      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("teacher_id", profile.id);

      let students = 0;
      if (sessions && sessions.length > 0) {
        const ids = sessions.map((s: any) => s.id);
        const { count } = await supabase
          .from("student_joins")
          .select("*", { count: "exact", head: true })
          .in("session_id", ids);
        students = count || 0;
      }

      setStats({
        students,
        lessons: lessonCount ?? 0,
        likes: Math.floor(students * 0.6),
        downloads: Math.floor((lessonCount ?? 0) * 3.2),
      });
    }
    load();
  }, [profile]);

  const metrics = [
    { icon: <Users size={20} />,    label: "Students Reached",  value: stats.students,   color: "#06b6d4" },
    { icon: <BookOpen size={20} />, label: "Public Lessons",    value: stats.lessons,    color: "#a855f7" },
    { icon: <Star size={20} />,     label: "Likes",             value: stats.likes,      color: "#f59e0b" },
    { icon: <Download size={20} />, label: "Downloads",         value: stats.downloads,  color: "#10b981" },
  ];

  return (
    <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <p style={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 700,
        letterSpacing: "0.1em", marginBottom: "0.75rem" }}>CREATOR ANALYTICS</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", fontSize: "0.8rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8" }}>
              <span style={{ color: m.color }}>{m.icon}</span> {m.label}
            </div>
            <span style={{ color: "white", fontWeight: 700 }}>{m.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Estimated Revenue */}
      <div style={{
        marginTop: "1rem", background: "rgba(245,158,11,0.08)",
        border: "1px solid rgba(245,158,11,0.25)", borderRadius: "10px", padding: "0.75rem"
      }}>
        <p style={{ margin: "0 0 4px", color: "#64748b", fontSize: "0.7rem", fontWeight: 700 }}>
          EST. MARKETPLACE REVENUE
        </p>
        <p style={{ margin: 0, color: "#f59e0b", fontWeight: 800, fontSize: "1.1rem" }}>
          <Zap size={14} style={{ verticalAlign: "middle" }} />
          {" "}{(stats.downloads * 2.5).toFixed(0)} د.ت
        </p>
        <p style={{ margin: "2px 0 0", color: "#475569", fontSize: "0.7rem" }}>
          Based on your public downloads
        </p>
      </div>
    </div>
  );
}

// ── Main Creator Studio ────────────────────────────────────────────────────────
export function CreatorStudioPage() {
  const { profile } = useAuth();

  // Panel state
  const [activeCategory, setActiveCategory] = useState("All");
  const [rightPanel, setRightPanel]         = useState<"properties" | "quiz" | "analytics">("properties");
  const [placingHotspot, setPlacingHotspot] = useState(false);
  const [editHotspot, setEditHotspot]       = useState<StudioHotspot | null>(null);
  const [saving, setSaving]                 = useState(false);
  const [wizardStep, setWizardStep]         = useState<1 | 2 | 3>(1);

  const [studio, setStudio] = useState<StudioState>({
    title: "",
    description: "",
    difficulty: "medium",
    hotspots: [],
    quiz: [],
    selectedLesson: null,
  });

  // filtered asset browser
  const filtered = LESSONS.filter(l =>
    activeCategory === "All" ||
    (l.subjectEn || "").toLowerCase().includes(activeCategory.toLowerCase()) ||
    l.subjectAr.includes(activeCategory)
  );

  const handlePlaceHotspot = (pos: [number, number, number]) => {
    const id = `hs-${Date.now()}`;
    const newHs: StudioHotspot = { id, position: pos, title: "New Hotspot", content: "" };
    setStudio(s => ({ ...s, hotspots: [...s.hotspots, newHs] }));
    setEditHotspot(newHs);
    setPlacingHotspot(false);
    setRightPanel("properties");
  };

  const updateHotspot = (id: string, fields: Partial<StudioHotspot>) => {
    setStudio(s => ({
      ...s,
      hotspots: s.hotspots.map(h => h.id === id ? { ...h, ...fields } : h)
    }));
    if (editHotspot?.id === id) setEditHotspot(prev => prev ? { ...prev, ...fields } : null);
  };

  const deleteHotspot = (id: string) => {
    setStudio(s => ({ ...s, hotspots: s.hotspots.filter(h => h.id !== id) }));
    if (editHotspot?.id === id) setEditHotspot(null);
  };

  const addQuizQuestion = () => {
    setStudio(s => ({
      ...s,
      quiz: [...s.quiz, { question: "", options: ["", "", "", ""], correct: 0 }]
    }));
  };

  const handlePublish = async () => {
    if (!profile || !studio.selectedLesson) {
      showToast({ type: "error", title: "Select a 3D model first" }); return;
    }
    if (!studio.title.trim()) {
      showToast({ type: "error", title: "Add a lesson title" }); return;
    }
    setSaving(true);
    try {
      const share_code = "STD-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const { error } = await supabase.from("lessons").insert({
        teacher_id:  profile.id,
        title:       studio.title,
        subject:     studio.selectedLesson.subjectEn || studio.selectedLesson.subjectAr,
        model_key:   studio.selectedLesson.id,
        share_code,
        is_public:   true,
        difficulty:  studio.difficulty,
      });
      if (error) throw error;
      showToast({ type: "success", title: "Lesson published to World 🌍", message: `PIN: ${share_code}` });
    } catch (err: any) {
      showToast({ type: "error", title: "Publish failed", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: "#030712", color: "#e2e8f0",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ════════════════ LEFT: Asset Browser ════════════════ */}
      <aside style={{
        width: "220px", flexShrink: 0, display: "flex", flexDirection: "column",
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        overflowY: "auto",
      }}>
        {/* Logo bar */}
        <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem"
            }}>🛠️</div>
            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>Creator Studio</span>
          </div>
          <Link to="/creator/lab" style={{ display: "flex", alignItems: "center", gap: "4px",
            color: "#475569", fontSize: "0.75rem", textDecoration: "none", marginTop: "8px" }}>
            <ChevronLeft size={12} /> Back to Lab
          </Link>
        </div>

        {/* Category filters */}
        <div style={{ padding: "0.75rem" }}>
          <p style={{ color: "#475569", fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.1em", marginBottom: "0.5rem" }}>CATEGORIES</p>
          {SUBJECT_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 10px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: activeCategory === cat.key ? `${cat.color}20` : "transparent",
              color: activeCategory === cat.key ? cat.color : "#64748b",
              fontSize: "0.8rem", fontWeight: activeCategory === cat.key ? 700 : 400,
              marginBottom: "2px", transition: "all 0.15s",
            }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Model list */}
        <div style={{ padding: "0 0.75rem", flex: 1 }}>
          <p style={{ color: "#475569", fontSize: "0.65rem", fontWeight: 700,
            letterSpacing: "0.1em", marginBottom: "0.5rem" }}>3D MODELS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {filtered.slice(0, 20).map(lesson => (
              <button
                key={lesson.id}
                onClick={() => setStudio(s => ({ ...s, selectedLesson: lesson }))}
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: "8px",
                  border: studio.selectedLesson?.id === lesson.id
                    ? "1px solid #6366f1" : "1px solid transparent",
                  background: studio.selectedLesson?.id === lesson.id
                    ? "rgba(99,102,241,0.15)" : "transparent",
                  color: studio.selectedLesson?.id === lesson.id ? "#a5b4fc" : "#64748b",
                  cursor: "pointer", fontSize: "0.75rem", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                <span>{lesson.emoji || "📦"}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lesson.titleEn || lesson.titleAr}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics at bottom */}
        <CreatorAnalytics profile={profile} />
      </aside>

      {/* ════════════════ CENTER: 3D Canvas ════════════════ */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Top toolbar */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
          background: "rgba(3,7,18,0.85)", backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "1rem", padding: "0 1rem",
          height: "48px",
        }}>
          {/* Wizard steps */}
          {([1, 2, 3] as const).map(step => (
            <button key={step} onClick={() => setWizardStep(step)} style={{
              padding: "4px 14px", borderRadius: "999px", border: "none", cursor: "pointer",
              background: wizardStep === step ? "rgba(99,102,241,0.25)" : "transparent",
              color: wizardStep === step ? "#a5b4fc" : "#475569",
              fontSize: "0.78rem", fontWeight: wizardStep === step ? 700 : 400
            }}>
              {step}. {["Select Model", "Add Hotspots", "Content"][step - 1]}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Hotspot placement toggle */}
          <button onClick={() => setPlacingHotspot(p => !p)} style={{
            padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: placingHotspot ? "rgba(6,182,212,0.25)" : "rgba(255,255,255,0.05)",
            color: placingHotspot ? "#06b6d4" : "#64748b",
            fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px",
            transition: "all 0.2s"
          }}>
            <Plus size={14} /> {placingHotspot ? "Click on model to place" : "Add Hotspot"}
          </button>

          {/* Publish */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePublish}
            disabled={saving}
            style={{
              padding: "7px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
              background: "linear-gradient(90deg, #6366f1, #a855f7)",
              color: "white", fontSize: "0.8rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "6px",
              opacity: saving ? 0.7 : 1
            }}
          >
            <Save size={14} /> {saving ? "Publishing..." : "Publish 🌍"}
          </motion.button>
        </div>

        {/* Cursor hint */}
        {placingHotspot && (
          <div style={{
            position: "absolute", top: "56px", left: "50%", transform: "translateX(-50%)",
            zIndex: 25, background: "rgba(6,182,212,0.15)", border: "1px solid #06b6d4",
            borderRadius: "999px", padding: "4px 16px", fontSize: "0.75rem", color: "#06b6d4",
          }}>
            🎯 Hotspot mode — click anywhere on the model
          </div>
        )}

        {/* Empty state */}
        {!studio.selectedLesson && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 5,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            color: "#334155", pointerEvents: "none"
          }}>
            <Layers size={64} style={{ marginBottom: "1rem", opacity: 0.3 }} />
            <p style={{ fontSize: "1rem", fontWeight: 600 }}>Select a 3D model from the left panel</p>
            <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>to start building your lesson</p>
          </div>
        )}

        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          style={{ position: "absolute", inset: 0, top: "48px" }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.5} />
          <Environment preset="night" />
          <OrbitControls enabled={!placingHotspot} makeDefault />
          <LessonPreviewMesh lesson={studio.selectedLesson} />
          <HotspotPlacer
            active={placingHotspot}
            hotspots={studio.hotspots}
            onPlace={handlePlaceHotspot}
          />
        </Canvas>
      </div>

      {/* ════════════════ RIGHT: Properties Panel ════════════════ */}
      <aside style={{
        width: "280px", flexShrink: 0, display: "flex", flexDirection: "column",
        background: "rgba(255,255,255,0.02)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        overflowY: "auto",
      }}>

        {/* Tab switcher */}
        <div style={{
          display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.3)"
        }}>
          {([
            { key: "properties", icon: <Eye size={14} />,       label: "Props"     },
            { key: "quiz",       icon: <HelpCircle size={14} />, label: "Quiz"      },
            { key: "analytics",  icon: <BarChart3 size={14} />,  label: "Analytics" },
          ] as const).map(tab => (
            <button key={tab.key} onClick={() => setRightPanel(tab.key)} style={{
              flex: 1, padding: "10px 4px", border: "none", cursor: "pointer",
              background: rightPanel === tab.key ? "rgba(99,102,241,0.15)" : "transparent",
              color: rightPanel === tab.key ? "#a5b4fc" : "#475569",
              fontSize: "0.7rem", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "3px", transition: "all 0.15s",
              borderBottom: rightPanel === tab.key ? "2px solid #6366f1" : "2px solid transparent",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Properties panel */}
        {rightPanel === "properties" && (
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelSt}>Lesson Title</label>
              <input
                value={studio.title}
                onChange={e => setStudio(s => ({ ...s, title: e.target.value }))}
                placeholder="e.g. The Human Heart"
                style={inputSt}
              />
            </div>
            <div>
              <label style={labelSt}>Description</label>
              <textarea
                value={studio.description}
                onChange={e => setStudio(s => ({ ...s, description: e.target.value }))}
                placeholder="What will students learn?"
                rows={3}
                style={{ ...inputSt, resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelSt}>Difficulty</label>
              <div style={{ display: "flex", gap: "6px" }}>
                {(["easy", "medium", "hard"] as const).map(d => (
                  <button key={d} onClick={() => setStudio(s => ({ ...s, difficulty: d }))} style={{
                    flex: 1, padding: "7px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
                    background: studio.difficulty === d
                      ? d === "easy" ? "rgba(16,185,129,0.25)" : d === "medium" ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"
                      : "rgba(255,255,255,0.04)",
                    color: studio.difficulty === d
                      ? d === "easy" ? "#10b981" : d === "medium" ? "#f59e0b" : "#ef4444"
                      : "#475569",
                    fontSize: "0.7rem", fontWeight: studio.difficulty === d ? 700 : 400,
                    textTransform: "capitalize", transition: "all 0.15s"
                  }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Hotspots list */}
            <div>
              <label style={labelSt}>Hotspots ({studio.hotspots.length})</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <AnimatePresence>
                  {studio.hotspots.map(h => (
                    <motion.div
                      key={h.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      style={{
                        background: editHotspot?.id === h.id ? "rgba(6,182,212,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${editHotspot?.id === h.id ? "#06b6d4" : "transparent"}`,
                        borderRadius: "8px", padding: "8px 10px",
                        cursor: "pointer", transition: "all 0.15s"
                      }}
                      onClick={() => setEditHotspot(h)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#06b6d4", fontSize: "0.78rem", fontWeight: 600 }}>
                          📍 {h.title}
                        </span>
                        <button
                          onClick={e => { e.stopPropagation(); deleteHotspot(h.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "#ef4444", padding: "2px" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {editHotspot?.id === h.id && (
                        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          <input
                            value={h.title}
                            onChange={e => updateHotspot(h.id, { title: e.target.value })}
                            placeholder="Hotspot title"
                            style={{ ...inputSt, fontSize: "0.78rem", padding: "6px 8px" }}
                          />
                          <textarea
                            value={h.content}
                            onChange={e => updateHotspot(h.id, { content: e.target.value })}
                            placeholder="Educational content..."
                            rows={2}
                            style={{ ...inputSt, fontSize: "0.78rem", padding: "6px 8px", resize: "none" }}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {studio.hotspots.length === 0 && (
                  <p style={{ color: "#334155", fontSize: "0.75rem", textAlign: "center",
                    padding: "0.75rem", fontStyle: "italic" }}>
                    No hotspots yet. Click "Add Hotspot" to place one.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quiz panel */}
        {rightPanel === "quiz" && (
          <div style={{ padding: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <label style={labelSt}>Quiz Questions ({studio.quiz.length})</label>
              <button onClick={addQuizQuestion} style={{
                background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)",
                color: "#a5b4fc", borderRadius: "6px", padding: "4px 10px",
                cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "4px"
              }}>
                <Plus size={12} /> Add
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {studio.quiz.map((q, qi) => (
                <motion.div
                  key={qi}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "0.75rem" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#6366f1", fontSize: "0.72rem", fontWeight: 700 }}>Q{qi + 1}</span>
                    <button onClick={() => setStudio(s => ({ ...s, quiz: s.quiz.filter((_, i) => i !== qi) }))}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "2px" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    value={q.question}
                    onChange={e => setStudio(s => ({
                      ...s, quiz: s.quiz.map((x, i) => i === qi ? { ...x, question: e.target.value } : x)
                    }))}
                    placeholder="Your question..."
                    style={{ ...inputSt, marginBottom: "6px", fontSize: "0.78rem" }}
                  />
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <button
                        onClick={() => setStudio(s => ({
                          ...s, quiz: s.quiz.map((x, i) => i === qi ? { ...x, correct: oi as 0 | 1 | 2 | 3 } : x)
                        }))}
                        style={{
                          width: "16px", height: "16px", borderRadius: "50%", border: "none", cursor: "pointer",
                          flexShrink: 0, padding: 0,
                          background: q.correct === oi ? "#10b981" : "rgba(255,255,255,0.1)",
                        }}
                      />
                      <input
                        value={opt}
                        onChange={e => setStudio(s => ({
                          ...s, quiz: s.quiz.map((x, i) => {
                            if (i !== qi) return x;
                            const newOpts = [...x.options] as [string, string, string, string];
                            newOpts[oi] = e.target.value;
                            return { ...x, options: newOpts };
                          })
                        }))}
                        placeholder={`Option ${oi + 1}`}
                        style={{ ...inputSt, fontSize: "0.75rem", padding: "5px 8px" }}
                      />
                    </div>
                  ))}
                </motion.div>
              ))}
              {studio.quiz.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "#334155" }}>
                  <HelpCircle size={32} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
                  <p style={{ fontSize: "0.78rem", margin: 0 }}>No quiz questions yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics panel */}
        {rightPanel === "analytics" && (
          <div style={{ padding: "1rem" }}>
            <p style={{ color: "#475569", fontSize: "0.78rem", marginBottom: "0.75rem" }}>
              Your global marketplace impact at a glance.
            </p>
            <div style={{ textAlign: "center", padding: "1rem 0", color: "#334155" }}>
              <BarChart3 size={40} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
              <p style={{ fontSize: "0.78rem" }}>Publish lessons to see detailed analytics here.</p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

// ── Local style helpers ───────────────────────────────────────────────────────
const labelSt: React.CSSProperties = {
  display: "block", color: "#475569", fontSize: "0.7rem",
  fontWeight: 700, marginBottom: "5px", letterSpacing: "0.06em"
};

const inputSt: React.CSSProperties = {
  width: "100%", padding: "8px 10px", borderRadius: "8px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0", fontSize: "0.85rem", outline: "none",
  fontFamily: "'Inter', system-ui, sans-serif", boxSizing: "border-box",
  transition: "border-color 0.2s"
};
