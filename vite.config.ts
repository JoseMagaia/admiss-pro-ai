// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";

// Freebuff hosting serves `dist/` as a static site and runs a bare `vite build`.
// The Nitro output places client assets under dist/client with no dist/index.html,
// which makes the static host return 404. This plugin runs after the Nitro build
// (closeBundle) to copy the client assets to the dist/ root and generate a
// dist/index.html that bootstraps the TanStack Start client bundle.
function staticDistPostbuild(): Plugin {
  return {
    name: "static-dist-postbuild",
    apply: "build",
    closeBundle: {
      sequential: true,
      async handler() {
        const distRoot = join(process.cwd(), "dist");
        const clientDir = join(distRoot, "client");
        const serverDir = join(distRoot, "server");

        // Nitro output is not present yet during the earlier client/SSR phases.
        if (!existsSync(clientDir) || !existsSync(join(clientDir, "assets"))) return;

        // 1. Copy client assets to the dist root.
        cpSync(clientDir, distRoot, { recursive: true });

        // 2. Extract the client entry from the TanStack Start route manifest.
        let clientEntry: string | null = null;
        const serverAssetsDir = join(serverDir, "assets");
        if (existsSync(serverAssetsDir)) {
          for (const name of readdirSync(serverAssetsDir)) {
            if (name.startsWith("_tanstack-start-manifest_") && name.endsWith(".js")) {
              const content = readFileSync(join(serverAssetsDir, name), "utf8");
              const m = content.match(/clientEntry:\s*"([^"]+)"/);
              if (m) clientEntry = m[1];
              break;
            }
          }
        }

        // 3. Fallback: the largest index-*.js chunk is usually the framework entry.
        const assetsDir = join(distRoot, "assets");
        if (!clientEntry && existsSync(assetsDir)) {
          const candidates = readdirSync(assetsDir)
            .filter((n) => n.startsWith("index-") && n.endsWith(".js"))
            .map((n) => ({ name: n, size: readFileSync(join(assetsDir, n)).length }))
            .sort((a, b) => b.size - a.size);
          if (candidates.length > 0) clientEntry = "/assets/" + candidates[0].name;
        }

        if (!clientEntry) {
          console.error("[static-dist-postbuild] Could not determine client entry — index.html not generated");
          return;
        }

        // 4. Locate the global stylesheet.
        let globalCss: string | null = null;
        if (existsSync(assetsDir)) {
          for (const name of readdirSync(assetsDir)) {
            if (name.startsWith("styles-") && name.endsWith(".css")) {
              globalCss = "/assets/" + name;
              break;
            }
          }
        }

        const entry = clientEntry.startsWith("/") ? clientEntry : "/" + clientEntry;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>fliq — AI Lead Generation & Appointment Platform</title>
  <meta name="description" content="WhatsApp-powered AI that captures and qualifies leads 24/7 and books appointments straight into your calendar." />
${globalCss ? `  <link rel="stylesheet" href="${globalCss}" />` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap" />
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${entry}"></script>
</body>
</html>`;
        writeFileSync(join(distRoot, "index.html"), html, "utf8");
        console.log("[static-dist-postbuild] ✓ dist/index.html generated (entry:", entry + ")");
      },
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [staticDistPostbuild()],
    resolve: {
      // Twilio's ESM entry imports Node's `events`, which Vite externalizes
      // during browser builds. Point only this client import at Twilio's
      // pre-bundled browser distribution instead of polyfilling Node globally.
      alias: {
        "@twilio/voice-sdk/dist/twilio.js": resolve(
          process.cwd(),
          "node_modules/@twilio/voice-sdk/dist/twilio.js",
        ),
      },
    },
  },
  // Keep the production artifact in the directory expected by managed hosting.
  // The config package uses this layout automatically inside the sandbox, but
  // deployment builds run outside that environment unless it is explicit.
  nitro: {
    preset: "cloudflare-module",
    output: {
      dir: "dist",
      serverDir: "dist/server",
      publicDir: "dist/client",
    },
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
