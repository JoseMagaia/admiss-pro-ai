import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  GripVertical,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Coins,
  Workflow as WorkflowIcon,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listLeads, updateLeadStage } from "@/lib/dashboard.functions";
import { listOffers, listStageSettings, upsertStageSetting } from "@/lib/advanced.functions";
import {
  listPipelines,
  listLeadPipelines,
  createPipeline,
  updatePipeline,
  deletePipeline,
  savePipelineStages,
} from "@/lib/pipelines.functions";
import { stageLabel } from "@/lib/pipeline";
import { useDashboardNav } from "@/lib/dashboard-nav";
import { useAuth } from "@/hooks/useAuth";
import { LeadWorkflowManager } from "./LeadWorkflowManager";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  phone_number: string;
  lead_name: string | null;
  course_interest: string | null;
  country_interest: string | null;
  qualification_status: string;
}

interface Offer {
  id: string;
  name: string;
  default_valuation: number;
  expected_liquidity: number;
  currency: string;
  enabled: boolean;
}

interface StageSetting {
  stage: string;
  offer_id: string | null;
  valuation: number;
  liquidity: number;
}

interface StageDraft {
  offer_id: string | null;
  valuation: number;
  liquidity: number;
}

interface Stage {
  id: string;
  label: string;
  stage_keys: string[];
  position: number;
}

interface Pipeline {
  id: string;
  name: string;
  is_default: boolean;
  position: number;
  stages: Stage[];
}

// Distinct accent per column so the Opportunities view is easy to scan.
const STAGE_ACCENTS = [
  "from-sky-500/15 to-sky-500/5 border-sky-500/40 text-sky-600 dark:text-sky-300",
  "from-violet-500/15 to-violet-500/5 border-violet-500/40 text-violet-600 dark:text-violet-300",
  "from-emerald-500/15 to-emerald-500/5 border-emerald-500/40 text-emerald-600 dark:text-emerald-300",
  "from-amber-500/15 to-amber-500/5 border-amber-500/40 text-amber-600 dark:text-amber-300",
  "from-pink-500/15 to-pink-500/5 border-pink-500/40 text-pink-600 dark:text-pink-300",
  "from-cyan-500/15 to-cyan-500/5 border-cyan-500/40 text-cyan-600 dark:text-cyan-300",
  "from-indigo-500/15 to-indigo-500/5 border-indigo-500/40 text-indigo-600 dark:text-indigo-300",
  "from-rose-500/15 to-rose-500/5 border-rose-500/40 text-rose-600 dark:text-rose-300",
];

interface StageEdit {
  id?: string;
  label: string;
  stage_keys: string[];
}

