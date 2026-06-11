import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw, Save, Sparkles, Mail, Smartphone, Monitor } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { generateEmail } from "@/lib/ai.functions";
import { addHistoryItem, newId } from "@/lib/storage";

export const Route = createFileRoute("/email")({ component: EmailPage });

const RECIPIENTS = ["Client", "Manager", "Team Member", "Vendor", "Executive"];
const PURPOSES = ["Follow-up", "Meeting Request", "Project Update", "Proposal", "Complaint Response", "Status Update", "Appreciation", "Reminder"];
const TONES = ["Formal", "Professional", "Friendly", "Persuasive", "Empathetic", "Confident"];

function EmailPage() {
  const [recipientType, setRecipientType] = useState(RECIPIENTS[0]);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [tone, setTone] = useState(TONES[1]);
  const [length, setLength] = useState<"short" | "medium" | "detailed">("medium");
  const [context, setContext] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string; signature: string } | null>(null);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");

  const generate = async () => {
    if (!context.trim()) {
      toast.error("Add some context for the email");
      return;
    }
    setLoading(true);
    try {
      const r = await generateEmail({ data: { recipientType, purpose, tone, length, context, senderName } });
      setResult(r);
      addHistoryItem({
        id: newId(),
        type: "email",
        title: r.subject,
        content: r.body,
        meta: { recipientType, purpose, tone },
        createdAt: Date.now(),
      });
      toast.success("Email generated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    const text = `Subject: ${result.subject}\n\n${result.body}\n\n${result.signature}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const exportPdf = () => window.print();

  return (
    <div className="mx-auto max-w-7xl">
      <Header
        title="Smart Email Generator"
        subtitle="Generate polished workplace emails tailored to your audience"
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <h3 className="font-semibold mb-4">Email details</h3>

          <Select label="Recipient" value={recipientType} onChange={setRecipientType} options={RECIPIENTS} />
          <Select label="Purpose" value={purpose} onChange={setPurpose} options={PURPOSES} />
          <Select label="Tone" value={tone} onChange={setTone} options={TONES} />

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Length</label>
            <div className="grid grid-cols-3 gap-2">
              {(["short", "medium", "detailed"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLength(l)}
                  className={[
                    "rounded-md border px-3 py-2 text-xs font-medium capitalize",
                    length === l ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
                  ].join(" ")}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Your name (optional)</label>
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              placeholder="Jordan Smith"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Context *</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={6}
              placeholder="What's the email about? Add key points, deadlines, names, links…"
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generating…" : "Generate Email"}
          </button>
        </Card>

        <Card className="min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Preview</h3>
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
              <button
                onClick={() => setPreview("desktop")}
                className={`rounded px-2 py-1 ${preview === "desktop" ? "bg-muted" : ""}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreview("mobile")}
                className={`rounded px-2 py-1 ${preview === "mobile" ? "bg-muted" : ""}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading && <SkeletonEmail />}

          {!loading && !result && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold">No email yet</p>
              <p className="text-sm text-muted-foreground mt-1">Fill in the form to generate your email.</p>
            </div>
          )}

          {!loading && result && (
            <>
              <div
                className={`mx-auto rounded-xl border border-border bg-background overflow-hidden transition-all ${preview === "mobile" ? "max-w-[380px]" : "max-w-full"}`}
              >
                <div className="border-b border-border bg-muted/40 px-5 py-3">
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="font-semibold">{result.subject}</p>
                </div>
                <div className="p-5 whitespace-pre-wrap text-sm leading-relaxed">{result.body}</div>
                <div className="border-t border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.signature}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ActionBtn onClick={copy} icon={Copy}>Copy</ActionBtn>
                <ActionBtn onClick={generate} icon={RefreshCw}>Regenerate</ActionBtn>
                <ActionBtn onClick={exportPdf} icon={Save}>Export PDF</ActionBtn>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>{children}</div>;
}

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ActionBtn({ onClick, icon: Icon, children }: { onClick: () => void; icon: any; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-muted"
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

function SkeletonEmail() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-12 rounded bg-muted" />
      <div className="h-4 rounded bg-muted w-3/4" />
      <div className="h-4 rounded bg-muted w-full" />
      <div className="h-4 rounded bg-muted w-5/6" />
      <div className="h-4 rounded bg-muted w-2/3" />
      <div className="h-4 rounded bg-muted w-4/5" />
    </div>
  );
}
