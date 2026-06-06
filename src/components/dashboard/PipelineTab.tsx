import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical, MessageSquare, DollarSign, TrendingUp, Coins } from "lucide-react";
import { toast } from "sonner";
import { listLeads, updateLeadStage } from "@/lib/dashboard.functions";
import { listOffers, listStageSettings, upsertStageSetting } from "@/lib/advanced.functions";
import { PIPELINE_COLUMNS, columnForStage, stageLabel } from "@/lib/pipeline";
import { useDashboardNav } from "@/lib/dashboard-nav";
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
  stage: string;
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

export function PipelineTab({ canAdvanced = false }: { canAdvanced?: boolean }) {
  const qc = useQueryClient();
  const leadsFn = useServerFn(listLeads);
  const stageFn = useServerFn(updateLeadStage);
  const offersFn = useServerFn(listOffers);
  const settingsFn = useServerFn(listStageSettings);
  const saveSettingFn = useServerFn(upsertStageSetting);
  const { openConversation } = useDashboardNav();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [showOpps, setShowOpps] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, StageDraft>>({});

  const { data } = useQuery({
    queryKey: ["leads"],
    queryFn: () => leadsFn(),
    refetchInterval: 5000,
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

  const offers = ((offersData?.offers ?? []) as unknown as Offer[]).filter((o) => o.enabled);

  const serverSettings = useMemo(() => {
    const m = new Map<string, StageSetting>();
    for (const s of (settingsData?.settings ?? []) as unknown as StageSetting[]) m.set(s.stage, s);
    return m;
  }, [settingsData]);

  // Hydrate local drafts from server settings whenever they load.
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

  const leads = (data?.leads ?? []) as Lead[];

  function settingFor(colId: string): StageDraft {
    const d = drafts[colId];
    if (d) return d;
    const s = serverSettings.get(colId);
    return { offer_id: s?.offer_id ?? null, valuation: Number(s?.valuation ?? 0), liquidity: Number(s?.liquidity ?? 0) };
  }

  function setDraft(colId: string, patch: Partial<StageDraft>) {
    setDrafts((prev) => ({ ...prev, [colId]: { ...settingFor(colId), ...patch } }));
  }

  function commit(colId: string) {
    saveSetting.mutate({ stage: colId, ...settingFor(colId) });
  }

  function onOfferChange(colId: string, offerId: string) {
    const offer = offers.find((o) => o.id === offerId);
    const current = settingFor(colId);
    const next: StageDraft = {
      offer_id: offerId || null,
      // Prefill the per-lead values from the offer's defaults when picked.
      valuation: offer ? Number(offer.default_valuation ?? 0) : current.valuation,
      liquidity: offer ? Number(offer.expected_liquidity ?? 0) : current.liquidity,
    };
    setDrafts((prev) => ({ ...prev, [colId]: next }));
    saveSetting.mutate({ stage: colId, ...next });
  }

  function onDrop(colId: string) {
    setOverCol(null);
    if (!dragId) return;
    const col = PIPELINE_COLUMNS.find((c) => c.id === colId);
    if (!col) return;
    const lead = leads.find((l) => l.id === dragId);
    if (lead && columnForStage(lead.qualification_status).id !== colId) {
      move.mutate({ id: dragId, stage: col.stages[0] });
    }
    setDragId(null);
  }

  const opps = canAdvanced && showOpps;

  const grandTotal = useMemo(() => {
    if (!opps) return { valuation: 0, liquidity: 0 };
    return PIPELINE_COLUMNS.reduce(
      (acc, col) => {
        const count = leads.filter((l) => columnForStage(l.qualification_status).id === col.id).length;
        const s = settingFor(col.id);
        acc.valuation += count * s.valuation;
        acc.liquidity += count * s.liquidity;
        return acc;
      },
      { valuation: 0, liquidity: 0 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opps, leads, drafts, serverSettings]);

  return (
    <div className="space-y-3">
      {canAdvanced && (
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
            <span className="text-sm text-muted-foreground">
              Turn on Opportunities to value each pipeline stage.
            </span>
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

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col, idx) => {
          const colLeads = leads.filter((l) => columnForStage(l.qualification_status).id === col.id);
          const s = settingFor(col.id);
          const colValuation = opps ? colLeads.length * s.valuation : 0;
          const colLiquidity = opps ? colLeads.length * s.liquidity : 0;
          const accent = STAGE_ACCENTS[idx % STAGE_ACCENTS.length];
          const colOffers = offers.filter((o) => o.stage === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={() => onDrop(col.id)}
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
                <div className={cn("space-y-2 border-b bg-card/60 px-4 py-3 text-xs")}>
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
                      {colOffers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                      {s.offer_id && !colOffers.some((o) => o.id === s.offer_id) &&
                        offers
                          .filter((o) => o.id === s.offer_id)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
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
      </div>
    </div>
  );
}
