import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Pencil, Package, Power, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listOffers, upsertOffer, deleteOffer } from "@/lib/advanced.functions";
import { PIPELINE_COLUMNS } from "@/lib/pipeline";

interface OfferRow {
  id?: string;
  name: string;
  description: string | null;
  products: string | null;
  stage: string;
  default_valuation: number;
  expected_liquidity: number;
  currency: string;
  enabled: boolean;
}

const EMPTY: OfferRow = {
  name: "",
  description: "",
  products: "",
  stage: PIPELINE_COLUMNS[0].id,
  default_valuation: 0,
  expected_liquidity: 0,
  currency: "USD",
  enabled: true,
};

function stageLabel(id: string) {
  return PIPELINE_COLUMNS.find((c) => c.id === id)?.label ?? id;
}

export function OffersManager() {
  const qc = useQueryClient();
  const listFn = useServerFn(listOffers);
  const saveFn = useServerFn(upsertOffer);
  const delFn = useServerFn(deleteOffer);

  const { data } = useQuery({ queryKey: ["offers"], queryFn: () => listFn() });
  const offers = (data?.offers ?? []) as unknown as OfferRow[];

  const [editing, setEditing] = useState<OfferRow | null>(null);

  const save = useMutation({
    mutationFn: (o: OfferRow) =>
      saveFn({
        data: {
          ...o,
          default_valuation: Number(o.default_valuation) || 0,
          expected_liquidity: Number(o.expected_liquidity) || 0,
        },
      }),
    onSuccess: (r) => {
      const res = r as { ok: boolean; error: string | null };
      if (!res.ok) return toast.error(res.error ?? "Failed to save offer");
      toast.success("Offer saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: () => toast.error("Failed to save offer"),
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Offer deleted");
      qc.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: () => toast.error("Failed to delete"),
  });

  if (editing) {
    const o = editing;
    const set = (patch: Partial<OfferRow>) => setEditing({ ...o, ...patch });
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">{o.id ? "Edit Offer" : "New Offer"}</h2>
          <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Offer name</Label>
            <Input value={o.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Premium Admissions Package" />
          </div>
          <div className="space-y-1.5">
            <Label>Applies to pipeline stage</Label>
            <select
              value={o.stage}
              onChange={(e) => set({ stage: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {PIPELINE_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input value={o.currency} onChange={(e) => set({ currency: e.target.value.toUpperCase().slice(0, 8) })} placeholder="USD" />
          </div>
          <div className="space-y-1.5">
            <Label>Default valuation</Label>
            <Input
              type="number"
              min={0}
              value={o.default_valuation}
              onChange={(e) => set({ default_valuation: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Expected liquidity</Label>
            <Input
              type="number"
              min={0}
              value={o.expected_liquidity}
              onChange={(e) => set({ expected_liquidity: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Products applicable</Label>
            <Textarea
              value={o.products ?? ""}
              onChange={(e) => set({ products: e.target.value })}
              placeholder="List the products/services included in this offer"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={o.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Internal notes about this offer"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={o.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
            Enabled
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => save.mutate(o)} disabled={save.isPending || !o.name.trim()}>
            Save Offer
          </Button>
          <Button variant="outline" onClick={() => setEditing(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Create the offers shown in the Pipeline's Opportunities view. Each offer carries a default valuation and expected
          liquidity for the stage it applies to, and can be linked to a lead to calculate opportunity value.
        </p>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="mr-1 h-4 w-4" /> New Offer
        </Button>
      </div>

      {offers.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <span className="font-semibold">{o.name}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {stageLabel(o.stage)}
              </span>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  o.enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                <Power className="h-3 w-3" /> {o.enabled ? "Active" : "Off"}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Valuation {o.currency} {Number(o.default_valuation).toLocaleString()} · Liquidity {o.currency}{" "}
              {Number(o.expected_liquidity).toLocaleString()}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="outline" size="sm" onClick={() => setEditing(o)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (confirm(`Delete offer "${o.name}"?`)) del.mutate(o.id!);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
      {offers.length === 0 && <p className="text-sm text-muted-foreground">No offers yet.</p>}
    </div>
  );
}
