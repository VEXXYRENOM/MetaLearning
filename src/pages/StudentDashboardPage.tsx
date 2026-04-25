import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen, Hash, Play, Zap, Flame, FlaskConical,
  ChevronRight, LogOut, Trophy, Brain
} from "lucide-react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { OnboardingWizard } from "../components/OnboardingWizard";
import { Skeleton } from "../components/Skeleton";
import { XPProgressWidget } from "../components/XPProgressWidget";
import { useAccessControl } from "../hooks/useAccessControl";
import { getLevelTitle, getXpToNextLevel } from "../lib/xpSystem";
import { getTodayChallenge, getChallengeText } from "../lib/dailyChallenges";
import { checkAndUpdateStreak } from "../lib/streakSystem";

// ─── Design tokens ─────────────────────────────────────────────
const C = {
  bg:         "#020617",
  card:       "rgba(15, 23, 42, 0.85)",
  border:     "rgba(255,255,255,0.07)",
  borderHover:"rgba(255,255,255,0.14)",
  textPrimary:"#f1f5f9",
  textMuted:  "#64748b",
  indigo:     "#6366f1",
  cyan:       "#06b6d4",
  amber:      "#f59e0b",
  emerald:    "#10b981",
};

const glass = {
  background: C.card,
  backdropFilter: "blur(16px)",
  border: `1px solid ${C.border}`,
  borderRadius: "20px",
};

