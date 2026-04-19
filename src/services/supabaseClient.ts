import { createClient } from "@supabase/supabase-js";

// Vite handles environment variables via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration settings!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "teacher" | "student";
  created_at: string;
};

export type Lesson = {
  id: string;
  teacher_id: string;
  title: string;
  subject: string;
  model_type: string;
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
