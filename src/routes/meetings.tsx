import { createFileRoute } from "@tanstack/react-router";
import { Copy, FileText, Sparkles, Upload, Download, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { summarizeMeeting } from "@/lib/ai.functions";
import { addHistoryItem, newId } from "@/lib/storage";
import { Card, Header } from "./email";
import { Markdown } from "@/components/markdown";

export const Route = createFileRoute("/meetings")({ component: MeetingsPage });

function MeetingsPage() {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const onFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (5MB max)");
      return;
    }
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext === "txt" || ext === "md") {
      setNotes(await file.text());
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast.success("Notes loaded");
    } else {
      toast.message("For DOCX/PDF, paste the text content into the notes area.");
    }
  };

  const generate = async () => {
    if (notes.trim().length < 20) {
      toast.error("Please add more meeting notes");
      return;
    }
    setLoading(true);
    try {
      const r = await summarizeMeeting({ data: { notes, title } });
      setSummary(r.summary);
      addHistoryItem({
        id: newId(),
        type: "summary",
        title: title || "Meeting summary",
        content: r.summary,
        createdAt: Date.now(),
      });
      toast.success("Summary ready");
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    toast.success("Copied");
  };

  const download = (ext: string) => {
    if (!summary) return;
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "summary"}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    if (!summary) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: title || "Meeting summary", text: summary });
      } catch {/*ignore*/}
    } else {
      copy();
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Header title="Meeting Notes Summarizer" subtitle="Turn long meetings into structured, actionable summaries" />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <h3 className="font-semibold mb-4">Input</h3>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Meeting title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q4 planning sync"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            className={[
              "mb-4 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              drag ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
            ].join(" ")}
            onClick={() => document.getElementById("notes-file")?.click()}
          >
            <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Drop .txt file or click to upload</p>
            <p className="text-xs text-muted-foreground">For PDF/DOCX, paste content below</p>
            <input
              id="notes-file"
              type="file"
              accept=".txt,.md,.pdf,.docx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Or paste notes *</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              placeholder="Paste your meeting transcript or notes here…"
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Summarizing…" : "Summarize Meeting"}
          </button>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Summary</h3>
            {summary && (
              <div className="flex gap-2">
                <IconBtn onClick={copy}><Copy className="h-3.5 w-3.5" /> Copy</IconBtn>
                <IconBtn onClick={() => download("txt")}><Download className="h-3.5 w-3.5" /> TXT</IconBtn>
                <IconBtn onClick={() => download("doc")}><Download className="h-3.5 w-3.5" /> DOC</IconBtn>
                <IconBtn onClick={share}><Share2 className="h-3.5 w-3.5" /> Share</IconBtn>
              </div>
            )}
          </div>

          {loading && (
            <div className="space-y-3 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 rounded bg-muted" style={{ width: `${50 + Math.random() * 50}%` }} />
              ))}
            </div>
          )}

          {!loading && !summary && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold">Ready when you are</p>
              <p className="text-sm text-muted-foreground mt-1">Paste notes and we'll extract decisions, action items, and risks.</p>
            </div>
          )}

          {!loading && summary && (
            <div className="rounded-xl border border-border bg-background p-5">
              <Markdown>{summary}</Markdown>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function IconBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
    >
      {children}
    </button>
  );
}
