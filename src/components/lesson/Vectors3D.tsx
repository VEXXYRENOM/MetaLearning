import React, { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  Billboard,
  Text,
  Html,
} from "@react-three/drei";
import { useMediaPipe } from "../../hooks/useMediaPipe";

// === 1. Custom Vector Arrow Component ===
const VectorArrow = ({ position, color, vectorName }: { position: THREE.Vector3, color: string, vectorName: string }) => {
  const meshRef = useRef<THREE.Group>(null);
  const length = position.length();
  
  useFrame(() => {
    if (meshRef.current && length > 0.01) {
      const dir = position.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      meshRef.current.quaternion.copy(quaternion);
    }
  });

  if (length < 0.01) return null;

  const coneHeight = 0.5;
  const clampedConeHeight = Math.min(length, coneHeight);
  const shaftLength = Math.max(0, length - clampedConeHeight);

  return (
    <>
      <group ref={meshRef}>
        {shaftLength > 0 && (
          <mesh position={[0, shaftLength / 2, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, shaftLength, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
          </mesh>
        )}
        <mesh position={[0, shaftLength + clampedConeHeight / 2, 0]} castShadow>
          <coneGeometry args={[0.2, clampedConeHeight, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      
      <Billboard position={position.clone().multiplyScalar(1.1)}>
        <Text fontSize={0.35} color={color} outlineWidth={0.02} outlineColor="#ffffff">
          {vectorName}
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#ffffff" outlineWidth={0.02} outlineColor="#000000">
          {`[${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}]`}
        </Text>
      </Billboard>
    </>
  );
};

// === 2. Interactive Vector Grabber Component ===
const VectorGrabber = ({ v, setV, color, name, isResult }: { v: THREE.Vector3, setV: (nv: THREE.Vector3) => void, color: string, name: string, isResult?: boolean }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  // Sync external state changes (like input fields or HandTracking) to the underlying mesh
  useEffect(() => {
    if (ref.current) {
        ref.current.position.copy(v);
    }
  }, [v]);

  return (
    <>
      <VectorArrow position={v} color={color} vectorName={name} />
      {!isResult && (
        <TransformControls 
            mode="translate" 
            showX showY showZ 
            size={0.6}
            onObjectChange={() => {
               if (ref.current) setV(ref.current.position.clone());
            }}
        >
          <mesh ref={ref} position={v}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.3} depthTest={false} />
          </mesh>
        </TransformControls>
      )}
    </>
  );
};

// === MAIN LAB COMPONENT ===
export const Vectors3D = () => {
  // Vectors State
  const [v1, setV1] = useState(new THREE.Vector3(2, 3, 0));
  const [v2, setV2] = useState(new THREE.Vector3(-3, 1, 0));
  const [showResult, setShowResult] = useState(false);
  const v3 = useMemo(() => v1.clone().add(v2), [v1, v2]);

  // UI Control Panel State
  const [panelPos, setPanelPos] = useState(() => ({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 420 : 500, 
    y: 80 
  }));
  const [panelScale, setPanelScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panelX: 0, panelY: 0 });

  // AR / Hand Tracking State
  const videoRef = useRef<HTMLVideoElement>(null);
  const { handData, startTracking, isActive, isLoading } = useMediaPipe({ enabled: false, videoRef });
  const [arTarget, setArTarget] = useState<'none'|'v1'|'v2'>('none');

  useFrame((state, delta) => {
    if (isActive && handData && arTarget !== 'none') {
        // Map 2D hand coordinates to 3D space (-5 to +5)
        // MediaPipe coords: X=0(left) -> 5, X=1(right) -> -5 (due to mirroring)
        const targetX = -(handData.indexFingerTip.x - 0.5) * 10;
        const targetY = -(handData.indexFingerTip.y - 0.5) * 10;
        
        const target = new THREE.Vector3(targetX, targetY, 0); // Lock Z depth for 2D hand stability
        
        if (arTarget === 'v1') {
            setV1(prev => prev.clone().lerp(target, 12 * delta));
        }
        if (arTarget === 'v2') {
            setV2(prev => prev.clone().lerp(target, 12 * delta));
        }
    }
  });

  // Drag Handlers
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panelX: panelPos.x, panelY: panelPos.y };
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (isDragging) {
      setPanelPos({ x: dragStart.current.panelX + (e.clientX - dragStart.current.x), y: dragStart.current.panelY + (e.clientY - dragStart.current.y) });
    }
  };
  const handlePointerUpDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    if (e.currentTarget.releasePointerCapture) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const [showPortal, setShowPortal] = useState(false);
  useEffect(() => { setShowPortal(true); }, []);

  const handleInputChange = (vName: 'v1'|'v2', axis: 'x'|'y'|'z', val: string) => {
      const num = parseFloat(val);
      if(isNaN(num)) return;
      const setter = vName === 'v1' ? setV1 : setV2;
      const current = vName === 'v1' ? v1 : v2;
      const nv = current.clone();
      nv[axis] = Math.max(-5, Math.min(5, num)); // limit extremes
      setter(nv);
  };

  return (
    <>
      {/* Dynamic Environment */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />

      {/* Coordinate System */}
      <mesh>
         <sphereGeometry args={[0.15, 32, 32]} />
         <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
      </mesh>
      <axesHelper args={[6]} />
      <gridHelper args={[12, 12, "#475569", "#1e293b"]} position={[0, -0.01, 0]} />

      {/* The Interactive Vectors */}
      <VectorGrabber v={v1} setV={setV1} color="#3b82f6" name="V1" />
      <VectorGrabber v={v2} setV={setV2} color="#10b981" name="V2" />

      {/* Vector Algebra Visualization */}
      {showResult && (
        <group>
           <VectorGrabber v={v3} setV={() => {}} color="#f97316" name="V1+V2" isResult={true} />
           
           {/* The Parallelogram Dashed Lines */}
           <lineSegments onUpdate={self => self.computeLineDistances()}>
              <bufferGeometry>
                 <bufferAttribute 
                    attach="attributes-position" 
                    count={4} 
                    array={new Float32Array([
                        v1.x, v1.y, v1.z, v3.x, v3.y, v3.z,
                        v2.x, v2.y, v2.z, v3.x, v3.y, v3.z
                    ])} 
                    itemSize={3} 
                 />
              </bufferGeometry>
              <lineDashedMaterial color="#cbd5e1" dashSize={0.2} gapSize={0.2} transparent opacity={0.6} />
           </lineSegments>
        </group>
      )}

      <OrbitControls makeDefault />

      {/* UI Control Panel Portal */}
      {showPortal && typeof document !== 'undefined' && (
        <Html>
          {createPortal(
            <div style={{
              position: 'fixed',
              top: `${panelPos.y}px`,
              left: `${panelPos.x}px`,
              transform: `scale(${panelScale})`,
              transformOrigin: 'top left',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '16px',
              color: 'white',
              fontFamily: 'system-ui',
              direction: 'rtl',
              zIndex: 100000,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '380px',
              pointerEvents: 'auto'
            }}>
              {/* DRAG HANDLE */}
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
                  margin: '-20px -20px 16px -20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setPanelScale(s => Math.min(s + 0.1, 2))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px' }}>+</button>
                  <button onPointerDown={e => e.stopPropagation()} onClick={() => setPanelScale(s => Math.max(s - 0.1, 0.5))} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', width: '28px', height: '28px' }}>-</button>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8', userSelect: 'none' }}>☰ اسحب للتحريك</span>
              </div>

              <h2 style={{ margin: 0, fontSize: '20px', color: '#60a5fa' }}>↗️ مختبر المتجهات في الفضاء</h2>

              {/* Hand Tracking AR Section */}
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ position: 'relative', width: '100%', height: isActive ? '120px' : '40px', transition: 'height 0.3s' }}>
                   <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', opacity: isActive ? 1 : 0 }} />
                   {!isActive && (
                     <button onClick={startTracking} style={{ width: '100%', height: '100%', background: 'transparent', color: '#10b981', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                       {isLoading ? '⏳ يتم تشغيل الكاميرا...' : '🖐️ تفعيل تحدي التتبع اليدوي (AR)'}
                     </button>
                   )}
                   {isActive && (
                     <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '8px' }}>
                       <button onClick={() => setArTarget('v1')} style={{ background: arTarget === 'v1' ? '#3b82f6' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 12px' }}>V1 (الأزرق)</button>
                       <button onClick={() => setArTarget('v2')} style={{ background: arTarget === 'v2' ? '#10b981' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 12px' }}>V2 (الأخضر)</button>
                       <button onClick={() => setArTarget('none')} style={{ background: arTarget === 'none' ? '#ef4444' : 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 12px' }}>إيقاف</button>
                     </div>
                   )}
                 </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '8px' }}>
                <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '8px' }}>المتجه</th>
                      <th style={{ padding: '8px' }}>X</th>
                      <th style={{ padding: '8px' }}>Y</th>
                      <th style={{ padding: '8px' }}>Z</th>
                      <th style={{ padding: '8px' }}>الطول ||V||</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* V1 Row */}
                    <tr style={{ color: '#60a5fa' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>V1</td>
                      <td><input type="number" step="0.5" value={v1.x.toFixed(1)} onChange={e => handleInputChange('v1', 'x', e.target.value)} style={{ width: '45px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }} /></td>
                      <td><input type="number" step="0.5" value={v1.y.toFixed(1)} onChange={e => handleInputChange('v1', 'y', e.target.value)} style={{ width: '45px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }} /></td>
                      <td><input type="number" step="0.5" value={v1.z.toFixed(1)} onChange={e => handleInputChange('v1', 'z', e.target.value)} style={{ width: '45px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }} /></td>
                      <td style={{ fontWeight: 'bold' }}>{v1.length().toFixed(2)}</td>
                    </tr>
                    {/* V2 Row */}
                    <tr style={{ color: '#34d399' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>V2</td>
                      <td><input type="number" step="0.5" value={v2.x.toFixed(1)} onChange={e => handleInputChange('v2', 'x', e.target.value)} style={{ width: '45px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }} /></td>
                      <td><input type="number" step="0.5" value={v2.y.toFixed(1)} onChange={e => handleInputChange('v2', 'y', e.target.value)} style={{ width: '45px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }} /></td>
                      <td><input type="number" step="0.5" value={v2.z.toFixed(1)} onChange={e => handleInputChange('v2', 'z', e.target.value)} style={{ width: '45px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', textAlign: 'center' }} /></td>
                      <td style={{ fontWeight: 'bold' }}>{v2.length().toFixed(2)}</td>
                    </tr>
                    {/* V3 Row (Result) */}
                    {showResult && (
                      <tr style={{ color: '#fb923c', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>V1+V2</td>
                        <td style={{ padding: '8px' }}>{v3.x.toFixed(1)}</td>
                        <td style={{ padding: '8px' }}>{v3.y.toFixed(1)}</td>
                        <td style={{ padding: '8px' }}>{v3.z.toFixed(1)}</td>
                        <td style={{ fontWeight: 'bold' }}>{v3.length().toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Vector Algebra Button */}
              <button 
                onClick={() => setShowResult(!showResult)} 
                style={{ 
                  padding: '12px', 
                  background: showResult ? '#f97316' : 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '15px',
                  transition: 'background 0.3s'
                }}
              >
                {showResult ? 'إخفاء محصلة الجمع' : 'حساب جمع المتجهات (V1 + V2)'}
              </button>

            </div>,
            document.body
          )}
        </Html>
      )}
    </>
  );
};

export default Vectors3D;
