import React, { useRef, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Billboard,
  Text,
  Html,
} from "@react-three/drei";
import { useHandTracking } from "../../hooks/useHandTracking";

// --- CUSTOM AUDIO ---
const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch(e) {}
};

// --- VISUAL COMPONENTS ---
const SimpleRover = ({ opacity=1, color="#38bdf8", isGhost=false }) => (
    <group>
       <mesh position={[0, 0.4, 0]} castShadow={!isGhost}>
          <boxGeometry args={[1.5, 0.6, 1.2]} />
          <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.7} />
       </mesh>
       <mesh position={[0, 0.8, 0]} castShadow={!isGhost}>
          <cylinderGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#0f172a" transparent opacity={opacity} />
       </mesh>
       {[-0.5, 0.5].map(wx => (
          [-0.8, 0.8].map(wz => (
             <mesh key={`${wx}-${wz}`} position={[wx, 0.3, wz]} rotation={[Math.PI/2, 0, 0]}>
                 <cylinderGeometry args={[0.3, 0.3, 0.3]} />
                 <meshStandardMaterial color="#1e293b" transparent opacity={opacity} roughness={0.9} />
             </mesh>
          ))
       ))}
       {/* Direction Arrow Vector (Points strictly to +X relative to chassis) */}
       <mesh position={[1.4, 0.4, 0]} rotation={[0, 0, -Math.PI/2]}>
          <coneGeometry args={[0.3, 0.8, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isGhost ? 0.2 : 0.8} transparent opacity={opacity} />
       </mesh>
       <mesh position={[0.75, 0.4, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5]} />
          <meshStandardMaterial color="#ef4444" transparent opacity={opacity} />
       </mesh>
    </group>
);

const CartesianGrid = () => {
    // Math X/Y logic maps to 3D X/-Z
    const lines = [];
    const labels = [];
    for (let i = -15; i <= 15; i++) {
        if(i === 0) continue;
        lines.push(
           <mesh key={`gx-${i}`} position={[i, 0, 0]}>
              <boxGeometry args={[0.05, 0.01, 30]} />
              <meshBasicMaterial color="#334155" />
           </mesh>
        );
        lines.push(
           <mesh key={`gy-${i}`} position={[0, 0, -i]}>
              <boxGeometry args={[30, 0.01, 0.05]} />
              <meshBasicMaterial color="#334155" />
           </mesh>
        );
        if(i%2===0) {
            labels.push(
                <Text key={`tx-${i}`} position={[i, 0.1, 0.5]} fontSize={0.5} rotation={[-Math.PI/2, 0, 0]} color="#94a3b8">{i}</Text>
            );
            labels.push(
                <Text key={`ty-${i}`} position={[-0.5, 0.1, -i]} fontSize={0.5} rotation={[-Math.PI/2, 0, 0]} color="#94a3b8">{i}</Text>
            );
        }
    }
    return (
       <group>
          {/* Main Axes */}
          <mesh position={[0, 0.01, 0]}>
             <boxGeometry args={[30, 0.05, 0.1]} />
             <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.01, 0]}>
             <boxGeometry args={[0.1, 0.05, 30]} />
             <meshBasicMaterial color="#10b981" />
          </mesh>
          {lines}
          {labels}
       </group>
    )
}

