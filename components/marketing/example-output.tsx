"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const sampleTalkTrack = `Client Readiness Update for Meridian Trust

We are preparing for a qbr next week to confirm the portfolio direction and agree on Q3 actions.

Headline: Despite recent volatility, you remain positioned to meet near-term income goals.

Signals of confidence: Income targets met QTD; Downside reduced vs benchmark (VAR down 12% vs peer set).

Watchouts: Duration sensitivity if rates spike again (Likelihood: Medium, Impact: Medium); Vendor risk for data provider (Likelihood: Low, Impact: High).

Actions: Run an income stress test and share a one-page summary (due Friday); Finalize allocation change ticket because it aligns duration with the investment policy statement.

Close with: Does this positioning still align with your priorities over the next 6–12 months? | Next step: Confirm allocation change | CTA: Approve Q3 plan`;

export function ExampleOutput() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(sampleTalkTrack);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">Button: Copy a sample talk track</p>
      <Button variant="ghost" onClick={copy}>
        {copied ? "Copied" : "Copy a sample talk track"}
      </Button>
      <p className="text-xs text-slate-400">Use this to preview the talk track format before you build your own.</p>
    </div>
  );
}
