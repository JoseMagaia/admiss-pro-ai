const BUCKET = "message-media";

function pathFromMediaUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const marker = "/api/public/media/";
    const index = parsed.pathname.indexOf(marker);
    if (index < 0) return null;
    return parsed.pathname
      .slice(index + marker.length)
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/");
  } catch {
    return null;
  }
}

export async function loadMessageMedia(input: { path?: string | null; url?: string | null }) {
  const path = input.path ?? (input.url ? pathFromMediaUrl(input.url) : null);
  if (path && !path.includes("..")) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
    if (!error && data) return { blob: data, path };
  }
  if (!input.url) throw new Error("Attachment has no readable storage path.");
  const response = await fetch(input.url);
  if (!response.ok) throw new Error(`Attachment download failed (${response.status}).`);
  return { blob: await response.blob(), path: null };
}

export async function storeMessageMedia(input: {
  bytes: ArrayBuffer;
  mime: string;
  filename: string;
  folder?: string;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const safe = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "attachment";
  const folder = input.folder ?? new Date().toISOString().slice(0, 10);
  const path = `${folder}/${crypto.randomUUID()}-${safe}`;
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, new Uint8Array(input.bytes), { contentType: input.mime, upsert: false });
  if (error) throw new Error(error.message);
  const { data, error: signError } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signError || !data?.signedUrl) throw new Error(signError?.message ?? "Failed to create media URL.");
  return { path, url: data.signedUrl, filename: safe };
}
