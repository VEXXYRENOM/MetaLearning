// src/pages/LeadMagnetPage.tsx
// MetaLearning — Lead Magnet Landing Page
// Route: /ar-guide (public, no auth required)
// Purpose: Collect teacher emails in exchange for free AR Teaching Guide PDF

import { useState } from "react";
import { Link } from "react-router-dom";
import { MetaTags } from "../components/MetaTags";
import { showToast } from "../components/Toast";
import { supabase } from "../services/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Zap, Trophy, BarChart3, CheckCircle,
  ArrowRight, Shield, Star, Mail, User, School, Globe
} from "lucide-react";

// ── Guide benefits data ──────────────────────────────────────────
const GUIDE_CONTENTS = [
  {
    icon: <BookOpen size={20} />,
    title: "5 Ready-to-Use 3D Lesson Templates",
    desc: "Biology, Chemistry, Physics, History, Math — plug & play",
    color: "#06b6d4",
  },
  {
    icon: <Zap size={20} />,
    title: "The PIN-Share Method",
    desc: "How to start a live 3D class in under 60 seconds",
    color: "#a855f7",
  },
  {
    icon: <Trophy size={20} />,
    title: "Gamification Playbook",
    desc: "XP systems, badges, and leaderboards that triple engagement",
    color: "#f59e0b",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Auto-Reporting Setup Guide",
    desc: "Generate student analytics PDFs with one click",
    color: "#10b981",
  },
];

const SOCIAL_PROOF = [
  { name: "Amina B.", role: "Biology Teacher, Tunis", text: "My students stopped asking 'why do we need to know this?' after their first 3D lesson.", rating: 5 },
  { name: "Mr. Kamel R.", role: "Chemistry Teacher, Sfax", text: "I ran a full acid-base experiment on a phone. No equipment. No safety issues.", rating: 5 },
  { name: "Sofia L.", role: "Science Teacher, Paris", text: "The AI turned my textbook diagram into a 3D model in 30 seconds. I was speechless.", rating: 5 },
];

