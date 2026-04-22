/**
 * useAccessControl — [E-4] Gatekeeper logic for subscription tiers
 * Checks if the current user can access a feature based on their plan.
 */
import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";

type Tier = "free" | "pro" | "max";

interface AccessRules {
  /** True if the user can create/join another lesson today */
  canAccessLesson: boolean;
  /** True if 4K ultra textures are enabled */
  canUse4KTextures: boolean;
  /** True if the user can view the global leaderboard */
  canViewLeaderboard: boolean;
  /** True if Image-to-3D conversion is available */
  canUseImageTo3D: boolean;
  /** True if user has early access to new models */
  hasEarlyAccess: boolean;
  /** Maximum students per session */
  maxStudentsPerSession: number;
  /** Maximum lessons per day (Infinity for unlimited) */
  dailyLessonLimit: number;
  /** The user's current tier */
  tier: Tier;
  /** Whether the user is on a paid plan */
  isPaid: boolean;
}

const TIER_RULES: Record<Tier, Omit<AccessRules, "tier" | "isPaid">> = {
  free: {
    canAccessLesson:       true,   // gated by dailyLessonLimit
    canUse4KTextures:      false,
    canViewLeaderboard:    false,
    canUseImageTo3D:       false,
    hasEarlyAccess:        false,
    maxStudentsPerSession: 30,
    dailyLessonLimit:      3,
  },
  pro: {
    canAccessLesson:       true,
    canUse4KTextures:      false,
    canViewLeaderboard:    true,
    canUseImageTo3D:       true,
    hasEarlyAccess:        false,
    maxStudentsPerSession: 200,
    dailyLessonLimit:      Infinity,
  },
  max: {
    canAccessLesson:       true,
    canUse4KTextures:      true,
    canViewLeaderboard:    true,
    canUseImageTo3D:       true,
    hasEarlyAccess:        true,
    maxStudentsPerSession: Infinity,
    dailyLessonLimit:      Infinity,
  },
};

export function useAccessControl(): AccessRules {
  const { profile } = useAuth();

  return useMemo(() => {
    // Determine tier: check subscription_tier first, then legacy 'plan' field
    const rawTier: string =
      profile?.subscription_tier ??
      (profile?.plan === 'school' ? 'max' : profile?.plan) ??
      'free';

    // Normalize: anything not 'pro'/'max' defaults to 'free'
    const tier: Tier = rawTier === "pro" || rawTier === "max" ? (rawTier as Tier) : "free";

    // Check if subscription is still valid (not expired)
    const expiresAt = profile?.subscription_expires_at;
    const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
    const effectiveTier: Tier = isExpired ? "free" : tier;

    const rules = TIER_RULES[effectiveTier];

    return {
      ...rules,
      tier: effectiveTier,
      isPaid: effectiveTier === "pro" || effectiveTier === "max",
    };
  }, [profile]);
}

// ── Standalone helper (for non-hook contexts) ──────────────────
import type { Profile } from "../services/supabaseClient";

export function getTierFromProfile(profile: Profile | null): Tier {
  const rawTier: string =
    profile?.subscription_tier ??
    (profile?.plan === 'school' ? 'max' : profile?.plan) ??
    'free';
  const expiresAt = profile?.subscription_expires_at;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  if (isExpired) return "free";
  return rawTier === "pro" || rawTier === "max" ? (rawTier as Tier) : "free";
}
