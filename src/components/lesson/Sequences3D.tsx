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
import { useMediaPipe } from "../../hooks/useMediaPipe";

// --- Utilities ---
const formatNum = (num: number) => {
    if (Math.abs(num) > 100_000_000) return num.toExponential(2);
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

// --- Animated Bar Component ---
interface AnimatedBarProps {
  index: number;
  val: number;
  sumPrevious: number;
  scaleY: number;
  isSumMode: boolean;
  type: 'arithmetic' | 'geometric';
  totalN: number;
  isHovered: boolean;
  setHovered: (idx: number | null) => void;
}

const AnimatedBar = ({ index, val, sumPrevious, scaleY, isSumMode, type, totalN, isHovered, setHovered }: AnimatedBarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const hasHitRef = useRef(false);
  const currentEmissive = useRef(0.2);

  const startX = -((totalN - 1) * 1.5) / 2;
  const targetX = isSumMode ? 0 : startX + index * 1.5;
  const targetBottom = isSumMode ? sumPrevious * scaleY : 0;
  const trueTargetHeight = val * scaleY;
  const trueTargetY = targetBottom + trueTargetHeight / 2;

  // Set hues based on type and index. Arithmetic is Blue tones, Geometric is Orange/Red tones.
  const baseHue = type === 'arithmetic' ? 210 : 15;
  const colorStr = `hsl(${baseHue}, 100%, ${70 - (index/totalN)*30}%)`;
  const color = useMemo(() => new THREE.Color(colorStr), [colorStr]);

  useFrame((state, delta) => {
    const m = meshRef.current;
    const mat = matRef.current;
    if (!m || !mat) return;

    m.position.lerp(new THREE.Vector3(targetX, trueTargetY, 0), delta * 5);
    m.scale.y = THREE.MathUtils.lerp(m.scale.y, Math.max(0.001, trueTargetHeight), delta * 5);

    // Collision Flash Logic
    const dist = m.position.distanceTo(new THREE.Vector3(targetX, trueTargetY, 0));
    
    if (dist > 0.5) hasHitRef.current = false;
    if (dist < 0.1 && !hasHitRef.current && isSumMode) {
         hasHitRef.current = true;
         currentEmissive.current = 2.5; // PING FLASH!
    }

    // Decay the flash smoothly
    currentEmissive.current = THREE.MathUtils.lerp(currentEmissive.current, 0.3, delta * 4);
    
    // Highlight if hovered
    mat.emissiveIntensity = isHovered ? 1.5 : currentEmissive.current;
    
    // Animate outline/colors if hovered
    const tColor = isHovered ? new THREE.Color("white") : color;
    mat.color.lerp(tColor, delta * 10);
    mat.emissive.lerp(tColor, delta * 10);
  });

  return (
    <group>
      <mesh 
         ref={meshRef} 
         onPointerOver={(e) => { e.stopPropagation(); setHovered(index); }}
         onPointerOut={() => setHovered(null)}
         castShadow
      >
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshStandardMaterial ref={matRef} color={color} emissive={color} transparent opacity={0.9} roughness={0.2} metalness={0.5} />
      </mesh>
      
      {/* Floating Tooltip specific to this bar */}
      {isHovered && !isSumMode && (
         <Billboard position={[targetX, trueTargetY + trueTargetHeight/2 + 0.5, 0]}>
           <Text fontSize={0.6} color="white" outlineWidth={0.05} outlineColor="black">
              U_{index} = {formatNum(val)}
           </Text>
         </Billboard>
      )}
    </group>
  );
};

// --- MAIN SEQUENCES LAB COMPONENT ---
export const Sequences3D = () => {
  const [type, setType] = useState<'arithmetic' | 'geometric'>('arithmetic');
  const [u0, setU0] = useState(1);
  const [base, setBase] = useState(2);
  const [n, setN] = useState(10);
  const [isSumMode, setIsSumMode] = useState(false);
  
  const [hoveredIndex, setHoveredIndex] = useState<number|null>(null);

  // AR Settings
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, startTracking, isActive, isLoading } = useMediaPipe({ enabled: false, videoRef });

  useFrame(() => {
     if (isActive && handData && !isSumMode) {
        // Map Y hand position to Base parameter. 
        // y: 0.1(top) -> 0.9(bottom)
        const reversedY = 1 - Math.max(0, Math.min(1, handData.palmPosition.y));
        // Arithmetic mapping: [1..20], Geometric mapping: [1..4]
        const targetBase = type === 'arithmetic' 
             ? 1 + reversedY * 20 
             : 1 + reversedY * 3;
        
        // Smoothing
        setBase(prev => {
            const diff = targetBase - prev;
            if (Math.abs(diff) < 0.05) return prev;
            return prev + diff * 0.1;
        });
     }
  });

  // Calculate Data
  const { sequence, sums, maxVal, totalSum } = useMemo(() => {
      const seq = [];
      const partialSums = [];
      let current = u0;
      let mVal = current;
      let sum = 0;

      for(let i=0; i<n; i++) {
         seq.push(current);
         partialSums.push(sum);
         sum += current;
         if (current > mVal) mVal = current;

         if (type === 'arithmetic') current += base;
         else if (type === 'geometric') current *= base;
      }
      return { sequence: seq, sums: partialSums, maxVal: mVal, totalSum: sum };
  }, [type, u0, base, n]);

  // Global Dynamic Scaling calculation
  // Target max render height is 15. The sum of all elements in sumMode is totalSum.
  // We want the tower or largest element to fit within height=15.
  const targetMaxPhysicalHeight = 15;
  const currentMaxMathDomain = isSumMode ? totalSum : maxVal;
  // If zero, fallback to 1
  const globalScaleY = currentMaxMathDomain === 0 ? 1 : targetMaxPhysicalHeight / currentMaxMathDomain;

  // Formula generation for the central Billboard
  const formulaText = type === 'arithmetic' 
       ? `U\u2099 = ${formatNum(u0)} + n*(${formatNum(base)})` 
       : `U\u2099 = ${formatNum(u0)} \u00D7 (${formatNum(base)})\u207F`;
  const sumFormulaText = type === 'arithmetic'
       ? `S\u2099 = n/2 \u00D7 (U\u2080 + U\u2099) = ${formatNum(totalSum)}`
       : `S\u2099 = U\u2080 \u00D7 (1 - q\u207F) / (1 - q) = ${formatNum(totalSum)}`;

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

  // Sync types switch defaults
  const handleTypeChange = (newType: 'arithmetic' | 'geometric') => {
      setType(newType);
      if (newType === 'arithmetic') setBase(5);
      if (newType === 'geometric') setBase(2);
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[0, 10, 10]} intensity={1.5} castShadow />
      
      {/* Ground Plane */}
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
         <planeGeometry args={[100, 100]} />
         <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <gridHelper args={[100, 100, "#334155", "#1e293b"]} position={[0, 0, 0]} />

      {/* Origin Axis Helper */}
      <axesHelper args={[5]} />

      {/* Sequences Engine Rendering */}
      <group position={[0, 0, 0]}>
         {sequence.map((val, index) => (
             <AnimatedBar 
                key={`bar-${index}-${type}`} // Re-mount if sequence type changes to reset positions cleanly
                index={index}
                val={val}
                sumPrevious={sums[index]}
                scaleY={globalScaleY}
                isSumMode={isSumMode}
                type={type}
                totalN={n}
                isHovered={hoveredIndex === index}
                setHovered={setHoveredIndex}
             />
         ))}
      </group>

      {/* Main Formula Tracker HUD behind the sequence */}
      <Billboard position={[0, targetMaxPhysicalHeight + 3, -10]}>
          <group>
             <mesh position={[0, 0, -0.1]}>
               <planeGeometry args={[20, 3]} />
               <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
             </mesh>
             <Text position={[0, 0.6, 0]} fontSize={1.2} color={type === 'arithmetic' ? "#60a5fa" : "#f43f5e"}>
               {formulaText}
             </Text>
             {isSumMode && (
               <Text position={[0, -0.8, 0]} fontSize={1.2} color="#fbbf24">
                 {sumFormulaText}
               </Text>
             )}
          </group>
      </Billboard>

      {/* Camera Controller: auto zoom out depending on how many bars */}
      <OrbitControls makeDefault enablePan target={[0, 5, 0]} minDistance={10} maxDistance={50} />

      {/* UI Control Panel */}
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
              {/* Drag Handle */}
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

              <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: type === 'arithmetic' ? '#60a5fa' : '#f43f5e' }}>
                 📈 نمو المتتاليات
              </h2>

              {/* Hand Tracking AR Section */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: `1px solid rgba(255,255,255,0.05)`, marginBottom: '16px' }}>
                 <div style={{ position: 'relative', width: '100%', height: isActive ? '120px' : '40px', transition: 'height 0.3s' }}>
                   <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isActive ? 1 : 0 }} />
                   {!isActive && (
                     <button onClick={startTracking} style={{ width: '100%', height: '100%', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                       {isLoading ? '⏳ يتم تشغيل الكاميرا...' : '🖐️ تفاعل باليد لزيادة النمو (AR)'}
                     </button>
                   )}
                   {isActive && (
                     <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', width: '90%', textAlign: 'center' }}>
                       <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>ارفع يدك لأعلى لزيادة سرعة الانفجار 🚀</p>
                     </div>
                   )}
                 </div>
              </div>

               {/* Sequence Type Selector */}
               <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                 <button onClick={() => handleTypeChange('arithmetic')} style={{ flex: 1, padding: '10px', background: type === 'arithmetic' ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>حسابية (الجمع)</button>
                 <button onClick={() => handleTypeChange('geometric')} style={{ flex: 1, padding: '10px', background: type === 'geometric' ? '#ef4444' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>هندسية (الضرب)</button>
               </div>

              {/* Sliders */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                 <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>الحد الأول ($U_0$)</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{u0}</span>
                 </label>
                 <input type="range" min="1" max="50" step="1" value={u0} onChange={e => setU0(parseFloat(e.target.value))} style={{ width: '100%' }} disabled={isSumMode} />
                 
                 <label style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0 8px 0', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>الأساس ({type === 'arithmetic' ? '$r$' : '$q$'})</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{formatNum(base)}</span>
                 </label>
                 <input type="range" min={type === 'arithmetic' ? -10 : 0.1} max={type === 'arithmetic' ? 20 : 5} step={type === 'arithmetic' ? 1 : 0.1} value={base} onChange={e => setBase(parseFloat(e.target.value))} style={{ width: '100%' }} disabled={isSumMode || isActive} />

                 <label style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0 8px 0', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>عدد الحدود ($n$)</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{n} أعمدة</span>
                 </label>
                 <input type="range" min="3" max="25" step="1" value={n} onChange={e => setN(parseInt(e.target.value))} style={{ width: '100%' }} disabled={isSumMode} />
              </div>

              {/* Summation Toggle */}
              <button 
                onClick={() => setIsSumMode(!isSumMode)} 
                style={{ 
                   width: '100%', padding: '14px', 
                   background: isSumMode ? '#fbbf24' : 'rgba(255,255,255,0.1)', 
                   color: isSumMode ? '#000' : 'white', 
                   border: 'none', borderRadius: '8px', 
                   cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', 
                   boxShadow: isSumMode ? '0 0 20px rgba(251, 191, 36, 0.4)' : 'none',
                   transition: 'all 0.3s'
                }}
              >
                {isSumMode ? `إلغاء المجموع | ناطحة السحاب: ${formatNum(totalSum)}` : `حساب التراكم الكلي ($\u03A3 S_n$)`}
              </button>

            </div>,
            document.body
          )}
        </Html>
      )}
    </>
  );
};

export default Sequences3D;
