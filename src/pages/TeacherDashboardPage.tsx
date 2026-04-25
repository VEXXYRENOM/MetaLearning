import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  Atom, Calculator, Book, Globe, Languages, Settings, 
  Star, Palette, FlaskConical, Microscope, Layers, User, 
  ChevronLeft, Search, Copy, Send, LayoutDashboard,
  ImagePlus, Cuboid, BarChart3, Zap, Rocket, Stars, Play
} from "lucide-react";
import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import { Model3DLoader } from "../components/Model3DLoader";

const BeatingHeart3D = lazy(() => import("../components/lesson/BeatingHeart3D").then(m => ({ default: m.BeatingHeart3D })));
const AtomModel3D = lazy(() => import("../components/lesson/AtomModel3D").then(m => ({ default: m.AtomModel3D })));
const SolarSystem3D = lazy(() => import("../components/lesson/SolarSystem3D").then(m => ({ default: m.SolarSystem3D })));
const Pyramid3D = lazy(() => import("../components/lesson/Pyramid3D").then(m => ({ default: m.Pyramid3D })));
const PlatonicSolids3D = lazy(() => import("../components/lesson/PlatonicSolids3D").then(m => ({ default: m.PlatonicSolids3D })));
const AnimalCell3D = lazy(() => import("../components/lesson/AnimalCell3D").then(m => ({ default: m.AnimalCell3D })));
const PlantCell3D = lazy(() => import("../components/lesson/PlantCell3D").then(m => ({ default: m.PlantCell3D })));
const WaterMolecule3D = lazy(() => import("../components/lesson/WaterMolecule3D").then(m => ({ default: m.WaterMolecule3D })));
const DNAHelix3D = lazy(() => import("../components/lesson/DNAHelix3D").then(m => ({ default: m.DNAHelix3D })));
const EarthLayers3D = lazy(() => import("../components/lesson/EarthLayers3D").then(m => ({ default: m.EarthLayers3D })));
const Volcano3D = lazy(() => import("../components/lesson/Volcano3D").then(m => ({ default: m.Volcano3D })));
const WaterCycle3D = lazy(() => import("../components/lesson/WaterCycle3D").then(m => ({ default: m.WaterCycle3D })));
const LungsModel3D = lazy(() => import("../components/lesson/LungsModel3D").then(m => ({ default: m.LungsModel3D })));
const EyeAnatomy3D = lazy(() => import("../components/lesson/EyeAnatomy3D").then(m => ({ default: m.EyeAnatomy3D })));
const FunctionGraph3D = lazy(() => import("../components/lesson/FunctionGraph3D").then(m => ({ default: m.FunctionGraph3D })));
const GeometricVolumes3D = lazy(() => import("../components/lesson/GeometricVolumes3D").then(m => ({ default: m.GeometricVolumes3D })));
const Colosseum3D = lazy(() => import("../components/lesson/Colosseum3D").then(m => ({ default: m.Colosseum3D })));
const CarthageRuins3D = lazy(() => import("../components/lesson/CarthageRuins3D").then(m => ({ default: m.CarthageRuins3D })));
const KairouanMosque3D = lazy(() => import("../components/lesson/KairouanMosque3D").then(m => ({ default: m.KairouanMosque3D })));
const ArabicLetters3D = lazy(() => import("../components/lesson/ArabicLetters3D").then(m => ({ default: m.ArabicLetters3D })));
const VocalAnatomy3D = lazy(() => import("../components/lesson/VocalAnatomy3D").then(m => ({ default: m.VocalAnatomy3D })));
const RoomObjects3D = lazy(() => import("../components/lesson/RoomObjects3D").then(m => ({ default: m.RoomObjects3D })));
const ColorWheel3D = lazy(() => import("../components/lesson/ColorWheel3D").then(m => ({ default: m.ColorWheel3D })));
const Pottery3D = lazy(() => import("../components/lesson/Pottery3D").then(m => ({ default: m.Pottery3D })));
const PaintingFrame3D = lazy(() => import("../components/lesson/PaintingFrame3D").then(m => ({ default: m.PaintingFrame3D })));
const GltfScene = lazy(() => import("../components/lesson/GltfScene").then(m => ({ default: m.GltfScene })));
const ArtifactGltfModel = lazy(() => import("../components/experience/ArtifactGltfModel").then(m => ({ default: m.ArtifactGltfModel })));
const OrthographicProjection3D = lazy(() => import("../components/lesson/OrthographicProjection3D").then(m => ({ default: m.OrthographicProjection3D })));
const Vectors3D = lazy(() => import("../components/lesson/Vectors3D").then(m => ({ default: m.Vectors3D })));
const Transformations3D = lazy(() => import("../components/lesson/Transformations3D").then(m => ({ default: m.Transformations3D })));
const StatisticsProbability3D = lazy(() => import("../components/lesson/StatisticsProbability3D").then(m => ({ default: m.StatisticsProbability3D })));
const Sequences3D = lazy(() => import("../components/lesson/Sequences3D").then(m => ({ default: m.Sequences3D })));
const MathematicalLogic3D = lazy(() => import("../components/lesson/MathematicalLogic3D").then(m => ({ default: m.MathematicalLogic3D })));

