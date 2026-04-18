import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Center, ContactShadows, Html, Float } from "@react-three/drei";
import * as THREE from "three";

const SOLIDS = {
  tetrahedron: { name: "رباعي الأوجه (Tetrahedron)", v: 4, e: 6, f: 4, Geo: THREE.TetrahedronGeometry },
  hexahedron: { name: "المكعب (Hexahedron)", v: 8, e: 12, f: 6, Geo: THREE.BoxGeometry },
  octahedron: { name: "ثماني الأوجه (Octahedron)", v: 6, e: 12, f: 8, Geo: THREE.OctahedronGeometry },
  dodecahedron: { name: "اثنا عشري الأوجه (Dodecahedron)", v: 20, e: 30, f: 12, Geo: THREE.DodecahedronGeometry },
  icosahedron: { name: "عشريني الأوجه (Icosahedron)", v: 12, e: 30, f: 20, Geo: THREE.IcosahedronGeometry },
};

type SolidKey = keyof typeof SOLIDS;

export const PlatonicSolids3D: React.FC = () => {
  const [activeSolid, setActiveSolid] = useState<SolidKey>("dodecahedron");
  const [showWireframe, setShowWireframe] = useState(true);
  const [showSolid, setShowSolid] = useState(true);
  const [isExploding, setIsExploding] = useState(false);
  const explodeAmount = useRef(0);

  const currentSolid = SOLIDS[activeSolid];

  // Create un-indexed base geometry to compute face explosions smoothly
  // We use scale 1.5 for the mesh.
  const baseGeo = useMemo(() => {
    let geo: THREE.BufferGeometry = new currentSolid.Geo(1.5, 0);
    // BoxGeometry uses W,H,D instead of radius, so we adjust if it's hexahedron
    if (activeSolid === "hexahedron") {
        geo = new THREE.BoxGeometry(2, 2, 2);
    }
    // Convert to non-indexed so each triangle has its own vertices/normals
    geo = geo.toNonIndexed();
    geo.computeVertexNormals();
    return geo;
  }, [activeSolid, currentSolid]);

  const activeSolidGeo = useMemo(() => baseGeo.clone(), [baseGeo]);
  const activeWireGeo = useMemo(() => {
     const g = baseGeo.clone();
     // Make wireframe slightly larger to avoid z-fighting
     g.scale(1.02, 1.02, 1.02);
     return g;
  }, [baseGeo]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    // Rotate the whole group slowly
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.2;
        groupRef.current.rotation.x += delta * 0.1;
    }

    // Handle explosion animation
    const targetExplode = isExploding ? 1 : 0;
    explodeAmount.current = THREE.MathUtils.lerp(explodeAmount.current, targetExplode, 0.08);

    const updateGeometry = (geo: THREE.BufferGeometry, base: THREE.BufferGeometry, offsetMult: number) => {
        const positions = geo.attributes.position.array as Float32Array;
        const basePos = base.attributes.position.array as Float32Array;
        const normals = base.attributes.normal.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Apply explosion offset along the normal
            const currentOffset = explodeAmount.current * 1.5 * offsetMult;
            positions[i] = basePos[i] + normals[i] * currentOffset;
            positions[i+1] = basePos[i+1] + normals[i+1] * currentOffset;
            positions[i+2] = basePos[i+2] + normals[i+2] * currentOffset;
        }
        geo.attributes.position.needsUpdate = true;
    };

    updateGeometry(activeSolidGeo, baseGeo, 1.0);
    // Wireframe scales slightly differently, we use a clone of base but scaled up
    updateGeometry(activeWireGeo, baseGeo, 1.05); 
  });


  const panelStyle: React.CSSProperties = {
    background: "rgba(15, 23, 42, 0.9)",
    padding: "1.2rem",
    borderRadius: "12px",
    color: "white",
    width: "320px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontFamily: "system-ui, sans-serif",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
  };

  return (
    <>
      <Environment preset="studio" />
      <Center>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group ref={groupRef}>
            
            {/* The Solid Body (Blue Crystal) */}
            {showSolid && (
                <mesh geometry={activeSolidGeo}>
                <meshPhysicalMaterial 
                    color="#ffffff" 
                    transmission={1} 
                    opacity={1} 
                    metalness={0.1} 
                    roughness={0}
                    ior={1.5}
                    thickness={2}
                    clearcoat={1}
                    envMapIntensity={2}
                    attenuationColor="#3b82f6"
                    attenuationDistance={3}
                    side={THREE.DoubleSide}
                />
                </mesh>
            )}

            {/* The Wireframe (Gold) */}
            {showWireframe && (
                <mesh geometry={activeWireGeo}>
                <meshPhysicalMaterial 
                    color="#fbbf24" 
                    emissive="#d97706"
                    emissiveIntensity={0.3}
                    metalness={1} 
                    roughness={0.1}
                    wireframe
                    wireframeLinewidth={3}
                    side={THREE.DoubleSide}
                />
                </mesh>
            )}
            
          </group>
        </Float>
      </Center>
      
      <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />

      {/* Dashboard UI overlapping the canvas using Html */}
      <Html center transform={false} zIndexRange={[100, 0]}>
        <div style={{ ...panelStyle, position: "absolute", top: "-38vh", right: "2vw" }} dir="rtl">
            <h3 style={{ margin: "0 0 1rem 0", borderBottom: "1px solid #334155", paddingBottom: "0.5rem", fontSize: "1.1rem" }}>
                المجسمات الأفلاطونية 
            </h3>
            
            {/* Shape Switcher */}
            <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.5rem" }}>اختر المجسم:</label>
                <select 
                    value={activeSolid} 
                    onChange={(e) => setActiveSolid(e.target.value as SolidKey)}
                    style={{ width: "100%", padding: "0.5rem", background: "#1e293b", color: "white", border: "1px solid #334155", borderRadius: "6px", fontFamily: "inherit" }}
                >
                    {Object.entries(SOLIDS).map(([key, solid]) => (
                        <option key={key} value={key}>{solid.name}</option>
                    ))}
                </select>
            </div>

            {/* View Toggles & Explode */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.2rem" }}>
                <button 
                    onClick={() => setShowSolid(!showSolid)}
                    style={{ flex: 1, padding: "0.5rem", background: showSolid ? "#3b82f6" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                    الجسم الصلب {showSolid ? "👁️" : "🙈"}
                </button>
                <button 
                    onClick={() => setShowWireframe(!showWireframe)}
                    style={{ flex: 1, padding: "0.5rem", background: showWireframe ? "#f59e0b" : "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
                >
                    الإطار السلكي {showWireframe ? "👁️" : "🙈"}
                </button>
                <button 
                    onClick={() => setIsExploding(!isExploding)}
                    style={{ flex: "1 1 100%", padding: "0.5rem", background: isExploding ? "#ef4444" : "#1e293b", color: "white", border: "1px solid #ef4444", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginTop: "0.2rem" }}
                >
                    {isExploding ? "إعادة التجميع 🔄" : "تفكيك الأوجه (Explode) 💥"}
                </button>
            </div>

            {/* Live Counters */}
            <div style={{ background: "#0f172a", padding: "1rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
                <h4 style={{ margin: "0 0 0.8rem 0", color: "#e2e8f0", fontSize: "0.95rem" }}>بيانات المكونات</h4>
                <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
                    <div>
                        <div style={{ color: "#f87171", fontWeight: "bold", fontSize: "1.2rem" }}>{currentSolid.v}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>الرؤوس (V)</div>
                    </div>
                    <div>
                        <div style={{ color: "#34d399", fontWeight: "bold", fontSize: "1.2rem" }}>{currentSolid.e}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>الحواف (E)</div>
                    </div>
                    <div>
                        <div style={{ color: "#60a5fa", fontWeight: "bold", fontSize: "1.2rem" }}>{currentSolid.f}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>الأوجه (F)</div>
                    </div>
                </div>
            </div>

            {/* Euler Formula */}
            <div style={{ marginTop: "1rem", background: "linear-gradient(to right, #1e3a8a, #312e81)", padding: "0.8rem", borderRadius: "8px", textAlign: "center", border: "1px solid #3730a3" }}>
                <div style={{ fontSize: "0.8rem", color: "#a5b4fc", marginBottom: "0.3rem" }}>علاقة أويلر (Euler's Formula)</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#e0e7ff", letterSpacing: "2px" }}>
                    V - E + F = 2
                </div>
                <div style={{ fontSize: "0.9rem", color: "#818cf8", marginTop: "0.3rem" }}>
                    {currentSolid.v} - {currentSolid.e} + {currentSolid.f} = 2
                </div>
            </div>
            
        </div>
      </Html>
    </>
  );
};

export default PlatonicSolids3D;
