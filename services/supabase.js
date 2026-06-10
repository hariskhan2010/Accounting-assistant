import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { createPlatformStorage } from "./platformStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const isWebServer = Platform.OS === "web" && typeof window === "undefined";
const authStorage = createPlatformStorage();

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: !isWebServer,
        detectSessionInUrl: false,
        persistSession: !isWebServer,
        skipAutoInitialize: isWebServer,
        storage: authStorage
      }
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}
