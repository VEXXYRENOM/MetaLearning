import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { UserCircle, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import "../ai-lab.css";

export function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });
        if (error) throw error;
        // Depending on email confirmation settings, user might need to verify email
        // Or they are automatically logged in. Let's redirect to home for now.
        navigate("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-lab-layout pt-20" dir="ltr" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="ai-cyber-panel" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <UserCircle size={48} color="#a855f7" className="mb-2 inline-block" />
          <h2 className="text-2xl font-bold" style={{ color: "white" }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p style={{ color: "#9ca3af" }}>
            {isLogin ? "Log in to access your modules" : "Join the MetaLearning Network"}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", borderRadius: "8px", color: "#fca5a5", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {!isLogin && (
            <>
              <div>
                <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <UserPlus size={18} style={{ position: "absolute", left: '10px', top: '10px', color: '#9ca3af' }} />
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: '10px', top: '10px', color: '#9ca3af' }} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", color: "#d1d5db", marginBottom: "0.25rem", fontSize: "0.85rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: '10px', top: '10px', color: '#9ca3af' }} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "10px 10px 10px 36px", borderRadius: "8px", background: "rgba(0,0,0,0.5)", border: "1px solid #374151", color: "white" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem', width: '100%', padding: '12px', borderRadius: '8px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', border: 'none', color: 'white',
              fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
            }}
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}
