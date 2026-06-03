import { createFileRoute } from "@tanstack/react-router";

// Called every minute by pg_cron to deliver any scheduled messages that are due.
// Authenticated with the project's anon key in the `apikey` header.
export const Route = createFileRoute("/api/public/process-scheduled-messages")({
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
          const { processScheduledMessages } = await import("@/lib/admissions.server");
          const result = await processScheduledMessages();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Scheduled message processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
