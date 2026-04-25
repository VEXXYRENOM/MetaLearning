import { useRef, useState, Suspense, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, RotateCcw, Droplet } from "lucide-react";
import { LabSidebar } from "../components/lab/LabSidebar";
import { 
  LabElement, 
  ReactionStoichiometry, 
  STOICHIOMETRIC_REACTIONS, 
  BeakerSubstance, 
  calculateTotalVolume, 
  calculateMixtureColor, 
  getElementById 
} from "../lib/labElements";

const MAX_BEAKER_VOLUME_ML = 500;

// ─── Types ───────────────────────────────────────────────────
interface BeakerState {
  substances: BeakerSubstance[];
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

// ─── Stoichiometry Engine ────────────────────────────────────
function processReaction(
  currentSubstances: BeakerSubstance[], 
  currentTemp: number,
  pouredElement: LabElement, 
  pouredAmount: number // in grams
): { newSubstances: BeakerSubstance[], reactionTriggered: ReactionStoichiometry | null } {
  
  // Convert poured amount to moles
  let pouredMoles = pouredAmount / pouredElement.molarMass;
  let remainingPouredMoles = pouredMoles;
  let triggeredReaction: ReactionStoichiometry | null = null;
  
  // Deep copy current substances
  let newSubstances = currentSubstances.map(s => ({ ...s }));

  // Check against all known reactions
  for (const reaction of STOICHIOMETRIC_REACTIONS) {
    if (reaction.activationTemp && currentTemp < reaction.activationTemp) continue;

    const isPouredReactant = reaction.reactants[pouredElement.id] !== undefined;
    if (!isPouredReactant) continue;

    // Find if the other required reactants are in the beaker
    // For simplicity, we assume bi-molecular reactions (2 reactants max)
    const requiredReactants = Object.keys(reaction.reactants);
    const otherReactantId = requiredReactants.find(id => id !== pouredElement.id);
    
    if (otherReactantId) {
      const beakerReactantIndex = newSubstances.findIndex(s => s.elementId === otherReactantId);
      if (beakerReactantIndex !== -1) {
        const beakerReactant = newSubstances[beakerReactantIndex];
        
        // We have both reactants! Let's calculate limiting reactant
        const coefPoured = reaction.reactants[pouredElement.id];
        const coefBeaker = reaction.reactants[otherReactantId];

        const molesPouredAvailable = remainingPouredMoles;
        const molesBeakerAvailable = beakerReactant.moles;

        // Limiting reactant check
        const limitPoured = molesPouredAvailable / coefPoured;
        const limitBeaker = molesBeakerAvailable / coefBeaker;
        
        const isPouredLimiting = limitPoured < limitBeaker;
        const runs = isPouredLimiting ? limitPoured : limitBeaker;

        // Consume reactants
        remainingPouredMoles -= runs * coefPoured;
        beakerReactant.moles -= runs * coefBeaker;
        beakerReactant.mass = beakerReactant.moles * getElementById(otherReactantId)!.molarMass;

        // If beaker reactant is completely consumed, remove it
        if (beakerReactant.moles <= 0.001) {
          newSubstances.splice(beakerReactantIndex, 1);
        }

        // Produce products
        for (const [prodId, prodCoef] of Object.entries(reaction.products)) {
          const molesProduced = runs * prodCoef;
          const prodEl = getElementById(prodId);
          if (!prodEl) continue;

          // Gases escape, don't add to beaker (but they trigger VFX)
          if (prodEl.state === "g") continue;

          const existingProdIndex = newSubstances.findIndex(s => s.elementId === prodId);
          if (existingProdIndex !== -1) {
            newSubstances[existingProdIndex].moles += molesProduced;
            newSubstances[existingProdIndex].mass += molesProduced * prodEl.molarMass;
          } else {
            newSubstances.push({
              elementId: prodId,
              moles: molesProduced,
              mass: molesProduced * prodEl.molarMass
            });
          }
        }

        triggeredReaction = reaction;
        break; // Stop after first successful reaction for simplicity
      }
    }
  }

  // If there's leftover poured reactant, add it to beaker
  if (remainingPouredMoles > 0.001 && pouredElement.state !== "g") {
    const existingIndex = newSubstances.findIndex(s => s.elementId === pouredElement.id);
    if (existingIndex !== -1) {
      newSubstances[existingIndex].moles += remainingPouredMoles;
      newSubstances[existingIndex].mass += remainingPouredMoles * pouredElement.molarMass;
    } else {
      newSubstances.push({
        elementId: pouredElement.id,
        moles: remainingPouredMoles,
        mass: remainingPouredMoles * pouredElement.molarMass
      });
    }
  }

  return { newSubstances, reactionTriggered: triggeredReaction };
}

// ─── Static Lab Floor & Bench ─────────────────────────────────
function LabEnvironment() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, -1.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.15, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Bunsen Burner ────────────────────────────────────────────
function BunsenBurner3D({ isOn, onClick }: { isOn: boolean, onClick: () => void }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const particles = useRef<Particle[]>([]);

  useFrame((state, delta) => {
    if (!geoRef.current) return;

    if (isOn) {
      for (let i = 0; i < 4; i++) {
        particles.current.push({
          id: Math.random(),
          pos: new THREE.Vector3((Math.random() - 0.5) * 0.06, 0.4, (Math.random() - 0.5) * 0.06),
          vel: new THREE.Vector3((Math.random() - 0.5) * 0.1, 0.5 + Math.random() * 0.5, (Math.random() - 0.5) * 0.1),
          life: 0,
          maxLife: 0.2 + Math.random() * 0.3,
          color: Math.random() > 0.4 ? "#38bdf8" : "#fbbf24", // Blue core, orange tips
          size: 0.06,
        });
      }
    }

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
      positions.push(p.pos.x, p.pos.y, p.pos.z);
      sizes.push(p.size * (1 - p.life / p.maxLife));
    }

    geoRef.current.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geoRef.current.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  });

