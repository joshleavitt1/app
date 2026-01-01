"use client";

import { useState } from "react";
import type { BattleSession, ContentData, SaveData } from "@/types/game";

type BattleScreenProps = {
  content: ContentData;
  battle: BattleSession;
  saveData: SaveData;
  onSubmitAnswer: (value: number) => void;
  onPlayAgain: () => void;
  onReturnHome: () => void;
};

function HealthBar({ label, current, max }: { label: string; current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{label}</span>
        <span>
          {current} / {max} HP
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BattleScreen({
  content,
  battle,
  saveData,
  onSubmitAnswer,
  onPlayAgain,
  onReturnHome
}: BattleScreenProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const playerCreature = content.creatures.find(
    (item) => item.id === saveData.child.selectedCreatureId
  );
  const enemy = content.enemies.find((item) => item.id === battle.enemyId);
  const skillName = content.skills.find((skill) => skill.id === battle.skillId)?.name ?? "Battle";
  const battleOver = battle.status !== "in_progress";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (battleOver) return;
    const parsed = Number(answer);
    if (Number.isNaN(parsed)) {
      setError("Enter a number to attack");
      return;
    }
    setError(null);
    onSubmitAnswer(parsed);
    setAnswer("");
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
            Battle
          </p>
          <h2 className="text-2xl font-bold text-slate-900">{skillName}</h2>
          <p className="text-sm text-slate-600">Question {battle.questionIndex + 1}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReturnHome}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Back Home
          </button>
          {battleOver && (
            <button
              onClick={onPlayAgain}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Play Again
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Player</p>
          <p className="text-lg font-bold text-slate-900">{playerCreature?.name}</p>
          <HealthBar label="HP" current={battle.playerHP} max={content.battleConfig.playerHP} />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Enemy</p>
          <p className="text-lg font-bold text-slate-900">{enemy?.name}</p>
          <HealthBar label="HP" current={battle.enemyHP} max={content.battleConfig.enemyHP} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 shadow-inner">
          <p className="text-sm font-semibold text-indigo-800">{battle.currentQuestion.prompt}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            type="number"
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            placeholder="Enter answer"
            disabled={battleOver}
          />
          <button
            type="submit"
            disabled={battleOver}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>

      {battle.lastAnswer && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
            battle.lastAnswer.isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <p className="font-semibold">
            {battle.lastAnswer.isCorrect ? "Correct!" : "Incorrect."} {battle.lastAnswer.fastBonus && "Fast bonus!"}
          </p>
          <p className="text-xs text-slate-700">
            {battle.lastAnswer.isCorrect
              ? `You dealt ${battle.lastAnswer.damageToEnemy} damage`
              : `You took ${battle.lastAnswer.damageToPlayer} damage`} in {battle.lastAnswer.responseTimeMs}ms.
          </p>
        </div>
      )}

      {battleOver && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-900">
            {battle.status === "won" ? "Victory!" : "Defeat"}
          </p>
          <p className="text-sm text-slate-600">Battle complete. XP +{battle.status === "won" ? 1 : 0}.</p>
        </div>
      )}
    </section>
  );
}
