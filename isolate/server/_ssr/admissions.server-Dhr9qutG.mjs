import { fillTemplate, runResponderAgent, detectHumanTakeover, runQualification } from "./ai-engine.server-CY0T1eib.mjs";
import { runInSpace } from "./space-context.server-D2TjyZvs.mjs";
import { P as PIPELINE_COLUMNS } from "./pipeline-BHDikEyF.mjs";
import { DEFAULT_AGENT_ID, UNIT_SECONDS, delayToMs } from "./orchestration-lZ10Rxtv.mjs";
import { MEETING_OUTCOME_TEMPLATES } from "./meeting-outcomes-C7fm1Xor.mjs";

import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "./server-BpMAhPfL.mjs";

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
async function rawAdmin() {
  const { supabaseAdmin } = await import("./client.server-5D-kk_Jp.mjs");
  return supabaseAdmin;
}
async function admin() {
  const { supabaseAdmin } = await import("./client.server-5D-kk_Jp.mjs");
  const { currentSpaceId, makeScopedClient, getDefaultSpaceId } = await import("./space-context.server-D2TjyZvs.mjs");
  const sid = currentSpaceId() ?? await getDefaultSpaceId();
  return makeScopedClient(supabaseAdmin, sid);
}
async function loadAiContext() {
  const db = await admin();
  const [{ data: config }, { data: vars }, { data: settings }, { data: pool }] = await Promise.all([
    db.from("ai_configuration").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    db.from("ai_variables").select("variable_name, variable_value"),
    db.from("education_settings").select("*").limit(1).maybeSingle(),
    db.from("ai_provider_pool").select("*").eq("enabled", true).order("priority", { ascending: true })
  ]);
  const variables = {};
  for (const v of vars ?? []) variables[v.variable_name] = v.variable_value;
  const cfg = config;
  const builtInModel = config?.model ?? "google/gemini-3-flash-preview";
  let fallbackChain = null;
  if (cfg?.fallback_enabled && Array.isArray(pool) && pool.length > 0) {
    const chain = pool.map((row) => ({
      provider: String(row.provider ?? ""),
      baseUrl: row.base_url ?? null,
      apiKey: row.api_key ?? null,
      models: Array.isArray(row.models) ? row.models.filter(Boolean) : []
    })).filter((t) => t.provider && t.provider.toLowerCase() !== "built_in" && (t.apiKey && t.models.length > 0));
    fallbackChain = chain;
  }
  const provider = {
    mode: cfg?.provider_mode ?? "built_in",
    custom_provider: cfg?.custom_provider ?? null,
    custom_base_url: cfg?.custom_base_url ?? null,
    custom_model: cfg?.custom_model ?? null,
    custom_api_key: cfg?.custom_api_key ?? null,
    fallbackChain
  };
  return {
    systemPrompt: config?.system_prompt ?? "You are an admissions assistant.",
    model: builtInModel,
    temperature: Number(config?.temperature ?? 0.7),
    variables,
    settings: settings ?? null,
    provider
  };
}
async function resolveWorkspace(params) {
  const db = await rawAdmin();
  const { data } = await db.from("chatwoot_workspaces").select("*").eq("enabled", true);
  const rows = data ?? [];
  if (rows.length === 0) return null;
  if (params.workspaceId) {
    const byId = rows.find((w) => w.id === params.workspaceId);
    if (byId) return byId;
  }
  if (params.phoneNumberId) {
    const wanted = String(params.phoneNumberId).trim();
    const byWaba = rows.find(
      (w) => w.provider_type === "waba" && w.waba_phone_number_id && String(w.waba_phone_number_id).trim() === wanted
    );
    if (byWaba) return byWaba;
  }
  if (params.instance) {
    const wanted = String(params.instance).trim();
    const byInstance = rows.find(
      (w) => w.provider_type === "evolution" && w.evolution_instance && String(w.evolution_instance).trim() === wanted
    );
    if (byInstance) return byInstance;
  }
  if (params.inboxId) {
    const byInbox = rows.find((w) => w.chatwoot_inbox_id && String(w.chatwoot_inbox_id) === String(params.inboxId));
    if (byInbox) return byInbox;
  }
  if (params.accountId) {
    const byAccount = rows.find(
      (w) => w.chatwoot_account_id && String(w.chatwoot_account_id) === String(params.accountId)
    );
    if (byAccount) return byAccount;
  }
  return rows.find((w) => w.is_default) ?? rows[0];
}
async function resolveCreds(workspace) {
  if (workspace?.chatwoot_url && workspace.chatwoot_account_id && workspace.chatwoot_api_token) {
    return {
      url: workspace.chatwoot_url,
      accountId: workspace.chatwoot_account_id,
      apiToken: workspace.chatwoot_api_token
    };
  }
  const db = await admin();
  const { data: settings } = await db.from("education_settings").select("chatwoot_url, chatwoot_account_id, chatwoot_api_token").limit(1).maybeSingle();
  if (settings?.chatwoot_url && settings?.chatwoot_account_id && settings?.chatwoot_api_token) {
    return {
      url: String(settings.chatwoot_url),
      accountId: String(settings.chatwoot_account_id),
      apiToken: String(settings.chatwoot_api_token)
    };
  }
  return null;
}
async function getOrCreateLead(phone, chatwootConversationId, chatwootContactId, workspaceId) {
  const db = await admin();
  const { data: existing } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  if (existing) {
    if (workspaceId && !existing.workspace_id) {
      await db.from("leads").update({ workspace_id: workspaceId }).eq("id", existing.id);
    }
    return existing;
  }
  const { data: created } = await db.from("leads").insert({
    phone_number: phone,
    chatwoot_conversation_id: chatwootConversationId ?? null,
    chatwoot_contact_id: chatwootContactId ?? null,
    workspace_id: workspaceId ?? null,
    qualification_status: "NEW_LEAD"
  }).select("*").single();
  return created;
}
async function recentHistory(phone) {
  const db = await admin();
  const { data } = await db.from("whatsapp_messages").select("sender, message_content").eq("phone_number", phone).order("received_at", { ascending: true }).limit(30);
  return data ?? [];
}
async function runHttpActions(stage, lead) {
  const db = await admin();
  const { data: actions } = await db.from("http_actions").select("*").eq("enabled", true).eq("trigger_stage", stage);
  for (const action of actions ?? []) {
    try {
      const ctx = {
        lead_name: lead.lead_name ?? "",
        phone_number: lead.phone_number,
        course_interest: lead.course_interest ?? "",
        country_interest: lead.country_interest ?? "",
        qualification_status: lead.qualification_status ?? "",
        parent_phone: lead.parent_phone ?? ""
      };
      const body = fillTemplate(action.payload_template ?? "{}", ctx);
      const headers = { "Content-Type": "application/json" };
      if (action.headers && typeof action.headers === "object") {
        for (const [k, v] of Object.entries(action.headers)) {
          headers[k] = String(v);
        }
      }
      await fetch(action.url, {
        method: action.method || "POST",
        headers,
        body: action.method === "GET" ? void 0 : body
      });
    } catch (e) {
      console.error("HTTP action failed:", action.name, e);
    }
  }
}
const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];
async function upsertLeadBooking(db, params) {
  const status = BOOKING_STATUSES.includes((params.status ?? "").toLowerCase()) ? params.status.toLowerCase() : "pending";
  const { data: existing } = await db.from("appointments").select("id").eq("phone_number", params.phone).eq("appointment_type", "booking").maybeSingle();
  if (!existing) {
    await db.from("appointments").insert({
      phone_number: params.phone,
      lead_name: params.leadName,
      appointment_type: "booking",
      status,
      appointment_date: params.date,
      notes: params.notes ?? "Set by AI."
    });
  } else {
    const update = { status };
    if (params.date) update.appointment_date = params.date;
    await db.from("appointments").update(update).eq("id", existing.id);
  }
}
function extractBookingDirective(text) {
  const re = /\[\[\s*BOOKING:\s*([^\]|]+?)\s*(?:\|\s*([a-zA-Z]+)\s*)?\]\]/i;
  const m = text.match(re);
  if (!m) return { date: null, status: "pending", clean: text };
  const parsed = Date.parse(m[1].trim());
  const date = Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  const status = (m[2] || "pending").toLowerCase();
  const clean = text.replace(re, "").trim();
  return { date, status, clean };
}
async function applyDecision(lead, decision) {
  const db = await admin();
  const previousStage = lead.qualification_status;
  const update = {
    ...decision.updates,
    qualification_status: decision.qualification_status
  };
  const { data: updated } = await db.from("leads").update(update).eq("id", lead.id).select("*").single();
  const finalLead = updated ?? { ...lead, ...update };
  if (decision.create_booking || decision.qualification_status === "BOOKING_REQUEST_CREATED" || decision.appointment_date) {
    await upsertLeadBooking(db, {
      phone: lead.phone_number,
      leadName: finalLead.lead_name ?? null,
      date: decision.appointment_date ?? null,
      status: decision.appointment_status ?? "pending",
      notes: decision.booking_notes ?? "Auto-created by AI after qualification."
    });
  }
  if (previousStage !== decision.qualification_status) {
    await runHttpActions(decision.qualification_status, finalLead);
  }
  return finalLead;
}
async function sendChatwootReply(creds, conversationId, message) {
  if (!creds) {
    console.warn("Chatwoot not configured; reply not sent to WhatsApp.");
    return { ok: false, error: "Chatwoot isn't set up for this inbox yet." };
  }
  if (!conversationId) {
    return { ok: false, error: "No active Chatwoot conversation for this contact yet." };
  }
  const base = String(creds.url).replace(/\/$/, "");
  const url = `${base}/api/v1/accounts/${creds.accountId}/conversations/${conversationId}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        api_access_token: creds.apiToken
      },
      body: JSON.stringify({ content: message, message_type: "outgoing" })
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Chatwoot rejected the API token (check it in settings)." };
      }
      if (res.status === 404) {
        return { ok: false, error: "Chatwoot couldn't find this conversation or inbox." };
      }
      return { ok: false, error: `Chatwoot returned an error (${res.status}).` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Chatwoot reply failed:", e);
    return { ok: false, error: "Couldn't reach the Chatwoot server." };
  }
}
async function createChatwootConversation(params) {
  const { creds, inboxId, phone, name } = params;
  if (!creds || !inboxId) return null;
  const base = String(creds.url).replace(/\/$/, "");
  const headers = {
    "Content-Type": "application/json",
    api_access_token: creds.apiToken
  };
  try {
    const contactRes = await fetch(
      `${base}/api/v1/accounts/${creds.accountId}/contacts`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          inbox_id: Number(inboxId),
          name: name || phone,
          phone_number: phone.startsWith("+") ? phone : `+${phone}`
        })
      }
    );
    const contactJson = await contactRes.json().catch(() => null);
    const contact = contactJson?.payload?.contact;
    const sourceId = contactJson?.payload?.contact_inbox?.source_id;
    if (!contact?.id) return null;
    const convRes = await fetch(
      `${base}/api/v1/accounts/${creds.accountId}/conversations`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          inbox_id: Number(inboxId),
          contact_id: contact.id,
          source_id: sourceId
        })
      }
    );
    const convJson = await convRes.json().catch(() => null);
    return convJson?.id ? String(convJson.id) : null;
  } catch (e) {
    console.error("Chatwoot conversation creation failed:", e);
    return null;
  }
}
function toEvolutionNumber(phone) {
  return String(phone).replace(/@.*$/, "").replace(/[^0-9]/g, "");
}
async function sendEvolutionReply(workspace, phone, message) {
  const baseRaw = String(workspace?.evolution_url ?? "").trim();
  const instance = String(workspace?.evolution_instance ?? "").trim();
  const apiKey = String(workspace?.evolution_api_key ?? "").trim();
  if (!baseRaw || !apiKey || !instance) {
    console.warn("Evolution API not configured; reply not sent to WhatsApp.");
    return { ok: false, error: "Evolution API isn't fully set up for this inbox yet." };
  }
  const base = baseRaw.replace(/\/+$/, "");
  const url = `${base}/message/sendText/${encodeURIComponent(instance)}`;
  const number = toEvolutionNumber(phone);
  if (!number) return { ok: false, error: "The contact's phone number is invalid." };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey
      },
      body: JSON.stringify({ number, text: message })
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      let detail = "";
      try {
        const parsed = JSON.parse(bodyText);
        const m = parsed?.response?.message ?? parsed?.message;
        detail = Array.isArray(m) ? m.join(" ") : typeof m === "string" ? m : "";
      } catch {
        detail = bodyText.slice(0, 160);
      }
      console.error("Evolution send failed:", res.status, bodyText.slice(0, 300));
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Evolution rejected the API key (check it in settings)." };
      }
      if (res.status === 404) {
        return {
          ok: false,
          error: `Evolution instance "${instance}" not found. Check the exact instance name and base URL.`
        };
      }
      if (res.status === 400) {
        return {
          ok: false,
          error: detail ? `Evolution rejected the message: ${detail}` : "Evolution rejected the message (check the recipient number)."
        };
      }
      return { ok: false, error: `Evolution returned an error (${res.status}).${detail ? ` ${detail}` : ""}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Evolution reply failed:", e);
    return { ok: false, error: "Couldn't reach the Evolution API server (check the base URL)." };
  }
}
async function sendWabaReply(workspace, phone, message) {
  const phoneNumberId = String(workspace?.waba_phone_number_id ?? "").trim();
  const token = String(workspace?.waba_access_token ?? "").trim();
  const apiVersion = String(workspace?.waba_api_version ?? "v21.0").trim() || "v21.0";
  if (!phoneNumberId || !token) {
    return { ok: false, error: "WABA isn't fully set up for this connection yet (phone number ID + token)." };
  }
  const number = toEvolutionNumber(phone);
  if (!number) return { ok: false, error: "The contact's phone number is invalid." };
  const url = `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: number,
        type: "text",
        text: { body: message, preview_url: false }
      })
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      let detail = "";
      try {
        const parsed = JSON.parse(bodyText);
        detail = parsed?.error?.message ?? "";
      } catch {
        detail = bodyText.slice(0, 200);
      }
      console.error("WABA send failed:", res.status, bodyText.slice(0, 300));
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "Meta rejected the access token (check it in Settings → Connections)." };
      }
      if (res.status === 404) {
        return { ok: false, error: "Phone number ID not found on Meta (check the connection)." };
      }
      return {
        ok: false,
        error: detail ? `WhatsApp rejected the message: ${detail}` : `Meta returned an error (${res.status}).`
      };
    }
    return { ok: true };
  } catch (e) {
    console.error("WABA reply failed:", e);
    return { ok: false, error: "Couldn't reach the Meta Graph API." };
  }
}
async function sendWorkspaceMessage(params) {
  const { workspace, creds, phone, conversationId, message } = params;
  if (!workspace) {
    return { ok: false, error: "No inbox is connected to send from." };
  }
  if (workspace.provider_type === "evolution") {
    return sendEvolutionReply(workspace, phone, message);
  }
  if (workspace.provider_type === "waba") {
    return sendWabaReply(workspace, phone, message);
  }
  return sendChatwootReply(creds, conversationId, message);
}
async function processInboundMessage(params) {
  const {
    phone,
    message,
    chatwootConversationId,
    chatwootContactId,
    chatwootInboxId,
    chatwootAccountId,
    evolutionInstance,
    wabaPhoneNumberId
  } = params;
  const workspace = await resolveWorkspace({
    inboxId: chatwootInboxId,
    accountId: chatwootAccountId,
    instance: evolutionInstance,
    phoneNumberId: wabaPhoneNumberId
  });
  const { getDefaultSpaceId } = await import("./space-context.server-D2TjyZvs.mjs");
  const spaceId = workspace?.space_id ?? await getDefaultSpaceId();
  return runInSpace(spaceId, async () => {
    const db = await admin();
    const creds = await resolveCreds(workspace);
    await db.from("whatsapp_messages").insert({
      phone_number: phone,
      message_content: message,
      sender: "lead",
      message_type: "text",
      processed: false
    });
    await stopCampaignsForPhone(phone);
    const lead = await getOrCreateLead(phone, chatwootConversationId, chatwootContactId, workspace?.id ?? null);
    const { data: conv } = await db.from("conversations").select("*").eq("phone_number", phone).maybeSingle();
    let humanTakeover = conv?.human_takeover ?? false;
    if (!conv) {
      await db.from("conversations").insert({
        phone_number: phone,
        lead_id: lead.id,
        chatwoot_conversation_id: chatwootConversationId ?? null,
        workspace_id: workspace?.id ?? null,
        status: "open"
      });
    } else if (workspace?.id && !conv.workspace_id) {
      await db.from("conversations").update({ workspace_id: workspace.id }).eq("phone_number", phone);
    }
    if (!humanTakeover && detectHumanTakeover(message)) {
      humanTakeover = true;
      await db.from("conversations").update({ human_takeover: true, status: "pending", assigned_agent: "Admissions Team" }).eq("phone_number", phone);
    }
    if (humanTakeover) {
      return {
        reply: "",
        stage: lead.qualification_status ?? "NEW_LEAD",
        humanTakeover: true
      };
    }
    const responderReply = await tryWorkflowResponder({
      phone,
      message,
      lead,
      conversationId: chatwootConversationId ?? lead.chatwoot_conversation_id ?? null,
      creds,
      workspace
    });
    if (responderReply !== null) {
      return { reply: responderReply, stage: lead.qualification_status ?? "NEW_LEAD", humanTakeover: false };
    }
    const aiResumed = conv?.ai_resumed === true;
    const stageStop = lead.qualification_status === "BOOKING_REQUEST_CREATED" || stageBeyondAi(lead.qualification_status);
    if (stageStop && !aiResumed) {
      return {
        reply: "",
        stage: lead.qualification_status ?? "NEW_LEAD",
        humanTakeover: false
      };
    }
    const ctx = await loadAiContext();
    const history = await recentHistory(phone);
    const { decision, error } = await runQualification({
      lead,
      history,
      userMessage: message,
      systemPrompt: ctx.systemPrompt,
      model: ctx.model,
      temperature: ctx.temperature,
      variables: ctx.variables,
      settings: ctx.settings,
      provider: ctx.provider
    });
    const updatedLead = await applyDecision(lead, decision);
    await db.from("whatsapp_messages").insert({
      phone_number: phone,
      message_content: decision.reply,
      sender: "ai",
      message_type: "text",
      ai_response: decision.reply,
      processed: true
    });
    await db.from("whatsapp_messages").update({ processed: true }).eq("phone_number", phone).eq("sender", "lead").eq("processed", false);
    await sendWorkspaceMessage({
      workspace,
      creds,
      phone,
      conversationId: chatwootConversationId ?? lead.chatwoot_conversation_id,
      message: decision.reply
    });
    return {
      reply: decision.reply,
      stage: updatedLead.qualification_status ?? decision.qualification_status,
      humanTakeover: false,
      error
    };
  });
}
async function deliverHumanMessage(params) {
  const db = await admin();
  const { phone, message } = params;
  let { data: lead } = await db.from("leads").select("id, chatwoot_conversation_id, workspace_id").eq("phone_number", phone).maybeSingle();
  let { data: conv } = await db.from("conversations").select("id, chatwoot_conversation_id, workspace_id").eq("phone_number", phone).maybeSingle();
  if (!lead) {
    lead = await getOrCreateLead(phone, null, null, null);
  }
  if (!conv) {
    const { data: createdConv } = await db.from("conversations").insert({
      phone_number: phone,
      lead_id: lead?.id ?? null,
      workspace_id: params.workspaceId ?? lead?.workspace_id ?? null,
      chatwoot_conversation_id: lead?.chatwoot_conversation_id ?? null,
      status: "pending",
      human_takeover: true,
      assigned_agent: params.actor ?? "Admissions Team",
      ai_resumed: false
    }).select("id, chatwoot_conversation_id, workspace_id").single();
    conv = createdConv;
  }
  const currentWorkspaceId = conv?.workspace_id ?? lead?.workspace_id ?? null;
  let conversationId = conv?.chatwoot_conversation_id ?? lead?.chatwoot_conversation_id ?? null;
  const requested = params.workspaceId ?? null;
  const switching = Boolean(requested) && requested !== currentWorkspaceId;
  const effectiveWorkspaceId = requested ?? currentWorkspaceId;
  const workspace = await resolveWorkspace({ workspaceId: effectiveWorkspaceId });
  const creds = await resolveCreds(workspace);
  if (switching) {
    const prevWorkspace = currentWorkspaceId ? await resolveWorkspace({ workspaceId: currentWorkspaceId }) : null;
    if (workspace?.provider_type === "evolution") {
      conversationId = null;
    } else {
      conversationId = await createChatwootConversation({
        creds,
        inboxId: workspace?.chatwoot_inbox_id ?? null,
        phone,
        name: null
      });
    }
    const fromLabel = prevWorkspace?.name ?? "previous workspace";
    const toLabel = workspace?.name ?? "default workspace";
    const actorLabel = params.actor ? ` by ${params.actor}` : "";
    await db.from("whatsapp_messages").insert({
      phone_number: phone,
      message_content: `Delivery workspace switched from "${fromLabel}" to "${toLabel}"${actorLabel}.`,
      sender: "note",
      message_type: "text",
      processed: true
    });
    await db.from("conversations").update({ workspace_id: workspace?.id ?? null, chatwoot_conversation_id: conversationId }).eq("phone_number", phone);
    if (lead?.id) {
      await db.from("leads").update({ workspace_id: workspace?.id ?? null }).eq("id", lead.id);
    }
  }
  if (!switching && workspace && workspace.provider_type !== "evolution" && !conversationId) {
    conversationId = await createChatwootConversation({
      creds,
      inboxId: workspace.chatwoot_inbox_id ?? null,
      phone,
      name: null
    });
    if (conversationId) {
      await db.from("conversations").update({
        workspace_id: workspace.id,
        chatwoot_conversation_id: conversationId
      }).eq("phone_number", phone);
      if (lead?.id) {
        await db.from("leads").update({
          workspace_id: workspace.id,
          chatwoot_conversation_id: conversationId
        }).eq("id", lead.id);
      }
    }
  } else if (!switching && workspace?.id && workspace.id !== currentWorkspaceId) {
    await db.from("conversations").update({ workspace_id: workspace.id }).eq("phone_number", phone);
  }
  const sent = await sendWorkspaceMessage({
    workspace,
    creds,
    phone,
    conversationId,
    message
  });
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "human",
    message_type: "text",
    processed: true
  });
  await db.from("conversations").update({ human_takeover: true, status: "pending", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("phone_number", phone);
  if (!sent.ok) {
    const reason = sent.error ?? "the connection could not be reached";
    return {
      ok: false,
      error: `Message saved but not delivered: ${reason}`
    };
  }
  return { ok: true };
}
async function processScheduledMessages() {
  const db = await rawAdmin();
  const { getDefaultSpaceId } = await import("./space-context.server-D2TjyZvs.mjs");
  const fallbackSpace = await getDefaultSpaceId();
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const { data: due } = await db.from("scheduled_messages").select("*").eq("status", "pending").lte("scheduled_for", nowIso).limit(50);
  let processed = 0;
  for (const row of due ?? []) {
    const spaceId = row.space_id ?? fallbackSpace;
    const result = await runInSpace(
      spaceId,
      () => deliverHumanMessage({
        phone: String(row.phone_number),
        message: String(row.message_content)
      })
    );
    await db.from("scheduled_messages").update({
      status: result.ok ? "sent" : "failed",
      sent_at: (/* @__PURE__ */ new Date()).toISOString(),
      error: result.ok ? null : result.error ?? "delivery failed"
    }).eq("id", row.id);
    processed += 1;
  }
  return { processed };
}
function stageBeyondAi(stage) {
  const beyond = [
    "BOOKING_CONFIRMATION_CALL",
    "SPECIALIST_CONSULTATION",
    "PAYMENT_ACTIVATION",
    "ONBOARDING"
  ];
  return beyond.includes(stage ?? "");
}
function nodeDelayMs(data) {
  if (data && data.delayValue !== void 0 && data.delayUnit) {
    return delayToMs(Number(data.delayValue), String(data.delayUnit));
  }
  return Math.max(0, Number(data?.delayMinutes ?? 0)) * 6e4;
}
function nodeOffsetMs(data) {
  if (data && data.offsetValue !== void 0 && data.offsetUnit) {
    return delayToMs(Number(data.offsetValue), String(data.offsetUnit));
  }
  return 0;
}
function stepNextRunAt(step, goalAtIso, apptAtIso) {
  const now = Date.now();
  if (!step) return new Date(now);
  if (step.anchor === "before_goal" && goalAtIso) {
    const t = new Date(goalAtIso).getTime();
    if (!Number.isNaN(t)) return new Date(Math.max(now, t - step.offsetMs));
  }
  if (step.anchor === "before_appointment" && apptAtIso) {
    const t = new Date(apptAtIso).getTime();
    if (!Number.isNaN(t)) return new Date(Math.max(now, t - step.offsetMs));
  }
  const rel = step.anchor === "wait" ? step.delayMs : step.offsetMs;
  return new Date(now + Math.max(0, rel));
}
async function getLeadAppointmentAt(phone) {
  const db = await admin();
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const { data: future } = await db.from("appointments").select("appointment_date").eq("phone_number", phone).not("appointment_date", "is", null).gte("appointment_date", nowIso).order("appointment_date", { ascending: true }).limit(1);
  const f = future?.[0]?.appointment_date;
  if (f) return f;
  const { data: past } = await db.from("appointments").select("appointment_date").eq("phone_number", phone).not("appointment_date", "is", null).order("appointment_date", { ascending: false }).limit(1);
  return past?.[0]?.appointment_date ?? null;
}
async function orderedSteps(graph, phone) {
  const g = graph ?? {};
  const nodes = g.nodes ?? [];
  const edges = g.edges ?? [];
  const STEP_KINDS = /* @__PURE__ */ new Set([
    "text",
    "message",
    "image",
    "buttons",
    "wait",
    "condition",
    "setvar",
    "ai",
    "http",
    "booking",
    "handoff",
    "end",
    "workflow",
    "redirect"
  ]);
  const stepKindOf = (n) => {
    const d = n.data ?? {};
    return String(d.type ?? d._t ?? n.type ?? "text");
  };
  const isStepNode = (n) => STEP_KINDS.has(stepKindOf(n));
  const stepNodes = nodes.filter(isStepNode);
  if (stepNodes.length === 0) return [];
  let leadRow = null;
  let enrCtx = {};
  let lastReply = null;
  if (phone) {
    try {
      const db = await admin();
      const { data: lead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
      leadRow = lead ?? null;
      const { data: enr } = await db.from("workflow_enrollments").select("context").eq("phone_number", phone).order("updated_at", { ascending: false }).limit(1).maybeSingle();
      enrCtx = enr?.context ?? {};
      const hist = await recentHistory(phone);
      const lastUser = [...hist].reverse().find((h) => h.sender === "lead" || h.sender === "user");
      lastReply = lastUser ? String(lastUser.message_content ?? "") : null;
    } catch {
    }
  }
  const toStep = (n) => {
    const d = n.data ?? {};
    const base = {
      content: String(d.content ?? "").trim(),
      delayMs: nodeDelayMs(d),
      anchor: d.anchor ?? "wait",
      offsetMs: nodeOffsetMs(d)
    };
    switch (stepKindOf(n)) {
      case "workflow":
      case "redirect":
        return {
          ...base,
          kind: "call_workflow",
          content: "",
          targetWorkflowId: d.targetWorkflowId ?? null
        };
      case "image":
        return { ...base, kind: "image", imageUrl: d.imageUrl ?? null, caption: d.caption ?? null };
      case "buttons":
        return { ...base, kind: "buttons", options: d.options ?? [] };
      case "wait":
        return { ...base, kind: "wait" };
      case "condition":
        return {
          ...base,
          kind: "condition",
          field: d.field ?? null,
          operator: d.operator ?? "equals",
          value: d.value ?? "",
          trueLabel: d.trueLabel ?? "Yes",
          falseLabel: d.falseLabel ?? "No"
        };
      case "setvar":
        return { ...base, kind: "setvar", varName: d.varName ?? null, varValue: d.varValue ?? null };
      case "ai":
        return {
          ...base,
          kind: "ai",
          agentId: d.agentId ?? null,
          agentName: d.agentName ?? null,
          instruction: d.instruction ?? null
        };
      case "http":
        return { ...base, kind: "http", actionId: d.actionId ?? null, actionName: d.actionName ?? null };
      case "booking":
        return {
          ...base,
          kind: "booking",
          appointmentType: d.appointmentType ?? "booking",
          daysAhead: Number(d.daysAhead) || 3,
          notes: d.notes ?? null
        };
      case "handoff":
        return { ...base, kind: "handoff", note: d.note ?? null };
      case "end":
        return { ...base, kind: "end", note: d.note ?? null };
      default:
        return { ...base, kind: "message" };
    }
  };
  const isValid = (s) => {
    switch (s.kind) {
      case "call_workflow":
        return Boolean(s.targetWorkflowId);
      case "message":
        return s.content.length > 0;
      case "image":
        return Boolean(s.imageUrl);
      case "buttons":
        return s.content.length > 0 || (s.options ?? []).length > 0;
      case "setvar":
        return Boolean(s.varName);
      case "http":
        return Boolean(s.actionId);
      default:
        return true;
    }
  };
  const evaluate = (s) => {
    const field = s.field ?? "";
    const raw = enrCtx[field] ?? leadRow?.[field] ?? "";
    const expected = fillTemplate(String(s.value ?? ""), { ...enrCtx, ...leadRow ?? {} });
    const operator = s.operator ?? "equals";
    const numA = Number(raw);
    const numB = Number(expected);
    switch (operator) {
      case "is_set":
        return raw !== void 0 && raw !== null && String(raw).trim() !== "";
      case "is_empty":
        return raw === void 0 || raw === null || String(raw).trim() === "";
      case "contains":
        return String(raw).toLowerCase().includes(String(expected).toLowerCase());
      case "gt":
        return !Number.isNaN(numA) && !Number.isNaN(numB) && numA > numB;
      case "lt":
        return !Number.isNaN(numA) && !Number.isNaN(numB) && numA < numB;
      case "not_equals":
        return String(raw) !== String(expected);
      default:
        return String(raw) === String(expected);
    }
  };
  const trigger = nodes.find((n) => n.type === "trigger");
  if (trigger && edges.length > 0) {
    const ordered = [];
    const seen = /* @__PURE__ */ new Set();
    let currentId = trigger.id;
    let guard = 0;
    while (currentId && !seen.has(currentId) && guard++ < 200) {
      seen.add(currentId);
      const node = nodes.find((n) => n.id === currentId);
      if (!node) break;
      if (isStepNode(node) && stepKindOf(node) !== "trigger") {
        const step = toStep(node);
        ordered.push(step);
        if (step.kind === "end" || step.kind === "handoff") break;
      }
      const outs = edges.filter((e) => e.source === currentId);
      if (node && stepKindOf(node) === "condition") {
        const step = ordered[ordered.length - 1];
        const matches = step ? evaluate(step) : true;
        const want = matches ? "yes" : "no";
        currentId = outs.find((e) => e.sourceHandle === want)?.target ?? outs[0]?.target ?? "";
        continue;
      }
      if (node && stepKindOf(node) === "buttons") {
        const step = ordered[ordered.length - 1];
        const labels = (step?.options ?? []).map((o) => o.label.trim().toLowerCase());
        const hit = lastReply ? labels.indexOf(lastReply.trim().toLowerCase()) : -1;
        const hitOpt = hit >= 0 ? (step?.options ?? [])[hit] : void 0;
        currentId = (hitOpt ? outs.find((e) => e.sourceHandle === `opt_${hitOpt.id}`) : void 0)?.target ?? outs.find((e) => !e.sourceHandle)?.target ?? outs[0]?.target ?? "";
        continue;
      }
      const nextEdge = edges.find((e) => e.source === currentId);
      currentId = nextEdge?.target ?? "";
    }
    const filtered = ordered.filter(isValid);
    if (filtered.length > 0) return filtered;
  }
  return stepNodes.map(toStep).filter(isValid);
}
async function sendWorkflowMessage(phone, message, workflowWorkspaceId) {
  const db = await admin();
  const { data: conv } = await db.from("conversations").select("chatwoot_conversation_id, workspace_id").eq("phone_number", phone).maybeSingle();
  const { data: lead } = await db.from("leads").select("chatwoot_conversation_id, workspace_id, lead_name, course_interest, country_interest").eq("phone_number", phone).maybeSingle();
  const leadRow = lead ?? {};
  const { data: customVars } = await db.from("ai_variables").select("variable_name, variable_value");
  const ctx = {};
  for (const v of customVars ?? []) {
    ctx[v.variable_name] = v.variable_value;
  }
  ctx.lead_name = leadRow.lead_name ?? "";
  ctx.course_interest = leadRow.course_interest ?? "";
  ctx.country_interest = leadRow.country_interest ?? "";
  ctx.phone_number = phone;
  const filled = fillTemplate(message, ctx);
  const workspaceId = conv?.workspace_id ?? leadRow.workspace_id ?? workflowWorkspaceId ?? null;
  const conversationId = conv?.chatwoot_conversation_id ?? leadRow.chatwoot_conversation_id ?? null;
  const workspace = await resolveWorkspace({ workspaceId });
  const creds = await resolveCreds(workspace);
  const sent = await sendWorkspaceMessage({
    workspace,
    creds,
    phone,
    conversationId,
    message: filled
  });
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: filled,
    sender: "workflow",
    message_type: "text",
    processed: true
  });
  return sent;
}
async function runAiWorkflowStep(step, phone, workspaceId, leadId) {
  const db = await admin();
  const { data: lead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  const leadRow = lead ?? null;
  let ctx;
  if (step.agentId && step.agentId !== DEFAULT_AGENT_ID) {
    const { data: ag } = await db.from("responder_agents").select("*").eq("id", step.agentId).maybeSingle();
    const agent = ag;
    ctx = agent ? await loadResponderContext(agent) : await loadAiContext();
  } else {
    ctx = await loadAiContext();
  }
  const history = await recentHistory(phone);
  const { reply, error } = await runResponderAgent({
    systemPrompt: ctx.systemPrompt,
    model: ctx.model,
    temperature: ctx.temperature,
    variables: ctx.variables,
    settings: ctx.settings,
    lead: leadRow,
    history,
    userMessage: String(step.instruction ?? "").trim() || "Continue the conversation with the lead.",
    provider: ctx.provider
  });
  const text = error || !reply ? null : reply.trim();
  if (text) await sendWorkflowMessage(phone, text, workspaceId);
}
async function runHttpWorkflowStep(step, phone) {
  if (!step.actionId) return;
  const db = await admin();
  const { data: ac } = await db.from("http_actions").select("*").eq("id", step.actionId).maybeSingle();
  const action = ac;
  if (!action || action.enabled === false) return;
  const ctx = {};
  const { data: customVars } = await db.from("ai_variables").select("variable_name, variable_value");
  for (const v of customVars ?? []) {
    ctx[v.variable_name] = v.variable_value;
  }
  const { data: lead } = await db.from("leads").select("*").eq("phone_number", phone).maybeSingle();
  const leadRow = lead ?? {};
  ctx.lead_name = leadRow.lead_name ?? "";
  ctx.phone_number = phone;
  const fill = (s) => fillTemplate(s, ctx);
  const fillJson = (v) => {
    if (typeof v === "string") return fill(v);
    if (Array.isArray(v)) return v.map(fillJson);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, fillJson(val)]));
    }
    return v;
  };
  const url = fill(String(action.url ?? ""));
  const headers = fillJson(action.headers ?? {});
  const method = String(action.method ?? "POST").toUpperCase();
  let body;
  const rawTemplate = String(action.payload_template ?? "");
  if (rawTemplate.trim()) {
    try {
      body = JSON.stringify(JSON.parse(fill(rawTemplate)));
    } catch {
      body = fill(rawTemplate);
    }
  }
  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body && !["GET", "HEAD"].includes(method) ? body : void 0
    });
  } catch (e) {
    console.error("Workflow HTTP step failed:", e);
  }
}
async function runBookingWorkflowStep(step, phone, workspaceId) {
  const db = await admin();
  const { data: lead } = await db.from("leads").select("lead_name").eq("phone_number", phone).maybeSingle();
  const days = Math.max(1, Math.min(90, Number(step.daysAhead) || 3));
  const when = new Date(Date.now() + days * 864e5);
  await upsertLeadBooking(db, {
    phone,
    leadName: lead?.lead_name ?? null,
    date: when.toISOString(),
    status: "pending",
    notes: String(step.notes ?? "") || "Booked automatically by workflow."
  });
  const label = when.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  await sendWorkflowMessage(
    phone,
    `Great news! I've booked your ${String(step.appointmentType ?? "consultation")} for ${label}. 🎉`,
    workspaceId
  );
}
async function executeWorkflowStep(step, phone, workspaceId, leadId, enrId) {
  if (!step) return;
  switch (step.kind) {
    case "call_workflow": {
      if (step.targetWorkflowId) {
        await enrollLeadInWorkflowById({ workflowId: step.targetWorkflowId, phone, leadId, workspaceId });
      }
      return;
    }
    case "image": {
      const body = [String(step.caption ?? ""), String(step.imageUrl ?? "")].filter(Boolean).join("\n");
      if (body) await sendWorkflowMessage(phone, body, workspaceId);
      return;
    }
    case "buttons": {
      if (step.content) await sendWorkflowMessage(phone, step.content, workspaceId);
      return;
    }
    case "ai": {
      await runAiWorkflowStep(step, phone, workspaceId);
      return;
    }
    case "http": {
      await runHttpWorkflowStep(step, phone);
      return;
    }
    case "booking": {
      await runBookingWorkflowStep(step, phone, workspaceId);
      return;
    }
    case "handoff": {
      const db = await admin();
      await db.from("conversations").update({ human_takeover: true }).eq("phone_number", phone);
      return;
    }
    case "setvar": {
      if (step.varName && enrId) {
        const db = await admin();
        const { data: enr } = await db.from("workflow_enrollments").select("context").eq("id", enrId).maybeSingle();
        const ctx = enr?.context ?? {};
        const merged = fillTemplate(String(step.varValue ?? ""), {
          ...ctx,
          phone_number: phone
        });
        ctx[String(step.varName)] = merged;
        await db.from("workflow_enrollments").update({ context: ctx }).eq("id", enrId);
      }
      return;
    }
    case "condition":
    case "wait":
    case "end": {
      return;
    }
    default: {
      if (step.content) await sendWorkflowMessage(phone, step.content, workspaceId);
    }
  }
}
async function loadResponderContext(agent) {
  const base = await loadAiContext();
  const db = await admin();
  const variables = agent.inherit_variables ? { ...base.variables } : {};
  const { data: overrides } = await db.from("responder_agent_variables").select("variable_name, variable_value").eq("agent_id", agent.id);
  for (const v of overrides ?? []) {
    variables[v.variable_name] = v.variable_value;
  }
  const mode = String(agent.provider_mode ?? "inherit");
  let provider;
  let model = String(agent.model ?? base.model);
  if (mode === "inherit") {
    provider = base.provider ?? { mode: "built_in" };
    if (provider.mode === "built_in") model = base.model;
  } else if (mode === "custom") {
    provider = {
      mode: "custom",
      custom_provider: agent.custom_provider ?? null,
      custom_base_url: agent.custom_base_url ?? null,
      custom_model: agent.custom_model ?? null,
      custom_api_key: agent.custom_api_key ?? null
    };
  } else {
    provider = { mode: "built_in" };
  }
  return {
    systemPrompt: String(agent.system_prompt ?? "You are a helpful follow-up assistant."),
    model,
    temperature: Number(agent.temperature ?? 0.7),
    variables,
    settings: base.settings,
    provider
  };
}
async function tryWorkflowResponder(params) {
  const db = await admin();
  const { data: enrollments } = await db.from("workflow_enrollments").select("id, workflow_id, status").eq("phone_number", params.phone).in("status", ["active", "reacted"]).order("updated_at", { ascending: false });
  const rows = enrollments ?? [];
  if (rows.length === 0) return null;
  for (const enr of rows) {
    const { data: wf } = await db.from("workflows").select("id, agent_id, enabled").eq("id", enr.workflow_id).maybeSingle();
    const workflow = wf;
    if (!workflow || !workflow.enabled || !workflow.agent_id) continue;
    const agentId = String(workflow.agent_id);
    let ctx;
    if (agentId === DEFAULT_AGENT_ID) {
      ctx = await loadAiContext();
    } else {
      const { data: ag } = await db.from("responder_agents").select("*").eq("id", agentId).maybeSingle();
      const agent = ag;
      if (!agent || !agent.enabled) continue;
      ctx = await loadResponderContext(agent);
    }
    await db.from("workflow_enrollments").update({ reacted: true, status: "reacted", next_run_at: null }).eq("id", enr.id);
    const history = await recentHistory(params.phone);
    const { reply, error } = await runResponderAgent({
      systemPrompt: ctx.systemPrompt,
      model: ctx.model,
      temperature: ctx.temperature,
      variables: ctx.variables,
      settings: ctx.settings,
      lead: params.lead,
      history,
      userMessage: params.message,
      provider: ctx.provider
    });
    if (error || !reply) {
      return null;
    }
    const booking = extractBookingDirective(reply);
    const cleanReply = booking.clean || reply;
    if (booking.date) {
      await upsertLeadBooking(db, {
        phone: params.phone,
        leadName: params.lead.lead_name ?? null,
        date: booking.date,
        status: booking.status,
        notes: "Set by AI responder agent."
      });
    }
    await db.from("whatsapp_messages").insert({
      phone_number: params.phone,
      message_content: cleanReply,
      sender: "ai",
      message_type: "text",
      ai_response: cleanReply,
      processed: true
    });
    await sendWorkspaceMessage({
      workspace: params.workspace,
      creds: params.creds,
      phone: params.phone,
      conversationId: params.conversationId,
      message: cleanReply
    });
    return cleanReply;
  }
  return null;
}
async function processWorkflows() {
  const raw = await rawAdmin();
  const { getDefaultSpaceId } = await import("./space-context.server-D2TjyZvs.mjs");
  const fallbackSpace = await getDefaultSpaceId();
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  let enrolled = 0;
  let sent = 0;
  const { data: workflowsData } = await raw.from("workflows").select("*").eq("enabled", true);
  const workflows = workflowsData ?? [];
  for (const wf of workflows) {
    const wfSpace = wf.space_id ?? fallbackSpace;
    enrolled += await runInSpace(wfSpace, async () => {
      const db = await admin();
      let count = 0;
      const triggerType = String(
        wf.trigger_type ?? (String(wf.trigger_segment ?? "manual") === "manual" ? "manual" : "pipeline_stage")
      );
      if (triggerType === "manual") return 0;
      const steps = await orderedSteps(wf.graph, null);
      if (steps.length === 0) return 0;
      const cfg = wf.trigger_config ?? {};
      const { data: enrolledRows } = await db.from("workflow_enrollments").select("phone_number").eq("workflow_id", wf.id);
      const enrolledSet = new Set(
        (enrolledRows ?? []).map((r) => r.phone_number)
      );
      const candidates = [];
      if (triggerType === "pipeline_stage") {
        const segment = String(cfg.segment ?? wf.trigger_segment ?? "");
        const column = PIPELINE_COLUMNS.find((c) => c.id === segment);
        if (!column) return 0;
        const { data: leadsData } = await db.from("leads").select("id, phone_number").in("qualification_status", column.stages).limit(500);
        for (const l of leadsData ?? []) candidates.push(l);
      } else if (triggerType === "booking_status") {
        const status = String(cfg.status ?? "pending");
        const { data: appts } = await db.from("appointments").select("phone_number").eq("status", status).limit(500);
        const phones = [
          ...new Set(
            (appts ?? []).map((a) => a.phone_number).filter((p) => Boolean(p))
          )
        ];
        if (phones.length === 0) return 0;
        const { data: leadsData } = await db.from("leads").select("id, phone_number").in("phone_number", phones);
        for (const l of leadsData ?? []) candidates.push(l);
      } else if (triggerType === "time_since_first_message" || triggerType === "time_since_last_message") {
        const thresholdMs = delayToMs(Number(cfg.amount ?? 0), String(cfg.unit ?? "hours"));
        if (thresholdMs <= 0) return 0;
        const cutoff = Date.now() - thresholdMs;
        const earliest = triggerType === "time_since_first_message";
        const { data: leadsData } = await db.from("leads").select("id, phone_number").limit(500);
        for (const l of leadsData ?? []) {
          if (enrolledSet.has(l.phone_number)) continue;
          const { data: msgs } = await db.from("whatsapp_messages").select("received_at").eq("phone_number", l.phone_number).order("received_at", { ascending: earliest }).limit(1);
          const ts = msgs?.[0]?.received_at;
          if (!ts) continue;
          if (new Date(ts).getTime() <= cutoff) candidates.push(l);
        }
      } else {
        return 0;
      }
      const step0 = steps[0];
      for (const lead of candidates) {
        if (enrolledSet.has(lead.phone_number)) continue;
        enrolledSet.add(lead.phone_number);
        const apptAt = step0?.anchor === "before_appointment" ? await getLeadAppointmentAt(lead.phone_number) : null;
        const runAt = stepNextRunAt(step0, null, apptAt);
        await db.from("workflow_enrollments").insert({
          workflow_id: wf.id,
          lead_id: lead.id,
          phone_number: lead.phone_number,
          current_step: 0,
          status: "active",
          next_run_at: runAt.toISOString()
        });
        count += 1;
      }
      return count;
    });
  }
  const { data: dueData } = await raw.from("workflow_enrollments").select("*").eq("status", "active").eq("reacted", false).lte("next_run_at", nowIso).limit(100);
  const due = dueData ?? [];
  for (const enr of due) {
    const wf = workflows.find((w) => w.id === enr.workflow_id);
    const enrSpace = enr.space_id ?? fallbackSpace;
    sent += await runInSpace(enrSpace, async () => {
      const db = await admin();
      if (!wf) {
        await db.from("workflow_enrollments").update({ status: "stopped" }).eq("id", enr.id);
        return 0;
      }
      const steps = await orderedSteps(wf.graph, String(enr.phone_number));
      const step = Number(enr.current_step ?? 0);
      if (step >= steps.length) {
        await db.from("workflow_enrollments").update({ status: "completed", next_run_at: null }).eq("id", enr.id);
        return 0;
      }
      await executeWorkflowStep(
        steps[step],
        String(enr.phone_number),
        wf.workspace_id ?? null,
        enr.lead_id ?? null,
        enr.id ?? null
      );
      const nextStep = step + 1;
      if (nextStep >= steps.length) {
        await db.from("workflow_enrollments").update({ current_step: nextStep, status: "completed", next_run_at: null, last_step_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", enr.id);
      } else {
        const nextStepObj = steps[nextStep];
        const goalAt = enr.goal_at ?? null;
        const apptAt = nextStepObj?.anchor === "before_appointment" ? await getLeadAppointmentAt(String(enr.phone_number)) : null;
        const runAt = stepNextRunAt(nextStepObj, goalAt, apptAt);
        await db.from("workflow_enrollments").update({
          current_step: nextStep,
          next_run_at: runAt.toISOString(),
          last_step_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", enr.id);
      }
      return 1;
    });
  }
  return { enrolled, sent };
}
async function enrollLeadInWorkflowRow(target, params) {
  const db = await admin();
  const steps = await orderedSteps(target.graph, params.phone);
  if (steps.length === 0) return { status: "no_steps", workflowId: target.id };
  if (params.workspaceId) {
    await db.from("leads").update({ workspace_id: params.workspaceId }).eq("phone_number", params.phone);
    await db.from("conversations").update({ workspace_id: params.workspaceId }).eq("phone_number", params.phone);
  }
  const workspaceId = params.workspaceId ?? target.workspace_id ?? null;
  const { data: existing } = await db.from("workflow_enrollments").select("id").eq("workflow_id", target.id).eq("phone_number", params.phone).maybeSingle();
  if (existing) return { status: "already_enrolled", workflowId: target.id };
  const goalAt = params.goalAt ?? null;
  if (params.sendNow) {
    await executeWorkflowStep(steps[0], params.phone, workspaceId, params.leadId ?? null);
    const nextStep = 1;
    if (nextStep >= steps.length) {
      await db.from("workflow_enrollments").insert({
        workflow_id: target.id,
        lead_id: params.leadId ?? null,
        phone_number: params.phone,
        current_step: nextStep,
        status: "completed",
        reacted: false,
        goal_at: goalAt,
        next_run_at: null,
        last_step_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      const nextStepObj = steps[nextStep];
      const apptAt2 = nextStepObj?.anchor === "before_appointment" ? await getLeadAppointmentAt(params.phone) : null;
      const runAt = stepNextRunAt(nextStepObj, goalAt, apptAt2);
      await db.from("workflow_enrollments").insert({
        workflow_id: target.id,
        lead_id: params.leadId ?? null,
        phone_number: params.phone,
        current_step: nextStep,
        status: "active",
        reacted: false,
        goal_at: goalAt,
        next_run_at: runAt.toISOString(),
        last_step_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    return { status: "enrolled", workflowId: target.id };
  }
  const startDelayMs = Math.max(0, params.startDelayMs ?? 0);
  const step0 = steps[0];
  const apptAt = step0?.anchor === "before_appointment" ? await getLeadAppointmentAt(params.phone) : null;
  let runAtMs = stepNextRunAt(step0, goalAt, apptAt).getTime();
  if (step0?.anchor === "wait") runAtMs += startDelayMs;
  await db.from("workflow_enrollments").insert({
    workflow_id: target.id,
    lead_id: params.leadId ?? null,
    phone_number: params.phone,
    current_step: 0,
    status: "active",
    reacted: false,
    goal_at: goalAt,
    next_run_at: new Date(runAtMs).toISOString()
  });
  return { status: "enrolled", workflowId: target.id };
}
async function enrollLeadInWorkflowByName(params) {
  const db = await admin();
  const { data: rows } = await db.from("workflows").select("*").eq("enabled", true);
  const workflows = rows ?? [];
  const target = workflows.find(
    (w) => String(w.name ?? "").trim().toLowerCase() === params.workflowName.trim().toLowerCase()
  );
  if (!target) return { status: "no_workflow" };
  return enrollLeadInWorkflowRow(target, params);
}
async function enrollLeadInWorkflowById(params) {
  const db = await admin();
  const { data: row } = await db.from("workflows").select("*").eq("id", params.workflowId).eq("enabled", true).maybeSingle();
  const target = row;
  if (!target) return { status: "no_workflow" };
  return enrollLeadInWorkflowRow(target, params);
}
function buildTemplateGraph(steps) {
  const nodes = [
    { id: "trigger", type: "trigger", position: { x: 80, y: 20 }, data: { label: "Trigger" } }
  ];
  const edges = [];
  let prev = "trigger";
  steps.forEach((s, i) => {
    const id = `m${i + 1}`;
    nodes.push({
      id,
      type: "message",
      position: { x: 80, y: 140 + i * 130 },
      data: {
        content: s.content,
        delayValue: s.delayValue,
        delayUnit: s.delayUnit,
        // keep delayMinutes for backward-compatible readers
        delayMinutes: Math.round(s.delayValue * (UNIT_SECONDS[s.delayUnit] ?? 60) / 60),
        index: i
      }
    });
    edges.push({ id: `e-${prev}-${id}`, source: prev, target: id });
    prev = id;
  });
  return { nodes, edges };
}
async function ensureMeetingOutcomeWorkflows() {
  const db = await admin();
  const { data: rows } = await db.from("workflows").select("name");
  const existing = new Set(
    (rows ?? []).map((r) => String(r.name ?? "").trim().toLowerCase())
  );
  let created = 0;
  for (const tpl of MEETING_OUTCOME_TEMPLATES) {
    if (existing.has(tpl.name.trim().toLowerCase())) continue;
    await db.from("workflows").insert({
      name: tpl.name,
      description: tpl.description,
      workspace_id: null,
      agent_id: DEFAULT_AGENT_ID,
      trigger_type: "manual",
      trigger_segment: "manual",
      trigger_config: {},
      enabled: true,
      graph: buildTemplateGraph(tpl.steps)
    });
    created += 1;
  }
  return { created };
}
const PHONE_DIGITS = (p) => String(p ?? "").replace(/@.*$/, "").replace(/[^0-9]/g, "");
function renderCampaignTemplate(template, recipient) {
  const name = (recipient.name ?? "").trim();
  const firstName = name ? name.split(/\s+/)[0] : "";
  const data = {
    name,
    full_name: name,
    first_name: firstName,
    phone: recipient.phone_number,
    phone_number: recipient.phone_number,
    ...recipient.merge_data ?? {}
  };
  return String(template ?? "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key) => {
    const v = data[key];
    return v === void 0 || v === null ? "" : String(v);
  });
}
async function stopCampaignsForPhone(phone) {
  try {
    const db = await admin();
    const digits = PHONE_DIGITS(phone);
    const { data: rows } = await db.from("campaign_recipients").select("id, phone_number, status").in("status", ["pending", "sent", "delivered", "opened"]);
    const matches = (rows ?? []).filter((r) => {
      const d = PHONE_DIGITS(r.phone_number);
      return d && (d === digits || d.endsWith(digits) || digits.endsWith(d));
    });
    if (matches.length === 0) return;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    await db.from("campaign_recipients").update({ status: "replied", replied_at: nowIso }).in(
      "id",
      matches.map((m) => m.id)
    );
  } catch (e) {
    console.error("stopCampaignsForPhone failed:", e);
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function deliverCampaignMessage(params) {
  const db = await admin();
  const { phone, message } = params;
  let { data: lead } = await db.from("leads").select("id, chatwoot_conversation_id, workspace_id").eq("phone_number", phone).maybeSingle();
  if (!lead) {
    lead = await getOrCreateLead(phone, null, null, params.workspaceId ?? null);
  }
  const { data: conv } = await db.from("conversations").select("id, chatwoot_conversation_id, workspace_id").eq("phone_number", phone).maybeSingle();
  const leadRow = lead ?? {};
  const convRow = conv ?? null;
  const effectiveWorkspaceId = params.workspaceId ?? convRow?.workspace_id ?? leadRow.workspace_id ?? null;
  const workspace = await resolveWorkspace({ workspaceId: effectiveWorkspaceId });
  const creds = await resolveCreds(workspace);
  let conversationId = convRow?.chatwoot_conversation_id ?? leadRow.chatwoot_conversation_id ?? null;
  if (workspace && workspace.provider_type !== "evolution" && !conversationId) {
    conversationId = await createChatwootConversation({
      creds,
      inboxId: workspace.chatwoot_inbox_id ?? null,
      phone,
      name: params.name ?? null
    });
  }
  if (!convRow) {
    await db.from("conversations").insert({
      phone_number: phone,
      lead_id: leadRow.id ?? null,
      workspace_id: workspace?.id ?? null,
      chatwoot_conversation_id: conversationId,
      status: "open",
      human_takeover: false
    });
  } else if (workspace?.id && (!convRow.workspace_id || conversationId && !convRow.chatwoot_conversation_id)) {
    await db.from("conversations").update({ workspace_id: workspace.id, chatwoot_conversation_id: conversationId }).eq("phone_number", phone);
  }
  const sent = await sendWorkspaceMessage({ workspace, creds, phone, conversationId, message });
  await db.from("whatsapp_messages").insert({
    phone_number: phone,
    message_content: message,
    sender: "campaign",
    message_type: "text",
    processed: true
  });
  if (!sent.ok) {
    return { ok: false, error: sent.error ?? "delivery failed" };
  }
  return { ok: true };
}
function nowInTimezone(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz || "UTC",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(/* @__PURE__ */ new Date());
    const map = {};
    for (const p of parts) map[p.type] = p.value;
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const day = dayMap[map.weekday] ?? (/* @__PURE__ */ new Date()).getUTCDay();
    let hour = Number(map.hour);
    if (hour === 24) hour = 0;
    const minutes = hour * 60 + Number(map.minute);
    return { day, minutes };
  } catch {
    const d = /* @__PURE__ */ new Date();
    return { day: d.getUTCDay(), minutes: d.getUTCHours() * 60 + d.getUTCMinutes() };
  }
}
const hhmmToMinutes = (s) => {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s));
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};
function withinSendSchedule(c) {
  const days = c.send_days ?? [0, 1, 2, 3, 4, 5, 6];
  const tz = String(c.send_timezone ?? "UTC");
  const { day, minutes } = nowInTimezone(tz);
  if (Array.isArray(days) && days.length > 0 && !days.includes(day)) return false;
  const start = hhmmToMinutes(c.send_window_start);
  const end = hhmmToMinutes(c.send_window_end);
  if (start === null || end === null) return true;
  if (start === end) return true;
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}
async function processCampaigns() {
  const db = await rawAdmin();
  const { getDefaultSpaceId } = await import("./space-context.server-D2TjyZvs.mjs");
  const fallbackSpace = await getDefaultSpaceId();
  const now = Date.now();
  (/* @__PURE__ */ new Date()).toISOString();
  const startBudget = Date.now();
  const TIME_BUDGET_MS = 5e4;
  const { data: camps } = await db.from("campaigns").select("*").in("status", ["scheduled", "running"]).order("last_batch_at", { ascending: true, nullsFirst: true }).limit(20);
  let campaignsTouched = 0;
  let totalSent = 0;
  for (const c of camps ?? []) {
    if (Date.now() - startBudget > TIME_BUDGET_MS) break;
    const id = String(c.id);
    const spaceId = c.space_id ?? fallbackSpace;
    const startAt = c.start_at ? new Date(String(c.start_at)).getTime() : null;
    const endAt = c.end_at ? new Date(String(c.end_at)).getTime() : null;
    if (endAt !== null && now > endAt) {
      await db.from("campaigns").update({ status: "completed" }).eq("id", id);
      continue;
    }
    if (startAt !== null && now < startAt) continue;
    if (!withinSendSchedule(c)) continue;
    const batchBreakSeconds = Math.min(Math.max(0, Number(c.batch_break_seconds) || 0), 86400);
    const lastBatchAt = c.last_batch_at ? new Date(String(c.last_batch_at)).getTime() : null;
    if (batchBreakSeconds > 0 && lastBatchAt !== null && now - lastBatchAt < batchBreakSeconds * 1e3) {
      continue;
    }
    if (c.status === "scheduled") {
      await db.from("campaigns").update({ status: "running" }).eq("id", id);
    }
    const batchSize = Math.min(Math.max(1, Number(c.batch_size) || 25), 100);
    const delaySeconds = Math.min(Math.max(0, Number(c.delay_seconds) || 0), 5);
    const workspaceId = c.workspace_id ?? null;
    const template = String(c.message_template ?? "");
    const variations = (c.message_variations ?? []).filter((v) => String(v ?? "").trim());
    const templatePool = [template, ...variations].filter((t) => String(t ?? "").trim());
    const pool = templatePool.length > 0 ? templatePool : [template];
    const { data: pending } = await db.from("campaign_recipients").select("id, phone_number, name, merge_data").eq("campaign_id", id).eq("status", "pending").order("created_at", { ascending: true }).limit(batchSize);
    const batch = pending ?? [];
    if (batch.length === 0) {
      await db.from("campaigns").update({ status: "completed" }).eq("id", id);
      continue;
    }
    campaignsTouched += 1;
    for (let bi = 0; bi < batch.length; bi++) {
      const r = batch[bi];
      if (Date.now() - startBudget > TIME_BUDGET_MS) break;
      const rid = String(r.id);
      const phone = String(r.phone_number);
      const chosenTemplate = pool[(totalSent + bi) % pool.length];
      const message = renderCampaignTemplate(chosenTemplate, {
        name: r.name ?? null,
        phone_number: phone,
        merge_data: r.merge_data ?? null
      });
      const result = await runInSpace(
        spaceId,
        () => deliverCampaignMessage({
          phone,
          message,
          workspaceId,
          name: r.name ?? null
        })
      );
      await db.from("campaign_recipients").update({
        status: result.ok ? "sent" : "failed",
        sent_at: (/* @__PURE__ */ new Date()).toISOString(),
        error: result.ok ? null : result.error ?? "delivery failed",
        attempts: (Number(r.attempts) || 0) + 1
      }).eq("id", rid);
      if (result.ok) totalSent += 1;
      if (delaySeconds > 0) await sleep(delaySeconds * 1e3);
    }
    await db.from("campaigns").update({ last_batch_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", id);
    const { count } = await db.from("campaign_recipients").select("id", { count: "exact", head: true }).eq("campaign_id", id).eq("status", "pending");
    if ((count ?? 0) === 0) {
      await db.from("campaigns").update({ status: "completed" }).eq("id", id);
    }
  }
  return { campaigns: campaignsTouched, sent: totalSent };
}
export {
  applyDecision,
  createChatwootConversation,
  deliverCampaignMessage,
  deliverHumanMessage,
  enrollLeadInWorkflowById,
  enrollLeadInWorkflowByName,
  ensureMeetingOutcomeWorkflows,
  getOrCreateLead,
  loadAiContext,
  orderedSteps,
  processCampaigns,
  processInboundMessage,
  processScheduledMessages,
  processWorkflows,
  recentHistory,
  renderCampaignTemplate,
  resolveCreds,
  resolveWorkspace,
  runInSpace,
  sendChatwootReply,
  sendEvolutionReply,
  sendWabaReply,
  sendWorkspaceMessage,
  stepNextRunAt,
  stopCampaignsForPhone,
  toEvolutionNumber
};
