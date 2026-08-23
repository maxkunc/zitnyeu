// Client-only entry point for the static GitHub Pages build (see vite.pages.config.ts).
// The Cloudflare/TanStack Start build renders through src/server.ts instead; this file is
// never bundled there.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

const router = getRouter();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
