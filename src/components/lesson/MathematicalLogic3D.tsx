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

// --- AUDIO SYNTHESIZER ---
const playSuccessSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    } catch(e) {}
};


// --- LOGIC ENGINE ---
export type GateType = 'AND' | 'OR' | 'IMPLIES';
const evaluateLogic = (p: boolean, q: boolean, gate: GateType) => {
   if(gate === 'AND') return p && q;
   if(gate === 'OR') return p || q;
   if(gate === 'IMPLIES') return !p || q;
   return false;
};

// --- VISUAL COMPONENTS ---
const ToggleSwitch = ({ position, label, state, onToggle }: any) => {
   const color = state ? "#22c55e" : "#ef4444";
   return (
       <group position={position} onClick={onToggle}>
         <mesh position={[0,-0.4,0]} castShadow>
            <boxGeometry args={[2, 0.4, 2]} />
            <meshStandardMaterial color="#1e293b" />
         </mesh>
         <mesh rotation={[state ? Math.PI/5 : -Math.PI/5, 0, 0]} position={[0,0.5,0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} roughness={0.2} metalness={0.8} />
         </mesh>
         <Billboard position={[0, 2.5, 0]}>
             <Text fontSize={0.9} color={color} outlineWidth={0.06} outlineColor="#0f172a">{label} = {state ? 'T' : 'F'}</Text>
         </Billboard>
      </group>
   )
};

const GateVisual = ({ type, position }: any) => {
    const shape = useMemo(() => {
        const s = new THREE.Shape();
        if (type === 'AND') {
            s.moveTo(-1, -1.2); s.lineTo(0, -1.2); s.absarc(0, 0, 1.2, -Math.PI/2, Math.PI/2, false); s.lineTo(-1, 1.2); s.lineTo(-1, -1.2);
        } else if (type === 'OR') {
            s.moveTo(-1, -1.5); s.quadraticCurveTo(0, 0, -1, 1.5); s.quadraticCurveTo(0.5, 1.5, 1.8, 0); s.quadraticCurveTo(0.5, -1.5, -1, -1.5);
        } else if (type === 'IMPLIES') {
            s.moveTo(-1, -0.4); s.lineTo(0.5, -0.4); s.lineTo(0.5, -1); s.lineTo(2, 0); s.lineTo(0.5, 1); s.lineTo(0.5, 0.4); s.lineTo(-1, 0.4); s.lineTo(-1, -0.4);
        }
        return s;
    }, [type]);

    const ext = { depth: 0.6, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
    
    return (
       <group position={position}>
           <mesh position={[0, -0.4, 0]}>
               <boxGeometry args={[4, 0.4, 4]} />
               <meshStandardMaterial color="#0f172a" />
           </mesh>
           <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]}>
              <extrudeGeometry args={[shape, ext]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
           </mesh>
           <Billboard position={[0, 3, 0]}>
             <Text fontSize={0.9} color="#e0f2fe" outlineWidth={0.06} outlineColor="#000">{type}</Text>
           </Billboard>
       </group>
    )
};

const FlowPipe = ({ startPtr, endPtr, state }: any) => {
    const curve = useMemo(() => new THREE.CatmullRomCurve3([
            new THREE.Vector3(startPtr[0], 0, startPtr[2]),
            new THREE.Vector3(startPtr[0] + 2, 0, startPtr[2]), 
            new THREE.Vector3(endPtr[0] - 2, 0, endPtr[2]),   
            new THREE.Vector3(endPtr[0], 0, endPtr[2])
    ]), [startPtr, endPtr]);

    const geometry = useMemo(() => new THREE.TubeGeometry(curve, 30, 0.1, 8, false), [curve]);
    const particlesRef = useRef<THREE.InstancedMesh>(null);
    const count = 12;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((_, delta) => {
       const speed = state ? 2.5 : 0.5;
       const color = state ? new THREE.Color('#22c55e') : new THREE.Color('#ef4444');
       
       if (particlesRef.current) {
           for (let i = 0; i < count; i++) {
               let t = (_.clock.elapsedTime * speed + i / count) % 1;
               const pos = curve.getPointAt(t);
               dummy.position.copy(pos);
               dummy.updateMatrix();
               particlesRef.current.setMatrixAt(i, dummy.matrix);
               particlesRef.current.setColorAt(i, color);
           }
           particlesRef.current.instanceMatrix.needsUpdate = true;
           if (particlesRef.current.instanceColor) particlesRef.current.instanceColor.needsUpdate = true;
       }
    });

    return (
        <group>
            <mesh geometry={geometry}>
                <meshPhysicalMaterial transparent opacity={0.3} color="#94a3b8" roughness={0.2} transmission={1} />
            </mesh>
            <instancedMesh ref={particlesRef} args={[undefined, undefined, count]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial toneMapped={false} />
            </instancedMesh>
        </group>
    );
};

const FinalLamp = ({ position, state }: any) => {
   return (
       <group position={position}>
           <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[1, 1, 0.8]} />
              <meshStandardMaterial color="#1e293b" />
           </mesh>
           <mesh position={[0, 0.8, 0]}>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshStandardMaterial 
                  color={state ? "#4ade80" : "#ef4444"} 
                  emissive={state ? "#22c55e" : "#ff0000"}
                  emissiveIntensity={state ? 2.5 : 0.2}
                  transparent opacity={0.9}
              />
           </mesh>
           <Billboard position={[0, 3.5, 0]}>
             <Text fontSize={1.2} color={state ? "#4ade80" : "#ef4444"} outlineWidth={0.06} outlineColor="#000">Result = {state ? 'TRUE' : 'FALSE'}</Text>
           </Billboard>
           {/* Dynamic Environment Lighting */}
           {state && <pointLight color="#22c55e" intensity={5} distance={15} position={[0, 2, 0]} />}
       </group>
   )
};

// --- MAIN LAB COMPONENT ---
export const MathematicalLogic3D = () => {
  const [p, setP] = useState(false);
  const [q, setQ] = useState(false);
  const [gate, setGate] = useState<GateType>('AND');
  const [puzzleMode, setPuzzleMode] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  // Compute logic
  const output = evaluateLogic(p, q, gate);

  // Audio effect observer
  const prevOutput = useRef(output);
  useEffect(() => {
     if (output === true && prevOutput.current === false) playSuccessSound();
     prevOutput.current = output;

     // Puzzle Validator logic: Condition P=False, Q=False producing Output=True via IMPLIES.
     if (puzzleMode && p === false && q === false && gate === 'IMPLIES' && !puzzleSolved) {
         setPuzzleSolved(true);
         setTimeout(playSuccessSound, 100);
         setTimeout(playSuccessSound, 300);
     }
  }, [output, puzzleMode, p, q, gate, puzzleSolved]);

  // AR Settings
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, startTracking, isActive, isLoading } = useHandTracking(videoRef);
  const cooldownRef = useRef(0);

  useFrame((state, delta) => {
     if (cooldownRef.current > 0) cooldownRef.current -= delta;

     if (isActive && handData && cooldownRef.current <= 0) {
         const hX = -(handData.palmPosition.x - 0.5) * 20; 
         const hZ = (handData.palmPosition.y - 0.5) * 10;
         
         // Touch detection for P(-8, -4) and Q(-8, 4)
         if (Math.hypot(hX - (-8), hZ - (-4)) < 2.5) { setP(!p); cooldownRef.current = 1.5; }
         if (Math.hypot(hX - (-8), hZ - (4)) < 2.5) { setQ(!q); cooldownRef.current = 1.5; }
     }
  });

  // UI Panel State
  const [panelPos, setPanelPos] = useState(() => ({ x: typeof window !== 'undefined' ? window.innerWidth - 420 : 500, y: 80 }));
  const [panelScale, setPanelScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });

  const handlePointerDown = (e: React.PointerEvent) => { e.stopPropagation(); setIsDragging(true); dragStart.current = { x: e.clientX, y: e.clientY, panelX: panelPos.x, panelY: panelPos.y }; if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); };
  const handlePointerMove = (e: React.PointerEvent) => { if (isDragging) setPanelPos({ x: dragStart.current.panelX + (e.clientX - dragStart.current.x), y: dragStart.current.panelY + (e.clientY - dragStart.current.y) }); };
  const handlePointerUp = (e: React.PointerEvent) => { e.stopPropagation(); setIsDragging(false); if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId); };
  const [showPortal, setShowPortal] = useState(false); useEffect(() => setShowPortal(true), []);

  const truthTable = [
      { p: true, q: true, res: evaluateLogic(true, true, gate) },
      { p: true, q: false, res: evaluateLogic(true, false, gate) },
      { p: false, q: true, res: evaluateLogic(false, true, gate) },
      { p: false, q: false, res: evaluateLogic(false, false, gate) },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[0, 15, 5]} intensity={1.5} castShadow />
      
      {/* Central Board Ground */}
      <mesh position={[0, -0.6, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[100, 100]} />
         <meshStandardMaterial color="#020617" roughness={0.9} />
      </mesh>
      <gridHelper args={[100, 100, "#1e293b", "#0f172a"]} position={[0, -0.59, 0]} />

      {/* Network Nodes */}
      <ToggleSwitch position={[-8, 0, -4]} label="P" state={p} onToggle={() => setP(!p)} />
      <ToggleSwitch position={[-8, 0, 4]} label="Q" state={q} onToggle={() => setQ(!q)} />
      
      <GateVisual position={[0, 0, 0]} type={gate} />
      <FinalLamp position={[8, 0, 0]} state={output} />

      {/* Flow Pipes (Wires) */}
      <FlowPipe startPtr={[-6, 0, -4]} endPtr={[-2, 0, -1]} state={p} />
      <FlowPipe startPtr={[-6, 0, 4]} endPtr={[-2, 0, 1]} state={q} />
      <FlowPipe startPtr={[2, 0, 0]} endPtr={[6, 0, 0]} state={output} />

      {/* Camera Settings */}
      <OrbitControls makeDefault enablePan target={[0, 2, 0]} minDistance={10} maxDistance={25} />

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
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '380px', pointerEvents: 'auto'
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

              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#38bdf8' }}>🔗 الروابط المنطقية</h2>

              {/* AR SECTION */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: `1px solid rgba(255,255,255,0.05)`, marginBottom: '16px' }}>
                 <div style={{ position: 'relative', width: '100%', height: isActive ? '120px' : '40px', transition: 'height 0.3s' }}>
                   <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isActive ? 1 : 0 }} />
                   {!isActive && (
                     <button onClick={startTracking} style={{ width: '100%', height: '100%', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                       {isLoading ? '⏳ يتم تشغيل الكاميرا...' : '🖐️ تفعيل المس أزرار الإدخال (AR)'}
                     </button>
                   )}
                   {isActive && (
                     <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', width: '90%', textAlign: 'center' }}>
                       <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>حرك يدك نحو الأزرار P و Q لتبديلها 🎯</p>
                     </div>
                   )}
                 </div>
              </div>

              {/* GATE SELECTOR */}
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>تبديل البوابة المركزية (Gate)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                 {['AND', 'OR', 'IMPLIES'].map(g => (
                    <button key={g} onClick={() => setGate(g as GateType)} style={{ flex: 1, padding: '10px', background: gate === g ? '#38bdf8' : 'rgba(255,255,255,0.1)', color: gate === g ? '#000': 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{g}</button>
                 ))}
              </div>

              {/* FLOATING TRUTH TABLE */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#94a3b8', textAlign: 'center' }}>جدول الحقيقة الحي</h3>
                <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '8px' }}>P</th>
                      <th style={{ padding: '8px' }}>Q</th>
                      <th style={{ padding: '8px' }}>P {gate} Q</th>
                    </tr>
                  </thead>
                  <tbody>
                    {truthTable.map((row, i) => {
                       const isMatch = row.p === p && row.q === q;
                       return (
                         <tr key={i} style={{ 
                            background: isMatch ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                            boxShadow: isMatch ? 'inset 0 0 10px rgba(56, 189, 248, 0.5)' : 'none',
                            color: isMatch ? 'white' : '#94a3b8',
                            transition: 'all 0.3s'
                         }}>
                           <td style={{ padding: '8px', color: row.p ? '#4ade80' : '#f87171' }}>{row.p ? 'T' : 'F'}</td>
                           <td style={{ padding: '8px', color: row.q ? '#4ade80' : '#f87171' }}>{row.q ? 'T' : 'F'}</td>
                           <td style={{ padding: '8px', fontWeight: 'bold', color: row.res ? '#4ade80' : '#f87171' }}>{row.res ? 'True' : 'False'}</td>
                         </tr>
                       )
                    })}
                  </tbody>
                </table>
              </div>

              {/* PUZZLE MODE */}
              <div style={{ marginTop: '16px', background: puzzleSolved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '8px', border: `1px solid ${puzzleSolved ? '#22c55e' : '#eab308'}` }}>
                 {!puzzleMode ? (
                    <button onClick={() => setPuzzleMode(true)} style={{ width: '100%', padding: '8px', background: '#eab308', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🎯 ابدأ لغز المنطق</button>
                 ) : (
                    <>
                      <h4 style={{ margin: '0 0 8px 0', color: puzzleSolved ? '#4ade80' : '#fde047' }}>اللغز: الاستنتاج من الكذب</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0' }}>اجعل النتيجة (True) مع الإبقاء على مفتاحي $P$ و $Q$ في حالة الإغلاق (False).</p>
                      {puzzleSolved && <p style={{ margin: '8px 0 0 0', color: '#4ade80', fontWeight: 'bold' }}>✅ رائع! "إذا كان المقدم كاذباً فالاستلزام صحيح دائماً"</p>}
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

export default MathematicalLogic3D;
