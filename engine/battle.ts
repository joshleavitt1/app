import content from "@/content/content.json";
import { generateQuestion } from "@/engine/questions";
import type { BattleSession, SaveData, SkillId, SkillProgress } from "@/types/game";

function clampDifficulty(value: number) {
  return Math.min(5, Math.max(1, value));
}

function updateSkillProgress(progress: SkillProgress, isCorrect: boolean): SkillProgress {
  if (isCorrect) {
    const correctStreak = progress.correctStreak + 1;
    if (correctStreak >= 3) {
      return {
        difficulty: clampDifficulty(progress.difficulty + 1),
        correctStreak: 0,
        incorrectStreak: 0
      };
    }
    return {
      ...progress,
      correctStreak,
      incorrectStreak: 0
    };
  }

  const incorrectStreak = progress.incorrectStreak + 1;
  if (incorrectStreak >= 2) {
    return {
      difficulty: clampDifficulty(progress.difficulty - 1),
      correctStreak: 0,
      incorrectStreak: 0
    };
  }

  return {
    ...progress,
    incorrectStreak,
    correctStreak: 0
  };
}

function pickEnemy() {
  const enemies = content.enemies;
  const index = Math.floor(Math.random() * enemies.length);
  return enemies[index] ?? enemies[0];
}

export function createBattleSession(
  save: SaveData,
  skillId: SkillId
): BattleSession {
  const enemy = pickEnemy();
  const skillProgress = save.progress.skillState[skillId];
  const question = generateQuestion(skillId, save.child.grade, skillProgress.difficulty);

  return {
    battleId:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `battle-${Date.now()}`,
    skillId,
    enemyId: enemy.id,
    playerHP: content.battleConfig.playerHP,
    enemyHP: content.battleConfig.enemyHP,
    questionIndex: 0,
    currentQuestion: question,
    questionStartedAt: Date.now(),
    status: "in_progress"
  };
}

type EvaluationResult = {
  updatedBattle: BattleSession;
  updatedSave: SaveData;
};

export function evaluateAnswer(
  battle: BattleSession,
  save: SaveData,
  playerAnswer: number
): EvaluationResult {
  const isCorrect = battle.currentQuestion.answer === playerAnswer;
  const responseTimeMs = Date.now() - battle.questionStartedAt;
  const fastBonus =
    isCorrect && responseTimeMs < content.battleConfig.fastThresholdMs;

  const damageToEnemy = isCorrect
    ? content.battleConfig.damageOnCorrect +
      (fastBonus ? content.battleConfig.fastBonusDamage : 0)
    : 0;
  const damageToPlayer = isCorrect ? 0 : content.battleConfig.damageOnIncorrect;

  const nextEnemyHP = Math.max(0, battle.enemyHP - damageToEnemy);
  const nextPlayerHP = Math.max(0, battle.playerHP - damageToPlayer);

  const skillProgress = updateSkillProgress(
    save.progress.skillState[battle.skillId],
    isCorrect
  );

  const updatedSave: SaveData = {
    ...save,
    progress: {
      ...save.progress,
      lastPlayedSkillId: battle.skillId,
      skillState: {
        ...save.progress.skillState,
        [battle.skillId]: skillProgress
      },
      xp: save.progress.xp + (nextEnemyHP <= 0 ? 1 : 0)
    }
  };

  const battleEnded = nextEnemyHP <= 0 || nextPlayerHP <= 0;

  if (battleEnded) {
    return {
      updatedSave,
      updatedBattle: {
        ...battle,
        playerHP: nextPlayerHP,
        enemyHP: nextEnemyHP,
        status: nextEnemyHP <= 0 ? "won" : "lost",
        lastAnswer: {
          isCorrect,
          responseTimeMs,
          damageToEnemy,
          damageToPlayer,
          fastBonus
        }
      }
    };
  }

  const nextQuestion = generateQuestion(
    battle.skillId,
    save.child.grade,
    skillProgress.difficulty
  );

  return {
    updatedSave,
    updatedBattle: {
      ...battle,
      playerHP: nextPlayerHP,
      enemyHP: nextEnemyHP,
      questionIndex: battle.questionIndex + 1,
      currentQuestion: nextQuestion,
      questionStartedAt: Date.now(),
      lastAnswer: {
        isCorrect,
        responseTimeMs,
        damageToEnemy,
        damageToPlayer,
        fastBonus
      }
    }
  };
}
