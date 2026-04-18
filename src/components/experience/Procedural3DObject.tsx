import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface Props {
  category: string;
  autoRotate?: boolean;
  pulse?: boolean;
}

/**
 * Builds a REAL 3D object from Three.js geometry primitives.
 * No images, no flat planes — actual 3D volumetric mesh.
 */
export function Procedural3DObject({ category, autoRotate = true, pulse = false }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.elapsedTime;
    if (autoRotate) g.rotation.y = t * 0.5;
    if (pulse) g.scale.setScalar(1 + Math.sin(t * Math.PI * 1.3) * 0.02);
  });

  const content = useMemo(() => {
    switch (category) {
      case "animal": return <AnimalObject />;
      case "vehicle": return <VehicleObject />;
      case "nature": return <NatureObject />;
      case "architecture": return <ArchitectureObject />;
      case "tech": return <TechObject />;
      case "science": return <ScienceObject />;
      case "space": return <SpaceObject />;
      case "fantasy": return <FantasyObject />;
      default: return <AbstractObject />;
    }
  }, [category]);

  return <group ref={groupRef}>{content}</group>;
}

// ── حيوان (كلب / قطة / أسد) ──────────────────────────────────────────────
function AnimalObject() {
  const fur = new THREE.MeshStandardMaterial({ color: "#8b4513", roughness: 0.85, metalness: 0.0 });
  const darkFur = new THREE.MeshStandardMaterial({ color: "#5a2800", roughness: 0.9, metalness: 0.0 });
  const white = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.3 });
  const pink = new THREE.MeshStandardMaterial({ color: "#cc5533", roughness: 0.7 });

  return (
    <group>
      {/* جسم */}
      <mesh material={fur} castShadow position={[0, -0.3, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      {/* رأس */}
      <mesh material={fur} castShadow position={[0, 1.05, 0.15]}>
        <sphereGeometry args={[0.72, 32, 32]} />
      </mesh>
      {/* أذن يسار */}
      <mesh material={darkFur} castShadow position={[-0.42, 1.65, 0]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.26, 16, 16]} />
      </mesh>
      {/* أذن يمين */}
      <mesh material={darkFur} castShadow position={[0.42, 1.65, 0]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.26, 16, 16]} />
      </mesh>
      {/* داخل أذن يسار */}
      <mesh material={pink} position={[-0.42, 1.65, 0.1]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </mesh>
      {/* داخل أذن يمين */}
      <mesh material={pink} position={[0.42, 1.65, 0.1]} rotation={[0, 0, -0.3]}>
        <sphereGeometry args={[0.14, 12, 12]} />
      </mesh>
      {/* عين يسار - بياض */}
      <mesh material={white} position={[-0.24, 1.12, 0.65]}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
      {/* عين يمين - بياض */}
      <mesh material={white} position={[0.24, 1.12, 0.65]}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
      {/* حدقة يسار */}
      <mesh material={dark} position={[-0.24, 1.12, 0.77]}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
      {/* حدقة يمين */}
      <mesh material={dark} position={[0.24, 1.12, 0.77]}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
      {/* أنف */}
      <mesh material={dark} position={[0, 0.9, 0.72]} scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.11, 12, 12]} />
      </mesh>
      {/* رجل أمامية يسار */}
      <mesh material={fur} castShadow position={[-0.55, -1.0, 0.4]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
      </mesh>
      {/* رجل أمامية يمين */}
      <mesh material={fur} castShadow position={[0.55, -1.0, 0.4]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.2, 0.6, 8, 16]} />
      </mesh>
      {/* رجل خلفية يسار */}
      <mesh material={darkFur} castShadow position={[-0.65, -1.1, -0.25]} rotation={[-0.2, 0, 0.1]}>
        <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
      </mesh>
      {/* رجل خلفية يمين */}
      <mesh material={darkFur} castShadow position={[0.65, -1.1, -0.25]} rotation={[-0.2, 0, -0.1]}>
        <capsuleGeometry args={[0.22, 0.5, 8, 16]} />
      </mesh>
      {/* ذيل */}
      <mesh material={darkFur} position={[-0.2, 0.2, -1.1]} rotation={[0.5, 0.5, -1.0]}>
        <capsuleGeometry args={[0.1, 0.7, 8, 12]} />
      </mesh>
    </group>
  );
}

