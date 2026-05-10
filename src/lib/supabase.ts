import { createClient } from "@supabase/supabase-js";

function resolveEnv(nameA: string, nameB: string): string {
  const valueA = import.meta.env[nameA];
  if (typeof valueA === "string" && valueA.trim() !== "") return valueA.trim();

  const valueB = import.meta.env[nameB];
  if (typeof valueB === "string" && valueB.trim() !== "") return valueB.trim();

  return "";
}

const supabaseUrl = resolveEnv("VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = resolveEnv("VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
