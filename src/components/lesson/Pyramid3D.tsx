import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Html, Float, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Eye, Clock, Unlock, Zap, ShieldAlert, Navigation } from "lucide-react";

/**
 * أهرامات الجيزة - تجربة الخيال العلمي التعليمية للمستقبل (MetaLearning OS)
 */
export function Pyramid3D() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Interactive States
  const [xrayMode, setXrayMode] = useState(false);
  const [timeEra, setTimeEra] = useState<number>(0); // 0 = الحاضر (متآكل), 1 = 4500 ق.م (أبيض مشع)
  const [riddleSolved, setRiddleSolved] = useState(false);
  const [starHovered, setStarHovered] = useState(false);
  
  // Interpolation targeting for smooth transitions
  const [scanEffect, setScanEffect] = useState(0); 
  const extMatRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    document.body.style.cursor = starHovered ? "pointer" : "auto";
  }, [starHovered]);

  useFrame((state, delta) => {
    // دوران بطيء للإلهام وتوضيح الأبعاد (يتوقف عند التفاعل الدقيق)
    if (groupRef.current && !xrayMode && !starHovered) {
      groupRef.current.rotation.y += delta * 0.05;
    } else if (groupRef.current && xrayMode) {
      // دوران أبطأ جداً في وضع الأشعة السينية للتركيز
      groupRef.current.rotation.y += delta * 0.01;
    }

    // تأثير دخول وخروج الأشعة السينية (Smooth Lerp)
    setScanEffect(THREE.MathUtils.lerp(scanEffect, xrayMode ? 1 : 0, 0.05));

    // تحديث خصائص مادة الهرم الخارجي لدمج تأثير الزمن والأشعة السينية
    if (extMatRef.current) {
      // 0 = Desert eroded sand color, 1 = Polished bright limestone
      const presentColor = new THREE.Color("#d4a843"); // لون رملي
      const pastColor = new THREE.Color("#f8fafc"); // الجير الأبيض المشع
      
      extMatRef.current.color.lerpColors(presentColor, pastColor, timeEra);
      
      // التغيير من خشن إلى أملس وعاكس
      extMatRef.current.roughness = THREE.MathUtils.lerp(0.9, 0.1, timeEra);
      extMatRef.current.metalness = THREE.MathUtils.lerp(0.1, 0.6, timeEra);
      extMatRef.current.clearcoat = THREE.MathUtils.lerp(0.0, 1.0, timeEra);

      // دمج شفافية الـ X-Ray
      if (scanEffect > 0.01) {
        extMatRef.current.transparent = true;
        // مزيج من الشفافية حسب الزمن والـ XRay
        extMatRef.current.opacity = THREE.MathUtils.lerp(1, 0.25 + (timeEra * 0.15), scanEffect);
        extMatRef.current.wireframe = scanEffect > 0.8 && timeEra < 0.5; // شكل شبكي مستقبلي عند الحاضر فقط
      } else {
        extMatRef.current.transparent = false;
        extMatRef.current.opacity = 1;
        extMatRef.current.wireframe = false;
      }
    }
  });

  // الهندسة الأساسية
  const pyramidGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(2.4, 2.8, 4, 32); // 32 قطاع رأسي لشبكة سلكية ممتازة
    geo.rotateY(Math.PI / 4);
    return geo;
  }, []);

  const capstoneGeo = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.35, 0.4, 4, 1);
    geo.rotateY(Math.PI / 4);
    return geo;
  }, []);

  return (
    <>
      {/* إضاءة كونية غامضة */}
      <Environment preset="night" />
      <Stars radius={60} depth={20} count={1500} factor={4} saturation={1} fade speed={1} />
      
      <group ref={groupRef} position={[0, -0.5, 0]}>
        
        {/* ═══ واجهات تحكم هولوغرامية (يسار الممر) ═══ */}
        <Html position={[-3.5, 1.5, 0]} transform className="sci-fi-riddle">
          <div style={{ background: 'rgba(10, 20, 30, 0.85)', backdropFilter: 'blur(8px)', borderLeft: '4px solid #38bdf8', padding: '15px', color: '#fff', width: '280px', pointerEvents: 'none', borderRadius: '0 8px 8px 0', borderTop: '1px solid rgba(56, 189, 248, 0.3)', borderRight: '1px solid rgba(56, 189, 248, 0.3)', borderBottom: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <h4 style={{ margin: '0 0 8px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', textShadow: '0 0 10px rgba(56, 189, 248, 0.6)' }}>
              <Zap size={18}/> لغز أوريون المعماري
            </h4>
            <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#bae6fd' }}>
              "أنا مسارٌ لا تسير فيه أقدام البشر، أربط بين ظلام الغرفة الملكية وأعماق الفضاء.. تتبع زاويتي المائلة (باستخدام الرؤية السينية) لتعرف اسم النجم الذي أستهدفه."
            </p>
            {riddleSolved && (
              <div style={{ marginTop: '12px', color: '#4ade80', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', animation: 'pulse 2s infinite' }}>
                <Unlock size={18} /> تم الربط مع نجم أوريون بنجاح!
              </div>
            )}
            {!riddleSolved && xrayMode && (
               <div style={{ marginTop: '12px', color: '#fcd34d', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <Navigation size={14} /> ابحث عن النجم المضيء واضغط عليه!
               </div>
            )}
          </div>
        </Html>

        {/* ═══ واجهات تحكم هولوغرامية (يمين الممر) ═══ */}
        <Html position={[3.5, 1.2, 0]} transform className="sci-fi-panel">
          <div style={{ background: 'rgba(15, 15, 25, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid #a855f7', padding: '15px', color: '#fff', width: '260px', borderRadius: '8px', pointerEvents: 'auto', boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)' }}>
            <h3 style={{ margin: '0 0 12px', color: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px' }}>
              <Clock size={18} /> محرك الزمن التعلمي
            </h3>
            <input 
              type="range" min="0" max="1" step="0.01" 
              value={timeEra} onChange={(e) => setTimeEra(parseFloat(e.target.value))} 
              style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7', height: '4px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '8px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span>اليوم (متآكل)</span>
              <span style={{ color: timeEra > 0.8 ? '#fcd34d' : '' }}>4500 ق.م (مكتمل)</span>
            </div>

            <hr style={{ borderColor: 'rgba(168,85,247,0.3)', margin: '15px 0' }} />

            <button 
              onClick={() => setXrayMode(!xrayMode)}
              style={{ width: '100%', padding: '10px', background: xrayMode ? 'rgba(168, 85, 247, 0.3)' : 'transparent', border: '1px solid #a855f7', color: '#fff', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.3s', fontWeight: 'bold' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              {xrayMode ? <ShieldAlert size={18} color="#f87171" /> : <Eye size={18} />}
              {xrayMode ? 'إيقاف الرؤية السينية' : 'تفعيل الرؤية السينية (X-Ray)'}
            </button>
          </div>
        </Html>


        {/* ═══ الهرم الخارجي ═══ */}
        <mesh geometry={pyramidGeo} position={[0, 1.4, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial ref={extMatRef} envMapIntensity={2} />
        </mesh>

        {/* ═══ الهريم الذهبي المفقود (يظهر في الزمن الماضي) ═══ */}
        <Float speed={timeEra > 0.8 ? 2 : 0} floatIntensity={timeEra > 0.8 ? 0.2 : 0}>
          <mesh geometry={capstoneGeo} position={[0, 2.82, 0]} castShadow>
            <meshPhysicalMaterial 
              color="#fbbf24" 
              metalness={1} 
              roughness={0.1} 
              envMapIntensity={3}
              transparent
              opacity={Math.pow(timeEra, 3)} // يظهر تدريجياً في آخر مراحل شريط الزمن
            />
          </mesh>
        </Float>

        {/* ═══ قاعدة العرض المستقبلية ═══ */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <cylinderGeometry args={[3.2, 3.4, 0.1, 64]} />
          <meshPhysicalMaterial color="#0f172a" metalness={0.8} roughness={0.2} clearcoat={1} envMapIntensity={1} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[2.5, 3.1, 64]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        {/* شبكة طاقة أسفل القاعدة */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[2.8, 64]} />
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.15} />
        </mesh>

        {/* ═══ الغرف والممرات الداخلية (Röntgen / X-Ray Mode) ═══ */}
        {scanEffect > 0.1 && (
          <group>
            {/* غرفة الملك */}
            <mesh position={[0, 0.8, 0.1]} scale={scanEffect}>
              <boxGeometry args={[0.4, 0.3, 0.5]} />
              <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={2} />
            </mesh>
            
            {/* البهو العظيم (Grand Gallery) */}
            <mesh position={[0, 0.2, 0.8]} rotation={[-Math.PI / 6, 0, 0]} scale={scanEffect}>
              <boxGeometry args={[0.15, 1.4, 0.2]} />
              <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1} transparent opacity={0.8} />
            </mesh>

            {/* الممر الهابط */}
            <mesh position={[0, -0.1, 1.6]} rotation={[Math.PI / 8, 0, 0]} scale={scanEffect}>
              <cylinderGeometry args={[0.04, 0.04, 1.5]} />
              <meshStandardMaterial color="#fdba74" emissive="#fb923c" emissiveIntensity={1} transparent opacity={0.5} />
            </mesh>

            {/* قناة التهوية النجمية (The Air Shaft pointing to Orion) */}
            <mesh position={[0, 1.6, -0.9]} rotation={[Math.PI / 4, 0, 0]} scale={scanEffect}>
              <cylinderGeometry args={[0.02, 0.02, 2.5]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2} transparent opacity={0.9} />
            </mesh>

            {/* نقطة النجم التفاعلية (Orion) */}
            <group position={[0, 2.7, -2.0]}>
              {/* شرارة طاقة حول النجم */}
              <Sparkles count={20} scale={0.5} size={2} color={riddleSolved ? "#4ade80" : "#38bdf8"} speed={2} opacity={scanEffect} />
              
              <mesh 
                onClick={() => setRiddleSolved(true)}
                onPointerOver={() => setStarHovered(true)}
                onPointerOut={() => setStarHovered(false)}
                scale={riddleSolved ? 1.5 : (1 + Math.sin(Date.now() * 0.005) * 0.2)} // نبضان حي
              >
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial 
                  color={riddleSolved ? "#4ade80" : "#ffffff"} 
                  emissive={riddleSolved ? "#22c55e" : "#0284c7"} 
                  emissiveIntensity={riddleSolved ? 4 : 2} 
                />
              </mesh>
              
              <Html position={[0.2, 0.2, 0]} style={{ opacity: scanEffect }}>
                <div style={{ 
                  color: riddleSolved ? '#4ade80' : '#38bdf8', 
                  fontWeight: 'bold', 
                  pointerEvents: 'none', 
                  background: 'rgba(0,0,0,0.6)', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  border: `1px solid ${riddleSolved ? '#4ade80' : '#38bdf8'}`,
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(4px)'
                }}>
                  {riddleSolved ? 'أوريون (Orion) مُتصل' : 'هدف مجهول'}
                </div>
              </Html>
            </group>
          </group>
        )}

        {/* ═══ إضاءة مسرحية درامية ═══ */}
        <spotLight position={[5, 6, 4]} angle={0.5} penumbra={0.8} intensity={2} color="#f8fafc" castShadow />
        <spotLight position={[-4, 3, -4]} angle={0.6} penumbra={0.9} intensity={1} color="#a855f7" />
        <pointLight position={[0, -1, 0]} intensity={timeEra * 2} color="#38bdf8" />

      </group>

      {/* ظلال تلامسية تعطي عمق */}
      <ContactShadows position={[0, -0.6, 0]} opacity={0.8} scale={12} blur={3} far={4} color="#000000" />
    </>
  );
}
