import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Atom, Calculator, Book, Globe, Languages, Settings, 
  Star, Palette, FlaskConical, Microscope, Layers, User, 
  ChevronLeft, Search, Copy, Send, LayoutDashboard,
  ImagePlus, Cuboid
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import { BeatingHeart3D } from "../components/lesson/BeatingHeart3D";
import { AtomModel3D } from "../components/lesson/AtomModel3D";
import { SolarSystem3D } from "../components/lesson/SolarSystem3D";
import { Pyramid3D } from "../components/lesson/Pyramid3D";
import { PlatonicSolids3D } from "../components/lesson/PlatonicSolids3D";
import { AnimalCell3D } from "../components/lesson/AnimalCell3D";
import { PlantCell3D } from "../components/lesson/PlantCell3D";
import { WaterMolecule3D } from "../components/lesson/WaterMolecule3D";
import { DNAHelix3D } from "../components/lesson/DNAHelix3D";
import { EarthLayers3D } from "../components/lesson/EarthLayers3D";
import { Volcano3D } from "../components/lesson/Volcano3D";
import { WaterCycle3D } from "../components/lesson/WaterCycle3D";
import { LungsModel3D } from "../components/lesson/LungsModel3D";
import { EyeAnatomy3D } from "../components/lesson/EyeAnatomy3D";
import { FunctionGraph3D } from "../components/lesson/FunctionGraph3D";
import { GeometricVolumes3D } from "../components/lesson/GeometricVolumes3D";
import { Colosseum3D } from "../components/lesson/Colosseum3D";
import { CarthageRuins3D } from "../components/lesson/CarthageRuins3D";
import { KairouanMosque3D } from "../components/lesson/KairouanMosque3D";
import { ArabicLetters3D } from "../components/lesson/ArabicLetters3D";
import { VocalAnatomy3D } from "../components/lesson/VocalAnatomy3D";
import { RoomObjects3D } from "../components/lesson/RoomObjects3D";
import { ColorWheel3D } from "../components/lesson/ColorWheel3D";
import { Pottery3D } from "../components/lesson/Pottery3D";
import { PaintingFrame3D } from "../components/lesson/PaintingFrame3D";
import { GltfScene } from "../components/lesson/GltfScene";
import { ArtifactGltfModel } from "../components/experience/ArtifactGltfModel";
import { OrthographicProjection3D } from "../components/lesson/OrthographicProjection3D";
import { Vectors3D } from "../components/lesson/Vectors3D";
import { Transformations3D } from "../components/lesson/Transformations3D";
import { StatisticsProbability3D } from "../components/lesson/StatisticsProbability3D";
import { Sequences3D } from "../components/lesson/Sequences3D";
import { MathematicalLogic3D } from "../components/lesson/MathematicalLogic3D";
import { useEffect } from "react";
import "../teacher.css"; // تنسيق النمط الفاتح المستقل
import { LESSONS } from "../data/lessons"; // لاستيراد النماذج الجاهزة للأستاذ
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function TeacherDashboardPage() {
  const { profile, signOut } = useAuth();
  const [step, setStep] = useState<Step>(0); // 🚀 نبدأ من الـ Hub (Step 0)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [lessonName, setLessonName] = useState<string>("");
  const [autoExplain, setAutoExplain] = useState<boolean>(true);

  const nextStep = () => {
    if (step < 6) setStep((prev: Step) => (prev + 1) as Step);
  };

  const prevStep = () => {
    if (step > 0) setStep((prev: Step) => (prev - 1) as Step);
  };

  return (
    <div className="teacher-layout" dir="ltr">
      {/* 🔹 الشريط الجانبي الثابت */}
      <aside className="teacher-sidebar">
        <div className="sidebar-profile">
          <div className="profile-img">
            <User size={30} color="#cbd5e1" />
          </div>
          <h3>{profile?.full_name || 'Nour'}</h3>
          <p>Teacher</p>
          <button className="btn-logout" onClick={() => signOut()}>Logout</button>
        </div>
        
        <div className="sidebar-tools">
          <LayoutDashboard 
            size={22} 
            className={`tool-icon ${step === 0 ? 'active' : ''}`} 
            onClick={() => setStep(0)} 
          />
          <Settings size={22} className="tool-icon" />
          <Star size={22} className="tool-icon" />
          <Atom size={22} className={`tool-icon ${step > 0 ? 'active' : ''}`} />
          <Microscope size={22} className="tool-icon" />
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
            <Step0Hub onStartWizard={() => setStep(1)} />
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
          {step === 6 && <Step6Success lessonName={lessonName} subject={selectedSubject} profile={profile} />}
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------
// 🌟 المكون الجديد: غرفة العمليات (Teacher Hub - Step 0)
// -----------------------------------------------------
function Step0Hub({ onStartWizard }: { onStartWizard: () => void }) {
  return (
    <div className="hub-container">
      <div className="hub-header-meta">
        <h2>Your Workspace 🚀</h2>
        <p>Upload your custom model or browse your library of ready-to-use 3D assets.</p>
      </div>

      <div className="quick-actions-row">
        <div className="action-card secondary-action" style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <div className="icon-wrap image-ai-icon"><ImagePlus size={36} /></div>
          <h3>Image to 3D Translation</h3>
          <p>This interface is temporarily disabled until further notice.</p>
          <button className="btn-outline mt-auto width-full" disabled>Disabled</button>
        </div>

        <div className="action-card primary-action hoverable" onClick={onStartWizard}>
          <div className="icon-wrap wizard-icon"><Layers size={36} /></div>
          <h3>Design New Lesson Path</h3>
          <p>Select a curriculum, organize 3D modules step-by-step, and generate a PIN code for your students.</p>
          <button className="btn-primary mt-auto width-full">Start Designing</button>
        </div>
      </div>

      <div className="gallery-section mt-6">
        <div className="hub-header-meta mb-4">
          <h3>My Gallery & Demos 🎨</h3>
          <p>Ready-to-use 3D scenes and lessons you've created. Click to launch immediately!</p>
        </div>
        
        <div className="gallery-grid">
          {LESSONS.map(l => (
             <Link key={l.id} to={`/lesson/${l.id}`} className="gallery-card">
               <div className="gallery-thumb">
                 <Cuboid size={30} className="text-white opacity-80" />
               </div>
               <div className="gallery-info">
                 <span className="gal-badge">{l.subjectAr}</span>
                 <h4>{l.titleAr}</h4>
               </div>
             </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step1Subject({ selected, onSelect }: any) {
  const subjects = [
    { id: "math", name: "Mathematics", icon: <Calculator size={34} /> },
    { id: "history", name: "History", icon: <Book size={34} /> },
    { id: "science", name: "Science", icon: <FlaskConical size={34} /> },
    { id: "geography", name: "Geography", icon: <Globe size={34} /> },
    { id: "languages", name: "Languages", icon: <Languages size={34} /> },
    { id: "art", name: "Arts", icon: <Palette size={34} /> },
  ];

  return (
    <div className="step-container">
      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input type="text" placeholder="Search for subject..." />
      </div>
      <div className="subjects-grid">
        {subjects.map(s => (
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
  // Mapping the short IDs to the Arabic labels used in lessons.ts
  const map: Record<string, string[]> = {
    science: ["علوم الحياة والأرض", "الكيمياء", "العلوم"],
    geography: ["الجغرافيا / علوم الأرض", "الجغرافيا / الفلك"],
    history: ["التاريخ"],
    math: ["الرياضيات"],
    languages: ["اللغات"],
    art: ["الفنون"]
  };
  
  const targetSubjects = map[subjectId] || [];
  return LESSONS.filter(l => targetSubjects.includes(l.subjectAr)).map(l => l.titleAr);
}

function Step3Input({ selectedSubject, lessonName, onChange, onNext }: any) {
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
          {readyLessons.map((lesson: string) => (
            <option key={lesson} value={lesson}>{lesson}</option>
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
        <div className="lab-3d-view">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={2} />
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <group position={[0,-0.5,0]}>
                {renderModel()}
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

function Step6Success({ lessonName, subject, profile }: any) {
  const [pinCode, setPinCode] = useState<string | null>(null);
  const [joinedStudents, setJoinedStudents] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let activeSessionId = "";
    
    async function createLessonAndSession() {
      if (!profile) return;
      try {
        const generatedPin = `MTL-${Math.floor(100 + Math.random() * 900)}`;
        setPinCode(generatedPin);

        // 1. Create Lesson
        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .insert({
            teacher_id: profile.id,
            title: lessonName || "Unnnamed Lesson",
            subject: subject || "General",
            model_type: "preset",
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
            is_active: true
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        activeSessionId = session.id;

        // 3. Listen to student_joins using Realtime
        const channel = supabase.channel(`session-${activeSessionId}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "student_joins", filter: `session_id=eq.${activeSessionId}` },
            (payload) => {
              setJoinedStudents(prev => [...prev, payload.new]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to generate live session");
      }
    }

    createLessonAndSession();
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
          </div>

          <div className="share-actions mt-6">
            <button className="btn-whatsapp"><Send size={18} /> Send via WhatsApp</button>
            <button className="btn-outline"><Copy size={18} /> Copy Code</button>
          </div>
        </>
      )}
      <div className="lesson-summary-footer mt-6">
        <Link to="/">← Back to Home</Link>
      </div>
    </div>
  );
}
