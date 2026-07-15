// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { createRequire } from "node:module";
import type { Plugin } from "vite";

const require = createRequire(import.meta.url);
const eventsPolyfillPath = require.resolve("events/events.js");

function browserEventsPolyfill(): Plugin {
  return {
    name: "browser-events-polyfill",
    enforce: "pre",
    resolveId(source) {
      if (source === "events" || source === "node:events") {
        return eventsPolyfillPath;
      }
      return null;
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [browserEventsPolyfill()],
    resolve: {
      alias: {
        // @twilio/voice-sdk imports node's `events` module in browser code.
        // Force both bare and node: specifiers to the browser-safe polyfill
        // before Vite can replace Node built-ins with browser externals.
        events: eventsPolyfillPath,
        "node:events": eventsPolyfillPath,
      },
    },
    optimizeDeps: {
      include: ["events", "events/events.js"],
    },
  },
});
