import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bell, Ticket as TicketIcon, Megaphone } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listNotifications, markNotificationRead } from "@/lib/tickets.functions";
import { useDashboardNav } from "@/lib/dashboard-nav";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  link_phone: string | null;
  created_at: string;
  read: boolean;
}

export function NotificationBell() {
  const qc = useQueryClient();
  const listFn = useServerFn(listNotifications);
  const markFn = useServerFn(markNotificationRead);
  const nav = useDashboardNav();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listFn(),
    refetchInterval: 30_000,
  });
  const notifications = ((data as { notifications?: Notification[] } | undefined)?.notifications ?? []) as Notification[];
  const unread = (data as { unread?: number } | undefined)?.unread ?? 0;

  const mark = useMutation({
    mutationFn: (v: { id?: string; all?: boolean }) => markFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          Notifications
          {unread > 0 && (
            <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => mark.mutate({ all: true })}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">You're all caught up.</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                mark.mutate({ id: n.id });
                if (n.link_phone) {
                  nav.openConversation(n.link_phone);
                  setOpen(false);
                }
              }}
              className={cn(
                "flex w-full gap-2 border-b px-3 py-2.5 text-left last:border-0 hover:bg-muted/50",
                !n.read && "bg-primary/5",
              )}
            >
              {n.kind === "ticket" ? (
                <TicketIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{n.title}</span>
                {n.body && <span className="block truncate text-xs text-muted-foreground">{n.body}</span>}
                <span className="block text-[11px] text-muted-foreground">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
