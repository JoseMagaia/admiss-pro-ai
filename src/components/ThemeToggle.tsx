import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import { cn } from "@/lib/utils";

/** Light/dark switch. `variant="sidebar"` matches the dark sidebar palette. */
export function ThemeToggle({
  variant = "default",
  className,
}: {
  variant?: "default" | "sidebar" | "icon";
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Light mode" : "Dark mode"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        variant === "sidebar"
          ? "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
