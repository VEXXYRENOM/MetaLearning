/**
 * X-2: Spatial Annotator — Interactive Hotspot System
 * Teachers click on the 3D model to drop hotspots (POI).
 * Each hotspot stores title, description, and optional quiz question.
 */
import { useState, useCallback, useEffect } from "react";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { supabase } from "../../services/supabaseClient";
import type { Vector3 } from "three";
import { Target, Info, Trash2, HelpCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Hotspot {
  id: string;
  lesson_id: string;
  teacher_id: string;
  title: string;
  description: string;
  quiz_question: string | null;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  created_at: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useHotspots(lessonId: string | undefined, isTeacher: boolean) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [pendingPos, setPendingPos] = useState<[number, number, number] | null>(null);
  const [placingMode, setPlacingMode] = useState(false);

  const loadHotspots = useCallback(async () => {
    // Only query DB if lessonId is a valid UUID
    if (!lessonId || lessonId.length < 20 || !lessonId.includes("-")) return;
    const { data } = await supabase
      .from("hotspots")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("created_at");
    if (data) setHotspots(data as Hotspot[]); // Assume table exists, UI won't crash
  }, [lessonId]);

  useEffect(() => {
    loadHotspots();
  }, [loadHotspots]);

  const handleModelClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (!isTeacher || !placingMode) return;
      e.stopPropagation();
      const p = e.point as Vector3;
      setPendingPos([p.x, p.y, p.z]);
    },
    [isTeacher, placingMode]
  );

  const saveHotspot = useCallback(
    async (
      teacherId: string,
      title: string,
      description: string,
      quizQuestion: string
    ) => {
      // Only allow saving if lessonId is a valid UUID
      if (!pendingPos || !lessonId || lessonId.length < 20 || !lessonId.includes("-")) return;
      const payload = {
        lesson_id: lessonId,
        teacher_id: teacherId,
        title,
        description,
        quiz_question: quizQuestion || null,
        pos_x: pendingPos[0],
        pos_y: pendingPos[1],
        pos_z: pendingPos[2],
      };
      
      try {
        const { data } = await supabase
          .from("hotspots")
          .insert(payload)
          .select()
          .single();
        if (data) setHotspots((prev) => [...prev, data as Hotspot]);
      } catch (e) {
        console.warn("Hotspot save failed (maybe table missing). Appending locally:", e);
        setHotspots((prev) => [...prev, { ...payload, id: Math.random().toString(), created_at: new Date().toISOString() } as Hotspot]);
      }
      setPendingPos(null);
      setPlacingMode(false);
    },
    [lessonId, pendingPos]
  );

  const deleteHotspot = useCallback(async (id: string) => {
    try {
      await supabase.from("hotspots").delete().eq("id", id);
    } catch (e) {
      console.warn("Delete failed:", e);
    }
    setHotspots((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return {
    hotspots,
    pendingPos,
    placingMode,
    setPlacingMode,
    loadHotspots,
    handleModelClick,
    saveHotspot,
    deleteHotspot,
    cancelPending: () => { setPendingPos(null); setPlacingMode(false); },
  };
}

// ─── Futuristic 3D Hotspot Marker (Rendered inside Canvas) ────────────────────
interface HotspotMarkerProps {
  hotspot: Hotspot;
  isTeacher: boolean;
  onDelete?: (id: string) => void;
  onClick?: (hotspot: Hotspot) => void;
}

export function HotspotMarker({ hotspot, isTeacher, onDelete, onClick }: HotspotMarkerProps) {
  const [open, setOpen] = useState(false);

  return (
    <group position={[hotspot.pos_x, hotspot.pos_y, hotspot.pos_z]}>
      <Html center style={{ pointerEvents: "auto" }}>
        {/* Futuristic Target Marker */}
        <div className="hotspot-marker-container">
          <button 
            className={`hotspot-pulse-btn ${open ? 'active' : ''}`}
            onClick={(e) => { 
              e.stopPropagation(); 
              const willOpen = !open;
              setOpen(willOpen); 
              if (willOpen && onClick) onClick(hotspot);
            }}
            title={hotspot.title}
          >
            <Target size={18} />
          </button>

          {/* Glassmorphic Popup */}
          {open && (
            <div className="hotspot-popup glass-panel slide-up">
              <div className="popup-header">
                <Info size={16} className="text-cyan" />
                <strong className="popup-title">{hotspot.title}</strong>
                <button className="btn-close" onClick={() => setOpen(false)}>×</button>
              </div>
              <div className="popup-body">
                <p className="popup-desc">{hotspot.description}</p>
                {hotspot.quiz_question && (
                  <div className="popup-quiz">
                    <HelpCircle size={14} className="text-blue" />
                    <span>{hotspot.quiz_question}</span>
                  </div>
                )}
              </div>
              {isTeacher && onDelete && (
                <div className="popup-footer">
                  <button className="btn-delete" onClick={() => onDelete(hotspot.id)}>
                    <Trash2 size={14} /> Delete Annotator
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export function PendingHotspotMarker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Html center>
        <div className="hotspot-pulse-btn pending">
          <Target size={18} />
        </div>
      </Html>
    </group>
  );
}

// ─── Teacher Form (Rendered outside Canvas) ───────────────────────────────────
interface HotspotFormProps {
  teacherId: string;
  onSave: (teacherId: string, title: string, desc: string, quiz: string) => void;
  onCancel: () => void;
}

export function HotspotForm({ teacherId, onSave, onCancel }: HotspotFormProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [quiz, setQuiz] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    background: "rgba(0,0,0,0.6)", border: "1px solid rgba(6,182,212,0.3)",
    color: "#e2e8f0", fontSize: "0.85rem", fontFamily: "inherit",
    boxSizing: "border-box", transition: "all 0.2s"
  };

  return (
    <div className="hotspot-creator glass-panel slide-up">
      <h4 className="creator-title">
        <Target size={16} className="text-cyan" /> Create Spatial Hotspot
      </h4>
      <div className="creator-form">
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (e.g., DNA Helix)"
          style={inputStyle} autoFocus
        />
        <textarea
          value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Enter a detailed description..."
          rows={3} style={{ ...inputStyle, resize: "none" }}
        />
        <div className="input-with-icon">
          <HelpCircle size={14} className="input-icon text-blue" />
          <input
            value={quiz} onChange={(e) => setQuiz(e.target.value)}
            placeholder="Add an inline quiz (Optional)"
            style={{ ...inputStyle, paddingLeft: "30px" }}
          />
        </div>
        <div className="creator-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button 
            className="btn-create" 
            onClick={() => onSave(teacherId, title, desc, quiz)}
            disabled={!title || !desc}
          >
            Deploy Hotspot
          </button>
        </div>
      </div>
    </div>
  );
}
