/* Tiny safe-ish Markdown renderer — supports headings, lists, bold, italic, code, checkboxes. */
import { useMemo } from "react";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function renderInline(s: string) {
  let out = escapeHtml(s);
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-[0.85em]">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function toHtml(md: string) {
  const lines = md.split("\n");
  const html: string[] = [];
  let inList: "ul" | "ol" | null = null;
  const closeList = () => {
    if (inList) {
      html.push(`</${inList}>`);
      inList = null;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      closeList();
      const lvl = h[1].length;
      const sizes = ["text-2xl mt-6 mb-3 font-bold", "text-xl mt-5 mb-2 font-semibold", "text-lg mt-4 mb-2 font-semibold", "text-base mt-3 mb-1 font-semibold"];
      html.push(`<h${lvl} class="${sizes[lvl - 1]}">${renderInline(h[2])}</h${lvl}>`);
      continue;
    }
    const cb = line.match(/^\s*-\s+\[( |x)\]\s+(.*)/);
    if (cb) {
      if (inList !== "ul") {
        closeList();
        html.push('<ul class="space-y-1 my-2">');
        inList = "ul";
      }
      const checked = cb[1] === "x" ? "checked" : "";
      html.push(
        `<li class="flex items-start gap-2"><input type="checkbox" ${checked} disabled class="mt-1 accent-[var(--color-primary)]" /><span>${renderInline(cb[2])}</span></li>`,
      );
      continue;
    }
    const li = line.match(/^\s*[-*]\s+(.*)/);
    if (li) {
      if (inList !== "ul") {
        closeList();
        html.push('<ul class="list-disc pl-5 space-y-1 my-2">');
        inList = "ul";
      }
      html.push(`<li>${renderInline(li[1])}</li>`);
      continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.*)/);
    if (ol) {
      if (inList !== "ol") {
        closeList();
        html.push('<ol class="list-decimal pl-5 space-y-1 my-2">');
        inList = "ol";
      }
      html.push(`<li>${renderInline(ol[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p class="my-2 leading-relaxed">${renderInline(line)}</p>`);
  }
  closeList();
  return html.join("\n");
}

export function Markdown({ children, className = "" }: { children: string; className?: string }) {
  const html = useMemo(() => toHtml(children || ""), [children]);
  return (
    <div
      className={`text-sm text-foreground/90 ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
