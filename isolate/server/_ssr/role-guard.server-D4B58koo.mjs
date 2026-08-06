import { getUserBySession, getRoleForUser } from "./db.server-BWf4zT2m.mjs";
import { a as getRequest } from "./server-BpMAhPfL.mjs";
import "../_libs/electric-sql__pglite.mjs";




import "../_libs/seroval.mjs";
import "../_libs/react.mjs";


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
async function getRequestUser() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;
  const user = await getUserBySession(token);
  if (!user) return null;
  const role = await getRoleForUser(user.id);
  return {
    userId: user.id,
    email: user.email ?? null,
    role
  };
}
async function assertRole(allowed) {
  const user = await getRequestUser();
  if (!user) throw new Error("Unauthorized: please sign in");
  if (!user.role || !allowed.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return user;
}
export {
  assertRole,
  getRequestUser
};
