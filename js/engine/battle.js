import { generateQuestion } from './questions.js';
const clampDifficulty = (value) => Math.min(5, Math.max(1, Math.floor(value)));
const pickEnemy = (content) => {
    if (!content.enemies.length) {
        return { id: 'enemy', name: 'Enemy' };
    }
    const index = Math.floor(Math.random() * content.enemies.length);
    return content.enemies[index];
};
const ensureSkillState = (save, skillId) => {
    const existing = save.progress.skillState?.[skillId];
    if (existing) {
        return save.progress.skillState;
    }
    return {
        ...save.progress.skillState,
        [skillId]: {
            difficulty: 1,
            correctStreak: 0,
            incorrectStreak: 0,
        },
    };
};
export const startBattle = (content, save, skillId) => {
    const selectedSkillId = skillId && content.skills.some((skill) => skill.id === skillId)
        ? skillId
        : save.progress.lastPlayedSkillId;
    const skillFallback = content.skills[0]?.id ?? 'math.addition';
    const resolvedSkillId = selectedSkillId && content.skills.find((skill) => skill.id === selectedSkillId)
        ? selectedSkillId
        : skillFallback;
    const skillState = ensureSkillState(save, resolvedSkillId);
    const difficulty = clampDifficulty(skillState[resolvedSkillId].difficulty);
    const enemy = pickEnemy(content);
    const question = generateQuestion(content, resolvedSkillId, save.child.grade, difficulty);
    const session = {
        battleId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        skillId: resolvedSkillId,
        enemyId: enemy.id,
        playerHP: content.battleConfig.playerHP,
        enemyHP: content.battleConfig.enemyHP,
        questionIndex: 0,
        currentQuestion: question,
        questionStartedAt: Date.now(),
    };
    const updatedSave = {
        ...save,
        progress: {
            ...save.progress,
            skillState,
            lastPlayedSkillId: resolvedSkillId,
        },
    };
    return { session, save: updatedSave };
};
const updateDifficulty = (correct, current) => {
    if (correct) {
        const nextCorrect = current.correctStreak + 1;
        const leveledUp = nextCorrect >= 3 ? 1 : 0;
        return {
            difficulty: clampDifficulty(current.difficulty + leveledUp),
            correctStreak: leveledUp ? 0 : nextCorrect,
            incorrectStreak: 0,
        };
    }
    const nextIncorrect = current.incorrectStreak + 1;
    const leveledDown = nextIncorrect >= 2 ? 1 : 0;
    return {
        difficulty: clampDifficulty(current.difficulty - leveledDown),
        correctStreak: 0,
        incorrectStreak: leveledDown ? 0 : nextIncorrect,
    };
};
export const applyAnswerResult = (content, save, session, playerAnswer, responseTimeMs) => {
    const battleConfig = content.battleConfig;
    const correct = Number(playerAnswer) === session.currentQuestion.answer;
    const fastBonusApplied = correct && responseTimeMs < battleConfig.fastThresholdMs;
    const damageToEnemy = correct
        ? battleConfig.damageOnCorrect + (fastBonusApplied ? battleConfig.fastBonusDamage : 0)
        : 0;
    const damageToPlayer = correct ? 0 : battleConfig.damageOnIncorrect;
    const nextEnemyHP = Math.max(0, session.enemyHP - damageToEnemy);
    const nextPlayerHP = Math.max(0, session.playerHP - damageToPlayer);
    const skillState = ensureSkillState(save, session.skillId);
    const updatedSkill = updateDifficulty(correct, skillState[session.skillId]);
    const battleEnded = nextEnemyHP <= 0 || nextPlayerHP <= 0;
    const outcome = battleEnded
        ? nextEnemyHP <= 0
            ? 'player'
            : 'enemy'
        : 'in-progress';
    const updatedSave = {
        ...save,
        progress: {
            ...save.progress,
            xp: battleEnded ? save.progress.xp + 1 : save.progress.xp,
            skillState: {
                ...skillState,
                [session.skillId]: updatedSkill,
            },
            lastPlayedSkillId: session.skillId,
        },
    };
    const nextQuestion = battleEnded
        ? session.currentQuestion
        : generateQuestion(content, session.skillId, updatedSave.child.grade, updatedSkill.difficulty);
    const nextSession = {
        ...session,
        playerHP: nextPlayerHP,
        enemyHP: nextEnemyHP,
        questionIndex: battleEnded ? session.questionIndex : session.questionIndex + 1,
        currentQuestion: nextQuestion,
        questionStartedAt: battleEnded ? session.questionStartedAt : Date.now(),
    };
    const result = {
        correct,
        fastBonusApplied,
        damageToEnemy,
        damageToPlayer,
        battleEnded,
        outcome,
    };
    return { session: nextSession, save: updatedSave, result };
};
