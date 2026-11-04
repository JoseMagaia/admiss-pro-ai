import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2 } from "lucide-react";
import { quickSearchLeads } from "@/lib/dashboard.functions";
import { STAGE_LABELS } from "@/lib/pipeline";
import { Input } from "@/components/ui/input";

export function GlobalLeadSearch({ onOpen }: { onOpen: (phone: string) => void }) {
  const fn = useServerFn(quickSearchLeads);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        boxRef.current?.querySelector("input")?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["quick-search", debounced],
    queryFn: () => fn({ data: { q: debounced } }),
    enabled: debounced.length >= 2,
  });
  const results = data?.results ?? [];

  return (
    <div ref={boxRef} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search leads by name or number (Ctrl+K)"
        className="h-9 pl-8 text-sm"
        aria-label="Search leads"
      />
      {open && debounced.length >= 2 && (
        <div className="absolute right-0 z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
          {isFetching && results.length === 0 ? (
            <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Searching…</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">No leads found</div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={!r.phone_number}
                onClick={() => { if (r.phone_number) { onOpen(r.phone_number); setOpen(false); setQ(""); } }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{r.lead_name || "Unnamed lead"}</span>
                  <span className="block truncate text-xs text-muted-foreground">{r.phone_number}</span>
                </span>
                {r.qualification_status && (
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {STAGE_LABELS[r.qualification_status] ?? r.qualification_status}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
