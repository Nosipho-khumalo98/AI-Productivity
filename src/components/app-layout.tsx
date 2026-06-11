import { type ReactNode, useState } from "react";

import { AppSidebar } from "./app-sidebar";
import { TopNav } from "./top-nav";
import { ChatAssistant } from "./chat-assistant";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen w-full bg-background text-foreground flex">
      <AppSidebar
        collapsed={collapsed}
        onClose={() => setMobileOpen(false)}
        mobileOpen={mobileOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onToggleMobile={() => setMobileOpen((o) => !o)}
          collapsed={collapsed}
        />
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
        <footer className="border-t border-border px-4 md:px-8 py-3 text-[11px] text-muted-foreground text-center">
          AI-generated content may require human review.
        </footer>
      </div>
      <ChatAssistant />
    </div>
  );
}
