import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { MetaTags } from "../components/MetaTags";
import { Zap, Crown, Trophy, ArrowRight, Star, ShieldCheck } from "lucide-react";
import { supabase } from "../services/supabaseClient";

// CSS-only animated background — zero WebGL context cost
const CSSBackground = () => (
  <div style={{
    position: "absolute", inset: 0, overflow: "hidden",
    background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.08) 0%, transparent 60%), #020617",
    zIndex: 0
  }}>
    {[
      { size: 300, x: "10%", y: "20%", color: "rgba(99,102,241,0.06)", dur: 8, delay: 0 },
      { size: 200, x: "80%", y: "60%", color: "rgba(168,85,247,0.06)", dur: 10, delay: 2 },
      { size: 150, x: "50%", y: "80%", color: "rgba(6,182,212,0.05)",  dur: 12, delay: 4 },
    ].map((orb, i) => (
      <div key={i} style={{
        position: "absolute", width: orb.size, height: orb.size,
        left: orb.x, top: orb.y, borderRadius: "50%",
        background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
        animation: `cssOrb ${orb.dur}s ease-in-out infinite`,
        animationDelay: `${orb.delay}s`,
      }} />
    ))}
    <style>{`@keyframes cssOrb { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }`}</style>
  </div>
);

// ─── LEADERBOARD COMPONENT ───
const TopPlayers = () => {
  const [top, setTop] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('global_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(3);
      if (data) setTop(data);
    }
    load();
  }, []);

  if (top.length === 0) return null;

  return (
    <div style={{ marginTop: "4rem", textAlign: "center" }}>
      <p style={{ color: "#06b6d4", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
        <Trophy size={16} style={{ verticalAlign: "middle", marginRight: "6px" }} />
        GLOBAL TOP SCHOLARS
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
        {top.map((player) => (
          <div key={player.id} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)", borderRadius: "16px", padding: "1rem 1.5rem",
            display: "flex", alignItems: "center", gap: "12px", minWidth: "220px"
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: player.rank === 1 ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : player.rank === 2 ? "linear-gradient(135deg, #94a3b8, #cbd5e1)" : "linear-gradient(135deg, #b45309, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold"
            }}>
              #{player.rank}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, color: "white", fontWeight: 600, fontSize: "0.95rem" }}>{player.full_name || "Anonymous"}</p>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <Zap size={12} color="#a855f7" /> {player.points?.toLocaleString() || 0} XP
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};




export function HomePage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith("ar") ? "ar" : "en";

  return (
    <div style={{
      minHeight: "100vh", position: "relative", overflowX: "hidden",
      background: "#020617", fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <MetaTags title="MetaLearning — The 3D Education Revolution" description="The Future of Tunisian Education is 3D." />

      {/* CSS Animated Background — no WebGL context used */}
      <CSSBackground />

      {/* Navigation */}
      <header style={{
        position: "relative", zIndex: 10, padding: "1.5rem 2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #06b6d4, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>M</div>
          <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "white", letterSpacing: "0.05em" }}>MetaLearning</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <LanguageSwitcher theme="dark" />
          <Link to="/auth" style={{ color: "white", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem" }}>Log In</Link>
          <Link to="/auth" style={{
            background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
            color: "white", textDecoration: "none", padding: "10px 20px", borderRadius: "999px",
            fontWeight: 700, fontSize: "0.95rem", boxShadow: "0 4px 15px rgba(6,182,212,0.3)"
          }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "6rem 2rem 4rem", textAlign: "center" }}>
        
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(6,182,212,0.1)",
          border: "1px solid rgba(6,182,212,0.3)", borderRadius: "999px", padding: "8px 16px",
          color: "#06b6d4", fontSize: "0.85rem", fontWeight: 700, marginBottom: "2rem"
        }}>
          <Star size={14} /> MetaLearning 2.0 is Live
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 1.5rem",
          background: "linear-gradient(135deg, #ffffff 30%, #93c5fd 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          The Future of <span style={{ color: "#06b6d4", WebkitTextFillColor: "#06b6d4" }}>Tunisian Education</span> is 3D
        </h1>

        <p style={{ color: "#94a3b8", fontSize: "clamp(1rem, 2vw, 1.25rem)", maxWidth: "700px", margin: "0 auto 3rem", lineHeight: 1.6 }}>
          Join the MetaLearning Revolution. Step into immersive interactive environments, compete globally, and transform the way you learn forever.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link to="/auth" style={{
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            color: "white", textDecoration: "none", padding: "16px 36px", borderRadius: "999px",
            fontWeight: 800, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 8px 30px rgba(168,85,247,0.4)"
          }}>
            Join the Revolution <ArrowRight size={20} />
          </Link>
          <Link to="/join" style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "white", textDecoration: "none", padding: "16px 36px", borderRadius: "999px",
            fontWeight: 600, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(10px)"
          }}>
            I have a PIN Code
          </Link>
        </div>

        {/* Top Players */}
        <TopPlayers />

      </main>

      {/* Pricing Section */}
      <section style={{ position: "relative", zIndex: 10, background: "#020617", padding: "4rem 2rem 8rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "white", margin: "0 0 1rem" }}>Simple, Transparent Pricing</h2>
            <p style={{ color: "#64748b", fontSize: "1.1rem", margin: 0 }}>Choose the plan that fits your ambition.</p>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", alignItems: "stretch" }}>
            
            {/* Free */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "24px", padding: "2.5rem", flex: "1 1 300px", maxWidth: "340px",
              display: "flex", flexDirection: "column"
            }}>
              <h3 style={{ fontSize: "1.5rem", color: "white", margin: "0 0 0.5rem" }}>FREE</h3>
              <p style={{ color: "#64748b", margin: "0 0 2rem", minHeight: "45px" }}>Perfect to taste the 3D learning experience.</p>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "white" }}>0</span>
                <span style={{ color: "#64748b" }}> د.ت / month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", flex: 1 }}>
                <li style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> 3 daily lessons</li>
                <li style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> Basic 3D library</li>
                <li style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> Standard XP</li>
              </ul>
              <Link to="/auth" style={{
                display: "block", textAlign: "center", background: "rgba(255,255,255,0.05)",
                color: "white", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: 600
              }}>Start Free</Link>
            </div>

            {/* Pro */}
            <div style={{
              background: "linear-gradient(180deg, rgba(6,182,212,0.1) 0%, rgba(2,6,23,0) 100%)",
              border: "1px solid rgba(6,182,212,0.3)",
              boxShadow: "0 0 40px rgba(6,182,212,0.15)",
              borderRadius: "24px", padding: "2.5rem", flex: "1 1 300px", maxWidth: "340px",
              display: "flex", flexDirection: "column", position: "relative", transform: "scale(1.05)", zIndex: 2
            }}>
              <div style={{ position: "absolute", top: "-15px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #0891b2, #06b6d4)", color: "white", fontSize: "0.75rem", fontWeight: 800, padding: "6px 16px", borderRadius: "999px", letterSpacing: "0.1em" }}>MOST POPULAR</div>
              <h3 style={{ fontSize: "1.5rem", color: "white", margin: "0 0 0.5rem" }}>PRO</h3>
              <p style={{ color: "#64748b", margin: "0 0 2rem", minHeight: "45px" }}>The full academy in your pocket.</p>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "#06b6d4" }}>20</span>
                <span style={{ color: "#64748b" }}> د.ت / month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", flex: 1 }}>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> Unlimited lessons</li>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> Global Leaderboard</li>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> Image-to-3D AI</li>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#06b6d4" /> All Badges</li>
              </ul>
              <Link to="/auth" style={{
                display: "block", textAlign: "center", background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                color: "white", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: 700,
                boxShadow: "0 8px 20px rgba(6,182,212,0.3)"
              }}>Get PRO</Link>
            </div>

            {/* Max */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(245,158,11,0.4)",
              boxShadow: "0 0 30px rgba(245,158,11,0.1)",
              borderRadius: "24px", padding: "2.5rem", flex: "1 1 300px", maxWidth: "340px",
              display: "flex", flexDirection: "column"
            }}>
              <h3 style={{ fontSize: "1.5rem", color: "white", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "8px" }}>MAX <Crown size={20} color="#f59e0b" /></h3>
              <p style={{ color: "#64748b", margin: "0 0 2rem", minHeight: "45px" }}>Uncompromised immersion and priority.</p>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "#f59e0b" }}>30</span>
                <span style={{ color: "#64748b" }}> د.ت / month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", flex: 1 }}>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#f59e0b" /> Everything in PRO</li>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#f59e0b" /> Ultra 4K Textures</li>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#f59e0b" /> Early Access Models</li>
                <li style={{ color: "#e2e8f0", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><ShieldCheck size={18} color="#f59e0b" /> Legendary Glow Badges</li>
              </ul>
              <Link to="/auth" style={{
                display: "block", textAlign: "center", background: "linear-gradient(135deg, #d97706, #f59e0b)",
                color: "white", textDecoration: "none", padding: "14px", borderRadius: "12px", fontWeight: 700,
                boxShadow: "0 8px 20px rgba(245,158,11,0.3)"
              }}>Get MAX</Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
