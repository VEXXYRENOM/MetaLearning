// src/components/lesson/DynamicEnvironment.tsx
// Dynamic lesson environments for MetaLearning 3D scenes
// Each subject gets a unique atmosphere: background color, ambient light, and particle effects

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, Environment } from "@react-three/drei";
import * as THREE from "three";

// ── Environment config per subject keyword ───────────────────────────────────
interface EnvConfig {
  bgTop: string;       // gradient top color
  bgBottom: string;    // gradient bottom color
  ambientColor: string;
  ambientIntensity: number;
  directionalColor: string;
  directionalIntensity: number;
  directionalPos: [number, number, number];
  showStars: boolean;
  starCount: number;
  environmentPreset?: "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse" | "apartment";
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
}

const ENV_CONFIGS: Record<string, EnvConfig> = {
  // 🔬 Biology / SVT — dark blue lab atmosphere
  biology: {
    bgTop: "#020b18",
    bgBottom: "#051a35",
    ambientColor: "#1a4a8a",
    ambientIntensity: 0.6,
    directionalColor: "#4fc3f7",
    directionalIntensity: 1.2,
    directionalPos: [5, 10, 5],
    showStars: false,
    starCount: 0,
    environmentPreset: "city",
    fogColor: "#010d1f",
    fogNear: 15,
    fogFar: 40,
  },

  // 🌌 Astronomy / Space — starfield with nebula
  astronomy: {
    bgTop: "#000005",
    bgBottom: "#06001a",
    ambientColor: "#9b59b6",
    ambientIntensity: 0.3,
    directionalColor: "#ffffff",
    directionalIntensity: 2.0,
    directionalPos: [10, 5, -5],
    showStars: true,
    starCount: 4000,
    environmentPreset: "night",
  },

  // 🌍 Geography — earthy blue-green
  geography: {
    bgTop: "#021a0f",
    bgBottom: "#063020",
    ambientColor: "#2d7a4f",
    ambientIntensity: 0.5,
    directionalColor: "#f0e06a",
    directionalIntensity: 1.4,
    directionalPos: [8, 12, 4],
    showStars: false,
    starCount: 0,
    environmentPreset: "forest",
    fogColor: "#021810",
    fogNear: 20,
    fogFar: 50,
  },

  // 🏛️ History — warm museum golden light
  history: {
    bgTop: "#1a0e00",
    bgBottom: "#2d1a00",
    ambientColor: "#c8860a",
    ambientIntensity: 0.7,
    directionalColor: "#ffe0a0",
    directionalIntensity: 1.8,
    directionalPos: [3, 8, 6],
    showStars: false,
    starCount: 0,
    environmentPreset: "lobby",
    fogColor: "#1a0e00",
    fogNear: 10,
    fogFar: 35,
  },

  // 📐 Mathematics — clean geometric dark
  mathematics: {
    bgTop: "#05050f",
    bgBottom: "#0a0a20",
    ambientColor: "#3a3aff",
    ambientIntensity: 0.4,
    directionalColor: "#a0b0ff",
    directionalIntensity: 1.5,
    directionalPos: [0, 10, 5],
    showStars: false,
    starCount: 0,
    environmentPreset: "city",
  },

  // ⚗️ Chemistry — teal lab glow
  chemistry: {
    bgTop: "#001a1a",
    bgBottom: "#003030",
    ambientColor: "#00c8a0",
    ambientIntensity: 0.6,
    directionalColor: "#80ffee",
    directionalIntensity: 1.3,
    directionalPos: [5, 8, 3],
    showStars: false,
    starCount: 0,
    environmentPreset: "warehouse",
    fogColor: "#001515",
    fogNear: 12,
    fogFar: 40,
  },

  // 🎨 Art — warm studio
  art: {
    bgTop: "#1a0a1a",
    bgBottom: "#2d0d2d",
    ambientColor: "#cc44aa",
    ambientIntensity: 0.7,
    directionalColor: "#ffcce0",
    directionalIntensity: 1.6,
    directionalPos: [-4, 10, 8],
    showStars: false,
    starCount: 0,
    environmentPreset: "studio",
  },

  // 🗣️ Languages — warm classroom
  languages: {
    bgTop: "#0f0a00",
    bgBottom: "#1e1500",
    ambientColor: "#d4a030",
    ambientIntensity: 0.6,
    directionalColor: "#ffe8a0",
    directionalIntensity: 1.4,
    directionalPos: [4, 9, 4],
    showStars: false,
    starCount: 0,
    environmentPreset: "apartment",
  },

  // ⚛️ Physics — dark with electric blue
  physics: {
    bgTop: "#000510",
    bgBottom: "#000820",
    ambientColor: "#0044cc",
    ambientIntensity: 0.5,
    directionalColor: "#60a0ff",
    directionalIntensity: 1.5,
    directionalPos: [6, 8, -3],
    showStars: true,
    starCount: 800,
    environmentPreset: "night",
  },

  // default
  default: {
    bgTop: "#070b14",
    bgBottom: "#0d1420",
    ambientColor: "#334155",
    ambientIntensity: 0.5,
    directionalColor: "#e2e8f0",
    directionalIntensity: 1.2,
    directionalPos: [5, 8, 5],
    showStars: false,
    starCount: 0,
    environmentPreset: "city",
  },
};

