import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GripVertical, MessageSquare, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { listLeads, updateLeadStage } from "@/lib/dashboard.functions";
import { listOffers, listLeadOpportunities, upsertLeadOpportunity } from "@/lib/advanced.functions";
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

interface Opportunity {
  lead_id: string;
  offer_id: string | null;
  valuation: number;
  liquidity: number;
}

interface Draft {
  offer_id: string | null;
  valuation: number;
  liquidity: number;
}

export function PipelineTab({ canAdvanced = false }: { canAdvanced?: boolean }) {
  const qc = useQueryClient();
  const leadsFn = useServerFn(listLeads);
  const stageFn = useServerFn(updateLeadStage);
  const offersFn = useServerFn(listOffers);
  const oppsFn = useServerFn(listLeadOpportunities);
  const saveOppFn = useServerFn(upsertLeadOpportunity);
  const { openConversation } = useDashboardNav();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<string | null>(null);
  const [showOpps, setShowOpps] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

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
  const { data: oppsData } = useQuery({
    queryKey: ["lead-opportunities"],
    queryFn: () => oppsFn(),
    enabled: canAdvanced && showOpps,
  });

  const offers = ((offersData?.offers ?? []) as unknown as Offer[]).filter((o) => o.enabled);
  const serverOpps = useMemo(() => {
    const m = new Map<string, Opportunity>();
    for (const o of (oppsData?.opportunities ?? []) as unknown as Opportunity[]) m.set(o.lead_id, o);
    return m;
  }, [oppsData]);

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

  const saveOpp = useMutation({
    mutationFn: (vars: { lead_id: string } & Draft) => saveOppFn({ data: vars }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Could not save opportunity");
      qc.invalidateQueries({ queryKey: ["lead-opportunities"] });
    },
    onError: () => toast.error("Could not save opportunity"),
  });

  const leads = (data?.leads ?? []) as Lead[];

  function valueFor(leadId: string): Draft {
    const d = drafts[leadId];
    if (d) return d;
    const s = serverOpps.get(leadId);
    return { offer_id: s?.offer_id ?? null, valuation: Number(s?.valuation ?? 0), liquidity: Number(s?.liquidity ?? 0) };
  }

  function setDraft(leadId: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [leadId]: { ...valueFor(leadId), ...patch } }));
  }

  function commit(leadId: string) {
    const v = valueFor(leadId);
    saveOpp.mutate({ lead_id: leadId, ...v });
  }

  function onOfferChange(leadId: string, offerId: string) {
    const offer = offers.find((o) => o.id === offerId);
    const current = valueFor(leadId);
    const next: Draft = {
      offer_id: offerId || null,
      // Prefill defaults from the offer when the user hasn't entered values yet.
      valuation: current.valuation || Number(offer?.default_valuation ?? 0),
      liquidity: current.liquidity || Number(offer?.expected_liquidity ?? 0),
    };
    setDrafts((prev) => ({ ...prev, [leadId]: next }));
    saveOpp.mutate({ lead_id: leadId, ...next });
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

  return (
    <div className="space-y-3">
      {canAdvanced && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setShowOpps((s) => !s)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              opps ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <DollarSign className="h-4 w-4" />
            Opportunities {opps ? "on" : "off"}
          </button>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => columnForStage(l.qualification_status).id === col.id);
          const colTotal = opps ? colLeads.reduce((s, l) => s + valueFor(l.id).valuation, 0) : 0;
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
                <div className="flex items-center justify-between border-b bg-card/50 px-4 py-2 text-xs">
                  <span className="text-muted-foreground">Total valuation</span>
                  <span className="font-semibold text-primary">{colTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-3">
                {colLeads.map((l) => {
                  const v = valueFor(l.id);
                  return (
                    <div
                      key={l.id}
                      draggable={!opps}
                      onDragStart={() => setDragId(l.id)}
                      onDragEnd={() => setDragId(null)}
                      className={cn(
                        "group rounded-xl border bg-card p-3 shadow-card",
                        !opps && "cursor-grab active:cursor-grabbing",
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
                          {!opps && (
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          )}
                        </div>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{l.phone_number}</p>
                      {(l.course_interest || l.country_interest) && (
                        <p className="mt-2 text-xs text-foreground">
                          {[l.course_interest, l.country_interest].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      {opps ? (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Offer
                            </label>
                            <select
                              value={v.offer_id ?? ""}
                              onChange={(e) => onOfferChange(l.id, e.target.value)}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                            >
                              <option value="">No offer</option>
                              {colOffers.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.name}
                                </option>
                              ))}
                              {/* keep a selected offer visible even if it belongs to another stage */}
                              {v.offer_id && !colOffers.some((o) => o.id === v.offer_id) &&
                                offers
                                  .filter((o) => o.id === v.offer_id)
                                  .map((o) => (
                                    <option key={o.id} value={o.id}>
                                      {o.name}
                                    </option>
                                  ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Valuation
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={v.valuation || ""}
                                onChange={(e) => setDraft(l.id, { valuation: Number(e.target.value) })}
                                onBlur={() => commit(l.id)}
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Liquidity
                              </label>
                              <input
                                type="number"
                                min={0}
                                value={v.liquidity || ""}
                                onChange={(e) => setDraft(l.id, { liquidity: Number(e.target.value) })}
                                onBlur={() => commit(l.id)}
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {stageLabel(l.qualification_status)}
                        </p>
                      )}
                    </div>
                  );
                })}
                {colLeads.length === 0 && (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    {opps ? "No leads" : "Drop leads here"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