// ── سيارة رياضية ──────────────────────────────────────────────────────────
function VehicleObject() {
  const carBlue = new THREE.MeshStandardMaterial({ color: "#1a44aa", roughness: 0.2, metalness: 0.8 });
  const glass = new THREE.MeshStandardMaterial({ color: "#88ccff", roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.55 });
  const tire = new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.95, metalness: 0.0 });
  const rim = new THREE.MeshStandardMaterial({ color: "#cccccc", roughness: 0.2, metalness: 0.9 });
  const light = new THREE.MeshStandardMaterial({ color: "#ffffaa", emissive: "#ffff44", emissiveIntensity: 1.5 });

  return (
    <group>
      {/* هيكل السيارة السفلي */}
      <mesh material={carBlue} castShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[2.8, 0.45, 1.35]} />
      </mesh>
      {/* هيكل السيارة العلوي (مقصورة) */}
      <mesh material={carBlue} castShadow position={[0.05, 0.38, 0]}>
        <boxGeometry args={[1.6, 0.5, 1.15]} />
      </mesh>
      {/* زجاج أمامي */}
      <mesh material={glass} position={[0.75, 0.38, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.05, 0.48, 1.05]} />
      </mesh>
      {/* زجاج خلفي */}
      <mesh material={glass} position={[-0.7, 0.38, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.05, 0.48, 1.05]} />
      </mesh>
      {/* مسطرة علوية */}
      <mesh material={glass} position={[0.05, 0.62, 0]}>
        <boxGeometry args={[1.35, 0.04, 1.1]} />
      </mesh>
      {/* عجلة أمام يسار */}
      <mesh material={tire} castShadow position={[1.0, -0.35, 0.78]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.38, 0.16, 12, 24]} />
      </mesh>
      <mesh material={rim} position={[1.0, -0.35, 0.78]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.14, 12]} />
      </mesh>
      {/* عجلة أمام يمين */}
      <mesh material={tire} castShadow position={[1.0, -0.35, -0.78]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.38, 0.16, 12, 24]} />
      </mesh>
      <mesh material={rim} position={[1.0, -0.35, -0.78]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.14, 12]} />
      </mesh>
      {/* عجلة خلف يسار */}
      <mesh material={tire} castShadow position={[-1.0, -0.35, 0.78]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.38, 0.16, 12, 24]} />
      </mesh>
      <mesh material={rim} position={[-1.0, -0.35, 0.78]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.14, 12]} />
      </mesh>
      {/* عجلة خلف يمين */}
      <mesh material={tire} castShadow position={[-1.0, -0.35, -0.78]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.38, 0.16, 12, 24]} />
      </mesh>
      <mesh material={rim} position={[-1.0, -0.35, -0.78]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.14, 12]} />
      </mesh>
      {/* مصباح أمامي يسار */}
      <mesh material={light} position={[1.41, -0.05, 0.5]}>
        <boxGeometry args={[0.04, 0.14, 0.22]} />
      </mesh>
      {/* مصباح أمامي يمين */}
      <mesh material={light} position={[1.41, -0.05, -0.5]}>
        <boxGeometry args={[0.04, 0.14, 0.22]} />
      </mesh>
    </group>
  );
}

