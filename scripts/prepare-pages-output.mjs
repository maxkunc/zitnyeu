// Finishes the dist-pages/ output from `vite build --config vite.pages.config.ts` for
// GitHub Pages: renames the built pages.html to index.html, copies it to 404.html so
// unknown paths still load the SPA shell (client-side router then renders the right
// route from location.pathname), and adds .nojekyll so GitHub doesn't run Jekyll over it.
import { copyFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = "dist-pages";
renameSync(join(outDir, "pages.html"), join(outDir, "index.html"));
copyFileSync(join(outDir, "index.html"), join(outDir, "404.html"));
writeFileSync(join(outDir, ".nojekyll"), "");
