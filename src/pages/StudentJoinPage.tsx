import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Hash, Users, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import "../ai-lab.css";

export function StudentJoinPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinFromUrl = params.get("pin");
    if (pinFromUrl) setPinCode(pinFromUrl);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setLoading(true);
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
        throw new Error(t("join.error_not_found"));
      }

      if (profile) {
        const { error: joinError } = await supabase
          .from("student_joins")
          .insert({
            session_id: sessionData.id,
            student_id: profile.id,
            student_name: profile.full_name || profile.email,
          });
        if (joinError) console.error("Warning: Could not log student join", joinError);
      }

      navigate(`/lesson/${sessionData.lesson_id}?session=${sessionData.id}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-lab-layout pt-20" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
      {/* Language Switcher */}
      <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 50 }}>
        <LanguageSwitcher theme="dark" />
      </div>

      <div className="ai-cyber-panel" style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Users size={48} color="#38bdf8" className="mb-2 inline-block" />
          <h2 className="text-2xl font-bold" style={{ color: "white" }}>
            {t("join.title")}
          </h2>
          <p style={{ color: "#9ca3af" }}>
            {t("join.code_label")}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
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
          </div>

          <button
            type="submit"
            disabled={loading || !pinCode.trim()}
            style={{
              marginTop: "1rem", width: "100%", padding: "16px", borderRadius: "12px",
              background: "linear-gradient(90deg, #0ea5e9, #3b82f6)", border: "none", color: "white",
              fontWeight: "bold", fontSize: "1.2rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px",
              cursor: (loading || !pinCode.trim()) ? "not-allowed" : "pointer",
              opacity: (loading || !pinCode.trim()) ? 0.7 : 1
            }}
          >
            {loading ? <Activity className="animate-pulse" size={24} /> : <Users size={24} />}
            {loading ? t("join.joining") : t("join.btn_join")}
          </button>
        </form>
      </div>
    </div>
  );
}
