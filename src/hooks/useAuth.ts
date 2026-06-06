import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile } from "@/lib/auth.functions";
import type { AppRole } from "@/lib/roles";

export interface AuthProfile {
  authenticated: boolean;
  role: AppRole | null;
  email: string | null;
  full_name: string | null;
  userId: string | null;
  permissions: string[];
}

const EMPTY: AuthProfile = {
  authenticated: false,
  role: null,
  email: null,
  full_name: null,
  userId: null,
  permissions: [],
};

/**
 * Client-side auth state. Tracks the Supabase session and resolves the user's
 * role from the server (which validates the bearer token).
 */
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthProfile>(EMPTY);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setProfile(EMPTY);
      setLoading(false);
      return;
    }
    try {
      const p = (await getMyProfile()) as AuthProfile;
      setProfile(p);
    } catch {
      setProfile(EMPTY);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    refresh();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (active) refresh();
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(EMPTY);
  }, []);

  return { loading, profile, refresh, signOut };
}
