import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListTodo,
  TrendingUp,
  Sparkles,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useHistory, useStats } from "@/lib/storage";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const stats = useStats();
  const history = useHistory();
  const productivity = Math.min(100, stats.emails * 5 + stats.summaries * 8 + stats.plans * 10);

  const cards = [
    { label: "Emails Generated", value: stats.emails, icon: Mail, color: "from-blue-500/15 to-blue-500/5", iconColor: "text-blue-500" },
    { label: "Notes Summarized", value: stats.summaries, icon: FileText, color: "from-teal-500/15 to-teal-500/5", iconColor: "text-teal-500" },
    { label: "Tasks Planned", value: stats.plans, icon: ListTodo, color: "from-violet-500/15 to-violet-500/5", iconColor: "text-violet-500" },
    { label: "Productivity Score", value: `${productivity}%`, icon: TrendingUp, color: "from-emerald-500/15 to-emerald-500/5", iconColor: "text-emerald-500" },
  ];

  const quick = [
    { to: "/email", label: "New Email", desc: "Draft a professional email in seconds", icon: Mail },
    { to: "/meetings", label: "Summarize Notes", desc: "Turn raw notes into action items", icon: FileText },
    { to: "/tasks", label: "Create Plan", desc: "Prioritize your day with AI", icon: ListTodo },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-8">
        <div className="absolute inset-0 opacity-30 pointer-events-none [background-image:radial-gradient(circle_at_top_right,var(--color-primary-glow),transparent_60%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered workplace assistant
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold">
            Welcome back, <span className="text-gradient-brand">Jordan</span>
          </h1>
          <p className="mt-2 text-muted-foreground max-w-xl">
            Automate communication, capture meeting outcomes, and plan smarter — all from one workspace.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border border-border bg-gradient-to-br ${c.color} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className={`h-5 w-5 ${c.iconColor}`} />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{c.value}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Quick actions</h2>
            <p className="text-sm text-muted-foreground">Jump into your most-used workflows</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quick.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-elegant"
            >
              <div className="grid h-11 w-11 place-items-center rounded-lg gradient-brand text-white">
                <q.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{q.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{q.desc}</p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                Start <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Recent activity</h2>
            <p className="text-sm text-muted-foreground">Your latest AI-generated content</p>
          </div>
          <Link to="/history" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {item.type === "email" ? <Mail className="h-4 w-4" /> : item.type === "summary" ? <FileText className="h-4 w-4" /> : <ListTodo className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.content.slice(0, 140)}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white">
        <Zap className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-semibold">Nothing here yet</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Generate your first email, summary, or plan to see it here.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Link to="/email" className="rounded-md gradient-brand px-4 py-2 text-sm font-medium text-white">
          Try Email Generator
        </Link>
      </div>
    </div>
  );
}
