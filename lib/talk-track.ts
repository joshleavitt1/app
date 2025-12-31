import { NarrativeContent } from "@/lib/narrative";

export function formatTalkTrack(content: NarrativeContent) {
  const parts: string[] = [];

  parts.push(`Client Readiness Update for ${content.client.name || "your client"}`);
  const meetingType = content.meeting.type.replace(/_/g, " ");
  parts.push(
    `We are preparing for a ${meetingType} on ${content.meeting.date || "TBD"} with the objective: ${content.meeting.objective || "align on next steps"}.`
  );

  parts.push(`Headline: ${content.narrative.headline || "Drafting the main message"}.`);
  parts.push(`Context: ${content.narrative.contextSnapshot.whatChanged || "Capture what shifted since last touchpoint."}`);

  if (content.narrative.confidenceSignals.length) {
    const signals = content.narrative.confidenceSignals
      .map((signal) => {
        const metric = signal.metric?.value ? ` (${signal.metric.value}${signal.metric.unit ? ` ${signal.metric.unit}` : ""}${signal.metric.timeframe ? `}, ${signal.metric.timeframe}` : ""})` : "";
        return `${signal.label}: ${signal.detail}${metric}`;
      })
      .join("; ");
    parts.push(`Signals of confidence: ${signals}.`);
  }

  if (content.narrative.watchouts.length) {
    const risks = content.narrative.watchouts
      .map((risk) => `${risk.risk} — ${risk.framing} (Likelihood: ${risk.likelihood}, Impact: ${risk.impact})`)
      .join("; ");
    parts.push(`Watchouts: ${risks}.`);
  }

  if (content.narrative.actions.length) {
    const actions = content.narrative.actions
      .map((action) => `${action.action} because ${action.whyItMatters}${action.dueBy ? ` (due ${action.dueBy})` : ""}`)
      .join("; ");
    parts.push(`Actions: ${actions}.`);
  }

  const close = content.narrative.suggestedClose;
  parts.push(
    `Close with: ${close.closingQuestion || "What would make this a success for you?"}${
      close.nextStep ? ` | Next step: ${close.nextStep}` : ""
    }${close.ctaType ? ` | CTA: ${close.ctaType}` : ""}`
  );

  return parts.join("\n\n");
}
