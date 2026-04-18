import { Suspense, useRef, useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Phase = "loading" | "hero" | "options";
type RobotPose = "idle" | "wave" | "salute" | "kiss";

// ─── AMBIENT PARTICLES ───
const AmbientParticles = () => {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 600;
  const positions = useMemo(() => {
    const a = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      a[i*3]=(Math.random()-0.5)*30;
      a[i*3+1]=(Math.random()-0.5)*20;
      a[i*3+2]=(Math.random()-0.5)*20;
    }
    return a;
  }, []);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.012; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={COUNT} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a78bfa" transparent opacity={0.45} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// ─── PROCEDURAL ROBOT (Ultra Realistic Physics) ───
const MetaRobot = ({ pose, phase }: { pose: RobotPose; phase: Phase }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rArmRef = useRef<THREE.Group>(null);
  const rForeRef = useRef<THREE.Group>(null);
  const lArmRef = useRef<THREE.Group>(null);
  const lForeRef = useRef<THREE.Group>(null);

  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color:"#c0cdd8", metalness:0.55, roughness:0.25, clearcoat:1, clearcoatRoughness:0.1 }), []);
  const accentMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color:"#a78bfa", metalness:0.6, roughness:0.15, emissive:new THREE.Color("#7c3aed"), emissiveIntensity:0.5, clearcoat:1 }), []);
  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color:"#2a2040", metalness:0.7, roughness:0.3 }), []);

  const getPose = (p: RobotPose) => {
    // التلويح للترحيب في البداية
    if (p === "wave") return { rA:{x:-2.8,z:-0.3}, rF:{x:-0.5}, lA:{x:0.1,z:0.15}, lF:{x:-0.15}, h:{x:-0.05,y:0.2} };
    // التحية العسكرية بدقة أكبر (اليد على الجبهة)
    if (p === "salute") return { rA:{x:-0.8,z:-1.5}, rF:{x:-2.4}, lA:{x:0.1,z:0.15}, lF:{x:-0.15}, h:{x:-0.1,y:0} };
    // لفتة راقية جدا (اليد على الصدر باحترام) بدل القبلة لتناسب المظهر الجديد الفخم
    if (p === "kiss") return { rA:{x:-1.0,z:0.8}, rF:{x:-2.4}, lA:{x:0.1,z:0.15}, lF:{x:-0.15}, h:{x:0.3,y:0} }; 
    // وضع الخمول
    return { rA:{x:0.05,z:-0.15}, rF:{x:-0.1}, lA:{x:0.05,z:0.15}, lF:{x:-0.1}, h:{x:0,y:0} };
  };

  const target = useRef(getPose("idle"));
  const targetY = useRef(-5);
  useEffect(() => { target.current = getPose(pose); }, [pose]);
  
  useEffect(() => {
    // إخفاء الرأس تماماً في البداية وإنزاله للأسفل جداً
    if (phase === "loading") targetY.current = -12;
    // تعديل موضع الروبوت ليكون في منتصف الشاشة تقريباً وتفادي اختفاء رأسه
    else if (phase === "hero") targetY.current = -1.5;
    // إنزال الروبوت قليلاً أثناء عرض الخيارات لترك مساحة للشاشة
    else targetY.current = -2.0; 
  }, [phase]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!groupRef.current) return;
    
    // انسيابية التحرك باستخدام الفيزياء الحية (Physics Damping) ليكون واقعياً 100%
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetY.current + Math.sin(t * 1.5) * 0.03, // تنفس هادئ جداً لا يزعج العين وتأثير طفو خفيف
      4, delta
    );

    const T = target.current;
    
    // حركة طبيعية للرأس (تنفس واهتزاز خفيف كأنه ينظر حوله ببطء)
    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, T.h.x + Math.sin(t * 1.5) * 0.03, 5, delta);
      headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, T.h.y + Math.sin(t * 0.8) * 0.03, 5, delta);
    }

    // الذراع الأيمن (تفاعل التحية والقبلة)
    if (rArmRef.current && rForeRef.current) {
      rArmRef.current.rotation.x = THREE.MathUtils.damp(rArmRef.current.rotation.x, T.rA.x, 8, delta);
      
      let targetZ = T.rA.z;
      let targetFX = T.rF.x;
      
      if (pose === "wave") {
        targetZ += Math.sin(t * 10) * 0.3; 
        targetFX += Math.sin(t * 10 + 1) * 0.2; 
      } else if (pose === "salute") {
        targetFX += Math.sin(t * 2) * 0.02;
      } else if (pose === "kiss") {
        targetZ += Math.sin(t * 4) * 0.05;
      }

      rArmRef.current.rotation.z = THREE.MathUtils.damp(rArmRef.current.rotation.z, targetZ, 8, delta);
      rForeRef.current.rotation.x = THREE.MathUtils.damp(rForeRef.current.rotation.x, targetFX, 8, delta);
    }

    // الذراع الأيسر (تفاصيل حية - اهتزاز خفيف طوال الوقت تعبيرا عن التنفس الطبيعي)
    if (lArmRef.current && lForeRef.current) {
      lArmRef.current.rotation.x = THREE.MathUtils.damp(lArmRef.current.rotation.x, T.lA.x + Math.sin(t * 2) * 0.05, 4, delta);
      lArmRef.current.rotation.z = THREE.MathUtils.damp(lArmRef.current.rotation.z, T.lA.z, 4, delta);
      lForeRef.current.rotation.x = THREE.MathUtils.damp(lForeRef.current.rotation.x, T.lF.x, 4, delta);
    }
  });

  return (
    // تصغير الحجم (Scale) إلى 1.1 ليكون الرأس والجسم واضحان بالكامل في الشاشة
    <group ref={groupRef} position={[0, -5, 0]} scale={1.1}>
      {/* Head */}
      <group ref={headRef} position={[0, 2.0, 0]}>
        <mesh material={bodyMat}><sphereGeometry args={[0.4, 32, 32]} /></mesh>
        <mesh position={[0, 0.05, 0.32]} material={accentMat}><boxGeometry args={[0.48, 0.12, 0.12]} /></mesh>
        <pointLight position={[0, 0.05, 0.4]} color="#7c3aed" intensity={0.5} distance={2} />
      </group>
      {/* Neck */}
      <mesh position={[0, 1.65, 0]} material={darkMat}><cylinderGeometry args={[0.1, 0.14, 0.2, 16]} /></mesh>
      {/* Torso */}
      <mesh position={[0, 0.95, 0]} material={bodyMat}><boxGeometry args={[1.1, 1.3, 0.55]} /></mesh>
      <mesh position={[0, 1.1, 0.3]} material={accentMat}><boxGeometry args={[0.7, 0.5, 0.04]} /></mesh>
      <mesh position={[0, 0.7, 0.3]} material={darkMat}><boxGeometry args={[0.8, 0.05, 0.04]} /></mesh>
      {/* Shoulder caps */}
      <mesh position={[-0.65, 1.45, 0]} material={bodyMat}><sphereGeometry args={[0.16, 16, 16]} /></mesh>
      <mesh position={[0.65, 1.45, 0]} material={bodyMat}><sphereGeometry args={[0.16, 16, 16]} /></mesh>
      {/* Right Arm */}
      <group ref={rArmRef} position={[-0.7, 1.4, 0]}>
        <mesh position={[0, -0.35, 0]} material={bodyMat}><capsuleGeometry args={[0.1, 0.4, 8, 16]} /></mesh>
        <mesh position={[0, -0.65, 0]} material={darkMat}><sphereGeometry args={[0.1, 12, 12]} /></mesh>
        <group ref={rForeRef} position={[0, -0.65, 0]}>
          <mesh position={[0, -0.3, 0]} material={bodyMat}><capsuleGeometry args={[0.085, 0.35, 8, 16]} /></mesh>
          <mesh position={[0, -0.6, 0]} material={bodyMat}><sphereGeometry args={[0.12, 12, 12]} /></mesh>
          <mesh position={[0.04, -0.72, 0.03]} material={bodyMat}><capsuleGeometry args={[0.025, 0.07, 4, 8]} /></mesh>
          <mesh position={[-0.04, -0.72, 0.03]} material={bodyMat}><capsuleGeometry args={[0.025, 0.07, 4, 8]} /></mesh>
          <mesh position={[0, -0.72, -0.02]} material={bodyMat}><capsuleGeometry args={[0.025, 0.06, 4, 8]} /></mesh>
        </group>
      </group>
      {/* Left Arm */}
      <group ref={lArmRef} position={[0.7, 1.4, 0]}>
        <mesh position={[0, -0.35, 0]} material={bodyMat}><capsuleGeometry args={[0.1, 0.4, 8, 16]} /></mesh>
        <mesh position={[0, -0.65, 0]} material={darkMat}><sphereGeometry args={[0.1, 12, 12]} /></mesh>
        <group ref={lForeRef} position={[0, -0.65, 0]}>
          <mesh position={[0, -0.3, 0]} material={bodyMat}><capsuleGeometry args={[0.085, 0.35, 8, 16]} /></mesh>
          <mesh position={[0, -0.6, 0]} material={bodyMat}><sphereGeometry args={[0.12, 12, 12]} /></mesh>
        </group>
      </group>
      {/* Waist */}
      <mesh position={[0, 0.2, 0]} material={darkMat}><boxGeometry args={[0.85, 0.25, 0.45]} /></mesh>
    </group>
  );
};

