import { useRef, useState, Suspense, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Physics, usePlane, useSphere } from "@react-three/cannon";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw, Info } from "lucide-react";
import { LabSidebar } from "../components/lab/LabSidebar";
import { LabElement, getReaction, Reaction } from "../lib/labElements";

// ─── Types ───────────────────────────────────────────────────
interface SpawnedElement {
  uid: string;
  elementId: string;
  element: LabElement;
  position: [number, number, number];
}

interface Particle {
  id: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  color: string;
}

// ─── Static Lab Floor ─────────────────────────────────────────
function LabFloor() {
  const [ref] = usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1.5, 0],
    type: "Static",
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#0f172a"
        roughness={0.8}
        metalness={0.2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// ─── Lab Bench (static box) ───────────────────────────────────
function LabBench() {
  return (
    <mesh position={[0, -1.2, 0]} receiveShadow castShadow>
      <boxGeometry args={[8, 0.15, 4]} />
      <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
    </mesh>
  );
}

// ─── Beaker (static — glass look) ────────────────────────────
function Beaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* cylinder body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.35, 1.0, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#e0f2fe" transparent opacity={0.25}
          roughness={0} metalness={0} transmission={0.9} thickness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* bottom */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 24]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.3} roughness={0} />
      </mesh>
      {/* label */}
      <Html center position={[0, -0.9, 0]} style={{ pointerEvents: "none" }}>
        <span style={{ color: "#94a3b8", fontSize: "0.7rem", fontFamily: "Inter, sans-serif",
          whiteSpace: "nowrap", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>🧪 Beaker</span>
      </Html>
    </group>
  );
}

// ─── Physics Sphere (dropped element) ────────────────────────
function PhysicsSphere({
  item, onCollide,
}: {
  item: SpawnedElement;
  onCollide: (uid: string, otherUid: string) => void;
}) {
  const el = item.element;
  const colorRef = useRef(new THREE.Color(el.color));
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const [reacted, setReacted] = useState(false);

  const [ref] = useSphere<THREE.Mesh>(() => ({
    mass: el.mass,
    position: item.position,
    args: [el.radius],
    restitution: 0.4,
    friction: 0.6,
    linearDamping: 0.3,
    onCollide: (e) => {
      const otherId = (e.body as any)?.__uid;
      if (otherId && !reacted) onCollide(item.uid, otherId);
    },
  }));

  useFrame(() => {
    if (matRef.current) {
      matRef.current.color.lerp(colorRef.current, 0.05);
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <icosahedronGeometry args={[el.radius, 2]} />
      <meshStandardMaterial
        ref={matRef}
        color={el.color}
        emissive={el.emissive}
        emissiveIntensity={0.25}
        metalness={el.metalness}
        roughness={el.roughness}
      />
      <Html center distanceFactor={6} style={{ pointerEvents: "none" }}>
        <span style={{
          color: "white", fontSize: "0.65rem", fontWeight: 700,
          fontFamily: "Inter, sans-serif", textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          background: "rgba(0,0,0,0.5)", padding: "1px 5px", borderRadius: "4px",
          whiteSpace: "nowrap"
        }}>{el.id}</span>
      </Html>
    </mesh>
  );
}

// ─── Particle System ─────────────────────────────────────────
function ParticleSystem({ particles }: { particles: Particle[] }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const geoRef = useRef<THREE.BufferGeometry>(null!);

  useFrame(() => {
    if (!geoRef.current || particles.length === 0) return;
    const positions = new Float32Array(particles.length * 3);
    particles.forEach((p, i) => {
      positions[i * 3]     = p.pos.x;
      positions[i * 3 + 1] = p.pos.y;
      positions[i * 3 + 2] = p.pos.z;
    });
    geoRef.current.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geoRef.current.attributes.position.needsUpdate = true;
  });

  if (particles.length === 0) return null;
  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      <pointsMaterial size={0.12} color="#ff6600" vertexColors={false}
        transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

// ─── Drop Zone overlay (invisible DOM plane to capture drops) ─
function DropHandler({
  onDrop,
}: {
  onDrop: (worldPos: [number, number, number]) => void;
}) {
  const { camera, gl } = useThree();

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.5); // drop at y=1.5
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, target);
    if (target) onDrop([target.x, target.y, target.z]);
  }, [camera, gl, onDrop]);

  // attach listener to canvas
  useFrame(() => {
    gl.domElement.ondragover  = (e) => e.preventDefault();
    gl.domElement.ondrop      = handleDrop as any;
  });

  return null;
}

