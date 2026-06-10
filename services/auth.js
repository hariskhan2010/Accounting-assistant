import { requireSupabase } from "./supabase";

export async function signInWithOtp(email) {
  if (!email) {
    return { error: new Error("Email address is required.") };
  }

  return requireSupabase().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "gemsaccounting://"
    }
  });
}

export async function signOut() {
  return requireSupabase().auth.signOut();
}

export async function getSession() {
  return requireSupabase().auth.getSession();
}
