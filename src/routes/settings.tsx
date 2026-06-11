import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "@/lib/theme";
import { Card, Header } from "./email";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { theme, toggle } = useTheme();

  const clearAll = () => {
    if (!confirm("Clear all history, saved items, and chat?")) return;
    localStorage.removeItem("wai.history.v1");
    localStorage.removeItem("wai.stats.v1");
    localStorage.removeItem("wai.chat.v1");
    window.dispatchEvent(new Event("wai:history-updated"));
    toast.success("All local data cleared");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Header title="Settings" subtitle="Manage your workspace preferences" />

      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold mb-1">Appearance</h3>
          <p className="text-sm text-muted-foreground mb-4">Choose how the workspace looks</p>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <p className="font-medium text-sm capitalize">{theme} mode</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark</p>
              </div>
            </div>
            <button onClick={toggle} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
              Switch
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-1">Profile</h3>
          <p className="text-sm text-muted-foreground mb-4">Demo profile (local only)</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name" defaultValue="Jordan Smith" />
            <Field label="Email" defaultValue="jordan@acme.co" />
            <Field label="Role" defaultValue="Product Manager" />
            <Field label="Workspace" defaultValue="Acme Workspace" />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-1 text-destructive">Danger zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            History and saved items are stored only in this browser.
          </p>
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
          >
            <Trash2 className="h-4 w-4" /> Clear all local data
          </button>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        defaultValue={defaultValue}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