// ─── Main Lab Page ────────────────────────────────────────────
export function InteractiveLabPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  const navigate = useNavigate();

  const [spawned, setSpawned] = useState<SpawnedElement[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [reactionLabel, setReactionLabel] = useState("");
  const dragElementRef = useRef<LabElement | null>(null);
  const uidCounter = useRef(0);

  // Track spawned IDs by uid for collision matching
  const uidMap = useRef<Record<string, string>>({}); // uid → elementId

  function handleDragStart(el: LabElement) {
    dragElementRef.current = el;
  }

  function handleDrop(worldPos: [number, number, number]) {
    const el = dragElementRef.current;
    if (!el) return;
    if (el.mass === 0) {
      // Equipment — static, place on bench
      const uid = `e_${uidCounter.current++}`;
      setSpawned(prev => [...prev, { uid, elementId: el.id, element: el, position: [worldPos[0], -0.7, worldPos[2]] }]);
    } else {
      const uid = `e_${uidCounter.current++}`;
      uidMap.current[uid] = el.id;
      setSpawned(prev => [...prev, { uid, elementId: el.id, element: el, position: [worldPos[0], worldPos[1] + 2, worldPos[2]] }]);
    }
    dragElementRef.current = null;
  }

  function handleCollide(uidA: string, uidB: string) {
    const idA = uidMap.current[uidA];
    const idB = uidMap.current[uidB];
    if (!idA || !idB) return;
    const r = getReaction(idA, idB);
    if (!r) return;

    // Show reaction info
    setReaction(r);
    setReactionLabel(i18n.language.startsWith("ar") ? r.labelAr : r.labelEn);

    // Trigger particles burst at midpoint of the two objects
    const srcItem = spawned.find(s => s.uid === uidA);
    if (srcItem) {
      const center = srcItem.position;
      const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
        id: Date.now() + i,
        pos: new THREE.Vector3(center[0], center[1], center[2]),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * (r.hasExplosion ? 4 : 1),
          Math.random() * (r.hasExplosion ? 5 : 2),
          (Math.random() - 0.5) * (r.hasExplosion ? 4 : 1)
        ),
        life: 1,
        maxLife: 1,
        color: r.smokeColor,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 2000);
    }

    // Auto-clear reaction label
    setTimeout(() => setReaction(null), 5000);
  }

  function resetLab() {
    setSpawned([]);
    setParticles([]);
    setReaction(null);
    uidMap.current = {};
    uidCounter.current = 0;
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
            {t("lab.subtitle", "Drag elements from the sidebar into the scene to trigger reactions")}
          </p>
        </div>
        <button onClick={resetLab} style={{
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#f87171", padding: "8px 14px", borderRadius: "10px",
          cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
          fontSize: "0.82rem", fontWeight: 600
        }}>
          <RotateCcw size={14} /> {t("lab.reset", "Reset")}
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
            camera={{ position: [0, 3, 8], fov: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            style={{ background: "radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)" }}
          >
            <Suspense fallback={null}>
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow
                shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-3, 3, -3]} intensity={0.6} color="#6366f1" />

              {/* Grid helper */}
              <gridHelper args={[10, 20, "#1e293b", "#1e293b"]} position={[0, -1.42, 0]} />

              {/* Physics World */}
              <Physics gravity={[0, -9.81, 0]} iterations={10} broadphase="SAP">
                <LabFloor />
                <LabBench />
                {/* Default beaker on bench */}
                <Beaker position={[0, -0.65, 0]} />
                <Beaker position={[2, -0.65, 0]} />

                {/* Spawned elements */}
                {spawned.map(item => (
                  <PhysicsSphere
                    key={item.uid}
                    item={item}
                    onCollide={handleCollide}
                  />
                ))}
              </Physics>

              {/* Particles */}
              <ParticleSystem particles={particles} />

              {/* Drop handler */}
              <DropHandler onDrop={handleDrop} />

              <OrbitControls enablePan={false} minDistance={4} maxDistance={16} />
            </Suspense>
          </Canvas>

          {/* Reaction overlay */}
          {reaction && (
            <div style={{
              position: "absolute", bottom: "20px", left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)",
              border: `1px solid ${reaction.resultColor}55`,
              borderRadius: "14px", padding: "14px 20px",
              maxWidth: "500px", textAlign: "center",
              boxShadow: `0 8px 32px ${reaction.resultColor}33`,
              zIndex: 10,
            }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>
                {reaction.hasExplosion ? "💥" : reaction.hasBubbles ? "🫧" : "⚗️"}
              </div>
              <div style={{ color: reaction.resultColor, fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>
                {reaction.effect.toUpperCase()} REACTION
              </div>
              <div style={{ color: "#cbd5e1", fontSize: "0.82rem", lineHeight: 1.5 }}>
                {reactionLabel}
              </div>
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "center", gap: "8px", fontSize: "0.75rem" }}>
                {reaction.hasSmoke && <span style={{ color: "#94a3b8" }}>💨 Smoke</span>}
                {reaction.hasBubbles && <span style={{ color: "#38bdf8" }}>🫧 Bubbles</span>}
                {reaction.hasExplosion && <span style={{ color: "#f97316" }}>🔥 Heat: {reaction.heat}°</span>}
                <span style={{ color: "#a5b4fc" }}>+{reaction.xpReward} XP</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {spawned.length === 0 && (
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center", pointerEvents: "none",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚗️</div>
              <p style={{ color: "#475569", fontSize: "0.95rem" }}>
                {t("lab.empty", "Drag an element from the sidebar to start")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
