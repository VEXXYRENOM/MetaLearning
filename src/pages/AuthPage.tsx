import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { UserCircle, Mail, Lock, LogIn, UserPlus, Building2, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export function AuthPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { session, profile, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const orgToken = searchParams.get("org_token");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(orgToken ? "signup" : "login");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isLoading || !session) return;
    if (profile?.role === "teacher") navigate("/teacher/create");
    else if (profile?.role === "student") navigate("/student/dashboard");
    else if (profile?.role === "creator") navigate("/creator/lab");
    else if (profile?.role === "admin") navigate("/admin");
    else if (!profile?.role) navigate("/auth/role-selection");
  }, [session, profile, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: profileInfo } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        if (profileInfo?.role === "teacher") navigate("/teacher/create");
        else navigate("/student/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role } } });
        if (error) throw error;
        if (data.user && !data.session) {
          if (orgToken) localStorage.setItem("pending_org_token", orgToken);
          setSignupSuccess(true);
        } else if (data.user) {
          if (orgToken) {
            const { error: joinErr } = await supabase.rpc("join_organization", { p_token: orgToken });
            if (joinErr) console.warn("Org join error:", joinErr.message);
          }
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });
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
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { access_type: "offline", prompt: "consent" } },
    });
    if (error) console.error("Google OAuth error:", error);
  };

  /* ── shared input style ── */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 12px 11px 38px",
    background: "rgba(255,255,255,0.5)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1.5px solid rgba(37,99,235,0.18)",
    borderRadius: "10px",
    color: "#0f1f3d",
    fontFamily: "inherit",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", color: "#4b5563", marginBottom: "5px", fontSize: "0.83rem", fontWeight: 600,
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#EBF5FF 0%,#DBEAFE 40%,#E0F2FE 70%,#F0F9FF 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Host Grotesk', system-ui, sans-serif",
      padding: "2rem 1rem", position: "relative",
    }}>
      {/* Back to home */}
      <Link to="/" style={{ position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: 6, color: "#6b7280", textDecoration: "none", fontSize: ".88rem", fontWeight: 600 }}>
        <ArrowLeft size={16} /> MetaLearning
      </Link>

      {/* Language Switcher */}
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 50 }}>
        <LanguageSwitcher theme="light" />
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.8)",
        borderRadius: 24,
        padding: "2.2rem 2rem",
        boxShadow: "0 20px 60px rgba(37,99,235,0.12)",
      }}>
        {/* Org invite banner */}
        {orgToken && (
          <div style={{ padding: "10px 14px", borderRadius: 12, marginBottom: "1.25rem", background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={17} color="#2563EB" />
            <p style={{ margin: 0, fontSize: ".83rem", color: "#1e40af" }}>You've been invited to join an organization. Create an account to continue.</p>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#2563EB,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", boxShadow: "0 8px 20px rgba(37,99,235,0.25)" }}>
            <UserCircle size={28} color="white" />
          </div>
          <h2 style={{ margin: "0 0 6px", fontSize: "1.5rem", fontWeight: 900, color: "#0f1f3d", letterSpacing: "-.02em" }}>
            {mode === "login" ? t("auth.login_title") : mode === "signup" ? t("auth.signup_title") : "Reset Password"}
          </h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: ".9rem" }}>
            {mode === "login" ? "Welcome back to MetaLearning" : mode === "signup" ? "Join the MetaLearning Network" : "Recover your account access"}
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#b91c1c", marginBottom: "1rem", textAlign: "center", fontSize: ".88rem" }}>
            {errorMsg}
          </div>
        )}

        {/* Google Sign-In */}
        {mode !== "forgot" && (
          <>
            <button id="btn-google-signin" onClick={handleGoogleSignIn} style={{
              width: "100%", padding: "11px 16px",
              background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1.5px solid rgba(37,99,235,0.15)", borderRadius: 11,
              cursor: "pointer", fontWeight: 600, fontSize: ".93rem",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              fontFamily: "inherit", color: "#1e3a5f", marginBottom: 14,
              transition: "all .25s", boxShadow: "0 2px 10px rgba(37,99,235,0.06)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("auth.google_signin", "Continue with Google")}
            </button>
            <div style={{ textAlign: "center", color: "#9ca3af", margin: "0 0 14px", fontSize: ".82rem", display: "flex", alignItems: "center", gap: 10 }}>
              <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(37,99,235,0.12)" }} />
              or
              <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(37,99,235,0.12)" }} />
            </div>
          </>
        )}

        {/* Signup success */}
        {signupSuccess && (
          <div style={{ padding: "1.4rem", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, textAlign: "center", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>✅</div>
            <p style={{ color: "#059669", fontWeight: 700, margin: "0 0 .4rem", fontSize: ".95rem" }}>Account created successfully!</p>
            <p style={{ color: "#6b7280", fontSize: ".83rem", margin: 0 }}>Check your email to confirm your account, then log in.</p>
            <button onClick={() => { setSignupSuccess(false); setMode("login"); }}
              style={{ marginTop: "1rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, color: "#059669", padding: "8px 18px", cursor: "pointer", fontWeight: 700, fontSize: ".88rem", fontFamily: "inherit" }}>
              Go to Login →
            </button>
          </div>
        )}

        {/* Main form */}
        {!signupSuccess && mode !== "forgot" && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".9rem" }}>
            {mode === "signup" && (
              <>
                <div>
                  <label style={labelStyle}>{t("auth.full_name")}</label>
                  <div style={{ position: "relative" }}>
                    <UserPlus size={16} style={iconStyle} />
                    <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t("auth.role")}</label>
                  <select value={role} onChange={e => setRole(e.target.value as any)} style={{ ...inputStyle, paddingLeft: "12px", cursor: "pointer" }}>
                    <option value="student">{t("auth.student")}</option>
                    <option value="teacher">{t("auth.teacher")}</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>{t("auth.email")}</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={iconStyle} />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t("auth.password")}</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={iconStyle} />
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: ".4rem", width: "100%", padding: "13px",
              background: "rgba(37,99,235,0.14)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1.5px solid rgba(37,99,235,0.35)", borderRadius: 12,
              color: "#1d4ed8", fontWeight: 800, fontSize: "1rem", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 14px rgba(37,99,235,0.12)",
              transition: "all .25s",
            }}>
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {loading ? t("auth.loading") : (mode === "login" ? t("auth.login_btn") : t("auth.signup_btn"))}
            </button>

            {mode === "signup" && (
              <p style={{ color: "#9ca3af", fontSize: ".75rem", textAlign: "center", margin: "2px 0 0" }}>
                By signing up you agree to our{" "}
                <Link to="/terms" style={{ color: "#6b7280" }}>Terms</Link>{" "}and{" "}
                <Link to="/privacy" style={{ color: "#6b7280" }}>Privacy Policy</Link>.
              </p>
            )}

            {mode === "login" && (
              <button type="button" onClick={() => setMode("forgot")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: ".83rem", textDecoration: "underline", alignSelf: "center", fontFamily: "inherit" }}>
                Forgot Password?
              </button>
            )}
          </form>
        )}

        {/* Forgot password form */}
        {mode === "forgot" && (
          <div>
            {resetSent ? (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>📧</div>
                <p style={{ color: "#059669", fontWeight: 700, margin: "0 0 .5rem" }}>Reset email sent!</p>
                <p style={{ color: "#6b7280", fontSize: ".85rem", margin: 0 }}>Check your inbox and follow the instructions.</p>
                <button onClick={() => { setMode("login"); setResetSent(false); }} style={{ marginTop: "1rem", background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 700, textDecoration: "underline", fontFamily: "inherit" }}>
                  ← Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ color: "#6b7280", textAlign: "center", fontSize: ".88rem", margin: "-0.5rem 0 0" }}>
                  Enter your email and we'll send you a reset link.
                </p>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={iconStyle} />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} />
                </div>
                <button type="submit" disabled={loading} style={{ padding: "12px", borderRadius: 11, background: "rgba(37,99,235,0.12)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(37,99,235,0.3)", color: "#1d4ed8", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: "0.95rem" }}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <button type="button" onClick={() => setMode("login")} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: ".85rem" }}>
                  ← Back to Login
                </button>
              </form>
            )}
          </div>
        )}

        {/* Switch mode */}
        {mode !== "forgot" && (
          <div style={{ marginTop: "1.6rem", textAlign: "center", color: "#9ca3af", fontSize: ".88rem" }}>
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 700, textDecoration: "none", fontFamily: "inherit", fontSize: ".88rem" }}>
              {mode === "login" ? t("auth.switch_to_signup") : t("auth.switch_to_login")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
