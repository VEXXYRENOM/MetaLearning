import React, { useRef, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  RenderTexture,
  OrthographicCamera,
  Line,
  Text,
  Html,
  Billboard,
  Edges
} from "@react-three/drei";

// --- 1. GEOMETRY GENERATION ---
const LShapeGeo = new THREE.ExtrudeGeometry(
  (function () {
    const shape = new THREE.Shape();
    shape.moveTo(-1, -1);
    shape.lineTo(1, -1);
    shape.lineTo(1, 0);
    shape.lineTo(0, 0);
    shape.lineTo(0, 1);
    shape.lineTo(-1, 1);
    shape.lineTo(-1, -1);
    const holePath = new THREE.Path();
    holePath.absarc(0.5, -0.5, 0.25, 0, Math.PI * 2, false);
    shape.holes.push(holePath);
    return shape;
  })(),
  { depth: 1.5, bevelEnabled: false, curveSegments: 32 }
);
LShapeGeo.center();
const LShapeEdgesGeo = new THREE.EdgesGeometry(LShapeGeo, 1);


// --- 2. PROXY MODEL COMPONENT FOR RENDERTARGETS ---
const ProxyModel = ({ mainObjRef }: { mainObjRef: React.RefObject<THREE.Group> }) => {
  const localRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (mainObjRef.current && localRef.current) {
      localRef.current.position.copy(mainObjRef.current.position);
      localRef.current.rotation.copy(mainObjRef.current.rotation);
      localRef.current.scale.copy(mainObjRef.current.scale);
    }
  });

  return (
    <group ref={localRef}>
      <mesh geometry={LShapeGeo}>
        <meshBasicMaterial color="#ffffff" polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1} />
      </mesh>
      <lineSegments geometry={LShapeEdgesGeo}>
        <lineBasicMaterial color="#0f172a" linewidth={2} depthTest={true} />
      </lineSegments>
      <lineSegments geometry={LShapeEdgesGeo} onUpdate={self => self.computeLineDistances()}>
        <lineDashedMaterial color="#94a3b8" dashSize={0.15} gapSize={0.15} depthTest={true} depthFunc={THREE.GreaterDepth} transparent opacity={0.6} />
      </lineSegments>
    </group>
  );
};


