"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import debounce from "lodash.debounce";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ActionItem,
  ConfidenceSignal,
  MEETING_TYPES,
  NarrativeContent,
  NarrativeRecord,
  Watchout
} from "@/lib/narrative";
import { formatTalkTrack } from "@/lib/talk-track";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Props = {
  narrative: NarrativeRecord;
};

export function NarrativeBuilder({ narrative }: Props) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [content, setContent] = useState<NarrativeContent>(narrative.content);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const persist = useMemo(
    () =>
      debounce(async (payload: NarrativeContent) => {
        setSaving(true);
        const { error } = await supabase.from("narratives").update({ content: payload }).eq("id", narrative.id);
        setSaving(false);
        setLastSaved(new Date());
        if (error) {
          console.error(error.message);
        }
      }, 800),
    [narrative.id, supabase]
  );

  useEffect(() => {
    persist(content);
    return () => persist.cancel();
  }, [content, persist]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatTalkTrack(content));
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 2000);
  };

  const updateNested = (path: string[], value: any) => {
    setContent((prev) => {
      const clone: any = structuredClone(prev);
      let cursor = clone;
      for (let i = 0; i < path.length - 1; i++) {
        cursor = cursor[path[i]];
      }
      cursor[path[path.length - 1]] = value;
      return clone;
    });
  };

  const upsertArrayItem = <T,>(key: keyof NarrativeContent["narrative"], items: T[]) => {
    setContent((prev) => ({
      ...prev,
      narrative: {
        ...prev.narrative,
        [key]: items
      }
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wide text-indigo-200">Client Readiness Update</p>
            <h1 className="text-2xl font-semibold text-white">{content.client.name || "New narrative"}</h1>
            <p className="text-sm text-slate-400">
              Autosaves to Supabase. Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : "Pending"}
            </p>
          </div>
          <Button asChild>
            <Link href={`/narratives/${narrative.id}/presenter`}>Presenter mode</Link>
          </Button>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Client + Meeting</h2>
          <label className="block text-sm text-slate-300">
            Client name
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              value={content.client.name}
              onChange={(e) => updateNested(["client", "name"], e.target.value)}
              placeholder="Acme Corp"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Meeting date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
                value={content.meeting.date}
                onChange={(e) => updateNested(["meeting", "date"], e.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-300">
              Meeting type
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
                value={content.meeting.type}
                onChange={(e) => updateNested(["meeting", "type"], e.target.value)}
              >
                {MEETING_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm text-slate-300">
            Meeting objective
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              value={content.meeting.objective}
              onChange={(e) => updateNested(["meeting", "objective"], e.target.value)}
              placeholder="Align on renewal motion"
            />
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Headline + Context</h2>
          <label className="block text-sm text-slate-300">
            Headline
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              value={content.narrative.headline}
              onChange={(e) => updateNested(["narrative", "headline"], e.target.value)}
              placeholder="Summarize the story in one line"
            />
          </label>
          <label className="block text-sm text-slate-300">
            What changed?
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
              value={content.narrative.contextSnapshot.whatChanged}
              onChange={(e) => updateNested(["narrative", "contextSnapshot", "whatChanged"], e.target.value)}
              placeholder="New signals since last check-in."
              rows={3}
            />
          </label>
        </div>

        <SectionArray
          title="Confidence signals"
          description="What makes us confident? Include optional metrics."
          items={content.narrative.confidenceSignals}
          onChange={(items) => upsertArrayItem<ConfidenceSignal>("confidenceSignals", items)}
          renderItem={(item, index, updateItem) => (
            <div className="space-y-2 rounded-lg border border-white/10 bg-[#0f162f] p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <Field
                  label="Label"
                  value={item.label}
                  onChange={(v) => updateItem({ ...item, label: v })}
                  placeholder="Champion momentum"
                />
                <Field
                  label="Detail"
                  value={item.detail}
                  onChange={(v) => updateItem({ ...item, detail: v })}
                  placeholder="CTO replied within 5 minutes."
                />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <Field
                  label="Metric value"
                  value={item.metric?.value ?? ""}
                  onChange={(v) => updateItem({ ...item, metric: { ...item.metric, value: v } })}
                  placeholder="12"
                />
                <Field
                  label="Unit"
                  value={item.metric?.unit ?? ""}
                  onChange={(v) => updateItem({ ...item, metric: { ...item.metric, unit: v } })}
                  placeholder="meetings"
                />
                <Field
                  label="Timeframe"
                  value={item.metric?.timeframe ?? ""}
                  onChange={(v) => updateItem({ ...item, metric: { ...item.metric, timeframe: v } })}
                  placeholder="last 30 days"
                />
              </div>
              <button
                className="text-xs text-rose-300 underline"
                onClick={() =>
                  upsertArrayItem<ConfidenceSignal>(
                    "confidenceSignals",
                    content.narrative.confidenceSignals.filter((_, i) => i !== index)
                  )
                }
                type="button"
              >
                Remove
              </button>
            </div>
          )}
          onAdd={() =>
            upsertArrayItem<ConfidenceSignal>("confidenceSignals", [
              ...content.narrative.confidenceSignals,
              { label: "", detail: "", metric: { value: "", unit: "", timeframe: "" } }
            ])
          }
        />

        <SectionArray
          title="Watchouts"
          description="Risks, how we frame them, likelihood, and impact."
          items={content.narrative.watchouts}
          onChange={(items) => upsertArrayItem<Watchout>("watchouts", items)}
          renderItem={(item, index, updateItem) => (
            <div className="space-y-2 rounded-lg border border-white/10 bg-[#0f162f] p-3">
              <Field
                label="Risk"
                value={item.risk}
                onChange={(v) => updateItem({ ...item, risk: v })}
                placeholder="Executive alignment risk"
              />
              <Field
                label="Framing"
                value={item.framing}
                onChange={(v) => updateItem({ ...item, framing: v })}
                placeholder="Position as joint discovery before final commit."
              />
              <div className="grid gap-2 md:grid-cols-2">
                <Field
                  label="Likelihood"
                  value={item.likelihood}
                  onChange={(v) => updateItem({ ...item, likelihood: v })}
                  placeholder="Medium"
                />
                <Field
                  label="Impact"
                  value={item.impact}
                  onChange={(v) => updateItem({ ...item, impact: v })}
                  placeholder="High"
                />
              </div>
              <button
                className="text-xs text-rose-300 underline"
                onClick={() =>
                  upsertArrayItem<Watchout>(
                    "watchouts",
                    content.narrative.watchouts.filter((_, i) => i !== index)
                  )
                }
                type="button"
              >
                Remove
              </button>
            </div>
          )}
          onAdd={() =>
            upsertArrayItem<Watchout>("watchouts", [
              ...content.narrative.watchouts,
              { risk: "", framing: "", likelihood: "", impact: "" }
            ])
          }
        />

        <SectionArray
          title="Actions"
          description="Call-to-actions with why they matter."
          items={content.narrative.actions}
          onChange={(items) => upsertArrayItem<ActionItem>("actions", items)}
          renderItem={(item, index, updateItem) => (
            <div className="space-y-2 rounded-lg border border-white/10 bg-[#0f162f] p-3">
              <Field
                label="Action"
                value={item.action}
                onChange={(v) => updateItem({ ...item, action: v })}
                placeholder="Book executive sponsor call"
              />
              <Field
                label="Why it matters"
                value={item.whyItMatters}
                onChange={(v) => updateItem({ ...item, whyItMatters: v })}
                placeholder="Needed for procurement approval."
              />
              <Field
                label="Due by"
                value={item.dueBy ?? ""}
                onChange={(v) => updateItem({ ...item, dueBy: v })}
                placeholder="2024-08-01"
              />
              <button
                className="text-xs text-rose-300 underline"
                onClick={() =>
                  upsertArrayItem<ActionItem>(
                    "actions",
                    content.narrative.actions.filter((_, i) => i !== index)
                  )
                }
                type="button"
              >
                Remove
              </button>
            </div>
          )}
          onAdd={() =>
            upsertArrayItem<ActionItem>("actions", [
              ...content.narrative.actions,
              { action: "", whyItMatters: "", dueBy: "" }
            ])
          }
        />

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-white">Suggested close</h2>
          <Field
            label="Closing question"
            value={content.narrative.suggestedClose.closingQuestion}
            onChange={(v) => updateNested(["narrative", "suggestedClose", "closingQuestion"], v)}
            placeholder="What would make this a win on your side?"
          />
          <Field
            label="Next step"
            value={content.narrative.suggestedClose.nextStep ?? ""}
            onChange={(v) => updateNested(["narrative", "suggestedClose", "nextStep"], v)}
            placeholder="Confirm timeline & steering committee"
          />
          <Field
            label="CTA type"
            value={content.narrative.suggestedClose.ctaType ?? ""}
            onChange={(v) => updateNested(["narrative", "suggestedClose", "ctaType"], v)}
            placeholder="e.g., Mutual action plan"
          />
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-400">
          {saving ? "Saving..." : `Autosaved${lastSaved ? ` at ${lastSaved.toLocaleTimeString()}` : ""}`}
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
      </section>
      <aside className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-sky-500/10 p-5">
        <div className="sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Talk Track</h2>
            <Button variant="ghost" onClick={handleCopy}>
              {copyState === "copied" ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0f162f]/80 p-4 text-sm text-slate-200">
            {formatTalkTrack(content)}
          </pre>
          <p className="text-xs text-slate-300">
            Presenter mode keeps the same copy, in a print-friendly format for PDF export via the browser.
          </p>
        </div>
      </aside>
    </div>
  );
}

type SectionArrayProps<T> = {
  title: string;
  description: string;
  items: T[];
  renderItem: (item: T, index: number, updateItem: (item: T) => void) => ReactNode;
  onAdd: () => void;
  onChange: (items: T[]) => void;
};

function SectionArray<T>({ title, description, items, renderItem, onAdd, onChange }: SectionArrayProps<T>) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
        <Button type="button" variant="ghost" onClick={onAdd}>
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-400">No entries yet. Add your first one.</p>}
        {items.map((item, index) => (
          <div key={index}>
            {renderItem(item, index, (updated) => {
              const clone = [...items];
              clone[index] = updated;
              onChange(clone);
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      <input
        className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f162f] px-3 py-2 text-white focus:border-indigo-400 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
