import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Contact as ContactIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { listContacts } from "@/lib/dashboard.functions";

interface Contact {
  id: string;
  lead_name: string | null;
  phone_number: string;
  course_interest: string | null;
  country_interest: string | null;
  created_at: string;
}

export function ContactsTab() {
  const fn = useServerFn(listContacts);
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => fn(),
    refetchInterval: 10000,
  });

  const contacts = (data?.contacts ?? []) as Contact[];
  const q = search.toLowerCase();
  const filtered = contacts.filter(
    (c) =>
      !q ||
      c.lead_name?.toLowerCase().includes(q) ||
      c.phone_number.toLowerCase().includes(q) ||
      c.course_interest?.toLowerCase().includes(q) ||
      c.country_interest?.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ContactIcon className="h-4 w-4 text-primary" />
          {filtered.length} contact{filtered.length === 1 ? "" : "s"}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Added</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{c.lead_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone_number}</td>
                <td className="px-4 py-3">{c.course_interest ?? "—"}</td>
                <td className="px-4 py-3">{c.country_interest ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(c.created_at), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
