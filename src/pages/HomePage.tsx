import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { MetaTags } from "../components/MetaTags";
import { ArrowRight, Zap, Users, BookOpen, Brain, Shield, Star, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const HeroOrb3D = lazy(() => import("../components/HeroOrb3D"));

const STATS = [
  { label: "Active Learners", value: "3,200+", icon: Users,    color: "#2563EB" },
  { label: "3D Lessons",      value: "120+",   icon: BookOpen, color: "#0EA5E9" },
  { label: "AI Features",     value: "12",     icon: Brain,    color: "#7C3AED" },
  { label: "Avg. Rating",     value: "4.9 ★",  icon: Star,     color: "#F59E0B" },
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
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    supabase.from("profiles").select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count) setActiveUsers(count); });
  }, []);

  const dashboardLink =
    profile?.role === "teacher" ? "/teacher/create"
    : profile?.role === "creator" ? "/creator/lab"
    : profile?.role === "admin" ? "/admin"
    : profile?.role === "student" ? "/student/dashboard"
    : "/auth/role-selection";

  return (
    <div dir="ltr" style={{ minHeight: "100vh", background: "linear-gradient(160deg,#EBF5FF 0%,#DBEAFE 35%,#E0F2FE 65%,#F0F9FF 100%)", fontFamily: "'Inter',system-ui,sans-serif", overflowX: "hidden" }}>
      <MetaTags title="MetaLearning — The 3D Education Revolution" description="The Future of Education is 3D." />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }

        .glass {
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.75);
        }

        /* PRIMARY glass button */
        .btn-p {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.3);
          color: #1d4ed8;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 14px rgba(37,99,235,0.1);
          cursor: pointer; font-weight: 700; transition: all .25s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 7px;
        }
        .btn-p:hover {
          background: rgba(255,255,255,0.28);
          border-color: rgba(255,255,255,0.6);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(37,99,235,0.15);
          transform: translateY(-2px);
          filter: brightness(1.06);
        }

        /* SECONDARY glass button */
        .btn-g {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          color: #374151;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 10px rgba(0,0,0,0.04);
          cursor: pointer; font-weight: 600; transition: all .25s;
          text-decoration: none; display: inline-flex; align-items: center; gap: 7px;
        }
        .btn-g:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        .nl { color: #4b5563; font-weight: 500; text-decoration: none; font-size: .94rem; transition: color .2s; }
        .nl:hover { color: #2563EB; }

        .fcard { transition: transform .3s, box-shadow .3s; }
        .fcard:hover { transform: translateY(-7px); box-shadow: 0 22px 45px rgba(37,99,235,.09) !important; }

        .scard { transition: transform .25s; }
        .scard:hover { transform: translateY(-4px); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-13px)} }
        @keyframes pulseGlow { 0%,100%{opacity:.35;transform:scale(.97)} 50%{opacity:.7;transform:scale(1.02)} }

        .fu  { animation: fadeUp .8s ease both; }
        .fu2 { animation: fadeUp .8s .14s ease both; }
        .fu3 { animation: fadeUp .8s .28s ease both; }
        .fc1 { animation: floatCard 5s  .4s ease-in-out infinite; }
        .fc2 { animation: floatCard 7s  1s  ease-in-out infinite; }
        .fc3 { animation: floatCard 4.5s 2s ease-in-out infinite; }
        .fc4 { animation: floatCard 6s  1.5s ease-in-out infinite; }
        .pulse { animation: pulseGlow 3s ease-in-out infinite; }

        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .fcards { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .feat-grid  { grid-template-columns: 1fr !important; }
          .cta-row { justify-content: center !important; flex-wrap: wrap; }
          .sp { justify-content: center !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 1.5rem" }}>
        <nav className="glass" style={{ maxWidth: 1200, margin: ".9rem auto 0", borderRadius: 18, padding: ".85rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: ".95rem", boxShadow: "0 4px 12px rgba(37,99,235,.28)" }}>M</div>
            {!isMobile && <span style={{ fontWeight: 800, fontSize: "1.08rem", color: "#1e3a5f", letterSpacing: "-.02em" }}>MetaLearning</span>}
          </Link>
          {!isMobile && (
            <div style={{ display: "flex", gap: "1.8rem" }}>
              <Link to="/pricing"    className="nl">Pricing</Link>
              <Link to="/leaderboard" className="nl">Leaderboard</Link>
              <Link to="/ar-guide"   className="nl">Free Guide</Link>
            </div>
          )}
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}>
            {session ? (
              <>
                {!isMobile && <button onClick={() => supabase.auth.signOut()} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: ".87rem", fontWeight: 600 }}><LogOut size={14} /> Sign Out</button>}
                <Link to={dashboardLink} className="btn-p" style={{ padding: "8px 17px", borderRadius: 11, fontSize: ".87rem" }}>Dashboard <ChevronRight size={14} /></Link>
              </>
            ) : (
              <>
                {!isMobile && <Link to="/auth" className="btn-g" style={{ padding: "8px 17px", borderRadius: 11, fontSize: ".87rem" }}>Log In</Link>}
                <Link to="/auth" className="btn-p" style={{ padding: "8px 17px", borderRadius: 11, fontSize: ".87rem" }}>Get Started <ArrowRight size={14} /></Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", paddingTop: 88, overflow: "hidden" }}>

        {/* LAYER 0 — 3D scene (full section bg) */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <Suspense fallback={
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 70%)" }} className="pulse" />
            </div>
          }>
            <HeroOrb3D />
          </Suspense>
        </div>

        {/* LAYER 1 — Mobile overlay for readability */}
        {isMobile && (
          <div style={{ position:"absolute", inset:0, zIndex:1, background:"rgba(235,244,255,0.5)", pointerEvents:"none" }} />
        )}

        {/* LAYER 2 — Big "META" bg text */}
        <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", fontSize:"clamp(5rem,18vw,19rem)", fontWeight:900, color:"rgba(37,99,235,0.035)", lineHeight:1, letterSpacing:"-.05em", userSelect:"none", pointerEvents:"none", whiteSpace:"nowrap", zIndex:1 }}>META</div>

        {/* LAYER 3 — Hero content */}
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"4rem 2rem", width:"100%", position:"relative", zIndex:2 }}>
          <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"center" }}>

            {/* LEFT */}
            <div>
              <div className="fu glass" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:50, marginBottom:"1.4rem" }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 0 3px rgba(16,185,129,.2)" }} />
                <span style={{ fontSize:".79rem", fontWeight:600, color:"#1e40af" }}>MetaLearning 2.0 is Live</span>
                {activeUsers > 0 && <span style={{ color:"#2563EB", fontWeight:700, fontSize:".79rem" }}>· {activeUsers} users</span>}
              </div>

              <h1 className="fu2" style={{ fontSize:"clamp(2.5rem,5vw,3.9rem)", fontWeight:900, lineHeight:1.08, color:"#0f1f3d", margin:"0 0 1.3rem", letterSpacing:"-.03em" }}>
                The Future of<br />
                <span style={{ background:"linear-gradient(135deg,#2563EB,#0EA5E9)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Education</span>{" "}is 3D
              </h1>

              <p className="fu3" style={{ fontSize:"1.03rem", color:"#4b5563", lineHeight:1.72, margin:"0 0 2.1rem", maxWidth:450 }}>
                Transform any lesson into an immersive 3D experience. Powered by AI, built for the next generation of learners and teachers.
              </p>

              <div className="fu3 cta-row" style={{ display:"flex", gap:"1rem", alignItems:"center" }}>
                <Link to="/auth" className="btn-p" style={{ padding:"14px 30px", borderRadius:13, fontSize:"1rem" }}>Start for Free <ArrowRight size={17} /></Link>
                <Link to="/join" className="btn-g" style={{ padding:"14px 30px", borderRadius:13, fontSize:"1rem" }}>I have a PIN</Link>
              </div>

              <div className="fu3 sp" style={{ marginTop:"1.7rem", display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ display:"flex" }}>
                  {["#2563EB","#0EA5E9","#7C3AED","#10B981"].map((c,i)=>(
                    <div key={i} style={{ width:30, height:30, borderRadius:"50%", background:c, border:"2.5px solid white", marginLeft:i===0?0:-8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:".65rem", fontWeight:700 }}>{["T","S","M","A"][i]}</div>
                  ))}
                </div>
                <p style={{ color:"#6b7280", fontSize:".83rem", margin:0 }}>Join <strong style={{ color:"#1e40af" }}>3,200+ educators & students</strong> in 3D</p>
              </div>
            </div>

            {/* RIGHT — Floating stat cards */}
            <div className="fcards" style={{ position:"relative", height:440, display:"flex", justifyContent:"center", alignItems:"center" }}>
              <div style={{ width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,.08) 0%,transparent 70%)" }} className="pulse" />

              <div className="glass fc1" style={{ position:"absolute", top:"5%", left:"-6%", padding:"11px 16px", borderRadius:15, display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 26px rgba(37,99,235,.09)" }}>
                <div style={{ width:33, height:33, borderRadius:10, background:"linear-gradient(135deg,#2563EB,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center" }}><Users size={16} color="white"/></div>
                <div><p style={{margin:0,fontSize:".67rem",color:"#6b7280",fontWeight:600}}>Active Users</p><p style={{margin:0,fontSize:".92rem",color:"#0f1f3d",fontWeight:800}}>+3,200</p></div>
              </div>

              <div className="glass fc2" style={{ position:"absolute", bottom:"8%", right:"-10%", padding:"11px 16px", borderRadius:15, display:"flex", alignItems:"center", gap:10, boxShadow:"0 8px 26px rgba(124,58,237,.1)" }}>
                <div style={{ width:33, height:33, borderRadius:10, background:"linear-gradient(135deg,#7C3AED,#A855F7)", display:"flex", alignItems:"center", justifyContent:"center" }}><Brain size={16} color="white"/></div>
                <div><p style={{margin:0,fontSize:".67rem",color:"#6b7280",fontWeight:600}}>AI 3D Lessons</p><p style={{margin:0,fontSize:".92rem",color:"#0f1f3d",fontWeight:800}}>120+ Ready</p></div>
              </div>

              <div className="glass fc3" style={{ position:"absolute", top:"50%", left:"-9%", padding:"9px 14px", borderRadius:13, boxShadow:"0 8px 26px rgba(245,158,11,.1)" }}>
                <p style={{margin:0,fontSize:".67rem",color:"#6b7280",fontWeight:600}}>Avg. Rating</p>
                <p style={{margin:0,fontSize:"1.15rem",fontWeight:900,color:"#F59E0B"}}>4.9 ★</p>
              </div>

              <div className="glass fc4" style={{ position:"absolute", top:"22%", right:"-11%", padding:"9px 14px", borderRadius:13, boxShadow:"0 8px 26px rgba(16,185,129,.1)" }}>
                <p style={{margin:0,fontSize:".67rem",color:"#6b7280",fontWeight:600}}>Satisfaction</p>
                <p style={{margin:0,fontSize:"1.05rem",fontWeight:900,color:"#10B981"}}>98% ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ padding:"2.5rem 1.5rem", background:"rgba(255,255,255,0.25)" }}>
        <div className="stats-grid" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
          {STATS.map(s => (
            <div key={s.label} className="glass scard" style={{ padding:"1.4rem", borderRadius:20, textAlign:"center", boxShadow:"0 4px 16px rgba(37,99,235,.05)" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:s.color+"12", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto .6rem" }}><s.icon size={21} color={s.color}/></div>
              <p style={{margin:0,fontSize:"1.65rem",fontWeight:900,color:"#0f1f3d"}}>{s.value}</p>
              <p style={{margin:"3px 0 0",fontSize:".79rem",color:"#6b7280",fontWeight:500}}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding:"5rem 1.5rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"2.8rem" }}>
            <span className="glass" style={{ display:"inline-block", padding:"5px 15px", borderRadius:50, fontSize:".77rem", fontWeight:700, color:"#2563EB", marginBottom:"1rem" }}>WHY METALEARNING</span>
            <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.7rem)", fontWeight:900, color:"#0f1f3d", margin:0, letterSpacing:"-.02em" }}>Built for the Next Generation</h2>
            <p style={{ color:"#6b7280", fontSize:"1rem", margin:".8rem auto 0", maxWidth:460, lineHeight:1.65 }}>Everything you need to create, share, and experience education in 3D.</p>
          </div>
          <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.2rem" }}>
            {FEATURES.map(f => (
              <div key={f.title} className="glass fcard" style={{ padding:"1.7rem", borderRadius:22, boxShadow:"0 4px 16px rgba(37,99,235,.04)" }}>
                <div style={{ width:48, height:48, borderRadius:14, background:f.bg, border:`1px solid ${f.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1rem" }}><f.icon size={24} color={f.color}/></div>
                <h3 style={{ fontSize:"1.08rem", fontWeight:800, color:"#0f1f3d", margin:"0 0 .6rem" }}>{f.title}</h3>
                <p style={{ color:"#6b7280", margin:0, lineHeight:1.65, fontSize:".88rem" }}>{f.desc}</p>
                <div style={{ marginTop:"1.2rem", display:"flex", alignItems:"center", gap:5, color:f.color, fontWeight:700, fontSize:".83rem" }}>Learn more <ChevronRight size={14}/></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:"3rem 1.5rem 7rem" }}>
        <div style={{ maxWidth:660, margin:"0 auto", textAlign:"center" }}>
          <div className="glass" style={{ padding:"3.5rem 2.5rem", borderRadius:28, boxShadow:"0 18px 50px rgba(37,99,235,.07)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-60, right:-60, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,.07) 0%,transparent 70%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-45, left:-45, width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,.07) 0%,transparent 70%)", pointerEvents:"none" }} />
            <span style={{ display:"inline-block", padding:"5px 15px", borderRadius:50, fontSize:".77rem", fontWeight:700, color:"#2563EB", background:"rgba(37,99,235,.06)", marginBottom:"1.2rem" }}>🚀 START FOR FREE</span>
            <h2 style={{ fontSize:"clamp(1.7rem,3.5vw,2.3rem)", fontWeight:900, color:"#0f1f3d", margin:"0 0 .85rem", letterSpacing:"-.02em" }}>Ready to Revolutionize Your Classroom?</h2>
            <p style={{ color:"#6b7280", fontSize:".98rem", margin:"0 0 1.7rem", lineHeight:1.65 }}>Join thousands of teachers and students experiencing the future of education.</p>
            <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
              <Link to="/auth"    className="btn-p" style={{ padding:"14px 30px", borderRadius:13, fontSize:"1rem" }}>Get Started Free <ArrowRight size={17}/></Link>
              <Link to="/pricing" className="btn-g" style={{ padding:"14px 30px", borderRadius:13, fontSize:"1rem" }}>View Pricing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:"1px solid rgba(37,99,235,.07)", padding:"1.7rem 1.5rem", background:"rgba(255,255,255,.2)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:27, height:27, borderRadius:8, background:"linear-gradient(135deg,#2563EB,#0EA5E9)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:".82rem" }}>M</div>
            <span style={{ fontWeight:700, color:"#1e3a5f", fontSize:".92rem" }}>MetaLearning</span>
          </div>
          <div style={{ display:"flex", gap:"1.4rem" }}>
            {["Privacy","Terms","Pricing"].map(l => <Link key={l} to={`/${l.toLowerCase()}`} style={{ color:"#6b7280", textDecoration:"none", fontSize:".81rem" }}>{l}</Link>)}
          </div>
          <p style={{ color:"#9ca3af", fontSize:".79rem", margin:0 }}>© 2025 MetaLearning. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
