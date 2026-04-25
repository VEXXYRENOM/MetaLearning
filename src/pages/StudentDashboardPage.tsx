import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { UserCircle, Calendar, BookOpen, Activity, Hash, Play, Rocket, Stars } from "lucide-react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { OnboardingWizard } from "../components/OnboardingWizard";
import { Skeleton } from "../components/Skeleton";
import { XPProgressWidget } from "../components/XPProgressWidget";
import { useAccessControl } from "../hooks/useAccessControl";

export function StudentDashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const access = useAccessControl();

  const [pinCode, setPinCode] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, subjects: 0, days: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    if (profile && profile.onboarding_done === false) {
      setShowWizard(true);
    }
  }, [profile]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile) return;
      try {
        // Query student_joins with related session and lesson
        const { data, error } = await supabase
          .from("student_joins")
          .select(`
            joined_at,
            sessions (
              id,
              lesson_id,
              lessons (
                title,
                subject,
                model_key
              )
            )
          `)
          .eq("student_id", profile.id)
          .order("joined_at", { ascending: false });

        if (error) throw error;

        const joins = data || [];
        
        // Extract valid models
        const sessionsList = joins
          .map(j => {
            const session = j.sessions as unknown as {
              id: string;
              lesson_id: string;
              lessons: { title: string; subject: string; model_key: string } | null;
            } | null;
            return {
              joined_at: j.joined_at,
              session_id: session?.id,
              lesson_id: session?.lesson_id,
              title: session?.lessons?.title,
              subject: session?.lessons?.subject,
              model_key: session?.lessons?.model_key,
            };
          })
          .filter(s => s.session_id && s.title) as any[];

        setRecentSessions(sessionsList.slice(0, 5));

        // Calculate Stats
        const uniqueSubjects = new Set(sessionsList.map(s => s.subject));
        const uniqueDays = new Set(sessionsList.map(s => new Date(s.joined_at).toDateString()));

        setStats({
          total: sessionsList.length,
          subjects: uniqueSubjects.size,
          days: uniqueDays.size
        });
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchDashboardData();
  }, [profile]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    // [E-4] Gate: enforce daily lesson limit for free tier
    if (!access.isPaid && stats.total >= access.dailyLessonLimit) {
      setErrorMsg(`Free plan limit reached (${access.dailyLessonLimit} lessons/day). Upgrade to PRO for unlimited access.`);
      return;
    }

    setLoadingJoin(true);
    setErrorMsg("");

    try {
      const formattedPin = pinCode.trim();

      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("id, lesson_id, is_active")
        .eq("pin_code", formattedPin)
        .eq("is_active", true)
        .single();

      if (sessionError || !sessionData) {
        throw new Error(t("join.error_not_found") || "Session not found");
      }

      if (profile) {
        await supabase
          .from("student_joins")
          .insert({
            session_id: sessionData.id,
            student_id: profile.id,
            student_name: profile.full_name || profile.email,
          });
      }

      navigate(`/lesson/${sessionData.lesson_id}?session=${sessionData.id}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <div className="teacher-layout" dir="ltr" style={{ minHeight: "100vh", background: "#0f172a" }}>
      {showWizard && (
        <OnboardingWizard role="student" onComplete={() => setShowWizard(false)} />
      )}
      <main className="teacher-main" style={{ width: "100%", padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #1e293b", paddingBottom: "1rem", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <UserCircle size={48} color="#a855f7" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1 style={{ color: "white", fontSize: "1.6rem", margin: 0, display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span>{t("student_dashboard.welcome", "Welcome back")}</span>
                <span>{profile?.full_name || "Student"}</span>
              </h1>
              <p style={{ color: "#94a3b8", margin: 0 }}>{t("student_dashboard.title", "Student Dashboard")}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <LanguageSwitcher theme="dark" />
            {profile && (
              <XPProgressWidget
                compact
                points={profile.points}
                level={profile.level}
                badges={profile.badges}
              />
            )}
          </div>
        </header>

        {/* GALAXY OF KNOWLEDGE BANNER */}
        <div 
          onClick={() => navigate('/explore')}
          style={{ 
            marginBottom: "2rem", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", 
            padding: "2rem", borderRadius: "16px", border: "1px solid rgba(139, 92, 246, 0.5)", 
            display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
            boxShadow: "0 10px 30px rgba(139, 92, 246, 0.2)", position: "relative", overflow: "hidden",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.01)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(139, 92, 246, 0.4)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(139, 92, 246, 0.2)"; }}
        >
          {/* Background decoration */}
          <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(0,0,0,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
          <Stars size={120} color="rgba(255,255,255,0.05)" style={{ position: "absolute", top: 10, left: 10, pointerEvents: "none" }} />

          <div style={{ zIndex: 1 }}>
            <h2 style={{ color: "white", margin: "0 0 10px 0", fontSize: "1.8rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <Rocket color="#c084fc" /> {t("student_dashboard.galaxy_title", "استكشف مجرة المعرفة")}
            </h2>
            <p style={{ color: "#cbd5e1", margin: 0, fontSize: "1rem", maxWidth: "600px", lineHeight: "1.5" }}>
              {t("student_dashboard.galaxy_desc", "لا تنتظر كود الدرس! انطلق في رحلة فضائية مفتوحة واستكشف جميع النماذج ثلاثية الأبعاد في مختلف المواد الدراسية.")}
            </p>
          </div>
          <div style={{ zIndex: 1 }}>
            <button style={{ 
              background: "linear-gradient(90deg, #8b5cf6, #d946ef)", border: "none", 
              padding: "12px 24px", borderRadius: "30px", color: "white", fontWeight: "bold", 
              fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 4px 15px rgba(217, 70, 239, 0.4)"
            }}>
              <Play size={18} fill="white" /> {t("student_dashboard.galaxy_btn", "ابدأ الرحلة")}
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "12px", border: "1px solid #334155", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "#3b82f620", padding: "12px", borderRadius: "8px" }}><BookOpen size={28} color="#3b82f6" /></div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>{t("student_dashboard.total_lessons", "Total Lessons")}</p>
              <h3 style={{ color: "white", fontSize: "1.8rem", margin: 0 }}>{stats.total}</h3>
            </div>
          </div>
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "12px", border: "1px solid #334155", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "#a855f720", padding: "12px", borderRadius: "8px" }}><Activity size={28} color="#a855f7" /></div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>{t("student_dashboard.subjects", "Subjects")}</p>
              <h3 style={{ color: "white", fontSize: "1.8rem", margin: 0 }}>{stats.subjects}</h3>
            </div>
          </div>
          <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "12px", border: "1px solid #334155", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "#10b98120", padding: "12px", borderRadius: "8px" }}><Calendar size={28} color="#10b981" /></div>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: 0 }}>{t("student_dashboard.days_active", "Days Active")}</p>
              <h3 style={{ color: "white", fontSize: "1.8rem", margin: 0 }}>{stats.days}</h3>
            </div>
          </div>
        </div>

        {/* XP PROGRESS CARD */}
        {profile && (
          <div style={{ marginBottom: "2rem" }}>
            <XPProgressWidget
              points={profile.points}
              level={profile.level}
              badges={profile.badges}
            />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          
          {/* JOIN NEW SESSION (Left side or top on mobile) */}
          <section style={{ background: "#1e293b", padding: "2rem", borderRadius: "12px", border: "1px solid #334155", height: "fit-content" }}>
            <h2 style={{ color: "white", marginTop: 0, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Hash color="#38bdf8" /> {t("student_dashboard.join_new", "Join a New Lesson")}
            </h2>
            
            {errorMsg && (
              <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", marginBottom: "1rem", fontSize: "0.9rem" }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ position: "relative" }}>
                <Hash size={24} style={{ position: "absolute", right: "15px", top: "15px", color: "#9ca3af" }} />
                <input
                  required
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="ABC123"
                  style={{
                    width: "100%", padding: "16px 45px 16px 16px", borderRadius: "12px",
                    background: "rgba(0,0,0,0.5)", border: "2px solid #38bdf8", color: "white",
                    fontSize: "1.2rem", textAlign: "center", letterSpacing: "2px", textTransform: "uppercase"
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loadingJoin || !pinCode.trim()}
                style={{
                  padding: "16px", borderRadius: "12px", background: "linear-gradient(90deg, #0ea5e9, #3b82f6)", 
                  border: "none", color: "white", fontWeight: "bold", fontSize: "1.1rem", 
                  cursor: (loadingJoin || !pinCode.trim()) ? "not-allowed" : "pointer",
                  opacity: (loadingJoin || !pinCode.trim()) ? 0.7 : 1
                }}
              >
                {loadingJoin ? "..." : t("student_dashboard.join_new", "Join Lesson")}
              </button>
            </form>
          </section>

          {/* RECENT SESSIONS (Right side) */}
          <section>
            <h2 style={{ color: "white", marginTop: 0, marginBottom: "1rem" }}>
              {t("student_dashboard.recent_lessons", "Recent Lessons")}
            </h2>
            {loadingData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Skeleton height="80px" borderRadius="10px" />
                <Skeleton height="80px" borderRadius="10px" />
                <Skeleton height="80px" borderRadius="10px" />
              </div>
            ) : recentSessions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {recentSessions.map((session, idx) => (
                  <div key={idx} style={{ background: "rgba(255,255,255,0.05)", padding: "1.2rem", borderRadius: "10px", border: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ color: "white", margin: "0 0 4px 0", fontSize: "1.1rem" }}>{session.title || "Lesson"}</h4>
                      <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.85rem" }}>
                        {session.subject} • {new Date(session.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    {session.lesson_id && (
                       <Link 
                         to={`/lesson/${session.lesson_id}`} 
                         style={{ background: "#38bdf820", color: "#38bdf8", padding: "8px 16px", borderRadius: "20px", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "0.9rem" }}
                       >
                         <Play size={16} /> Revisit
                       </Link>
                     )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "2rem", borderRadius: "10px", border: "1px dashed #475569", textAlign: "center", color: "#94a3b8" }}>
                {t("student_dashboard.no_history", "You haven't attended any lessons yet")}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
