import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import { Link } from "react-router-dom";
import { Users, Banknote, Shield, Activity, EyeOff, Trash2, CheckCircle, Search, Trophy, Megaphone } from "lucide-react";
import { showToast } from "../components/Toast";
import { motion } from "framer-motion";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_tier: "free" | "pro" | "max";
  created_at: string;
}

interface LessonRow {
  id: string;
  title: string;
  subject: string;
  teacher_id: string;
  is_public: boolean;
  teacher_name?: string;
}

export function AdminDashboardPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [revenue, setRevenue] = useState(0);

  useEffect(() => { fetchEverything(); }, []);

  async function fetchEverything() {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData, error: usersErr } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, subscription_tier, created_at")
        .order("created_at", { ascending: false });

      if (usersErr) throw usersErr;
      setUsers(usersData || []);

      // Calculate revenue (PRO = 20 TND, MAX = 30 TND)
      let rev = 0;
      usersData?.forEach(u => {
        if (u.subscription_tier === "pro") rev += 20;
        if (u.subscription_tier === "max") rev += 30;
      });
      setRevenue(rev);

      // Fetch public lessons
      const { data: lessonsData, error: lessonsErr } = await supabase
        .from("lessons")
        .select('id, title, subject, teacher_id, is_public, profiles!lessons_teacher_id_fkey(full_name)')
        .eq("is_public", true);
        
      if (lessonsErr) throw lessonsErr;

      setLessons((lessonsData || []).map(l => ({
        ...l,
        teacher_name: (l.profiles as unknown as { full_name: string })?.full_name || "Unknown"
      })));

    } catch (err: any) {
      showToast({ type: "error", title: "Error loading admin data", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const updateTier = async (userId: string, newTier: "free" | "pro" | "max") => {
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from("profiles")
        .update({ 
          subscription_tier: newTier,
          subscription_expires_at: newTier === "free" ? null : expiresAt.toISOString(),
          plan: newTier // legacy fallback
        })
        .eq("id", userId);

      if (error) throw error;
      showToast({ type: "success", title: "Tier updated" });
      fetchEverything(); // refresh
    } catch (err: any) {
      showToast({ type: "error", title: "Update failed", message: err.message });
    }
  };

  const hideLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .update({ is_public: false })
        .eq("id", lessonId);
      if (error) throw error;
      showToast({ type: "success", title: "Lesson hidden from public" });
      fetchEverything();
    } catch (err: any) {
      showToast({ type: "error", title: "Failed to hide lesson", message: err.message });
    }
  };

  const deleteLesson = async (lessonId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lesson?")) return;
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);
      if (error) throw error;
      showToast({ type: "success", title: "Lesson deleted" });
      fetchEverything();
    } catch (err: any) {
      showToast({ type: "error", title: "Failed to delete lesson", message: err.message });
    }
  };

  const filteredUsers = users.filter(u => 
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "white",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "3rem 1.5rem"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
          <div style={{
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            padding: "1rem", borderRadius: "16px"
          }}>
            <Shield size={32} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 800 }}>Control Tower</h1>
            <p style={{ margin: 0, color: "#94a3b8" }}>MetaLearning Administrative Hub</p>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "rgba(16,185,129,0.15)", padding: "1rem", borderRadius: "12px" }}>
              <Banknote size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>MONTHLY REVENUE</p>
              <h2 style={{ margin: 0, fontSize: "1.8rem", color: "white" }}>{revenue} د.ت</h2>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "rgba(59,130,246,0.15)", padding: "1rem", borderRadius: "12px" }}>
              <Users size={24} color="#3b82f6" />
            </div>
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>TOTAL USERS</p>
              <h2 style={{ margin: 0, fontSize: "1.8rem", color: "white" }}>{users.length}</h2>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "rgba(168,85,247,0.15)", padding: "1rem", borderRadius: "12px" }}>
              <Trophy size={24} color="#a855f7" />
            </div>
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>PRO/MAX SUBS</p>
              <h2 style={{ margin: 0, fontSize: "1.8rem", color: "white" }}>{users.filter(u => u.subscription_tier !== 'free').length}</h2>
            </div>
          </div>

        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>
            <Activity size={32} style={{ animation: "spin 2s linear infinite" }} />
            <p>Loading registry...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
            
            {/* MARKETING TOOLS */}
            <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Megaphone color="#a855f7" /> Marketing Tools
                </h2>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                <Link to="/admin/posts" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "12px", padding: "1.5rem", textDecoration: "none", color: "white", display: "flex", flexDirection: "column", gap: "8px", transition: "all 0.2s" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>AI Post Generator</h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 }}>Generate tailored social media posts for Twitter, LinkedIn, Instagram & TikTok.</p>
                </Link>
                <Link to="/ar-guide" target="_blank" rel="noopener noreferrer" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", padding: "1.5rem", textDecoration: "none", color: "white", display: "flex", flexDirection: "column", gap: "8px", transition: "all 0.2s" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Lead Magnet Page</h3>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 }}>View the public landing page used to capture teacher leads via the AR Guide.</p>
                </Link>
              </div>
            </section>
            
            {/* USER REGISTRY */}
            <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users color="#06b6d4" /> User Registry
                </h2>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Search size={14} color="#64748b" style={{ marginRight: "8px" }} />
                  <input 
                    type="text" 
                    placeholder="Search email or name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: "transparent", border: "none", color: "white", outline: "none", fontSize: "0.85rem", width: "200px" }}
                  />
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)", color: "#a5b4fc", fontSize: "0.8rem", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", borderRadius: "8px 0 0 8px" }}>User Info</th>
                      <th style={{ padding: "12px 16px" }}>Role</th>
                      <th style={{ padding: "12px 16px" }}>Join Date</th>
                      <th style={{ padding: "12px 16px", borderRadius: "0 8px 8px 0" }}>Subscription Tier (Action)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>{u.full_name || "Anonymous"}</p>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>{u.email}</p>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#94a3b8", textTransform: "capitalize" }}>{u.role}</td>
                        <td style={{ padding: "12px 16px", fontSize: "0.85rem", color: "#64748b" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <select 
                            value={u.subscription_tier || "free"}
                            onChange={(e) => updateTier(u.id, e.target.value as "free" | "pro" | "max")}
                            style={{ 
                              background: u.subscription_tier === 'max' ? "rgba(245,158,11,0.2)" : u.subscription_tier === 'pro' ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.05)",
                              color: u.subscription_tier === 'max' ? "#f59e0b" : u.subscription_tier === 'pro' ? "#06b6d4" : "#94a3b8",
                              border: `1px solid ${u.subscription_tier === 'max' ? "#f59e0b55" : u.subscription_tier === 'pro' ? "#06b6d455" : "#334155"}`,
                              padding: "4px 10px", borderRadius: "6px", outline: "none", cursor: "pointer", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700
                            }}
                          >
                            <option value="free" style={{ background: "#0f172a", color: "white" }}>Free</option>
                            <option value="pro" style={{ background: "#0f172a", color: "white" }}>PRO</option>
                            <option value="max" style={{ background: "#0f172a", color: "white" }}>MAX</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CONTENT MODERATION */}
            <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "20px", padding: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Shield color="#f43f5e" /> Content Moderation
                </h2>
              </div>
              
              <div style={{ display: "grid", gap: "1rem" }}>
                {lessons.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.85rem", fontStyle: "italic" }}>No public lessons to moderate.</p>
                ) : (
                  lessons.map(lesson => (
                    <div key={lesson.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)",
                      padding: "1rem 1.5rem", borderRadius: "12px"
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>{lesson.title}</p>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                          Subject: {lesson.subject} | Creator: <span style={{ color: "#a5b4fc" }}>{lesson.teacher_name}</span>
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <button onClick={() => hideLesson(lesson.id)} style={{
                          background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)",
                          padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600
                        }}>
                          <EyeOff size={14} /> Hide
                        </button>
                        <button onClick={() => deleteLesson(lesson.id)} style={{
                          background: "rgba(244,63,94,0.15)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.3)",
                          padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600
                        }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        )}

      </div>
    </div>
  );
}
