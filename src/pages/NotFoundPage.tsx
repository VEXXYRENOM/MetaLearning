import { Link } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

export function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "white",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif",
      padding: "2rem", textAlign: "center"
    }}>
      <AlertTriangle size={64} color="#f59e0b" style={{ marginBottom: "1.5rem" }} />
      <h1 style={{
        fontSize: "6rem", fontWeight: 900, margin: "0 0 0.5rem",
        background: "linear-gradient(135deg, #fff, #475569)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>404</h1>
      <h2 style={{ color: "#94a3b8", margin: "0 0 1rem", fontSize: "1.5rem" }}>
        Page Not Found
      </h2>
      <p style={{ color: "#475569", maxWidth: "400px", lineHeight: 1.6 }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{
        marginTop: "2rem",
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "linear-gradient(135deg, #3b82f6, #a855f7)",
        color: "white", padding: "12px 24px", borderRadius: "12px",
        textDecoration: "none", fontWeight: "bold"
      }}>
        <Home size={18} /> Back to Home
      </Link>

      {/* Decorative glows */}
      <div style={{
        position: "fixed", top: "20%", left: "10%", width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "20%", right: "10%", width: "250px", height: "250px",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}
