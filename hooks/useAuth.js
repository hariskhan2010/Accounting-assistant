import { useEffect, useState } from "react";
import { requireSupabase } from "@/services/supabase";
import * as authService from "@/services/auth";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = requireSupabase();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAuthenticated = !!session?.user;

  return {
    session,
    isLoading,
    isAuthenticated,
    signIn: authService.signInWithOtp,
    signOut: async () => {
      await authService.signOut();
      setSession(null);
    }
  };
}
