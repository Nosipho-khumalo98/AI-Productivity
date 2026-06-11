import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  ListTodo,
  Search,
  History,
  Bookmark,
  Settings,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/meetings", label: "Meeting Notes", icon: FileText },
  { to: "/tasks", label: "Task Planner", icon: ListTodo },
  { to: "/research", label: "Research", icon: Search },
  { to: "/history", label: "History", icon: History },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({
  collapsed,
  onClose,
  mobileOpen,
}: {
  collapsed: boolean;
  onClose: () => void;
  mobileOpen: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile backdrop */}
      {mounted && mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={[
          "fixed md:sticky top-0 z-40 h-screen shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300",
          collapsed ? "md:w-[72px]" : "md:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center gap-2 px-4 border-b border-sidebar-border">
          <div className="grid h-9 w-9 place-items-center rounded-lg gradient-brand text-white shrink-0 shadow-elegant">
            <Sparkles className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Workplace AI</span>
              <span className="text-[11px] text-muted-foreground">Productivity Suite</span>
            </div>
          )}
        </div>
        <nav className="p-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={onClose}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed ? "md:justify-center md:px-0" : "",
                ].join(" ")}
                title={it.label}
              >
                <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-primary" : ""}`} />
                {!collapsed && <span>{it.label}</span>}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="mx-3 mt-3 rounded-xl border border-sidebar-border bg-gradient-to-br from-primary/5 to-accent/10 p-3">
            <p className="text-xs font-semibold">Pro tip</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Press <kbd className="rounded bg-background px-1">⌘K</kbd> to ask the AI anything.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
