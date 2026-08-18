// Module-boot audit: import every server lib + public route so module-level
// errors (bad imports, undefined refs at load, circular deps) surface.
async function main() {
  const mods: Array<[string, () => Promise<unknown>]> = [
    ["admissions.server", () => import("../src/lib/admissions.server")],
    ["dashboard.functions", () => import("../src/lib/dashboard.functions")],
    ["calendar.functions", () => import("../src/lib/calendar.functions")],
    ["calls.functions", () => import("../src/lib/calls.functions")],
    ["advanced.functions", () => import("../src/lib/advanced.functions")],
    ["orchestration", () => import("../src/lib/orchestration")],
    ["ai-engine.server", () => import("../src/lib/ai-engine.server")],
    ["pipelines.functions", () => import("../src/lib/pipelines.functions")],
    ["campaigns.functions", () => import("../src/lib/campaigns.functions")],
    ["spaces.functions", () => import("../src/lib/spaces.functions")],
    ["auth.functions", () => import("../src/lib/auth.functions")],
    ["space-context.server", () => import("../src/lib/space-context.server")],
    ["waba-webhook route", () => import("../src/routes/api/public/waba-webhook")],
    ["evolution-webhook route", () => import("../src/routes/api/public/evolution-webhook")],
    ["chatwoot-webhook route", () => import("../src/routes/api/public/chatwoot-webhook")],
    ["process-workflows route", () => import("../src/routes/api/public/process-workflows")],
    ["process-campaigns route", () => import("../src/routes/api/public/process-campaigns")],
    ["process-scheduled-messages route", () => import("../src/routes/api/public/process-scheduled-messages")],
  ];
  let failed = 0;
  for (const [name, fn] of mods) {
    try {
      await fn();
      console.log(`OK   ${name}`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${name}: ${(e as Error).message}`);
    }
  }
  if (failed > 0) {
    console.error(`${failed} module(s) failed to boot`);
    process.exit(1);
  }
  console.log("ALL MODULES BOOT OK");
}

main().catch((e) => {
  console.error("AUDIT FAIL:", e);
  process.exit(1);
});
