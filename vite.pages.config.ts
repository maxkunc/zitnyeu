// Standalone Vite config for the GitHub Pages target: a plain client-only (CSR) build of the
// same routes/components, bypassing TanStack Start's SSR plugin and Nitro entirely. GitHub Pages
// only serves static files, so this produces a static SPA instead of the Cloudflare Worker build
// that `vite.config.ts` / `bun run build` produces. Run via `bun run build:pages`.
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/zitnyeu/",
  css: { transformer: "lightningcss" },
  plugins: [tailwindcss(), tsConfigPaths({ projects: ["./tsconfig.json"] }), react()],
  build: {
    outDir: "dist-pages",
    rollupOptions: {
      input: resolve(__dirname, "pages.html"),
    },
  },
  define: {
    __STATIC_SPA__: JSON.stringify(true),
  },
});
