import { generateQuestion, takeRandom } from './questions.js';
const clampDifficulty = (value) => Math.min(5, Math.max(1, Math.floor(value)));
const pickEnemy = (content, rng) => {
    if (!content.enemies.length) {
        return { enemyId: 'enemy', rng };
    }
    const { value, rng: nextRng } = takeRandom(rng);
    const index = Math.floor(value * content.enemies.length);
    const enemy = content.enemies[index] ?? content.enemies[0];
    return { enemyId: enemy.id, rng: nextRng };
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
            totalCorrect: 0,
            totalAnswered: 0,
            averageResponseMs: 0,
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
    const seed = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    const rngSeed = { seed, cursor: 0 };
    const { enemyId, rng: afterEnemy } = pickEnemy(content, rngSeed);
    const questionLimit = Math.max(1, content.battleConfig.questionsPerBattle || 10);
    const { question, rng } = generateQuestion(content, resolvedSkillId, save.child.grade, difficulty, afterEnemy);
    const session = {
        battleId: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        skillId: resolvedSkillId,
        enemyId,
        playerHP: content.battleConfig.playerHP,
        enemyHP: content.battleConfig.enemyHP,
        questionIndex: 0,
        questionLimit,
        currentQuestion: question,
        questionStartedAt: Date.now(),
        seed,
        rngCursor: rng.cursor,
    };
    const updatedSave = {
        ...save,
        progress: {
            ...save.progress,
            battlesPlayed: save.progress.battlesPlayed + 1,
            skillState,
            lastPlayedSkillId: resolvedSkillId,
            lastBattleSeed: seed,
        },
    };
    return { session, save: updatedSave };
};
const updateDifficulty = (correct, current, responseTimeMs) => {
    const totalAnswered = current.totalAnswered + 1;
    const totalCorrect = current.totalCorrect + (correct ? 1 : 0);
    const averageResponseMs = totalAnswered === 0
        ? 0
        : Math.round((current.averageResponseMs * current.totalAnswered + responseTimeMs) / totalAnswered);
    if (correct) {
        const nextCorrect = current.correctStreak + 1;
        const leveledUp = nextCorrect >= 2 && averageResponseMs < 6000 ? 1 : 0;
        return {
            difficulty: clampDifficulty(current.difficulty + leveledUp),
            correctStreak: leveledUp ? 0 : nextCorrect,
            incorrectStreak: 0,
            totalCorrect,
            totalAnswered,
            averageResponseMs,
        };
    }
    const nextIncorrect = current.incorrectStreak + 1;
    const leveledDown = nextIncorrect >= 2 ? 1 : 0;
    return {
        difficulty: clampDifficulty(current.difficulty - leveledDown),
        correctStreak: 0,
        incorrectStreak: leveledDown ? 0 : nextIncorrect,
        totalCorrect,
        totalAnswered,
        averageResponseMs,
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
    const updatedSkill = updateDifficulty(correct, skillState[session.skillId], responseTimeMs);
    const battleEnded = nextEnemyHP <= 0 || nextPlayerHP <= 0;
    const reachedQuestionLimit = session.questionIndex + 1 >= session.questionLimit;
    const endNow = battleEnded || reachedQuestionLimit;
    const outcome = endNow
        ? nextEnemyHP <= 0
            ? 'player'
            : 'enemy'
        : 'in-progress';
    const updatedSave = {
        ...save,
        progress: {
            ...save.progress,
            xp: endNow ? save.progress.xp + (outcome === 'player' ? 2 : 1) : save.progress.xp,
            skillState: {
                ...skillState,
                [session.skillId]: updatedSkill,
            },
            lastPlayedSkillId: session.skillId,
        },
    };
    const baseRng = { seed: session.seed, cursor: session.rngCursor };
    const nextQuestion = endNow
        ? { question: session.currentQuestion, rng: baseRng }
        : generateQuestion(content, session.skillId, updatedSave.child.grade, updatedSkill.difficulty, baseRng);
    const nextSession = {
        ...session,
        playerHP: nextPlayerHP,
        enemyHP: nextEnemyHP,
        questionIndex: endNow ? session.questionIndex : session.questionIndex + 1,
        currentQuestion: nextQuestion.question,
        questionStartedAt: endNow ? session.questionStartedAt : Date.now(),
        rngCursor: nextQuestion.rng.cursor,
    };
    const result = {
        correct,
        fastBonusApplied,
        damageToEnemy,
        damageToPlayer,
        battleEnded: endNow,
        outcome,
    };
    return { session: nextSession, save: updatedSave, result };
};
