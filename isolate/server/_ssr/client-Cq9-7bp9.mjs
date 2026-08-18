import { c as createServerFn, T as TSS_SERVER_FUNCTION, g as getServerFnById } from "./server-BpMAhPfL.mjs";
import { A as ALL_ROLES } from "./roles-vB9M4HoO.mjs";
import { o as objectType, s as stringType, e as enumType, b as booleanType } from "../_libs/zod.mjs";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getMyProfile = createServerFn({
  method: "GET"
}).handler(createSsrRpc("ecb43edc9942f5265a26ac2ab7ec9e5f6bb0b891a5cfd4cd3817af7f283a5b18"));
const listUsers = createServerFn({
  method: "GET"
}).handler(createSsrRpc("40fcebef033a0e93f0c2bc911baff59d41328a529f571cb6e38c3b592f923ef0"));
const createUser = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(200),
  password: stringType().min(8).max(200),
  full_name: stringType().min(1).max(200),
  role: enumType(ALL_ROLES)
}).parse(d)).handler(createSsrRpc("af19e25bd69df1ad3695025a920da1ae50a4a0cd8e9eb2687d932c04a9868735"));
const updateUserRole = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  user_id: stringType().uuid(),
  role: enumType(ALL_ROLES)
}).parse(d)).handler(createSsrRpc("6eee05a9ebf7c4c9cba06d54a5ae4676555038391829729376df54af6fa7e6e5"));
const deleteUser = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  user_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ede280926c7086d2a21a33024ccdfa76bc27e68d577cd0158124241a6ad370e6"));
const setUserPermission = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  user_id: stringType().uuid(),
  permission: stringType().min(1).max(50).regex(/^[a-z_]+$/),
  enabled: booleanType()
}).parse(d)).handler(createSsrRpc("4edeef12260e94cb0e4415b119b55535aa6a0f049c75699e41e433ddaabf189b"));
const localLogin = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(200),
  password: stringType().min(1).max(200)
}).parse(d)).handler(createSsrRpc("8b7373309028e18d4057ffe0e16cc8b58c28c8e1b69432e533449e060093ea4b"));
const localLogout = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  token: stringType().optional()
}).parse(d)).handler(createSsrRpc("de4660ed8aa6eddf7a505292268871a1bdece5407ed46b0a3f1a78011abeebe7"));
const signUpLocal = createServerFn({
  method: "POST"
}).inputValidator((d) => objectType({
  email: stringType().email().max(200),
  password: stringType().min(8).max(200),
  full_name: stringType().min(1).max(200)
}).parse(d)).handler(createSsrRpc("548645ab1f2bd272f345545b731e8f9a488e208f72a5ed55e3bb76e84abd51d0"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("af954e18ce570a4b42db1139170195894bf894cb8696fbf30c161195cfd172c6"));
const SESSION_STORAGE_KEY = "local_access_token";
const SESSION_USER_KEY = "local_user";
const listeners = /* @__PURE__ */ new Set();
function emit(event, session) {
  listeners.forEach((l) => {
    try {
      l(event, session);
    } catch {
    }
  });
}
function readToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}
function readUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeSession(token, user) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, token);
    window.localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user ?? null));
  } catch {
  }
}
function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    window.localStorage.removeItem(SESSION_USER_KEY);
  } catch {
  }
}
const supabase = {
  auth: {
    async getSession() {
      const token = readToken();
      return {
        data: { session: token ? { access_token: token } : null },
        error: null
      };
    },
    async getUser() {
      const token = readToken();
      if (!token) return { data: { user: null }, error: { message: "No session" } };
      const user = readUser();
      return { data: { user }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const res = await localLogin({ data: { email, password } });
      if (!res.ok) {
        return { data: { session: null }, error: { message: res.error ?? "Invalid email or password" } };
      }
      const session = { access_token: res.token, user: res.user ?? null };
      writeSession(res.token, res.user ?? null);
      emit("SIGNED_IN", session);
      return { data: { session }, error: null };
    },
    async signOut() {
      const token = readToken();
      if (token) {
        try {
          await localLogout({ data: { token } });
        } catch {
        }
      }
      clearSession();
      emit("SIGNED_OUT", null);
      return { error: null };
    },
    onAuthStateChange(callback) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback)
          }
        }
      };
    }
  }
};
export {
  SESSION_STORAGE_KEY as S,
  signUpLocal as a,
  createUser as b,
  createSsrRpc as c,
  deleteUser as d,
  setUserPermission as e,
  getMyProfile as g,
  listUsers as l,
  supabase as s,
  updateUserRole as u
};
