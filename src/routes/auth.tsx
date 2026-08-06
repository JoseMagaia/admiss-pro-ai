import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2, ArrowLeft, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signUpLocal } from "@/lib/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_BRAND } from "@/lib/useBranding";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Linkmoore Education" },
      { name: "description", content: "Sign in to the Linkmoore Education admissions dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // If already signed in, go to the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError("Invalid email or password.");
          return;
        }
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      // signup
      const res = (await signUpLocal({ data: { email, password, full_name: fullName } })) as {
        ok: boolean;
        token?: string;
        role?: string;
        error?: string | null;
      };
      if (!res.ok) {
        setError(res.error ?? "Failed to create account.");
        return;
      }
      setInfo(
        res.role === "super_admin"
          ? "Account created — you are the platform administrator."
          : "Account created — an administrator will assign your role.",
      );
      // Sign the new user straight in.
      await supabase.auth.signInWithPassword({ email, password });
      navigate({ to: "/dashboard", replace: true });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setInfo("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="rounded-2xl border bg-card p-8 shadow-elevated">
          <div className="mb-6 flex items-center gap-2">
            <img src={DEFAULT_BRAND.logoLight} alt={`${DEFAULT_BRAND.name} logo`} className="h-10 w-auto max-w-[140px] object-contain" />
          </div>
          <p className="mb-6 text-xs text-muted-foreground">Admissions Dashboard</p>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <h2 className="mb-1 text-xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Access the admissions platform with your account."
              : "Sign up to join your team's admissions workspace."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">At least 8 characters.</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {info && <p className="text-sm text-emerald-600">{info}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mode === "signin" ? null : <UserPlus className="mr-2 h-4 w-4" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {mode === "signin" ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              New here?{" "}
              <button type="button" onClick={() => switchMode("signup")} className="font-medium text-primary hover:underline">
                Create an account
              </button>
            </p>
          ) : (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("signin")} className="font-medium text-primary hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
