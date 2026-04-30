import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

type Role = "teacher" | "student" | "creator" | "admin";

interface RoleCard {
  id: Role;
  emoji: string;
  titleKey: string;
  descKey: string;
  gradient: string;
  border: string;
  glow: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    id: "teacher",
    emoji: "👨‍🏫",
    titleKey: "role.teacher",
    descKey: "role.teacher_desc",
    gradient: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(14,165,233,0.08))",
    border: "#2563EB",
    glow: "rgba(37,99,235,0.20)",
  },
  {
    id: "student",
    emoji: "👨‍🎓",
    titleKey: "role.student",
    descKey: "role.student_desc",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.08))",
    border: "#10b981",
    glow: "rgba(16,185,129,0.20)",
  },
  {
    id: "creator",
    emoji: "🛠️",
    titleKey: "role.creator",
    descKey: "role.creator_desc",
    gradient: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))",
    border: "#7C3AED",
    glow: "rgba(124,58,237,0.20)",
  },
  // ⚠️ SECURITY: admin role is intentionally NOT shown here.
  // Set admin via Supabase SQL Editor only:
  // UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
];

const ROLE_HOME: Record<Role, string> = {
  teacher: "/teacher/create",
  student: "/student/dashboard",
  creator: "/creator/lab",
  admin: "/admin",
};

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile, session, isLoading, refreshProfile } = useAuth();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!session) { navigate("/auth"); return; }
    if (profile?.role) navigate(ROLE_HOME[profile.role as Role] ?? "/");
  }, [profile, session, isLoading, navigate]);

  const handleConfirm = async () => {
    if (!selected || !session?.user) return;
    setLoading(true);
    setError("");
    try {
      const { error: err } = await supabase.from("profiles").upsert({
        id: session.user.id,
        role: selected,
        email: session.user.email,
        full_name:
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0],
        plan: "free",
      });
      if (err) throw err;
      await refreshProfile();
      navigate(ROLE_HOME[selected]);
    } catch (e: any) {
      setError(e.message || "فشل حفظ الدور. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (!session && !profile)) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#EBF4FF 0%,#DBEAFE 40%,#E0F2FE 70%,#F0F9FF 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      color: "#0f1f3d",
      fontFamily: "'Host Grotesk', 'Noto Sans Arabic', sans-serif",
    }}>
      <div style={{ maxWidth: "720px", width: "100%" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)",
            borderRadius: "50px", padding: "0.4rem 1rem", marginBottom: "1.5rem",
            fontSize: "0.8rem", color: "#2563EB", fontWeight: "700", letterSpacing: "0.05em"
          }}>
            ✦ MetaLearning Platform
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: "900", margin: "0 0 0.75rem 0",
            background: "linear-gradient(135deg, #0f1f3d 0%, #2563EB 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-.02em",
          }}>
            {t("role.title")}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", margin: 0, lineHeight: 1.6 }}>
            {t("role.desc")}
          </p>
        </div>

        {/* 2x2 Role Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}>
          {ROLE_CARDS.map((card) => {
            const isActive = selected === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setSelected(card.id)}
                style={{
                  background: isActive
                    ? card.gradient
                    : "rgba(255,255,255,0.45)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1.5px solid ${isActive ? card.border : "rgba(255,255,255,0.75)"}`,
                  borderRadius: "20px",
                  padding: "1.5rem",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                  textAlign: "left",
                  position: "relative",
                  outline: "none",
                  boxShadow: isActive
                    ? `0 0 0 1px ${card.border}30, 0 8px 32px ${card.glow}`
                    : "0 2px 10px rgba(37,99,235,0.05)",
                  transform: isActive ? "translateY(-3px)" : "none",
                }}
              >
                {/* Emoji Icon */}
                <div style={{
                  fontSize: "2.5rem", marginBottom: "0.75rem",
                  filter: isActive ? "none" : "grayscale(30%)",
                  transition: "filter 0.25s",
                }}>
                  {card.emoji}
                </div>

                {/* Text */}
                <h3 style={{
                  margin: "0 0 0.4rem 0", fontSize: "1.05rem", fontWeight: "700",
                  color: isActive ? card.border : "#1e3a5f",
                }}>
                  {t(card.titleKey)}
                </h3>
                <p style={{
                  margin: 0, fontSize: "0.82rem",
                  color: isActive ? "#374151" : "#9ca3af",
                  lineHeight: 1.5,
                }}>
                  {t(card.descKey)}
                </p>

                {/* Check Badge */}
                {isActive && (
                  <div style={{
                    position: "absolute", top: "1rem", right: "1rem",
                    color: card.border,
                  }}>
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px", padding: "0.75rem 1rem", marginBottom: "1rem",
            color: "#b91c1c", fontSize: "0.875rem", textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {/* Confirm Button */}
        <button
          disabled={!selected || loading}
          onClick={handleConfirm}
          style={{
            width: "100%", padding: "1rem 2rem",
            borderRadius: "16px",
            background: selected
              ? `linear-gradient(135deg, ${ROLE_CARDS.find(c => c.id === selected)?.border ?? "#2563EB"}, #0EA5E9)`
              : "rgba(255,255,255,0.3)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: selected ? "none" : "1px solid rgba(37,99,235,0.15)",
            color: selected ? "white" : "#9ca3af",
            fontWeight: "700",
            fontSize: "1rem",
            cursor: selected && !loading ? "pointer" : "not-allowed",
            opacity: selected && !loading ? 1 : 0.6,
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            boxShadow: selected ? "0 8px 24px rgba(37,99,235,0.25)" : "none",
            fontFamily: "inherit",
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: "18px", height: "18px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }} />
              {t("auth.loading")}
            </>
          ) : (
            <>
              {selected ? `${ROLE_CARDS.find(c => c.id === selected)?.emoji} ` : ""}
              {t("role.btn_confirm")} →
            </>
          )}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