// ── طبيعة (شجرة + جبل) ───────────────────────────────────────────────────
function NatureObject() {
  const bark = new THREE.MeshStandardMaterial({ color: "#5a3010", roughness: 0.95 });
  const leaves1 = new THREE.MeshStandardMaterial({ color: "#228822", roughness: 0.8 });
  const leaves2 = new THREE.MeshStandardMaterial({ color: "#33aa33", roughness: 0.7 });
  const leaves3 = new THREE.MeshStandardMaterial({ color: "#44cc44", roughness: 0.6 });
  const mountain = new THREE.MeshStandardMaterial({ color: "#888888", roughness: 0.9 });
  const snow = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 });
  const ground = new THREE.MeshStandardMaterial({ color: "#3a7a2a", roughness: 1.0 });

  return (
    <group>
      {/* أرض */}
      <mesh material={ground} receiveShadow position={[0, -1.6, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
      </mesh>
      {/* جبل خلفي */}
      <mesh material={mountain} castShadow position={[-1.2, -0.5, -1.2]}>
        <coneGeometry args={[1.0, 2.2, 6]} />
      </mesh>
      {/* قمة الجبل (ثلج) */}
      <mesh material={snow} position={[-1.2, 0.65, -1.2]}>
        <coneGeometry args={[0.35, 0.8, 6]} />
      </mesh>
      {/* جذع الشجرة */}
      <mesh material={bark} castShadow position={[0.5, -0.8, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.0, 10]} />
      </mesh>
      {/* أوراق طبقة 1 (سفلى) */}
      <mesh material={leaves1} castShadow position={[0.5, 0.15, 0]}>
        <coneGeometry args={[0.85, 1.1, 12]} />
      </mesh>
      {/* أوراق طبقة 2 */}
      <mesh material={leaves2} castShadow position={[0.5, 0.75, 0]}>
        <coneGeometry args={[0.65, 0.95, 12]} />
      </mesh>
      {/* أوراق طبقة 3 (قمة) */}
      <mesh material={leaves3} castShadow position={[0.5, 1.25, 0]}>
        <coneGeometry args={[0.42, 0.8, 12]} />
      </mesh>
      {/* شجرة صغيرة ثانية */}
      <mesh material={bark} castShadow position={[-0.5, -1.1, 0.5]}>
        <cylinderGeometry args={[0.1, 0.14, 0.65, 8]} />
      </mesh>
      <mesh material={leaves1} castShadow position={[-0.5, -0.55, 0.5]}>
        <coneGeometry args={[0.5, 0.75, 10]} />
      </mesh>
    </group>
  );
}

// ── عمارة (برج + قبة) ─────────────────────────────────────────────────────
function ArchitectureObject() {
  const stone = new THREE.MeshStandardMaterial({ color: "#c0b080", roughness: 0.7, metalness: 0.1 });
  const stoneDark = new THREE.MeshStandardMaterial({ color: "#806040", roughness: 0.8 });
  const goldDome = new THREE.MeshStandardMaterial({ color: "#d4a820", roughness: 0.3, metalness: 0.8 });
  const window3d = new THREE.MeshStandardMaterial({ color: "#88ccff", transparent: true, opacity: 0.7, emissive: "#4488aa", emissiveIntensity: 0.4 });
  const ground = new THREE.MeshStandardMaterial({ color: "#9a8860", roughness: 1.0 });

  const windowPositions = [
    [-0.28, 0.1, 0.31], [0.28, 0.1, 0.31],
    [-0.28, 0.55, 0.31], [0.28, 0.55, 0.31],
    [-0.28, -0.35, 0.31], [0.28, -0.35, 0.31],
  ];

  return (
    <group>
      {/* أرض */}
      <mesh material={ground} receiveShadow position={[0, -1.55, 0]}>
        <cylinderGeometry args={[2.0, 2.0, 0.15, 32]} />
      </mesh>
      {/* قاعدة المبنى */}
      <mesh material={stone} castShadow position={[0, -0.7, 0]}>
        <boxGeometry args={[1.7, 0.7, 1.4]} />
      </mesh>
      {/* برج مركزي */}
      <mesh material={stoneDark} castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.95, 1.6, 0.9]} />
      </mesh>
      {/* قبة ذهبية */}
      <mesh material={goldDome} castShadow position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.48, 24, 16, 0, Math.PI*2, 0, Math.PI/1.7]} />
      </mesh>
      {/* قمة القبة */}
      <mesh material={goldDome} castShadow position={[0, 1.76, 0]}>
        <coneGeometry args={[0.08, 0.35, 8]} />
      </mesh>
      {/* نوافذ */}
      {windowPositions.map((pos, i) => (
        <mesh key={i} material={window3d} position={pos as [number, number, number]}>
          <boxGeometry args={[0.18, 0.26, 0.04]} />
        </mesh>
      ))}
      {/* عمود يسار */}
      <mesh material={stone} castShadow position={[-0.7, -0.4, 0.6]}>
        <cylinderGeometry args={[0.1, 0.12, 1.1, 10]} />
      </mesh>
      {/* عمود يمين */}
      <mesh material={stone} castShadow position={[0.7, -0.4, 0.6]}>
        <cylinderGeometry args={[0.1, 0.12, 1.1, 10]} />
      </mesh>
    </group>
  );
}

