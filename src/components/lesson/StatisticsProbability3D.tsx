import React, { useRef, useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Line,
  Html,
} from "@react-three/drei";
import { useMediaPipe } from "../../hooks/useMediaPipe";

const R = 12; 
const W = 0.5; 
const H = 0.5; 
const Y_START = 3.5; 
const DURATION = 8; 

type Quality = 'low' | 'medium' | 'high';

interface Ball { 
    id: number;
    delay: number; 
    path: number[]; 
    restX: number;
    restY: number;
    restZ: number;
    finalBin: number;
}

// === MAIN GALTON BOARD COMPONENT ===
export const StatisticsProbability3D = () => {
  const [quality, setQuality] = useState<Quality>(() => {
    // Mobile-safe hardware detection
    const cores = typeof window !== 'undefined' ? (window.navigator.hardwareConcurrency || 2) : 2;
    // Also check for mobile via screen width & pixel ratio
    const isMobile = typeof window !== 'undefined' && 
      (window.innerWidth < 768 || window.devicePixelRatio > 2);
    if (isMobile || cores <= 2) return 'low';
    return cores >= 8 ? 'medium' : 'low'; // Never auto-start on 'high' — user must opt-in
  });
  
  const totalBalls = quality === 'high' ? 600 : quality === 'medium' ? 300 : 100;

  const [bias, setBias] = useState(0.5);
  const [simSpeed, setSimSpeed] = useState(1);
  const ballsRef = useRef<Ball[]>([]);
  const ballMeshRef = useRef<THREE.InstancedMesh>(null);
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const simTime = useRef(0);
  const skipFrames = useRef(0); // For FPS throttling
  
  const [liveStats, setLiveStats] = useState({ count: 0, mean: 0, stdDev: 0 });
  const lastStatUpdate = useRef(0);

  // AR Settings
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, startTracking, isActive, isLoading } = useMediaPipe({ enabled: false, videoRef });
  const lastHandPos = useRef(new THREE.Vector2());
  const [isShaking, setIsShaking] = useState(false);

  // Initialize simulation
  const resetSim = (newBias: number) => {
     const balls: Ball[] = [];
     const binCountTracker = new Array(R + 1).fill(0);
     for(let i=0; i<totalBalls; i++) {
       const path = [];
       let bin = 0;
       for(let r=0; r<R; r++) {
           const move = Math.random() < newBias ? 1 : 0;
           path.push(move);
           bin+=move;
       }
       const restY = binCountTracker[bin] * 0.055;
       binCountTracker[bin]++;
       
       balls.push({
          id: i,
          delay: (i / totalBalls) * DURATION,
          path,
          finalBin: bin,
          restX: -(R*W)/2 + bin*W + (Math.random()-0.5)*0.15,
          restY: Y_START - R*H - 1.2 + restY,
          restZ: (Math.random()-0.5)*0.15 + 0.1
       });
     }
     ballsRef.current = balls;
     simTime.current = 0;
     setLiveStats({ count: 0, mean: 0, stdDev: 0 });
  };

  useEffect(() => { resetSim(bias); }, [bias, quality, totalBalls]); // reset on bias or quality change

  // Peg geometry pre-calc
  const pegsPositions = useMemo(() => {
    const pos = [];
    for (let r = 0; r < R; r++) {
      const rowLeftMost = -(r * W) / 2;
      for (let c = 0; c <= r; c++) pos.push(new THREE.Vector3(rowLeftMost + c * W, Y_START - r * H, 0.1));
    }
    return pos;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
      simTime.current += delta * simSpeed;
      
      // FPS Capping Strategy (Hardware Opt)
      // High = render every frame. Med = render every 2nd. Low = render every 3rd.
      const frameSkipAmount = quality === 'high' ? 0 : quality === 'medium' ? 1 : 2;
      skipFrames.current++;
      const shouldRenderMeshes = skipFrames.current > frameSkipAmount;
      if (shouldRenderMeshes) skipFrames.current = 0;
      
      // SHAKE AR DETECTION
      if (isActive && handData) {
         const hx = handData.palmPosition.x;
         const hy = handData.palmPosition.y;
         const d = lastHandPos.current.distanceTo(new THREE.Vector2(hx, hy));
         lastHandPos.current.set(hx, hy);
         if (d > 0.08 && simTime.current > 1) { 
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            resetSim(bias); // Hard reset
         }
      }

      if (!ballMeshRef.current || !barsRef.current) return;

      const currentCounts = new Array(R+1).fill(0);
      
      // Accumulate logic
      for (let i=0; i<totalBalls; i++) {
        const b = ballsRef.current[i];
        let t = simTime.current - b.delay;
        
        let pos = dummy.position; 
        if (t < 0) {
           pos.set(0, Y_START + 1, -1); // hidden above
        } else if (t >= R) {
           currentCounts[b.finalBin]++;
           pos.set(b.restX, b.restY, b.restZ); // resting in bin
        } else {
           const r = Math.floor(t);
           const f = t - r;
           const c = b.path.slice(0, r).reduce((s,v)=>s+v, 0);
           const cNext = c + b.path[r];
           const p1x = -(r * W)/2 + c * W;
           const p1y = Y_START - r * H;
           const p2x = -((r+1) * W)/2 + cNext * W;
           const p2y = Y_START - (r+1) * H;
           
           const x = THREE.MathUtils.lerp(p1x, p2x, f);
           const bounce = Math.sin(Math.PI * f) * 0.15;
           const y = THREE.MathUtils.lerp(p1y, p2y, f) + bounce;
           const z = Math.sin(t * 80 + i) * 0.08 + 0.1; // jitter during fall
           pos.set(x, y, z);
        }
        
        if (shouldRenderMeshes) {
          dummy.updateMatrix();
          ballMeshRef.current.setMatrixAt(i, dummy.matrix);
        }
      }
      if (shouldRenderMeshes) ballMeshRef.current.instanceMatrix.needsUpdate = true;

      // Update Histograms
      const color = new THREE.Color();
      for (let b=0; b<=R; b++) {
          const barH = currentCounts[b] * 0.055;
          dummy.position.set(-(R*W)/2 + b*W, Y_START - R*H - 1.2 + barH/2, -0.1);
          dummy.scale.set(1, Math.max(0.001, barH), 1);
          dummy.updateMatrix();
          barsRef.current.setMatrixAt(b, dummy.matrix);
          
          color.setHSL(0.55 - (currentCounts[b] / (totalBalls*0.15)) * 0.55, 0.8, 0.6); // Heatmap coloring
          
          if (shouldRenderMeshes) {
            barsRef.current.setColorAt(b, color);
            barsRef.current.setMatrixAt(b, dummy.matrix);
          }
      }
      
      if (shouldRenderMeshes) {
        barsRef.current.instanceMatrix.needsUpdate = true;
        if(barsRef.current.instanceColor) barsRef.current.instanceColor.needsUpdate = true;
      }

      // Live Stats Table update
      if (state.clock.elapsedTime - lastStatUpdate.current > 0.2) {
          lastStatUpdate.current = state.clock.elapsedTime;
          let total = 0, sum = 0, sumSq = 0;
          for(let b=0; b<=R; b++){
             let c = currentCounts[b];
             total += c;
             sum += c * b;
             sumSq += c * (b*b);
          }
          const mean = total > 0 ? sum / total : 0;
          const stdDev = total > 0 ? Math.sqrt(Math.max(0, sumSq/total - mean*mean)) : 0;
          // Format stats to not spam state object copies if unchanged (optimization)
          if(Math.abs(liveStats.count - total) > 0) {
              setLiveStats({ count: total, mean, stdDev });
          }
      }
  });

  // Calculate coordinates for the Bell Curve
  const curvePoints = useMemo(() => {
    const pts = [];
    const mu = R * bias;
    const stdDev = Math.sqrt(R * bias * (1-bias)) || 0.001;
    for(let xStr = -1; xStr <= R + 1; xStr += 0.2) {
       let xPos = -(R*W)/2 + xStr*W;
       let exp = Math.exp(-Math.pow(xStr - mu, 2) / (2 * Math.pow(stdDev, 2)));
       let expectedCount = totalBalls * (1 / (stdDev * Math.sqrt(2 * Math.PI))) * exp; 
       let yPos = Y_START - R*H - 1.2 + Math.max(0, expectedCount * 0.055);
       pts.push(new THREE.Vector3(xPos, yPos, 0.3)); // Front glowing line
    }
    return pts;
  }, [bias, totalBalls]);

  // UI Control Panel State
  const [panelPos, setPanelPos] = useState(() => ({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 420 : 500, 
    y: 80 
  }));
  const [panelScale, setPanelScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panelX: panelPos.x, panelY: panelPos.y };
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (isDragging) setPanelPos({ x: dragStart.current.panelX + (e.clientX - dragStart.current.x), y: dragStart.current.panelY + (e.clientY - dragStart.current.y) });
  };
  const handlePointerUpDrag = (e: React.PointerEvent) => {
    e.stopPropagation(); setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const [showPortal, setShowPortal] = useState(false);
  useEffect(() => { setShowPortal(true); }, []);


  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 10, 10]} intensity={1.5} castShadow />
      
      {/* Visual Board Frame */}
      <group position={[0, -0.5, 0]}>
         {/* Glass back plane */}
         <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[(R+2)*W, R*H + 3, 0.1]} />
            <meshPhysicalMaterial color="#0f172a" transparent opacity={0.6} roughness={0.1} transmission={1} />
         </mesh>
         
         {/* Bins Dividers */}
         {new Array(R+2).fill(0).map((_, i) => (
           <mesh key={`bin-${i}`} position={[-(R*W)/2 + (i-0.5)*W, Y_START - R*H - 1, 0]}>
               <boxGeometry args={[0.02, 1.5, 0.4]} />
               <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
           </mesh>
         ))}
      </group>

      {/* Instanced Pegs */}
      <instancedMesh args={[undefined, undefined, pegsPositions.length]} position={[0,-0.5,0]}>
         <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
         <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
         {pegsPositions.map((pos, i) => (
            <mesh key={`peg-${i}`} position={pos} rotation={[Math.PI/2, 0, 0]} />
         ))}
      </instancedMesh>

      {/* Instanced Bouncing Balls */}
      <instancedMesh ref={ballMeshRef} args={[undefined, undefined, totalBalls]} position={[0,-0.5,0]}>
         <sphereGeometry args={[0.05, quality === 'high' ? 16 : 8, quality === 'high' ? 16 : 8]} />
         <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.6} emissive="#0284c7" emissiveIntensity={0.5} />
      </instancedMesh>

      {/* Instanced Bar Charts (Histogram) */}
      <instancedMesh ref={barsRef} args={[undefined, undefined, R+1]} position={[0,-0.5,0]}>
         <boxGeometry args={[0.4, 1, 0.1]} />
         <meshStandardMaterial roughness={0.5} opacity={0.8} transparent />
      </instancedMesh>

      {/* 3D Bell Curve Overlay */}
      <group position={[0,-0.5,0]}>
         <Line points={curvePoints} color="#f43f5e" lineWidth={4} />
      </group>

      <OrbitControls makeDefault enablePan target={[0, -0.5, 0]} minDistance={5} maxDistance={15} />

      {/* Control Panel UI */}
      {showPortal && typeof document !== 'undefined' && (
        <Html>
          {createPortal(
            <div style={{
              position: 'fixed',
              top: `${panelPos.y}px`, left: `${panelPos.x}px`,
              transform: `scale(${panelScale})`, transformOrigin: 'top left',
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px',
              color: 'white', fontFamily: 'system-ui', direction: 'rtl',
              zIndex: 100000, boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: '380px', pointerEvents: 'auto'
            }}>
              <div 
                onPointerDown={handlePointerDownDrag} onPointerMove={handlePointerMoveDrag} onPointerUp={handlePointerUpDrag} onPointerCancel={handlePointerUpDrag}
                style={{ cursor: isDragging ? 'grabbing' : 'grab', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '16px 16px 0 0', margin: '-20px -20px 16px -20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setPanelScale(s => Math.min(s + 0.1, 2))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px' }}>+</button>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setPanelScale(s => Math.max(s - 0.1, 0.5))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px' }}>-</button>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>☰ اسحب للتحريك</span>
              </div>

              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#60a5fa' }}>📊 لوحة جالتون (الإحصاء)</h2>

              {/* Hand Tracking AR Section */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${isShaking ? '#f43f5e' : 'rgba(255,255,255,0.05)'}`, marginBottom: '16px', transition: 'border-color 0.2s' }}>
                 <div style={{ position: 'relative', width: '100%', height: isActive ? '120px' : '40px', transition: 'height 0.3s' }}>
                   <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isActive ? 1 : 0 }} />
                   {!isActive && (
                     <button onClick={startTracking} style={{ width: '100%', height: '100%', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                       {isLoading ? '⏳ يتم تشغيل الكاميرا...' : '🖐️ تفعيل تحدي الهز باليد (AR)'}
                     </button>
                   )}
                   {isActive && (
                     <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', width: '90%', textAlign: 'center' }}>
                       <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: isShaking ? '#f43f5e' : '#10b981' }}>{isShaking ? 'عاصفة إحصائية! 🌪️' : 'هز معصمك بقوة لإعادة التجربة 👋'}</p>
                     </div>
                   )}
                 </div>
              </div>

               {/* Toggles and Sliders */}
               <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                     <label style={{ fontSize: '14px', color: '#cbd5e1' }}>جودة المحاكاة ({quality})</label>
                     <select value={quality} onChange={e => setQuality(e.target.value as Quality)} style={{ background: '#1e293b', color: 'white', border: '1px solid #475569', borderRadius: '4px', padding: '2px 8px' }}>
                       <option value="low">Low (100 Balls)</option>
                       <option value="medium">Medium (300 Balls)</option>
                       <option value="high">High (600 Balls)</option>
                     </select>
                  </div>

                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                     نسبة الاحتمالية (Bias: {Math.round(bias * 100)}% لليمين)
                  </label>
                  <input type="range" min="0.1" max="0.9" step="0.05" value={bias} onChange={e => setBias(parseFloat(e.target.value))} style={{ width: '100%' }} />
                  
                  <label style={{ display: 'block', margin: '16px 0 8px 0', fontSize: '14px', color: '#cbd5e1' }}>
                     سرعة المحاكاة ({simSpeed}x)
                  </label>
                  <input type="range" min="0.5" max="3" step="0.5" value={simSpeed} onChange={e => setSimSpeed(parseFloat(e.target.value))} style={{ width: '100%' }} />
               </div>

              {/* Data Table */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px' }}>
                <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>إجمالي الكرات ($N$)</td>
                      <td style={{ padding: '8px', fontSize: '18px', fontWeight: 'bold', color: '#60a5fa' }}>{liveStats.count} / {totalBalls}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>المتوسط الحسابي ($\mu$)</td>
                      <td style={{ padding: '8px', fontSize: '18px', fontWeight: 'bold', color: '#34d399' }}>{liveStats.mean.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px', color: '#94a3b8' }}>الانحراف المعياري ($\sigma$)</td>
                      <td style={{ padding: '8px', fontSize: '18px', fontWeight: 'bold', color: '#f43f5e' }}>{liveStats.stdDev.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button onClick={() => resetSim(bias)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', marginTop: '16px' }}>
                تفريغ اللوحة 🔄
              </button>

            </div>,
            document.body
          )}
        </Html>
      )}
    </>
  );
};

export default StatisticsProbability3D;