// --- 3. DYNAMIC PROJECTION LINES ---
const ProjectionLines = ({ mainObjRef, opacity }: { mainObjRef: React.RefObject<THREE.Group>, opacity: number }) => {
  const lineRef = useRef<THREE.LineSegments>(null);
  const lineGeoRef = useRef<THREE.BufferGeometry>(null);
  const matRef1 = useRef<THREE.LineDashedMaterial>(null);
  
  const corners = useMemo(() => [
     new THREE.Vector3(-1, -1, -0.75), new THREE.Vector3(1, -1, -0.75), new THREE.Vector3(-1, 1, -0.75), new THREE.Vector3(0, 1, -0.75),
     new THREE.Vector3(-1, -1, 0.75), new THREE.Vector3(1, -1, 0.75), new THREE.Vector3(-1, 1, 0.75), new THREE.Vector3(0, 1, 0.75),
  ], []);

  useFrame(() => {
    if (!lineGeoRef.current || !mainObjRef.current) return;
    const positions = lineGeoRef.current.attributes.position.array as Float32Array;
    let idx = 0;
    const v = new THREE.Vector3();

    for (let i = 0; i < 8; i++) {
       v.copy(corners[i]).applyMatrix4(mainObjRef.current.matrixWorld);
       // Front (Back projection plane at Z = -3)
       positions[idx++] = v.x; positions[idx++] = v.y; positions[idx++] = v.z;
       positions[idx++] = v.x; positions[idx++] = v.y; positions[idx++] = -3;
       // Bottom (Y = -3)
       positions[idx++] = v.x; positions[idx++] = v.y; positions[idx++] = v.z;
       positions[idx++] = v.x; positions[idx++] = -3; positions[idx++] = v.z;
       // Right (X = 3)
       positions[idx++] = v.x; positions[idx++] = v.y; positions[idx++] = v.z;
       positions[idx++] = 3; positions[idx++] = v.y; positions[idx++] = v.z;
    }
    lineGeoRef.current.attributes.position.needsUpdate = true;
    if (lineRef.current) lineRef.current.computeLineDistances();
    if (matRef1.current) matRef1.current.opacity = opacity * 0.4;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry ref={lineGeoRef}>
        <bufferAttribute attach="attributes-position" count={24 * 2} array={new Float32Array(24 * 2 * 3)} itemSize={3} />
      </bufferGeometry>
      <lineDashedMaterial ref={matRef1} color="#f43f5e" dashSize={0.2} gapSize={0.2} transparent depthWrite={false} />
    </lineSegments>
  );
};


// --- 4. DIMENSIONS OVERLAY FOR UNFOLDED LAYOUT ---
const DimensionsOverlay = ({ opacity }: { opacity: number }) => {
  if (opacity < 0.05) return null;
  
  return (
    <group position={[0, 0, 0.01]}>
      {/* Width 2.0 */}
      <Line points={[[-1, -1.2, 0], [1, -1.2, 0]]} color="#0f172a" transparent opacity={opacity} />
      <Line points={[[-1, -1, 0], [-1, -1.3, 0]]} color="#94a3b8" transparent opacity={opacity} />
      <Line points={[[1, -1, 0], [1, -1.3, 0]]} color="#94a3b8" transparent opacity={opacity} />
      <Text position={[0, -1.5, 0]} fontSize={0.2} color="#0f172a" fillOpacity={opacity}>2.0 cm</Text>

      {/* Height 2.0 */}
      <Line points={[[-1.2, -1, 0], [-1.2, 1, 0]]} color="#0f172a" transparent opacity={opacity} />
      <Line points={[[-1, -1, 0], [-1.3, -1, 0]]} color="#94a3b8" transparent opacity={opacity} />
      <Line points={[[-1, 1, 0], [-1.3, 1, 0]]} color="#94a3b8" transparent opacity={opacity} />
      <Text position={[-1.5, 0, 0]} fontSize={0.2} color="#0f172a" rotation={[0, 0, Math.PI/2]} fillOpacity={opacity}>2.0 cm</Text>
    </group>
  );
};


// --- MAIN COMPONENT ---
export const OrthographicProjection3D = () => {
  const mainObjRef = useRef<THREE.Group>(null);
  const bottomHingeRef = useRef<THREE.Group>(null);
  const rightHingeRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  const [mode, setMode] = useState<"free" | "measure" | "unfold">("free");
  const [measurePts, setMeasurePts] = useState<THREE.Vector3[]>([]);
  const unfoldProgress = useRef(0);

  // Draggable & Resizable Panel State
  const [panelPos, setPanelPos] = useState(() => ({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 340 : 500, 
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
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
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
    if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleScaleUp = (e: any) => { e.stopPropagation(); setPanelScale(s => Math.min(s + 0.1, 2)); };
  const handleScaleDown = (e: any) => { e.stopPropagation(); setPanelScale(s => Math.max(s - 0.1, 0.5)); };

  // UI State
  const [showPortal, setShowPortal] = useState(false);
  useEffect(() => { setShowPortal(true); }, []);

  useFrame((state, delta) => {
    // Unfold Animation
    const targetUnfold = mode === "unfold" ? 1 : 0;
    unfoldProgress.current = THREE.MathUtils.lerp(unfoldProgress.current, targetUnfold, delta * 3.0);

    if (bottomHingeRef.current) {
       bottomHingeRef.current.rotation.x = unfoldProgress.current * (Math.PI / 2);
    }
    if (rightHingeRef.current) {
       rightHingeRef.current.rotation.y = unfoldProgress.current * (-Math.PI / 2);
    }

    // If unfolding, snap object back to original rotation/position to ensure standard 2D view
    if (mode === "unfold" && mainObjRef.current) {
       mainObjRef.current.position.lerp(new THREE.Vector3(0,0,0), delta * 4);
       mainObjRef.current.quaternion.slerp(new THREE.Quaternion(), delta * 4);
    }
  });

  const handlePointerDownMeasure = (e: any) => {
    if (mode !== "measure") return;
    e.stopPropagation();
    if (measurePts.length < 2) {
      setMeasurePts(prev => [...prev, e.point.clone()]);
    } else {
      setMeasurePts([e.point.clone()]);
    }
  };

  const snapCamera = (pos: [number, number, number], target: [number, number, number]) => {
     if (controlsRef.current) {
        camera.position.set(...pos);
        controlsRef.current.target.set(...target);
        controlsRef.current.update();
     }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-bias={-0.001} />

      {/* --- GLASS BOX PLANES --- */}
      {/* Front View / Back Plane */}
      <mesh position={[0, 0, -3]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial roughness={0.9} color="#e2e8f0" transparent opacity={unfoldProgress.current > 0.5 ? 1 : 0.8}>
          <RenderTexture attach="map" width={1024} height={1024}>
             <color attach="background" args={['#F8FAFC']} />
             <OrthographicCamera makeDefault position={[0, 0, 10]} left={-3} right={3} top={3} bottom={-3} />
             <ProxyModel mainObjRef={mainObjRef} />
             <DimensionsOverlay opacity={unfoldProgress.current} />
          </RenderTexture>
        </meshStandardMaterial>
        <Edges color="#cbd5e1" />
        <Text position={[0, 3.2, 0]} fontSize={0.25} color="#475569">المسقط الأمامي (Vue de Face)</Text>
      </mesh>

      {/* Top View / Bottom Plane */}
      <group ref={bottomHingeRef} position={[0, -3, -3]}>
         <mesh position={[0, 0, 3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
           <planeGeometry args={[6, 6]} />
           <meshStandardMaterial roughness={0.9} color="#e2e8f0" transparent opacity={unfoldProgress.current > 0.5 ? 1 : 0.8}>
             <RenderTexture attach="map" width={1024} height={1024}>
               <color attach="background" args={['#F8FAFC']} />
               <OrthographicCamera makeDefault position={[0, 10, 0]} up={[0, 0, -1]} left={-3} right={3} top={3} bottom={-3} />
               <ProxyModel mainObjRef={mainObjRef} />
             </RenderTexture>
           </meshStandardMaterial>
           <Edges color="#cbd5e1" />
           <Text position={[0, -3.2, 0]} rotation={[Math.PI, 0, Math.PI]} fontSize={0.25} color="#475569">المسقط الأفقي (Vue de Dessus)</Text>
         </mesh>
      </group>

      {/* Left View / Right Plane */}
      <group ref={rightHingeRef} position={[3, 0, -3]}>
         <mesh position={[0, 0, 3]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
           <planeGeometry args={[6, 6]} />
           <meshStandardMaterial roughness={0.9} color="#e2e8f0" transparent opacity={unfoldProgress.current > 0.5 ? 1 : 0.8}>
             <RenderTexture attach="map" width={1024} height={1024}>
               <color attach="background" args={['#F8FAFC']} />
               <OrthographicCamera makeDefault position={[-10, 0, 0]} up={[0, 1, 0]} left={-3} right={3} top={3} bottom={-3} />
               <ProxyModel mainObjRef={mainObjRef} />
             </RenderTexture>
           </meshStandardMaterial>
           <Edges color="#cbd5e1" />
           <Text position={[-3.2, 0, 0]} rotation={[0, Math.PI/2, Math.PI/2]} fontSize={0.25} color="#475569">المسقط الجانبي الأيسر (Vue de Gauche)</Text>
         </mesh>
      </group>


      {/* --- GRID HELPERS FOR REFERENCE --- */}
      <gridHelper args={[6, 12, "#cbd5e1", "#f1f5f9"]} position={[0, -3, 0]} />


      {/* --- CENTRAL 3D OBJECT --- */}
      {mode === "free" ? (
        <TransformControls mode="translate">
           <group ref={mainObjRef} onPointerDown={handlePointerDownMeasure}>
             <mesh geometry={LShapeGeo} castShadow receiveShadow>
               <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.2} transparent opacity={1} />
               <Edges color="#1e3a8a" />
             </mesh>
           </group>
        </TransformControls>
      ) : (
         <group ref={mainObjRef} onPointerDown={handlePointerDownMeasure}>
           <mesh geometry={LShapeGeo} castShadow receiveShadow>
             <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.2} transparent opacity={mode === "unfold" ? 0.1 : 1} />
             <Edges color="#1e3a8a" />
           </mesh>
         </group>
      )}

      <ProjectionLines mainObjRef={mainObjRef} opacity={mode === "unfold" ? 0 : 1} />

      {/* --- MEASURE TOOL VISUALS --- */}
      {measurePts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}
      {measurePts.length === 2 && (
        <>
          <Line points={[measurePts[0], measurePts[1]]} color="#ef4444" lineWidth={3} depthTest={false} />
          <Billboard position={measurePts[0].clone().lerp(measurePts[1], 0.5).add(new THREE.Vector3(0, 0.2, 0))}>
             <Text fontSize={0.3} color="#FFFFFF" outlineWidth={0.02} outlineColor="#ef4444">
               {`${measurePts[0].distanceTo(measurePts[1]).toFixed(2)} cm`}
             </Text>
          </Billboard>
        </>
      )}


      <OrbitControls ref={controlsRef} makeDefault enabled={mode !== "measure"} />

      {/* --- UI OVERLAY --- */}
      {showPortal && typeof document !== 'undefined' && (
        <Html>
          {createPortal(
            <div style={{
              position: 'fixed',
              top: `${panelPos.y}px`,
              left: `${panelPos.x}px`,
              transform: `scale(${panelScale})`,
              transformOrigin: 'top left',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '24px',
              borderRadius: '16px',
              color: 'white',
              fontFamily: 'system-ui',
              direction: 'rtl',
              zIndex: 100000,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              width: '280px',
              pointerEvents: 'auto'
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

               <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 📐 مختبر الإسقاط العمودي
               </h2>
               <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#94a3b8' }}>نظام الزاوية الأولى (First-Angle)</p>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                 <button onClick={() => setMode("free")} style={{ padding: '8px', background: mode === "free" ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>حركة حرّة</button>
                 <button onClick={() => { setMode("measure"); setMeasurePts([]); }} style={{ padding: '8px', background: mode === "measure" ? '#ef4444' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>قياس الأبعاد</button>
                 <button onClick={() => setMode("unfold")} style={{ gridColumn: '1 / -1', padding: '10px', background: mode === "unfold" ? '#10b981' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {mode === "unfold" ? "طي النموذج (Fold)" : "بسط المساقط (Unfold)"}
                 </button>
               </div>

               <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
               <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1' }}>توجيه الكاميرا السريع:</p>
               
               <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                 <button onClick={() => snapCamera([0, 0, 15], [0, 0, 0])} style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>أمامي</button>
                 <button onClick={() => snapCamera([0, 15, 0], [0, 0, 0])} style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>علوي</button>
                 <button onClick={() => snapCamera([-15, 0, 0], [0, 0, 0])} style={{ flex: 1, padding: '6px', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>أيسر</button>
               </div>

               {mode === "unfold" && (
                 <button onClick={() => snapCamera([3, -6, 20], [3, -6, -3])} style={{ padding: '6px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginTop: '8px' }}>
                   رؤية اللوحة كاملة (Layout)
                 </button>
               )}
            </div>,
            document.body
          )}
        </Html>
      )}
    </>
  );
};

export default OrthographicProjection3D;
