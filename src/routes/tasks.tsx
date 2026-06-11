import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles, Trash2, ListTodo, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { planTasks } from "@/lib/ai.functions";
import { addHistoryItem, newId } from "@/lib/storage";
import { Card, Header } from "./email";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

type Task = {
  id: string;
  name: string;
  description: string;
  deadline: string;
  duration: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
};

const CATEGORIES = ["Work", "Meetings", "Projects", "Admin", "Personal Development"];
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

function blank(): Task {
  return { id: newId(), name: "", description: "", deadline: "", duration: "", priority: "medium", category: "Work" };
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([blank()]);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (id: string, p: Partial<Task>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)));
  const remove = (id: string) => setTasks((ts) => (ts.length > 1 ? ts.filter((t) => t.id !== id) : ts));
  const add = () => setTasks((ts) => [...ts, blank()]);

  const generate = async () => {
    const valid = tasks.filter((t) => t.name.trim());
    if (valid.length === 0) {
      toast.error("Add at least one task");
      return;
    }
    setLoading(true);
    try {
      const r = await planTasks({
        data: {
          tasks: valid.map((t) => ({
            name: t.name,
            description: t.description,
            deadline: t.deadline,
            duration: t.duration,
            priority: t.priority,
            category: t.category,
          })),
          workdayStart: "09:00",
          workdayEnd: "17:00",
        },
      });
      setPlan(r.plan);
      addHistoryItem({
        id: newId(),
        type: "plan",
        title: `Plan for ${valid.length} task${valid.length > 1 ? "s" : ""}`,
        content: r.plan,
        createdAt: Date.now(),
      });
      toast.success("Plan ready");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan);
    toast.success("Copied");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Header title="AI Task Planner" subtitle="Get an optimized schedule, priority matrix, and productivity tips" />

      <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Your tasks</h3>
            <button onClick={add} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {tasks.map((t, i) => (
              <div key={t.id} className="rounded-lg border border-border p-3 bg-background">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Task {i + 1}</span>
                  <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <input
                  value={t.name}
                  onChange={(e) => update(t.id, { name: e.target.value })}
                  placeholder="Task name *"
                  className="mb-2 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/60"
                />
                <textarea
                  value={t.description}
                  onChange={(e) => update(t.id, { description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={2}
                  className="mb-2 w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary/60"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="date"
                    value={t.deadline}
                    onChange={(e) => update(t.id, { deadline: e.target.value })}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                  />
                  <input
                    value={t.duration}
                    onChange={(e) => update(t.id, { duration: e.target.value })}
                    placeholder="Duration (e.g. 1h)"
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={t.priority}
                    onChange={(e) => update(t.id, { priority: e.target.value as Task["priority"] })}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} priority</option>
                    ))}
                  </select>
                  <select
                    value={t.category}
                    onChange={(e) => update(t.id, { category: e.target.value })}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary/60"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Planning…" : "Generate Plan"}
          </button>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Your AI plan</h3>
            {plan && (
              <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted">
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            )}
          </div>

          {loading && (
            <div className="space-y-3 animate-pulse">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-muted" style={{ width: `${50 + Math.random() * 50}%` }} />
              ))}
            </div>
          )}

          {!loading && !plan && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ListTodo className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold">No plan yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your tasks and get a smart, time-blocked plan.</p>
            </div>
          )}

          {!loading && plan && (
            <div className="rounded-xl border border-border bg-background p-5">
              <Markdown>{plan}</Markdown>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
