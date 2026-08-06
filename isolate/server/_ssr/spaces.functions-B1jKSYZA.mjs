import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { c as createServerFn } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { r as recordType, s as stringType, b as booleanType, n as numberType, o as objectType, e as enumType } from "../_libs/zod.mjs";

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
async function admin() {
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  return supabaseAdmin;
}
async function guardSuper() {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  return assertRole(["super_admin"]);
}
const DEFAULT_FLAGS = {
  orchestration: true,
  workflows: true,
  advanced: true,
  agentic: true,
  http_actions: true,
  evolution: true
};
const DEFAULT_LIMITS = {
  max_users: 25,
  max_leads: 1e4,
  max_workflows: 50,
  max_inboxes: 10
};
const flagsSchema = recordType(stringType(), booleanType());
const limitsSchema = recordType(stringType(), numberType().int().min(0).max(1e8));
function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "space";
}
const getActiveSpaceContext_createServerFn_handler = createServerRpc({
  id: "2379bcb864ac545f5543202ff7dd41c4ffbfef287df3e13470a3dff21d30d38a",
  name: "getActiveSpaceContext",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => getActiveSpaceContext.__executeServer(opts));
const getActiveSpaceContext = createServerFn({
  method: "GET"
}).handler(getActiveSpaceContext_createServerFn_handler, async () => {
  const {
    resolveSpaceContext
  } = await import("./space-context.server-D2TjyZvs.mjs");
  const ctx = await resolveSpaceContext();
  if (!ctx) {
    return {
      spaceId: null,
      name: "",
      plan: "",
      status: "active",
      isSuperAdmin: false,
      flags: {},
      limits: {}
    };
  }
  const db = await admin();
  const {
    data
  } = await db.from("spaces").select("name, plan").eq("id", ctx.spaceId).maybeSingle();
  const s = data;
  return {
    spaceId: ctx.spaceId,
    name: s?.name ?? "",
    plan: s?.plan ?? "",
    status: ctx.status,
    isSuperAdmin: ctx.isSuperAdmin,
    flags: ctx.flags ?? {},
    limits: ctx.limits ?? {}
  };
});
const listMySpaces_createServerFn_handler = createServerRpc({
  id: "456600ce273908abe399bb1e4efdc565be912b03f1d085be9e7972dc41cf83ba",
  name: "listMySpaces",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => listMySpaces.__executeServer(opts));
const listMySpaces = createServerFn({
  method: "GET"
}).handler(listMySpaces_createServerFn_handler, async () => {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const u = await getRequestUser();
  if (!u) return {
    spaces: [],
    isSuperAdmin: false,
    error: "Unauthorized"
  };
  const db = await admin();
  const isSuper = u.role === "super_admin";
  if (isSuper) {
    const {
      data
    } = await db.from("spaces").select("id, name, status, is_default").order("is_default", {
      ascending: false
    }).order("name", {
      ascending: true
    });
    return {
      spaces: data ?? [],
      isSuperAdmin: true,
      error: null
    };
  }
  const {
    data: memberships
  } = await db.from("space_members").select("space_id, role").eq("user_id", u.userId);
  const ids = (memberships ?? []).map((m) => m.space_id);
  if (ids.length === 0) return {
    spaces: [],
    isSuperAdmin: false,
    error: null
  };
  const {
    data: spaces
  } = await db.from("spaces").select("id, name, status, is_default").in("id", ids).eq("status", "active").order("name", {
    ascending: true
  });
  return {
    spaces: spaces ?? [],
    isSuperAdmin: false,
    error: null
  };
});
const listSpaces_createServerFn_handler = createServerRpc({
  id: "03207fad1b655f4d48a6a0cf029d69fc93efdd09f8b99ed843337ff8186bf106",
  name: "listSpaces",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => listSpaces.__executeServer(opts));
const listSpaces = createServerFn({
  method: "GET"
}).handler(listSpaces_createServerFn_handler, async () => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      spaces: [],
      error: e.message
    };
  }
  const db = await admin();
  const {
    data: spaces,
    error
  } = await db.from("spaces").select("*").order("is_default", {
    ascending: false
  }).order("created_at", {
    ascending: true
  });
  if (error) return {
    spaces: [],
    error: error.message
  };
  const {
    data: members
  } = await db.from("space_members").select("space_id");
  const counts = /* @__PURE__ */ new Map();
  for (const m of members ?? []) {
    counts.set(m.space_id, (counts.get(m.space_id) ?? 0) + 1);
  }
  const withCounts = (spaces ?? []).map((s) => ({
    ...s,
    member_count: counts.get(s.id) ?? 0
  }));
  return {
    spaces: withCounts,
    error: null
  };
});
const createSpace_createServerFn_handler = createServerRpc({
  id: "71fc3984673541d77fcd20268f2625d6fe5a528fa6f2ed52ccc6bf9be7e35795",
  name: "createSpace",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => createSpace.__executeServer(opts));
const createSpace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  name: stringType().min(1).max(120),
  plan: stringType().max(60).optional(),
  feature_flags: flagsSchema.optional(),
  limits: limitsSchema.optional()
}).parse(d)).handler(createSpace_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  let slug = slugify(data.name);
  const {
    data: existing
  } = await db.from("spaces").select("slug").like("slug", `${slug}%`);
  const taken = new Set((existing ?? []).map((s) => s.slug));
  if (taken.has(slug)) {
    let i = 2;
    while (taken.has(`${slug}-${i}`)) i++;
    slug = `${slug}-${i}`;
  }
  const {
    data: created,
    error
  } = await db.from("spaces").insert({
    name: data.name,
    slug,
    status: "active",
    plan: data.plan ?? "standard",
    feature_flags: data.feature_flags ?? DEFAULT_FLAGS,
    limits: data.limits ?? DEFAULT_LIMITS,
    is_default: false
  }).select("id").single();
  if (error) return {
    ok: false,
    error: error.message
  };
  const spaceId = created.id;
  const {
    data: pipe
  } = await db.from("pipelines").insert({
    space_id: spaceId,
    name: "Admissions Pipeline",
    is_default: true,
    position: 0
  }).select("id").single();
  const pid = pipe?.id;
  if (pid) {
    await db.from("pipeline_stages").insert([{
      space_id: spaceId,
      pipeline_id: pid,
      label: "New Lead",
      stage_keys: ["NEW_LEAD", "NAME_CAPTURED"],
      position: 0
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Qualification",
      stage_keys: ["STRUCTURAL_CONFIRMATION", "COURSE_IDENTIFIED", "DESTINATION_IDENTIFIED", "ACADEMIC_PROFILE_VERIFIED", "DOCUMENT_REQUESTED", "FINANCIAL_ALIGNMENT", "PARENT_CONTACT_RECEIVED"],
      position: 1
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Qualified",
      stage_keys: ["QUALIFIED"],
      position: 2
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Booking Pending",
      stage_keys: ["BOOKING_REQUEST_CREATED"],
      position: 3
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Meeting Scheduled",
      stage_keys: ["BOOKING_CONFIRMATION_CALL", "SPECIALIST_CONSULTATION"],
      position: 4
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Payment Pending",
      stage_keys: ["PAYMENT_ACTIVATION"],
      position: 5
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Onboarding",
      stage_keys: ["ONBOARDING"],
      position: 6
    }, {
      space_id: spaceId,
      pipeline_id: pid,
      label: "Disqualified",
      stage_keys: ["DISQUALIFIED"],
      position: 7
    }]);
  }
  return {
    ok: true,
    error: null,
    id: spaceId
  };
});
const updateSpace_createServerFn_handler = createServerRpc({
  id: "3b460756f197702ca387a55029416d84e1e7e88356e07e9def88028fa0d145ff",
  name: "updateSpace",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => updateSpace.__executeServer(opts));
const updateSpace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  name: stringType().min(1).max(120).optional(),
  plan: stringType().max(60).optional(),
  feature_flags: flagsSchema.optional(),
  limits: limitsSchema.optional()
}).parse(d)).handler(updateSpace_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const patch = {};
  if (data.name !== void 0) patch.name = data.name;
  if (data.plan !== void 0) patch.plan = data.plan;
  if (data.feature_flags !== void 0) patch.feature_flags = data.feature_flags;
  if (data.limits !== void 0) patch.limits = data.limits;
  if (Object.keys(patch).length === 0) return {
    ok: false,
    error: "Nothing to update."
  };
  const {
    error
  } = await db.from("spaces").update(patch).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const setSpaceStatus_createServerFn_handler = createServerRpc({
  id: "6331eb5d595ffe887645e3ab92784a4a1d107fa3ab58d931f3fb9241d7d5981b",
  name: "setSpaceStatus",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => setSpaceStatus.__executeServer(opts));
const setSpaceStatus = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["active", "suspended"])
}).parse(d)).handler(setSpaceStatus_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    data: space
  } = await db.from("spaces").select("is_default").eq("id", data.id).maybeSingle();
  if (space?.is_default && data.status === "suspended") {
    return {
      ok: false,
      error: "The Default Space cannot be suspended."
    };
  }
  const {
    error
  } = await db.from("spaces").update({
    status: data.status
  }).eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteSpace_createServerFn_handler = createServerRpc({
  id: "aca9ec34dbf7c5de681f8d28b5daf35d2aa913140b29de1df684427e7f0c26bd",
  name: "deleteSpace",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => deleteSpace.__executeServer(opts));
const deleteSpace = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteSpace_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    data: space
  } = await db.from("spaces").select("is_default").eq("id", data.id).maybeSingle();
  if (space?.is_default) {
    return {
      ok: false,
      error: "The Default Space cannot be deleted."
    };
  }
  const {
    error
  } = await db.from("spaces").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const listSpaceMembers_createServerFn_handler = createServerRpc({
  id: "17f93081cdfac3bbe96880a0167306c5d2d35618a0b733bd02d3b73eb0cae7fc",
  name: "listSpaceMembers",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => listSpaceMembers.__executeServer(opts));
const listSpaceMembers = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  spaceId: stringType().uuid()
}).parse(d)).handler(listSpaceMembers_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      members: [],
      users: [],
      error: e.message
    };
  }
  const db = await admin();
  const [{
    data: members
  }, {
    data: profiles
  }, {
    data: roles
  }] = await Promise.all([db.from("space_members").select("id, user_id, role").eq("space_id", data.spaceId), db.from("profiles").select("user_id, email, full_name"), db.from("user_roles").select("user_id, role")]);
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
  const superIds = new Set((roles ?? []).filter((r) => r.role === "super_admin").map((r) => r.user_id));
  const memberRows = (members ?? []).map((m) => ({
    id: m.id,
    user_id: m.user_id,
    role: m.role,
    email: profileMap.get(m.user_id)?.email ?? null,
    full_name: profileMap.get(m.user_id)?.full_name ?? null
  }));
  const memberIds = new Set(memberRows.map((m) => m.user_id));
  const assignable = (profiles ?? []).filter((p) => !memberIds.has(p.user_id) && !superIds.has(p.user_id)).map((p) => ({
    user_id: p.user_id,
    email: p.email,
    full_name: p.full_name
  }));
  return {
    members: memberRows,
    users: assignable,
    error: null
  };
});
const addSpaceMember_createServerFn_handler = createServerRpc({
  id: "df594e1e74b13e1db50b610c2aa3910a33356e58afbb3d53e8a90feeca1478a9",
  name: "addSpaceMember",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => addSpaceMember.__executeServer(opts));
const addSpaceMember = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  spaceId: stringType().uuid(),
  userId: stringType().uuid(),
  role: enumType(["admin", "agent"])
}).parse(d)).handler(addSpaceMember_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const [{
    data: space
  }, {
    count
  }] = await Promise.all([db.from("spaces").select("limits").eq("id", data.spaceId).maybeSingle(), db.from("space_members").select("id", {
    count: "exact",
    head: true
  }).eq("space_id", data.spaceId)]);
  const maxUsers = space?.limits?.max_users;
  const {
    data: existingMember
  } = await db.from("space_members").select("id").eq("space_id", data.spaceId).eq("user_id", data.userId).maybeSingle();
  if (!existingMember && typeof maxUsers === "number" && maxUsers > 0 && (count ?? 0) >= maxUsers) {
    return {
      ok: false,
      error: `Plan limit reached: this Space allows up to ${maxUsers} members.`
    };
  }
  const {
    error
  } = await db.from("space_members").upsert({
    space_id: data.spaceId,
    user_id: data.userId,
    role: data.role
  }, {
    onConflict: "space_id,user_id"
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const removeSpaceMember_createServerFn_handler = createServerRpc({
  id: "bbdea50d45903d05e85d1d496db6fd3c19b4f39c1942119f89b147f605b009c6",
  name: "removeSpaceMember",
  filename: "src/lib/spaces.functions.ts"
}, (opts) => removeSpaceMember.__executeServer(opts));
const removeSpaceMember = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(removeSpaceMember_createServerFn_handler, async ({
  data
}) => {
  try {
    await guardSuper();
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  const {
    error
  } = await db.from("space_members").delete().eq("id", data.id);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
export {
  addSpaceMember_createServerFn_handler,
  createSpace_createServerFn_handler,
  deleteSpace_createServerFn_handler,
  getActiveSpaceContext_createServerFn_handler,
  listMySpaces_createServerFn_handler,
  listSpaceMembers_createServerFn_handler,
  listSpaces_createServerFn_handler,
  removeSpaceMember_createServerFn_handler,
  setSpaceStatus_createServerFn_handler,
  updateSpace_createServerFn_handler
};
