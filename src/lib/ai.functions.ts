import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

/* ---------------- Email Generation ---------------- */

const EmailInput = z.object({
  recipientType: z.string(),
  purpose: z.string(),
  tone: z.string(),
  length: z.enum(["short", "medium", "detailed"]),
  context: z.string().min(1),
  senderName: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const lengthGuide =
      data.length === "short"
        ? "2-4 sentences"
        : data.length === "medium"
          ? "1-2 short paragraphs"
          : "3-5 well-developed paragraphs";

    const prompt = `Write a workplace email.

Recipient type: ${data.recipientType}
Purpose: ${data.purpose}
Tone: ${data.tone}
Length: ${lengthGuide}
Sender name: ${data.senderName || "[Your Name]"}

Context from the user:
"""
${data.context}
"""

Return strictly in this format (no extra commentary):

SUBJECT: <one concise subject line>
---
<email body, including a clear call-to-action paragraph near the end>
---
SIGNATURE: <short professional signoff suggestion>`;

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt,
    });

    const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
    const sigMatch = text.match(/SIGNATURE:\s*([\s\S]+)$/i);
    const parts = text.split(/^---\s*$/m);
    const body = parts.length >= 3 ? parts[1].trim() : text;

    return {
      subject: subjectMatch?.[1]?.trim() ?? "Follow-up",
      body,
      signature: sigMatch?.[1]?.trim() ?? "Best regards,\n[Your Name]",
      raw: text,
    };
  });

/* ---------------- Meeting Summarization ---------------- */

const SummarizeInput = z.object({
  notes: z.string().min(20),
  title: z.string().optional(),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummarizeInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const prompt = `You are an expert meeting analyst. Read these notes and produce a structured summary.

Meeting title: ${data.title || "Untitled meeting"}

Notes:
"""
${data.notes}
"""

Return in this exact Markdown format with these headings:

## Executive Summary
<2-4 sentence summary>

## Key Discussion Points
- bullet
- bullet

## Decisions Made
- decision

## Action Items
- [ ] Action — Owner — Due date (if known)

## Risks Identified
- risk

## Follow-Up Tasks
- task

## Deadlines
- item — date

## Responsibilities
- person — what they own`;

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt,
    });
    return { summary: text };
  });

/* ---------------- Task Planning ---------------- */

const TaskItem = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  deadline: z.string().optional().default(""),
  duration: z.string().optional().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  category: z.string(),
});

const PlanInput = z.object({
  tasks: z.array(TaskItem).min(1),
  workdayStart: z.string().default("09:00"),
  workdayEnd: z.string().default("17:00"),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const prompt = `You are a productivity coach. Build an intelligent schedule and prioritization plan from the following tasks.

Working hours: ${data.workdayStart} - ${data.workdayEnd}

Tasks:
${data.tasks
  .map(
    (t, i) =>
      `${i + 1}. ${t.name} | priority=${t.priority} | category=${t.category} | deadline=${t.deadline || "n/a"} | duration=${t.duration || "n/a"}\n   ${t.description}`,
  )
  .join("\n")}

Return Markdown with these sections (use these exact headings):

## Daily Schedule
A time-blocked plan for today using 1-hour slots from ${data.workdayStart} to ${data.workdayEnd}. Format each line as:
- HH:MM – HH:MM — Task name (category)

## Weekly Outlook
Brief day-by-day plan, Mon-Fri, 1-2 lines each.

## Priority Matrix
List tasks under these four buckets:
**Q1: Important + Urgent**
- …
**Q2: Important + Not Urgent**
- …
**Q3: Not Important + Urgent**
- …
**Q4: Not Important + Not Urgent**
- …

## Optimization Suggestions
- Time-blocking ideas
- Focus session recommendations
- Delegation opportunities
- Bottleneck warnings`;

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt,
    });
    return { plan: text };
  });

/* ---------------- Research Assistant ---------------- */

const ResearchInput = z.object({
  topic: z.string().min(3),
  focus: z.string().optional().default(""),
  depth: z.enum(["brief", "standard", "deep"]).default("standard"),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const depthGuide =
      data.depth === "brief"
        ? "concise overview (~250 words)"
        : data.depth === "deep"
          ? "in-depth analysis (~800 words)"
          : "balanced briefing (~450 words)";

    const prompt = `You are a senior workplace research analyst. Produce a structured research briefing.

Topic: ${data.topic}
Focus area / angle: ${data.focus || "general professional context"}
Depth: ${depthGuide}

Return Markdown with these exact headings:

## TL;DR
2-3 sentence executive summary.

## Key Insights
- 5-7 sharp, non-obvious bullet points

## Background & Context
1-2 short paragraphs.

## Opportunities
- bullet

## Risks & Considerations
- bullet

## Recommended Next Steps
- [ ] actionable step

## Suggested Sources to Verify
- credible source category or query (note: model cannot browse — these are suggestions for the human to verify)

Tone: clear, professional, neutral. Avoid speculation; flag uncertainty when relevant.`;

    const { text } = await generateText({
      model: gateway(MODEL),
      prompt,
    });
    return { briefing: text };
  });
