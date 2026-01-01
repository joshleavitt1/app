"use client";

import type { ContentData, SaveData, SkillId } from "@/types/game";

type HomeScreenProps = {
  content: ContentData;
  saveData: SaveData;
  selectedSkillId: SkillId;
  onSelectSkill: (skillId: SkillId) => void;
  onStartBattle: () => void;
  onOpenSettings: () => void;
  onDismissHint: () => void;
};

export function HomeScreen({
  content,
  saveData,
  selectedSkillId,
  onSelectSkill,
  onStartBattle,
  onOpenSettings,
  onDismissHint
}: HomeScreenProps) {
  const creature = content.creatures.find(
    (item) => item.id === saveData.child.selectedCreatureId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Home Base
          </p>
          <h1 className="text-3xl font-bold text-slate-900">Ready to Battle</h1>
          <p className="text-sm text-slate-600">
            XP: {saveData.progress.xp} • Creature level: {Math.floor(saveData.progress.xp / 5) + 1}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Settings
          </button>
          <button
            onClick={onStartBattle}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Start Battle →
          </button>
        </div>
      </div>

      {!saveData.flags.seenHomeHint && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <p className="font-semibold">Answer to attack! Correct hits the enemy, incorrect hurts you.</p>
          <button
            onClick={onDismissHint}
            className="text-xs font-semibold text-amber-700 underline"
          >
            Got it
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Creature
          </p>
          <p className="text-lg font-bold text-slate-900">{creature?.name}</p>
          <p className="text-sm text-slate-600">Grade {saveData.child.grade}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Skill
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {content.skills.map((skill) => {
              const selected = skill.id === selectedSkillId;
              const difficulty = saveData.progress.skillState[skill.id]?.difficulty ?? 1;
              return (
                <button
                  key={skill.id}
                  onClick={() => onSelectSkill(skill.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${
                    selected
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <span className="block">{skill.name}</span>
                  <span className="text-xs font-normal text-slate-500">
                    Difficulty {difficulty}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Progress
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {content.skills.map((skill) => {
              const progress = saveData.progress.skillState[skill.id];
              return (
                <li key={skill.id} className="flex items-center justify-between">
                  <span>{skill.name}</span>
                  <span className="text-xs text-slate-500">Diff {progress?.difficulty ?? 1}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
