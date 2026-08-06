import process from "node:process";
import { AsyncLocalStorage } from "node:async_hooks";
import { H as H3Event, t as toResponse } from "../_libs/h3-v2.mjs";
import { s as resolveManifestAssetLink, j as rootRouteId, v as defineHandlerCallback, w as getNormalizedURL, x as getOrigin, y as attachRouterServerSsrUtils, z as createSerializationAdapter, A as createRawStreamRPCPlugin, i as invariant, g as isNotFound, l as isRedirect, C as isResolvedRedirect, D as mergeHeaders, E as executeRewriteInput, F as defaultSerovalPlugins, G as makeSerovalPlugin, H as parseRedirect } from "../_libs/tanstack__router-core.mjs";
import { a as au, I as Iu, o as ou } from "../_libs/seroval.mjs";
import { c as createMemoryHistory } from "../_libs/tanstack__history.mjs";
import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { r as renderRouterToStream, R as RouterProvider } from "../_libs/tanstack__react-router.mjs";
import "../_libs/unenv.mjs";


import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";





import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";

import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function getRequestHeaders() {
  return getH3Event().req.headers;
}
function getRequestHeader(name) {
  return getRequestHeaders().get(name) || void 0;
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("../_tanstack-start-manifest_v-5NE3n2WC.mjs");
  const startManifest = tsrStartManifest();
  const rootRoute = startManifest.routes[rootRouteId] = startManifest.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  let injectedHeadScripts;
  return {
    manifest: {
      inlineCss: startManifest.inlineCss,
      routes: Object.fromEntries(Object.entries(startManifest.routes).flatMap(([k, v]) => {
        const result = {};
        let hasData = false;
        if (v.preloads && v.preloads.length > 0) {
          result["preloads"] = v.preloads;
          hasData = true;
        }
        if (v.assets && v.assets.length > 0) {
          result["assets"] = v.assets;
          hasData = true;
        }
        if (!hasData) return [];
        return [[k, result]];
      }))
    },
    clientEntry: startManifest.clientEntry,
    injectedHeadScripts
  };
}
const manifest = {
  "ecb43edc9942f5265a26ac2ab7ec9e5f6bb0b891a5cfd4cd3817af7f283a5b18": {
    functionName: "getMyProfile_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "40fcebef033a0e93f0c2bc911baff59d41328a529f571cb6e38c3b592f923ef0": {
    functionName: "listUsers_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "af19e25bd69df1ad3695025a920da1ae50a4a0cd8e9eb2687d932c04a9868735": {
    functionName: "createUser_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "6eee05a9ebf7c4c9cba06d54a5ae4676555038391829729376df54af6fa7e6e5": {
    functionName: "updateUserRole_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "ede280926c7086d2a21a33024ccdfa76bc27e68d577cd0158124241a6ad370e6": {
    functionName: "deleteUser_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "4edeef12260e94cb0e4415b119b55535aa6a0f049c75699e41e433ddaabf189b": {
    functionName: "setUserPermission_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "8b7373309028e18d4057ffe0e16cc8b58c28c8e1b69432e533449e060093ea4b": {
    functionName: "localLogin_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "de4660ed8aa6eddf7a505292268871a1bdece5407ed46b0a3f1a78011abeebe7": {
    functionName: "localLogout_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "548645ab1f2bd272f345545b731e8f9a488e208f72a5ed55e3bb76e84abd51d0": {
    functionName: "signUpLocal_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "af954e18ce570a4b42db1139170195894bf894cb8696fbf30c161195cfd172c6": {
    functionName: "whoAmI_createServerFn_handler",
    importer: () => import("./auth.functions-C59weoaI.mjs")
  },
  "8574a630e4d0a5569e173e9dec24eb99c87242aab076be216209b8b7aa5ff486": {
    functionName: "listPipelines_createServerFn_handler",
    importer: () => import("./pipelines.functions-BZb9iZN9.mjs")
  },
  "d06a676fefaee26f3761fa763e73cb972a70b89f3594e9fa97926e2de260a0ea": {
    functionName: "listLeadPipelines_createServerFn_handler",
    importer: () => import("./pipelines.functions-BZb9iZN9.mjs")
  },
  "77b010310fb9c39bf1e6a2819a40567765ca476ed6b673a37c2e632cb9739fe1": {
    functionName: "createPipeline_createServerFn_handler",
    importer: () => import("./pipelines.functions-BZb9iZN9.mjs")
  },
  "44bc684f421a0b7e7eff8ecc89ccd247b7c820b943a54213baaa1762ebe04916": {
    functionName: "updatePipeline_createServerFn_handler",
    importer: () => import("./pipelines.functions-BZb9iZN9.mjs")
  },
  "2420c78ef024ce3c16cabd7eb565757f5e1cc317991ab03e6fe21f9cd17f558f": {
    functionName: "deletePipeline_createServerFn_handler",
    importer: () => import("./pipelines.functions-BZb9iZN9.mjs")
  },
  "c380426bffdff594fe382d74070ed7b3bc4274bf4b3ac910e5a2b7b7cf1b22df": {
    functionName: "savePipelineStages_createServerFn_handler",
    importer: () => import("./pipelines.functions-BZb9iZN9.mjs")
  },
  "2379bcb864ac545f5543202ff7dd41c4ffbfef287df3e13470a3dff21d30d38a": {
    functionName: "getActiveSpaceContext_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "456600ce273908abe399bb1e4efdc565be912b03f1d085be9e7972dc41cf83ba": {
    functionName: "listMySpaces_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "03207fad1b655f4d48a6a0cf029d69fc93efdd09f8b99ed843337ff8186bf106": {
    functionName: "listSpaces_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "71fc3984673541d77fcd20268f2625d6fe5a528fa6f2ed52ccc6bf9be7e35795": {
    functionName: "createSpace_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "3b460756f197702ca387a55029416d84e1e7e88356e07e9def88028fa0d145ff": {
    functionName: "updateSpace_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "6331eb5d595ffe887645e3ab92784a4a1d107fa3ab58d931f3fb9241d7d5981b": {
    functionName: "setSpaceStatus_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "aca9ec34dbf7c5de681f8d28b5daf35d2aa913140b29de1df684427e7f0c26bd": {
    functionName: "deleteSpace_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "17f93081cdfac3bbe96880a0167306c5d2d35618a0b733bd02d3b73eb0cae7fc": {
    functionName: "listSpaceMembers_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "df594e1e74b13e1db50b610c2aa3910a33356e58afbb3d53e8a90feeca1478a9": {
    functionName: "addSpaceMember_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "bbdea50d45903d05e85d1d496db6fd3c19b4f39c1942119f89b147f605b009c6": {
    functionName: "removeSpaceMember_createServerFn_handler",
    importer: () => import("./spaces.functions-B1jKSYZA.mjs")
  },
  "f0e93a0b7066b7c79999a92f026934cfc6656b011cf6524a61d5aa02251d0632": {
    functionName: "listLeads_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "825baabcd2e01f1299a63f2a8983d830cafb53e43441866f672e50d3e6f84c72": {
    functionName: "updateLeadStage_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "865375d9ccafee3d1229b082d70de486e66adb59e64b84339c9fba1aee4ad269": {
    functionName: "toggleHumanTakeover_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "51393a7c454620868fb50a10e9147854d1cfc9cc0cb94e14dbc0b8d4db4791e9": {
    functionName: "deleteLead_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "2b4d2e59f3254b842a76a501b6da5ab7b8c16005a79e1d77989c2d30835a8f35": {
    functionName: "listConversations_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "23974f2d0c70549522eb1ebb0e91a21c4d86f65ecc631f4a20385cf0d7471122": {
    functionName: "listMessages_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "9a62019c9c28a0c86cc6481d2e1748e8ebcc47d59266e272f978e7b3a6f40c09": {
    functionName: "listMessageThreads_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "02c8c501c1fac8aa0095749c2a480a9ec3cf94537cbf03922b721d8e661df9cd": {
    functionName: "listConversationMessages_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "564a4016049afdf95c3c424566a3feca0914abd1ac919b34b25c47f7d12b4189": {
    functionName: "listAppointments_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "197a0c862f5e9927f094c52fdb720aa9f4763d423fc2d5ba6d5c7f440ec09f8f": {
    functionName: "updateAppointmentStatus_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "7180026c600c721a62b1ac583b5fea60a9a24b9cef2c2e9d29b375367c760773": {
    functionName: "getSettings_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "7360a65b44b390ce454157541ae48f1b17feecce8fdb6b9e8a5af44cfc399626": {
    functionName: "updateSettings_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "13e4dc2eebece3ebba74f145e6a44ddafa474f649ded3187578efe489127a756": {
    functionName: "getAiConfig_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "24e1c1463017b740a61277061d0e4df5d075a8ee0a304ff4467d4470e1c44f08": {
    functionName: "saveAiConfig_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "b62418704bebf2a3b1fc360ceed67e8c40d309e6b75692cdf9c950157b72a0ad": {
    functionName: "saveAiProvider_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "0541c2b8a4d13a7e9ba6f76aacb1657b1dec2aec167ffddd6ebb4533447b833d": {
    functionName: "testAiProvider_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "eb9823de071ea6bb3e86a38ed7bdfc2f036aa8acbea52ebfa25a2701fc6201d4": {
    functionName: "listAiProviders_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "81a4541797d12907d7c89e5c66e19a2815ab943462bb25103102789e2a25e008": {
    functionName: "saveAiProviderPool_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "32a1e2a372abf770d5b154b3c2160f8e5508f9f5a0def7a4c833c95dfae4c6ec": {
    functionName: "deleteAiProvider_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "e797e8175d224c32a4d8048c0f4eaf0aa8e336e098e43bbec29809e408c00479": {
    functionName: "reorderAiProviders_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "a57b02ab4b911d002e0fc4e5c23da5ace8c2ac6e932b67a8a4ebaa89e2f409df": {
    functionName: "setFallbackEnabled_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "0ad581a4cea2ac1d973f1c42afaec63983782d7f6da130d464d4efce3538de0f": {
    functionName: "testAiProviderPool_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "52607a6cc61f168ef0d44392548f95e38774a4bff42ec75aea0a2d8e6bf8a8d1": {
    functionName: "listPromptVersions_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "58e1462d19c125efd345c981b757c6f3e7d13cd5a7cb99a9fbb63e84ece5bce9": {
    functionName: "listAiVariables_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "a755caa91272b301890cba49b6956161a3cf8542de43edbec63e28bfae5900a1": {
    functionName: "upsertAiVariable_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "8afe1fc610729473cda96c40b70a63152808e686513f32da5538f5d3a0c02e2a": {
    functionName: "deleteAiVariable_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "d37ffddafc3b5eb13af17cc93be0b6cf2f22827948b3c3bc2c59ee84b5ae664c": {
    functionName: "listHttpActions_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "86f152a60e6c47ac360b71d69625bf9fa4cc372691a904fc0aa4fda4340a0b58": {
    functionName: "upsertHttpAction_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "c06b718bc55b75cfe58b1e201e5678e944c142692ff8c0983342201cbd4a47f0": {
    functionName: "deleteHttpAction_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "953debe6bbad54855647525573f9fa910337130f082a4420e0b8160248ab3716": {
    functionName: "testPrompt_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "d8dd0f2f33ee8ce5e2ea2bfc749715b8e981950fa8bc0e14ec15d540b50039e9": {
    functionName: "getDashboardStats_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "0e7aa1648511bbf1542fd49315db551c43322e38f2328b59f7e42d6300e0a674": {
    functionName: "sendHumanMessage_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "8d253e5b4831da25aa156bcfa56d75dcd7076c12e19b4aff4e5470996e15c01c": {
    functionName: "startConversation_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "ad1643801ede61d74514e1094b8f221a71f752841fb9210dda546612d90407d5": {
    functionName: "listScheduledMessages_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "883b00768c8c2b8026046c9eb39fc8611565f3cbe8278b2bac7d7ad0aecb8c13": {
    functionName: "scheduleMessage_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "456f762fcd34813bc6451d1571226817d097283ce129ec1df0fecbd3de40b329": {
    functionName: "cancelScheduledMessage_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "6d2f2003ef6c38cba68de8895e418fb6a1d0e684d8d1cda5f472c9858e1aa393": {
    functionName: "listWorkspaces_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "bd0c10c3d71df975f9a7c322a8b1cb774ed4e90ae3fbb95f879e30d69d5eea30": {
    functionName: "upsertWorkspace_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "c40056803d857e2486e3d4f3f6d7e8f0fc233a635670f378fe81fc11be8b261e": {
    functionName: "deleteWorkspace_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "ebe6d9ce2cf65372a2f93b8547332d4b4d5ed1807c5114e34d962c979d877d0a": {
    functionName: "setEvolutionWebhook_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "4e98ad4bc171ac6474d4d22d3267fe1d4591a372f03b21e8437ed7486ba90df4": {
    functionName: "testWorkspaceConnection_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "e37c15b1836defd0d9880d82f89d426b3c046a45fbe5055a3c8bd9716d15b842": {
    functionName: "listResponderAgents_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "20e65fdb203b5171275d62545ec5a251cc84f18dc147d735f2ce8adc6ad3d632": {
    functionName: "upsertResponderAgent_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "2bb66c2d3f2895a457b0d983ebdd86324feff86d6de6f6d9571b0f2cd6ce5760": {
    functionName: "deleteResponderAgent_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "ebd250ee813ec8c5bbf5349154ac1ac9dba7aff6b8e41051bf4b10270b63806a": {
    functionName: "listResponderAgentVariables_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "5228ff2a4da0b65c98975ef231c9086c9b48907dd519d9963a4fc3ccbf6a7bfe": {
    functionName: "upsertResponderAgentVariable_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "0437bc527358ea40e84168d2681cf12209b54cc1b7ba07bee2b78e48e7f9ac75": {
    functionName: "deleteResponderAgentVariable_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "8817508e78df521de8f00a80415c9431f2ad0b2c1df5f50661131f8e19972ad4": {
    functionName: "listWorkflows_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "99d88c22ed58f65406bcece6dd8e0282b66384b204a4342850cfeb4e8563517d": {
    functionName: "listWorkflowEnrollments_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "790071a7841e58281ff9edf77fb76210117f19f310f8994e3ee65c4737bdaaf9": {
    functionName: "upsertWorkflow_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "d092086720309421ae894c32c66ad3573d7b3ca8732e317adedb9a0895ed0290": {
    functionName: "seedMeetingOutcomeWorkflows_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "624de0f426b99fc8bd24410df7c564c3de2b6e41ec4a7b20ae273eb773f7abfe": {
    functionName: "deleteWorkflow_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "7b12eb82f1a429cbbd09f3c85d3fbacbe2b4fa0112e875b07fe56db6e0c5a745": {
    functionName: "listActiveWorkflows_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "dacd3c7e914c8438f804a485fff697f1e5daada875cd5c2ab8d0f0979cdb1d03": {
    functionName: "triggerLeadWorkflow_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "e0900568cd95d7036f7b4f572bb10f167d4437bf97f89bb9233c17de0cc5c6f7": {
    functionName: "listMeetingOutcomes_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "99568c530a7ecd49cbbd9f6c4ec06c7dbbcbc3b92247357f1996d55ab2f8819b": {
    functionName: "saveMeetingOutcome_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "a5862b4a7392e595242d8471a57c7aa0030669a214d3749f88639c2ddec3ecf0": {
    functionName: "updateMeetingOutcome_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "364620d9768c1f98a5db7344080f8433b793ca08e1dc6c4d279786921253883a": {
    functionName: "getMeetingOutcomeStats_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "8b4ea44888678761b2bed0e29cdf9e531d4673d812c609995c1b5c2c378bc7ef": {
    functionName: "deleteMeetingOutcome_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "c2712e5db5e52b9f6c2978d9009d1aa8ae496911c8bedbb48c9b44eff52dc2b2": {
    functionName: "processDueWorkflows_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "1f1865c13caac15197f9fc2542dfc2b29416d27f4968c190d3b6d71978d481ca": {
    functionName: "listWorkflowStates_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "a518d2d3284cb90077e775b3bbd4225e7b9e60249987d261096a1e01369ee275": {
    functionName: "pauseLeadWorkflow_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "4cf58d2d1f1e29b559294f4f1c402c449ddd01d68d7d73f8c008e1fd4419fb00": {
    functionName: "listContacts_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "ee41387a2c2f7d1249e4cc0da5bd5c9009aa9ce45c3928daffee0cabd22874b8": {
    functionName: "listLeadWorkflows_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "8c801bac72f2ae1b1db8e156395e60d29fc6a9474f900a962737946ed2f80151": {
    functionName: "assignLeadWorkflow_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "25b053a1ae71f696e147e730db4a3880efbd3b2b2a234ab63ea2a7ba8a2491e2": {
    functionName: "removeLeadWorkflow_createServerFn_handler",
    importer: () => import("./dashboard.functions-DIBfGO6K.mjs")
  },
  "a9d93f07e9116cae197653f9538f075fa602afd61a82cb0828323b152fbbb57b": {
    functionName: "listCampaigns_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "9be36f205e095650b906a98cdcbb1c9b6b2e6294d4d303807d1c7ffc72991024": {
    functionName: "listCampaignRecipients_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "c4e7b21088ea68ff37cddb27e497bf5d69b1a5a0f3d35b4e94fee95838219e5a": {
    functionName: "getCampaignOptions_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "fdd1cd7187316037ea146cc01f5803c448f81fba3975f8ab8d92e76b9ef5f2d3": {
    functionName: "createCampaign_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "00cb2e82a9b0990de75f2084e38d68c14eb0cbf41b0519728fbdb9e040635442": {
    functionName: "updateCampaign_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "a08e28dc292e44c75289d5fcca1f137485ba52c925213b0bee3d203a894437ea": {
    functionName: "setCampaignStatus_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "0fdd36c83dd8dd2d96973afb69b82f5a87217c21241a67b302d9e0853cca7a4a": {
    functionName: "deleteCampaign_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "8b30a5d064821f11309968fded3e3d07404a06454930c94cd9b8645a04a59e43": {
    functionName: "addRecipientsFromLeads_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "799b5d005056f07de102e92a10b6deb8bee353c5957305173efa90827334250d": {
    functionName: "addRecipientsFromCsv_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "f333da84ff96ee40bd85f2d29b1c58ea9f888d3d77136f98a371e2480526de20": {
    functionName: "clearPendingRecipients_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "e373b73fb9719155d87a4061ab7f678ef710dc53c0ccbc3e08bc044c1b58808a": {
    functionName: "exportContactsCsv_createServerFn_handler",
    importer: () => import("./campaigns.functions-BkqY1nCn.mjs")
  },
  "aa731155c44b879ab903335fbbe2553bfafaccbb340e57b6136a779062820fe4": {
    functionName: "listOffers_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "a4b0b7d8cee7ea93538428d5b7b68799d44cae751347f84ca8526fdac64369cc": {
    functionName: "upsertOffer_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "ad4ab0e5a64fac56d2cdf88e298c149c0487349381e29d74143710db753b5ac6": {
    functionName: "deleteOffer_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "35e53c6f9bcbf54bb276553c1426073f35ba91fd10d7cd2c87f3f542a3453ac3": {
    functionName: "listLeadOpportunities_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "388deb8e6034e8877ea6327ba4c528a3333db9a1d5404fdd1172745acf6d0fe6": {
    functionName: "upsertLeadOpportunity_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "00d37a705f76d0f5cd6958bb87af50a7d275c0d15f4453ac6beef79ac19ee567": {
    functionName: "listStageSettings_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "df5bdc994b5d58ed12c9624d2d76897bee25682773457a5663b3226d43339e16": {
    functionName: "upsertStageSetting_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "3513636ab79ebf95fb7f672e5b566664e026d5866df0b8fbb366c4c2cf84bf94": {
    functionName: "getReportDashboard_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "2c2cdf22ef130c8637595a54d48f42d915291b312305fe594ee940274727155c": {
    functionName: "generateReport_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "ac0297c0358c09ca8175b3f59846a6e28294069e71be6e665bce70954f15da38": {
    functionName: "generateChatReply_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "f26db4cd0d46d8e37a39bfb82aac17baa1e813b543f4182a529f582eb4e1ac49": {
    functionName: "listConversations_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "2221cb2a72ee74292562bf1dc073cf06bb52922e96276f0d2b9130feb3ea0ca2": {
    functionName: "saveConversation_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "0f91df053876de7855f9ca6e95ac99a5e7cadd97917e7922b6dabc99e4e47844": {
    functionName: "deleteConversation_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "6f92326e3fd40ca9d279909c087a509aae4e6fee844c5f68d7056e79ea106138": {
    functionName: "generateAgentReply_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "743d522a1acc4a7eee1e7188b0fb967b0b6915f5ead7d2fa04cf4c76f0036e80": {
    functionName: "executeAgentAction_createServerFn_handler",
    importer: () => import("./advanced.functions-CfjgpsGL.mjs")
  },
  "b03ddef266c0950392b12635353029702c87de4525dc8d88b2ac114e4d0ec662": {
    functionName: "getVoipSettings_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "dad28c0d24bb0f8d3f94b0787e0c5251b71059f48a69bafc1733951b251659be": {
    functionName: "saveVoipSettings_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "25caaca990ebedc2f903c87ae54da6728d0ea78bafac960a8ee62cb6162a72a4": {
    functionName: "getVoipClientConfig_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "c58440861d680dc087dbe989cbc83d688543877ef870f2f762b3e3c70a11d787": {
    functionName: "listCalls_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "fd0d3b9c8ce4e5ac2d87acf54c38f2ec4eb625ed91f013ca94d2e97381299ed1": {
    functionName: "logCall_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "d4891ea68ff5307322482a8a30200c4fd9b87d627ec15141a9ad18b11ff050ac": {
    functionName: "updateCallNotes_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "41f4843a9bb81e173789f270baaece6814a69fbb86bd369e6761aad89e1e9a9f": {
    functionName: "scheduleCallback_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "560bf64a863cbd8cd6b5531a42029c43ed906bfb77fd28e0dc1fdb5b89cd53e5": {
    functionName: "listCallbacks_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "e50779576e31bc4f3b51972f15a3b4f562c03487d5fad48da4dfaa1399c0710c": {
    functionName: "completeCallback_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "9512807060990a885c1149e0e40f5adaebf01a7887a18006efacdfdee00d891d": {
    functionName: "listDialCampaigns_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "151d2799439b6ae93ab9a47ee982f29e75feccb9965783a29f60105bc34369ca": {
    functionName: "saveDialCampaign_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "cae24ae13cf900c489434963e29055a95a2f60a30b9b3539f702f5a84a9c43b6": {
    functionName: "deleteDialCampaign_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "b451d9a310b3253a27530f6a912668e1efd903735a5262c1b5da76277d66f334": {
    functionName: "getDialQueue_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "1dbdb8a6d4237e2084fd6628fcfdf07fce535a0e98aa344f32c319e4008ddd6b": {
    functionName: "searchDialContacts_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "45267149e0cd688d5407f5e514733fde814645ac8754f46f47b109826842d319": {
    functionName: "listSpaceAgents_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "aecdb3a5a8a7c7efbc47721add99adf014cc1f7734d33bcd0e118e4fa6775e61": {
    functionName: "listRingGroups_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "fbc23770a8f8afc5871df4155273041ecf595e1276788a4ee8818548276f3a7e": {
    functionName: "saveRingGroup_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "3429ef1809e40da5b2765ce7321f0f8c0bd4480c84d52df3a7704240989c480f": {
    functionName: "deleteRingGroup_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "8d09d91d64c2cae32ca5c0a11dbb00c5071882202f78582bb53815a16ed0c698": {
    functionName: "listInboundRoutes_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "d6bba8bf2ff4c4c4ce4be456d16903a034e17424789545613276745cf9416ecd": {
    functionName: "saveInboundRoute_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "11fc11bca3071e8facf27c51f7dd5dfe326353ee39ceb5b8e190f33464c9556a": {
    functionName: "deleteInboundRoute_createServerFn_handler",
    importer: () => import("./calls.functions-7u4wEl2a.mjs")
  },
  "890113bdd975282eeb9f3e4a6905c86d19c05edf8caac5659c3f00f39d11f1eb": {
    functionName: "getCalendarSettings_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  },
  "d180556cfe86edb3c69f25c26ec960ceebaa80c8b8ceb1fcf99001f653874c5c": {
    functionName: "saveCalendarSettings_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  },
  "082b1bc725b594e0b1f41713c403ca659cca2b034c60b262f616d3cd1704b1ca": {
    functionName: "getAvailableSlots_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  },
  "dbfa9dc3831d9672adbc3d7efc7c6ad31240429e963d86f927d8c14d8f50f10f": {
    functionName: "createAppointment_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  },
  "be66105b4f9d539b5df6962e14e5744381d2196f906d25e4dae85cc23e9dec7c": {
    functionName: "bookAppointmentFromChat_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  },
  "d1d5f2c5a83c1797b5d6450eb2782a55e15dccf83d7d0af49188c32120144207": {
    functionName: "getJitsiSettings_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  },
  "4fdde4e2c0e159c7181898eec5b1f380356e3f6fcc0bd80bae3d3e8f90aceb62": {
    functionName: "saveJitsiSettings_createServerFn_handler",
    importer: () => import("./calendar.functions-H6x2-sDu.mjs")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  JSON: 0,
  CHUNK: 1,
  END: 2,
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) newMiddleware.push(...m.options.middleware);
        } else newMiddleware.push(m);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") ctx.data = await execValidator(nextMiddleware.options.inputValidator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, fetch: fetch2, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch: fetch2
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return Iu(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          au(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = Iu(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(ou(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "clientEntry") return { href };
        const co = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co ? {
          href,
          crossOrigin: co
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function adaptTransformAssetUrlsToTransformAssets(transformFn) {
  return async ({ url, kind }) => ({ href: await transformFn({
    url,
    type: kind
  }) });
}
function adaptTransformAssetUrlsConfigToTransformAssets(transform) {
  if (typeof transform === "string") return transform;
  if (typeof transform === "function") return adaptTransformAssetUrlsToTransformAssets(transform);
  if ("createTransform" in transform && transform.createTransform) return {
    createTransform: async (ctx) => adaptTransformAssetUrlsToTransformAssets(await transform.createTransform(ctx)),
    cache: transform.cache,
    warmup: transform.warmup
  };
  return {
    transform: typeof transform.transform === "string" ? transform.transform : adaptTransformAssetUrlsToTransformAssets(transform.transform),
    cache: transform.cache,
    warmup: transform.warmup
  };
}
function buildClientEntryScriptTag(clientEntry, injectedHeadScripts) {
  let script = `import(${JSON.stringify(clientEntry)})`;
  if (injectedHeadScripts) script = `${injectedHeadScripts};${script}`;
  return {
    tag: "script",
    attrs: {
      type: "module",
      async: true
    },
    children: script
  };
}
function assignManifestAssetLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  return next.crossOrigin ? next : { href: next.href };
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source.manifest);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestAssetLink(link).href,
        kind: "modulepreload"
      }));
      return assignManifestAssetLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.assets && !source.manifest.inlineCss) {
      for (const asset of route.assets) if (asset.tag === "link" && asset.attrs?.href) {
        const rel = asset.attrs.rel;
        if (!(typeof rel === "string" ? rel.split(/\s+/) : []).includes("stylesheet")) continue;
        const result = normalizeTransformAssetResult(await transformFn({
          url: asset.attrs.href,
          kind: "stylesheet"
        }));
        asset.attrs.href = result.href;
        if (result.crossOrigin) asset.attrs.crossOrigin = result.crossOrigin;
        else delete asset.attrs.crossOrigin;
      }
    }
  }
  const transformedClientEntry = normalizeTransformAssetResult(await transformFn({
    url: source.clientEntry,
    kind: "clientEntry"
  }));
  const rootRoute = manifest2.routes[rootRouteId] = manifest2.routes[rootRouteId] || {};
  rootRoute.assets = rootRoute.assets || [];
  rootRoute.assets.push(buildClientEntryScriptTag(transformedClientEntry.href, source.injectedHeadScripts));
  return manifest2;
}
function buildManifestWithClientEntry(source) {
  const scriptTag = buildClientEntryScriptTag(source.clientEntry, source.injectedHeadScripts);
  const baseRootRoute = source.manifest.routes[rootRouteId];
  const routes = {
    ...source.manifest.routes,
    [rootRouteId]: {
      ...baseRootRoute,
      assets: [...baseRootRoute?.assets || [], scriptTag]
    }
  };
  return {
    inlineCss: source.manifest.inlineCss,
    routes
  };
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v) => {
    if (typeof v !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v)) return false;
    return !!v[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var baseManifestPromise;
var cachedFinalManifestPromise;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./router-DrjrbDSP.mjs"),
    import("./start-bLvf81FR.mjs"),
    import("../__23tanstack-start-plugin-adapters-Cwee5PKy.mjs")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
function getBaseManifest(matchedRoutes) {
  if (!baseManifestPromise) baseManifestPromise = getStartManifest();
  return baseManifestPromise;
}
async function resolveManifest(matchedRoutes, transformFn, cache) {
  const base = await getBaseManifest();
  const computeFinalManifest = async () => {
    return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
  };
  if (!transformFn || cache) {
    if (!cachedFinalManifestPromise) cachedFinalManifestPromise = computeFinalManifest();
    return cachedFinalManifestPromise;
  }
  return computeFinalManifest();
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSpecialResponse(result)) return { response: result };
  return result;
}
function executeMiddleware(middlewares, ctx) {
  let index = -1;
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        ctx.response = err;
        return ctx;
      }
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) ctx.response = normalized.response;
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  return next();
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const transformAssetsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssets;
  const transformAssetUrlsOption = typeof cbOrOptions === "function" ? void 0 : cbOrOptions.transformAssetUrls;
  const transformOption = transformAssetsOption !== void 0 ? resolveTransformAssetsConfig(transformAssetsOption) : transformAssetUrlsOption !== void 0 ? resolveTransformAssetsConfig(adaptTransformAssetUrlsConfigToTransformAssets(transformAssetUrlsOption)) : void 0;
  const warmupTransformManifest = !!transformAssetsOption && typeof transformAssetsOption === "object" && "warmup" in transformAssetsOption && transformAssetsOption.warmup === true || !!transformAssetUrlsOption && typeof transformAssetUrlsOption === "object" && transformAssetUrlsOption.warmup === true;
  const resolvedTransformConfig = transformOption;
  const cache = resolvedTransformConfig ? resolvedTransformConfig.cache : true;
  const shouldCacheCreateTransform = cache && true;
  let cachedCreateTransformPromise;
  const getTransformFn = async (opts) => {
    if (!resolvedTransformConfig) return void 0;
    if (resolvedTransformConfig.type === "createTransform") {
      if (shouldCacheCreateTransform) {
        if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(resolvedTransformConfig.createTransform(opts)).catch((error) => {
          cachedCreateTransformPromise = void 0;
          throw error;
        });
        return cachedCreateTransformPromise;
      }
      return resolvedTransformConfig.createTransform(opts);
    }
    return resolvedTransformConfig.transformFn;
  };
  if (warmupTransformManifest && cache && true && !cachedFinalManifestPromise) {
    const warmupPromise = (async () => {
      const base = await getBaseManifest();
      const transformFn = await getTransformFn({ warmup: true });
      return transformFn ? await transformManifestAssets(base, transformFn) : buildManifestWithClientEntry(base);
    })();
    cachedFinalManifestPromise = warmupPromise;
    warmupPromise.catch(() => {
      if (cachedFinalManifestPromise === warmupPromise) cachedFinalManifestPromise = void 0;
      cachedCreateTransformPromise = void 0;
    });
  }
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let cbWillCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        serializationAdapters
      };
      const flattenedRequestMiddlewares = startOptions.requestMiddleware ? flattenMiddlewares(startOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          context: createNullProtoObject(requestOpts?.context)
        })).response, request, getRouter);
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return Response.json({ error: "Only HTML requests are supported here" }, { status: 500 });
        const manifest2 = await resolveManifest(matchedRoutes, await getTransformFn({
          warmup: false,
          request
        }), cache);
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets,
          includeUnmatchedRouteAssets: false
        });
        routerInstance.update({ additionalContext: { serverContext } });
        await routerInstance.load();
        if (routerInstance.state.redirect) return routerInstance.state.redirect;
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        cbWillCleanup = true;
        return cb({
          request,
          router: routerInstance,
          responseHeaders
        });
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      return handleRedirectResponse((await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        context: createNullProtoObject(requestOpts?.context)
      })).response, request, getRouter);
    } finally {
      if (router && !cbWillCleanup) router.serverSsr?.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  if (!isRedirect(response)) return response;
  if (isResolvedRedirect(response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
      ...response.options,
      isSerializedRedirect: true
    }, { headers: response.headers });
    return response;
  }
  const opts = response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect = (await getRouter()).resolveRedirect(response);
  if (request.headers.get("x-tsr-serverFn") === "true") return Response.json({
    ...response.options,
    isSerializedRedirect: true
  }, { headers: response.headers });
  return redirect;
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m of flattened) if (!executedRequestMiddlewares.has(m)) routeMiddlewares.push(m.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const handler = handlers[request.method.toUpperCase()] ?? handlers["ANY"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m of handlerMiddlewares) routeMiddlewares.push(m.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push((ctx) => executeRouter(ctx.context, matchedRoutes));
  return (await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname
  })).response;
}
var fetch = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return { async fetch(...args) {
    return await entry.fetch(...args);
  } };
}
var server_default = createServerEntry({ fetch });
const server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createServerEntry,
  default: server_default
}, Symbol.toStringTag, { value: "Module" }));
export {
  TSS_SERVER_FUNCTION as T,
  getRequest as a,
  getRequestHeader as b,
  createServerFn as c,
  getServerFnById as g,
  server as s
};
