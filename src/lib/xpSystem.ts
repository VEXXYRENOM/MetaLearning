import { supabase } from "../services/supabaseClient";
import { showToast } from "../components/Toast";

// ─── XP Constants ──────────────────────────────────────────────
export const XP_REWARDS = {
  QUIZ_PERFECT:     100,  // 100% score
  QUIZ_PASS:         50,  // >60% score
  QUIZ_ATTEMPT:      10,  // participated
  ALL_HOTSPOTS:      75,  // explored every hotspot in a lesson
  HOTSPOT_SINGLE:     5,  // explored one hotspot
  DAILY_CHECKIN:      5,  // daily login bonus
} as const;

// ─── Level thresholds ──────────────────────────────────────────
export const LEVEL_TITLES: Record<number, string> = {
  1:  "Novice Explorer",
  2:  "Curious Learner",
  5:  "Knowledge Seeker",
  10: "3D Scholar",
  20: "Science Pioneer",
  30: "Lab Master",
  50: "MetaLearning Legend",
};

export function getLevelTitle(level: number): string {
  const thresholds = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const t of thresholds) {
    if (level >= t) return LEVEL_TITLES[t];
  }
  return "Novice Explorer";
}

export function getXpToNextLevel(points: number): { current: number; needed: number; percent: number } {
  const currentLevelStart = Math.floor(points / 100) * 100;
  const needed = 100;
  const current = points - currentLevelStart;
  return { current, needed, percent: Math.round((current / needed) * 100) };
}

// ─── Badge definitions ─────────────────────────────────────────
export const BADGES = {
  FIRST_LESSON:   { id: "first_lesson",   icon: "🎓", label: "First Lesson"   },
  QUIZ_MASTER:    { id: "quiz_master",    icon: "🧠", label: "Quiz Master"    },
  EXPLORER:       { id: "explorer",       icon: "🔭", label: "Space Explorer" },
  LEVEL_10:       { id: "level_10",       icon: "⭐", label: "Level 10 Hero"  },
  LEVEL_25:       { id: "level_25",       icon: "🏆", label: "Champion"       },
  PERFECT_SCORE:  { id: "perfect_score",  icon: "💯", label: "Perfect Score"  },
  STREAK_3:       { id: "streak_3",       icon: "🔥", label: "3-Day Streak"   },
  STREAK_7:       { id: "streak_7",       icon: "⚡", label: "Week Warrior"   },
  STREAK_14:      { id: "streak_14",      icon: "💎", label: "Two Weeks"      },
  STREAK_30:      { id: "streak_30",      icon: "🏆", label: "Month Master"   },
} as const;

// ─── Core award function ────────────────────────────────────────
interface AwardResult {
  newPoints: number;
  newLevel: number;
  leveledUp: boolean;
}

export async function awardXP(
  studentId: string,
  lessonId: string,
  reason: string,
  xp: number
): Promise<AwardResult | null> {
  try {
    const { data, error } = await supabase.rpc("award_xp", {
      p_student_id: studentId,
      p_lesson_id:  lessonId,
      p_reason:     reason,
      p_xp:         xp,
    });
    if (error) throw error;
    
    const result = data?.[0];
    if (!result) return null;

    return {
      newPoints: result.new_points,
      newLevel:  result.new_level,
      leveledUp: result.leveled_up,
    };
  } catch (err) {
    console.error("[XP] award_xp RPC failed:", err);
    return null;
  }
}

// ─── Award XP for Quiz ─────────────────────────────────────────
export async function awardQuizXP(
  studentId: string,
  lessonId: string,
  scorePercent: number
) {
  let xp: number = XP_REWARDS.QUIZ_ATTEMPT;
  let reason: string = "quiz_attempt";

  if (scorePercent === 100) {
    xp = XP_REWARDS.QUIZ_PERFECT;
    reason = "quiz_perfect";
  } else if (scorePercent >= 60) {
    xp = XP_REWARDS.QUIZ_PASS;
    reason = "quiz_pass";
  }

  const result = await awardXP(studentId, lessonId, reason, xp);
  if (!result) return;

  // Toast notifications
  if (scorePercent === 100) {
    showToast({ type: "success", title: `+${xp} XP 💯 Perfect Score!`, message: "You answered every question correctly!" });
  } else if (scorePercent >= 60) {
    showToast({ type: "success", title: `+${xp} XP 🧠`, message: `Quiz passed with ${scorePercent}%!` });
  } else {
    showToast({ type: "info", title: `+${xp} XP`, message: "Keep practicing to earn more XP!" });
  }

  if (result.leveledUp) {
    setTimeout(() => {
      showToast({
        type: "success",
        title: `⭐ Level Up! → Level ${result.newLevel}`,
        message: `You are now a "${getLevelTitle(result.newLevel)}"!`
      });
    }, 1500);
  }

  // Award Perfect Score badge
  if (scorePercent === 100) {
    await awardBadge(studentId, BADGES.PERFECT_SCORE.id);
  }
}

// ─── Award XP for Hotspot interaction ─────────────────────────
export async function awardHotspotXP(
  studentId: string,
  lessonId: string,
  allExplored: boolean
) {
  const xp     = allExplored ? XP_REWARDS.ALL_HOTSPOTS : XP_REWARDS.HOTSPOT_SINGLE;
  const reason = allExplored ? "all_hotspots" : "hotspot_single";

  const result = await awardXP(studentId, lessonId, reason, xp);
  if (!result) return;

  if (allExplored) {
    showToast({ type: "success", title: `+${xp} XP 🔭`, message: "You explored all hotspots in this lesson!" });
    await awardBadge(studentId, BADGES.EXPLORER.id);
  }

  if (result.leveledUp) {
    setTimeout(() => {
      showToast({
        type: "success",
        title: `⭐ Level Up! → Level ${result.newLevel}`,
        message: `You are now a "${getLevelTitle(result.newLevel)}"!`
      });
    }, 1500);
  }
}

// ─── Badge awarding ────────────────────────────────────────────
async function awardBadge(studentId: string, badgeId: string) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("badges")
      .eq("id", studentId)
      .single();

    const currentBadges: string[] = data?.badges || [];
    if (currentBadges.includes(badgeId)) return;

    await supabase
      .from("profiles")
      .update({ badges: [...currentBadges, badgeId] })
      .eq("id", studentId);
  } catch (err) {
    console.error("[Badge] Failed to award badge:", err);
  }
}