// ── روبوت / تقنية ─────────────────────────────────────────────────────────
function TechObject() {
  const metal = new THREE.MeshStandardMaterial({ color: "#334466", roughness: 0.3, metalness: 0.85 });
  const metalLight = new THREE.MeshStandardMaterial({ color: "#4466aa", roughness: 0.2, metalness: 0.9 });
  const eye3d = new THREE.MeshStandardMaterial({ color: "#00ffcc", emissive: "#00ffcc", emissiveIntensity: 2.0, roughness: 0.0 });
  const screen = new THREE.MeshStandardMaterial({ color: "#001122", emissive: "#0088cc", emissiveIntensity: 0.8 });
  const joint = new THREE.MeshStandardMaterial({ color: "#222233", roughness: 0.5, metalness: 0.9 });

  return (
    <group>
      {/* جسم */}
      <mesh material={metal} castShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.1, 1.2, 0.7]} />
      </mesh>
      {/* شاشة صدر */}
      <mesh material={screen} position={[0, -0.1, 0.36]}>
        <boxGeometry args={[0.75, 0.65, 0.04]} />
      </mesh>
      {/* رأس */}
      <mesh material={metalLight} castShadow position={[0, 0.82, 0]}>
        <boxGeometry args={[0.8, 0.65, 0.65]} />
      </mesh>
      {/* عين يسار */}
      <mesh material={eye3d} position={[-0.2, 0.87, 0.34]}>
        <sphereGeometry args={[0.11, 12, 12]} />
      </mesh>
      {/* عين يمين */}
      <mesh material={eye3d} position={[0.2, 0.87, 0.34]}>
        <sphereGeometry args={[0.11, 12, 12]} />
      </mesh>
      {/* هوائي */}
      <mesh material={joint} castShadow position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.45, 8]} />
      </mesh>
      <mesh material={eye3d} position={[0, 1.53, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
      </mesh>
      {/* ذراع يسار */}
      <mesh material={metal} castShadow position={[-0.77, -0.05, 0]} rotation={[0, 0, 0.2]}>
        <capsuleGeometry args={[0.16, 0.85, 8, 12]} />
      </mesh>
      {/* مشبك ذراع يسار */}
      <mesh material={joint} position={[-1.2, -0.4, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
      </mesh>
      {/* ذراع يمين */}
      <mesh material={metal} castShadow position={[0.77, -0.05, 0]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.16, 0.85, 8, 12]} />
      </mesh>
      {/* مشبك ذراع يمين */}
      <mesh material={joint} position={[1.2, -0.4, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
      </mesh>
      {/* رجل يسار */}
      <mesh material={metalLight} castShadow position={[-0.3, -1.1, 0]}>
        <capsuleGeometry args={[0.19, 0.65, 8, 12]} />
      </mesh>
      {/* رجل يمين */}
      <mesh material={metalLight} castShadow position={[0.3, -1.1, 0]}>
        <capsuleGeometry args={[0.19, 0.65, 8, 12]} />
      </mesh>
    </group>
  );
}

// ── نموذج الذرة / علوم ───────────────────────────────────────────────────
function ScienceObject() {
  const nucleus = new THREE.MeshStandardMaterial({ color: "#ff5500", emissive: "#ff2200", emissiveIntensity: 0.6, roughness: 0.4 });
  const proton = new THREE.MeshStandardMaterial({ color: "#ff8844", roughness: 0.3 });
  const electron = new THREE.MeshStandardMaterial({ color: "#44aaff", emissive: "#2288ff", emissiveIntensity: 1.2, roughness: 0.1 });
  const orbit = new THREE.MeshStandardMaterial({ color: "#4488ff", transparent: true, opacity: 0.35, roughness: 0.5 });

  const orbits = [
    { rot: [0, 0, 0] as [number,number,number], pos: [1.4, 0, 0] as [number,number,number] },
    { rot: [Math.PI/3, 0, 0] as [number,number,number], pos: [0.7, 1.2, 0] as [number,number,number] },
    { rot: [-Math.PI/3, 0, 0] as [number,number,number], pos: [-0.7, 1.2, 0] as [number,number,number] },
  ];

  return (
    <group>
      {/* نواة */}
      <mesh material={nucleus} castShadow>
        <sphereGeometry args={[0.38, 24, 24]} />
      </mesh>
      {/* بروتونات صغيرة حول النواة */}
      {[0, Math.PI*0.66, Math.PI*1.33].map((a, i) => (
        <mesh key={i} material={proton} position={[Math.cos(a)*0.25, Math.sin(a)*0.25, (i-1)*0.12]}>
          <sphereGeometry args={[0.12, 10, 10]} />
        </mesh>
      ))}
      {/* مسارات الإلكترون (حلقات) */}
      {orbits.map((orb, i) => (
        <group key={i} rotation={orb.rot}>
          <mesh material={orbit}>
            <torusGeometry args={[1.4, 0.025, 8, 64]} />
          </mesh>
          <mesh material={electron} position={orb.pos}>
            <sphereGeometry args={[0.11, 12, 12]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── فضاء / كوكب ───────────────────────────────────────────────────────────
function SpaceObject() {
  const planet = new THREE.MeshStandardMaterial({ color: "#2255cc", roughness: 0.6, metalness: 0.2 });
  const ocean = new THREE.MeshStandardMaterial({ color: "#1144bb", roughness: 0.4, metalness: 0.3 });
  const land = new THREE.MeshStandardMaterial({ color: "#228833", roughness: 0.8 });
  const ring = new THREE.MeshStandardMaterial({ color: "#c8a842", roughness: 0.6, transparent: true, opacity: 0.75 });
  const moon = new THREE.MeshStandardMaterial({ color: "#bbbbaa", roughness: 0.9 });
  const moonDark = new THREE.MeshStandardMaterial({ color: "#888880", roughness: 1.0 });

  return (
    <group>
      {/* كوكب رئيسي */}
      <mesh material={planet} castShadow>
        <sphereGeometry args={[1.1, 48, 48]} />
      </mesh>
      {/* بقعة قارة */}
      <mesh material={land} position={[0.55, 0.4, 0.9]} scale={[1, 1, 0.15]}>
        <sphereGeometry args={[0.45, 16, 16]} />
      </mesh>
      {/* بقعة قارة 2 */}
      <mesh material={land} position={[-0.6, -0.3, 0.9]} scale={[1, 1, 0.1]}>
        <sphereGeometry args={[0.3, 12, 12]} />
      </mesh>
      {/* حلقات الكوكب */}
      <mesh material={ring} rotation={[Math.PI/2.2, 0, 0]}>
        <torusGeometry args={[1.75, 0.18, 8, 64]} />
      </mesh>
      <mesh material={ring} rotation={[Math.PI/2.2, 0, 0]} scale={[1.18, 1.18, 1]}>
        <torusGeometry args={[1.75, 0.08, 8, 64]} />
      </mesh>
      {/* قمر */}
      <mesh material={moon} castShadow position={[2.2, 0.8, 0]}>
        <sphereGeometry args={[0.32, 20, 20]} />
      </mesh>
      {/* فوهة على القمر */}
      <mesh material={moonDark} position={[2.35, 0.88, 0.2]} scale={[1, 1, 0.2]}>
        <sphereGeometry args={[0.12, 10, 10]} />
      </mesh>
    </group>
  );
}

// ── خيال / تنين ─────────────────────────────────────────────────────────
function FantasyObject() {
  const dragonBody = new THREE.MeshStandardMaterial({ color: "#880033", roughness: 0.5, metalness: 0.3 });
  const dragonScale = new THREE.MeshStandardMaterial({ color: "#550022", roughness: 0.6, metalness: 0.2 });
  const wing = new THREE.MeshStandardMaterial({ color: "#cc2244", roughness: 0.4, transparent: true, opacity: 0.85 });
  const eye3d = new THREE.MeshStandardMaterial({ color: "#ffcc00", emissive: "#ff8800", emissiveIntensity: 2.0 });
  const fire = new THREE.MeshStandardMaterial({ color: "#ff6600", emissive: "#ff4400", emissiveIntensity: 1.5, transparent: true, opacity: 0.8 });

  return (
    <group>
      {/* جسم التنين */}
      <mesh material={dragonBody} castShadow position={[0, 0, 0]} scale={[1, 0.9, 0.75]}>
        <sphereGeometry args={[1.0, 32, 24]} />
      </mesh>
      {/* رأس */}
      <mesh material={dragonBody} castShadow position={[0.7, 0.65, 0]} scale={[0.85, 0.75, 0.75]}>
        <sphereGeometry args={[0.65, 24, 20]} />
      </mesh>
      {/* خطم */}
      <mesh material={dragonScale} castShadow position={[1.22, 0.5, 0]} scale={[1, 0.55, 0.5]}>
        <sphereGeometry args={[0.38, 16, 12]} />
      </mesh>
      {/* قرن يسار */}
      <mesh material={dragonScale} castShadow position={[0.45, 1.22, 0.22]} rotation={[0.4, 0, -0.5]}>
        <coneGeometry args={[0.065, 0.5, 8]} />
      </mesh>
      {/* قرن يمين */}
      <mesh material={dragonScale} castShadow position={[0.45, 1.22, -0.22]} rotation={[-0.4, 0, -0.5]}>
        <coneGeometry args={[0.065, 0.5, 8]} />
      </mesh>
      {/* عيون */}
      <mesh material={eye3d} position={[0.98, 0.75, 0.28]}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
      <mesh material={eye3d} position={[0.98, 0.75, -0.28]}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
      {/* جناح يسار */}
      <mesh material={wing} castShadow position={[-0.3, 0.5, 1.0]} rotation={[0.3, 0.2, 0.4]} scale={[1.1, 0.65, 0.08]}>
        <sphereGeometry args={[0.85, 16, 10]} />
      </mesh>
      {/* جناح يمين */}
      <mesh material={wing} castShadow position={[-0.3, 0.5, -1.0]} rotation={[-0.3, -0.2, 0.4]} scale={[1.1, 0.65, 0.08]}>
        <sphereGeometry args={[0.85, 16, 10]} />
      </mesh>
      {/* ذيل */}
      <mesh material={dragonScale} castShadow position={[-1.0, -0.3, 0]} rotation={[0, 0.3, 0.5]}>
        <capsuleGeometry args={[0.17, 1.1, 8, 12]} />
      </mesh>
      {/* نار */}
      <mesh material={fire} position={[1.65, 0.3, 0]} scale={[1, 0.4, 0.4]}>
        <coneGeometry args={[0.22, 0.75, 10]} />
      </mesh>
    </group>
  );
}

// ── أشكال هندسية مجردة ───────────────────────────────────────────────────
function AbstractObject() {
  const mats = [
    new THREE.MeshStandardMaterial({ color: "#6633cc", roughness: 0.3, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ color: "#cc3366", roughness: 0.4, metalness: 0.4, transparent: true, opacity: 0.8 }),
    new THREE.MeshStandardMaterial({ color: "#33aacc", roughness: 0.2, metalness: 0.7, transparent: true, opacity: 0.75 }),
    new THREE.MeshStandardMaterial({ color: "#ccaa33", roughness: 0.5, metalness: 0.5 }),
  ];
  const shapes = [
    { geo: <icosahedronGeometry args={[0.7, 0]} />, pos: [0, 0, 0] as [number,number,number], mat: 0 },
    { geo: <torusGeometry args={[1.0, 0.12, 12, 40]} />, pos: [0, 0, 0] as [number,number,number], mat: 1 },
    { geo: <torusGeometry args={[0.7, 0.1, 10, 32]} />, pos: [0, 0, 0] as [number,number,number], mat: 2 },
    { geo: <octahedronGeometry args={[0.45, 0]} />, pos: [0.7, 0.7, 0] as [number,number,number], mat: 3 },
    { geo: <octahedronGeometry args={[0.35, 0]} />, pos: [-0.7, -0.6, 0.3] as [number,number,number], mat: 0 },
  ];
  const rotations: [number,number,number][] = [
    [0, 0, 0], [Math.PI/2, 0, 0], [0, Math.PI/3, 0], [0.3, 0.5, 0], [0.8, 0.2, 0]
  ];

  return (
    <group>
      {shapes.map((s, i) => (
        <mesh key={i} material={mats[s.mat]} position={s.pos} rotation={rotations[i]} castShadow>
          {s.geo}
        </mesh>
      ))}
    </group>
  );
}
