import { Bell, Menu, Moon, Search, Sun, ChevronDown, PanelLeftClose, PanelLeft } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function TopNav({
  onToggleSidebar,
  onToggleMobile,
  collapsed,
}: {
  onToggleSidebar: () => void;
  onToggleMobile: () => void;
  collapsed: boolean;
}) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onToggleMobile}
        className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={onToggleSidebar}
        className="hidden h-9 w-9 place-items-center rounded-md hover:bg-muted md:grid"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>

      <button className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted">
        <span className="grid h-5 w-5 place-items-center rounded bg-primary/10 text-primary text-[10px] font-bold">
          A
        </span>
        <span className="font-medium">Acme Workspace</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search workspace, history, templates…"
          className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        onClick={toggle}
        className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
      <button className="relative grid h-9 w-9 place-items-center rounded-md hover:bg-muted" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
      </button>
      <div className="flex items-center gap-2 pl-2">
        <div className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-white">
          JS
        </div>
        <div className="hidden lg:flex flex-col leading-tight">
          <span className="text-sm font-medium">Jordan Smith</span>
          <span className="text-[11px] text-muted-foreground">jordan@acme.co</span>
        </div>
      </div>
    </header>
  );
}
