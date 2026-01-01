"use client";

import { useEffect, useState } from "react";
import content from "@/content/content.json";
import { createBattleSession, evaluateAnswer } from "@/engine/battle";
import { createInitialSave, loadSave, persistSave, resetSave } from "@/state/save";
import type { BattleSession, SaveData, SkillId } from "@/types/game";
import { BattleScreen } from "@/ui/BattleScreen";
import { HomeScreen } from "@/ui/HomeScreen";
import { SettingsScreen } from "@/ui/SettingsScreen";
import { SetupScreen, type SetupFormValues } from "@/ui/SetupScreen";

type Screen = "setup" | "home" | "settings" | "battle";

export default function MathMonstersPage() {
  const [activeScreen, setActiveScreen] = useState<Screen>("setup");
  const [saveData, setSaveData] = useState<SaveData | null>(null);
  const [battle, setBattle] = useState<BattleSession | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<SkillId>(
    content.skills[0].id as SkillId
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = loadSave();
    if (existing) {
      setSaveData(existing);
      setSelectedSkillId(existing.progress.lastPlayedSkillId);
      setActiveScreen("home");
    }
    setHydrated(true);
  }, []);

  const handleSetupComplete = (values: SetupFormValues) => {
    const nextSave = createInitialSave(values);
    setSaveData(nextSave);
    persistSave(nextSave);
    setActiveScreen("home");
  };

  const handleSettingsSave = (values: SetupFormValues) => {
    if (!saveData) return;
    const updated: SaveData = {
      ...saveData,
      parentEmail: values.parentEmail,
      child: {
        grade: values.grade,
        selectedCreatureId: values.selectedCreatureId
      }
    };
    setSaveData(updated);
    persistSave(updated);
    setActiveScreen("home");
  };

  const startBattle = (skillId: SkillId) => {
    if (!saveData) return;
    const updatedSave: SaveData = {
      ...saveData,
      progress: {
        ...saveData.progress,
        lastPlayedSkillId: skillId
      }
    };
    const session = createBattleSession(updatedSave, skillId);
    setBattle(session);
    setSaveData(updatedSave);
    persistSave(updatedSave);
    setSelectedSkillId(skillId);
    setActiveScreen("battle");
  };

  const handleSubmitAnswer = (value: number) => {
    if (!battle || !saveData) return;
    const { updatedBattle, updatedSave } = evaluateAnswer(battle, saveData, value);
    setBattle(updatedBattle);
    setSaveData(updatedSave);
    persistSave(updatedSave);
  };

  const handleReset = () => {
    resetSave();
    setBattle(null);
    setSaveData(null);
    setActiveScreen("setup");
  };

  const handleDismissHint = () => {
    if (!saveData) return;
    const updated = {
      ...saveData,
      flags: { ...saveData.flags, seenHomeHint: true }
    } as SaveData;
    setSaveData(updated);
    persistSave(updated);
  };

  if (!hydrated) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-sm text-slate-600">Loading Math Monsters…</p>
      </section>
    );
  }

  if (!saveData || activeScreen === "setup") {
    return <SetupScreen content={content} onComplete={handleSetupComplete} />;
  }

  if (activeScreen === "settings") {
    return (
      <SettingsScreen
        content={content}
        saveData={saveData}
        onSave={handleSettingsSave}
        onReset={handleReset}
        onBack={() => setActiveScreen("home")}
      />
    );
  }

  if (activeScreen === "battle" && battle) {
    return (
      <BattleScreen
        content={content}
        saveData={saveData}
        battle={battle}
        onSubmitAnswer={handleSubmitAnswer}
        onPlayAgain={() => startBattle(battle.skillId)}
        onReturnHome={() => {
          setActiveScreen("home");
          setBattle(null);
        }}
      />
    );
  }

  return (
    <HomeScreen
      content={content}
      saveData={saveData}
      selectedSkillId={selectedSkillId}
      onSelectSkill={(skillId) => setSelectedSkillId(skillId)}
      onStartBattle={() => startBattle(selectedSkillId)}
      onOpenSettings={() => setActiveScreen("settings")}
      onDismissHint={handleDismissHint}
    />
  );
}
