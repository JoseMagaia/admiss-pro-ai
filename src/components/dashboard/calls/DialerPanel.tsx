import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Phone, Search, Delete, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchDialContacts } from "@/lib/calls.functions";
import type { CallTarget } from "./CallOutcomeDialog";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

interface ContactRow {
  id: string;
  phone_number: string;
  lead_name: string | null;
  course_interest: string | null;
  country_interest: string | null;
}

export function DialerPanel({ onCall, busy }: { onCall: (t: CallTarget) => void; busy: boolean }) {
  const searchFn = useServerFn(searchDialContacts);
  const [number, setNumber] = useState("");
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["dial-contacts", search],
    queryFn: () => searchFn({ data: { query: search } }),
  });
  const contacts = (data?.contacts ?? []) as ContactRow[];
  const showResults = useMemo(() => search.trim().length > 0, [search]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Dialpad */}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <Input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="+1 555 123 4567"
          className="mb-4 text-center text-lg tracking-wide"
        />
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setNumber((n) => n + k)}
              className="rounded-xl border py-4 text-lg font-medium transition-colors hover:bg-muted"
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Button
            className="h-12 flex-1 gap-2 text-base"
            disabled={busy || !number.trim()}
            onClick={() => onCall({ phone_number: number.trim() })}
          >
            <Phone className="h-5 w-5" /> Call
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setNumber((n) => n.slice(0, -1))}>
            <Delete className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Contact search */}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search contacts…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {showResults && contacts.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No contacts found.</p>
          )}
          {!showResults && (
            <p className="py-8 text-center text-sm text-muted-foreground">Start typing to find a contact to call.</p>
          )}
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted/50">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate font-medium">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.lead_name ?? "Unknown"}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {c.phone_number}
                  {c.course_interest ? ` · ${c.course_interest}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1"
                disabled={busy}
                onClick={() => onCall({ phone_number: c.phone_number, lead_id: c.id, lead_name: c.lead_name })}
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
