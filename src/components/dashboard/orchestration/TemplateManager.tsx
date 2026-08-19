import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CloudUpload, FileText, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteWabaTemplate,
  listWabaTemplates,
  saveWabaTemplate,
  submitWabaTemplate,
  syncWabaTemplates,
  type WabaTemplateComponent,
  type WabaTemplateRow,
} from "@/lib/waba-templates.functions";

type Workspace = { id: string; name: string };

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED" || status === "DISABLED") return "destructive";
  if (status === "PENDING" || status === "IN_APPEAL") return "secondary";
  return "outline";
}

export function TemplateManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWabaTemplates);
  const submitFn = useServerFn(submitWabaTemplate);
  const syncFn = useServerFn(syncWabaTemplates);
  const deleteFn = useServerFn(deleteWabaTemplate);
  const { data, isPending } = useQuery({ queryKey: ["waba-templates"], queryFn: () => listFn() });
  const templates = (data?.templates ?? []) as WabaTemplateRow[];
  const workspaces = (data?.workspaces ?? []) as Workspace[];
  const [editing, setEditing] = useState<WabaTemplateRow | "new" | null>(null);

  const submit = useMutation({
    mutationFn: (id: string) => submitFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error ?? "Submission failed");
      toast.success("Template submitted to Meta");
      qc.invalidateQueries({ queryKey: ["waba-templates"] });
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error ?? "Delete failed");
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: ["waba-templates"] });
    },
  });
  const sync = useMutation({
    mutationFn: (workspaceId: string) => syncFn({ data: { workspaceId } }),
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error ?? "Sync failed");
      toast.success(`Synced ${result.count ?? 0} templates`);
      qc.invalidateQueries({ queryKey: ["waba-templates"] });
    },
  });

  if (editing) {
    return (
      <TemplateEditor
        initial={editing === "new" ? null : editing}
        workspaces={workspaces}
        onDone={() => {
          setEditing(null);
          qc.invalidateQueries({ queryKey: ["waba-templates"] });
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">WhatsApp templates</h2>
          <p className="text-sm text-muted-foreground">Create, preview, submit, and monitor official WABA templates.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {workspaces.map((workspace) => (
            <Button key={workspace.id} variant="outline" size="sm" onClick={() => sync.mutate(workspace.id)} disabled={sync.isPending}>
              <RefreshCw className="mr-1.5 h-4 w-4" /> Sync {workspace.name}
            </Button>
          ))}
          <Button size="sm" onClick={() => setEditing("new")} disabled={workspaces.length === 0}>
            <Plus className="mr-1.5 h-4 w-4" /> New template
          </Button>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="border-l-4 border-warning bg-muted/30 p-4 text-sm">Connect and enable an official WhatsApp Cloud inbox before creating templates.</div>
      ) : null}
      {isPending ? <p className="text-sm text-muted-foreground">Loading templates…</p> : null}
      <div className="grid gap-3 xl:grid-cols-2">
        {templates.map((template) => (
          <article key={template.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="truncate font-semibold">{template.name}</h3>
                  <Badge variant={statusVariant(template.status)}>{template.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{template.category} · {template.language}</p>
                {template.rejection_reason ? <p className="mt-2 text-sm text-destructive">{template.rejection_reason}</p> : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="outline" size="sm" onClick={() => setEditing(template)}>Edit</Button>
                {template.status === "DRAFT" || template.status === "REJECTED" ? (
                  <Button size="icon" variant="ghost" title="Submit to Meta" onClick={() => submit.mutate(template.id)}>
                    <CloudUpload className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button size="icon" variant="ghost" title="Delete template" onClick={() => remove.mutate(template.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!isPending && templates.length === 0 ? <p className="text-sm text-muted-foreground">No templates in this repository yet.</p> : null}
    </div>
  );
}

function TemplateEditor({
  initial,
  workspaces,
  onDone,
}: {
  initial: WabaTemplateRow | null;
  workspaces: Workspace[];
  onDone: () => void;
}) {
  const saveFn = useServerFn(saveWabaTemplate);
  const initialParts = useMemo(() => {
    const components = initial?.components ?? [];
    return {
      header: components.find((part) => part.type === "HEADER")?.text ?? "",
      body: components.find((part) => part.type === "BODY")?.text ?? "",
      footer: components.find((part) => part.type === "FOOTER")?.text ?? "",
      buttons: components.find((part) => part.type === "BUTTONS")?.buttons?.map((button) => button.text) ?? [],
    };
  }, [initial]);
  const [workspaceId, setWorkspaceId] = useState(initial?.workspace_id ?? workspaces[0]?.id ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "en_US");
  const [category, setCategory] = useState<WabaTemplateRow["category"]>(initial?.category ?? "UTILITY");
  const [header, setHeader] = useState(initialParts.header);
  const [body, setBody] = useState(initialParts.body);
  const [footer, setFooter] = useState(initialParts.footer);
  const [buttons, setButtons] = useState(initialParts.buttons);
  const save = useMutation({
    mutationFn: () => {
      const components: WabaTemplateComponent[] = [];
      if (header.trim()) components.push({ type: "HEADER", format: "TEXT", text: header.trim() });
      components.push({ type: "BODY", text: body.trim() });
      if (footer.trim()) components.push({ type: "FOOTER", text: footer.trim() });
      if (buttons.length > 0) components.push({ type: "BUTTONS", buttons: buttons.map((text) => ({ type: "QUICK_REPLY", text })) });
      return saveFn({ data: { id: initial?.id, workspaceId, name, language, category, components } });
    },
    onSuccess: (result) => {
      if (!result.ok) return toast.error(result.error ?? "Save failed");
      toast.success("Template saved as draft");
      onDone();
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{initial ? "Edit template" : "New template"}</h2>
          <p className="text-sm text-muted-foreground">Draft changes locally, preview the message, then submit it for Meta review.</p>
        </div>
        <Button variant="outline" onClick={onDone}>Back</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>WABA inbox</Label><Select value={workspaceId} onValueChange={setWorkspaceId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{workspaces.map((workspace) => <SelectItem key={workspace.id} value={workspace.id}>{workspace.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Template name</Label><Input value={name} onChange={(event) => setName(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))} placeholder="appointment_confirmation" /></div>
            <div className="space-y-1.5"><Label>Category</Label><Select value={category} onValueChange={(value) => setCategory(value as WabaTemplateRow["category"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MARKETING">Marketing</SelectItem><SelectItem value="UTILITY">Utility</SelectItem><SelectItem value="AUTHENTICATION">Authentication</SelectItem></SelectContent></Select></div>
            <div className="space-y-1.5"><Label>Language</Label><Input value={language} onChange={(event) => setLanguage(event.target.value)} placeholder="en_US" /></div>
          </div>
          <div className="space-y-1.5"><Label>Header</Label><Input value={header} onChange={(event) => setHeader(event.target.value)} maxLength={60} placeholder="Optional short heading" /></div>
          <div className="space-y-1.5"><Label>Body</Label><Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} placeholder="Hello {{1}}, your appointment is confirmed for {{2}}." /><p className="text-xs text-muted-foreground">Use numbered Meta variables such as {"{{1}}"} and {"{{2}}"}.</p></div>
          <div className="space-y-1.5"><Label>Footer</Label><Input value={footer} onChange={(event) => setFooter(event.target.value)} maxLength={60} placeholder="Optional footer" /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label>Quick replies</Label><Button variant="outline" size="sm" onClick={() => setButtons((current) => [...current, ""].slice(0, 3))} disabled={buttons.length >= 3}><Plus className="mr-1 h-3.5 w-3.5" /> Add</Button></div>
            {buttons.map((button, index) => <div key={index} className="flex gap-2"><Input value={button} maxLength={25} onChange={(event) => setButtons((current) => current.map((value, i) => i === index ? event.target.value : value))} placeholder={`Button ${index + 1}`} /><Button variant="ghost" size="icon" onClick={() => setButtons((current) => current.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}
          </div>
          <Button onClick={() => save.mutate()} disabled={!workspaceId || !name || !body.trim() || save.isPending}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Save draft</Button>
        </div>
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">WhatsApp preview</p>
          <div className="min-h-96 rounded-lg border bg-muted p-4">
            <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-sm bg-card p-3 shadow-sm">
              {header ? <p className="font-semibold">{header}</p> : null}
              <p className="mt-1 whitespace-pre-wrap text-sm">{body || "Your template message will appear here."}</p>
              {footer ? <p className="mt-2 text-xs text-muted-foreground">{footer}</p> : null}
              <p className="mt-1 text-right text-[10px] text-muted-foreground">12:30</p>
              {buttons.filter(Boolean).map((button, index) => <div key={index} className="mt-2 border-t pt-2 text-center text-sm font-medium text-primary"><Send className="mr-1 inline h-3.5 w-3.5" />{button}</div>)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
