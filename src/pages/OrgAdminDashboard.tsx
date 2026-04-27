import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Users, Link2, Copy, Check, Mail, Shield,
  TrendingUp, Calendar, LogOut, RefreshCw, AlertTriangle
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { showToast } from "../components/Toast";

interface OrgMember {
  id: string;
  full_name: string;
  email: string;
  role_in_org: string;
  created_at: string;
}

interface OrgData {
  id: string;
  name: string;
  admin_id: string;
  total_seats: number;
  used_seats: number;
  subscription_status: string;
  invite_token: string;
  auto_approve_domain: string | null;
  created_at: string;
}

export function OrgAdminDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const inviteLink = org
    ? `${window.location.origin}/auth?org_token=${org.invite_token}`
    : "";

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadOrgData();
  }, [user]);

  const loadOrgData = async () => {
    setLoading(true);
    try {
      // Find org where current user is the admin
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select("*")
        .eq("admin_id", user!.id)
        .single();

      if (orgErr || !orgData) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setOrg(orgData as OrgData);

      // Load members of this org
      const { data: memberData } = await supabase
        .from("profiles")
        .select("id, full_name, email, role_in_org, created_at")
        .eq("org_id", orgData.id)
        .neq("id", user!.id) // exclude admin
        .order("created_at", { ascending: false });

      setMembers((memberData || []) as OrgMember[]);
    } catch (err) {
      console.error("Org load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      showToast({ type: "success", title: "Copied!", message: "Invite link copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#020617",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <RefreshCw size={32} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
          <p>Loading organization...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !org) {
    return (
      <div style={{
        minHeight: "100vh", background: "#020617",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          textAlign: "center", color: "#94a3b8", padding: "2rem",
          background: "rgba(239,68,68,0.08)", borderRadius: "16px",
          border: "1px solid rgba(239,68,68,0.3)",
        }}>
          <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: "1rem" }} />
          <h2 style={{ color: "#f87171", margin: "0 0 0.5rem" }}>Access Denied</h2>
          <p style={{ margin: "0 0 1.5rem" }}>You are not an admin of any organization.</p>
          <button onClick={() => navigate("/")} style={{
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            border: "none", color: "white", padding: "10px 24px",
            borderRadius: "8px", cursor: "pointer", fontWeight: 600,
          }}>← Back to Home</button>
        </div>
      </div>
    );
  }

  const seatsPercent = Math.round((org.used_seats / org.total_seats) * 100);
  const seatsColor = seatsPercent >= 90 ? "#ef4444" : seatsPercent >= 70 ? "#f59e0b" : "#10b981";

  return (
    <div style={{
      minHeight: "100vh", background: "#020617", color: "white",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "2rem",
    }}>
      {/* Header */}
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: 52, height: 52, borderRadius: "14px",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Building2 size={26} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>{org.name}</h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Organization Admin Dashboard</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{
              padding: "5px 14px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600,
              background: org.subscription_status === "active" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              color: org.subscription_status === "active" ? "#10b981" : "#ef4444",
              border: `1px solid ${org.subscription_status === "active" ? "#10b981" : "#ef4444"}40`,
            }}>
              {org.subscription_status === "active" ? "✓ Active" : "✗ Inactive"}
            </span>
            <button onClick={() => navigate("/")} style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8", borderRadius: "8px", padding: "8px 16px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
            }}>
              <LogOut size={14} /> Back
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem", marginBottom: "2rem",
        }}>
          {[
            { label: "Total Seats", value: org.total_seats, icon: <Shield size={20} />, color: "#7c3aed" },
            { label: "Used Seats", value: org.used_seats, icon: <Users size={20} />, color: seatsColor },
            { label: "Available", value: org.total_seats - org.used_seats, icon: <TrendingUp size={20} />, color: "#10b981" },
            { label: "Members", value: members.length, icon: <Calendar size={20} />, color: "#06b6d4" },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px", padding: "1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem", color: stat.color }}>
                {stat.icon}
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>{stat.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: "2rem", fontWeight: 800, color: "white" }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Seat Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600 }}>Seat Usage</span>
            <span style={{ color: seatsColor, fontWeight: 700 }}>{org.used_seats} / {org.total_seats} ({seatsPercent}%)</span>
          </div>
          <div style={{ height: "10px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${seatsPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ height: "100%", background: seatsColor, borderRadius: "999px" }}
            />
          </div>
          {seatsPercent >= 90 && (
            <p style={{ marginTop: "0.75rem", color: "#f59e0b", fontSize: "0.85rem" }}>
              ⚠️ Almost full! Consider upgrading your seat count.
            </p>
          )}
        </motion.div>

        {/* Invite Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
            <Link2 size={20} color="#7c3aed" />
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Magic Invite Link</h3>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1rem" }}>
            Share this link with teachers and students. Anyone who signs up via this link will automatically join your organization and consume one seat.
          </p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              flex: 1, padding: "10px 14px", background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
              color: "#94a3b8", fontSize: "0.8rem", wordBreak: "break-all",
              minWidth: "200px",
            }}>
              {inviteLink}
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={handleCopyLink}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                border: "none", color: "white", padding: "10px 20px",
                borderRadius: "10px", cursor: "pointer", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Link"}
            </motion.button>
          </div>
          {org.auto_approve_domain && (
            <p style={{ marginTop: "0.75rem", color: "#7c3aed", fontSize: "0.8rem" }}>
              🔐 Auto-approve domain: <strong>@{org.auto_approve_domain}</strong>
            </p>
          )}
        </motion.div>

        {/* Members Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={20} color="#06b6d4" />
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Members ({members.length})</h3>
            </div>
            <button onClick={loadOrgData} style={{
              background: "none", border: "1px solid rgba(255,255,255,0.1)",
              color: "#64748b", borderRadius: "8px", padding: "6px 12px",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem",
            }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          {members.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "3rem", color: "#475569",
              background: "rgba(255,255,255,0.02)", borderRadius: "12px",
            }}>
              <Mail size={36} style={{ marginBottom: "1rem", opacity: 0.4 }} />
              <p style={{ margin: 0 }}>No members yet. Share the invite link to add people!</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Role", "Joined"].map(h => (
                      <th key={h} style={{
                        textAlign: "left", padding: "10px 12px",
                        color: "#475569", fontSize: "0.78rem", fontWeight: 600,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, i) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 600, color: "white" }}>{member.full_name || "—"}</div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                          background: member.role_in_org === "teacher"
                            ? "rgba(245,158,11,0.15)" : "rgba(6,182,212,0.15)",
                          color: member.role_in_org === "teacher" ? "#f59e0b" : "#06b6d4",
                        }}>
                          {member.role_in_org || "student"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#64748b", fontSize: "0.85rem" }}>
                        {new Date(member.created_at).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