export function PipelineTab({ canAdvanced = false }: { canAdvanced?: boolean }) {
  const qc = useQueryClient();
  const { profile } = useAuth();
  const canManage = profile.role === "super_admin" || profile.role === "admin";
  const leadsFn = useServerFn(listLeads);
  const stageFn = useServerFn(updateLeadStage);
  const offersFn = useServerFn(listOffers);
  const settingsFn = useServerFn(listStageSettings);
  const saveSettingFn = useServerFn(upsertStageSetting);
  const pipelinesFn = useServerFn(listPipelines);
  const leadPipesFn = useServerFn(listLeadPipelines);
  const createPipeFn = useServerFn(createPipeline);
  const updatePipeFn = useServerFn(updatePipeline);
  const deletePipeFn = useServerFn(deletePipeline);
  const saveStagesFn = useServerFn(savePipelineStages);
  const { openConversation } = useDashboardNav();

  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [showOpps, setShowOpps] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, StageDraft>>({});
  const [selectedPid, setSelectedPid] = useState<string | null>(null);

  // Stage-editing state.
  const [editing, setEditing] = useState(false);
  const [editStages, setEditStages] = useState<StageEdit[]>([]);

  const { data } = useQuery({ queryKey: ["leads"], queryFn: () => leadsFn(), refetchInterval: 5000 });
  const { data: pipelinesData } = useQuery({ queryKey: ["pipelines"], queryFn: () => pipelinesFn() });
  const { data: leadPipesData } = useQuery({
    queryKey: ["lead-pipelines"],
    queryFn: () => leadPipesFn(),
    refetchInterval: 8000,
  });

  const { data: offersData } = useQuery({
    queryKey: ["offers"],
    queryFn: () => offersFn(),
    enabled: canAdvanced && showOpps,
  });
  const { data: settingsData } = useQuery({
    queryKey: ["stage-settings"],
    queryFn: () => settingsFn(),
    enabled: canAdvanced && showOpps,
  });

  const pipelines = (pipelinesData?.pipelines ?? []) as Pipeline[];
  const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0] ?? null;

  // Keep a valid selected pipeline as data loads/changes.
  useEffect(() => {
    if (pipelines.length === 0) return;
    if (!selectedPid || !pipelines.some((p) => p.id === selectedPid)) {
      setSelectedPid(defaultPipeline?.id ?? pipelines[0].id);
    }
  }, [pipelines, selectedPid, defaultPipeline]);

  const selectedPipeline = pipelines.find((p) => p.id === selectedPid) ?? defaultPipeline;
  const columns = useMemo(
    () => [...(selectedPipeline?.stages ?? [])].sort((a, b) => a.position - b.position),
    [selectedPipeline],
  );

  const leadPipeMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of (leadPipesData?.map ?? []) as Array<{ lead_id: string; pipeline_id: string }>) {
      m.set(r.lead_id, r.pipeline_id);
    }
    return m;
  }, [leadPipesData]);

  const offers = ((offersData?.offers ?? []) as unknown as Offer[]).filter((o) => o.enabled);

  const serverSettings = useMemo(() => {
    const m = new Map<string, StageSetting>();
    for (const s of (settingsData?.settings ?? []) as unknown as StageSetting[]) m.set(s.stage, s);
    return m;
  }, [settingsData]);

  useEffect(() => {
    if (!settingsData) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of (settingsData.settings ?? []) as unknown as StageSetting[]) {
        if (!next[s.stage]) {
          next[s.stage] = {
            offer_id: s.offer_id ?? null,
            valuation: Number(s.valuation ?? 0),
            liquidity: Number(s.liquidity ?? 0),
          };
        }
      }
      return next;
    });
  }, [settingsData]);

  const allLeads = (data?.leads ?? []) as Lead[];

  // Resolve which pipeline a lead belongs to (by assigned offer, else default).
  const resolvedPid = (leadId: string) => leadPipeMap.get(leadId) ?? defaultPipeline?.id ?? "";

  const leads = useMemo(
    () => allLeads.filter((l) => resolvedPid(l.id) === selectedPipeline?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLeads, leadPipeMap, selectedPipeline, defaultPipeline],
  );

  // Find the column (stage) a lead belongs to within the selected pipeline.
  const columnForLead = (status: string): Stage | null => {
    return columns.find((c) => c.stage_keys.includes(status)) ?? columns[0] ?? null;
  };

  const move = useMutation({
    mutationFn: (vars: { id: string; stage: string }) => stageFn({ data: vars }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData(["leads"]);
      qc.setQueryData(["leads"], (old: unknown) => {
        const o = old as { leads: Lead[] } | undefined;
        if (!o) return old;
        return { ...o, leads: o.leads.map((l) => (l.id === vars.id ? { ...l, qualification_status: vars.stage } : l)) };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["leads"], ctx.prev);
      toast.error("Could not move lead");
    },
    onSuccess: () => toast.success("Lead moved"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const saveSetting = useMutation({
    mutationFn: (vars: { stage: string } & StageDraft) => saveSettingFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Could not save stage settings");
      qc.invalidateQueries({ queryKey: ["stage-settings"] });
    },
    onError: () => toast.error("Could not save stage settings"),
  });

  function settingFor(stageId: string): StageDraft {
    const d = drafts[stageId];
    if (d) return d;
    const s = serverSettings.get(stageId);
    return { offer_id: s?.offer_id ?? null, valuation: Number(s?.valuation ?? 0), liquidity: Number(s?.liquidity ?? 0) };
  }

  function setDraft(stageId: string, patch: Partial<StageDraft>) {
    setDrafts((prev) => ({ ...prev, [stageId]: { ...settingFor(stageId), ...patch } }));
  }

  function commit(stageId: string) {
    saveSetting.mutate({ stage: stageId, ...settingFor(stageId) });
  }

  function onOfferChange(stageId: string, offerId: string) {
    const offer = offers.find((o) => o.id === offerId);
    const current = settingFor(stageId);
    const next: StageDraft = {
      offer_id: offerId || null,
      valuation: offer ? Number(offer.default_valuation ?? 0) : current.valuation,
      liquidity: offer ? Number(offer.expected_liquidity ?? 0) : current.liquidity,
    };
    setDrafts((prev) => ({ ...prev, [stageId]: next }));
    saveSetting.mutate({ stage: stageId, ...next });
  }

  function onDrop(stage: Stage) {
    setOverCol(null);
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    if (lead && columnForLead(lead.qualification_status)?.id !== stage.id) {
      const key = stage.stage_keys[0];
      if (key) move.mutate({ id: dragId, stage: key });
    }
    setDragId(null);
  }

  const opps = canAdvanced && showOpps && !editing;

  const grandTotal = useMemo(() => {
    if (!opps) return { valuation: 0, liquidity: 0 };
    return columns.reduce(
      (acc, col) => {
        const count = leads.filter((l) => columnForLead(l.qualification_status)?.id === col.id).length;
        const s = settingFor(col.id);
        acc.valuation += count * s.valuation;
        acc.liquidity += count * s.liquidity;
        return acc;
      },
      { valuation: 0, liquidity: 0 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opps, leads, drafts, serverSettings, columns]);

  /* ----------------------------- Pipeline management ----------------------------- */

  const refreshPipelines = () => {
    qc.invalidateQueries({ queryKey: ["pipelines"] });
    qc.invalidateQueries({ queryKey: ["lead-pipelines"] });
  };

  const createPipe = useMutation({
    mutationFn: (name: string) => createPipeFn({ data: { name } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null; id?: string };
      if (!res.ok) return toast.error(res.error ?? "Could not create pipeline");
      toast.success("Pipeline created");
      if (res.id) setSelectedPid(res.id);
      refreshPipelines();
    },
    onError: () => toast.error("Could not create pipeline"),
  });

  const renamePipe = useMutation({
    mutationFn: (vars: { id: string; name: string }) => updatePipeFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Could not rename pipeline");
      toast.success("Pipeline renamed");
      refreshPipelines();
    },
    onError: () => toast.error("Could not rename pipeline"),
  });

  const removePipe = useMutation({
    mutationFn: (id: string) => deletePipeFn({ data: { id } }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Could not delete pipeline");
      toast.success("Pipeline deleted");
      setSelectedPid(defaultPipeline?.id ?? null);
      refreshPipelines();
    },
    onError: () => toast.error("Could not delete pipeline"),
  });

  const saveStages = useMutation({
    mutationFn: (vars: { pipelineId: string; stages: StageEdit[] }) => saveStagesFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Could not save stages");
      toast.success("Stages saved");
      setEditing(false);
      refreshPipelines();
    },
    onError: () => toast.error("Could not save stages"),
  });

  function startEditing() {
    if (!selectedPipeline) return;
    setEditStages(columns.map((c) => ({ id: c.id, label: c.label, stage_keys: c.stage_keys })));
    setShowOpps(false);
    setEditing(true);
  }

  function moveStage(idx: number, dir: -1 | 1) {
    setEditStages((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function handleNewPipeline() {
    const name = window.prompt("Name your new pipeline");
    if (name && name.trim()) createPipe.mutate(name.trim());
  }

  function handleRename() {
    if (!selectedPipeline) return;
    const name = window.prompt("Rename pipeline", selectedPipeline.name);
    if (name && name.trim()) renamePipe.mutate({ id: selectedPipeline.id, name: name.trim() });
  }

  function handleDeletePipeline() {
    if (!selectedPipeline || selectedPipeline.is_default) return;
    if (window.confirm(`Delete pipeline "${selectedPipeline.name}"? Leads stay on their offer/default pipeline.`)) {
      removePipe.mutate(selectedPipeline.id);
    }
  }

  return (
    <div className="space-y-3">
      {/* Pipeline selector + management */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {pipelines.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPid(p.id);
                setEditing(false);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                selectedPipeline?.id === p.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>

        {canManage && (
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-8 gap-1 px-2 text-xs" onClick={handleNewPipeline}>
              <Plus className="h-3.5 w-3.5" /> Pipeline
            </Button>
            {selectedPipeline && (
              <>
                <Button
                  size="sm"
                  variant={editing ? "default" : "outline"}
                  className="h-8 gap-1 px-2 text-xs"
                  onClick={() => (editing ? setEditing(false) : startEditing())}
                >
                  <Pencil className="h-3.5 w-3.5" /> {editing ? "Close editor" : "Edit stages"}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 gap-1 px-2 text-xs" onClick={handleRename}>
                  Rename
                </Button>
                {!selectedPipeline.is_default && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 px-2 text-xs text-destructive"
                    onClick={handleDeletePipeline}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Stage editor */}
      {editing && selectedPipeline && (
        <div className="rounded-2xl border bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">Edit stages — {selectedPipeline.name}</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 px-2 text-xs"
                onClick={() => setEditStages((p) => [...p, { label: "New stage", stage_keys: [] }])}
              >
                <Plus className="h-3.5 w-3.5" /> Add stage
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1 px-2 text-xs"
                disabled={saveStages.isPending || editStages.length === 0}
                onClick={() =>
                  saveStages.mutate({
                    pipelineId: selectedPipeline.id,
                    stages: editStages
                      .map((s) => ({ ...s, label: s.label.trim() }))
                      .filter((s) => s.label.length > 0),
                  })
                }
              >
                <Check className="h-3.5 w-3.5" /> Save
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {editStages.map((s, idx) => (
              <div key={s.id ?? `new-${idx}`} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs text-muted-foreground">{idx + 1}</span>
                <Input
                  value={s.label}
                  onChange={(e) =>
                    setEditStages((prev) => prev.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                  }
                  className="h-9 flex-1"
                  placeholder="Stage name"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={idx === 0}
                  onClick={() => moveStage(idx, -1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={idx === editStages.length - 1}
                  onClick={() => moveStage(idx, 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setEditStages((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Remove stage"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Renaming or reordering is safe — the AI keeps using the built-in admissions stages. New columns are managed
            manually by agents.
          </p>
        </div>
      )}

      {/* Opportunities toggle */}
      {canAdvanced && !editing && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {opps ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 px-3 py-1.5 font-semibold text-emerald-600 dark:text-emerald-300">
                <TrendingUp className="h-4 w-4" /> Total valuation: {grandTotal.valuation.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-amber-500/5 px-3 py-1.5 font-semibold text-amber-600 dark:text-amber-300">
                <Coins className="h-4 w-4" /> Total liquidity: {grandTotal.liquidity.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Turn on Opportunities to value each pipeline stage.</span>
          )}
          <button
            type="button"
            onClick={() => setShowOpps((s) => !s)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
              opps
                ? "border-emerald-500/50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <DollarSign className="h-4 w-4" />
            Opportunities {opps ? "on" : "off"}
          </button>
        </div>
      )}

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col, idx) => {
          const colLeads = leads.filter((l) => columnForLead(l.qualification_status)?.id === col.id);
          const s = settingFor(col.id);
          const colValuation = opps ? colLeads.length * s.valuation : 0;
          const colLiquidity = opps ? colLeads.length * s.liquidity : 0;
          const accent = STAGE_ACCENTS[idx % STAGE_ACCENTS.length];
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={() => onDrop(col)}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-2xl border bg-muted/30 transition-colors",
                opps && cn("bg-gradient-to-b", accent),
                overCol === col.id && "border-primary bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <span className="font-display text-sm font-semibold">{col.label}</span>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {colLeads.length}
                </span>
              </div>

              {opps && (
                <div className="space-y-2 border-b bg-card/60 px-4 py-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Offer
                    </label>
                    <select
                      value={s.offer_id ?? ""}
                      onChange={(e) => onOfferChange(col.id, e.target.value)}
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="">No offer</option>
                      {offers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                      {s.offer_id && !offers.some((o) => o.id === s.offer_id) && (
                        <option value={s.offer_id}>(assigned offer)</option>
                      )}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Valuation / lead
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={s.valuation || ""}
                        onChange={(e) => setDraft(col.id, { valuation: Number(e.target.value) })}
                        onBlur={() => commit(col.id)}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Liquidity / lead
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={s.liquidity || ""}
                        onChange={(e) => setDraft(col.id, { liquidity: Number(e.target.value) })}
                        onBlur={() => commit(col.id)}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-background/70 px-2.5 py-1.5 font-semibold">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {colLeads.length} × {s.valuation.toLocaleString()}
                    </span>
                    <span>{colValuation.toLocaleString()}</span>
                  </div>
                  {s.liquidity > 0 && (
                    <div className="flex items-center justify-between px-2.5 text-[11px] text-muted-foreground">
                      <span>Liquidity total</span>
                      <span>{colLiquidity.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-1 flex-col gap-2 p-3">
                {colLeads.map((l) => (
                  <div
                    key={l.id}
                    draggable
                    onDragStart={() => setDragId(l.id)}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      "group cursor-grab rounded-xl border bg-card p-3 shadow-card active:cursor-grabbing",
                      dragId === l.id && "opacity-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold">{l.lead_name ?? l.phone_number}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        {canManage && (
                          <span
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            draggable={false}
                          >
                            <LeadWorkflowManager
                              phone={l.phone_number}
                              trigger={
                                <button
                                  type="button"
                                  title="Manage workflows"
                                  className="text-muted-foreground opacity-0 transition-colors hover:text-primary group-hover:opacity-100"
                                >
                                  <WorkflowIcon className="h-4 w-4" />
                                </button>
                              }
                            />
                          </span>
                        )}
                        <button
                          type="button"
                          title="Open conversation"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConversation(l.phone_number);
                          }}
                          className="text-muted-foreground opacity-0 transition-colors hover:text-primary group-hover:opacity-100"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{l.phone_number}</p>
                    {(l.course_interest || l.country_interest) && (
                      <p className="mt-2 text-xs text-foreground">
                        {[l.course_interest, l.country_interest].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {stageLabel(l.qualification_status)}
                    </p>
                  </div>
                ))}
                {colLeads.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">Drop leads here</p>
                )}
              </div>
            </div>
          );
        })}
        {columns.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            This pipeline has no stages yet.
          </p>
        )}
      </div>
    </div>
  );
}
