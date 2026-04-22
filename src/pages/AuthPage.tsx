import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { UserCircle, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import "../ai-lab.css";

export function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: profileInfo } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();
        if (profileInfo?.role === "teacher") navigate("/teacher/create");
        else navigate("/student/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } },
        });
        if (error) throw error;
        
        // If user is created but session is null, email confirmation is required.
        if (data.user && !data.session) {
          setSignupSuccess(true);
        } else {
          // If auto sign-in occurs (email confirmation disabled)
          if (role === "teacher") navigate("/teacher/create");
          else navigate("/student/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) console.error('Google OAuth error:', error);
  };

  return (
    <div className="ai-lab-layout pt-20" dir="ltr" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
      {/* Language Switcher */}
      <div style={{ position: "absolute", top: "16px", right: "16px", zIndex: 50 }}>
        <LanguageSwitcher theme="dark" />
      </div>

      <div className="ai-cyber-panel" style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <UserCircle size={48} color="#a855f7" className="mb-2 inline-block" />
          <h2 className="text-2xl font-bold" style={{ color: "white" }}>
            {mode === "login" ? t("auth.login_title") : mode === "signup" ? t("auth.signup_title") : "Reset Password"}
          </h2>
          <p style={{ color: "#9ca3af" }}>
            {mode === "login" ? "Log in to access your modules" : mode === "signup" ? "Join the MetaLearning Network" : "Recover your account access"}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        {/* Google Sign-In — only show on login/signup, not forgot */}
        {mode !== "forgot" && (
          <>
            <button
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%', padding: '12px', background: 'white', color: '#1f2937',
                border: '1px solid #d1d5db', borderRadius: '10px', cursor: 'pointer',
                fontWeight: '500', fontSize: '0.95rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px', marginBottom: '16px', fontFamily: 'inherit',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("auth.google_signin", "Continue with Google")}
            </button>
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: '0 0 16px', fontSize: '0.85rem' }}>
              أو
            </div>
          </>
        )}

        {signupSuccess && (
          <div style={{ padding: "1.5rem", background: "rgba(16,185,129,0.1)",
            border: "1px solid #10b981", borderRadius: "12px",
            textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
            <p style={{ color: "#86efac", fontWeight: "bold", margin: "0 0 0.5rem" }}>
              Account created successfully!
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              Check your email to confirm your account, then log in.
            </p>
            <button onClick={() => { setSignupSuccess(false); setMode("login"); }}
              style={{ marginTop: "1rem", background: "none", border: "1px solid #10b981",
                borderRadius: "8px", color: "#10b981", padding: "8px 16px",
                cursor: "pointer", fontWeight: "bold" }}>
              Go to Login →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {mode === "signup" && (
            <>
              <div>
                <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>{t("auth.full_name")}</label>
                <div style={{ position: "relative" }}>
                  <UserPlus size={18} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>{t("auth.role")}</label>
                <select value={role} onChange={(e) => setRole(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }}>
                  <option value="student">{t("auth.student")}</option>
                  <option value="teacher">{t("auth.teacher")}</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>{t("auth.email")}</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>{t("auth.password")}</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "10px", top: "10px", color: "#9ca3af" }} />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ marginTop: "1rem", width: "100%", padding: "12px", borderRadius: "8px", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", border: "none", color: "white", fontWeight: "bold", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {mode === "login" ? <LogIn size={20} /> : <UserPlus size={20} />}
            {loading ? t("auth.loading") : (mode === "login" ? t("auth.login_btn") : t("auth.signup_btn"))}
          </button>

          {mode === "signup" && (
            <p style={{ color: "#475569", fontSize: "0.75rem", textAlign: "center", marginTop: "0.5rem" }}>
              By signing up you agree to our{" "}
              <Link to="/terms" style={{ color: "#64748b" }}>Terms</Link>
              {" "}and{" "}
              <Link to="/privacy" style={{ color: "#64748b" }}>Privacy Policy</Link>.
            </p>
          )}
          
          {mode === "login" && (
            <button type="button" onClick={() => setMode("forgot")}
              style={{ background: "none", border: "none", color: "#64748b",
                cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline",
                alignSelf: "center" }}>
              Forgot Password?
            </button>
          )}
        </form>

        {mode === "forgot" && (
          <div>
            {resetSent ? (
              <div style={{ textAlign: "center", color: "#86efac", padding: "1rem" }}>
                ✅ Password reset email sent! Check your inbox.
                <br />
                <button onClick={() => { setMode("login"); setResetSent(false); }}
                  style={{ marginTop: "1rem", color: "#a855f7", background: "none",
                    border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ color: "#9ca3af", textAlign: "center", fontSize: "0.9rem", marginTop: "-1rem" }}>
                  Enter your email and we will send you a reset link.
                </p>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: "100%", padding: "12px", borderRadius: "8px",
                    background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }} />
                <button type="submit" disabled={loading}
                  style={{ padding: "12px", borderRadius: "8px",
                    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                    border: "none", color: "white", fontWeight: "bold",
                    cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" onClick={() => setMode("login")}
                  style={{ background: "none", border: "none", color: "#64748b",
                    cursor: "pointer", textDecoration: "underline" }}>
                  ← Back to Login
                </button>
              </form>
            )}
          </div>
        )}

        {mode !== "forgot" && (
          <div style={{ marginTop: "2rem", textAlign: "center", color: "#9ca3af", fontSize: "0.9rem" }}>
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ background: "none", border: "none", color: "#a855f7", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}>
              {mode === "login" ? t("auth.switch_to_signup") : t("auth.switch_to_login")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
