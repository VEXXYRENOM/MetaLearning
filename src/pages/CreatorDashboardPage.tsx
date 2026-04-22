import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Image, Type, Sparkles, Clock, ArrowRight, Zap } from "lucide-react";

export function CreatorDashboardPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const firstName = profile?.full_name?.split(" ")[0] ?? "Creator";

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 10% 30%, rgba(168,85,247,0.1) 0%, transparent 50%), #020617",
      color: "white",
      fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif",
      padding: "2rem",
    }}>

      {/* Top Bar */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "3rem", maxWidth: "1100px", margin: "0 auto 3rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
          }}>🛠️</div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600", letterSpacing: "0.1em" }}>
              METALEARNING
            </div>
            <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>Creator Studio</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: "50px", padding: "0.35rem 0.75rem",
            fontSize: "0.78rem", color: "#c084fc",
          }}>
            🛠️ Creator
          </div>
          <div style={{
            background: "rgba(255,255,255,0.05)", borderRadius: "50px",
            padding: "0.35rem 0.75rem", fontSize: "0.85rem", color: "#94a3b8",
          }}>
            {profile?.email}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Welcome */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "900", margin: "0 0 0.5rem 0",
            background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            مرحباً، {firstName} 👋
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "1rem" }}>
            استوديو الإبداع الخاص بك — حوّل أفكارك إلى نماذج ثلاثية الأبعاد
          </p>
        </div>

        {/* Main Lab Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem",
          marginBottom: "2.5rem",
        }}>

          {/* Image to 3D */}
          <Link to="/experience/image-to-3d" style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: "24px", padding: "2rem", cursor: "pointer",
              transition: "all 0.3s", position: "relative", overflow: "hidden",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(59,130,246,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.25)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "100px", height: "100px",
                background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
              }} />
              <Image size={40} color="#3b82f6" style={{ marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>
                صورة ← نموذج 3D
              </h2>
              <p style={{ color: "#64748b", margin: "0 0 1.5rem 0", lineHeight: 1.6, fontSize: "0.9rem" }}>
                ارفع صورة أي جسم وحوّلها إلى نموذج ثلاثي الأبعاد تفاعلي عالي الدقة.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                color: "#3b82f6", fontWeight: "700", fontSize: "0.9rem",
              }}>
                ابدأ التحويل <ArrowRight size={16} />
              </div>
            </div>
          </Link>

          {/* Text to 3D */}
          <Link to="/experience/text-to-3d" style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(139,92,246,0.08))",
              border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: "24px", padding: "2rem", cursor: "pointer",
              transition: "all 0.3s", position: "relative", overflow: "hidden",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#a855f7";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(168,85,247,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(168,85,247,0.25)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "100px", height: "100px",
                background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
              }} />
              <Type size={40} color="#a855f7" style={{ marginBottom: "1rem" }} />
              <h2 style={{ fontSize: "1.4rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>
                نص ← نموذج 3D
              </h2>
              <p style={{ color: "#64748b", margin: "0 0 1.5rem 0", lineHeight: 1.6, fontSize: "0.9rem" }}>
                صِف أي جسم أو مشهد بكلماتك واتركنا نبنيه بالكامل في الفضاء ثلاثي الأبعاد.
              </p>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                color: "#a855f7", fontWeight: "700", fontSize: "0.9rem",
              }}>
                ابدأ التوليد <ArrowRight size={16} />
              </div>
            </div>
          </Link>

        </div>

        {/* Quick Info Strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem",
        }}>
          {[
            { icon: <Sparkles size={20} color="#a855f7" />, label: "مدعوم بالذكاء الاصطناعي", sub: "Fal.ai + procedural engine" },
            { icon: <Zap size={20} color="#f59e0b" />, label: "توليد فوري", sub: "معالجة تحت الثانية" },
            { icon: <Clock size={20} color="#10b981" />, label: "متاح 24/7", sub: "بدون قيود وقت" },
          ].map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "16px", padding: "1.25rem",
              display: "flex", alignItems: "center", gap: "1rem",
            }}>
              <div style={{
                width: "40px", height: "40px", background: "rgba(255,255,255,0.03)",
                borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{item.label}</div>
                <div style={{ color: "#475569", fontSize: "0.78rem" }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