// ─── Bento Card Wrapper ─────────────────────────────────────────
function BentoCard({
  children, style = {}, onClick, accent = C.indigo
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  accent?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        ...glass,
        padding: "1.5rem",
        cursor: onClick ? "pointer" : "default",
        border: `1px solid ${hovered && onClick ? accent + "55" : C.border}`,
        boxShadow: hovered && onClick ? `0 8px 32px ${accent}22` : "none",
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
        transform: hovered && onClick ? "translateY(-2px)" : "translateY(0)",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export function StudentDashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang.startsWith("ar");
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const access = useAccessControl();

  const [pinCode, setPinCode] = useState("");
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, subjects: 0, days: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [challengeDone, setChallengeDone] = useState(false);

  const todayChallenge = getTodayChallenge();

  useEffect(() => {
    if (profile && profile.onboarding_done === false) setShowWizard(true);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    // Daily streak check
    checkAndUpdateStreak(profile.id).then(({ currentStreak, longestStreak }) => {
      setStreak({ current: currentStreak, longest: longestStreak });
    });

    // Fetch session data
    (async () => {
      try {
        const { data } = await supabase
          .from("student_joins")
          .select(`joined_at, sessions(id, lesson_id, lessons(title, subject, model_key))`)
          .eq("student_id", profile.id)
          .order("joined_at", { ascending: false });

        const joins = data || [];
        const sessionsList = joins
          .map((j: any) => {
            const session = j.sessions as any;
            return {
              joined_at: j.joined_at,
              session_id: session?.id,
              lesson_id: session?.lesson_id,
              title: session?.lessons?.title,
              subject: session?.lessons?.subject,
              model_key: session?.lessons?.model_key,
            };
          })
          .filter((s: any) => s.session_id && s.title);

        setRecentSessions(sessionsList.slice(0, 5));

        const subjectSet = new Set(sessionsList.map((s: any) => s.subject));
        const daySet = new Set(sessionsList.map((s: any) => s.joined_at?.split("T")[0]));
        setStats({ total: sessionsList.length, subjects: subjectSet.size, days: daySet.size });
      } catch {/* silent */}
      finally { setLoadingData(false); }
    })();
  }, [profile]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !pinCode.trim()) return;
    setLoadingJoin(true);
    setErrorMsg("");
    try {
      const code = pinCode.trim().toUpperCase();
      const { data: session } = await supabase
        .from("sessions")
        .select("id, lesson_id")
        .eq("share_code", code)
        .eq("is_active", true)
        .maybeSingle();
      if (!session) { setErrorMsg("Invalid or expired PIN code."); return; }
      const { data: existing } = await supabase
        .from("student_joins")
        .select("id")
        .eq("session_id", session.id)
        .eq("student_id", profile.id)
        .maybeSingle();
      if (!existing) {
        await supabase.from("student_joins").insert({
          session_id: session.id, student_id: profile.id,
        });
      }
      navigate(`/lesson/${session.lesson_id}`);
    } catch { setErrorMsg("Something went wrong. Try again."); }
    finally { setLoadingJoin(false); }
  }

  if (!profile) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Skeleton width="400px" height="300px" borderRadius="20px" />
    </div>
  );

  const xp = getXpToNextLevel(profile.points ?? 0);
  const levelTitle = getLevelTitle(profile.level ?? 1);
  const categoryColors: Record<string, string> = {
    ai: "#6366f1", robotics: "#06b6d4", logic: "#f59e0b", critical: "#10b981"
  };
  const challengeColor = categoryColors[todayChallenge.category];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      {showWizard && <OnboardingWizard role="student" onComplete={() => setShowWizard(false)} />}

      {/* ── Top Nav ─────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(2,6,23,0.8)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0.75rem 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            borderRadius: "10px", padding: "6px 12px",
            color: "white", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "1px"
          }}>ML</div>
          <span style={{ color: C.textMuted, fontSize: "0.9rem" }}>MetaLearning</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {profile && <XPProgressWidget compact points={profile.points} level={profile.level} badges={profile.badges} />}
          <LanguageSwitcher />
          <button
            onClick={() => signOut()}
            style={{ background: "none", border: `1px solid ${C.border}`, color: C.textMuted, padding: "6px 10px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem" }}
          >
            <LogOut size={14} /> {t("nav.signout", "Sign Out")}
          </button>
        </div>
      </header>

      {/* ── Bento Grid ──────────────────────────────── */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Welcome row */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ color: C.textPrimary, fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, margin: "0 0 4px" }}>
            {t("student_dashboard.welcome", "Welcome back")}, {profile.full_name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p style={{ color: C.textMuted, margin: 0, fontSize: "0.95rem" }}>
            {t("student_dashboard.subtitle", "Your daily growth hub — show up, level up.")}
          </p>
        </div>

        {/* BENTO GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "1rem",
          alignItems: "start",
        }}>

          {/* 1. XP / Level Hero Card — 8 cols */}
          <BentoCard accent={C.indigo} style={{ gridColumn: "span 8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <motion.div
                animate={{ boxShadow: ["0 0 16px #6366f155", "0 0 32px #a855f777", "0 0 16px #6366f155"] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{
                  width: "72px", height: "72px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 900, fontSize: "1.8rem"
                }}
              >
                {profile.level ?? 1}
              </motion.div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <div>
                    <p style={{ margin: 0, color: "#a5b4fc", fontWeight: 700, fontSize: "1.1rem" }}>{levelTitle}</p>
                    <p style={{ margin: 0, color: C.textMuted, fontSize: "0.8rem" }}>
                      <Zap size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {(profile.points ?? 0).toLocaleString()} XP total
                    </p>
                  </div>
                  <Link to="/leaderboard" style={{ color: C.indigo, textDecoration: "none", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Trophy size={14} /> {t("student_dashboard.leaderboard", "Leaderboard")}
                  </Link>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "999px", height: "10px", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xp.percent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)", borderRadius: "999px" }}
                  />
                </div>
                <p style={{ margin: "4px 0 0", color: C.textMuted, fontSize: "0.75rem" }}>
                  {xp.current} / {xp.needed} XP {t("student_dashboard.to_next", "to next level")}
                </p>
              </div>
            </div>
          </BentoCard>

          {/* 2. Streak Card — 4 cols */}
          <BentoCard accent={C.amber} style={{ gridColumn: "span 4" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "4px" }}>
                {streak.current >= 7 ? "🔥" : streak.current >= 3 ? "⚡" : "✨"}
              </div>
              <div style={{ color: C.textPrimary, fontWeight: 800, fontSize: "2.2rem", lineHeight: 1 }}>
                {streak.current}
              </div>
              <div style={{ color: C.amber, fontWeight: 600, fontSize: "0.85rem", marginBottom: "8px" }}>
                {t("student_dashboard.day_streak", "Day Streak")}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: i < (streak.current % 7 || (streak.current >= 7 ? 7 : streak.current))
                      ? C.amber : "rgba(255,255,255,0.1)"
                  }} />
                ))}
              </div>
              <p style={{ color: C.textMuted, fontSize: "0.75rem", margin: "8px 0 0" }}>
                {t("student_dashboard.best", "Best")}: {streak.longest} {t("student_dashboard.days", "days")}
              </p>
            </div>
          </BentoCard>

          {/* 3. Daily Challenge — 6 cols */}
          <BentoCard accent={challengeColor} style={{ gridColumn: "span 6" }}>
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                background: `${challengeColor}22`, border: `1px solid ${challengeColor}44`,
                color: challengeColor, padding: "3px 10px", borderRadius: "999px",
                fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px"
              }}>
                {todayChallenge.categoryIcon} {todayChallenge.category.toUpperCase()}
              </span>
              <span style={{ color: C.textMuted, fontSize: "0.75rem", marginInlineStart: "auto" }}>
                +{todayChallenge.xpReward} XP
              </span>
            </div>
            <h3 style={{ color: C.textPrimary, fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", lineHeight: 1.5 }}>
              {getChallengeText(todayChallenge, lang, "question")}
            </h3>
            {!challengeDone ? (
              <button
                onClick={() => setChallengeDone(true)}
                style={{
                  background: `linear-gradient(135deg, ${challengeColor}, ${challengeColor}aa)`,
                  border: "none", padding: "10px 20px", borderRadius: "10px",
                  color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                  width: "100%"
                }}
              >
                {t("student_dashboard.see_hint", "Reveal Hint")} 💡
              </button>
            ) : (
              <div style={{
                background: `${challengeColor}11`, border: `1px solid ${challengeColor}33`,
                borderRadius: "10px", padding: "12px",
                color: C.textMuted, fontSize: "0.9rem", lineHeight: 1.6
              }}>
                💡 {getChallengeText(todayChallenge, lang, "hint")}
              </div>
            )}
          </BentoCard>

          {/* 4. Join with PIN — 6 cols */}
          <BentoCard accent={C.cyan} style={{ gridColumn: "span 6" }}>
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Hash size={16} color={C.cyan} />
              <span style={{ color: C.textPrimary, fontWeight: 600, fontSize: "0.95rem" }}>
                {t("student_dashboard.join_title", "Join a Class Session")}
              </span>
            </div>
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                value={pinCode}
                onChange={e => setPinCode(e.target.value.toUpperCase())}
                placeholder={t("student_dashboard.pin_placeholder", "Enter PIN code e.g. AB12CD")}
                maxLength={8}
                style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                  borderRadius: "10px", padding: "12px 14px", color: C.textPrimary,
                  fontSize: "1rem", fontFamily: "'Orbitron', monospace", letterSpacing: "3px",
                  outline: "none", width: "100%", boxSizing: "border-box"
                }}
              />
              {errorMsg && <p style={{ color: "#f87171", margin: 0, fontSize: "0.85rem" }}>{errorMsg}</p>}
              <button
                type="submit"
                disabled={loadingJoin || !pinCode.trim()}
                style={{
                  background: loadingJoin ? "rgba(6,182,212,0.3)" : "linear-gradient(135deg, #06b6d4, #0ea5e9)",
                  border: "none", padding: "12px", borderRadius: "10px",
                  color: "white", fontWeight: 700, cursor: loadingJoin ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}
              >
                <Play size={16} fill="white" />
                {loadingJoin ? t("student_dashboard.joining", "Joining...") : t("student_dashboard.join_btn", "Join Now")}
              </button>
            </form>
          </BentoCard>

          {/* 5. Interactive Lab Placeholder — 4 cols */}
          <BentoCard accent={C.emerald} style={{ gridColumn: "span 4" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%", opacity: 0.7 }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: `${C.emerald}22`, border: `1px solid ${C.emerald}44`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <FlaskConical size={24} color={C.emerald} />
              </div>
              <div>
                <h3 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: "1rem", fontWeight: 700 }}>
                  {t("student_dashboard.interactive_lab_title", "Interactive Lab")}
                </h3>
                <p style={{ color: C.textMuted, margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
                  {t("student_dashboard.interactive_lab_desc", "Physics & Chemistry engine coming soon. Prepare for real-time reactions!")}
                </p>
              </div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "4px", color: C.emerald, fontSize: "0.85rem", fontWeight: 600 }}>
                {t("student_dashboard.coming_soon", "Coming Soon")} <Zap size={16} />
              </div>
            </div>
          </BentoCard>

          {/* 6. Browse Library — 4 cols */}
          <BentoCard accent={C.indigo} style={{ gridColumn: "span 4" }} onClick={() => navigate("/sandbox")}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: `${C.indigo}22`, border: `1px solid ${C.indigo}44`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <BookOpen size={24} color={C.indigo} />
              </div>
              <div>
                <h3 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: "1rem", fontWeight: 700 }}>
                  {t("student_dashboard.library_title", "3D Library")}
                </h3>
                <p style={{ color: C.textMuted, margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
                  {t("student_dashboard.library_desc", "Browse all interactive 3D models across every subject.")}
                </p>
              </div>
              <div style={{ color: C.textMuted, fontSize: "0.8rem" }}>
                📚 {t("student_dashboard.models_count", "120+ models available")}
              </div>
            </div>
          </BentoCard>

          {/* 7. Skills / AI tracker — 4 cols */}
          <BentoCard accent="#a855f7" style={{ gridColumn: "span 4" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: "#a855f722", border: "1px solid #a855f744",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Brain size={24} color="#a855f7" />
              </div>
              <div>
                <h3 style={{ color: C.textPrimary, margin: "0 0 6px", fontSize: "1rem", fontWeight: 700 }}>
                  {t("student_dashboard.skills_title", "Your Growth Stats")}
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { label: t("student_dashboard.total_lessons", "Lessons"), val: stats.total, icon: "📖" },
                  { label: t("student_dashboard.subjects", "Subjects"), val: stats.subjects, icon: "🔬" },
                  { label: t("student_dashboard.days_active", "Active Days"), val: stats.days, icon: "📅" },
                  { label: t("student_dashboard.streak", "Streak"), val: streak.current, icon: "🔥" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: "12px",
                    padding: "10px", border: `1px solid ${C.border}`, textAlign: "center"
                  }}>
                    <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                    <div style={{ color: C.textPrimary, fontWeight: 800, fontSize: "1.2rem" }}>{s.val}</div>
                    <div style={{ color: C.textMuted, fontSize: "0.7rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* 8. Recent Sessions — 12 cols full width */}
          <BentoCard style={{ gridColumn: "span 12" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ color: C.textPrimary, margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                📋 {t("student_dashboard.recent", "Recent Sessions")}
              </h3>
            </div>
            {loadingData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[1, 2, 3].map(i => <Skeleton key={i} width="100%" height="54px" borderRadius="10px" />)}
              </div>
            ) : recentSessions.length === 0 ? (
              <p style={{ color: C.textMuted, textAlign: "center", padding: "2rem 0", margin: 0 }}>
                {t("student_dashboard.no_sessions", "No sessions yet. Join a class or explore the Sandbox!")}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentSessions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                      borderRadius: "12px", padding: "12px 16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: `${C.indigo}22`, display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <BookOpen size={16} color={C.indigo} />
                      </div>
                      <div>
                        <div style={{ color: C.textPrimary, fontWeight: 600, fontSize: "0.9rem" }}>{s.title}</div>
                        <div style={{ color: C.textMuted, fontSize: "0.78rem" }}>{s.subject}</div>
                      </div>
                    </div>
                    <Link
                      to={`/lesson/${s.lesson_id || s.model_key}`}
                      style={{
                        background: `${C.indigo}22`, border: `1px solid ${C.indigo}44`,
                        color: "#a5b4fc", padding: "6px 12px", borderRadius: "8px",
                        textDecoration: "none", fontSize: "0.8rem", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "4px"
                      }}
                    >
                      <Play size={12} fill="#a5b4fc" /> {t("student_dashboard.revisit", "Revisit")}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </BentoCard>

        </div>
      </main>
    </div>
  );
}