// ── Subject → config key mapping ─────────────────────────────────────────────
function getEnvKey(subjectEn?: string, subjectAr?: string): string {
  const s = (subjectEn || subjectAr || "").toLowerCase();
  if (s.includes("biology") || s.includes("svt") || s.includes("حياة")) return "biology";
  if (s.includes("astronomy") || s.includes("فلك") || s.includes("space")) return "astronomy";
  if (s.includes("geography") || s.includes("geograph") || s.includes("جغراف") || s.includes("أرض")) return "geography";
  if (s.includes("history") || s.includes("تاريخ")) return "history";
  if (s.includes("math") || s.includes("رياضيات")) return "mathematics";
  if (s.includes("chem") || s.includes("كيمياء")) return "chemistry";
  if (s.includes("art") || s.includes("فنون")) return "art";
  if (s.includes("lang") || s.includes("لغات")) return "languages";
  if (s.includes("physics") || s.includes("فيزياء")) return "physics";
  return "default";
}

// ── Animated background gradient plane ───────────────────────────────────────
function AnimatedBackground({ config }: { config: EnvConfig }) {
  const { scene } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Build gradient shader once
  const shader = useMemo(() => ({
    uniforms: {
      colorTop:    { value: new THREE.Color(config.bgTop) },
      colorBottom: { value: new THREE.Color(config.bgBottom) },
      time:        { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorTop;
      uniform vec3 colorBottom;
      uniform float time;
      varying vec2 vUv;
      void main() {
        float pulse = sin(time * 0.4) * 0.04;
        float t = smoothstep(0.0, 1.0, vUv.y + pulse);
        gl_FragColor = vec4(mix(colorBottom, colorTop, t), 1.0);
      }
    `,
    depthWrite: false,
  }), [config.bgTop, config.bgBottom]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  // Apply as scene background color (simple, avoids plane z-fighting issues)
  useFrame(() => {
    scene.background = new THREE.Color(config.bgBottom);
  });

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────
interface DynamicEnvironmentProps {
  subjectEn?: string;
  subjectAr?: string;
}

export function DynamicEnvironment({ subjectEn, subjectAr }: DynamicEnvironmentProps) {
  const key = getEnvKey(subjectEn, subjectAr);
  const config = ENV_CONFIGS[key] ?? ENV_CONFIGS.default;

  return (
    <>
      {/* Animated background */}
      <AnimatedBackground config={config} />

      {/* Ambient fill light */}
      <ambientLight color={config.ambientColor} intensity={config.ambientIntensity} />

      {/* Key directional light */}
      <directionalLight
        color={config.directionalColor}
        intensity={config.directionalIntensity}
        position={config.directionalPos}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Rim light from below for premium look */}
      <pointLight
        color={config.ambientColor}
        intensity={0.4}
        position={[0, -3, 0]}
      />

      {/* Stars for space/physics lessons */}
      {config.showStars && (
        <Stars
          radius={60}
          depth={50}
          count={config.starCount}
          factor={5}
          saturation={0.5}
          fade
          speed={0.5}
        />
      )}

      {/* Environment map for reflections */}
      {config.environmentPreset && (
        <Environment preset={config.environmentPreset} background={false} />
      )}
    </>
  );
}
