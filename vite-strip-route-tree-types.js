// @tanstack/start-plugin-core always appends a TS-only footer to the generated route tree
// (`import type { getRouter } ...` / `declare module '@tanstack/react-start' { ... }`) for its
// Register-type augmentation, regardless of the router.disableTypes setting — there's no
// documented flag to suppress it. Since it's pure type-level code with zero runtime effect,
// strip it at transform time so plain JS tooling (esbuild/rollup) can parse the file.
export function stripRouteTreeTypesPlugin() {
  return {
    name: "strip-route-tree-types",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("routeTree.gen.js")) return null;
      const stripped = code.replace(/\nimport type [\s\S]*$/, "\n");
      return stripped === code ? null : stripped;
    },
  };
}
