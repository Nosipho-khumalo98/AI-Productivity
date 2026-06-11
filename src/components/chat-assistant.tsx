import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Sparkles, X, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Markdown } from "./markdown";

const STORAGE_KEY = "wai.chat.v1";

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initialMessages, setInitialMessages] = useState<any[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setInitialMessages(raw ? JSON.parse(raw) : []);
    } catch {
      setInitialMessages([]);
    }
  }, []);

  if (initialMessages === null) return null;
  return <ChatPanel open={open} setOpen={setOpen} input={input} setInput={setInput} initial={initialMessages} />;
}

function ChatPanel({
  open,
  setOpen,
  input,
  setInput,
  initial,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  input: string;
  setInput: (v: string) => void;
  initial: any[];
}) {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: initial,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const loading = status === "submitted" || status === "streaming";

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-elegant transition-transform hover:scale-105"
        aria-label="Open AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[600px] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AI Assistant</p>
                <p className="text-[11px] text-muted-foreground">Ask anything about work</p>
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([]);
                localStorage.removeItem(STORAGE_KEY);
              }}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-4 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-sm font-medium">How can I help today?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try: "Draft a status update for my manager" or "Help me prioritize 5 tasks".
                </p>
              </div>
            )}
            {messages.map((m) => {
              const text = (m.parts ?? []).map((p: any) => (p.type === "text" ? p.text : "")).join("");
              const isUser = m.role === "user";
              return (
                <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    ].join(" ")}
                  >
                    {isUser ? <p className="whitespace-pre-wrap">{text}</p> : <Markdown>{text}</Markdown>}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Thinking…
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the assistant…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-10 w-10 place-items-center rounded-lg gradient-brand text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