// --- MAIN LAB COMPONENT ---
export const RobotKinematics3D = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 }); 
  const [angle, setAngle] = useState(0); 

  const [inputDist, setInputDist] = useState(5);
  const [inputAngle, setInputAngle] = useState(45);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [history, setHistory] = useState<{x:number, y:number}[]>([]);

  // Targets for animation lerp
  const targetPosRef = useRef({ x: 0, y: 0 });
  const targetAngleRef = useRef(0);
  const realRoverRef = useRef<THREE.Group>(null);

  // Puzzle State
  const [puzzleMode, setPuzzleMode] = useState(false);
  const [targetPoint, setTargetPoint] = useState({ x: 0, y: 0 });
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  // AR State
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, startTracking, isActive, isLoading } = useHandTracking(videoRef);
  const prevPinchRef = useRef(false);

  // MATH CALCULATIONS
  // Math coordinates: +x represents right, +y represents up.
  // 3D coordinates: +x represents right, -z represents up/forward.
  const previewAngleRad = inputAngle * Math.PI / 180;
  const previewEnd = {
      x: pos.x + inputDist * Math.cos(previewAngleRad),
      y: pos.y + inputDist * Math.sin(previewAngleRad),
  };

  const handleExecute = () => {
      if (isAnimating) return;
      setIsAnimating(true);
      setHistory(prev => [...prev, { x: pos.x, y: pos.y }]);
      targetPosRef.current = { ...previewEnd };
      targetAngleRef.current = inputAngle;
  };

  useFrame((state, delta) => {
      if (isActive && handData && !isAnimating) {
         // Map X (0 to 1 -> right limits) to Angle (-180 to 180)
         const mappedAngle = ((1 - handData.palmPosition.x) * 360) - 180;
         // Map Y (0 to 1) to Distance (0 to 15)
         const mappedDist = (1 - Math.max(0, Math.min(1, handData.palmPosition.y))) * 15;
         
         setInputAngle(prev => THREE.MathUtils.lerp(prev, mappedAngle, 0.1));
         setInputDist(prev => THREE.MathUtils.lerp(prev, mappedDist, 0.1));

         if (handData.isPinching && !prevPinchRef.current) {
             handleExecute();
         }
         prevPinchRef.current = handData.isPinching;
      }

      if (isAnimating && realRoverRef.current) {
          const m = realRoverRef.current;
          // lerp position natively in 3D space
          m.position.x = THREE.MathUtils.lerp(m.position.x, targetPosRef.current.x, delta * 3);
          m.position.z = THREE.MathUtils.lerp(m.position.z, -targetPosRef.current.y, delta * 3);
          
          // Lerp angle (use angles smoothly)
          // We convert Math angle to Three.js Y-rotation
          const tRotY = targetAngleRef.current * Math.PI / 180;
          m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, tRotY, delta * 5);

          // Check if reached destination
          const distToTarget = Math.hypot(m.position.x - targetPosRef.current.x, m.position.z - (-targetPosRef.current.y));
          if (distToTarget < 0.05) {
              m.position.set(targetPosRef.current.x, 0, -targetPosRef.current.y);
              m.rotation.y = tRotY;
              setPos(targetPosRef.current);
              setAngle(targetAngleRef.current);
              setIsAnimating(false);
          }
      }
  });

  // Verify puzzle completion
  useEffect(() => {
     if (puzzleMode && !isAnimating && !puzzleSolved) {
         const dx = Math.abs(pos.x - targetPoint.x);
         const dy = Math.abs(pos.y - targetPoint.y);
         if (dx < 0.5 && dy < 0.5) {
             setPuzzleSolved(true);
             playSuccessSound();
         }
     }
  }, [pos, isAnimating, puzzleMode, targetPoint, puzzleSolved]);

  const generatePuzzle = () => {
      setPuzzleMode(true);
      setPuzzleSolved(false);
      setTargetPoint({
          x: Math.round(Math.random() * 20 - 10),
          y: Math.round(Math.random() * 20 - 10)
      });
  };

  // UI Setup
  const [panelPos, setPanelPos] = useState(() => ({ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 500, y: 80 }));
  const [panelScale, setPanelScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => { e.stopPropagation(); setIsDragging(true); dragStart.current = { x: e.clientX, y: e.clientY, panelX: panelPos.x, panelY: panelPos.y }; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); };
  const handlePointerMove = (e: React.PointerEvent) => { if (isDragging) setPanelPos({ x: dragStart.current.panelX + (e.clientX - dragStart.current.x), y: dragStart.current.panelY + (e.clientY - dragStart.current.y) }); };
  const handlePointerUp = (e: React.PointerEvent) => { e.stopPropagation(); setIsDragging(false); if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId); };
  const [showPortal, setShowPortal] = useState(false); useEffect(() => setShowPortal(true), []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
      
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
         <planeGeometry args={[100, 100]} />
         <meshStandardMaterial color="#020617" roughness={0.8} />
      </mesh>
      
      <CartesianGrid />

      {/* Target/Puzzle Point */}
      {puzzleMode && (
         <group position={[targetPoint.x, 0, -targetPoint.y]}>
            <mesh position={[0, 0.5, 0]}>
               <sphereGeometry args={[0.5, 32, 32]} />
               <meshStandardMaterial color={puzzleSolved ? "#4ade80" : "#facc15"} emissive={puzzleSolved ? "#22c55e" : "#ca8a04"} emissiveIntensity={1} />
            </mesh>
            <pointLight distance={10} color={puzzleSolved ? "#22c55e" : "#facc15"} intensity={2} />
            <Billboard position={[0, 2.5, 0]}>
               <Text fontSize={1} color="white">
                  {puzzleSolved ? '✅ تم الوصول!' : `الهدف: (${targetPoint.x}, ${targetPoint.y})`}
               </Text>
            </Billboard>
         </group>
      )}

      {/* Past Trails */}
      {history.map((h, i) => {
         if (i === history.length - 1) return null;
         const hNext = history[i+1];
         // draw line from h to hNext
         const dist = Math.hypot(hNext.x - h.x, hNext.y - h.y);
         const rot = Math.atan2(hNext.y - h.y, hNext.x - h.x);
         return (
            <mesh key={i} position={[(h.x + hNext.x)/2, 0.05, -(h.y + hNext.y)/2]} rotation={[0, -rot, 0]}>
               <boxGeometry args={[dist, 0.1, 0.1]} />
               <meshBasicMaterial color="#3b82f6" />
            </mesh>
         )
      })}
      {/* Link history tail to current position */}
      {history.length > 0 && (
         <mesh position={[(history[history.length-1].x + pos.x)/2, 0.05, -(history[history.length-1].y + pos.y)/2]} rotation={[0, -Math.atan2(pos.y - history[history.length-1].y, pos.x - history[history.length-1].x), 0]}>
            <boxGeometry args={[Math.hypot(pos.x - history[history.length-1].x, pos.y - history[history.length-1].y), 0.1, 0.1]} />
            <meshBasicMaterial color="#3b82f6" />
         </mesh>
      )}

      {/* The Ghost/Preview Robot & Trigonometry Visuals */}
      {!isAnimating && (
          <>
             {/* Ghost Rover */}
             <group position={[previewEnd.x, 0, -previewEnd.y]} rotation={[0, previewAngleRad, 0]}>
                 <SimpleRover isGhost={true} color="#94a3b8" opacity={0.3} />
                 <Billboard position={[0, 2.5, 0]}>
                    <Text fontSize={0.8} color="#e2e8f0" outlineWidth={0.05} outlineColor="#000">
                       ({previewEnd.x.toFixed(1)} , {previewEnd.y.toFixed(1)})
                    </Text>
                 </Billboard>
             </group>
             
             {/* Preview Trail (Hypotenuse) */}
             <mesh position={[(pos.x + previewEnd.x)/2, 0.02, -(pos.y + previewEnd.y)/2]} rotation={[0, previewAngleRad, 0]}>
                <boxGeometry args={[inputDist, 0.05, 0.05]} />
                <meshBasicMaterial color="#fcd34d" transparent opacity={0.6} />
             </mesh>

             {/* Trig X Projection (Cosine) */}
             <mesh position={[(pos.x + previewEnd.x)/2, 0.02, -pos.y]}>
                <boxGeometry args={[Math.abs(previewEnd.x - pos.x), 0.04, 0.04]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
             </mesh>
             {/* Trig Y Projection (Sine) */}
             <mesh position={[previewEnd.x, 0.02, -(pos.y + previewEnd.y)/2]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[Math.abs(previewEnd.y - pos.y), 0.04, 0.04]} />
                <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
             </mesh>
             <Billboard position={[(pos.x + previewEnd.x)/2, 0.5, -pos.y]}>
                 <Text fontSize={0.6} color="#fca5a5">dx = D.cos({inputAngle.toFixed(0)}°)</Text>
             </Billboard>
             <Billboard position={[previewEnd.x, 0.5, -(pos.y + previewEnd.y)/2]}>
                 <Text fontSize={0.6} color="#6ee7b7">dy = D.sin({inputAngle.toFixed(0)}°)</Text>
             </Billboard>
          </>
      )}

      {/* The Real Rover */}
      <group ref={realRoverRef} position={[pos.x, 0, -pos.y]} rotation={[0, angle * Math.PI / 180, 0]}>
          <SimpleRover isGhost={false} />
          {/* Label on top of Real Rover */}
          {isAnimating && (
             <Billboard position={[0, 2.5, 0]}>
                <Text fontSize={0.8} color="#38bdf8" outlineWidth={0.05} outlineColor="#000">جاري التنفيذ...</Text>
             </Billboard>
          )}
      </group>

      <OrbitControls makeDefault enablePan target={[pos.x, 0, -pos.y]} minDistance={5} maxDistance={40} />

      {/* UI Control Panel Portal */}
      {showPortal && typeof document !== 'undefined' && (
        <Html>
          {createPortal(
            <div style={{
              position: 'fixed', top: `${panelPos.y}px`, left: `${panelPos.x}px`,
              transform: `scale(${panelScale})`, transformOrigin: 'top left',
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px',
              color: 'white', fontFamily: 'system-ui', direction: 'rtl', zIndex: 100000, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '380px', pointerEvents: 'auto' // pointer Events auto crucial for AR inputs 
            }}>
              <div 
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
                style={{ cursor: isDragging ? 'grabbing' : 'grab', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '16px 16px 0 0', margin: '-20px -20px 16px -20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setPanelScale(s => Math.min(s + 0.1, 2))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px' }}>+</button>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setPanelScale(s => Math.max(s - 0.1, 0.5))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px' }}>-</button>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>☰ اسحب للتحريك</span>
              </div>

              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#38bdf8' }}>🧭 رياضيات الروبوت</h2>

              {/* AR SECTION */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: `1px solid rgba(255,255,255,0.05)`, marginBottom: '16px' }}>
                 <div style={{ position: 'relative', width: '100%', height: isActive ? '120px' : '40px', transition: 'height 0.3s' }}>
                   <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isActive ? 1 : 0 }} />
                   {!isActive && (
                     <button onClick={startTracking} style={{ width: '100%', height: '100%', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                       {isLoading ? '⏳ يتم تشغيل الكاميرا...' : '🖐️ تفعيل البرمجة الحركية (AR Hands)'}
                     </button>
                   )}
                   {isActive && (
                     <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', width: '90%', textAlign: 'center' }}>
                       <p style={{ margin: 0, fontSize: '10px', fontWeight: 'bold', color: '#10b981' }}>أفقياً للزاوية، عمودياً للمسافة. اقبض يدك للتنفيذ! ✊</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* Data Dashboard */}
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span style={{ color: '#94a3b8' }}>الموقع الحالي $(X, Y)$</span>
                     <span style={{ fontWeight: 'bold', color: '#cbd5e1' }}>({pos.x.toFixed(1)}, {pos.y.toFixed(1)})</span>
                  </div>
              </div>

              {/* INPUT CONTROLS */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 
                 <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>زاوية الدوران $\theta$ (Angle)</span>
                    <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{inputAngle.toFixed(0)}°</span>
                 </label>
                 <input type="range" min="-180" max="180" step="1" value={inputAngle} onChange={e => setInputAngle(parseInt(e.target.value))} style={{ width: '100%' }} disabled={isAnimating || isActive} />

                 <label style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0 8px 0', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>مسافة التقدم $d$ (Distance)</span>
                    <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{inputDist.toFixed(1)} وحدة</span>
                 </label>
                 <input type="range" min="0" max="25" step="0.5" value={inputDist} onChange={e => setInputDist(parseFloat(e.target.value))} style={{ width: '100%' }} disabled={isAnimating || isActive} />

              </div>

              <button 
                  onClick={handleExecute} 
                  disabled={isAnimating}
                  style={{ width: '100%', padding: '12px', marginTop: '16px', background: isAnimating ? '#475569' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: isAnimating ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                  {isAnimating ? 'جاري الحركة...' : 'تنفيذ المسار (Execute)'}
              </button>

              {/* PUZZLE MODE */}
              <div style={{ marginTop: '16px', background: puzzleSolved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '8px', border: `1px solid ${puzzleSolved ? '#22c55e' : '#eab308'}` }}>
                 {!puzzleMode ? (
                    <button onClick={generatePuzzle} style={{ width: '100%', padding: '8px', background: '#eab308', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🎯 تحدي الأهداف</button>
                 ) : (
                    <>
                      <h4 style={{ margin: '0 0 8px 0', color: puzzleSolved ? '#4ade80' : '#fde047' }}>تحدي الإحداثيات</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0' }}>برمج الروبوت ليصل بدقة إلى النقطة: <strong>({targetPoint.x}, {targetPoint.y})</strong></p>
                      {puzzleSolved && <p style={{ margin: '8px 0 0 0', color: '#4ade80', fontWeight: 'bold' }}>✅ رائع! لقد طبقت حسابات المثلثات بنجاح.</p>}
                      {puzzleSolved && <button onClick={generatePuzzle} style={{ marginTop: '10px', fontSize: '12px', padding: '6px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>تحدي جديد 🔄</button>}
                    </>
                 )}
              </div>

            </div>,
            document.body
          )}
        </Html>
      )}
    </>
  );
};

export default RobotKinematics3D;
