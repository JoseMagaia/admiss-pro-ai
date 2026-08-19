import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type WabaTemplateComponent = {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  buttons?: Array<{ type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER"; text: string; url?: string; phone_number?: string }>;
};

export type WabaTemplateRow = {
  id: string;
  workspace_id: string;
  meta_template_id: string | null;
  name: string;
  language: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  status: string;
  rejection_reason: string | null;
  components: WabaTemplateComponent[];
  submitted_at: string | null;
  last_synced_at: string | null;
  created_at: string;
};

export const listWabaTemplates = createServerFn({ method: "GET" }).handler(async () => {
  const { assertRole } = await import("@/integrations/supabase/role-guard.server");
  await assertRole(["super_admin", "admin"]);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { resolveSpaceContext, makeScopedClient, NO_SPACE } = await import("./space-context.server");
  const context = await resolveSpaceContext();
  const db = makeScopedClient(supabaseAdmin, context?.spaceId ?? NO_SPACE);
  const [{ data: templates, error }, { data: workspaces }] = await Promise.all([
    db.from("waba_templates").select("*").order("created_at", { ascending: false }),
    db
      .from("chatwoot_workspaces")
      .select("id, name, provider_type, enabled")
      .eq("provider_type", "whatsapp_cloud")
      .eq("enabled", true)
      .order("name"),
  ]);
  return { templates: templates ?? [], workspaces: workspaces ?? [], error: error?.message ?? null };
});

export const saveWabaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        workspaceId: z.string().uuid(),
        name: z.string().trim().regex(/^[a-z0-9_]+$/).max(512),
        language: z.string().trim().min(2).max(20),
        category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
        components: z.array(z.record(z.string(), z.unknown())).min(1).max(4),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { assertRole, getRequestUser } = await import("@/integrations/supabase/role-guard.server");
    await assertRole(["super_admin", "admin"]);
    const user = await getRequestUser();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveSpaceContext, makeScopedClient, NO_SPACE } = await import("./space-context.server");
    const context = await resolveSpaceContext();
    const db = makeScopedClient(supabaseAdmin, context?.spaceId ?? NO_SPACE);
    const payload = {
      workspace_id: data.workspaceId,
      name: data.name,
      language: data.language,
      category: data.category,
      components: data.components,
      status: "DRAFT",
      created_by: user?.userId ?? null,
      rejection_reason: null,
    };
    const query = data.id
      ? db.from("waba_templates").update(payload as never).eq("id", data.id)
      : db.from("waba_templates").insert(payload as never);
    const { data: row, error } = await query.select("*").single();
    return { ok: !error, template: row ?? null, error: error?.message ?? null };
  });

export const submitWabaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    await assertRole(["super_admin", "admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveSpaceContext, makeScopedClient, NO_SPACE } = await import("./space-context.server");
    const context = await resolveSpaceContext();
    const db = makeScopedClient(supabaseAdmin, context?.spaceId ?? NO_SPACE);
    const { data: template, error: readError } = await db.from("waba_templates").select("*").eq("id", data.id).single();
    if (readError || !template) return { ok: false, error: readError?.message ?? "Template not found." };
    const { data: workspace } = await db
      .from("chatwoot_workspaces")
      .select("wa_business_account_id, wa_access_token")
      .eq("id", template.workspace_id)
      .single();
    const accountId = String(workspace?.wa_business_account_id ?? "").trim();
    const token = String(workspace?.wa_access_token ?? "").trim();
    if (!accountId || !token) return { ok: false, error: "This WABA inbox is missing its business account ID or access token." };
    const response = await fetch(`https://graph.facebook.com/v21.0/${encodeURIComponent(accountId)}/message_templates`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: template.name,
        language: template.language,
        category: template.category,
        components: template.components,
      }),
    });
    const result = (await response.json().catch(() => ({}))) as { id?: string; status?: string; error?: { message?: string } };
    if (!response.ok) return { ok: false, error: result.error?.message ?? `Meta rejected the template (${response.status}).` };
    const now = new Date().toISOString();
    await db
      .from("waba_templates")
      .update({ meta_template_id: result.id ?? null, status: result.status ?? "PENDING", submitted_at: now, last_synced_at: now } as never)
      .eq("id", data.id);
    return { ok: true, error: null };
  });

export const syncWabaTemplates = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ workspaceId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    await assertRole(["super_admin", "admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveSpaceContext, makeScopedClient, NO_SPACE } = await import("./space-context.server");
    const context = await resolveSpaceContext();
    const db = makeScopedClient(supabaseAdmin, context?.spaceId ?? NO_SPACE);
    const { data: workspace } = await db
      .from("chatwoot_workspaces")
      .select("wa_business_account_id, wa_access_token")
      .eq("id", data.workspaceId)
      .single();
    const accountId = String(workspace?.wa_business_account_id ?? "").trim();
    const token = String(workspace?.wa_access_token ?? "").trim();
    if (!accountId || !token) return { ok: false, error: "This WABA inbox is not fully configured." };
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(accountId)}/message_templates?fields=id,name,language,category,status,rejected_reason,components&limit=250`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const result = (await response.json().catch(() => ({}))) as {
      data?: Array<Record<string, unknown>>;
      error?: { message?: string };
    };
    if (!response.ok) return { ok: false, error: result.error?.message ?? `Meta sync failed (${response.status}).` };
    const now = new Date().toISOString();
    for (const item of result.data ?? []) {
      const name = String(item.name ?? "");
      const language = String(item.language ?? "en_US");
      if (!name) continue;
      await db.from("waba_templates").upsert(
        {
          workspace_id: data.workspaceId,
          meta_template_id: item.id ? String(item.id) : null,
          name,
          language,
          category: String(item.category ?? "UTILITY"),
          status: String(item.status ?? "PENDING"),
          rejection_reason: item.rejected_reason ? String(item.rejected_reason) : null,
          components: Array.isArray(item.components) ? item.components : [],
          last_synced_at: now,
        } as never,
        { onConflict: "workspace_id,name,language" },
      );
    }
    return { ok: true, count: result.data?.length ?? 0, error: null };
  });

export const deleteWabaTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { assertRole } = await import("@/integrations/supabase/role-guard.server");
    await assertRole(["super_admin", "admin"]);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { resolveSpaceContext, makeScopedClient, NO_SPACE } = await import("./space-context.server");
    const context = await resolveSpaceContext();
    const db = makeScopedClient(supabaseAdmin, context?.spaceId ?? NO_SPACE);
    const { data: template } = await db.from("waba_templates").select("meta_template_id, workspace_id, name").eq("id", data.id).single();
    if (!template) return { ok: false, error: "Template not found." };
    if (template.meta_template_id) {
      const { data: workspace } = await db
        .from("chatwoot_workspaces")
        .select("wa_business_account_id, wa_access_token")
        .eq("id", template.workspace_id)
        .single();
      const accountId = String(workspace?.wa_business_account_id ?? "").trim();
      const token = String(workspace?.wa_access_token ?? "").trim();
      if (accountId && token) {
        const response = await fetch(
          `https://graph.facebook.com/v21.0/${encodeURIComponent(accountId)}/message_templates?name=${encodeURIComponent(template.name)}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) {
          const result = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
          return { ok: false, error: result.error?.message ?? "Meta could not delete this template." };
        }
      }
    }
    const { error } = await db.from("waba_templates").delete().eq("id", data.id);
    return { ok: !error, error: error?.message ?? null };
  });
