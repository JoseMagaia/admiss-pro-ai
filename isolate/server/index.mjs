globalThis.__nitro_main__ = import.meta.url;
import "./_libs/unenv.mjs";

import { H as HookableCore } from "./_libs/hookable.mjs";
import { d as defineLazyEventHandler, H as HTTPError, a as H3Core } from "./_libs/h3.mjs";
import { a as FastResponse } from "./_libs/srvx.mjs";


import "./_libs/rou3.mjs";





function lazyService(loader) {
  let promise, mod;
  return {
    fetch(req) {
      if (mod) {
        return mod.fetch(req);
      }
      if (!promise) {
        promise = loader().then((_mod) => mod = _mod.default || _mod);
      }
      return promise.then((mod2) => mod2.fetch(req));
    }
  };
}
const services = {
  ["ssr"]: lazyService(() => import("./_ssr/index.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
const assets = {
  "/assets/arrow-left-CtjErd91.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"a7-VHHk/5D5vyDUsMzTNcKxtVNU6cE"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 167,
    "path": "../client/assets/arrow-left-CtjErd91.js"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": '"6f-pJMMEAm0hZHpIET0UErGqYEDJfw"',
    "mtime": "2026-08-06T09:12:07.145Z",
    "size": 111,
    "path": "../client/robots.txt"
  },
  "/assets/auth-CvJXCaE1.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"10e4-YUZcnRtNozWyuufT5NHbWmsiPpI"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 4324,
    "path": "../client/assets/auth-CvJXCaE1.js"
  },
  "/assets/button-SuGtjQCX.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"7c78-FqR9wKjcoktICV9kSZR2qUUJqKA"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 31864,
    "path": "../client/assets/button-SuGtjQCX.js"
  },
  "/assets/circle-check-T1uxulK7.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"129-A1QlSjfCKbqVswtqRfbHg1b51/o"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 297,
    "path": "../client/assets/circle-check-T1uxulK7.js"
  },
  "/assets/dashboard-DtxX27Jz.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"3c35-GybETsF6L6PuXEMieWyMg/5Dn7o"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 15413,
    "path": "../client/assets/dashboard-DtxX27Jz.css"
  },
  "/assets/features-CdB8e4sw.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"125a-/bfEVoWYB3cx4EalFs7yjn7n/tc"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 4698,
    "path": "../client/assets/features-CdB8e4sw.js"
  },
  "/assets/hero-admissions-cLzX6QXy.jpg": {
    "type": "image/jpeg",
    "etag": '"1014a-GAG8aNB2rWKsJcT4sZKUHy/JCxM"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 65866,
    "path": "../client/assets/hero-admissions-cLzX6QXy.jpg"
  },
  "/assets/index-BriPINeN.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1bf8-b+VRGy8RUWyABFTG6tmJmnHByLw"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 7160,
    "path": "../client/assets/index-BriPINeN.js"
  },
  "/assets/index-CNaa2wGI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4235e-AZw8h+sPoSFN3Kj3LwLL0acfDCw"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 271198,
    "path": "../client/assets/index-CNaa2wGI.js"
  },
  "/assets/message-square-_eqlx6rF.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5f9-VrfjnKWif8ofsryY2K3B3Su6rYw"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 1529,
    "path": "../client/assets/message-square-_eqlx6rF.js"
  },
  "/assets/phone-CtxxI8aA.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"13f-MecceFY6lggPP6eotEFHwInV/5I"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 319,
    "path": "../client/assets/phone-CtxxI8aA.js"
  },
  "/assets/index-L9fTRsHI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5859f-L4yQ2cqpfecKaCnjzsilNgOIM+g"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 361887,
    "path": "../client/assets/index-L9fTRsHI.js"
  },
  "/assets/route-Dye_E69n.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"5f-WeuRJ5ItmTq/biYi2HFq8nIQtok"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 95,
    "path": "../client/assets/route-Dye_E69n.js"
  },
  "/assets/styles-BffkFh24.css": {
    "type": "text/css; charset=utf-8",
    "etag": '"1dc29-n2SH19e2F5XQakpnygdsqxlzJ3M"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 121897,
    "path": "../client/assets/styles-BffkFh24.css"
  },
  "/assets/useBranding-nAI4JfJI.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"4918-+jpRsFqQd7no4D/sXPRjX9h+uqU"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 18712,
    "path": "../client/assets/useBranding-nAI4JfJI.js"
  },
  "/assets/twilio-C8Tj-sdg.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"35ba3-6t4AV7nW6m8rqtgtaCq2tJlqmkA"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 220067,
    "path": "../client/assets/twilio-C8Tj-sdg.js"
  },
  "/assets/dashboard-CWKPbQmJ.js": {
    "type": "text/javascript; charset=utf-8",
    "etag": '"1259c7-nxmo0VsvkXo+C4S3sWXyXBeSTTg"',
    "mtime": "2026-08-06T09:12:04.750Z",
    "size": 1202631,
    "path": "../client/assets/dashboard-CWKPbQmJ.js"
  }
};
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
const headers = ((m) => function headersRouteRule(event) {
  for (const [key, value] of Object.entries(m.options || {})) {
    event.res.headers.set(key, value);
  }
});
const findRouteRules = /* @__PURE__ */ (() => {
  const $0 = [{ name: "headers", route: "/assets/**", handler: headers, options: { "cache-control": "public, max-age=31536000, immutable" } }];
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "assets") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _lazy_NfYLD_ = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
const findRoute = /* @__PURE__ */ (() => {
  const data = { route: "/**", handler: _lazy_NfYLD_ };
  return ((_m, p) => {
    return { data, params: { "_": p.slice(1) } };
  });
})();
const errorHandler$1 = (error, event) => {
  const res = defaultHandler(error, event);
  return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
  const unhandled = error.unhandled ?? !HTTPError.isError(error);
  const { status = 500, statusText = "" } = unhandled ? {} : error;
  if (status === 404) {
    const url = event.url || new URL(event.req.url);
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      return {
        status: 302,
        headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
      };
    }
  }
  const headers2 = new Headers(unhandled ? {} : error.headers);
  headers2.set("content-type", "application/json; charset=utf-8");
  const jsonBody = unhandled ? {
    status,
    unhandled: true
  } : typeof error.toJSON === "function" ? error.toJSON() : {
    status,
    statusText,
    message: error.message
  };
  return {
    status,
    statusText,
    headers: headers2,
    body: {
      error: true,
      ...jsonBody
    }
  };
}
const errorHandlers = [errorHandler$1];
async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      const response = await handler(error, event, { defaultHandler });
      if (response) {
        return response;
      }
    } catch (error2) {
      console.error(error2);
    }
  }
}
function createNitroApp() {
  const captureError = (error, errorCtx) => {
    if (errorCtx?.event) {
      const errors = errorCtx.event.req.context?.nitro?.errors;
      if (errors) {
        errors.push({ error, context: errorCtx });
      }
    }
  };
  const h3App = createH3App({
    onError(error, event) {
      return errorHandler(error, event);
    }
  });
  let appHandler = (req) => {
    req.context ||= {};
    req.context.nitro = req.context.nitro || { errors: [] };
    return h3App.fetch(req);
  };
  return {
    fetch: appHandler,
    h3: h3App,
    hooks: void 0,
    captureError
  };
}
function createH3App(config) {
  const h3App = new H3Core(config);
  h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
  h3App["~getMiddleware"] = (event, route) => {
    const pathname = event.url.pathname;
    const method = event.req.method;
    const middleware = [];
    const routeRules = getRouteRules(method, pathname);
    event.context.routeRules = routeRules?.routeRules;
    if (routeRules?.routeRuleMiddleware.length) {
      middleware.push(...routeRules.routeRuleMiddleware);
    }
    if (route?.data?.middleware?.length) {
      middleware.push(...route.data.middleware);
    }
    return middleware;
  };
  return h3App;
}
const APP_ID = "default";
function useNitroApp() {
  let instance = useNitroApp._instance;
  if (instance) {
    return instance;
  }
  instance = useNitroApp._instance = createNitroApp();
  globalThis.__nitro__ = globalThis.__nitro__ || {};
  globalThis.__nitro__[APP_ID] = instance;
  return instance;
}
function useNitroHooks() {
  const nitroApp = useNitroApp();
  const hooks = nitroApp.hooks;
  if (hooks) {
    return hooks;
  }
  return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
  const m = findRouteRules(method, pathname);
  if (!m?.length) {
    return { routeRuleMiddleware: [] };
  }
  const routeRules = {};
  for (const layer of m) {
    for (const rule of layer.data) {
      const currentRule = routeRules[rule.name];
      if (currentRule) {
        if (rule.options === false) {
          delete routeRules[rule.name];
          continue;
        }
        if (typeof currentRule.options === "object" && typeof rule.options === "object") {
          currentRule.options = {
            ...currentRule.options,
            ...rule.options
          };
        } else {
          currentRule.options = rule.options;
        }
        currentRule.route = rule.route;
        currentRule.params = {
          ...currentRule.params,
          ...layer.params
        };
      } else if (rule.options !== false) {
        routeRules[rule.name] = {
          ...rule,
          params: layer.params
        };
      }
    }
  }
  const middleware = [];
  const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
  for (const rule of orderedRules) {
    if (rule.options === false || !rule.handler) {
      continue;
    }
    middleware.push(rule.handler(rule));
  }
  return {
    routeRules,
    routeRuleMiddleware: middleware
  };
}
function createHandler(hooks) {
  const nitroApp = useNitroApp();
  const nitroHooks = useNitroHooks();
  return {
    async fetch(request, env, context) {
      globalThis.__env__ = env;
      augmentReq(request, {
        env,
        context
      });
      const ctxExt = {};
      const url = new URL(request.url);
      if (hooks.fetch) {
        const res = await hooks.fetch(request, env, context, url, ctxExt);
        if (res) {
          return res;
        }
      }
      return await nitroApp.fetch(request);
    },
    scheduled(controller, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
        controller,
        env,
        context
      }) || Promise.resolve());
    },
    email(message, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:email", {
        message,
        event: message,
        env,
        context
      }) || Promise.resolve());
    },
    queue(batch, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
        batch,
        event: batch,
        env,
        context
      }) || Promise.resolve());
    },
    tail(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
        traces,
        env,
        context
      }) || Promise.resolve());
    },
    trace(traces, env, context) {
      globalThis.__env__ = env;
      context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
        traces,
        env,
        context
      }) || Promise.resolve());
    }
  };
}
function augmentReq(cfReq, ctx) {
  const req = cfReq;
  req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
  req.runtime ??= { name: "cloudflare" };
  req.runtime.cloudflare = {
    ...req.runtime.cloudflare,
    ...ctx
  };
  req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
const cloudflareModule = createHandler({ fetch(cfRequest, env, context, url) {
  if (env.ASSETS && isPublicAssetURL(url.pathname)) {
    return env.ASSETS.fetch(cfRequest);
  }
} });
export {
  cloudflareModule as default
};
