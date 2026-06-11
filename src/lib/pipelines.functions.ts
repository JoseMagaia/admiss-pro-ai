import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AppRole } from "@/lib/roles";

// Resolve the caller's active Space (honors x-space-id, validates membership).
async function spaceCtx() {
  const { resolveSpaceContext } = await import("./space-context.server");
  return resolveSpaceContext();
}

// Service-role client scoped to the caller's active Space.
async function scopedDb() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { makeScopedClient, NO_SPACE } = await import("./space-context.server");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}

async function guard(allowed: AppRole[]) {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  return assertRole(allowed);
}

async function isAuthed(): Promise<boolean> {
  const { getRequestUser } = await import("@/integrations/supabase/role-guard.server");
  const u = await getRequestUser();
  return Boolean(u?.role);
}

const MANAGE_ROLES: AppRole[] = ["super_admin", "admin"];

interface StageRow {
  id: string;
  label: string;
  stage_keys: string[];
  position: number;
}

interface PipelineRow {
  id: string;
  name: string;
  is_default: boolean;
  position: number;
  stages: StageRow[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */

// List all pipelines for the active space, each with its ordered stages.
export const listPipelines = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { pipelines: [] as PipelineRow[], error: "Unauthorized" };
  const db = await scopedDb();

  const { data: pipes, error: pErr } = await db
    .from("pipelines")
    .select("*")
    .order("position", { ascending: true });
  if (pErr) return { pipelines: [] as PipelineRow[], error: pErr.message };

  const { data: stages, error: sErr } = await db
    .from("pipeline_stages")
    .select("*")
    .order("position", { ascending: true });
  if (sErr) return { pipelines: [] as PipelineRow[], error: sErr.message };

  const stageList = (stages as any[]) ?? [];
  const pipelines: PipelineRow[] = ((pipes as any[]) ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    is_default: p.is_default,
    position: p.position,
    stages: stageList
      .filter((s) => s.pipeline_id === p.id)
      .map((s) => ({ id: s.id, label: s.label, stage_keys: s.stage_keys ?? [], position: s.position })),
  }));

  return { pipelines, error: null };
});

// Map of lead_id -> pipeline_id, resolved through the lead's assigned offer.
// Leads without an offer (or whose offer has no pipeline) are omitted and the
// client falls back to the default pipeline.
export const listLeadPipelines = createServerFn({ method: "GET" }).handler(async () => {
  if (!(await isAuthed())) return { map: [] as Array<{ lead_id: string; pipeline_id: string }>, error: "Unauthorized" };
  const db = await scopedDb();

  const { data: opps, error } = await db
    .from("lead_opportunities")
    .select("lead_id, offer_id")
    .limit(10000);
  if (error) return { map: [], error: error.message };

  const offerIds = Array.from(
    new Set(((opps as any[]) ?? []).map((o) => o.offer_id).filter(Boolean) as string[]),
  );
  if (offerIds.length === 0) return { map: [], error: null };

  // Offers may have been created without a space tag, so look them up by id
  // with the raw client and map each to its assigned pipeline.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: offers } = await supabaseAdmin.from("offers").select("id, pipeline_id").in("id", offerIds);
  const offerMap = new Map<string, string | null>(
    ((offers as any[]) ?? []).map((o) => [o.id, o.pipeline_id ?? null]),
  );

  const map: Array<{ lead_id: string; pipeline_id: string }> = [];
  for (const o of (opps as any[]) ?? []) {
    if (!o.offer_id) continue;
    const pid = offerMap.get(o.offer_id);
    if (pid) map.push({ lead_id: o.lead_id, pipeline_id: pid });
  }
  return { map, error: null };
});

// Create a new (non-default) pipeline with a couple of starter stages.
export const createPipeline = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ name: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();

    const { data: existing } = await db.from("pipelines").select("position");
    const nextPos = ((existing as any[]) ?? []).reduce((m, r) => Math.max(m, r.position + 1), 0);

    const { data: pipe, error } = await db
      .from("pipelines")
      .insert({ name: data.name, is_default: false, position: nextPos } as any)
      .select("id")
      .single();
    if (error || !pipe) return { ok: false, error: error?.message ?? "Could not create pipeline" };

    const pid = (pipe as any).id as string;
    const newKey = () => `stg_${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 10)}`;
    await db.from("pipeline_stages").insert([
      { pipeline_id: pid, label: "New", stage_keys: [newKey()], position: 0 },
      { pipeline_id: pid, label: "In Progress", stage_keys: [newKey()], position: 1 },
      { pipeline_id: pid, label: "Done", stage_keys: [newKey()], position: 2 },
    ] as any);

    return { ok: true, error: null, id: pid };
  });

export const updatePipeline = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), name: z.string().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { error } = await db.from("pipelines").update({ name: data.name } as any).eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

export const deletePipeline = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();
    const { data: pipe } = await db.from("pipelines").select("is_default").eq("id", data.id).maybeSingle();
    if ((pipe as any)?.is_default) return { ok: false, error: "The default pipeline cannot be deleted." };
    const { error } = await db.from("pipelines").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });

// Replace the stages of a pipeline. Existing stages keep their id (and thus
// their saved opportunity valuations); new ones get a generated stage key.
export const savePipelineStages = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        pipelineId: z.string().uuid(),
        stages: z
          .array(
            z.object({
              id: z.string().uuid().optional(),
              label: z.string().min(1).max(80),
              stage_keys: z.array(z.string()).optional(),
            }),
          )
          .min(1),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      await guard(MANAGE_ROLES);
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
    const db = await scopedDb();

    const { data: current } = await db
      .from("pipeline_stages")
      .select("id, stage_keys")
      .eq("pipeline_id", data.pipelineId);
    const currentRows = (current as any[]) ?? [];
    const currentById = new Map(currentRows.map((r) => [r.id, r]));
    const keepIds = new Set(data.stages.map((s) => s.id).filter(Boolean) as string[]);

    const newKey = () => `stg_${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 10)}`;

    // Delete removed stages.
    const toDelete = currentRows.filter((r) => !keepIds.has(r.id)).map((r) => r.id);
    if (toDelete.length) {
      await db.from("pipeline_stages").delete().in("id", toDelete);
    }

    // Upsert kept + new stages with their new ordering.
    let pos = 0;
    for (const s of data.stages) {
      if (s.id && currentById.has(s.id)) {
        const prev = currentById.get(s.id);
        const keys =
          s.stage_keys && s.stage_keys.length > 0
            ? s.stage_keys
            : prev.stage_keys && prev.stage_keys.length > 0
              ? prev.stage_keys
              : [newKey()];
        await db
          .from("pipeline_stages")
          .update({ label: s.label, stage_keys: keys, position: pos } as any)
          .eq("id", s.id);
      } else {
        const keys = s.stage_keys && s.stage_keys.length > 0 ? s.stage_keys : [newKey()];
        await db
          .from("pipeline_stages")
          .insert({ pipeline_id: data.pipelineId, label: s.label, stage_keys: keys, position: pos } as any);
      }
      pos += 1;
    }

    return { ok: true, error: null };
  });
/* eslint-enable @typescript-eslint/no-explicit-any */
