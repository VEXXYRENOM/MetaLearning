import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../ai-lab.css";

// CSS-only floating dots to avoid WebGL context exhaustion
const HubBackground = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {Array.from({ length: 30 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          borderRadius: "50%",
          width: `${4 + Math.random() * 6}px`,
          height: `${4 + Math.random() * 6}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: i % 2 === 0 ? "#a78bfa" : "#60a5fa",
          opacity: 0.25 + Math.random() * 0.35,
          animation: `hub-float ${4 + Math.random() * 6}s ease-in-out infinite alternate`,
          animationDelay: `${Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

export function AIGenerationHubPage() {
  const { t } = useTranslation();
  return (
    <div className="ml-landing" style={{ 
      minHeight: "100vh", position: "relative",
      background: "linear-gradient(160deg,#EBF4FF 0%,#DBEAFE 40%,#E0F2FE 70%,#F0F9FF 100%)",
      color: "#0f1f3d"
    }} dir={t("dir") === "rtl" ? "rtl" : "ltr"}>
      <style>{`
        @keyframes hub-float {
          from { transform: translateY(0px) scale(1); }
          to   { transform: translateY(-24px) scale(1.15); }
        }
      `}</style>

      {/* CSS-only animated background (no WebGL) */}
      <HubBackground />

      {/* Main Content */}
      <div className="ml-phase active" style={{ zIndex: 1, position: "relative", paddingTop: "6rem" }}>

        {/* Back Button */}
        <Link
          to="/"
          style={{
            position: "absolute", top: "2rem", left: t("dir") === "rtl" ? "auto" : "2rem", right: t("dir") === "rtl" ? "2rem" : "auto",
            color: "#a78bfa", textDecoration: "none", fontSize: "1.1rem",
            fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", zIndex: 10,
          }}
        >
          {t("nav.back_hub")}
        </Link>

        <div className="ml-options-header" style={{ marginBottom: "3rem", textAlign: "center", padding: "0 1rem" }}>
          <h2 className="ml-options-title" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#0f1f3d", textShadow: "none", margin: "0 0 1rem 0" }}>{t("options.lab_title")}</h2>
          <p className="ml-options-sub" style={{ fontSize: "clamp(1rem, 3vw, 1.2rem)", color: "#6b7280" }}>{t("options.lab_desc")}</p>
        </div>

        {/* Cards */}
        <div className="ml-options-grid" style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 2rem" }}>

          <Link
            to="/experience/image-to-3d"
            className="ml-option-card"
            style={{ minHeight: "350px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", color: "#0f1f3d", borderRadius: "16px", padding: "2rem", textDecoration: "none" }}
          >
            <div>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🖼️</div>
              <h3 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#0f1f3d" }}>Image to 3D</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#6b7280" }}>
                Transform your existing 2D images or sketches into high-quality, fully interactive 3D models with advanced depth analysis.
              </p>
            </div>
            <span className="ml-option-link" style={{ fontSize: "1.2rem", marginTop: "2rem", display: "inline-block", color: "#2563EB", fontWeight: 700 }}>
              Open Image Lab →
            </span>
          </Link>

          {/* Card 2: Text to 3D */}
          <Link
            to="/experience/text-to-3d"
            className="ml-option-card"
            style={{
              minHeight: "350px", display: "flex", flexDirection: "column", justifyContent: "space-between",
              borderColor: "rgba(37, 99, 235, 0.4)", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)", color: "#0f1f3d", borderRadius: "16px", padding: "2rem", textDecoration: "none"
            }}
          >
            <div>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✨</div>
              <h3 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#0f1f3d" }}>Text to 3D</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: "#6b7280" }}>
                Describe any object or scene using natural language, and let our generative AI engine build it from scratch in full 3D space.
              </p>
            </div>
            <span className="ml-option-link" style={{ fontSize: "1.2rem", marginTop: "2rem", display: "inline-block", color: "#2563EB", fontWeight: 700 }}>
              Open Text Lab →
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}
