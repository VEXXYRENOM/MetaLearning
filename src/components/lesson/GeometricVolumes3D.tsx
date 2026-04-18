import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Text, Edges, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";

type ShapeType = "cube" | "sphere" | "cylinder" | "cone" | null;

export function GeometricVolumes3D() {
  const [selectedShape, setSelectedShape] = useState<ShapeType>(null);
  const [hoveredShape, setHoveredShape] = useState<ShapeType>(null);
  
  // Parametric Dimensions State
  const [r, setR] = useState(1);
  const [h, setH] = useState(2);
  const [side, setSide] = useState(1.5);
  
  // Toggles
  const [wireframe, setWireframe] = useState(false);
  const [unfold, setUnfold] = useState(false);

  // Draggable & Resizable Panel State
  const [panelPos, setPanelPos] = useState(() => ({ 
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 360) : 500, 
    y: 80 
  }));
  const [panelScale, setPanelScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panelX: panelPos.x,
      panelY: panelPos.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      setPanelPos({
        x: dragStart.current.panelX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panelY + (e.clientY - dragStart.current.y)
      });
    }
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleScaleUp = (e: any) => { e.stopPropagation(); setPanelScale(s => Math.min(s + 0.1, 2)); };
  const handleScaleDown = (e: any) => { e.stopPropagation(); setPanelScale(s => Math.max(s - 0.1, 0.5)); };

  // --- Handlers ---
  const handlePointerOver = (e: any, shape: ShapeType) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    setHoveredShape(shape);
  };
  
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    setHoveredShape(null);
  };

  const handleClick = (e: any, shape: ShapeType) => {
    e.stopPropagation();
    setSelectedShape(shape);
    // Reset unfold when switching shapes
    setUnfold(false);
  };

  const handlePointerMissed = () => {
    setSelectedShape(null);
  };

  // UI Math calculations
  const calculateVolume = () => {
    switch (selectedShape) {
      case "cube": return Math.pow(side, 3);
      case "sphere": return (4 / 3) * Math.PI * Math.pow(r, 3);
      case "cylinder": return Math.PI * Math.pow(r, 2) * h;
      case "cone": return (1 / 3) * Math.PI * Math.pow(r, 2) * h;
      default: return 0;
    }
  };

  const calculateArea = () => {
    switch (selectedShape) {
      case "cube": return 6 * Math.pow(side, 2);
      case "sphere": return 4 * Math.PI * Math.pow(r, 2);
      case "cylinder": return 2 * Math.PI * r * h + 2 * Math.PI * Math.pow(r, 2);
      case "cone": {
        const l = Math.sqrt(r * r + h * h);
        return Math.PI * r * l + Math.PI * Math.pow(r, 2);
      }
      default: return 0;
    }
  };

  // Common Physical Material properties matching the old luxurious feel
  const getMaterialProps = (color: string) => ({
    color,
    metalness: 0.6,
    roughness: wireframe ? 1 : 0.15,
    clearcoat: 0.8,
    envMapIntensity: 1.5,
    wireframe,
    transparent: true,
    opacity: wireframe ? 0.8 : 1,
    transmission: selectedShape === "sphere" ? 0.9 : 0,
    ior: 1.5,
  });

  return (
    <>
      <Environment preset="studio" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />

      <group onPointerMissed={handlePointerMissed} position={[0, -0.5, 0]}>
        {/* === CUBE === */}
        <group position={[-2, 0.5, -1]}>
          {unfold && selectedShape === "cube" ? (
            <UnfoldedCube side={side} materialProps={getMaterialProps("#fbbf24")} />
          ) : (
            <mesh
              onClick={(e) => handleClick(e, "cube")}
              onPointerOver={(e) => handlePointerOver(e, "cube")}
              onPointerOut={handlePointerOut}
              castShadow
              position={[0, side/2, 0]}
            >
              <boxGeometry args={[side, side, side]} />
              <meshPhysicalMaterial {...getMaterialProps(selectedShape === "cube" ? "#fde047" : "#d97706")} />
              {(hoveredShape === "cube" || selectedShape === "cube") && (
                <Edges scale={1.02} threshold={15} color="white" />
              )}
            </mesh>
          )}
          <Billboard position={[0, -0.3, 0]}>
            <Text fontSize={0.25} color="white">مكعب</Text>
          </Billboard>
        </group>

        {/* === SPHERE === */}
        <group position={[0, 0.5, 1.5]}>
          <mesh
            onClick={(e) => handleClick(e, "sphere")}
            onPointerOver={(e) => handlePointerOver(e, "sphere")}
            onPointerOut={handlePointerOut}
            castShadow
            position={[0, r, 0]}
          >
            <sphereGeometry args={[r, 64, 64]} />
            <meshPhysicalMaterial {...getMaterialProps("#ffffff")} transmission={1} thickness={2} attenuationColor="#8b5cf6" />
            {(hoveredShape === "sphere" || selectedShape === "sphere") && (
              <Edges scale={1.02} threshold={15} color="cyan" />
            )}
          </mesh>
          <Billboard position={[0, -0.3, 0]}>
            <Text fontSize={0.25} color="white">كرة</Text>
          </Billboard>
        </group>

        {/* === CYLINDER === */}
        <group position={[2, 0.5, -1]}>
          {unfold && selectedShape === "cylinder" ? (
            <UnfoldedCylinder r={r} h={h} materialProps={getMaterialProps("#0f172a")} />
          ) : (
            <mesh
              onClick={(e) => handleClick(e, "cylinder")}
              onPointerOver={(e) => handlePointerOver(e, "cylinder")}
              onPointerOut={handlePointerOut}
              castShadow
              position={[0, h/2, 0]}
            >
              <cylinderGeometry args={[r, r, h, 64]} />
              <meshPhysicalMaterial {...getMaterialProps(selectedShape === "cylinder" ? "#334155" : "#0f172a")} clearcoat={1} />
              {(hoveredShape === "cylinder" || selectedShape === "cylinder") && (
                <Edges scale={1.02} threshold={15} color="white" />
              )}
            </mesh>
          )}
          <Billboard position={[0, -0.3, 0]}>
            <Text fontSize={0.25} color="white">أسطوانة</Text>
          </Billboard>
        </group>

        {/* === CONE === */}
        <group position={[0, 0.5, -2]}>
          <mesh
            onClick={(e) => handleClick(e, "cone")}
            onPointerOver={(e) => handlePointerOver(e, "cone")}
            onPointerOut={handlePointerOut}
            castShadow
            position={[0, h/2, 0]}
          >
            <coneGeometry args={[r, h, 64]} />
            <meshPhysicalMaterial {...getMaterialProps(selectedShape === "cone" ? "#fb7185" : "#e11d48")} transmission={0.5} roughness={0.2} />
            {(hoveredShape === "cone" || selectedShape === "cone") && (
              <Edges scale={1.02} threshold={15} color="pink" />
            )}
          </mesh>
          <Billboard position={[0, -0.3, 0]}>
            <Text fontSize={0.25} color="white">مخروط</Text>
          </Billboard>
        </group>

      </group>

      <ContactShadows position={[0, -0.5, 0]} opacity={0.8} scale={15} blur={2.5} far={4} />

      {/* === HTML UI OVERLAY === */}
      {selectedShape && typeof document !== 'undefined' && (
        <Html>
          {createPortal(
            <div style={{
          position: 'fixed',
          top: `${panelPos.y}px`,
          left: `${panelPos.x}px`,
          width: '320px',
          transform: `scale(${panelScale})`,
          transformOrigin: 'top left',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          direction: 'rtl',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          pointerEvents: 'auto',
          zIndex: 100000,
        }}>
            {/* DRAG & RESIZE HANDLE */}
            <div 
              onPointerDown={handlePointerDownDrag}
              onPointerMove={handlePointerMoveDrag}
              onPointerUp={handlePointerUpDrag}
              onPointerCancel={handlePointerUpDrag}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 12px',
                borderRadius: '16px 16px 0 0',
                margin: '-24px -24px 16px -24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={handleScaleUp} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={handleScaleDown} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8', userSelect: 'none' }}>☰ اسحب للتحريك</span>
            </div>

            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
              {selectedShape === "cube" && "المكعب"}
              {selectedShape === "sphere" && "الكرة"}
              {selectedShape === "cylinder" && "الأسطوانة"}
              {selectedShape === "cone" && "المخروط"}
            </h2>

            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {selectedShape === "cube" && (
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                  طول الضلع (a): {side.toFixed(1)} cm
                  <input type="range" min="0.5" max="3" step="0.1" value={side} onChange={(e) => setSide(Number(e.target.value))} style={{ marginTop: '8px' }} />
                </label>
              )}
              
              {(selectedShape === "sphere" || selectedShape === "cylinder" || selectedShape === "cone") && (
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                  نصف القطر (r): {r.toFixed(1)} cm
                  <input type="range" min="0.5" max="2.5" step="0.1" value={r} onChange={(e) => setR(Number(e.target.value))} style={{ marginTop: '8px' }} />
                </label>
              )}

              {(selectedShape === "cylinder" || selectedShape === "cone") && (
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                  الارتفاع (h): {h.toFixed(1)} cm
                  <input type="range" min="1" max="4" step="0.1" value={h} onChange={(e) => setH(Number(e.target.value))} style={{ marginTop: '8px' }} />
                </label>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button 
                onClick={() => setWireframe(!wireframe)}
                style={{ flex: 1, padding: '8px', background: wireframe ? '#3b82f6' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
                X-Ray
              </button>
              {(selectedShape === "cube" || selectedShape === "cylinder") && (
                <button 
                  onClick={() => setUnfold(!unfold)}
                  style={{ flex: 1, padding: '8px', background: unfold ? '#10b981' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
                  تفكيك المجسم
                </button>
              )}
            </div>

            {/* Math Engine Panel */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#94a3b8' }}>المحرك الرياضي</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                  <span>الحجم (V) =</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {selectedShape === "cube" && `a³`}
                    {selectedShape === "sphere" && `4/3 π r³`}
                    {selectedShape === "cylinder" && `π r² h`}
                    {selectedShape === "cone" && `1/3 π r² h`}
                  </span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#10b981', marginTop: '4px' }}>
                  {calculateVolume().toFixed(2)} cm³
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                  <span>المساحة (A) =</span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {selectedShape === "cube" && `6 a²`}
                    {selectedShape === "sphere" && `4 π r²`}
                    {selectedShape === "cylinder" && `2πrh + 2πr²`}
                    {selectedShape === "cone" && `πrl + πr²`}
                  </span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#f59e0b', marginTop: '4px' }}>
                  {calculateArea().toFixed(2)} cm²
                </div>
              </div>
            </div>

            </div>,
            document.body
          )}
        </Html>
      )}
    </>
  );
}

// ==========================================
// Sub-Components for Unfolding Animations
// ==========================================

function UnfoldedCube({ side, materialProps }: { side: number, materialProps: any }) {
  const tRef = useRef(0);
  const planesRef = useRef<THREE.Group>(null);
  
  useFrame((_state, delta) => {
    if (tRef.current < 1) {
      tRef.current += delta * 1.5;
      if (tRef.current > 1) tRef.current = 1;
    }
    
    // Animate rotations
    if (planesRef.current) {
      const angle = Math.PI / 2 * tRef.current;
      // planesRef children: 0:bottom, 1:front, 2:back, 3:left, 4:right, 5:top
      const children = planesRef.current.children;
      if (children.length >= 6) {
        children[1].rotation.x = angle; // front
        children[2].rotation.x = -angle; // back
        children[3].rotation.z = -angle; // left
        children[4].rotation.z = angle; // right
        // Top is attached to front, so it needs to rotate relative to front (handled by grouping if complex, but simple approach is rotating from center)
      }
    }
  });

  const hs = side / 2;

  // We build a pivot-based net to unfold correctly
  return (
    <group ref={planesRef} position={[0, hs, 0]}>
      {/* Bottom (Root) */}
      <mesh position={[0, -hs, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <planeGeometry args={[side, side]} />
        <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Front */}
      <group position={[0, -hs, hs]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
           <mesh position={[0, hs, 0]} castShadow>
             <planeGeometry args={[side, side]} />
             <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
           </mesh>
           {/* Top attached to Front */}
           <group position={[0, side, 0]}>
             <group rotation={[Math.PI / 2, 0, 0]}>
                <mesh position={[0, hs, 0]} castShadow>
                  <planeGeometry args={[side, side]} />
                  <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
                </mesh>
             </group>
           </group>
        </group>
      </group>

      {/* Back */}
      <group position={[0, -hs, -hs]}>
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh position={[0, hs, 0]} castShadow>
            <planeGeometry args={[side, side]} />
            <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Left */}
      <group position={[-hs, -hs, 0]}>
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh position={[hs, 0, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
            <planeGeometry args={[side, side]} />
            <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>

      {/* Right */}
      <group position={[hs, -hs, 0]}>
         <group rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[-hs, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <planeGeometry args={[side, side]} />
            <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function UnfoldedCylinder({ r, h, materialProps }: { r: number, h: number, materialProps: any }) {
  const tRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_state, delta) => {
    if (tRef.current < 1) {
      tRef.current += delta * 1.5;
      if (tRef.current > 1) tRef.current = 1;
    }
    
    if (groupRef.current) {
      const topDisk = groupRef.current.children[0];
      const bottomDisk = groupRef.current.children[1];
      const rect = groupRef.current.children[2];
      
      const angle = Math.PI / 2 * tRef.current;
      topDisk.rotation.x = -Math.PI/2 - angle;
      topDisk.position.y = h/2 + Math.sin(angle) * r;
      topDisk.position.z = Math.cos(angle) * r - r;
      
      bottomDisk.rotation.x = Math.PI/2 + angle;
      bottomDisk.position.y = -h/2 - Math.sin(angle) * r;
      bottomDisk.position.z = Math.cos(angle) * r - r;
      
      // Scaling rect to represent unrolling
      const scaleX = 1 + (2 * Math.PI - 1) * tRef.current;
      rect.scale.x = scaleX;
    }
  });

  return (
    <group ref={groupRef} position={[0, h/2, 0]}>
      {/* Top Disk */}
      <mesh position={[0, h/2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 32]} />
        <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Bottom Disk */}
      <mesh position={[0, -h/2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 32]} />
        <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
      </mesh>

      {/* Side (Unrolling mapped to a plane) */}
      <mesh position={[0, 0, r]}>
        <planeGeometry args={[r, h]} />
        <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
