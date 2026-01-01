import type content from "@/content/content.json";

export type ContentData = typeof content;
export type SkillContent = ContentData["skills"][number];
export type SkillId = SkillContent["id"];
export type Creature = ContentData["creatures"][number];
export type Enemy = ContentData["enemies"][number];

export type Question = {
  prompt: string;
  answer: number;
  operands: { a: number; b: number };
};

export type SkillProgress = {
  difficulty: number;
  correctStreak: number;
  incorrectStreak: number;
};

export type SaveData = {
  version: 1;
  createdAt: string;
  parentEmail: string;
  child: {
    grade: 2 | 3;
    selectedCreatureId: Creature["id"];
  };
  progress: {
    xp: number;
    skillState: Record<SkillId, SkillProgress>;
    lastPlayedSkillId: SkillId;
  };
  flags: {
    seenHomeHint: boolean;
  };
};

export type BattleSession = {
  battleId: string;
  skillId: SkillId;
  enemyId: Enemy["id"];
  playerHP: number;
  enemyHP: number;
  questionIndex: number;
  currentQuestion: Question;
  questionStartedAt: number;
  status: "in_progress" | "won" | "lost";
  lastAnswer?: {
    isCorrect: boolean;
    responseTimeMs: number;
    damageToEnemy: number;
    damageToPlayer: number;
    fastBonus: boolean;
  };
};
