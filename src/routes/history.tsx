import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Mail, FileText, ListTodo, Trash2, Copy, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteHistoryItem, toggleSaved, useHistory, type HistoryItem } from "@/lib/storage";
import { Card, Header } from "./email";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function HistoryPage() {
  return <HistoryView title="History" subtitle="All your AI-generated content" />;
}

export function HistoryView({ title, subtitle, savedOnly = false }: { title: string; subtitle: string; savedOnly?: boolean }) {
  const items = useHistory();
  const [filter, setFilter] = useState<"all" | HistoryItem["type"]>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  let list = items;
  if (savedOnly) list = list.filter((i) => i.saved);
  if (filter !== "all") list = list.filter((i) => i.type === filter);
  if (q) list = list.filter((i) => (i.title + i.content).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
      <Header title={title} subtitle={subtitle} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>
        {(["all", "email", "summary", "plan"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              "rounded-md border px-3 py-2 text-xs font-medium capitalize",
              filter === f ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
            ].join(" ")}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <Card className="text-center py-16">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted">
            <Bookmark className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 font-semibold">Nothing here yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            {savedOnly ? "Save items from your history to find them here." : "Generate something to see it appear."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {list.map((i) => {
              const Icon = i.type === "email" ? Mail : i.type === "summary" ? FileText : ListTodo;
              const active = selected?.id === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => setSelected(i)}
                  className={[
                    "w-full text-left rounded-xl border p-3 transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{i.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{i.content.slice(0, 160)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(i.createdAt).toLocaleString()} · {i.type}
                      </p>
                    </div>
                    {i.saved && <Bookmark className="h-4 w-4 fill-primary text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>

          <Card>
            {selected ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{selected.title}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selected.content);
                        toast.success("Copied");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button
                      onClick={() => {
                        toggleSaved(selected.id);
                        setSelected({ ...selected, saved: !selected.saved });
                      }}
                      className={[
                        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium",
                        selected.saved ? "border-primary text-primary bg-primary/10" : "border-border hover:bg-muted",
                      ].join(" ")}
                    >
                      <Bookmark className={`h-3.5 w-3.5 ${selected.saved ? "fill-current" : ""}`} />
                      {selected.saved ? "Saved" : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this item?")) {
                          deleteHistoryItem(selected.id);
                          setSelected(null);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background p-5">
                  <Markdown>{selected.content}</Markdown>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="font-semibold">Select an item</p>
                <p className="text-sm text-muted-foreground mt-1">Click any item in the list to view it here.</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
