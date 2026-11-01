// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
//
// No TypeScript in this project: the wrapper's built-in "@" alias normally comes from
// vite-tsconfig-paths reading tsconfig.json's `paths`, which we don't have. It degrades to a
// harmless no-op without one, so we set the alias explicitly below instead.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { stripRouteTreeTypesPlugin } from "./vite-strip-route-tree-types.js";

// Redirect TanStack Start's bundled server entry to src/server.js (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  plugins: [stripRouteTreeTypesPlugin()],
  tanstackStart: {
    server: { entry: "server" },
    // Plain-JS route tree (no "as any" casts, no .ts extension) — see src/routeTree.gen.js.
    router: { disableTypes: true },
  },
  vite: {
    resolve: {
      alias: { "@": path.resolve(import.meta.dirname, "src") },
    },
    // __STATIC_SPA__ is only ever true in the separate static build (vite.pages.config.js),
    // which doesn't go through this config at all. Defined here as false so the shared
    // src/routes/__root.jsx can reference it unconditionally.
    define: {
      __STATIC_SPA__: JSON.stringify(false),
    },
  },
});
