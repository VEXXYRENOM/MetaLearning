import { useRef, useState, Suspense, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw, Info } from "lucide-react";
import { LabSidebar } from "../components/lab/LabSidebar";
import { LabElement, getReaction, Reaction } from "../lib/labElements";

// ─── Types ───────────────────────────────────────────────────
interface BeakerState {
  contents: LabElement[];
  volume: number; // 0.0 to 1.0
  color: string;
}

interface Particle {
  id: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ─── Static Lab Floor & Bench ─────────────────────────────────
function LabEnvironment() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} transparent opacity={0.6} />
      </mesh>
      {/* Bench */}
      <mesh position={[0, -1.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.15, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Liquid Mesh ──────────────────────────────────────────────
function LiquidMesh({ volume, targetColor }: { volume: number; targetColor: string }) {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const colorObj = useRef(new THREE.Color(targetColor));

  // Ensure volume stays within bounds [0.01, 1] (0.01 so it's not totally invisible when empty)
  const safeVolume = Math.max(0.01, Math.min(1.0, volume));
  
  // The beaker interior is ~0.9 units high. 
  const liquidHeight = safeVolume * 0.9;
  // Base position is -0.95 (bottom of beaker). 
  const yPos = -0.95 + (liquidHeight / 2);

  useFrame(() => {
    if (matRef.current) {
      colorObj.current.set(targetColor);
      matRef.current.color.lerp(colorObj.current, 0.05);
    }
  });

  return (
    <mesh position={[0, yPos, 0]}>
      <cylinderGeometry args={[0.34, 0.34, liquidHeight, 32]} />
      <meshPhysicalMaterial
        ref={matRef}
        color={targetColor}
        transparent
        opacity={volume > 0 ? 0.85 : 0}
        roughness={0.1}
        transmission={0.6}
        thickness={0.5}
      />
    </mesh>
  );
}

// ─── Central Beaker ──────────────────────────────────────────
function CentralBeaker({ beakerState }: { beakerState: BeakerState }) {
  return (
    <group position={[0, -0.65, 0]}>
      {/* Liquid inside */}
      <LiquidMesh volume={beakerState.volume} targetColor={beakerState.color} />

      {/* Glass Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.35, 1.0, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff" transparent opacity={0.15}
          roughness={0.05} metalness={0.1} transmission={0.95} thickness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Glass Bottom */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} />
      </mesh>
      
      {/* Rim */}
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.4, 0.02, 16, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
      </mesh>

      {/* Label */}
      <Html center position={[0, -0.2, 0.36]} style={{ pointerEvents: "none" }}>
        <div style={{
          background: "rgba(255,255,255,0.8)", padding: "2px 8px", borderRadius: "4px",
          color: "#0f172a", fontSize: "0.6rem", fontWeight: "bold", border: "1px solid #cbd5e1"
        }}>
          500ml
        </div>
      </Html>
    </group>
  );
}

// ─── Pouring Bottle Animation ────────────────────────────────
function PouringBottle({ element, onFinish }: { element: LabElement, onFinish: () => void }) {
  const bottleRef = useRef<THREE.Group>(null!);
  const [pouring, setPouring] = useState(false);

  useFrame((state, delta) => {
    if (!bottleRef.current) return;
    
    // Animate bottle tilting (tilt LEFT so rotation.z becomes positive)
    if (bottleRef.current.rotation.z < Math.PI / 2.5) {
      bottleRef.current.rotation.z += delta * 3;
    } else if (!pouring) {
      setPouring(true);
      // Pour for 1.5 seconds, then finish
      setTimeout(onFinish, 1500);
    }
  });

  return (
    <group>
      <group ref={bottleRef} position={[0.65, 1.5, 0]}>
        {/* The Bottle */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshPhysicalMaterial color="#e2e8f0" transmission={0.9} opacity={0.5} transparent roughness={0.1} />
        </mesh>
        {/* Bottle Neck */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.2, 0.3, 16]} />
          <meshPhysicalMaterial color="#e2e8f0" transmission={0.9} opacity={0.5} transparent roughness={0.1} />
        </mesh>
        {/* Liquid inside bottle */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.18, 0.23, 0.6, 16]} />
          <meshStandardMaterial color={element.color} transparent opacity={0.9} />
        </mesh>
        
        {/* Label */}
        <Html center position={[0, 0, 0.26]} style={{ pointerEvents: "none" }}>
          <div style={{ background: element.color, color: "white", padding: "2px 6px", borderRadius: "2px", fontSize: "0.5rem", fontWeight: "bold" }}>
            {element.id}
          </div>
        </Html>
      </group>

      {/* Pouring Stream (detached from bottle rotation to go straight down) */}
      {pouring && (
        <mesh position={[0.03, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 2.2, 8]} />
          <meshStandardMaterial color={element.color} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ─── Particle System (Reactions) ─────────────────────────────
function ReactionParticles({ active, reaction }: { active: boolean, reaction: Reaction | null }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const particles = useRef<Particle[]>([]);

  useFrame((state, delta) => {
    if (!geoRef.current) return;

    // Spawn new particles if active
    if (active && reaction) {
      for (let i = 0; i < (reaction.hasExplosion ? 5 : 2); i++) {
        particles.current.push({
          id: Math.random(),
          pos: new THREE.Vector3((Math.random() - 0.5) * 0.4, -0.5, (Math.random() - 0.5) * 0.4),
          vel: new THREE.Vector3(
            (Math.random() - 0.5) * (reaction.hasExplosion ? 3 : 0.5),
            2 + Math.random() * (reaction.hasExplosion ? 5 : 2),
            (Math.random() - 0.5) * (reaction.hasExplosion ? 3 : 0.5)
          ),
          life: 0,
          maxLife: 1 + Math.random(),
          color: reaction.smokeColor,
          size: reaction.hasBubbles ? 0.05 : 0.15,
        });
      }
    }

    // Update particles
    const positions: number[] = [];
    const sizes: number[] = [];
    
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const p = particles.current[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        particles.current.splice(i, 1);
        continue;
      }
      
      p.pos.addScaledVector(p.vel, delta);
      // Add gravity/drag
      p.vel.y -= delta * 2;
      p.vel.x *= 0.95;
      p.vel.z *= 0.95;

      positions.push(p.pos.x, p.pos.y, p.pos.z);
      // Fade out size based on life
      sizes.push(p.size * (1 - p.life / p.maxLife));
    }

    geoRef.current.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geoRef.current.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      {/* ShaderMaterial is better for variable sizes, but PointsMaterial is simpler.
          Since we want individual sizes, we use a basic shader. */}
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{
          uColor: { value: new THREE.Color(reaction?.smokeColor || "#ffffff") }
        }}
        vertexShader={`
          attribute float size;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          void main() {
            vec2 xy = gl_PointCoord.xy - vec2(0.5);
            float ll = length(xy);
            if(ll > 0.5) discard;
            gl_FragColor = vec4(uColor, (0.5 - ll) * 2.0);
          }
        `}
      />
    </points>
  );
}

// ─── Drop Zone overlay ────────────────────────────────────────
function DropHandler({ onDrop }: { onDrop: () => void }) {
  const { gl } = useThree();

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    // In this simplified version, dropping anywhere in the canvas triggers the pour.
    // We assume the user wants to pour into the central beaker.
    onDrop();
  }, [onDrop]);

  useFrame(() => {
    gl.domElement.ondragover = (e) => e.preventDefault();
    gl.domElement.ondrop = handleDrop as any;
  });

  return null;
}

// ─── Main Lab Page ────────────────────────────────────────────
export function InteractiveLabPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  const navigate = useNavigate();

  const dragElementRef = useRef<LabElement | null>(null);

  const [beaker, setBeaker] = useState<BeakerState>({ contents: [], volume: 0, color: "#ffffff" });
  const [pouring, setPouring] = useState<LabElement | null>(null);
  
  const [activeReaction, setActiveReaction] = useState<Reaction | null>(null);
  const [reactionLabel, setReactionLabel] = useState("");

  function handleDragStart(el: LabElement) {
    dragElementRef.current = el;
  }

  function handleDrop() {
    const el = dragElementRef.current;
    if (!el || pouring) return;
    
    // Start pouring animation
    setPouring(el);
    dragElementRef.current = null;
  }

  function handlePourFinish() {
    if (!pouring) return;
    
    // Add to beaker contents
    setBeaker(prev => {
      const newContents = [...prev.contents, pouring];
      let newColor = pouring.color;
      let newVolume = Math.min(1.0, prev.volume + 0.2); // Each pour adds 20% volume
      
      // Check for reactions with existing contents
      let triggeredReaction: Reaction | null = null;
      for (const existing of prev.contents) {
        const r = getReaction(existing.id, pouring.id);
        if (r) {
          triggeredReaction = r;
          break;
        }
      }

      if (triggeredReaction) {
        newColor = triggeredReaction.resultColor;
        setActiveReaction(triggeredReaction);
        setReactionLabel(isRTL ? triggeredReaction.labelAr : triggeredReaction.labelEn);
        
        // Stop reaction particles after a few seconds
        setTimeout(() => setActiveReaction(null), 3000);
      } else if (prev.contents.length > 0) {
        // If no reaction, just mix the colors simply (average)
        const c1 = new THREE.Color(prev.color);
        const c2 = new THREE.Color(pouring.color);
        newColor = "#" + c1.lerp(c2, 0.5).getHexString();
      }

      return { contents: newContents, volume: newVolume, color: newColor };
    });

    setPouring(null);
  }

  function resetLab() {
    setBeaker({ contents: [], volume: 0, color: "#ffffff" });
    setPouring(null);
    setActiveReaction(null);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"}
      style={{ minHeight: "100vh", background: "#020617", fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "0.75rem 1.5rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50, flexShrink: 0,
      }}>
        <button onClick={() => navigate("/student/dashboard")} style={{
          background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b",
          padding: "8px", borderRadius: "10px", cursor: "pointer", display: "flex"
        }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ color: "#f1f5f9", margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            ⚗️ {t("lab.title", "Interactive Physics & Chemistry Lab")}
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.78rem" }}>
            {t("lab.subtitle", "Drag bottles into the scene to pour liquids into the beaker")}
          </p>
        </div>
        <button onClick={resetLab} style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#f87171", padding: "8px 14px", borderRadius: "10px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.82rem", fontWeight: 600
        }}>
          <RotateCcw size={14} /> {t("lab.reset", "Empty Beaker")}
        </button>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <LabSidebar onDragStart={handleDragStart} />

        {/* 3D Scene */}
        <div style={{ flex: 1, position: "relative" }}>
          <Canvas
            shadows
            camera={{ position: [0, 2, 6], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            style={{ background: "radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)" }}
          >
            <Suspense fallback={null}>
              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-3, 3, -3]} intensity={0.8} color="#6366f1" />

              <gridHelper args={[10, 20, "#1e293b", "#1e293b"]} position={[0, -1.42, 0]} />
              
              <LabEnvironment />
              
              {/* Central Beaker */}
              <CentralBeaker beakerState={beaker} />

              {/* Pouring Animation */}
              {pouring && <PouringBottle element={pouring} onFinish={handlePourFinish} />}

              {/* Reaction VFX */}
              <ReactionParticles active={activeReaction !== null} reaction={activeReaction} />

              {/* Drop handler */}
              <DropHandler onDrop={handleDrop} />

              <OrbitControls enablePan={false} minDistance={3} maxDistance={10} target={[0, 0, 0]} />
            </Suspense>
          </Canvas>

          {/* Reaction overlay */}
          {activeReaction && (
            <div style={{
              position: "absolute", bottom: "20px", left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)",
              border: `1px solid ${activeReaction.resultColor}55`,
              borderRadius: "14px", padding: "14px 20px",
              maxWidth: "500px", textAlign: "center",
              boxShadow: `0 8px 32px ${activeReaction.resultColor}33`,
              zIndex: 10,
              animation: "slideUp 0.3s ease-out forwards",
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>
                {activeReaction.hasExplosion ? "💥" : activeReaction.hasBubbles ? "🫧" : "⚗️"}
              </div>
              <div style={{ color: activeReaction.resultColor, fontWeight: 700, fontSize: "0.95rem", marginBottom: "4px" }}>
                REACTION TRIGGERED!
              </div>
              <div style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5 }}>
                {reactionLabel}
              </div>
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "center", gap: "8px", fontSize: "0.75rem" }}>
                {activeReaction.hasSmoke && <span style={{ color: "#94a3b8" }}>💨 Smoke generated</span>}
                {activeReaction.hasExplosion && <span style={{ color: "#f97316" }}>🔥 High Heat</span>}
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {beaker.contents.length === 0 && !pouring && (
            <div style={{
              position: "absolute", top: "20%", left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center", pointerEvents: "none",
            }}>
              <p style={{ color: "#64748b", fontSize: "0.9rem", background: "rgba(2,6,23,0.5)", padding: "8px 16px", borderRadius: "20px" }}>
                Drag a chemical bottle onto the canvas to pour it
              </p>
            </div>
          )}

          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translate(-50%, 20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
