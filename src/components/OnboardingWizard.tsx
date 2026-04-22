import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Cuboid, CheckCircle, Lightbulb, X } from "lucide-react";
import { Link } from "react-router-dom";
import "../ai-lab.css"; // For animations and UI styles

export function OnboardingWizard({ role, onComplete }: { role: "teacher" | "student" | "creator" | "admin", onComplete: () => void }) {
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    setIsClosing(true);
    if (profile) {
      await supabase.from("profiles")
        .update({ onboarding_done: true })
        .eq("id", profile.id);
      await refreshProfile(); // Sync AuthContext immediately to prevent stale state
    }
    setTimeout(() => {
      onComplete();
    }, 400); // Wait for exit animation
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(2, 6, 23, 0.8)", backdropFilter: "blur(8px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      opacity: isClosing ? 0 : 1, transition: "opacity 0.4s ease",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(168, 85, 247, 0.3)",
        borderRadius: "24px", width: "90%", maxWidth: "500px", padding: "2.5rem",
        position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        transform: isClosing ? "scale(0.95) translateY(20px)" : "scale(1) translateY(0)",
        transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}>
        
        {/* Close/Skip Button */}
        <button onClick={handleClose} style={{
          position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none",
          color: "#94a3b8", cursor: "pointer", transition: "color 0.2s"
        }} onMouseEnter={e => e.currentTarget.style.color="white"} onMouseLeave={e => e.currentTarget.style.color="#94a3b8"}>
          <X size={24} />
        </button>

        {/* Progress Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "2rem" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              width: step === i ? "24px" : "8px", height: "8px",
              borderRadius: "4px", background: step === i ? "#a855f7" : "rgba(255,255,255,0.2)",
              transition: "all 0.3s ease"
            }} />
          ))}
        </div>

        {/* Steps Content */}
        <div style={{ minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          
          {step === 1 && (
            <div className="animate-fade-in" style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{
                width: "80px", height: "80px", margin: "0 auto 1.5rem",
                background: "linear-gradient(135deg, #a855f7, #3b82f6)",
                borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 10px 25px rgba(168, 85, 247, 0.4)"
              }}>
                <Cuboid size={40} color="white" />
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "white", marginBottom: "1rem" }}>
                Welcome to MetaLearning 🎉
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.6 }}>
                You're about to transform how your students experience education. Let's take 30 seconds to get you started.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in" style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <CheckCircle size={56} color="#10b981" style={{ margin: "0 auto" }} />
              </div>
              {role === "teacher" || role === "admin" || role === "creator" ? (
                <>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", marginBottom: "1rem" }}>
                    Create your first 3D lesson in 4 steps
                  </h2>
                  <ul style={{ textAlign: "left", color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.8, display: "inline-block", margin: "0 auto", paddingLeft: "1.5rem" }}>
                    <li><strong style={{color:"#a855f7"}}>1.</strong> Choose Subject</li>
                    <li><strong style={{color:"#a855f7"}}>2.</strong> Pick Level</li>
                    <li><strong style={{color:"#a855f7"}}>3.</strong> Select 3D Model</li>
                    <li><strong style={{color:"#a855f7"}}>4.</strong> Share PIN</li>
                  </ul>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", marginBottom: "1rem" }}>
                    Joining a class is instant
                  </h2>
                  <ul style={{ textAlign: "left", color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.8, display: "inline-block", margin: "0 auto", paddingLeft: "1.5rem" }}>
                    <li><strong style={{color:"#3b82f6"}}>1.</strong> Enter PIN code</li>
                    <li><strong style={{color:"#3b82f6"}}>2.</strong> See 3D lesson</li>
                    <li><strong style={{color:"#3b82f6"}}>3.</strong> Interact with AR</li>
                  </ul>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in" style={{ animation: "fadeIn 0.5s ease" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <Lightbulb size={56} color="#f59e0b" style={{ margin: "0 auto" }} />
              </div>
              {role === "teacher" || role === "admin" || role === "creator" ? (
                <>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", marginBottom: "1rem" }}>
                    Pro tip: Use Image to 3D
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    Upload any image — a photo from your textbook, a drawing, anything — and watch it become an interactive 3D model.
                  </p>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "white", marginBottom: "1rem" }}>
                    Pro tip: Revisit any lesson
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6 }}>
                    All your past lessons are saved in your dashboard. You can revisit them anytime.
                  </p>
                </>
              )}
            </div>
          )}

        </div>

        {/* Action Button */}
        <button
          onClick={() => step < 3 ? setStep(step + 1) : handleClose()}
          style={{
            width: "100%", padding: "1rem", marginTop: "2rem", borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white",
            border: "none", fontWeight: "bold", fontSize: "1rem", cursor: "pointer",
            boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)", transition: "transform 0.2s"
          }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {step === 1 ? "Let's Go →" : step === 2 ? "Got it →" : role === "student" ? "Go to Dashboard →" : "Start Exploring →"}
        </button>

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