// ─── 3D SCENE ───
const LandingScene = ({ robotPose, phase }: { robotPose: RobotPose; phase: Phase }) => (
  <>
    {/* تم إزالة الخلفية الصلبة لكي تظهر تدرجات ألوان الـ CSS الرائعة التي يطلبها المستخدم */}
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
    <directionalLight position={[-5, -2, -5]} intensity={2.0} color="#60a5fa" />
    <spotLight position={[-3, 2, 4]} intensity={2} color="#c084fc" angle={0.5} penumbra={1} />
    <AmbientParticles />
    <MetaRobot pose={robotPose} phase={phase} />
  </>
);

// ═══════ MAIN HOMEPAGE ═══════
export function HomePage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [robotPose, setRobotPose] = useState<RobotPose>("idle");

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("hero");
      setRobotPose("wave"); // يلوح فور ظهوره
      setTimeout(() => setRobotPose("idle"), 2500); // يتوقف عن التلويح بعد ثانيتين ونصف
    }, 3200);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    setRobotPose("salute"); // يقوم بالتحية كإشارة انطلاق
    setTimeout(() => { 
      setPhase("options"); 
      setRobotPose("idle"); 
    }, 1500);
  };

  const handleOptionHover = (opt: string | null) => {
    if (phase !== "options") return;
    if (opt === "3d") setRobotPose("kiss");
    else if (opt === "teacher") setRobotPose("salute");
    else setRobotPose("idle");
  };

  return (
    <div className="ml-landing">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        className="ml-canvas"
      >
        <Suspense fallback={null}>
          <LandingScene robotPose={robotPose} phase={phase} />
        </Suspense>
      </Canvas>

      {/* ── LOADING PHASE ── */}
      <div className={`ml-phase ml-loading ${phase === "loading" ? "active" : ""}`}>
        <img src="/logo.png" className="ml-logo-dynamic" alt="MetaLearning Holographic Logo" />
      </div>

      {/* ── HERO PHASE ── */}
      <div className={`ml-phase ml-hero ${phase === "hero" ? "active" : ""}`}>
        <div className="ml-hero-content">
          <h1 className="ml-hero-title">
            <span className="ml-t-meta">Meta</span>
            <span className="ml-t-learning">Learning</span>
          </h1>
          <p className="ml-hero-desc">
            Dive into immersive 3D education. Explore interactive worlds and generate custom lessons powered by advanced AI.
          </p>
          <button className="ml-start-btn" onClick={handleStart}>
            Let's begin
          </button>
        </div>
      </div>

      {/* ── OPTIONS PHASE ── */}
      <div className={`ml-phase ml-options ${phase === "options" ? "active" : ""}`}>
        <div className="ml-options-header">
          <h2 className="ml-options-title">MetaLearning</h2>
          <p className="ml-options-sub">Supported by TunEdu AI</p>
        </div>
        <div className="ml-options-grid">
          <Link
            to="/teacher/create"
            className="ml-option-card"
            onMouseEnter={() => handleOptionHover("teacher")}
            onMouseLeave={() => handleOptionHover(null)}
          >
            <h3>Teacher Portal</h3>
            <p>Create interactive 3D lessons effortlessly. Advanced tools for educators to design immersive learning experiences.</p>
            <span className="ml-option-link">Start Designing →</span>
          </Link>
          <Link
            to="/experience/hub"
            className="ml-option-card"
            onMouseEnter={() => handleOptionHover("3d")}
            onMouseLeave={() => handleOptionHover(null)}
          >
            <h3>AI 3D Lab</h3>
            <p>Access our advanced AI Hub. Transform 2D images or write prompts to generate high-fidelity 3D models instantly.</p>
            <span className="ml-option-link">Enter Lab →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