import { QRCodeSVG } from "qrcode.react";
import "../teacher.css"; // تنسيق النمط الفاتح المستقل
import { LESSONS } from "../data/lessons"; // لاستيراد النماذج الجاهزة للأستاذ
import { useAuth } from "../contexts/AuthContext";
import { OnboardingWizard } from "../components/OnboardingWizard";
import { showToast } from "../components/Toast";
import { supabase } from "../services/supabaseClient";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function TeacherDashboardPage() {
  const { profile, signOut } = useAuth();
  const [step, setStep] = useState<Step>(0); // 🚀 نبدأ من الـ Hub (Step 0)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [lessonName, setLessonName] = useState<string>("");
  const [autoExplain, setAutoExplain] = useState<boolean>(true);
  const [showWizard, setShowWizard] = useState<boolean>(false);

  useEffect(() => {
    if (profile && profile.onboarding_done === false) {
      setShowWizard(true);
    }
  }, [profile]);

  const isPro = profile?.plan === 'pro';

  const nextStep = () => {
    if (step < 6) setStep((prev: Step) => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (step > 0) setStep((prev: Step) => (prev - 1) as Step);
  };

  return (
    <div className="teacher-layout" dir="ltr">
      {showWizard && (
        <OnboardingWizard role="teacher" onComplete={() => setShowWizard(false)} />
      )}
      {/* 🔹 الشريط الجانبي الثابت */}
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="profile-img">
            <User size={30} color="#cbd5e1" />
          </div>
          <h3>{profile?.full_name || 'Nour'}</h3>
          <p>Teacher {isPro && <span style={{ color: "#a855f7", fontWeight: "bold" }}>(PRO)</span>}</p>
          <button className="btn-logout" onClick={() => signOut()}>Logout</button>
        </div>
        
        <div className="sidebar-tools">
          <Link to="/teacher/create" title="Create Lesson">
            <LayoutDashboard 
              size={22} 
              className={`tool-icon ${step === 0 ? 'active' : ''}`} 
              onClick={() => setStep(0)} 
            />
          </Link>
          <Link to="/teacher/analytics" title="Analytics">
            <BarChart3 size={22} className="tool-icon" />
          </Link>
          <Star size={22} className="tool-icon" />
          <Settings size={22} className="tool-icon" />
        </div>
      </aside>

      {/* 🔹 المحتوى الرئيسي (حسب الخطوة) */}
      <main className="teacher-main">
        <header className="teacher-header">
          {step > 0 && (
            <button onClick={prevStep} className="btn-back">
              <ChevronLeft size={24} /> 
            </button>
          )}
          <h2 className="header-title">Meta Learning Workspace</h2>
          <div className="header-user">
            <span>Welcome, {profile?.full_name || 'Teacher'}</span>
            <div className="user-avatar-small"></div>
          </div>
        </header>

        <div className="teacher-content">
          {/* 🌟 غرفة العمليات المركزية (Teacher Hub) */}
          {step === 0 && (
            <Step0Hub onStartWizard={() => setStep(1)} profile={profile} isPro={isPro} />
          )}

          {step === 1 && (
            <Step1Subject 
              selected={selectedSubject} 
              onSelect={(subj: string) => {
                if (subj !== selectedSubject) {
                  setSelectedSubject(subj);
                  setLessonName(""); // مسح اسم الدرس عند تغيير المادة لتجنب بقاء المجسم السابق
                }
                setTimeout(nextStep, 400); 
              }} 
            />
          )}
          
          {step === 2 && <Step2Level selected={selectedLevel} onSelect={setSelectedLevel} onNext={nextStep} />}
          {step === 3 && <Step3Input selectedSubject={selectedSubject} lessonName={lessonName} onChange={setLessonName} onNext={nextStep} />}
          {step === 4 && <Step4LabPreview lessonName={lessonName} autoExplain={autoExplain} setAutoExplain={setAutoExplain} onNext={nextStep} />}
          {step === 5 && <Step5Review lessonName={lessonName} autoExplain={autoExplain} onNext={nextStep} />}
          {step === 6 && <Step6Success lessonName={lessonName} subject={selectedSubject} profile={profile} isPro={isPro} />}
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------
// 🌟 المكون الجديد: غرفة العمليات (Teacher Hub - Step 0)
// -----------------------------------------------------
function Step0Hub({ onStartWizard, profile, isPro }: { onStartWizard: () => void; profile: any; isPro: boolean; }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const [myLessons, setMyLessons] = useState<any[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [monthlyLessonCount, setMonthlyLessonCount] = useState(0);
  const FREE_LESSON_LIMIT = 5;
  const [analytics, setAnalytics] = useState({
    totalLessons: 0,
    totalStudents: 0,
    totalSessions: 0,
    topSubject: ""
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteLesson(lessonId: string, title: string) {
    const confirmed = window.confirm(
      `Delete lesson "${title}"?\n\nThis will also deactivate any active sessions.`
    );
    if (!confirmed) return;
    setDeletingId(lessonId);
    try {
      await supabase.from('sessions').update({ is_active: false }).eq('lesson_id', lessonId);
      await supabase.from('lessons').delete().eq('id', lessonId);
      setMyLessons(prev => prev.filter(l => l.id !== lessonId));
      showToast({ type: 'success', title: 'Lesson deleted' });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Delete failed', message: err.message });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTogglePublish(lessonId: string, currentPublic: boolean) {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_public: !currentPublic })
        .eq('id', lessonId);
        
      if (error) throw error;
      
      setMyLessons(prev => prev.map(l => 
        l.id === lessonId ? { ...l, is_public: !currentPublic } : l
      ));
      
      showToast({ 
        type: 'success', 
        title: !currentPublic ? 'Lesson Published to World 🌍' : 'Lesson made Private 🔒',
        message: !currentPublic ? 'Anyone can now discover this lesson in the Global Library.' : 'Only your students can access this lesson now.'
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action failed', message: err.message });
    }
  }

  useEffect(() => {
    if (!profile) return;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    supabase
      .from("lessons")
      .select("id, title, subject, model_key, share_code, created_at, is_public")
      .eq("teacher_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setMyLessons(data || []);
        setLoadingMy(false);
      });

    supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', profile.id)
      .gte('created_at', thisMonth.toISOString())
      .then(({ count }) => {
        setMonthlyLessonCount(count || 0);
      });

    async function fetchAnalytics() {
      // Count teacher's total lessons
      const { count: lessonCount } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", profile.id);

      // Count total students across all sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("teacher_id", profile.id);

      let studentCount = 0;
      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        const { count } = await supabase
          .from("student_joins")
          .select("*", { count: "exact", head: true })
          .in("session_id", sessionIds);
        studentCount = count || 0;
      }

      // Get top subject
      const { data: subjectData } = await supabase
        .from("lessons")
        .select("subject")
        .eq("teacher_id", profile.id);

      const subjectCounts: Record<string, number> = {};
      (subjectData || []).forEach(l => {
        subjectCounts[l.subject] = (subjectCounts[l.subject] || 0) + 1;
      });
      const topSubject = Object.entries(subjectCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

      setAnalytics({
        totalLessons: lessonCount || 0,
        totalStudents: studentCount,
        totalSessions: sessions?.length || 0,
        topSubject
      });
    }
    fetchAnalytics();
  }, [profile]);

  return (
    <div className="hub-container">
      <div className="hub-header-meta">
        <h2>Your Workspace 🚀</h2>
        <p>Upload your custom model or browse your library of ready-to-use 3D assets.</p>
      </div>

      {!isPro && (
        <div style={{
          background: "linear-gradient(90deg, rgba(59,130,246,0.1), rgba(168,85,247,0.1))",
          border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px",
          padding: "1.5rem", marginBottom: "2rem", display: "flex", flexWrap: "wrap",
          justifyContent: "space-between", alignItems: "center", gap: "1rem"
        }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={20} color="#a855f7" /> {isArabic ? "قم بالترقية إلى Pro" : t("upgrade.banner", "Upgrade to Pro")}
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.9rem" }}>
              {isArabic ? "افتح إمكانيات لا محدودة للدروس وتحويل الصور إلى ذكاء اصطناعي." : "Unlock unlimited lessons, Image-to-3D AI, and full analytics."}
            </p>
          </div>
          <Link to="/pricing" style={{
            background: "linear-gradient(90deg, #3b82f6, #a855f7)", color: "white",
            padding: "10px 20px", borderRadius: "8px", textDecoration: "none",
            fontWeight: "bold", fontSize: "0.9rem", whiteSpace: "nowrap"
          }}>
            {isArabic ? "ترقية الآن ←" : t("upgrade.cta", "Upgrade Now →")}
          </Link>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        {[
          { label: "Lessons Created", value: analytics.totalLessons, color: "#3b82f6" },
          { label: "Sessions Held",   value: analytics.totalSessions, color: "#a855f7" },
          { label: "Students Reached",value: analytics.totalStudents, color: "#10b981" },
          { label: "Top Subject",     value: analytics.topSubject,    color: "#f59e0b" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "10px", padding: "1rem",
            borderTop: `3px solid ${stat.color}`
          }}>
            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 4px 0" }}>
              {stat.label}
            </p>
            <h3 style={{ color: "white", fontSize: "1.6rem", margin: 0 }}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* GALAXY EXPLORER BANNER */}
      <div 
        onClick={() => window.location.href = '/explore'}
        style={{ 
          marginTop: "1.5rem", marginBottom: "1.5rem", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", 
          padding: "1.5rem 2rem", borderRadius: "16px", border: "1px solid rgba(139, 92, 246, 0.5)", 
          display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
          boxShadow: "0 10px 30px rgba(139, 92, 246, 0.2)", position: "relative", overflow: "hidden",
          transition: "transform 0.2s, box-shadow 0.2s"
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(139, 92, 246, 0.4)"; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(139, 92, 246, 0.2)"; }}
      >
        <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
        <Stars size={80} color="rgba(255,255,255,0.05)" style={{ position: "absolute", top: 10, left: 10, pointerEvents: "none" }} />

        <div style={{ zIndex: 1 }}>
          <h2 style={{ color: "white", margin: "0 0 8px 0", fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <Rocket color="#c084fc" size={24} /> استكشف مجرة المعرفة (Galaxy of Knowledge)
          </h2>
          <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.95rem", maxWidth: "600px" }}>
            معاينة البيئة التعليمية المفتوحة التي يستكشفها الطلاب. تصفح جميع النماذج ثلاثية الأبعاد التفاعلية في فضاء واحد.
          </p>
        </div>
        <div style={{ zIndex: 1 }}>
          <button style={{ 
            background: "linear-gradient(90deg, #8b5cf6, #d946ef)", border: "none", 
            padding: "10px 20px", borderRadius: "30px", color: "white", fontWeight: "bold", 
            fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 15px rgba(217, 70, 239, 0.4)"
          }}>
            <Play size={16} fill="white" /> عرض المجرة
          </button>
        </div>
      </div>

      <div className="quick-actions-row">
        <Link to="/experience/image-to-3d" style={{ textDecoration: "none" }}>
          <div className="action-card secondary-action hoverable">
            <div className="icon-wrap image-ai-icon"><ImagePlus size={36} /></div>
            <h3>Image to 3D Translation</h3>
            <p>Upload any image and convert it into an interactive 3D model instantly.</p>
            <button className="btn-outline mt-auto width-full">Launch Tool</button>
          </div>
        </Link>

        <Link to="/experience/text-to-3d" style={{ textDecoration: "none" }}>
          <div className="action-card secondary-action hoverable">
            <div className="icon-wrap"><Cuboid size={36} /></div>
            <h3>Text to 3D</h3>
            <p>Describe any object in words and watch it become a 3D model.</p>
            <button className="btn-outline mt-auto width-full">Launch Tool</button>
          </div>
        </Link>

        <div className="action-card primary-action hoverable"
             onClick={(!isPro && monthlyLessonCount >= 5) ? undefined : onStartWizard}
             style={{ opacity: (!isPro && monthlyLessonCount >= 5) ? 0.6 : 1,
                      cursor: (!isPro && monthlyLessonCount >= 5) ? 'not-allowed' : 'pointer' }}>
          {(!isPro && monthlyLessonCount >= 5) && (
            <div style={{ background: 'rgba(245,158,11,0.15)',
                          border: '1px solid #f59e0b', borderRadius: '8px',
                          padding: '8px 12px', marginBottom: '12px',
                          fontSize: '0.8rem', color: '#fbbf24' }}>
              ⚠️ You've used {monthlyLessonCount}/{FREE_LESSON_LIMIT} free
              lessons this month.{' '}
              <Link to="/pricing" style={{ color: '#a855f7' }}>
                Upgrade to Pro →
              </Link>
            </div>
          )}
          <div className="icon-wrap wizard-icon"><Layers size={36} /></div>
          <h3>Design New Lesson Path</h3>
          <p>Select a curriculum, organize 3D modules step-by-step, and generate a PIN code for your students.</p>
          <button className="btn-primary mt-auto width-full" disabled={(!isPro && monthlyLessonCount >= FREE_LESSON_LIMIT)}>Start Designing</button>
        </div>
      </div>

      <div className="gallery-section mt-6">
        <div className="hub-header-meta mb-4">
          <h3>📚 My Created Lessons</h3>
          <p>Lessons you have published. Click to relaunch or share again.</p>
        </div>
        {loadingMy ? (
          <p style={{ color: "#94a3b8" }}>Loading your lessons...</p>
        ) : myLessons.length === 0 ? (
          <p style={{ color: "#64748b", fontStyle: "italic" }}>
            No lessons created yet. Click "Design New Lesson Path" to start!
          </p>
        ) : (
          <div className="gallery-grid">
            {myLessons.map(l => (
              <div key={l.id} className="gallery-card" style={{ position: "relative", overflow: "hidden" }}>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => { e.preventDefault(); handleDeleteLesson(l.id, l.title); }}
                  disabled={deletingId === l.id}
                  title="Delete lesson"
                  style={{
                    position: 'absolute', top: '8px', right: '8px', zIndex: 10,
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '6px', padding: '4px 8px',
                    color: '#f87171', cursor: 'pointer', fontSize: '0.75rem',
                  }}
                >
                  {deletingId === l.id ? '...' : '🗑'}
                </button>
                
                {/* Global Publish Badge */}
                {l.is_public && (
                  <div style={{
                    position: 'absolute', top: '8px', left: '8px', zIndex: 10,
                    background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981',
                    color: '#34d399', fontSize: '0.65rem', padding: '2px 8px',
                    borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Globe size={10} /> Public
                  </div>
                )}

                <Link to={`/lesson/${l.id}`} className="gallery-thumb-link" style={{ display: 'block', height: '120px' }}>
                  <div className="gallery-thumb" style={{ height: '100%' }}>
                    <Cuboid size={30} className="text-white opacity-80" />
                  </div>
                </Link>
                <div className="gallery-info" style={{ padding: '1rem' }}>
                  <span className="gal-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{l.subject}</span>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{l.title}</h4>
                  
                  {/* Share PIN and Publish Toggle */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <code style={{
                        background: "#0f172a", color: "#38bdf8",
                        padding: "4px 8px", borderRadius: "4px", fontSize: "0.8rem",
                        border: "1px solid rgba(56, 189, 248, 0.3)"
                      }}>
                        {l.share_code}
                      </code>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(l.share_code).then(() =>
                            showToast({ type: 'success', title: 'Copied!', message: `PIN ${l.share_code} copied to clipboard` })
                          )
                        }
                        style={{ background: "none", border: "none", cursor: "pointer",
                          color: "#64748b", padding: "2px" }}
                        title="Copy code"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleTogglePublish(l.id, l.is_public)}
                      style={{
                        background: l.is_public ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${l.is_public ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                        color: l.is_public ? "#10b981" : "#94a3b8",
                        padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                        fontWeight: "600", transition: "all 0.2s"
                      }}
                      title={l.is_public ? "Make Private" : "Publish to Global Library"}
                    >
                      <Globe size={14} /> {l.is_public ? "Published" : "Publish"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gallery-section mt-6">
        <div className="hub-header-meta mb-4">
          <h3>🎨 3D Template Library</h3>
          <p>Ready-to-use 3D scenes. Click to preview immediately!</p>
        </div>
        
        <div className="gallery-grid">
          {LESSONS.map(l => (
             <Link key={l.id} to={`/lesson/${l.id}`} className="gallery-card">
               <div className="gallery-thumb">
                 <Cuboid size={30} className="text-white opacity-80" />
               </div>
               <div className="gallery-info">
                 <span className="gal-badge">{isArabic ? l.subjectAr : (l.subjectEn || l.subjectAr)}</span>
                 <h4>{isArabic ? l.titleAr : (l.titleEn || l.titleAr)}</h4>
               </div>
             </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step1Subject({ selected, onSelect }: any) {
  const [query, setQuery] = useState("");

  const subjects = [
    { id: "math",      name: "Mathematics", icon: <Calculator size={34} /> },
    { id: "history",   name: "History",     icon: <Book size={34} /> },
    { id: "science",   name: "Science",     icon: <FlaskConical size={34} /> },
    { id: "geography", name: "Geography",   icon: <Globe size={34} /> },
    { id: "languages", name: "Languages",   icon: <Languages size={34} /> },
    { id: "art",       name: "Arts",        icon: <Palette size={34} /> },
    { id: "physics",   name: "Physics",     icon: <Zap size={34} /> },
    { id: "chemistry", name: "Chemistry",   icon: <FlaskConical size={34} /> },
    { id: "biology",   name: "Biology",     icon: <Microscope size={34} /> },
  ];

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="step-container">
      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search for subject..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="subjects-grid">
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", padding: "2rem" }}>
            No subjects match "{query}"
          </div>
        ) : filtered.map(s => (
          <button 
            key={s.id}
            className={`subject-card ${selected === s.id ? "active" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="subject-icon">{s.icon}</div>
            <span>{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2Level({ selected, onSelect, onNext }: any) {
  const levels = [
    { id: "high", name: "High School", desc: "Ages 15-18", icon: "🏫" },
    { id: "middle", name: "Middle School", desc: "Ages 12-15", icon: "🏫" },
    { id: "primary", name: "Primary School", desc: "Ages 6-12", icon: "🏫" },
  ];

  return (
    <div className="step-container center-content">
      <h3 className="section-title">Education Level</h3>
      <div className="levels-flex">
        {levels.map(lvl => (
          <div 
            key={lvl.id}
            className={`level-card ${selected === lvl.id ? "active" : ""}`}
            onClick={() => onSelect(lvl.id)}
          >
            <div className="level-image-placeholder">{lvl.icon}</div>
            <h4>{lvl.name}</h4>
            <p>{lvl.desc}</p>
          </div>
        ))}
      </div>
      <button className="btn-primary large mt-6" onClick={onNext} disabled={!selected}>Next</button>
    </div>
  );
}

function getLessonsForSubject(subjectId: string | null) {
  if (!subjectId) return [];
  const map: Record<string, string[]> = {
    science:   ["علوم الحياة والأرض", "الكيمياء", "العلوم"],
    biology:   ["علوم الحياة والأرض"],
    chemistry: ["الكيمياء"],
    physics:   ["الفيزياء"],
    geography: ["الجغرافيا / علوم الأرض", "الجغرافيا / الفلك"],
    astronomy: ["الجغرافيا / الفلك", "الفلك"],
    history:   ["التاريخ"],
    math:      ["الرياضيات"],
    languages: ["اللغات"],
    art:       ["الفنون"]
  };
  
  const targetSubjects = map[subjectId] || [];
  return LESSONS.filter(l => targetSubjects.includes(l.subjectAr));
}

function Step3Input({ selectedSubject, lessonName, onChange, onNext }: any) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const readyLessons = getLessonsForSubject(selectedSubject);

  return (
    <div className="step-container center-content">
      <h3 className="section-title">Lesson Setup & Specialization</h3>
      <div className="input-group">
        <label>Select a 3D module for your subject</label>
        <select 
          value={lessonName} 
          onChange={e => onChange(e.target.value)} 
          className="large-input custom-select"
        >
          <option value="" disabled>-- Click to select a ready 3D lesson --</option>
          {readyLessons.map(lesson => (
            <option key={lesson.id} value={lesson.titleAr}>
              {isArabic ? lesson.titleAr : (lesson.titleEn || lesson.titleAr)}
            </option>
          ))}
        </select>
      </div>
      <div className="integration-illustration">
        <div className="int-box meta">Meta Learning <br/><small>3D Experts</small></div>
        <div className="int-arrows">🔄<br/>Link & Sync</div>
        <div className="int-box min">Education Ministry <br/><small>Official Curricula</small></div>
      </div>
      <button className="btn-primary large mt-6" onClick={onNext} disabled={!lessonName}>Continue Lesson Setup</button>
    </div>
  );
}

function Step4LabPreview({ lessonName, autoExplain, setAutoExplain, onNext }: any) {
  const renderModel = () => {
    // 1. فحص الدروس المحددة مسبقاً بنظام الـ GLTF
    const lessonData = LESSONS.find((l) => l.titleAr === lessonName);

    if (lessonData?.kind === "gltf-artifact" && lessonData.gltfUrl) {
      return (
        <group scale={[2, 2, 2]}>
          <ArtifactGltfModel url={lessonData.gltfUrl} modelScale={1} />
        </group>
      );
    }

    if (lessonData?.kind === "gltf-url" && lessonData.gltfUrl) {
      return (
        <group scale={[1.5, 1.5, 1.5]}>
          <GltfScene url={lessonData.gltfUrl} modelScale={1} selectedName={null} onSelectName={() => {}} />
        </group>
      );
    }

    // 2. علوم الحياة والأرض (Biology)
    if (lessonName.includes("القلب")) return <BeatingHeart3D />;
    if (lessonName.includes("الخلية الحيوانية")) return <AnimalCell3D />;
    if (lessonName.includes("الخلية النباتية") || lessonName.includes("النبات")) return <PlantCell3D />;
    if (lessonName.includes("التنفسي")) return <LungsModel3D />;
    if (lessonName.includes("العين") || lessonName.includes("البصر")) return <EyeAnatomy3D />;
    if (lessonName.includes("DNA") || lessonName.includes("الحمض") || lessonName.includes("الوراثة")) return <DNAHelix3D />;
    if (lessonName.includes("الخلية")) return <AnimalCell3D />;
    
    // الكيمياء (Chemistry)
    if (lessonName.includes("الذرة") || lessonName.includes("الكيميائي")) return <AtomModel3D />;
    if (lessonName.includes("الماء") && lessonName.includes("جزيء")) return <WaterMolecule3D />;
    
    // الجغرافيا وعلوم الأرض
    if (lessonName.includes("الشمسية") || lessonName.includes("الكواكب")) return <SolarSystem3D />;
    if (lessonName.includes("طبقات الأرض")) return <EarthLayers3D />;
    if (lessonName.includes("الزلازل") || lessonName.includes("البراكين") || lessonName.includes("بركان")) return <Volcano3D />;
    if (lessonName.includes("المياه") || lessonName.includes("دورة")) return <WaterCycle3D />;
    if (lessonName.includes("التضاريس") || lessonName.includes("الأرض")) return <EarthLayers3D />;
    
    // التاريخ
    if (lessonName.includes("أهرامات")) return <Pyramid3D />;
    if (lessonName.includes("الكولوسيوم")) return <Colosseum3D />;
    if (lessonName.includes("قرطاج")) return <CarthageRuins3D />;
    if (lessonName.includes("القيروان")) return <KairouanMosque3D />;
    
    // الرياضيات
    if (lessonName.includes("التحويلات الهندسية")) return <Transformations3D />;
    if (lessonName.includes("الهندسة") || lessonName.includes("الأفلاطونية")) return <PlatonicSolids3D />;
    if (lessonName.includes("الأحجام") || lessonName.includes("المساحات")) return <GeometricVolumes3D />;
    if (lessonName.includes("بيانية") || lessonName.includes("الدوال")) return <FunctionGraph3D />;
    if (lessonName.includes("الإسقاط العمودي")) return <OrthographicProjection3D />;
    if (lessonName.includes("المتجهات")) return <Vectors3D />;
    if (lessonName.includes("الإحصاء") || lessonName.includes("الاحتمالات")) return <StatisticsProbability3D />;
    if (lessonName.includes("المتتاليات")) return <Sequences3D />;
    if (lessonName.includes("المنطق الرياضي")) return <MathematicalLogic3D />;
    
    // اللغات
    if (lessonName.includes("الحروف الأبجدية")) return <ArabicLetters3D />;
    if (lessonName.includes("مخارج الحروف") || lessonName.includes("صوتية")) return <VocalAnatomy3D />;
    if (lessonName.includes("الغرفة")) return <RoomObjects3D />;
    
    // الفنون
    if (lessonName.includes("الألوان")) return <ColorWheel3D />;
    if (lessonName.includes("الخزف") || lessonName.includes("النحت")) return <Pottery3D />;
    if (lessonName.includes("اللوحات")) return <PaintingFrame3D />;
    
    return <BeatingHeart3D />; // Default fallback
  };

  return (
    <div className="step-container lab-step">
      <div className="lab-header">
        <h3 className="section-title text-white">Virtual Lab (Lesson Preview)</h3>
        <p className="text-gray">You are previewing the ({lessonName}) model before publishing it to students.</p>
      </div>

      <div className="lab-wrapper">
        <div className="lab-3d-view" style={{ position: "relative" }}>
          <Model3DLoader />
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={2} />
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <group position={[0,-0.5,0]}>
                <Suspense fallback={null}>
                  {renderModel()}
                </Suspense>
              </group>
            </Float>

            <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} />
            <OrbitControls enableZoom={true} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} />
          </Canvas>
          <div className="lab-badge">Rendered via 3D Live Engine</div>
        </div>

        {/* Glass panel controls */}
        <div className="lab-controls-panel glass-panel">
          <h4 className="panel-title">Model Interaction Settings</h4>
          
          <div className="control-item">
            <div className="ctrl-info">
              <span className="ctrl-name">Enable Hand Tracking (AR)</span>
              <small>Allows students to rotate the camera remotely with hands</small>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="control-item">
            <div className="ctrl-info">
              <span className="ctrl-name">Enable AI Auto-Explanation</span>
              <small>Automatically read and narrate model parts</small>
            </div>
            <label className="switch">
              <input type="checkbox" checked={autoExplain} onChange={(e) => setAutoExplain(e.target.checked)} />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="control-item">
            <div className="ctrl-info">
              <span className="ctrl-name">Lab Lighting Environment</span>
            </div>
            <select className="small-select">
              <option>Studio (Recommended)</option>
              <option>Dark Void</option>
              <option>Daylight</option>
            </select>
          </div>

          <div className="spacer"></div>
          
          <button className="btn-primary full-width glow-btn" onClick={onNext}>
            Approve Model & Proceed to Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function Step5Review({ lessonName, autoExplain, onNext }: any) {
  return (
    <div className="step-container">
      <h3 className="section-title text-center mb-6">Final Review - Lesson {lessonName}</h3>
      <div className="review-layout">
        <div className="review-list">
          <div className="review-item"><div className="rev-icon"><Layers size={24} /></div><div className="rev-text"><h4>{lessonName} 3D Experience</h4><p>Interactive 3D model designed for immersive viewing and real-time manipulation.</p></div></div>
          <div className="review-item"><div className="rev-icon"><Atom size={24} /></div><div className="rev-text"><h4>AI Integration</h4><p>Powered by advanced AI for tracking and dynamic explanations.</p></div></div>
        </div>
        <div className="review-summary">
          <div className="summary-box">
            <h4>Lesson Setup Summary</h4><p>Curriculum Link<br/>- Official standard aligned</p><hr/>
            <h4>Auto-Explanation</h4>
            <div className="toggle-line-small">
              <span>{autoExplain ? 'Enabled' : 'Disabled'}</span><div className={`status-dot ${autoExplain ? 'on' : 'off'}`}></div>
            </div>
          </div>
          <button className="btn-primary full-width mt-4" onClick={onNext}>Confirm Lesson & Publish</button>
        </div>
      </div>
    </div>
  );
}

// Helper: find the preset lesson ID from the lesson title
function getLessonKeyFromTitle(title: string): string {
  const match = LESSONS.find(l => l.titleAr === title);
  return match?.id ?? "";
}

function Step6Success({ lessonName, subject, profile, isPro }: any) {
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [joinedStudents, setJoinedStudents] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const handleEndSession = async () => {
    if (!activeSessionId) return;
    await supabase
      .from("sessions")
      .update({ is_active: false })
      .eq("id", activeSessionId);
    setSessionEnded(true);
  };

  useEffect(() => {
    let channelRef: ReturnType<typeof supabase.channel> | null = null;
    
    async function generateUniquePin(): Promise<string> {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars (0,O,1,I)
      const generate = () =>
        Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

      // Try up to 10 times to get a unique PIN
      for (let i = 0; i < 10; i++) {
        const pin = generate();
        const { data } = await supabase
          .from("sessions")
          .select("id")
          .eq("pin_code", pin)
          .eq("is_active", true)
          .maybeSingle();
        if (!data) return pin; // PIN is unique and available
      }
      // Fallback with timestamp (virtually impossible to collide)
      return `ML${Date.now().toString(36).toUpperCase().slice(-4)}`;
    }

    async function createLessonAndSession() {
      if (!profile) return;
      if (!isPro) {
        const thisMonth = new Date(); 
        thisMonth.setDate(1);
        thisMonth.setHours(0,0,0,0);
        const { count } = await supabase
          .from('lessons').select('*', { count: 'exact', head: true })
          .eq('teacher_id', profile.id)
          .gte('created_at', thisMonth.toISOString());
        
        if ((count || 0) >= 5) {
          setErrorMsg('Monthly lesson limit reached. Please upgrade to Pro.');
          return;
        }
      }

      try {
        const generatedPin = await generateUniquePin();
        setPinCode(generatedPin);

        // 1. Create Lesson (with model_key to link back to preset)
        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .insert({
            teacher_id: profile.id,
            title: lessonName || "Unnamed Lesson",
            subject: subject || "General",
            model_type: "preset",
            model_key: getLessonKeyFromTitle(lessonName),
            share_code: generatedPin
          })
          .select()
          .single();

        if (lessonError) throw lessonError;

        // 2. Create Live Session
        const { data: session, error: sessionError } = await supabase
          .from("sessions")
          .insert({
            lesson_id: lesson.id,
            teacher_id: profile.id,
            pin_code: generatedPin,
            is_active: true,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        
        setActiveSessionId(session.id);

        // 3. Listen to student_joins using Realtime
        channelRef = supabase.channel(`session-${session.id}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "student_joins", filter: `session_id=eq.${session.id}` },
            (payload) => {
              setJoinedStudents(prev => [...prev, payload.new]);
            }
          )
          .subscribe();

      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to generate live session");
      }
    }

    createLessonAndSession();

    return () => {
      if (channelRef) {
        supabase.removeChannel(channelRef);
      }
    };
  }, [profile, lessonName, subject]);

  return (
    <div className="step-container center-content success-view">
      <div className="confetti-placeholder">🎉</div>
      <h2 className="success-msg">Lesson Created Successfully!</h2>
      {errorMsg ? (
        <p style={{ color: 'red' }}>{errorMsg}</p>
      ) : (
        <>
          <p className="success-sub">Access Code</p>
          <div className="code-display" style={{ fontSize: '2.5rem', letterSpacing: '4px', padding: '1rem', background: '#38bdf822', border: '2px solid #38bdf8', borderRadius: '12px' }}>
            {pinCode || "..."}
          </div>
          
          {pinCode && (
            <div style={{
              marginTop: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>
                📱 Students can also scan this QR code to join directly
              </p>
              <div style={{
                background: "white",
                padding: "16px",
                borderRadius: "12px",
                display: "inline-block"
              }}>
                <QRCodeSVG
                  value={`${window.location.origin}/join?pin=${pinCode}`}
                  size={180}
                  level="H"
                />
              </div>
              <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>
                Scan → enter PIN automatically → join lesson
              </p>
            </div>
          )}
          
          <p className="code-hint mt-2">Copy this secure code and share it with your students to begin.</p>
          
          {/* Live Students list */}
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#1f2937', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h4 style={{ color: '#9ca3af', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>
              📡 Live Connected Students ({joinedStudents.length})
            </h4>
            {joinedStudents.length === 0 ? (
              <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Waiting for students to join...</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {joinedStudents.map((st, i) => (
                  <li key={i} style={{ padding: '0.5rem', background: '#374151', marginBottom: '0.5rem', borderRadius: '6px', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }}></span>
                     {st.student_name}
                  </li>
                ))}
              </ul>
            )}
            
            {!sessionEnded ? (
              <button
                onClick={handleEndSession}
                style={{
                  marginTop: "1rem", width: "100%", padding: "12px",
                  background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444",
                  borderRadius: "8px", color: "#fca5a5", cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                🔒 End Session & Deactivate PIN
              </button>
            ) : (
              <div style={{ marginTop: "1rem", padding: "12px", background: "rgba(34,197,94,0.1)",
                border: "1px solid #22c55e", borderRadius: "8px", color: "#86efac",
                textAlign: "center" }}>
                ✅ Session ended. PIN is now deactivated.
              </div>
            )}
          </div>

          <div className="share-actions mt-6">
            <a
              className="btn-whatsapp"
              href={`https://wa.me/?text=${encodeURIComponent(
                `Join my MetaLearning 3D lesson!\nLesson: ${lessonName}\nCode: ${pinCode}\nJoin at: ${window.location.origin}/join`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send size={18} /> Send via WhatsApp
            </a>
            <button
              className="btn-outline"
              onClick={() => {
                navigator.clipboard.writeText(pinCode ?? "").then(() => {
                  showToast({ type: 'success', title: 'Copied!', message: `PIN ${pinCode} copied to clipboard` });
                });
                setCopyDone(true);
                setTimeout(() => setCopyDone(false), 2000);
              }}
            >
              <Copy size={18} /> {copyDone ? "Copied! ✓" : "Copy Code"}
            </button>
          </div>
        </>
      )}
      <div className="lesson-summary-footer mt-6">
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
}
