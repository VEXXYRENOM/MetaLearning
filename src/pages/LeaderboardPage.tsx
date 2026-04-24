import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { getLevelTitle, getXpToNextLevel, BADGES } from "../lib/xpSystem";
import { Trophy, Star, ArrowLeft, Crown, Zap, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import type { LeaderEntry } from "../services/supabaseClient";

const RANK_STYLES: Record<number, { bg: string; border: string; color: string; icon: React.ReactNode }> = {
  1: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.6)", color: "#fbbf24", icon: <Crown size={18} /> },
  2: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.5)", color: "#94a3b8", icon: <Star size={18} /> },
  3: { bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.45)", color: "#cd7f32", icon: <Star size={16} /> },
};

export function LeaderboardPage() {
  const { profile } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading]  = useState(true);
  const [myRank,  setMyRank]   = useState<number | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data } = await supabase
        .from("global_leaderboard")
        .select("*")
        .order("rank", { ascending: true });

      if (data) {
        setLeaders(data);
        if (profile) {
          const me = data.find((e: LeaderEntry) => e.id === profile.id);
          setMyRank(me ? me.rank : null);
        }
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, [profile]);

  const myEntry = leaders.find(e => e.id === profile?.id);
  const myXp    = myEntry ? getXpToNextLevel(myEntry.points) : null;

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0f0a1e 50%, #020617 100%)",
      color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif", padding: "2rem"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/student/dashboard" style={{ color: "#38bdf8", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            <ArrowLeft size={16} /> {isAr ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </Link>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🏆</div>
            <h1 style={{ fontSize: "2.2rem", margin: "0 0 0.5rem",
              background: "linear-gradient(90deg, #fbbf24, #a855f7)", WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent" }}>
              Global Leaderboard
            </h1>
            <p style={{ color: "#64748b", margin: 0 }}>Top explorers of the MetaLearning universe</p>
          </div>
        </div>

        {/* My Stats Card (if logged in and on board) */}
        {myEntry && myXp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(99,102,241,0.15)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(99,102,241,0.4)", borderRadius: "16px",
              padding: "1.5rem", marginBottom: "2rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "0.8rem" }}>YOUR RANK</p>
                <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#a5b4fc" }}>#{myRank}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 4px", color: "#94a3b8", fontSize: "0.8rem" }}>LEVEL</p>
                <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#fbbf24" }}>{myEntry.level}</p>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: "0.8rem" }}>
                  {getLevelTitle(myEntry.level)} — {myEntry.points} XP
                </p>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "999px", height: "8px" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${myXp.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)",
                      borderRadius: "999px" }}
                  />
                </div>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.75rem" }}>
                  {myXp.current}/{myXp.needed} XP to next level
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: "80px", borderRadius: "12px",
                background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))
          ) : leaders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#475569", direction: "ltr" }}>
              <Trophy size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
              <p>{isAr ? "لا يوجد طلاب مصنفون بعد. أكمل الاختبارات لتكون الأول!" : "No ranked students yet. Complete quizzes to be first!"}</p>
            </div>
          ) : (
            <AnimatePresence>
              {leaders.map((entry, idx) => {
                const rankStyle = RANK_STYLES[entry.rank] ?? {
                  bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", color: "#94a3b8", icon: null
                };
                const isMe = entry.id === profile?.id;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      background: isMe ? "rgba(99,102,241,0.12)" : rankStyle.bg,
                      backdropFilter: "blur(8px)",
                      border: `1px solid ${isMe ? "rgba(99,102,241,0.5)" : rankStyle.border}`,
                      borderRadius: "14px", padding: "1rem 1.5rem",
                      display: "flex", alignItems: "center", gap: "1rem"
                    }}
                  >
                    {/* Rank */}
                    <div style={{ width: "40px", textAlign: "center", color: rankStyle.color, flexShrink: 0 }}>
                      {rankStyle.icon ?? <span style={{ fontWeight: "bold" }}>#{entry.rank}</span>}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                      background: `linear-gradient(135deg, hsl(${(entry.rank * 47) % 360}, 70%, 45%), hsl(${(entry.rank * 47 + 120) % 360}, 80%, 30%))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "1.1rem", color: "white"
                    }}>
                      {(entry.full_name || "?")[0].toUpperCase()}
                    </div>

                    {/* Name & Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: isMe ? 700 : 500, color: isMe ? "#a5b4fc" : "#e2e8f0",
                          fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {entry.full_name || "Anonymous"} {isMe && "👈"}
                        </span>
                        {/* Badges */}
                        {(entry.badges || []).slice(0, 3).map(bid => {
                          const b = Object.values(BADGES).find(x => x.id === bid);
                          return b ? <span key={bid} title={b.label} style={{ fontSize: "1rem" }}>{b.icon}</span> : null;
                        })}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        Lv.{entry.level} · {getLevelTitle(entry.level)}
                      </span>
                    </div>

                    {/* Points */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px",
                        color: rankStyle.color, fontWeight: "bold", fontSize: "1.1rem" }}>
                        <Zap size={16} />
                        {entry.points.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#475569", display: "flex", alignItems: "center", gap: "3px" }}>
                        <Target size={11} /> {entry.total_quizzes} quizzes
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
