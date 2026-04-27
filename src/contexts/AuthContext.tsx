import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session as SupabaseSession } from "@supabase/supabase-js";
import { supabase, Profile } from "../services/supabaseClient";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: SupabaseSession | null;
  isLoading: boolean;
  isPro: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isPro: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) await fetchProfile(session.user.id);
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        try {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchProfile(newSession.user.id);
          } else {
            setProfile(null);
          }
        } catch(err) {
          console.error("Auth state change error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    // Try with org join first (requires v10 migration)
    const { data, error } = await supabase
      .from("profiles")
      .select("*, organizations(subscription_status, name)")
      .eq("id", userId)
      .single();

    if (!error) {
      setProfile(data as Profile);
      return;
    }

    // Fallback: org join failed (migration not applied yet) — fetch basic profile
    const { data: basicData, error: basicError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (basicError) {
      console.error("Error fetching profile:", basicError);
    } else {
      setProfile(basicData as Profile);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Check subscription tier AND expiry date (with 1-hour grace period)
  const subscriptionActive = (() => {
    // 1. Enterprise/Org check:
    if (profile?.organizations?.subscription_status === 'active') {
      return true;
    }

    // 2. Individual check:
    const tier = profile?.subscription_tier;
    const expiresAt = profile?.subscription_expires_at;
    const isTierPaid = tier === "pro" || tier === "max";
    if (!isTierPaid) return false;
    // If no expiry date set, trust the tier field (legacy or lifetime)
    if (!expiresAt) return true;
    // Check expiry with 1-hour grace period to avoid edge cases at renewal
    const expiryMs = new Date(expiresAt).getTime();
    const nowMs = Date.now() - (60 * 60 * 1000); // subtract 1h = 1-hour grace
    return expiryMs > nowMs;
  })();

  const isPro =
    subscriptionActive         ||
    profile?.plan === "pro"    || // legacy fallback (old plan field)
    profile?.plan === "school";   // legacy fallback

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      isLoading, 
      isPro: isPro ?? false, 
      signOut,
      refreshProfile: async () => { if (user) await fetchProfile(user.id); }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