  return (
    <group 
      position={[0, -1.125, 0]} 
      onClick={(e) => { e.stopPropagation(); onClick(); }} 
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "auto"}
    >
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tube */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Valve/Knob */}
      <mesh position={[0.1, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.15, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glow Light */}
      {isOn && <pointLight position={[0, 0.5, 0]} color="#38bdf8" intensity={3} distance={2} />}

      {/* Fire Particles */}
      <points ref={pointsRef}>
        <bufferGeometry ref={geoRef} />
        <shaderMaterial
          transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={{ uColor: { value: new THREE.Color("#60a5fa") } }}
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
              // High intensity center for bloom
              gl_FragColor = vec4(uColor * 2.0, (0.5 - ll) * 2.0);
            }
          `}
        />
      </points>

      {/* Interactive Label */}
      <Html center position={[0, 0.2, 0.3]} style={{ pointerEvents: "none" }}>
        <div style={{
          background: isOn ? "rgba(239,68,68,0.9)" : "rgba(100,116,139,0.9)",
          color: "white", padding: "2px 6px", borderRadius: "4px",
          fontSize: "0.55rem", fontWeight: "bold", opacity: 0.8
        }}>
          {isOn ? "🔥 ON" : "OFF"}
        </div>
      </Html>
    </group>
  );
}

// ─── Liquid Mesh ──────────────────────────────────────────────
function LiquidMesh({ volumeML, targetColor, isBoiling }: { volumeML: number; targetColor: string, isBoiling: boolean }) {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null!);
  const colorObj = useRef(new THREE.Color(targetColor));

  // Convert volumeML to 0.0 - 1.0 ratio based on MAX_BEAKER_VOLUME_ML
  const ratio = Math.max(0.01, Math.min(1.0, volumeML / MAX_BEAKER_VOLUME_ML));
  
  const liquidHeight = ratio * 0.9;
  const yPos = -0.48 + (liquidHeight / 2);

  useFrame((state) => {
    if (matRef.current) {
      colorObj.current.set(targetColor);
      matRef.current.color.lerp(colorObj.current, 0.05);
      
      // Simulate boiling bubbling by slightly modulating opacity/roughness
      if (isBoiling) {
        matRef.current.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 15) * 0.1;
      } else if (volumeML > 1) {
        matRef.current.opacity = 0.85;
      }
    }
  });

  return (
    <mesh position={[0, yPos, 0]}>
      <cylinderGeometry args={[0.34, 0.34, liquidHeight, 32]} />
      <meshPhysicalMaterial
        ref={matRef}
        color={targetColor}
        transparent
        opacity={volumeML > 1 ? 0.85 : 0}
        roughness={0.1}
        transmission={0.6}
        thickness={0.5}
      />
    </mesh>
  );
}

// ─── Central Beaker ──────────────────────────────────────────
function CentralBeaker({ beakerState, volumeML, tempRef, isBoiling }: { beakerState: BeakerState, volumeML: number, tempRef: React.MutableRefObject<number>, isBoiling: boolean }) {
  const tempLabelRef = useRef<HTMLDivElement>(null!);

  useFrame(() => {
    if (tempLabelRef.current) {
      tempLabelRef.current.innerText = `${tempRef.current.toFixed(1)} °C`;
    }
  });

  return (
    <group position={[0, -0.625, 0]}>
      <LiquidMesh volumeML={volumeML} targetColor={beakerState.color} isBoiling={isBoiling} />

      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.35, 1.0, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#ffffff" transparent opacity={0.15}
          roughness={0.05} metalness={0.1} transmission={0.95} thickness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.4, 0.02, 16, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
      </mesh>

      <Html center position={[0, -0.2, 0.36]} style={{ pointerEvents: "none" }}>
        <div style={{
          background: "rgba(255,255,255,0.8)", padding: "2px 8px", borderRadius: "4px",
          color: "#0f172a", fontSize: "0.6rem", fontWeight: "bold", border: "1px solid #cbd5e1",
          textAlign: "center", marginBottom: "4px"
        }}>
          {Math.round(volumeML)} / {MAX_BEAKER_VOLUME_ML} mL
        </div>
        <div 
          ref={tempLabelRef}
          style={{
            background: "rgba(239,68,68,0.9)", padding: "2px 8px", borderRadius: "4px",
            color: "white", fontSize: "0.6rem", fontWeight: "bold", border: "1px solid #b91c1c",
            textAlign: "center", fontFamily: "monospace"
          }}>
          25.0 °C
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
    
    if (bottleRef.current.rotation.z < Math.PI / 2.5) {
      bottleRef.current.rotation.z += delta * 3;
    } else if (!pouring) {
      setPouring(true);
      setTimeout(onFinish, 1500); // Pouring duration could be scaled by amount, kept constant for UX
    }
  });

  return (
    <group>
      <group ref={bottleRef} position={[0.65, 1.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.25, 0.8, 16]} />
          <meshPhysicalMaterial color="#e2e8f0" transmission={0.9} opacity={0.5} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.08, 0.2, 0.3, 16]} />
          <meshPhysicalMaterial color="#e2e8f0" transmission={0.9} opacity={0.5} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.18, 0.23, 0.6, 16]} />
          <meshStandardMaterial color={element.color} transparent opacity={0.9} />
        </mesh>
        <Html center position={[0, 0, 0.26]} style={{ pointerEvents: "none" }}>
          <div style={{ background: element.color, color: "white", padding: "2px 6px", borderRadius: "2px", fontSize: "0.5rem", fontWeight: "bold" }}>
            {element.id}
          </div>
        </Html>
      </group>

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
function ReactionParticles({ active, reaction }: { active: boolean, reaction: ReactionStoichiometry | null }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const particles = useRef<Particle[]>([]);

  useFrame((state, delta) => {
    if (!geoRef.current) return;

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
      p.vel.y -= delta * 2;
      p.vel.x *= 0.95;
      p.vel.z *= 0.95;

      positions.push(p.pos.x, p.pos.y, p.pos.z);
      sizes.push(p.size * (1 - p.life / p.maxLife));
    }

    geoRef.current.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geoRef.current.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={{ uColor: { value: new THREE.Color(reaction?.smokeColor || "#ffffff") } }}
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
    onDrop();
  }, [onDrop]);

  useFrame(() => {
    gl.domElement.ondragover = (e) => e.preventDefault();
    gl.domElement.ondrop = handleDrop as any;
  });
  return null;
}

// ─── Volume Modal ─────────────────────────────────────────────
function VolumeModal({ 
  element, 
  onConfirm, 
  onCancel,
  currentVolume
}: { 
  element: LabElement, 
  onConfirm: (amount: number) => void, 
  onCancel: () => void,
  currentVolume: number
}) {
  const [amount, setAmount] = useState<string>("50");
  const isLiquid = element.state === "l" || element.state === "aq";
  const unit = isLiquid ? "mL" : "g";
  const maxAmount = isLiquid ? MAX_BEAKER_VOLUME_ML - currentVolume : 100;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(2,6,23,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
    }}>
      <div style={{
        background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "24px", width: "320px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)", fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "2rem" }}>{element.emoji}</div>
          <div>
            <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem" }}>{element.name}</h3>
            <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Molar Mass: {element.molarMass} g/mol</span>
          </div>
        </div>

        <label style={{ display: "block", color: "#cbd5e1", fontSize: "0.85rem", marginBottom: "8px" }}>
          Amount to add ({unit}):
        </label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            max={maxAmount}
            min={1}
            autoFocus
            style={{
              flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", borderRadius: "8px", padding: "10px 14px", fontSize: "1rem"
            }}
          />
          <div style={{ 
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "0 14px", color: "#64748b" 
          }}>
            {unit}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{
            flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
            color: "white", padding: "10px", borderRadius: "8px", cursor: "pointer"
          }}>
            Cancel
          </button>
          <button 
            onClick={() => {
              const val = parseFloat(amount);
              if (val > 0 && val <= maxAmount) onConfirm(val);
            }} 
            style={{
              flex: 1, background: "#6366f1", border: "none",
              color: "white", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            Pour <Droplet size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </button>
        </div>
        
        {parseFloat(amount) > maxAmount && (
          <p style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "10px", textAlign: "center" }}>
            Exceeds beaker capacity! Max: {maxAmount.toFixed(1)} {unit}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Lab Page ────────────────────────────────────────────
export function InteractiveLabPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language.startsWith("ar");
  const navigate = useNavigate();

  const dragElementRef = useRef<LabElement | null>(null);

  const [beaker, setBeaker] = useState<BeakerState>({ substances: [], color: "#ffffff" });
  
  // Pending pour state
  const [pendingPour, setPendingPour] = useState<LabElement | null>(null);
  
  // Active pouring animation state
  const [pouring, setPouring] = useState<{ element: LabElement, amount: number } | null>(null);
  
  const [activeReaction, setActiveReaction] = useState<ReactionStoichiometry | null>(null);
  const [reactionLabel, setReactionLabel] = useState("");

  // Burner State
  const [burnerState, setBurnerState] = useState<{ placed: boolean, on: boolean }>({ placed: false, on: false });
  const tempRef = useRef(25.0);
  const [isBoiling, setIsBoiling] = useState(false);

  const currentVolumeML = calculateTotalVolume(beaker.substances);

  // Thermodynamics Engine Loop
  useEffect(() => {
    const interval = setInterval(() => {
      let tempDelta = 0;
      const totalMass = beaker.substances.reduce((acc, s) => acc + s.mass, 0);
      
      if (burnerState.on && totalMass > 0) {
        // Q = mcΔT. Assume burner gives 1000 J per 500ms tick. Assume specific heat c = 4.18 J/g°C
        tempDelta = 1000 / (totalMass * 4.18);
      } else if (tempRef.current > 25) {
        // Natural cooling
        tempDelta = -0.5;
      }

      if (tempDelta !== 0) {
        let newTemp = tempRef.current + tempDelta;
        let boiling = false;

        // Phase change: Boiling Water
        const h2oIndex = beaker.substances.findIndex(s => s.elementId === "H2O");
        if (h2oIndex !== -1 && newTemp >= 100) {
          newTemp = 100;
          boiling = true;
          // Evaporate water: Q = mLv (Lv = 2260 J/g for water) -> 1000 J = 0.44g evaporated per tick
          if (burnerState.on) {
            setBeaker(prev => {
              const next = [...prev.substances];
              const h2o = next.find(s => s.elementId === "H2O");
              if (h2o) {
                h2o.mass -= 0.44;
                h2o.moles = h2o.mass / 18.015;
                if (h2o.mass <= 0) next.splice(next.indexOf(h2o), 1);
              }
              return { ...prev, substances: next };
            });
          }
        }
        
        setIsBoiling(boiling);
        tempRef.current = Math.max(25, newTemp);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [burnerState.on, beaker.substances]);

  function handleDragStart(el: LabElement) {
    dragElementRef.current = el;
  }

  function handleDrop() {
    const el = dragElementRef.current;
    if (!el || pouring || pendingPour) return;
    
    if (el.category === "equipment") {
      if (el.id === "BunsenBurner") {
         setBurnerState({ placed: true, on: false });
      }
      dragElementRef.current = null;
      return;
    }

    // Show Volume Modal instead of pouring instantly
    setPendingPour(el);
    dragElementRef.current = null;
  }

  function handleModalConfirm(amount: number) {
    if (!pendingPour) return;
    setPouring({ element: pendingPour, amount });
    setPendingPour(null);
  }

  function handlePourFinish() {
    if (!pouring) return;
    
    // Convert poured volume/mass to mass (grams) for the stoichiometry engine
    const pouredEl = pouring.element;
    const isLiquid = pouredEl.state === "l" || pouredEl.state === "aq";
    const massGrams = isLiquid ? pouring.amount * (pouredEl.density || 1.0) : pouring.amount;

    // Run Stoichiometry Engine
    const { newSubstances, reactionTriggered } = processReaction(beaker.substances, tempRef.current, pouredEl, massGrams);

    let newColor = calculateMixtureColor(newSubstances);

    if (reactionTriggered) {
      newColor = reactionTriggered.resultColor;
      setActiveReaction(reactionTriggered);
      setReactionLabel(isRTL ? reactionTriggered.labelAr : reactionTriggered.labelEn);
      setTimeout(() => setActiveReaction(null), 4000);
    }

    setBeaker({ substances: newSubstances, color: newColor });
    setPouring(null);
  }

  function resetLab() {
    setBeaker({ substances: [], color: "#ffffff" });
    setPouring(null);
    setPendingPour(null);
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
            {t("lab.subtitle", "Stoichiometric Precision Mode. Enter exact quantities to pour.")}
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
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        
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
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-3, 3, -3]} intensity={0.8} color="#6366f1" />

              <gridHelper args={[10, 20, "#1e293b", "#1e293b"]} position={[0, -1.42, 0]} />
              
              <LabEnvironment />
              
              {/* Conditional Burner */}
              {burnerState.placed && (
                <BunsenBurner3D 
                  isOn={burnerState.on} 
                  onClick={() => setBurnerState(s => ({ ...s, on: !s.on }))} 
                />
              )}

              <CentralBeaker beakerState={beaker} volumeML={currentVolumeML} tempRef={tempRef} isBoiling={isBoiling} />

              {pouring && <PouringBottle element={pouring.element} onFinish={handlePourFinish} />}
              <ReactionParticles active={activeReaction !== null} reaction={activeReaction} />

              <DropHandler onDrop={handleDrop} />
              <OrbitControls enablePan={false} minDistance={3} maxDistance={10} target={[0, 0, 0]} />
              
              {/* High-End Post Processing */}
              <EffectComposer>
                <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.5} intensity={1.5} />
              </EffectComposer>
            </Suspense>
          </Canvas>

          {/* Volume Selection Modal */}
          {pendingPour && (
            <VolumeModal 
              element={pendingPour} 
              currentVolume={currentVolumeML}
              onConfirm={handleModalConfirm} 
              onCancel={() => setPendingPour(null)} 
            />
          )}

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
                STOICHIOMETRIC REACTION!
              </div>
              <div style={{ color: "#cbd5e1", fontSize: "0.85rem", lineHeight: 1.5 }}>
                {reactionLabel}
              </div>
            </div>
          )}

          {/* Empty state hint */}
          {beaker.substances.length === 0 && !pouring && !pendingPour && (
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
