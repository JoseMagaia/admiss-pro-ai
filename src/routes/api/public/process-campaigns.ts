import { createFileRoute } from "@tanstack/react-router";

// Called every minute by pg_cron to advance running drip campaigns: it sends the
// next due batch of recipients for each campaign, honoring batch size, delays and
// start/end windows. Authenticated with the project's anon key in `apikey`.
export const Route = createFileRoute("/api/public/process-campaigns")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (expected && apiKey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { processCampaigns } = await import("@/lib/admissions.server");
          const result = await processCampaigns();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Campaign processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
