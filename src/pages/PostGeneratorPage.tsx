// src/pages/PostGeneratorPage.tsx
// MetaLearning — AI Social Post Generator (Admin only)
// Route: /admin/posts

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Download, RefreshCw,
  TrendingUp,
  ArrowLeft, CheckCircle, Loader
} from "lucide-react";
import { showToast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";

// Social icons
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FEATURES = [
  { id: "simulation_3d",  label: "3D Physics Simulation",      emoji: "🧪" },
  { id: "ai_tutor",       label: "AI Lab Assistant",            emoji: "🧠" },
  { id: "quiz_3d",        label: "Live Quiz During 3D Lesson",  emoji: "⚡" },
  { id: "xp_leaderboard", label: "XP & Global Leaderboard",     emoji: "🏆" },
  { id: "image_to_3d",    label: "Image to 3D in 30 Seconds",   emoji: "✨" },
  { id: "auto_report",    label: "Automated PDF Reports",       emoji: "📊" },
];

const PLATFORMS = [
  { id: "tiktok",    label: "TikTok",    icon: <TikTokIcon />,      color: "#000000", bg: "linear-gradient(135deg, #010101, #69C9D0)" },
  { id: "linkedin",  label: "LinkedIn",  icon: <LinkedinIcon />,  color: "#0A66C2", bg: "linear-gradient(135deg, #0A66C2, #0177B5)" },
  { id: "twitter",   label: "Twitter/X", icon: <TwitterIcon />,  color: "#1DA1F2", bg: "linear-gradient(135deg, #14171A, #1DA1F2)" },
  { id: "instagram", label: "Instagram", icon: <InstagramIcon />, color: "#E1306C", bg: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)" },
];

const STYLES = [
  { id: "educational", label: "Educational 📚", desc: "Teach something valuable" },
  { id: "viral",       label: "Viral 🔥",       desc: "Hook + emotion + FOMO" },
  { id: "sales",       label: "Sales 💰",        desc: "Pain points + ROI + CTA" },
  { id: "story",       label: "Story 💬",        desc: "Real teacher/student story" },
  { id: "contrarian",  label: "Contrarian 🎯",  desc: "Challenge common beliefs" },
];

const LANGS = [
  { id: "en", label: "English 🇬🇧" },
  { id: "ar", label: "Arabic 🇸🇦" },
  { id: "fr", label: "Français 🇫🇷" },
  { id: "es", label: "Español 🇪🇸" },
];

interface GeneratedPost {
  platform: string;
  style: string;
  content: string;
  hashtags: string[];
  hook: string;
  cta: string;
  trimmed?: boolean;
}

export function PostGeneratorPage() {
  const { profile } = useAuth();
  const [feature, setFeature]     = useState("simulation_3d");
  const [platforms, setPlatforms] = useState<string[]>(["tiktok", "linkedin"]);
  const [styles, setStyles]       = useState<string[]>(["educational", "viral"]);
  const [lang, setLang]           = useState("en");
  const [context, setContext]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [posts, setPosts]         = useState<GeneratedPost[]>([]);
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  // Guard: admin only
  if (profile?.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <p>Access restricted to admins.</p>
          <Link to="/" style={{ color: "#3b82f6" }}>Go home</Link>
        </div>
      </div>
    );
  }

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, id: string) => {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  const handleGenerate = async () => {
    if (!feature || platforms.length === 0 || styles.length === 0) {
      showToast({ type: "warning", title: "Select at least one platform and style" });
      return;
    }
    setLoading(true);
    setPosts([]);

    try {
      const secret = import.meta.env.VITE_PROXY_CLIENT_SECRET || "";
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
        body: JSON.stringify({ feature, platforms, styles, lang, customContext: context }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Unknown error");
      setPosts(data.posts || []);
      showToast({ type: "success", title: `✅ Generated ${data.count} posts!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      showToast({ type: "error", title: "Generation failed", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const copyPost = (post: GeneratedPost) => {
    const fullText = `${post.content}\n\n${post.hashtags?.join(" ") || ""}`;
    navigator.clipboard.writeText(fullText);
    const id = `${post.platform}-${post.style}`;
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    showToast({ type: "success", title: "Copied to clipboard!" });
  };

  const downloadAll = () => {
    const content = posts.map(p =>
      `=== ${p.platform.toUpperCase()} / ${p.style.toUpperCase()} ===\n\n${p.content}\n\n${p.hashtags?.join(" ") || ""}\n\nHook: ${p.hook}\nCTA: ${p.cta}\n\n`
    ).join("---\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metalearning-posts-${feature}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: "success", title: "Downloaded!" });
  };

  const platformMeta: Record<string, { icon: React.ReactNode; color: string }> = {
    tiktok:    { icon: <TikTokIcon />,       color: "#69C9D0" },
    linkedin:  { icon: <LinkedinIcon />,  color: "#0A66C2" },
    twitter:   { icon: <TwitterIcon />,   color: "#1DA1F2" },
    instagram: { icon: <InstagramIcon />, color: "#E1306C" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/admin/dashboard" style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Admin
        </Link>
        <span style={{ color: "#334155" }}>/</span>
        <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>AI Post Generator</span>
        <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "999px", padding: "4px 12px", color: "#a855f7", fontSize: "0.8rem" }}>
          <Sparkles size={12} /> AI Powered
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 0.5rem" }}>AI Post Generator</h1>
        <p style={{ color: "#64748b", margin: "0 0 2.5rem" }}>Generate tailored social media posts for MetaLearning features in seconds.</p>

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "2rem", alignItems: "start" }}>
          {/* LEFT: Configuration Panel */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1.5rem", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Configuration</h3>

            {/* Feature */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Feature to Promote</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {FEATURES.map(f => (
                  <button key={f.id} onClick={() => setFeature(f.id)} style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${feature === f.id ? "rgba(168,85,247,0.6)" : "rgba(255,255,255,0.07)"}`, background: feature === f.id ? "rgba(168,85,247,0.1)" : "transparent", color: feature === f.id ? "#d8b4fe" : "#94a3b8", cursor: "pointer", textAlign: "left", fontSize: "0.88rem", fontWeight: feature === f.id ? 700 : 400, transition: "all 0.15s" }}>
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Platforms (multi-select)</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {PLATFORMS.map(p => (
                  <button key={p.id} onClick={() => toggleItem(platforms, setPlatforms, p.id)} style={{ padding: "8px 10px", borderRadius: "8px", border: `1px solid ${platforms.includes(p.id) ? p.color : "rgba(255,255,255,0.07)"}`, background: platforms.includes(p.id) ? `${p.color}20` : "transparent", color: platforms.includes(p.id) ? "white" : "#64748b", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}>
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Styles */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Post Styles (multi-select)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => toggleItem(styles, setStyles, s.id)} style={{ padding: "8px 12px", borderRadius: "8px", border: `1px solid ${styles.includes(s.id) ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.07)"}`, background: styles.includes(s.id) ? "rgba(6,182,212,0.1)" : "transparent", color: styles.includes(s.id) ? "#67e8f9" : "#64748b", cursor: "pointer", fontSize: "0.83rem", fontWeight: styles.includes(s.id) ? 700 : 400, textAlign: "left", transition: "all 0.15s" }}>
                    {s.label} <span style={{ color: "#334155", fontWeight: 400 }}>— {s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Language</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {LANGS.map(l => (
                  <button key={l.id} onClick={() => setLang(l.id)} style={{ padding: "8px", borderRadius: "8px", border: `1px solid ${lang === l.id ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.07)"}`, background: lang === l.id ? "rgba(245,158,11,0.1)" : "transparent", color: lang === l.id ? "#fbbf24" : "#64748b", cursor: "pointer", fontSize: "0.8rem", fontWeight: lang === l.id ? 700 : 400 }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom context */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ color: "#64748b", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Additional Context (optional)</label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="e.g. This week we launched a new biology simulation... or mention a specific metric..."
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", color: "white", fontSize: "0.85rem", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            {/* Generate button */}
            <button onClick={handleGenerate} disabled={loading || platforms.length === 0 || styles.length === 0} style={{ width: "100%", padding: "14px", borderRadius: "12px", background: loading ? "#1e293b" : "linear-gradient(135deg, #a855f7, #3b82f6)", border: "none", color: "white", fontWeight: 800, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {loading ? <><Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> Generating...</> : <><Sparkles size={18} /> Generate {platforms.length * styles.length} Posts</>}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <p style={{ color: "#334155", fontSize: "0.75rem", textAlign: "center", marginTop: "8px" }}>
              Will generate {platforms.length * styles.length} post{platforms.length * styles.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* RIGHT: Results */}
          <div>
            {posts.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#334155" }}>
                <Sparkles size={48} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Configure and generate your posts</p>
                <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>Select a feature, platforms, and styles then click Generate.</p>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <Loader size={40} color="#a855f7" style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
                <p style={{ color: "#94a3b8" }}>AI is crafting {platforms.length * styles.length} unique posts...</p>
                <p style={{ color: "#334155", fontSize: "0.85rem" }}>This takes 5-15 seconds</p>
              </div>
            )}

            <AnimatePresence>
              {posts.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Actions bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      <span style={{ color: "#10b981", fontWeight: 700 }}>✓ {posts.length} posts</span> generated
                    </p>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                      <button onClick={handleGenerate} style={{ padding: "8px 16px", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <RefreshCw size={14} /> Regenerate
                      </button>
                      <button onClick={downloadAll} style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Download size={14} /> Download All
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {posts.map((post, i) => {
                      const pm = platformMeta[post.platform] || { icon: <TrendingUp size={16}/>, color: "#94a3b8" };
                      const postId = `${post.platform}-${post.style}-${i}`;
                      const isCopied = copiedId === postId;

                      return (
                        <motion.div key={postId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                          {/* Card header */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ color: pm.color }}>{pm.icon}</div>
                              <span style={{ color: "white", fontWeight: 700, fontSize: "0.85rem", textTransform: "capitalize" }}>{post.platform}</span>
                              <span style={{ background: "rgba(255,255,255,0.06)", borderRadius: "6px", padding: "2px 8px", color: "#64748b", fontSize: "0.75rem", textTransform: "capitalize" }}>{post.style}</span>
                              {post.trimmed && <span style={{ color: "#f59e0b", fontSize: "0.7rem" }}>trimmed</span>}
                            </div>
                            <button onClick={() => { setCopiedId(postId); copyPost(post); }} style={{ background: isCopied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${isCopied ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", padding: "5px 10px", cursor: "pointer", color: isCopied ? "#10b981" : "#64748b", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.2s" }}>
                              {isCopied ? <><CheckCircle size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                            </button>
                          </div>

                          {/* Post content */}
                          <p style={{ color: "#cbd5e1", lineHeight: 1.6, fontSize: "0.88rem", margin: 0, whiteSpace: "pre-wrap", flex: 1 }}>
                            {post.content}
                          </p>

                          {/* Hashtags */}
                          {post.hashtags?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {post.hashtags.map((tag, j) => (
                                <span key={j} style={{ background: `${pm.color}15`, color: pm.color, borderRadius: "4px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }}>{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Meta */}
                          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", display: "flex", gap: "12px" }}>
                            <div style={{ fontSize: "0.75rem" }}>
                              <span style={{ color: "#334155" }}>Hook: </span>
                              <span style={{ color: "#64748b" }}>{post.hook}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
