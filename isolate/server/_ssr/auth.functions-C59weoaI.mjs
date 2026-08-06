import { c as createServerRpc } from "./createServerRpc-Baarst8k.mjs";
import { A as ALL_ROLES } from "./roles-vB9M4HoO.mjs";
import { c as createServerFn, a as getRequest } from "./server-BpMAhPfL.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, e as enumType, s as stringType, b as booleanType } from "../_libs/zod.mjs";

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
async function localDb() {
  return import("./db.server-BWf4zT2m.mjs");
}
const getMyProfile_createServerFn_handler = createServerRpc({
  id: "ecb43edc9942f5265a26ac2ab7ec9e5f6bb0b891a5cfd4cd3817af7f283a5b18",
  name: "getMyProfile",
  filename: "src/lib/auth.functions.ts"
}, (opts) => getMyProfile.__executeServer(opts));
const getMyProfile = createServerFn({
  method: "GET"
}).handler(getMyProfile_createServerFn_handler, async () => {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const user = await getRequestUser();
  if (!user) return {
    authenticated: false,
    role: null,
    email: null,
    full_name: null,
    userId: null,
    permissions: []
  };
  const db = await admin();
  const [{
    data: profile
  }, {
    data: perms
  }] = await Promise.all([db.from("profiles").select("full_name").eq("user_id", user.userId).maybeSingle(), db.from("user_permissions").select("permission").eq("user_id", user.userId)]);
  return {
    authenticated: true,
    role: user.role,
    email: user.email,
    full_name: profile?.full_name ?? null,
    userId: user.userId,
    permissions: (perms ?? []).map((p) => p.permission)
  };
});
const listUsers_createServerFn_handler = createServerRpc({
  id: "40fcebef033a0e93f0c2bc911baff59d41328a529f571cb6e38c3b592f923ef0",
  name: "listUsers",
  filename: "src/lib/auth.functions.ts"
}, (opts) => listUsers.__executeServer(opts));
const listUsers = createServerFn({
  method: "GET"
}).handler(listUsers_createServerFn_handler, async () => {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  try {
    await assertRole(["super_admin"]);
  } catch (e) {
    return {
      users: [],
      error: e.message
    };
  }
  const db = await admin();
  const [{
    data: profiles
  }, {
    data: roles
  }, {
    data: perms
  }] = await Promise.all([db.from("profiles").select("user_id, email, full_name, created_at").order("created_at", {
    ascending: true
  }), db.from("user_roles").select("user_id, role"), db.from("user_permissions").select("user_id, permission")]);
  const roleMap = /* @__PURE__ */ new Map();
  for (const r of roles ?? []) roleMap.set(r.user_id, r.role);
  const permMap = /* @__PURE__ */ new Map();
  for (const p of perms ?? []) {
    permMap.set(p.user_id, [...permMap.get(p.user_id) ?? [], p.permission]);
  }
  const users = (profiles ?? []).map((p) => ({
    user_id: p.user_id,
    email: p.email,
    full_name: p.full_name,
    created_at: p.created_at,
    role: roleMap.get(p.user_id) ?? null,
    permissions: permMap.get(p.user_id) ?? []
  }));
  return {
    users,
    error: null
  };
});
const createUser_createServerFn_handler = createServerRpc({
  id: "af19e25bd69df1ad3695025a920da1ae50a4a0cd8e9eb2687d932c04a9868735",
  name: "createUser",
  filename: "src/lib/auth.functions.ts"
}, (opts) => createUser.__executeServer(opts));
const createUser = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(200),
  password: stringType().min(8).max(200),
  full_name: stringType().min(1).max(200),
  role: enumType(ALL_ROLES)
}).parse(d)).handler(createUser_createServerFn_handler, async ({
  data
}) => {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  try {
    await assertRole(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const ldb = await localDb();
  const existing = await ldb.getUserByEmail(data.email);
  if (existing) return {
    ok: false,
    error: "A user with this email already exists."
  };
  try {
    await ldb.createLocalUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role
    });
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to create user"
    };
  }
  return {
    ok: true,
    error: null
  };
});
const updateUserRole_createServerFn_handler = createServerRpc({
  id: "6eee05a9ebf7c4c9cba06d54a5ae4676555038391829729376df54af6fa7e6e5",
  name: "updateUserRole",
  filename: "src/lib/auth.functions.ts"
}, (opts) => updateUserRole.__executeServer(opts));
const updateUserRole = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  user_id: stringType().uuid(),
  role: enumType(ALL_ROLES)
}).parse(d)).handler(updateUserRole_createServerFn_handler, async ({
  data
}) => {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  let me;
  try {
    me = await assertRole(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  if (me.userId === data.user_id && data.role !== "super_admin") {
    return {
      ok: false,
      error: "You cannot remove your own super admin role."
    };
  }
  const db = await admin();
  await db.from("user_roles").delete().eq("user_id", data.user_id);
  const {
    error
  } = await db.from("user_roles").insert({
    user_id: data.user_id,
    role: data.role
  });
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const deleteUser_createServerFn_handler = createServerRpc({
  id: "ede280926c7086d2a21a33024ccdfa76bc27e68d577cd0158124241a6ad370e6",
  name: "deleteUser",
  filename: "src/lib/auth.functions.ts"
}, (opts) => deleteUser.__executeServer(opts));
const deleteUser = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  user_id: stringType().uuid()
}).parse(d)).handler(deleteUser_createServerFn_handler, async ({
  data
}) => {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  let me;
  try {
    me = await assertRole(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  if (me.userId === data.user_id) return {
    ok: false,
    error: "You cannot delete your own account."
  };
  try {
    const ldb = await localDb();
    await ldb.deleteLocalUser(data.user_id);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete user"
    };
  }
  return {
    ok: true,
    error: null
  };
});
const setUserPermission_createServerFn_handler = createServerRpc({
  id: "4edeef12260e94cb0e4415b119b55535aa6a0f049c75699e41e433ddaabf189b",
  name: "setUserPermission",
  filename: "src/lib/auth.functions.ts"
}, (opts) => setUserPermission.__executeServer(opts));
const setUserPermission = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  user_id: stringType().uuid(),
  permission: stringType().min(1).max(50).regex(/^[a-z_]+$/),
  enabled: booleanType()
}).parse(d)).handler(setUserPermission_createServerFn_handler, async ({
  data
}) => {
  const {
    assertRole
  } = await import("./role-guard.server-D4B58koo.mjs");
  try {
    await assertRole(["super_admin"]);
  } catch (e) {
    return {
      ok: false,
      error: e.message
    };
  }
  const db = await admin();
  if (data.enabled) {
    const {
      error: error2
    } = await db.from("user_permissions").upsert({
      user_id: data.user_id,
      permission: data.permission
    }, {
      onConflict: "user_id,permission"
    });
    return {
      ok: !error2,
      error: error2?.message ?? null
    };
  }
  const {
    error
  } = await db.from("user_permissions").delete().eq("user_id", data.user_id).eq("permission", data.permission);
  return {
    ok: !error,
    error: error?.message ?? null
  };
});
const localLogin_createServerFn_handler = createServerRpc({
  id: "8b7373309028e18d4057ffe0e16cc8b58c28c8e1b69432e533449e060093ea4b",
  name: "localLogin",
  filename: "src/lib/auth.functions.ts"
}, (opts) => localLogin.__executeServer(opts));
const localLogin = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(200),
  password: stringType().min(1).max(200)
}).parse(d)).handler(localLogin_createServerFn_handler, async ({
  data
}) => {
  const ldb = await localDb();
  const user = await ldb.getUserByEmail(data.email);
  if (!user) return {
    ok: false,
    error: "Invalid email or password."
  };
  const db = await admin();
  const {
    data: row
  } = await db.from("users").select("password_hash").eq("id", user.id).maybeSingle();
  const stored = row?.password_hash ?? "";
  if (!ldb.verifyPassword(data.password, stored)) return {
    ok: false,
    error: "Invalid email or password."
  };
  const token = await ldb.createSession(user.id);
  return {
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.full_name
      }
    }
  };
});
const localLogout_createServerFn_handler = createServerRpc({
  id: "de4660ed8aa6eddf7a505292268871a1bdece5407ed46b0a3f1a78011abeebe7",
  name: "localLogout",
  filename: "src/lib/auth.functions.ts"
}, (opts) => localLogout.__executeServer(opts));
const localLogout = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  token: stringType().optional()
}).parse(d)).handler(localLogout_createServerFn_handler, async ({
  data
}) => {
  let token = data.token ?? null;
  if (!token) {
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader?.startsWith("Bearer ")) token = authHeader.slice("Bearer ".length).trim();
  }
  if (token) {
    const ldb = await localDb();
    await ldb.deleteSessionByToken(token);
  }
  return {
    ok: true
  };
});
const signUpLocal_createServerFn_handler = createServerRpc({
  id: "548645ab1f2bd272f345545b731e8f9a488e208f72a5ed55e3bb76e84abd51d0",
  name: "signUpLocal",
  filename: "src/lib/auth.functions.ts"
}, (opts) => signUpLocal.__executeServer(opts));
const signUpLocal = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(200),
  password: stringType().min(8).max(200),
  full_name: stringType().min(1).max(200)
}).parse(d)).handler(signUpLocal_createServerFn_handler, async ({
  data
}) => {
  const ldb = await localDb();
  const existing = await ldb.getUserByEmail(data.email);
  if (existing) return {
    ok: false,
    error: "An account with this email already exists. Try signing in."
  };
  const makeSuper = !await ldb.hasSuperAdmin();
  const role = makeSuper ? "super_admin" : "agent";
  try {
    const user = await ldb.createLocalUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role
    });
    const token = await ldb.createSession(user.id);
    return {
      ok: true,
      token,
      role,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name
        }
      }
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to create account"
    };
  }
});
const whoAmI_createServerFn_handler = createServerRpc({
  id: "af954e18ce570a4b42db1139170195894bf894cb8696fbf30c161195cfd172c6",
  name: "whoAmI",
  filename: "src/lib/auth.functions.ts"
}, (opts) => whoAmI.__executeServer(opts));
const whoAmI = createServerFn({
  method: "GET"
}).handler(whoAmI_createServerFn_handler, async () => {
  const {
    getRequestUser
  } = await import("./role-guard.server-D4B58koo.mjs");
  const user = await getRequestUser();
  if (!user) return {
    user: null
  };
  const {
    supabaseAdmin
  } = await import("./client.server-5D-kk_Jp.mjs");
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("full_name").eq("user_id", user.userId).maybeSingle();
  return {
    user: {
      id: user.userId,
      email: user.email,
      user_metadata: {
        full_name: profile?.full_name ?? null
      }
    }
  };
});
export {
  createUser_createServerFn_handler,
  deleteUser_createServerFn_handler,
  getMyProfile_createServerFn_handler,
  listUsers_createServerFn_handler,
  localLogin_createServerFn_handler,
  localLogout_createServerFn_handler,
  setUserPermission_createServerFn_handler,
  signUpLocal_createServerFn_handler,
  updateUserRole_createServerFn_handler,
  whoAmI_createServerFn_handler
};
