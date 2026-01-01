"use client";

import { useState } from "react";
import type { ContentData, Creature, SaveData } from "@/types/game";

type SettingsScreenProps = {
  content: ContentData;
  saveData: SaveData;
  onSave: (values: {
    parentEmail: string;
    grade: 2 | 3;
    selectedCreatureId: Creature["id"];
  }) => void;
  onReset: () => void;
  onBack: () => void;
};

export function SettingsScreen({
  content,
  saveData,
  onSave,
  onReset,
  onBack
}: SettingsScreenProps) {
  const [parentEmail, setParentEmail] = useState(saveData.parentEmail);
  const [grade, setGrade] = useState<2 | 3>(saveData.child.grade);
  const [selectedCreatureId, setSelectedCreatureId] = useState<Creature["id"]>(
    saveData.child.selectedCreatureId
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ parentEmail, grade, selectedCreatureId });
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Settings
          </p>
          <h2 className="text-2xl font-bold text-slate-900">Adjust your save</h2>
          <p className="text-sm text-slate-600">No accounts. Everything lives in your browser.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Back
          </button>
          <button
            onClick={onReset}
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Reset Save
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Parent email</span>
            <input
              type="email"
              value={parentEmail}
              onChange={(event) => setParentEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-800">Grade</span>
            <select
              value={grade}
              onChange={(event) => setGrade(Number(event.target.value) as 2 | 3)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
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
          <p className="text-sm font-semibold text-slate-800">Creature</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {content.creatures.map((creature) => {
              const selected = creature.id === selectedCreatureId;
              return (
                <button
                  key={creature.id}
                  type="button"
                  onClick={() => setSelectedCreatureId(creature.id)}
                  className={`rounded-xl border px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    selected
                      ? "border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-100"
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}
