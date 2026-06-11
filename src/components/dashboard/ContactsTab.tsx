import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, Contact as ContactIcon, MessageSquare, ArrowUpDown, Download } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listContacts } from "@/lib/dashboard.functions";
import { exportContactsCsv } from "@/lib/campaigns.functions";
import { useDashboardNav } from "@/lib/dashboard-nav";


interface Contact {
  id: string;
  lead_name: string | null;
  phone_number: string;
  course_interest: string | null;
  country_interest: string | null;
  created_at: string;
}

const TIME_FILTERS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
] as const;

const SORTS = [
  { id: "recent", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "name_asc", label: "Name A–Z" },
] as const;

function withinRange(iso: string | null | undefined, range: string): boolean {
  if (range === "all") return true;
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return false;
  const now = Date.now();
  const day = 86400000;
  if (range === "today") return new Date(iso).toDateString() === new Date().toDateString();
  if (range === "7d") return now - t <= 7 * day;
  if (range === "30d") return now - t <= 30 * day;
  return true;
}

export function ContactsTab() {
  const fn = useServerFn(listContacts);
  const exportFn = useServerFn(exportContactsCsv);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [exporting, setExporting] = useState(false);
  const { openConversation } = useDashboardNav();

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = (await exportFn()) as { csv: string; error?: string | null };
      if (!res.csv) {
        toast.error(res.error ?? "No contacts to export");
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Contacts exported");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };


  const { data } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => fn(),
    refetchInterval: 10000,
  });

  const contacts = (data?.contacts ?? []) as Contact[];
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const rows = contacts.filter(
      (c) =>
        (!q ||
          c.lead_name?.toLowerCase().includes(q) ||
          c.phone_number.toLowerCase().includes(q) ||
          c.course_interest?.toLowerCase().includes(q) ||
          c.country_interest?.toLowerCase().includes(q)) &&
        withinRange(c.created_at, timeFilter),
    );
    rows.sort((a, b) => {
      if (sort === "name_asc") return (a.lead_name ?? "").localeCompare(b.lead_name ?? "");
      const at = new Date(a.created_at ?? 0).getTime();
      const bt = new Date(b.created_at ?? 0).getTime();
      return sort === "oldest" ? at - bt : bt - at;
    });
    return rows;
  }, [contacts, search, timeFilter, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ContactIcon className="h-4 w-4 text-primary" />
          {filtered.length} contact{filtered.length === 1 ? "" : "s"}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_FILTERS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={handleExport} disabled={exporting}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

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
              <th className="px-4 py-3 text-right font-semibold">Message</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="cursor-pointer border-b last:border-0 hover:bg-muted/30"
                onClick={() => openConversation(c.phone_number)}
              >
                <td className="px-4 py-3 font-medium">{c.lead_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone_number}</td>
                <td className="px-4 py-3">{c.course_interest ?? "—"}</td>
                <td className="px-4 py-3">{c.country_interest ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {format(new Date(c.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 gap-1 px-2 text-xs text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConversation(c.phone_number);
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
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
