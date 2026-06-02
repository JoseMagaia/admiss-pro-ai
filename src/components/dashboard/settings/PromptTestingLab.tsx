import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Play, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SettingsCard } from "./SettingsForms";
import { StageBadge } from "../StageBadge";
import { testPrompt } from "@/lib/dashboard.functions";

interface Result {
  promptUsed: string;
  modelUsed: string;
  memory: Record<string, unknown>;
  decision: { reply: string; qualification_status: string; updates: Record<string, unknown>; reasoning?: string };
  error: string | null;
}

export function PromptTestingLab() {
  const fn = useServerFn(testPrompt);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");

  const run = useMutation({
    mutationFn: () => fn({ data: { message, phone: phone || undefined } }),
  });

  const result = run.data as Result | undefined;

  return (
    <SettingsCard
      title="Prompt Testing Lab"
      description="Safely test the AI against a message without affecting real conversations (leave phone empty for a clean test)."
    >
      <div className="space-y-1.5">
        <Label>User Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Olá, quero estudar no Reino Unido…"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Phone (optional — loads existing lead memory)</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+5511999999999" />
      </div>
      <Button onClick={() => run.mutate()} disabled={!message || run.isPending}>
        <Play className="mr-1 h-4 w-4" /> {run.isPending ? "Running…" : "Run Test"}
      </Button>

      {result && (
        <div className="mt-4 space-y-4">
          {result.error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{result.error}</div>
          )}
          <div className="rounded-xl border bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">AI Response</span>
              <StageBadge stage={result.decision.qualification_status} className="ml-auto" />
            </div>
            <p className="whitespace-pre-wrap text-sm">{result.decision.reply}</p>
            {result.decision.reasoning && (
              <p className="mt-2 text-xs italic text-muted-foreground">{result.decision.reasoning}</p>
            )}
          </div>

          <Detail title="Model Used">{result.modelUsed}</Detail>
          <Detail title="Extracted Updates (Tool Calls)">
            <pre className="overflow-x-auto text-xs">{JSON.stringify(result.decision.updates, null, 2)}</pre>
          </Detail>
          <Detail title="Memory Retrieved">
            <pre className="overflow-x-auto text-xs">{JSON.stringify(result.memory, null, 2)}</pre>
          </Detail>
          <Detail title="Prompt Used">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs">{result.promptUsed}</pre>
          </Detail>
        </div>
      )}
    </SettingsCard>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-xl border p-3">
      <summary className="cursor-pointer text-sm font-semibold">{title}</summary>
      <div className="mt-2 font-mono text-muted-foreground">{children}</div>
    </details>
  );
}
