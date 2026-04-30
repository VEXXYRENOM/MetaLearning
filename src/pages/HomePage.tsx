import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MetaTags } from "../components/MetaTags";
import { ArrowRight, Zap, Users, BookOpen, Brain, Shield, Star, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const STATS = [
  { label: "Active Learners", value: "3,200+", icon: Users, color: "#2563EB" },
  { label: "3D Lessons", value: "120+", icon: BookOpen, color: "#0EA5E9" },
  { label: "AI Features", value: "12", icon: Brain, color: "#7C3AED" },
  { label: "Avg. Rating", value: "4.9 ★", icon: Star, color: "#F59E0B" },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered 3D Learning",
    desc: "Generate immersive 3D lessons from text or images using our advanced AI engine.",
    color: "#2563EB",
    bg: "rgba(37,99,235,0.08)",
  },
  {
    icon: Shield,
    title: "Live Classroom Sync",
    desc: "Control student viewpoints in real-time. Every student sees exactly what you show them.",
    color: "#0EA5E9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    icon: Zap,
    title: "Instant Quizzes & XP",
    desc: "Gamified quizzes with leaderboards keep students engaged and motivated every session.",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => {
      if (count) setActiveUsers(count);
    });
  }, []);

  const dashboardLink = profile?.role === "teacher" ? "/teacher/create"
    : profile?.role === "creator" ? "/creator/lab"
    : profile?.role === "admin" ? "/admin"
    : profile?.role === "student" ? "/student/dashboard"
    : "/auth/role-selection";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #EBF4FF 0%, #DBEAFE 30%, #E0F2FE 60%, #F0F9FF 100%)", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden" }}>
      <MetaTags title="MetaLearning — The 3D Education Revolution" description="The Future of Education is 3D. Join MetaLearning and transform how you teach and learn." />

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .glass { background: rgba(255,255,255,0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); }
        .glass-dark { background: rgba(255,255,255,0.3); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.5); }
        .btn-primary { background: linear-gradient(135deg, #2563EB, #0EA5E9); color: white; border: none; cursor: pointer; font-weight: 700; transition: all 0.3s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(37,99,235,0.35); }
        .btn-ghost { background: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.9); color: #1e40af; cursor: pointer; font-weight: 600; transition: all 0.3s; backdrop-filter: blur(10px); }
        .btn-ghost:hover { background: white; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
        .feature-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(37,99,235,0.12); }
        .stat-card { transition: all 0.3s; }
        .stat-card:hover { transform: translateY(-4px); }
        .nav-link { color: #475569; font-weight: 500; text-decoration: none; font-size: 0.95rem; transition: color 0.2s; }
        .nav-link:hover { color: #2563EB; }
        @keyframes float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-20px) rotate(2deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.6; } 70% { transform: scale(1.1); opacity: 0; } 100% { transform: scale(1.1); opacity: 0; } }
        .float-anim { animation: float 6s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.8s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.8s 0.3s ease both; }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 2rem" }}>
        <nav style={{ maxWidth: "1200px", margin: "1rem auto 0", borderRadius: "18px", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="glass">
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, #2563EB, #0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "1.1rem", boxShadow: "0 4px 15px rgba(37,99,235,0.3)" }}>M</div>
            <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#1e3a5f", letterSpacing: "-0.02em" }}>MetaLearning</span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
            <Link to="/ar-guide" className="nav-link">Free Guide</Link>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {session ? (
              <>
                <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9rem", fontWeight: 600 }}>
                  <LogOut size={15} /> Sign Out
                </button>
                <Link to={dashboardLink} className="btn-primary" style={{ padding: "9px 20px", borderRadius: "12px", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  Dashboard <ChevronRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-ghost" style={{ padding: "9px 20px", borderRadius: "12px", fontSize: "0.9rem", textDecoration: "none" }}>Log In</Link>
                <Link to="/auth" className="btn-primary" style={{ padding: "9px 20px", borderRadius: "12px", fontSize: "0.9rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                  Get Started <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ══ HERO SECTION ══ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", paddingTop: "100px", overflow: "hidden" }}>

        {/* BIG BG TEXT */}
        <div style={{ position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)", fontSize: "clamp(8rem, 18vw, 22rem)", fontWeight: 900, color: "rgba(37,99,235,0.05)", lineHeight: 1, letterSpacing: "-0.05em", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap" }}>
          META
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", width: "100%" }}>

          {/* LEFT: Content */}
          <div>
            {/* Badge */}
            <div className="fade-up glass" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 16px", borderRadius: "50px", marginBottom: "1.5rem" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e40af" }}>MetaLearning 2.0 is Live</span>
              {activeUsers > 0 && <span style={{ color: "#2563EB", fontWeight: 700, fontSize: "0.82rem" }}>· {activeUsers} users</span>}
            </div>

            {/* Headline */}
            <h1 className="fade-up-2" style={{ fontSize: "clamp(2.8rem, 5vw, 4.2rem)", fontWeight: 900, lineHeight: 1.1, color: "#0f1f3d", margin: "0 0 1.5rem", letterSpacing: "-0.03em" }}>
              The Future of<br />
              <span style={{ background: "linear-gradient(135deg, #2563EB, #0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Education
              </span>{" "}
              is 3D
            </h1>

            <p className="fade-up-3" style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.7, margin: "0 0 2.5rem", maxWidth: "500px" }}>
              Transform any lesson into an immersive 3D experience. Powered by AI, built for the next generation of learners and teachers.
            </p>

            {/* CTAs */}
            <div className="fade-up-3" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link to="/auth" className="btn-primary" style={{ padding: "15px 32px", borderRadius: "14px", fontSize: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 25px rgba(37,99,235,0.3)" }}>
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/join" className="btn-ghost" style={{ padding: "15px 32px", borderRadius: "14px", fontSize: "1rem", textDecoration: "none" }}>
                I have a PIN
              </Link>
            </div>

            {/* Social proof */}
            <div className="fade-up-3" style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex" }}>
                {["#2563EB", "#0EA5E9", "#7C3AED", "#10B981"].map((c, i) => (
                  <div key={i} style={{ width: "34px", height: "34px", borderRadius: "50%", background: c, border: "2px solid white", marginLeft: i === 0 ? 0 : "-10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.7rem", fontWeight: 700 }}>{["T", "S", "M", "A"][i]}</div>
                ))}
              </div>
              <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0 }}>
                Join <strong style={{ color: "#1e40af" }}>3,200+ students & teachers</strong> already learning in 3D
              </p>
            </div>
          </div>

          {/* RIGHT: Hero Visual */}
          <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* Glow ring */}
            <div style={{ position: "absolute", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)" }} />

            {/* Brain Image */}
            <img
              src="/hero-brain.png"
              alt="3D AI Brain"
              className="float-anim"
              style={{ width: "380px", height: "380px", objectFit: "contain", position: "relative", zIndex: 2, filter: "drop-shadow(0 30px 60px rgba(37,99,235,0.25))" }}
            />

            {/* Floating Card 1 — Active Learners */}
            <div className="glass" style={{ position: "absolute", top: "10%", left: "-10%", padding: "12px 18px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "10px", zIndex: 5, boxShadow: "0 8px 30px rgba(37,99,235,0.12)", animation: "float 5s 0.5s ease-in-out infinite" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #2563EB, #0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={18} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Active Users</p>
                <p style={{ margin: 0, fontSize: "1rem", color: "#0f1f3d", fontWeight: 800 }}>+3,200</p>
              </div>
            </div>

            {/* Floating Card 2 — AI Lessons */}
            <div className="glass" style={{ position: "absolute", bottom: "15%", right: "-12%", padding: "12px 18px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "10px", zIndex: 5, boxShadow: "0 8px 30px rgba(14,165,233,0.15)", animation: "float 7s 1s ease-in-out infinite" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7C3AED, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={18} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>AI 3D Lessons</p>
                <p style={{ margin: 0, fontSize: "1rem", color: "#0f1f3d", fontWeight: 800 }}>120+ Ready</p>
              </div>
            </div>

            {/* Floating Card 3 — Rating */}
            <div className="glass" style={{ position: "absolute", top: "55%", left: "-8%", padding: "10px 16px", borderRadius: "14px", zIndex: 5, boxShadow: "0 8px 30px rgba(245,158,11,0.15)", animation: "float 4s 2s ease-in-out infinite" }}>
              <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b", fontWeight: 600 }}>Avg. Rating</p>
              <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "#F59E0B" }}>4.9 ★</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAND ══ */}
      <section style={{ padding: "2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          {STATS.map((s) => (
            <div key={s.label} className="glass stat-card" style={{ padding: "1.5rem", borderRadius: "20px", textAlign: "center", boxShadow: "0 4px 20px rgba(37,99,235,0.06)" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                <s.icon size={22} color={s.color} />
              </div>
              <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, color: "#0f1f3d" }}>{s.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="glass" style={{ display: "inline-block", padding: "6px 18px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 700, color: "#2563EB", marginBottom: "1rem" }}>WHY METALEARNING</span>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, color: "#0f1f3d", margin: 0, letterSpacing: "-0.02em" }}>Built for the Next Generation</h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", margin: "1rem auto 0", maxWidth: "500px" }}>Everything you need to create, share, and experience education in 3D.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="glass feature-card" style={{ padding: "2rem", borderRadius: "24px", boxShadow: "0 4px 20px rgba(37,99,235,0.05)" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: f.bg, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f1f3d", margin: "0 0 0.75rem" }}>{f.title}</h3>
                <p style={{ color: "#64748b", margin: 0, lineHeight: 1.6, fontSize: "0.93rem" }}>{f.desc}</p>
                <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "6px", color: f.color, fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}>
                  Learn more <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section style={{ padding: "4rem 2rem 8rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div className="glass" style={{ padding: "4rem 3rem", borderRadius: "32px", boxShadow: "0 20px 60px rgba(37,99,235,0.1)", position: "relative", overflow: "hidden" }}>
            {/* BG decoration */}
            <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)" }} />

            <span style={{ display: "inline-block", padding: "6px 18px", borderRadius: "50px", fontSize: "0.8rem", fontWeight: 700, color: "#2563EB", background: "rgba(37,99,235,0.08)", marginBottom: "1.5rem" }}>🚀 START FOR FREE</span>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#0f1f3d", margin: "0 0 1rem", letterSpacing: "-0.02em" }}>Ready to Revolutionize Your Classroom?</h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", margin: "0 0 2rem", lineHeight: 1.6 }}>Join thousands of teachers and students already experiencing the future of education.</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/auth" className="btn-primary" style={{ padding: "16px 36px", borderRadius: "14px", fontSize: "1rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 25px rgba(37,99,235,0.3)" }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn-ghost" style={{ padding: "16px 36px", borderRadius: "14px", fontSize: "1rem", textDecoration: "none" }}>
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: "1px solid rgba(37,99,235,0.1)", padding: "2rem", background: "rgba(255,255,255,0.3)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg, #2563EB, #0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "0.9rem" }}>M</div>
            <span style={{ fontWeight: 700, color: "#1e3a5f" }}>MetaLearning</span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link to="/privacy" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Privacy</Link>
            <Link to="/terms" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Terms</Link>
            <Link to="/pricing" style={{ color: "#64748b", textDecoration: "none", fontSize: "0.85rem" }}>Pricing</Link>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", margin: 0 }}>© 2025 MetaLearning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
