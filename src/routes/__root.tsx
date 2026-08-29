import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

// The Cloudflare build serves from the real domain; the static GitHub Pages build serves
// from a subpath on a different host — og:image/twitter:image need an absolute URL to work
// reliably in link-preview crawlers, so pick the right origin per build target.
const SITE_URL = __STATIC_SPA__ ? "https://maxkunc.github.io/zitnyeu" : "https://zitny.eu";
const BASE = import.meta.env.BASE_URL;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "zitny.eu — Cesta mladých k hvězdám" },
      {
        name: "description",
        content:
          "Vesmírné projekty, satelity, stratosférické mise a vzdělávací workshopy pod patronací ESA.",
      },
      { name: "author", content: "zitny.eu" },
      { name: "theme-color", content: "#00b0ff" },
      { property: "og:title", content: "zitny.eu — Cesta mladých k hvězdám" },
      {
        property: "og:description",
        content:
          "Vesmírné projekty, satelity, stratosférické mise a vzdělávací workshopy pod patronací ESA.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "zitny.eu — Cesta mladých k hvězdám" },
      {
        name: "twitter:description",
        content:
          "Vesmírné projekty, satelity, stratosférické mise a vzdělávací workshopy pod patronací ESA.",
      },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: `${BASE}favicon.svg` },
      { rel: "icon", type: "image/png", sizes: "32x32", href: `${BASE}favicon-32x32.png` },
      { rel: "apple-touch-icon", sizes: "180x180", href: `${BASE}apple-touch-icon.png` },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  // The static GitHub Pages build (vite.pages.config.ts) renders into its own pages.html
  // instead, so the SSR document shell doesn't apply there — see RootComponent below.
  shellComponent: __STATIC_SPA__ ? undefined : RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Without shellComponent, nothing else renders <HeadContent/> — React 19 hoists the
          <title>/<meta>/<link> tags it renders into <head> regardless of nesting. */}
      {__STATIC_SPA__ && <HeadContent />}
      {/* Fixed (scroll-independent) so the same subtle texture continues under every
          section — nothing to "run out" of at a section boundary. */}
      <div className="fixed inset-0 -z-10 grid-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 -z-10 starfield opacity-25 pointer-events-none" />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