// ── Main component ────────────────────────────────────────────────
export function LeadMagnetPage() {
  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    school_name: "",
    subject: "",
    country: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formState.full_name.trim()) errs.full_name = "Name is required";
    if (!formState.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) errs.email = "Invalid email address";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      // Insert lead into Supabase
      const { error } = await supabase
        .from("teacher_leads")
        .insert({
          email:       formState.email.toLowerCase().trim(),
          full_name:   formState.full_name.trim(),
          school_name: formState.school_name.trim() || null,
          subject:     formState.subject || null,
          country:     formState.country || null,
          source:      "lead_magnet",
          status:      "new",
        });

      if (error && error.code !== "23505") {
        // 23505 = unique violation (already subscribed)
        throw error;
      }

      // Trigger welcome email via pipeline (fire and forget)
      fetch("/api/email-pipeline?trigger=welcome&email=" + encodeURIComponent(formState.email), {
        method: "POST",
        headers: { "x-cron-secret": "manual_trigger" },
      }).catch(() => {}); // Non-blocking

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      showToast({ type: "error", title: "Submission failed", message: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}
        >
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <CheckCircle size={40} color="#10b981" />
          </div>
          <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 900, margin: "0 0 1rem" }}>
            You're in! 🎉
          </h1>
          <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            Check your inbox — your <strong style={{ color: "white" }}>Free AR Teaching Guide</strong> is on its way to <strong style={{ color: "#06b6d4" }}>{formState.email}</strong>.
          </p>
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "2rem" }}>
            Can't wait? Try MetaLearning right now — your first 5 lessons are free.
          </p>
          <Link to="/auth" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #a855f7, #3b82f6)", color: "white", textDecoration: "none", padding: "14px 32px", borderRadius: "999px", fontWeight: 700, fontSize: "1rem" }}>
            Start Teaching in 3D <ArrowRight size={18} />
          </Link>
          <div style={{ marginTop: "2rem" }}>
            <Link to="/" style={{ color: "#475569", textDecoration: "none", fontSize: "0.85rem" }}>← Back to Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main landing page ──────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <MetaTags
        title="Free AR Teaching Guide — MetaLearning"
        description="Download the free guide for teachers: 5 ready-to-use 3D lesson templates, gamification playbook, and auto-reporting setup. No credit card needed."
        path="/ar-guide"
      />

      {/* Hero Section */}
      <div style={{ background: "radial-gradient(ellipse at top, #0f0823 0%, #020617 60%)", padding: "4rem 2rem 2rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem" }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #06b6d4, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>M</div>
              <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>MetaLearning</span>
            </Link>
            <Link to="/auth" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>Already have an account? Log in →</Link>
          </div>

          {/* Two-column layout: headline + form */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>

            {/* LEFT: Headline and benefits */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "999px", padding: "6px 14px", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                <Star size={14} /> FREE Resource for Teachers
              </div>

              <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, lineHeight: 1.15, margin: "0 0 1.5rem", background: "linear-gradient(135deg, #ffffff 30%, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                The Complete Guide to Teaching with AR & 3D Technology
              </h1>

              <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: "2rem", fontSize: "1.05rem" }}>
                Discover how progressive teachers are cutting prep time in half and tripling student engagement using interactive 3D lessons. <strong style={{ color: "white" }}>No tech skills required.</strong>
              </p>

              {/* What's inside */}
              <p style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
                What's Inside (32 Pages):
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {GUIDE_CONTENTS.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${item.color}15`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: item.color, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ color: "white", fontWeight: 600, margin: "0 0 2px", fontSize: "0.95rem" }}>{item.title}</p>
                      <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust indicators */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "2rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Shield size={20} color="#10b981" />
                <div>
                  <p style={{ color: "#10b981", fontWeight: 700, margin: 0, fontSize: "0.85rem" }}>No spam. Ever.</p>
                  <p style={{ color: "#475569", margin: 0, fontSize: "0.8rem" }}>We send max 3 emails. Unsubscribe anytime.</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Lead capture form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem", backdropFilter: "blur(10px)" }}>
                <h2 style={{ color: "white", fontWeight: 800, margin: "0 0 0.5rem", fontSize: "1.3rem" }}>
                  Get the Free Guide
                </h2>
                <p style={{ color: "#64748b", margin: "0 0 1.5rem", fontSize: "0.9rem" }}>
                  Sent instantly to your inbox. 100% free.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      <User size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Full Name *
                    </label>
                    <input
                      type="text" required
                      value={formState.full_name}
                      onChange={e => setFormState(p => ({ ...p, full_name: e.target.value }))}
                      placeholder="Your full name"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.4)", border: `1px solid ${errors.full_name ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                    />
                    {errors.full_name && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: "4px 0 0" }}>{errors.full_name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      <Mail size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Work Email *
                    </label>
                    <input
                      type="email" required
                      value={formState.email}
                      onChange={e => setFormState(p => ({ ...p, email: e.target.value }))}
                      placeholder="teacher@school.edu"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.4)", border: `1px solid ${errors.email ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                    />
                    {errors.email && <p style={{ color: "#ef4444", fontSize: "0.75rem", margin: "4px 0 0" }}>{errors.email}</p>}
                  </div>

                  {/* School (optional) */}
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      <School size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} /> School Name (optional)
                    </label>
                    <input
                      type="text"
                      value={formState.school_name}
                      onChange={e => setFormState(p => ({ ...p, school_name: e.target.value }))}
                      placeholder="Your school or institution"
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      Subject You Teach (optional)
                    </label>
                    <select
                      value={formState.subject}
                      onChange={e => setFormState(p => ({ ...p, subject: e.target.value }))}
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.1)", color: formState.subject ? "white" : "#64748b", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                    >
                      <option value="">Select your subject...</option>
                      <option value="biology">Biology / Life Sciences</option>
                      <option value="chemistry">Chemistry</option>
                      <option value="physics">Physics</option>
                      <option value="math">Mathematics</option>
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                      <option value="languages">Languages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                      <Globe size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Country (optional)
                    </label>
                    <input
                      type="text"
                      value={formState.country}
                      onChange={e => setFormState(p => ({ ...p, country: e.target.value }))}
                      placeholder="e.g. Tunisia, France, Saudi Arabia..."
                      style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ width: "100%", padding: "15px", borderRadius: "12px", background: loading ? "#334155" : "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none", color: "white", fontWeight: 800, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s", marginTop: "0.5rem" }}
                  >
                    {loading ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        Sending your guide...
                      </>
                    ) : (
                      <> Send Me the Free Guide <ArrowRight size={18} /> </>
                    )}
                  </button>

                  <p style={{ color: "#374151", fontSize: "0.75rem", textAlign: "center", margin: "0.5rem 0 0" }}>
                    By submitting, you agree to our{" "}
                    <Link to="/privacy" style={{ color: "#64748b" }}>Privacy Policy</Link>.
                    No spam. Unsubscribe anytime.
                  </p>
                </form>

                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>

              {/* Mini stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1.5rem" }}>
                {[
                  { value: "3,200+", label: "Teachers Downloaded" },
                  { value: "4.9★", label: "Average Rating" },
                  { value: "32", label: "Pages of Value" },
                  { value: "Free", label: "No Credit Card" },
                ].map((stat, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                    <p style={{ color: "white", fontWeight: 800, margin: 0, fontSize: "1.2rem" }}>{stat.value}</p>
                    <p style={{ color: "#475569", margin: 0, fontSize: "0.75rem" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div style={{ padding: "4rem 2rem", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>
            What Teachers Say After Using the Guide
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
            {SOCIAL_PROOF.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}
              >
                <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={14} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 16px", fontSize: "0.9rem", fontStyle: "italic" }}>
                  "{review.text}"
                </p>
                <div>
                  <p style={{ color: "white", fontWeight: 700, margin: 0, fontSize: "0.85rem" }}>{review.name}</p>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "0.8rem" }}>{review.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: "2rem", fontWeight: 900, margin: "0 0 1rem" }}>
          Ready to transform your classroom?
        </h2>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          Get the free guide and try MetaLearning at no cost.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{ background: "linear-gradient(135deg, #a855f7, #3b82f6)", color: "white", border: "none", padding: "14px 36px", borderRadius: "999px", fontWeight: 800, fontSize: "1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          Get the Free Guide <ArrowRight size={18} />
        </button>
        <div style={{ marginTop: "2rem" }}>
          <Link to="/" style={{ color: "#374151", textDecoration: "none", fontSize: "0.85rem" }}>← Back to MetaLearning</Link>
        </div>
      </div>
    </div>
  );
}
