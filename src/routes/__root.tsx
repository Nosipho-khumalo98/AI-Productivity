import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../lib/theme";
import { AppLayout } from "../components/app-layout";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md gradient-brand px-4 py-2 text-sm font-medium text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing the page.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md gradient-brand px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Workplace AI Assistant — Email, Meetings & Tasks" },
      {
        name: "description",
        content:
          "Enterprise AI productivity suite: generate professional emails, summarize meetings, and plan tasks intelligently.",
      },
      { property: "og:title", content: "Workplace AI Assistant — Email, Meetings & Tasks" },
      {
        property: "og:description",
        content: "AI-powered workplace productivity: emails, meeting summaries, task planning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Workplace AI Assistant — Email, Meetings & Tasks" },
      { name: "description", content: "Workplace AI Hub is an enterprise AI assistant that automates communication, meeting management, and task planning." },
      { property: "og:description", content: "Workplace AI Hub is an enterprise AI assistant that automates communication, meeting management, and task planning." },
      { name: "twitter:description", content: "Workplace AI Hub is an enterprise AI assistant that automates communication, meeting management, and task planning." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8818bdf4-3c1f-4e78-a20f-3caa3392b3d7/id-preview-0ca1473f--10e5302d-8662-4fef-8c44-1424cc8c3411.lovable.app-1781188758885.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8818bdf4-3c1f-4e78-a20f-3caa3392b3d7/id-preview-0ca1473f--10e5302d-8662-4fef-8c44-1424cc8c3411.lovable.app-1781188758885.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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
      <ThemeProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
