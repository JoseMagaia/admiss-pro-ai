import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Boxes } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listMySpaces, type SpaceLite } from "@/lib/spaces.functions";
import { ACTIVE_SPACE_KEY } from "@/lib/space-attacher";

// Header control that lets users with access to more than one Space switch the
// active sub-account. Changing the Space persists to localStorage (read by the
// space-attacher middleware) and reloads so every query refetches scoped data.
export function SpaceSwitcher() {
  const listFn = useServerFn(listMySpaces);
  const { data } = useQuery({ queryKey: ["my-spaces"], queryFn: () => listFn() });
  const spaces = (data?.spaces ?? []) as SpaceLite[];

  const active =
    (typeof window !== "undefined" && window.localStorage.getItem(ACTIVE_SPACE_KEY)) || "";

  // If the stored active space is no longer available, fall back to the first.
  useEffect(() => {
    if (spaces.length === 0) return;
    const ids = spaces.map((s) => s.id);
    if (!active || !ids.includes(active)) {
      try {
        window.localStorage.setItem(ACTIVE_SPACE_KEY, spaces[0].id);
      } catch {
        /* ignore */
      }
    }
  }, [spaces, active]);

  if (spaces.length <= 1) return null;

  const current = active && spaces.some((s) => s.id === active) ? active : spaces[0]?.id ?? "";

  const onChange = (id: string) => {
    if (id === current) return;
    try {
      window.localStorage.setItem(ACTIVE_SPACE_KEY, id);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div className="px-2">
      <label className="mb-1 flex items-center gap-1.5 text-xs text-sidebar-foreground/60">
        <Boxes className="h-3.5 w-3.5" /> Active Space
      </label>
      <Select value={current} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full bg-sidebar-accent/40 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {spaces.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
              {s.status !== "active" ? " (suspended)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
