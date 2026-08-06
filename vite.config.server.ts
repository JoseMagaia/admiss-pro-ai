// Self-hosted production build (full SSR + server functions + local PGlite).
// Produces a runnable Node server in dist-server/ (Nitro `node-server` preset).
// The default vite.config.ts targets static hosting for Freebuff and is left
// untouched; this config is used explicitly by `bun run build:server`.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { resolve } from "node:path";

export default defineConfig({
  vite: {
    resolve: {
      // Same Twilio browser-bundle alias as vite.config.ts (client hook imports
      // the pre-bundled dist file which the package exports map blocks directly).
      alias: {
        "@twilio/voice-sdk/dist/twilio.js": resolve(
          process.cwd(),
          "node_modules/@twilio/voice-sdk/dist/twilio.js",
        ),
      },
    },
  },
  nitro: {
    preset: "node-server",
    output: {
      dir: "dist-server",
      serverDir: "dist-server/server",
      publicDir: "dist-server/public",
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
  },
});
