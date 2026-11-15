import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";

// Normalizamos la URL en caso de que termine en /rest/v1/ para que Auth (/auth/v1) y REST (/rest/v1) funcionen sin duplicar rutas
export const supabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/$/, "");

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase =
  typeof window !== "undefined"
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : createClient(supabaseUrl, supabaseAnonKey);
