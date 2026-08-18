import { createFileRoute } from "@tanstack/react-router";

// Called every minute by pg_cron to enroll leads into orchestration workflows
// and advance any message sequences that are due.
// Authenticated with the project's anon key in the `apikey` header.
export const Route = createFileRoute("/api/public/process-workflows")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const expected = process.env.WEBHOOK_SECRET || "local-dev-webhook-secret";
        if (apiKey !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const { processWorkflows } = await import("@/lib/admissions.server");
          const result = await processWorkflows();
          return new Response(JSON.stringify({ ok: true, ...result }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("Workflow processing error:", e);
          return new Response(JSON.stringify({ ok: false, error: "processing_failed" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
