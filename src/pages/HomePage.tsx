import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { MetaTags } from "../components/MetaTags";
import { ArrowRight, Zap, Users, BookOpen, Brain, Shield, Star, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const HeroOrb3D = lazy(() => import("../components/HeroOrb3D"));

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return <div ref={ref} style={{ transition: `opacity 0.75s ${delay}s, transform 0.75s ${delay}s`, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(36px)" }}>{children}</div>;
}

const STATS = [
  { label: "Active Learners", value: "3,200+", icon: Users, color: "#2563EB" },
  { label: "3D Lessons",      value: "120+",   icon: BookOpen, color: "#0EA5E9" },
  { label: "AI Features",     value: "12",     icon: Brain, color: "#7C3AED" },
  { label: "Avg. Rating",     value: "4.9 ★",  icon: Star, color: "#F59E0B" },
];
const FEATURES = [
  { icon: Brain,  title: "AI-Powered 3D Learning",  desc: "Generate immersive 3D lessons from text or images using our advanced AI engine.", color: "#2563EB", bg: "rgba(37,99,235,0.06)" },
  { icon: Shield, title: "Live Classroom Sync",      desc: "Control student viewpoints in real-time. Every student sees exactly what you show.", color: "#0EA5E9", bg: "rgba(14,165,233,0.06)" },
  { icon: Zap,    title: "Instant Quizzes & XP",    desc: "Gamified quizzes and leaderboards keep students engaged and motivated.", color: "#7C3AED", bg: "rgba(124,58,237,0.06)" },
];

export function HomePage() {
  const { session, profile } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h); return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true }).then(({ count }) => { if (count) setActiveUsers(count); });
  }, []);

  const dashboardLink = profile?.role === "teacher" ? "/teacher/create"
    : profile?.role === "creator" ? "/creator/lab"
    : profile?.role === "admin" ? "/admin"
    : profile?.role === "student" ? "/student/dashboard"
    : "/auth/role-selection";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EBF4FF 0%,#DBEAFE 35%,#E0F2FE 65%,#F0F9FF 100%)", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <MetaTags title="MetaLearning — The 3D Education Revolution" description="The Future of Education is 3D." />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        /* ── Base glass ── */
        .glass {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.75);
        }

        /* ── PRIMARY glass button (spec: rgba(255,255,255,0.1) / blur(12px)) ── */
        .btn-p {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.22);
          color: #1d4ed8;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 12px rgba(37,99,235,0.12);
          cursor: pointer; font-weight: 700; transition: all .28s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-p:hover {
          background: rgba(255,255,255,0.22);
          border-color: rgba(255,255,255,0.5);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 24px rgba(37,99,235,0.18);
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        /* ── SECONDARY glass button ── */
        .btn-g {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.18);
          color: #374151;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.05);
          cursor: pointer; font-weight: 600; transition: all .28s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-g:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.4);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 20px rgba(0,0,0,0.08);
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        /* ── Nav links ── */
        .nl { color: #4b5563; font-weight: 500; text-decoration: none; font-size: .95rem; transition: color .2s; }
        .nl:hover { color: #2563EB; }

        /* ── Feature cards ── */
        .fcard { transition: all .35s cubic-bezier(.4,0,.2,1); }
        .fcard:hover { transform: translateY(-8px); box-shadow: 0 24px 48px rgba(37,99,235,0.10); }

        /* ── Stat cards ── */
        .scard { transition: transform .3s; }
        .scard:hover { transform: translateY(-4px); }

        /* ── Animations ── */
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes floatCard { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-14px) } }
        @keyframes pulse3d { 0%,100% { opacity:.4; transform:scale(.97) } 50% { opacity:.8; transform:scale(1.02) } }

        .fu  { animation: fadeUp .8s ease both; }
        .fu2 { animation: fadeUp .8s .15s ease both; }
        .fu3 { animation: fadeUp .8s .3s ease both; }
        .fc1 { animation: floatCard 5s   .5s ease-in-out infinite; }
        .fc2 { animation: floatCard 7s   1s  ease-in-out infinite; }
        .fc3 { animation: floatCard 4s   2s  ease-in-out infinite; }
        .fc4 { animation: floatCard 6s   1.5s ease-in-out infinite; }
        .pulse { animation: pulse3d 3s ease-in-out infinite; }

        /* ── Mobile override ── */
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid .social-proof { justify-content: center; }
          .hero-grid .cta-row { justify-content: center; }
          .floating-cards { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 1.5rem" }}>
        <nav className="glass" style={{ maxWidth: 1200, margin: "1rem auto 0", borderRadius: 18, padding: "0.9rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1rem", boxShadow: "0 4px 12px rgba(37,99,235,.3)" }}>M</div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e3a5f", letterSpacing: "-.02em" }}>MetaLearning</span>
          </Link>

          {!isMobile && (
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <Link to="/pricing" className="nl">Pricing</Link>
              <Link to="/leaderboard" className="nl">Leaderboard</Link>
              <Link to="/ar-guide" className="nl">Free Guide</Link>
            </div>
          )}

          <div style={{ display: "flex", gap: ".65rem", alignItems: "center" }}>
            {session ? (
              <>
                {!isMobile && <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: ".88rem", fontWeight: 600 }}><LogOut size={14} /> Sign Out</button>}
                <Link to={dashboardLink} className="btn-p" style={{ padding: "8px 18px", borderRadius: 11, fontSize: ".88rem" }}>Dashboard <ChevronRight size={14} /></Link>
              </>
            ) : (
              <>
                {!isMobile && <Link to="/auth" className="btn-g" style={{ padding: "8px 18px", borderRadius: 11, fontSize: ".88rem" }}>Log In</Link>}
                <Link to="/auth" className="btn-p" style={{ padding: "8px 18px", borderRadius: 11, fontSize: ".88rem" }}>Get Started <ArrowRight size={14} /></Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", paddingTop: 90, overflow: "hidden" }}>

        {/* ── LAYER 0: 3D Scene — CENTERED FULL BACKGROUND ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <Suspense fallback={
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.15) 0%,transparent 70%)" }} className="pulse" />
            </div>
          }>
            <HeroOrb3D />
          </Suspense>
        </div>

        {/* ── LAYER 1: Mobile readability overlay ── */}
        {isMobile && (
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "rgba(235,244,255,0.45)", pointerEvents: "none" }} />
        )}

        {/* ── LAYER 2: Big background "META" text ── */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: "clamp(6rem,20vw,20rem)", fontWeight: 900, color: "rgba(37,99,235,0.04)", lineHeight: 1, letterSpacing: "-.05em", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 1 }}>META</div>

        {/* ── LAYER 3: Hero Content (centered) ── */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "4rem 2rem", width: "100%", position: "relative", zIndex: 2 }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>

            {/* LEFT: Text */}
            <div>
              <div className="fu glass" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 50, marginBottom: "1.5rem" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 0 3px rgba(16,185,129,.2)" }} />
                <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#1e40af" }}>MetaLearning 2.0 is Live</span>
                {activeUsers > 0 && <span style={{ color: "#2563EB", fontWeight: 700, fontSize: ".8rem" }}>· {activeUsers} users</span>}
              </div>

              <h1 className="fu2" style={{ fontSize: "clamp(2.6rem,5vw,4rem)", fontWeight: 900, lineHeight: 1.08, color: "#0f1f3d", margin: "0 0 1.4rem", letterSpacing: "-.03em" }}>
                The Future of<br />
                <span style={{ background: "linear-gradient(135deg,#2563EB,#0EA5E9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Education</span>{" "}is 3D
              </h1>

              <p className="fu3" style={{ fontSize: "1.05rem", color: "#4b5563", lineHeight: 1.7, margin: "0 0 2.2rem", maxWidth: 460 }}>
                Transform any lesson into an immersive 3D experience. Powered by AI, built for the next generation of learners and teachers.
              </p>

              <div className="fu3 cta-row" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                <Link to="/auth" className="btn-p" style={{ padding: "14px 30px", borderRadius: 13, fontSize: "1rem" }}>
                  Start for Free <ArrowRight size={18} />
                </Link>
                <Link to="/join" className="btn-g" style={{ padding: "14px 30px", borderRadius: 13, fontSize: "1rem" }}>
                  I have a PIN
                </Link>
              </div>

              <div className="fu3 social-proof" style={{ marginTop: "1.8rem", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex" }}>
                  {["#2563EB","#0EA5E9","#7C3AED","#10B981"].map((c,i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: "2px solid white", marginLeft: i===0?0:-9, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:".68rem", fontWeight:700 }}>{["T","S","M","A"][i]}</div>
                  ))}
                </div>
                <p style={{ color: "#6b7280", fontSize: ".85rem", margin: 0 }}>
                  Join <strong style={{ color: "#1e40af" }}>3,200+ educators & students</strong> in 3D
                </p>
              </div>
            </div>

            {/* RIGHT: Floating stat cards */}
            <div className="floating-cards" style={{ position: "relative", height: 460, display: "flex", justifyContent: "center", alignItems: "center" }}>
              {/* Glow hint behind cards */}
              <div style={{ width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.1) 0%,transparent 70%)" }} className="pulse" />

              <div className="glass fc1" style={{ position:"absolute", top:"5%", left:"-8%", padding:"11px 16px", borderRadius:15, display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 28px rgba(37,99,235,.1)" }}>
                <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#2563EB,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={17} color="white"/></div>
                <div><p style={{margin:0,fontSize:".68rem",color:"#6b7280",fontWeight:600}}>Active Users</p><p style={{margin:0,fontSize:".95rem",color:"#0f1f3d",fontWeight:800}}>+3,200</p></div>
              </div>

              <div className="glass fc2" style={{ position:"absolute", bottom:"10%", right:"-10%", padding:"11px 16px", borderRadius:15, display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 28px rgba(124,58,237,.12)" }}>
                <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#7C3AED,#A855F7)", display:"flex", alignItems:"center", justifyContent:"center" }}><Brain size={17} color="white"/></div>
                <div><p style={{margin:0,fontSize:".68rem",color:"#6b7280",fontWeight:600}}>AI 3D Lessons</p><p style={{margin:0,fontSize:".95rem",color:"#0f1f3d",fontWeight:800}}>120+ Ready</p></div>
              </div>

              <div className="glass fc3" style={{ position:"absolute", top:"52%", left:"-10%", padding:"9px 14px", borderRadius:13, boxShadow:"0 8px 28px rgba(245,158,11,.12)" }}>
                <p style={{margin:0,fontSize:".68rem",color:"#6b7280",fontWeight:600}}>Avg. Rating</p>
                <p style={{margin:0,fontSize:"1.2rem",fontWeight:900,color:"#F59E0B"}}>4.9 ★</p>
              </div>

              <div className="glass fc4" style={{ position:"absolute", top:"25%", right:"-12%", padding:"9px 14px", borderRadius:13, boxShadow:"0 8px 28px rgba(16,185,129,.12)" }}>
                <p style={{margin:0,fontSize:".68rem",color:"#6b7280",fontWeight:600}}>Satisfaction</p>
                <p style={{margin:0,fontSize:"1.1rem",fontWeight:900,color:"#10B981"}}>98% ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAND ══ */}
      <section style={{ padding: "2rem 1.5rem" }}>
        <Reveal>
          <div className="stats-grid" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
            {STATS.map((s,i) => (
              <Reveal key={s.label} delay={i*0.08}>
                <div className="glass scard" style={{ padding:"1.4rem", borderRadius:20, textAlign:"center", boxShadow:"0 4px 18px rgba(37,99,235,.05)" }}>
                  <div style={{ width:42,height:42,borderRadius:12,background:s.color+"12",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .65rem" }}><s.icon size={21} color={s.color}/></div>
                  <p style={{margin:0,fontSize:"1.7rem",fontWeight:900,color:"#0f1f3d"}}>{s.value}</p>
                  <p style={{margin:"3px 0 0",fontSize:".8rem",color:"#6b7280",fontWeight:500}}>{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <Reveal>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"3rem" }}>
              <span className="glass" style={{ display:"inline-block",padding:"5px 16px",borderRadius:50,fontSize:".78rem",fontWeight:700,color:"#2563EB",marginBottom:"1rem" }}>WHY METALEARNING</span>
              <h2 style={{ fontSize:"clamp(1.9rem,4vw,2.8rem)",fontWeight:900,color:"#0f1f3d",margin:0,letterSpacing:"-.02em" }}>Built for the Next Generation</h2>
              <p style={{ color:"#6b7280",fontSize:"1rem",margin:"0.9rem auto 0",maxWidth:480,lineHeight:1.6 }}>Everything you need to create, share, and experience education in 3D.</p>
            </div>
            <div className="features-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.25rem" }}>
              {FEATURES.map((f,i) => (
                <Reveal key={f.title} delay={i*0.1}>
                  <div className="glass fcard" style={{ padding:"1.8rem",borderRadius:22,boxShadow:"0 4px 18px rgba(37,99,235,.04)",height:"100%" }}>
                    <div style={{ width:50,height:50,borderRadius:14,background:f.bg,border:`1px solid ${f.color}20`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.1rem" }}><f.icon size={25} color={f.color}/></div>
                    <h3 style={{ fontSize:"1.1rem",fontWeight:800,color:"#0f1f3d",margin:"0 0 .65rem" }}>{f.title}</h3>
                    <p style={{ color:"#6b7280",margin:0,lineHeight:1.65,fontSize:".9rem" }}>{f.desc}</p>
                    <div style={{ marginTop:"1.3rem",display:"flex",alignItems:"center",gap:5,color:f.color,fontWeight:700,fontSize:".85rem" }}>Learn more <ChevronRight size={15}/></div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: "3rem 1.5rem 7rem" }}>
        <Reveal>
          <div style={{ maxWidth:680, margin:"0 auto", textAlign:"center" }}>
            <div className="glass" style={{ padding:"3.5rem 2.5rem",borderRadius:28,boxShadow:"0 20px 55px rgba(37,99,235,.08)",position:"relative",overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-70,right:-70,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,.08) 0%,transparent 70%)",pointerEvents:"none" }} />
              <div style={{ position:"absolute",bottom:-50,left:-50,width:150,height:150,borderRadius:"50%",background:"radial-gradient(circle,rgba(14,165,233,.08) 0%,transparent 70%)",pointerEvents:"none" }} />
              <span style={{ display:"inline-block",padding:"5px 16px",borderRadius:50,fontSize:".78rem",fontWeight:700,color:"#2563EB",background:"rgba(37,99,235,.07)",marginBottom:"1.3rem" }}>🚀 START FOR FREE</span>
              <h2 style={{ fontSize:"clamp(1.8rem,4vw,2.4rem)",fontWeight:900,color:"#0f1f3d",margin:"0 0 .9rem",letterSpacing:"-.02em" }}>Ready to Revolutionize Your Classroom?</h2>
              <p style={{ color:"#6b7280",fontSize:"1rem",margin:"0 0 1.8rem",lineHeight:1.6 }}>Join thousands of teachers and students experiencing the future of education.</p>
              <div style={{ display:"flex",gap:"1rem",justifyContent:"center",flexWrap:"wrap" }}>
                <Link to="/auth" className="btn-p" style={{ padding:"14px 32px",borderRadius:13,fontSize:"1rem" }}>Get Started Free <ArrowRight size={18}/></Link>
                <Link to="/pricing" className="btn-g" style={{ padding:"14px 32px",borderRadius:13,fontSize:"1rem" }}>View Pricing</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:"1px solid rgba(37,99,235,.08)",padding:"1.8rem 1.5rem",background:"rgba(255,255,255,.25)" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#2563EB,#0EA5E9)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:".85rem" }}>M</div>
            <span style={{ fontWeight:700,color:"#1e3a5f",fontSize:".95rem" }}>MetaLearning</span>
          </div>
          <div style={{ display:"flex",gap:"1.5rem" }}>
            <Link to="/privacy" style={{ color:"#6b7280",textDecoration:"none",fontSize:".83rem" }}>Privacy</Link>
            <Link to="/terms"   style={{ color:"#6b7280",textDecoration:"none",fontSize:".83rem" }}>Terms</Link>
            <Link to="/pricing" style={{ color:"#6b7280",textDecoration:"none",fontSize:".83rem" }}>Pricing</Link>
          </div>
          <p style={{ color:"#9ca3af",fontSize:".8rem",margin:0 }}>© 2025 MetaLearning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
