import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { MetaTags } from "../components/MetaTags";
import { ArrowRight, Zap, Users, BookOpen, Brain, Shield, Star, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const HeroOrb3D = lazy(() => import("../components/HeroOrb3D"));

// ── Scroll reveal hook ──────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const STATS = [
  { label: "Active Learners", value: "3,200+", icon: Users, color: "#2563EB" },
  { label: "3D Lessons", value: "120+", icon: BookOpen, color: "#0EA5E9" },
  { label: "AI Features", value: "12", icon: Brain, color: "#7C3AED" },
  { label: "Avg. Rating", value: "4.9 ★", icon: Star, color: "#F59E0B" },
];

const FEATURES = [
  { icon: Brain, title: "AI-Powered 3D Learning", desc: "Generate immersive 3D lessons from text or images using our advanced AI engine.", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  { icon: Shield, title: "Live Classroom Sync", desc: "Control student viewpoints in real-time. Every student sees exactly what you show them.", color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
  { icon: Zap, title: "Instant Quizzes & XP", desc: "Gamified quizzes with leaderboards keep students engaged every session.", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
];

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ transition: `opacity 0.7s ${delay}s, transform 0.7s ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)" }}>
      {children}
    </div>
  );
}

export function HomePage() {
  const { session, profile } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => { if (count) setActiveUsers(count); });
  }, []);

  const dashboardLink = profile?.role === "teacher" ? "/teacher/create"
    : profile?.role === "creator" ? "/creator/lab"
    : profile?.role === "admin" ? "/admin"
    : profile?.role === "student" ? "/student/dashboard"
    : "/auth/role-selection";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EBF4FF 0%,#DBEAFE 30%,#E0F2FE 60%,#F0F9FF 100%)", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <MetaTags title="MetaLearning — The 3D Education Revolution" description="The Future of Education is 3D." />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .glass{background:rgba(255,255,255,0.55);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.8);}
        .btn-p{background:linear-gradient(135deg,#2563EB,#0EA5E9);color:#fff;border:none;cursor:pointer;font-weight:700;transition:all .3s;text-decoration:none;display:inline-flex;align-items:center;gap:8px;}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(37,99,235,.35);}
        .btn-g{background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.9);color:#1e40af;cursor:pointer;font-weight:600;transition:all .3s;text-decoration:none;display:inline-flex;align-items:center;}
        .btn-g:hover{background:#fff;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.08);}
        .fc{transition:all .35s cubic-bezier(.4,0,.2,1);}
        .fc:hover{transform:translateY(-8px);box-shadow:0 24px 50px rgba(37,99,235,.13);}
        .sc{transition:all .3s;} .sc:hover{transform:translateY(-4px);}
        .nl{color:#475569;font-weight:500;text-decoration:none;font-size:.95rem;transition:color .2s;} .nl:hover{color:#2563EB;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float2{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-18px) scale(1.02)}}
        .fu{animation:fadeUp .8s ease both;} .fu2{animation:fadeUp .8s .15s ease both;} .fu3{animation:fadeUp .8s .3s ease both;}
        .fc1{animation:float2 5s .5s ease-in-out infinite;} .fc2{animation:float2 7s 1s ease-in-out infinite;} .fc3{animation:float2 4s 2s ease-in-out infinite;}
        .pulse{animation:pulse 2.5s ease-in-out infinite;}
        @keyframes pulse{0%,100%{opacity:.6;transform:scale(.97)}50%{opacity:1;transform:scale(1.03)}}
      `}</style>

      {/* ══ NAVBAR ══ */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 2rem" }}>
        <nav className="glass" style={{ maxWidth: 1200, margin: "1rem auto 0", borderRadius: 18, padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.1rem", boxShadow: "0 4px 15px rgba(37,99,235,.3)" }}>M</div>
            <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#1e3a5f", letterSpacing: "-.02em" }}>MetaLearning</span>
          </Link>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <Link to="/pricing" className="nl">Pricing</Link>
            <Link to="/leaderboard" className="nl">Leaderboard</Link>
            <Link to="/ar-guide" className="nl">Free Guide</Link>
          </div>
          <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
            {session ? (
              <>
                <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: ".9rem", fontWeight: 600 }}><LogOut size={15} /> Sign Out</button>
                <Link to={dashboardLink} className="btn-p" style={{ padding: "9px 20px", borderRadius: 12, fontSize: ".9rem" }}>Dashboard <ChevronRight size={15} /></Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-g" style={{ padding: "9px 20px", borderRadius: 12, fontSize: ".9rem" }}>Log In</Link>
                <Link to="/auth" className="btn-p" style={{ padding: "9px 20px", borderRadius: 12, fontSize: ".9rem" }}>Get Started <ArrowRight size={15} /></Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", paddingTop: 100, overflow: "hidden" }}>
        {/* BIG BG TEXT */}
        <div style={{ position: "absolute", right: "-5%", top: "50%", transform: "translateY(-50%)", fontSize: "clamp(8rem,18vw,22rem)", fontWeight: 900, color: "rgba(37,99,235,0.04)", lineHeight: 1, letterSpacing: "-.05em", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap" }}>META</div>

        {/* 3D ORB full background glow */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 70%)" }} className="pulse" />
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", width: "100%" }}>
          {/* LEFT */}
          <div>
            <div className="fu glass" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 16px", borderRadius: 50, marginBottom: "1.5rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,.2)" }} />
              <span style={{ fontSize: ".82rem", fontWeight: 600, color: "#1e40af" }}>MetaLearning 2.0 is Live</span>
              {activeUsers > 0 && <span style={{ color: "#2563EB", fontWeight: 700, fontSize: ".82rem" }}>· {activeUsers} users</span>}
            </div>
            <h1 className="fu2" style={{ fontSize: "clamp(2.8rem,5vw,4.2rem)", fontWeight: 900, lineHeight: 1.1, color: "#0f1f3d", margin: "0 0 1.5rem", letterSpacing: "-.03em" }}>
              The Future of<br />
              <span style={{ background: "linear-gradient(135deg,#2563EB,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Education</span>{" "}is 3D
            </h1>
            <p className="fu3" style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.7, margin: "0 0 2.5rem", maxWidth: 500 }}>
              Transform any lesson into an immersive 3D experience. Powered by AI, built for the next generation of learners and teachers.
            </p>
            <div className="fu3" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link to="/auth" className="btn-p" style={{ padding: "15px 32px", borderRadius: 14, fontSize: "1rem", boxShadow: "0 8px 25px rgba(37,99,235,.3)" }}>Start for Free <ArrowRight size={18} /></Link>
              <Link to="/join" className="btn-g" style={{ padding: "15px 32px", borderRadius: 14, fontSize: "1rem" }}>I have a PIN</Link>
            </div>
            <div className="fu3" style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {["#2563EB","#0EA5E9","#7C3AED","#10B981"].map((c,i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", background: c, border: "2px solid white", marginLeft: i===0?0:-10, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:".7rem", fontWeight:700 }}>{["T","S","M","A"][i]}</div>
                ))}
              </div>
              <p style={{ color: "#64748b", fontSize: ".88rem", margin: 0 }}>Join <strong style={{ color: "#1e40af" }}>3,200+ students & teachers</strong> learning in 3D</p>
            </div>
          </div>

          {/* RIGHT: 3D ORB */}
          <div style={{ position: "relative", height: 480, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Suspense fallback={<div style={{ width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.2) 0%,transparent 70%)" }} className="pulse" />}>
              <HeroOrb3D />
            </Suspense>

            {/* Floating Cards */}
            <div className="glass fc1" style={{ position: "absolute", top: "8%", left: "-5%", padding: "12px 18px", borderRadius: 16, display: "flex", alignItems: "center", gap: 10, zIndex: 5, boxShadow: "0 8px 30px rgba(37,99,235,.12)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={18} color="white" /></div>
              <div><p style={{ margin:0, fontSize:".7rem", color:"#64748b", fontWeight:600 }}>Active Users</p><p style={{ margin:0, fontSize:"1rem", color:"#0f1f3d", fontWeight:800 }}>+3,200</p></div>
            </div>

            <div className="glass fc2" style={{ position: "absolute", bottom: "12%", right: "-8%", padding: "12px 18px", borderRadius: 16, display: "flex", alignItems: "center", gap: 10, zIndex: 5, boxShadow: "0 8px 30px rgba(124,58,237,.15)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7C3AED,#A855F7)", display:"flex", alignItems:"center", justifyContent:"center" }}><Brain size={18} color="white" /></div>
              <div><p style={{ margin:0, fontSize:".7rem", color:"#64748b", fontWeight:600 }}>AI 3D Lessons</p><p style={{ margin:0, fontSize:"1rem", color:"#0f1f3d", fontWeight:800 }}>120+ Ready</p></div>
            </div>

            <div className="glass fc3" style={{ position: "absolute", top: "55%", left: "-8%", padding: "10px 16px", borderRadius: 14, zIndex: 5, boxShadow: "0 8px 30px rgba(245,158,11,.15)" }}>
              <p style={{ margin:0, fontSize:".7rem", color:"#64748b", fontWeight:600 }}>Avg. Rating</p>
              <p style={{ margin:0, fontSize:"1.3rem", fontWeight:900, color:"#F59E0B" }}>4.9 ★</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding: "2rem" }}>
        <RevealSection>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
            {STATS.map((s, i) => (
              <RevealSection key={s.label} delay={i * 0.1}>
                <div className="glass sc" style={{ padding: "1.5rem", borderRadius: 20, textAlign: "center", boxShadow: "0 4px 20px rgba(37,99,235,.06)" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color+"15", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto .75rem" }}><s.icon size={22} color={s.color} /></div>
                  <p style={{ margin:0, fontSize:"1.8rem", fontWeight:900, color:"#0f1f3d" }}>{s.value}</p>
                  <p style={{ margin:"4px 0 0", fontSize:".82rem", color:"#64748b", fontWeight:500 }}>{s.label}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding: "6rem 2rem" }}>
        <RevealSection>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <span className="glass" style={{ display:"inline-block", padding:"6px 18px", borderRadius:50, fontSize:".8rem", fontWeight:700, color:"#2563EB", marginBottom:"1rem" }}>WHY METALEARNING</span>
              <h2 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:900, color:"#0f1f3d", margin:0, letterSpacing:"-.02em" }}>Built for the Next Generation</h2>
              <p style={{ color:"#64748b", fontSize:"1.05rem", margin:"1rem auto 0", maxWidth:500 }}>Everything you need to create, share, and experience education in 3D.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
              {FEATURES.map((f, i) => (
                <RevealSection key={f.title} delay={i * 0.12}>
                  <div className="glass fc" style={{ padding:"2rem", borderRadius:24, boxShadow:"0 4px 20px rgba(37,99,235,.05)", height:"100%" }}>
                    <div style={{ width:52, height:52, borderRadius:16, background:f.bg, border:`1px solid ${f.color}25`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" }}><f.icon size={26} color={f.color} /></div>
                    <h3 style={{ fontSize:"1.15rem", fontWeight:800, color:"#0f1f3d", margin:"0 0 .75rem" }}>{f.title}</h3>
                    <p style={{ color:"#64748b", margin:0, lineHeight:1.6, fontSize:".93rem" }}>{f.desc}</p>
                    <div style={{ marginTop:"1.5rem", display:"flex", alignItems:"center", gap:6, color:f.color, fontWeight:700, fontSize:".88rem" }}>Learn more <ChevronRight size={16} /></div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: "4rem 2rem 8rem" }}>
        <RevealSection>
          <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
            <div className="glass" style={{ padding:"4rem 3rem", borderRadius:32, boxShadow:"0 20px 60px rgba(37,99,235,.1)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-80, right:-80, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 70%)" }} />
              <div style={{ position:"absolute", bottom:-60, left:-60, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,.1) 0%,transparent 70%)" }} />
              <span style={{ display:"inline-block", padding:"6px 18px", borderRadius:50, fontSize:".8rem", fontWeight:700, color:"#2563EB", background:"rgba(37,99,235,.08)", marginBottom:"1.5rem" }}>🚀 START FOR FREE</span>
              <h2 style={{ fontSize:"2.5rem", fontWeight:900, color:"#0f1f3d", margin:"0 0 1rem", letterSpacing:"-.02em" }}>Ready to Revolutionize Your Classroom?</h2>
              <p style={{ color:"#64748b", fontSize:"1.05rem", margin:"0 0 2rem", lineHeight:1.6 }}>Join thousands of teachers and students experiencing the future of education.</p>
              <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
                <Link to="/auth" className="btn-p" style={{ padding:"16px 36px", borderRadius:14, fontSize:"1rem", boxShadow:"0 8px 25px rgba(37,99,235,.3)" }}>Get Started Free <ArrowRight size={18} /></Link>
                <Link to="/pricing" className="btn-g" style={{ padding:"16px 36px", borderRadius:14, fontSize:"1rem" }}>View Pricing</Link>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:"1px solid rgba(37,99,235,.1)", padding:"2rem", background:"rgba(255,255,255,.3)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#2563EB,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:".9rem" }}>M</div>
            <span style={{ fontWeight:700, color:"#1e3a5f" }}>MetaLearning</span>
          </div>
          <div style={{ display:"flex", gap:"1.5rem" }}>
            <Link to="/privacy" style={{ color:"#64748b", textDecoration:"none", fontSize:".85rem" }}>Privacy</Link>
            <Link to="/terms" style={{ color:"#64748b", textDecoration:"none", fontSize:".85rem" }}>Terms</Link>
            <Link to="/pricing" style={{ color:"#64748b", textDecoration:"none", fontSize:".85rem" }}>Pricing</Link>
          </div>
          <p style={{ color:"#94a3b8", fontSize:".82rem", margin:0 }}>© 2025 MetaLearning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
