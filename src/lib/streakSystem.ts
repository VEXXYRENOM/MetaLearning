import { supabase } from "../services/supabaseClient";
import { showToast } from "../components/Toast";
import { awardXP } from "./xpSystem";

// ─── Streak Badge IDs ───────────────────────────────────────
export const STREAK_BADGES = {
  STREAK_3:  { id: "streak_3",  icon: "🔥", label: "3-Day Streak"  },
  STREAK_7:  { id: "streak_7",  icon: "⚡", label: "Week Warrior"  },
  STREAK_14: { id: "streak_14", icon: "💎", label: "Two Weeks"     },
  STREAK_30: { id: "streak_30", icon: "🏆", label: "Month Master"  },
};

// ─── Check & update streak on dashboard load ────────────────
export async function checkAndUpdateStreak(studentId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  isNewCheckin: boolean;
}> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("last_checkin_date, current_streak, longest_streak, badges")
      .eq("id", studentId)
      .single();

    if (error || !profile) return { currentStreak: 0, longestStreak: 0, isNewCheckin: false };

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const lastCheckin = profile.last_checkin_date as string | null;
    const currentStreak = profile.current_streak ?? 0;
    const longestStreak = profile.longest_streak ?? 0;

    // Already checked in today — no update needed
    if (lastCheckin === today) {
      return { currentStreak, longestStreak, isNewCheckin: false };
    }

    // Calculate yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Determine new streak value
    let newStreak: number;
    if (lastCheckin === yesterdayStr) {
      // Consecutive day — increment
      newStreak = currentStreak + 1;
    } else {
      // Missed a day (or first time) — reset
      newStreak = 1;
    }

    const newLongest = Math.max(longestStreak, newStreak);

    // Update DB
    await supabase
      .from("profiles")
      .update({
        last_checkin_date: today,
        current_streak: newStreak,
        longest_streak: newLongest,
      })
      .eq("id", studentId);

    // Award XP for daily check-in (5 XP)
    await awardXP(studentId, "system", "daily_checkin", 5);

    // Show streak toast
    showToast({
      type: "success",
      title: `🔥 ${newStreak}-Day Streak!`,
      message: newStreak === 1
        ? "Welcome back! Your streak restarts today."
        : `Keep it up! +5 XP for showing up today.`,
    });

    // Award streak badges at milestones
    await checkStreakBadges(studentId, newStreak, profile.badges as string[] ?? []);

    return { currentStreak: newStreak, longestStreak: newLongest, isNewCheckin: true };
  } catch (err) {
    console.error("[Streak] Error:", err);
    return { currentStreak: 0, longestStreak: 0, isNewCheckin: false };
  }
}

// ─── Award milestone badges ─────────────────────────────────
async function checkStreakBadges(studentId: string, streak: number, currentBadges: string[]) {
  const milestones = [
    { days: 3,  badge: STREAK_BADGES.STREAK_3  },
    { days: 7,  badge: STREAK_BADGES.STREAK_7  },
    { days: 14, badge: STREAK_BADGES.STREAK_14 },
    { days: 30, badge: STREAK_BADGES.STREAK_30 },
  ];

  for (const { days, badge } of milestones) {
    if (streak >= days && !currentBadges.includes(badge.id)) {
      const { data: fresh } = await supabase
        .from("profiles")
        .select("badges")
        .eq("id", studentId)
        .single();

      const badges: string[] = fresh?.badges ?? [];
      if (!badges.includes(badge.id)) {
        await supabase
          .from("profiles")
          .update({ badges: [...badges, badge.id] })
          .eq("id", studentId);

        setTimeout(() => {
          showToast({
            type: "success",
            title: `${badge.icon} Badge Unlocked: ${badge.label}!`,
            message: `${days}-day streak achieved. You're unstoppable!`,
          });
        }, 2000);
      }
    }
  }
}
