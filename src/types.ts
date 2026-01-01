export interface Creature {
  id: string;
  name: string;
  starter?: boolean;
}

export interface Enemy {
  id: string;
  name: string;
}

export interface DifficultyRules {
  difficultyRanges: Record<string, [number, number]>;
}

export interface Skill {
  id: string;
  subject: string;
  name: string;
  description: string;
  gradeRules: Record<string, DifficultyRules>;
}

export interface BattleConfig {
  playerHP: number;
  enemyHP: number;
  damageOnCorrect: number;
  damageOnIncorrect: number;
  fastBonusDamage: number;
  fastThresholdMs: number;
  questionsPerBattle: number;
}

export interface Content {
  version: number;
  grades: number[];
  creatures: Creature[];
  enemies: Enemy[];
  skills: Skill[];
  battleConfig: BattleConfig;
}

export interface SkillState {
  difficulty: number;
  correctStreak: number;
  incorrectStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  averageResponseMs: number;
}

export interface SaveData {
  version: number;
  createdAt: string;
  parentEmail: string;
  child: {
    grade: number;
    selectedCreatureId: string;
  };
  progress: {
    xp: number;
    battlesPlayed: number;
    skillState: Record<string, SkillState>;
    lastPlayedSkillId: string;
    lastBattleSeed: string;
  };
  flags: {
    seenHomeHint: boolean;
    practiceMode?: boolean;
    migratedFromLegacy?: boolean;
  };
}

export interface Question {
  prompt: string;
  answer: number;
  operands: number[];
  skillId?: string;
  difficulty?: number;
}

export interface BattleSession {
  battleId: string;
  skillId: string;
  enemyId: string;
  playerHP: number;
  enemyHP: number;
  questionIndex: number;
  questionLimit: number;
  currentQuestion: Question;
  questionStartedAt: number;
  seed: string;
  rngCursor: number;
}

export interface AnswerResult {
  correct: boolean;
  fastBonusApplied: boolean;
  damageToEnemy: number;
  damageToPlayer: number;
  battleEnded: boolean;
  outcome: 'player' | 'enemy' | 'in-progress';
}
