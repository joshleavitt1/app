"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PresenterActions({ talkTrack }: { talkTrack: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(talkTrack);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="ghost" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button variant="primary" onClick={() => window.print()}>
        Export to PDF
      </Button>
    </div>
  );
}
