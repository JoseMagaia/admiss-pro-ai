import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { s as supabase, a as signUpLocal } from "./client-Cq9-7bp9.mjs";
import { c as cn, B as Button } from "./button-BXrfXN_b.mjs";
import { D as DEFAULT_BRAND, L as Label, I as Input } from "./useBranding-BPg4hKJU.mjs";

import "../_libs/seroval.mjs";
import { c as ArrowLeft, L as LoaderCircle, U as UserPlus } from "../_libs/lucide-react.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "./server-BpMAhPfL.mjs";
import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";




import "./roles-vB9M4HoO.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__query-core.mjs";
function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = reactExports.useState("signin");
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [fullName, setFullName] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [info, setInfo] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) navigate({
        to: "/dashboard",
        replace: true
      });
    });
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const {
          error: signInError
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) {
          setError("Invalid email or password.");
          return;
        }
        navigate({
          to: "/dashboard",
          replace: true
        });
        return;
      }
      const res = await signUpLocal({
        data: {
          email,
          password,
          full_name: fullName
        }
      });
      if (!res.ok) {
        setError(res.error ?? "Failed to create account.");
        return;
      }
      setInfo(res.role === "super_admin" ? "Account created — you are the platform administrator." : "Account created — an administrator will assign your role.");
      await supabase.auth.signInWithPassword({
        email,
        password
      });
      navigate({
        to: "/dashboard",
        replace: true
      });
    } finally {
      setLoading(false);
    }
  };
  const switchMode = (m) => {
    setMode(m);
    setError("");
    setInfo("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-gradient-hero px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to site"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-8 shadow-elevated", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: DEFAULT_BRAND.logoLight, alt: `${DEFAULT_BRAND.name} logo`, className: "h-10 w-auto max-w-[140px] object-contain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-xs text-muted-foreground", children: "Admissions Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1", children: ["signin", "signup"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => switchMode(m), className: cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"), children: m === "signin" ? "Sign in" : "Create account" }, m)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-xl font-semibold", children: mode === "signin" ? "Welcome back" : "Create your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-muted-foreground", children: mode === "signin" ? "Access the admissions platform with your account." : "Sign up to join your team's admissions workspace." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "full_name", children: "Full name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "full_name", type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "Jane Smith", required: true, autoComplete: "name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@company.com", required: true, autoComplete: "email" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", required: true, minLength: 8, autoComplete: mode === "signin" ? "current-password" : "new-password" }),
          mode === "signup" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "At least 8 characters." })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: error }),
        info && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-emerald-600", children: info }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "w-full", disabled: loading, children: [
          loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : mode === "signin" ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "mr-2 h-4 w-4" }),
          mode === "signin" ? "Sign in" : "Create account"
        ] })
      ] }),
      mode === "signin" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-xs text-muted-foreground", children: [
        "New here?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => switchMode("signup"), className: "font-medium text-primary hover:underline", children: "Create an account" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-xs text-muted-foreground", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => switchMode("signin"), className: "font-medium text-primary hover:underline", children: "Sign in" })
      ] })
    ] })
  ] }) });
}
export {
  AuthPage as component
};
