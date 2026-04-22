import { createClient } from "@supabase/supabase-js";

// Vite handles environment variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration settings!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SubscriptionTier = 'free' | 'pro' | 'max';
export type UserRole = 'teacher' | 'student' | 'creator' | 'admin';

export type Profile = {
  id:                       string;
  email:                    string;
  full_name:                string;
  role:                     UserRole;
  // ── Subscription ──────────────────────────────────────────
  plan:                     'free' | 'pro' | 'school'; // legacy, synced by trigger
  subscription_tier:        SubscriptionTier;          // source of truth
  subscription_expires_at?: string | null;
  stripe_customer_id?:      string | null;
  stripe_subscription_id?:  string | null;
  // ── Gamification ──────────────────────────────────────────
  points:                   number;
  level:                    number;
  badges:                   string[];
  // ── Onboarding ────────────────────────────────────────────
  onboarding_done:          boolean;
  created_at:               string;
};

export type XpTransaction = {
  id:         string;
  student_id: string;
  lesson_id:  string | null;
  reason:     string;
  xp:         number;
  created_at: string;
};

export type QuizQuestion = {
  id:          string;
  lesson_id:   string;
  teacher_id:  string;
  question:    string;
  option_a:    string;
  option_b:    string;
  option_c?:   string;
  option_d?:   string;
  correct:     'a' | 'b' | 'c' | 'd';
  order_index: number;
  created_at:  string;
};

export type QuizAnswer = {
  id:          string;
  question_id: string;
  session_id:  string;
  student_id:  string;
  answer:      'a' | 'b' | 'c' | 'd';
  is_correct:  boolean;
  answered_at: string;
};

export type LessonRating = {
  id:         string;
  lesson_id:  string;
  student_id: string;
  rating:     1 | 2 | 3 | 4 | 5;
  comment?:   string;
  created_at: string;
};

export type LessonQuestion = {
  id:           string;
  lesson_id:    string;
  session_id?:  string;
  student_id:   string;
  student_name: string;
  question:     string;
  is_answered:  boolean;
  created_at:   string;
};

export type Hotspot = {
  id:          string;
  lesson_id:   string;
  teacher_id:  string;
  title:       string;
  description: string;
  position_x:  number;
  position_y:  number;
  position_z:  number;
  created_at:  string;
};

export type LeaderEntry = {
  id:           string;
  full_name:    string;
  points:       number;
  level:        number;
  badges:       string[];
  total_quizzes: number;
  rank:         number;
};

export type Lesson = {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  model_type: string;
  model_key: string;   // ← the preset lesson ID e.g. "beating-heart"
  model_url: string;
  share_code: string;
  created_at: string;
};

export type Session = {
  id: string;
  lesson_id: string;
  teacher_id: string;
  pin_code: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
};

export type StudentJoin = {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  joined_at: string;
};
