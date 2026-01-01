"use client";

import { useState } from "react";
import type { ContentData, Creature } from "@/types/game";

export type SetupFormValues = {
  parentEmail: string;
  grade: 2 | 3;
  selectedCreatureId: Creature["id"];
};

type SetupScreenProps = {
  content: ContentData;
  onComplete: (values: SetupFormValues) => void;
};

export function SetupScreen({ content, onComplete }: SetupScreenProps) {
  const starterCreature = content.creatures.find((creature) => creature.starter);
  const [parentEmail, setParentEmail] = useState("");
  const [grade, setGrade] = useState<2 | 3>(content.grades[0] as 2 | 3);
  const [selectedCreatureId, setSelectedCreatureId] = useState<Creature["id"]>(
    starterCreature?.id ?? content.creatures[0].id
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onComplete({ parentEmail, grade, selectedCreatureId });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Parent Setup
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Choose your Math Monster starter
        </h1>
        <p className="text-sm text-slate-600">
          No accounts or logins. We save progress to this browser only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Parent email (optional)</span>
            <input
              type="email"
              value={parentEmail}
              onChange={(event) => setParentEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Child grade</span>
            <select
              value={grade}
              onChange={(event) => setGrade(Number(event.target.value) as 2 | 3)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              required
            >
              {content.grades.map((gradeOption) => (
                <option key={gradeOption} value={gradeOption}>
                  Grade {gradeOption}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Starter creature</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {content.creatures.map((creature) => {
              const selected = creature.id === selectedCreatureId;
              return (
                <button
                  key={creature.id}
                  type="button"
                  onClick={() => setSelectedCreatureId(creature.id)}
                  className={`rounded-xl border px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    selected
                      ? "border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white/80"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {creature.name}
                  </p>
                  <p className="text-xs text-slate-500">Starter creature</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            We store progress in <code>localStorage</code>. Reset anytime in Settings.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Continue →
          </button>
        </div>
      </form>
    </section>
  );
}
