import React, { useState, useMemo, useRef, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Stars,
  CameraControls,
  Html,
  Text,
  Float,
  PerformanceMonitor,
  Trail,
  Sphere
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useTranslation } from "react-i18next";
import { Rocket, Play, Info, ArrowLeft, Loader2 } from "lucide-react";

import { LESSONS, ALL_SUBJECTS, LessonDef } from "../data/lessons";

// ─── Constants & Colors ─────────────────────────────────────────────
const SUBJECT_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#eab308", // Yellow
  "#6366f1", // Indigo
];

// ─── 1. Loading Screen ──────────────────────────────────────────────
function CinematicLoader() {
  const { t } = useTranslation();
  return (
    <Html center>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", color: "white", width: "100vw", height: "100vh",
        background: "#020617", zIndex: 9999
      }}>
        <Rocket size={48} color="#a855f7" className="animate-bounce" />
        <h2 style={{ marginTop: "1rem", letterSpacing: "2px", fontWeight: "300" }}>
          {t("galaxy.loading", "Entering the Galaxy...")}
        </h2>
        <Loader2 size={24} className="animate-spin" style={{ marginTop: "1rem", color: "#3b82f6" }} />
      </div>
    </Html>
  );
}

// ─── 2. Planet (Lesson Node) ─────────────────────────────────────────
function Planet({ lesson, position, color, onSelect, isSelected }: { lesson: LessonDef, position: THREE.Vector3, color: string, onSelect: (l: LessonDef, pos: THREE.Vector3) => void, isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <group position={position}>
      <Trail width={0.5} length={4} color={new THREE.Color(color)} attenuation={(t) => t * t}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh
            ref={meshRef}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
            onClick={(e) => { e.stopPropagation(); onSelect(lesson, position); }}
          >
            <sphereGeometry args={[isSelected ? 1.5 : 1, 32, 32]} />
            <meshStandardMaterial 
              color={hovered || isSelected ? "#ffffff" : color} 
              emissive={color}
              emissiveIntensity={hovered || isSelected ? 2 : 0.5}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      </Trail>
      
      {/* Label (Visible on hover or if it's the only one selected) */}
      {(hovered || isSelected) && (
        <Html position={[0, -2, 0]} center style={{ pointerEvents: "none", zIndex: isSelected ? 10 : 1 }}>
          <div style={{
            background: "rgba(15, 23, 42, 0.8)", border: `1px solid ${color}`,
            padding: "4px 12px", borderRadius: "12px", color: "white",
            fontSize: "0.85rem", whiteSpace: "nowrap", backdropFilter: "blur(4px)",
            transform: isSelected ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s"
          }}>
            {lesson.emoji} {lesson.titleAr}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── 3. Star (Subject Node) ──────────────────────────────────────────
function SubjectStar({ subject, index, position, onFocus }: { subject: string, index: number, position: THREE.Vector3, onFocus: (pos: THREE.Vector3) => void }) {
  const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  const lessons = useMemo(() => LESSONS.filter(l => l.subjectAr === subject), [subject]);
  const [hovered, setHovered] = useState(false);

  // Generate orbit positions for planets around this star
  const planets = useMemo(() => {
    return lessons.map((lesson, i) => {
      const angle = (i / lessons.length) * Math.PI * 2;
      const radius = 8 + (i % 3) * 2; // Orbit distance
      const x = position.x + Math.cos(angle) * radius;
      const z = position.z + Math.sin(angle) * radius;
      const y = position.y + (Math.random() - 0.5) * 4; // Slight vertical variation
      return { lesson, position: new THREE.Vector3(x, y, z) };
    });
  }, [lessons, position]);

  return (
    <group>
      {/* Central Star */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh 
          position={position}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
          onClick={(e) => { e.stopPropagation(); onFocus(position); }}
        >
          <sphereGeometry args={[4, 64, 64]} />
          <meshBasicMaterial color={color} />
          {/* Glowing Aura */}
          <Sphere args={[4.5, 32, 32]}>
            <meshBasicMaterial color={color} transparent opacity={hovered ? 0.4 : 0.15} side={THREE.BackSide} />
          </Sphere>
        </mesh>
      </Float>

      {/* Subject Title */}
      <Text
        position={[position.x, position.y + 6, position.z]}
        fontSize={2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor={color}
      >
        {subject}
      </Text>

      {/* Orbiting Planets */}
      {planets.map((p, i) => (
        <Planet 
          key={p.lesson.id} 
          lesson={p.lesson} 
          position={p.position} 
          color={color}
          onSelect={(l, pos) => onFocus(pos)} // Zoom to planet on click
          isSelected={false} // Selection UI handled globally
        />
      ))}
    </group>
  );
}

// ─── 4. The Galaxy Scene ─────────────────────────────────────────────
function GalaxyScene({ onSelectLesson }: { onSelectLesson: (lesson: LessonDef) => void }) {
  const controlsRef = useRef<CameraControls>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonDef | null>(null);

  // Generate Subject positions in a large spiral/circle
  const subjects = useMemo(() => {
    return ALL_SUBJECTS.map((sub, i) => {
      const angle = (i / ALL_SUBJECTS.length) * Math.PI * 2;
      const radius = 40; // Distance from galaxy center
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return { name: sub, position: new THREE.Vector3(x, (Math.random() - 0.5) * 10, z) };
    });
  }, []);

  const handleFocus = (pos: THREE.Vector3, lesson?: LessonDef) => {
    if (controlsRef.current) {
      // Move camera slightly offset from the target
      controlsRef.current.setLookAt(
        pos.x + 5, pos.y + 2, pos.z + 10, // Camera pos
        pos.x, pos.y, pos.z, // Target pos
        true // Animate
      );
    }
    if (lesson) {
      setSelectedLesson(lesson);
      onSelectLesson(lesson);
    }
  };

  // Performance scaling
  const [dpr, setDpr] = useState(1);
  const [enableBloom, setEnableBloom] = useState(true);

  return (
    <>
      <PerformanceMonitor 
        onDecline={() => { setDpr(1); setEnableBloom(false); }}
        onIncline={() => { setDpr(2); setEnableBloom(true); }}
      />
      
      <CameraControls ref={controlsRef} maxDistance={100} minDistance={5} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={1} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {subjects.map((sub, i) => (
        <SubjectStar 
          key={sub.name} 
          index={i} 
          subject={sub.name} 
          position={sub.position} 
          onFocus={(pos) => handleFocus(pos)}
        />
      ))}

      {/* Render planets directly here if we want global selection tracking, but they are inside SubjectStar. We will handle click inside SubjectStar but pass the lesson up. */}
      {/* Wait, I need to pass the lesson to handleFocus */}
      {/* Let's refactor SubjectStar slightly to pass lesson */}
      {subjects.map((sub, i) => {
        const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
        const lessons = LESSONS.filter(l => l.subjectAr === sub.name);
        return lessons.map((lesson, j) => {
            const angle = (j / lessons.length) * Math.PI * 2;
            const radius = 8 + (j % 3) * 2;
            const x = sub.position.x + Math.cos(angle) * radius;
            const z = sub.position.z + Math.sin(angle) * radius;
            const y = sub.position.y + (j % 2 === 0 ? 2 : -2);
            const pos = new THREE.Vector3(x, y, z);
            
            return (
              <Planet 
                key={lesson.id} 
                lesson={lesson} 
                position={pos} 
                color={color}
                onSelect={(l, p) => handleFocus(p, l)}
                isSelected={selectedLesson?.id === lesson.id}
              />
            );
        });
      })}

      {enableBloom && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
        </EffectComposer>
      )}
    </>
  );
}

// ─── 5. Main Page Component ──────────────────────────────────────────
export function GalaxyExplorePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedLesson, setSelectedLesson] = useState<LessonDef | null>(null);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#020617", position: "relative", overflow: "hidden" }}>
      
      {/* HUD Header */}
      <div style={{ position: "absolute", top: 20, left: 20, zIndex: 100, display: "flex", gap: "10px", alignItems: "center" }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "10px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: "white", margin: 0, fontSize: "1.5rem", fontWeight: "300", letterSpacing: "2px", textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>
          {t("galaxy.title", "مجرة المعرفة")}
        </h1>
      </div>

      {/* Instructions */}
      {!selectedLesson && (
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 100, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 20px", borderRadius: "20px", color: "white", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(10px)", pointerEvents: "none" }}>
          <Info size={16} color="#38bdf8" />
          <span>{t("galaxy.hint", "اسحب للتجول.. انقر على الكواكب لاستكشاف الدروس")}</span>
        </div>
      )}

      {/* Selected Lesson UI Overlay */}
      {selectedLesson && (
        <div style={{ 
          position: "absolute", bottom: 40, right: 40, zIndex: 100, 
          background: "rgba(15, 23, 42, 0.8)", border: "1px solid #38bdf8", 
          padding: "2rem", borderRadius: "24px", color: "white", 
          width: "350px", backdropFilter: "blur(20px)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          animation: "slideIn 0.3s ease-out"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
            <span style={{ fontSize: "2rem" }}>{selectedLesson.emoji}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>{selectedLesson.titleAr}</h2>
              <span style={{ color: "#38bdf8", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>{selectedLesson.subjectAr}</span>
            </div>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            {selectedLesson.blurbAr}
          </p>
          <button 
            onClick={() => navigate(`/lesson/${selectedLesson.id}`)}
            style={{ 
              width: "100%", background: "linear-gradient(135deg, #0ea5e9, #3b82f6)", 
              border: "none", padding: "14px", borderRadius: "12px", color: "white", 
              fontWeight: "bold", fontSize: "1rem", cursor: "pointer", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: "8px",
              boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)", transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <Play size={18} fill="white" />
            {t("galaxy.start", "ابدأ الاستكشاف")}
          </button>
          <button 
            onClick={() => setSelectedLesson(null)}
            style={{ width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "12px", color: "#94a3b8", marginTop: "10px", cursor: "pointer" }}
          >
            إلغاء
          </button>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 60, 100], fov: 45 }}>
        <Suspense fallback={<CinematicLoader />}>
          <GalaxyScene onSelectLesson={setSelectedLesson} />
        </Suspense>
      </Canvas>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
