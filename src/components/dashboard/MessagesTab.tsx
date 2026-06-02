import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, MessageSquare, Bot, User, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listMessages } from "@/lib/dashboard.functions";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  phone_number: string;
  message_content: string;
  sender: string;
  received_at: string;
}

export function MessagesTab() {
  const fn = useServerFn(listMessages);
  const { data } = useQuery({
    queryKey: ["messages"],
    queryFn: () => fn(),
    refetchInterval: 5000,
  });
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = (data?.messages ?? []) as Message[];

  const conversations = useMemo(() => {
    const map = new Map<string, Message[]>();
    for (const m of messages) {
      if (!map.has(m.phone_number)) map.set(m.phone_number, []);
      map.get(m.phone_number)!.push(m);
    }
    return Array.from(map.entries())
      .map(([phone, msgs]) => ({ phone, msgs, last: msgs[msgs.length - 1] }))
      .sort((a, b) => new Date(b.last.received_at).getTime() - new Date(a.last.received_at).getTime());
  }, [messages]);

  const filteredConvs = conversations.filter((c) => c.phone.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (!active && filteredConvs.length) setActive(filteredConvs[0].phone);
  }, [filteredConvs, active]);

  const activeMsgs = conversations.find((c) => c.phone === active)?.msgs ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMsgs.length, active]);

  return (
    <div className="grid h-[70vh] grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
      {/* List */}
      <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.map((c) => (
            <button
              key={c.phone}
              onClick={() => setActive(c.phone)}
              className={cn(
                "flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40",
                active === c.phone && "bg-primary/5",
              )}
            >
              <span className="text-sm font-semibold">{c.phone}</span>
              <span className="line-clamp-1 text-xs text-muted-foreground">{c.last.message_content}</span>
            </button>
          ))}
          {filteredConvs.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">No conversations.</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
        {active ? (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-semibold">{active}</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeMsgs.map((m) => {
                const isLead = m.sender === "lead";
                const isAgent = m.sender === "agent" || m.sender === "human";
                return (
                  <div key={m.id} className={cn("flex", isLead ? "justify-start" : "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                        isLead ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase opacity-70">
                        {isLead ? (
                          <>
                            <User className="h-3 w-3" /> Student
                          </>
                        ) : isAgent ? (
                          <>
                            <UserCog className="h-3 w-3" /> Agent
                          </>
                        ) : (
                          <>
                            <Bot className="h-3 w-3" /> AI
                          </>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{m.message_content}</p>
                      <p className="mt-1 text-right text-[10px] opacity-60">
                        {new Date(m.received_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
