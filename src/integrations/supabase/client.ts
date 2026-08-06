// Client-side auth shim — replaces the Supabase JS client with a thin wrapper
// around local sessions stored in localStorage. Credentials are verified by the
// server (localLogin / signUpLocal), which returns a bearer token kept in
// localStorage and attached to every server-function call by auth-attacher.
import { localLogin, localLogout } from "@/lib/auth.functions";

export const SESSION_STORAGE_KEY = "local_access_token";
export const SESSION_USER_KEY = "local_user";

type AuthListener = (event: string, session: unknown) => void;

const listeners = new Set<AuthListener>();

function emit(event: string, session: unknown): void {
  listeners.forEach((l) => {
    try {
      l(event, session);
    } catch {
      // listener errors must not break auth flows
    }
  });
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readUser(): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(token: string, user: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, token);
    window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user ?? null));
  } catch {
    // storage unavailable — session simply won't persist across reloads
  }
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_USER_KEY);
  } catch {
    // ignore
  }
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase = {
  auth: {
    async getSession() {
      const token = readToken();
      return {
        data: { session: token ? { access_token: token } : null },
        error: null,
      };
    },

    async getUser() {
      const token = readToken();
      if (!token) return { data: { user: null }, error: { message: "No session" } };
      const user = readUser();
      return { data: { user }, error: null };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const res = await localLogin({ data: { email, password } });
      if (!res.ok) {
        return { data: { session: null }, error: { message: res.error ?? "Invalid email or password" } };
      }
      const session = { access_token: res.token as string, user: res.user ?? null };
      writeSession(res.token as string, res.user ?? null);
      emit("SIGNED_IN", session);
      return { data: { session }, error: null };
    },

    async signOut() {
      const token = readToken();
      if (token) {
        try {
          await localLogout({ data: { token } });
        } catch {
          // session may already be invalid server-side; still clear locally
        }
      }
      clearSession();
      emit("SIGNED_OUT", null);
      return { error: null };
    },

    onAuthStateChange(callback: AuthListener) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },
  },
};
