import { createFileRoute } from "@tanstack/react-router";
import { Copy, Search, Sparkles, Bookmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { researchTopic } from "@/lib/ai.functions";
import { addHistoryItem, newId } from "@/lib/storage";
import { Card, Header } from "./email";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/research")({ component: ResearchPage });

const SUGGESTIONS = [
  "AI adoption trends in mid-size SaaS companies",
  "Best practices for remote engineering onboarding",
  "Competitive landscape: project management tools 2026",
  "Effective async communication frameworks",
];

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [focus, setFocus] = useState("");
  const [depth, setDepth] = useState<"brief" | "standard" | "deep">("standard");
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<string | null>(null);

  const generate = async () => {
    if (topic.trim().length < 3) {
      toast.error("Enter a research topic");
      return;
    }
    setLoading(true);
    try {
      const r = await researchTopic({ data: { topic, focus, depth } });
      setBriefing(r.briefing);
      addHistoryItem({
        id: newId(),
        type: "research",
        title: topic,
        content: r.briefing,
        meta: { focus, depth },
        createdAt: Date.now(),
      });
      toast.success("Briefing ready");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!briefing) return;
    navigator.clipboard.writeText(briefing);
    toast.success("Copied");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Header
        title="AI Research Assistant"
        subtitle="Generate structured insights and briefings on any workplace topic"
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <h3 className="font-semibold mb-4">Research request</h3>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Topic *</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI adoption in HR tech"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Focus / angle</label>
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="e.g. impact on small businesses"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Depth</label>
            <div className="grid grid-cols-3 gap-2">
              {(["brief", "standard", "deep"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  className={[
                    "rounded-md border px-2 py-1.5 text-xs font-medium capitalize",
                    depth === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted",
                  ].join(" ")}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Researching…" : "Generate Briefing"}
          </button>

          <div className="mt-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Try a suggestion</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTopic(s)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Briefing</h3>
            {briefing && (
              <button
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
              >
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

          {!loading && !briefing && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Search className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold">No briefing yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter a topic and we'll structure insights, risks, and next steps.
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Bookmark className="h-3 w-3" /> Briefings are saved to your history.
              </p>
            </div>
          )}

          {!loading && briefing && (
            <div className="rounded-xl border border-border bg-background p-5">
              <Markdown>{briefing}</Markdown>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
