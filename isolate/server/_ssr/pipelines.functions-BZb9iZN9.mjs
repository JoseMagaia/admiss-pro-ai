import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType } from "../_libs/zod.mjs";

import "../_libs/h3-v2.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
async function spaceCtx() {
  const {
    resolveSpaceContext
  } = await import("./space-context.server-D2TjyZvs.mjs");
  return resolveSpaceContext();
}
async function scopedDb() {
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  const {
    makeScopedClient,
    NO_SPACE
  } = await import("./space-context.server-D2TjyZvs.mjs");
  const ctx = await spaceCtx();
  const sid = ctx && (ctx.isSuperAdmin || ctx.status === "active") ? ctx.spaceId : NO_SPACE;
  return makeScopedClient(supabaseAdmin, sid);
}
async function guard(allowed) {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  return assertRole(allowed);
}
async function isAuthed() {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  return Boolean(u?.role);
}
const MANAGE_ROLES = ["super_admin", "admin"];
const listPipelines_createServerFn_handler = createServerRpc({
  id: "8574a630e4d0a5569e173e9dec24eb99c87242aab076be216209b8b7aa5ff486",
  name: "listPipelines",
  filename: "src/lib/pipelines.functions.ts"
}, (opts) => listPipelines.__executeServer(opts));
const listPipelines = createServerFn({
  method: "GET"
}).handler(listPipelines_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    pipelines: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data: pipes,
    error: pErr
  } = await db.from("pipelines").select("*").order("position", {
    ascending: true
  });
  if (pErr) return {
    pipelines: [],
    error: pErr.message
  };
  const {
    data: stages,
    error: sErr
  } = await db.from("pipeline_stages").select("*").order("position", {
    ascending: true
  });
  if (sErr) return {
    pipelines: [],
    error: sErr.message
  };
  const stageList = stages ?? [];
  const pipelines = (pipes ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    is_default: p.is_default,
    position: p.position,
    stages: stageList.filter((s) => s.pipeline_id === p.id).map((s) => ({
      id: s.id,
      label: s.label,
      stage_keys: s.stage_keys ?? [],
      position: s.position
    }))
  }));
  return {
    pipelines,
    error: null
  };
});
const listLeadPipelines_createServerFn_handler = createServerRpc({
  id: "d06a676fefaee26f3761fa763e73cb972a70b89f3594e9fa97926e2de260a0ea",
  name: "listLeadPipelines",
  filename: "src/lib/pipelines.functions.ts"
}, (opts) => listLeadPipelines.__executeServer(opts));
const listLeadPipelines = createServerFn({
  method: "GET"
}).handler(listLeadPipelines_createServerFn_handler, async () => {
  if (!await isAuthed()) return {
    map: [],
    error: "Unauthorized"
  };
  const db = await scopedDb();
  const {
    data: opps,
    error
  } = await db.from("lead_opportunities").select("lead_id, offer_id").limit(1e4);
  if (error) return {
    map: [],
    error: error.message
  };
  const offerIds = Array.from(new Set((opps ?? []).map((o) => o.offer_id).filter(Boolean)));
  if (offerIds.length === 0) return {
    map: [],
    error: null
  };
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  const {
    data: offers
  } = await supabaseAdmin.from("offers").select("id, pipeline_id").in("id", offerIds);
  const offerMap = new Map((offers ?? []).map((o) => [o.id, o.pipeline_id ?? null]));
  const map = [];
  for (const o of opps ?? []) {
    if (!o.offer_id) continue;
    const pid = offerMap.get(o.offer_id);
    if (pid) map.push({
      lead_id: o.lead_id,
      pipeline_id: pid
    });
  }
  return {
    map,
    error: null
  };
});
const createPipeline_createServerFn_handler = createServerRpc({
  id: "77b010310fb9c39bf1e6a2819a40567765ca476ed6b673a37c2e632cb9739fe1",
  name: "createPipeline",
  filename: "src/lib/pipelines.functions.ts"
}, (opts) => createPipeline.__executeServer(opts));
const createPipeline = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  name: stringType().min(1).max(120)
}).parse(d)).handler(createPipeline_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: existing
  } = await db.from("pipelines").select("position");
  const nextPos = (existing ?? []).reduce((m, r) => Math.max(m, r.position + 1), 0);
  const {
    data: pipe,
    error
  } = await db.from("pipelines").insert({
    name: data.name,
    is_default: false,
    position: nextPos
  }).select("id").single();
  if (error || !pipe) return {
    ok: false,
    error: error?.message ?? "Could not create pipeline"
  };
  const pid = pipe.id;
  const newKey = () => `stg_${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 10)}`;
  await db.from("pipeline_stages").insert([{
    pipeline_id: pid,
    label: "New",
    stage_keys: [newKey()],
    position: 0
  }, {
    pipeline_id: pid,
    label: "In Progress",
    stage_keys: [newKey()],
    position: 1
  }, {
    pipeline_id: pid,
    label: "Done",
    stage_keys: [newKey()],
    position: 2
  }]);
  return {
    ok: true,
    error: null,
    id: pid
  };
});
const updatePipeline_createServerFn_handler = createServerRpc({
  id: "44bc684f421a0b7e7eff8ecc89ccd247b7c820b943a54213baaa1762ebe04916",
  name: "updatePipeline",
  filename: "src/lib/pipelines.functions.ts"
}, (opts) => updatePipeline.__executeServer(opts));
const updatePipeline = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  name: stringType().min(1).max(120)
}).parse(d)).handler(updatePipeline_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    error
  } = await db.from("pipelines").update({
    name: data.name
  }).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deletePipeline_createServerFn_handler = createServerRpc({
  id: "2420c78ef024ce3c16cabd7eb565757f5e1cc317991ab03e6fe21f9cd17f558f",
  name: "deletePipeline",
  filename: "src/lib/pipelines.functions.ts"
}, (opts) => deletePipeline.__executeServer(opts));
const deletePipeline = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deletePipeline_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: pipe
  } = await db.from("pipelines").select("is_default").eq("id", data.id).maybeSingle();
  if (pipe?.is_default) return {
    ok: false,
    error: "The default pipeline cannot be deleted."
  };
  const {
    error
  } = await db.from("pipelines").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const savePipelineStages_createServerFn_handler = createServerRpc({
  id: "c380426bffdff594fe382d74070ed7b3bc4274bf4b3ac910e5a2b7b7cf1b22df",
  name: "savePipelineStages",
  filename: "src/lib/pipelines.functions.ts"
}, (opts) => savePipelineStages.__executeServer(opts));
const savePipelineStages = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  pipelineId: stringType().uuid(),
  stages: arrayType(objectType({
    id: stringType().uuid().optional(),
    label: stringType().min(1).max(80),
    stage_keys: arrayType(stringType()).optional()
  })).min(1)
}).parse(d)).handler(savePipelineStages_createServerFn_handler, async ({
  data
}) => {
  try {
    await guard(MANAGE_ROLES);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await scopedDb();
  const {
    data: current
  } = await db.from("pipeline_stages").select("id, stage_keys").eq("pipeline_id", data.pipelineId);
  const currentRows = current ?? [];
  const currentById = new Map(currentRows.map((r) => [r.id, r]));
  const keepIds = new Set(data.stages.map((s) => s.id).filter(Boolean));
  const newKey = () => `stg_${(globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, "").slice(0, 10)}`;
  const toDelete = currentRows.filter((r) => !keepIds.has(r.id)).map((r) => r.id);
  if (toDelete.length) {
    await db.from("pipeline_stages").delete().in("id", toDelete);
  }
  let pos = 0;
  for (const s of data.stages) {
    if (s.id && currentById.has(s.id)) {
      const prev = currentById.get(s.id);
      const keys = s.stage_keys && s.stage_keys.length > 0 ? s.stage_keys : prev.stage_keys && prev.stage_keys.length > 0 ? prev.stage_keys : [newKey()];
      await db.from("pipeline_stages").update({
        label: s.label,
        stage_keys: keys,
        position: pos
      }).eq("id", s.id);
    } else {
      const keys = s.stage_keys && s.stage_keys.length > 0 ? s.stage_keys : [newKey()];
      await db.from("pipeline_stages").insert({
        pipeline_id: data.pipelineId,
        label: s.label,
        stage_keys: keys,
        position: pos
      });
    }
    pos += 1;
  }
  return {
    ok: true,
    error: null
  };
});
export {
  createPipeline_createServerFn_handler,
  deletePipeline_createServerFn_handler,
  listLeadPipelines_createServerFn_handler,
  listPipelines_createServerFn_handler,
  savePipelineStages_createServerFn_handler,
  updatePipeline_createServerFn_handler
};
