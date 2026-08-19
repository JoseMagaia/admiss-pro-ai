import { createFileRoute } from "@tanstack/react-router";

// Public, token-free media proxy for chat attachments.
//
// WhatsApp providers (Meta Cloud API, Evolution) download attachments by URL.
// Signed storage URLs carry a long query string and expire, which makes some
// providers fall back to delivering the raw link as text instead of rendering
// the media. This route serves the same private-bucket object behind a clean,
// stable URL. Paths contain a random UUID, so they are unguessable capability
// URLs — the bucket itself stays private.
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = String((params as { _splat?: string })._splat ?? "").replace(/^\/+/, "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("message-media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        const bytes = await data.arrayBuffer();
        const filename = path.split("/").pop() ?? "attachment";
        return new Response(bytes, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Content-Length": String(bytes.byteLength),
            "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
