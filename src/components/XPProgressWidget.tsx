import { motion } from "framer-motion";
import { Zap, Star } from "lucide-react";
import { getLevelTitle, getXpToNextLevel, BADGES } from "../lib/xpSystem";
import { Link } from "react-router-dom";

interface XPProgressWidgetProps {
  points: number;
  level: number;
  badges: string[];
  compact?: boolean; // small mode for header/sidebar
}

export function XPProgressWidget({ points, level, badges, compact = false }: XPProgressWidgetProps) {
  const xp = getXpToNextLevel(points);
  const title = getLevelTitle(level);

  if (compact) {
    return (
      <Link to="/leaderboard" style={{ textDecoration: "none" }}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "rgba(99,102,241,0.15)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(99,102,241,0.35)", borderRadius: "999px",
            padding: "6px 14px", cursor: "pointer"
          }}
        >
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            borderRadius: "50%", width: "28px", height: "28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.75rem", fontWeight: "bold", color: "white"
          }}>
            {level}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: "#a5b4fc", fontWeight: "bold", fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: "4px" }}>
              <Zap size={12} /> {points.toLocaleString()} XP
            </div>
            <div style={{ width: "80px", height: "4px", background: "rgba(255,255,255,0.1)",
              borderRadius: "999px", overflow: "hidden", marginTop: "3px" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xp.percent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)",
                  borderRadius: "999px" }}
              />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "rgba(15,23,42,0.8)", backdropFilter: "blur(16px)",
        border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px",
        padding: "1.5rem", fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      {/* Level badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <motion.div
          animate={{ boxShadow: ["0 0 10px rgba(99,102,241,0.4)", "0 0 20px rgba(168,85,247,0.6)", "0 0 10px rgba(99,102,241,0.4)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: "56px", height: "56px", borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "bold", fontSize: "1.4rem"
          }}
        >
          {level}
        </motion.div>
        <div>
          <p style={{ margin: "0 0 2px", color: "#a5b4fc", fontWeight: "700", fontSize: "1rem" }}>{title}</p>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.8rem" }}>
            <Zap size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {points.toLocaleString()} XP total
          </p>
        </div>
      </div>

      {/* XP Bar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.75rem", color: "#64748b", marginBottom: "6px" }}>
          <span>Progress to Level {level + 1}</span>
          <span>{xp.current}/{xp.needed} XP</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "999px",
          height: "10px", overflow: "hidden", position: "relative" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xp.percent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)",
              borderRadius: "999px",
              boxShadow: "0 0 8px rgba(168,85,247,0.5)"
            }}
          />
        </div>
      </div>

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div>
          <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: "0.75rem",
            display: "flex", alignItems: "center", gap: "5px" }}>
            <Star size={12} /> EARNED BADGES
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {badges.map(bid => {
              const b = Object.values(BADGES).find(x => x.id === bid);
              if (!b) return null;
              return (
                <motion.div
                  key={bid}
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={b.label}
                  style={{
                    background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "10px", padding: "6px 10px",
                    fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px",
                    color: "#a5b4fc", cursor: "default"
                  }}
                >
                  <span>{b.icon}</span>
                  <span style={{ fontSize: "0.7rem" }}>{b.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard CTA */}
      <Link to="/leaderboard" style={{
        display: "block", marginTop: "1.25rem", textAlign: "center",
        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
        borderRadius: "10px", padding: "8px 16px", color: "#a5b4fc",
        textDecoration: "none", fontSize: "0.85rem", transition: "all 0.2s"
      }}>
        🏆 View Global Leaderboard
      </Link>
    </motion.div>
  );
}
