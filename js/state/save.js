const STORAGE_KEY = 'mathMonstersSave_v1';
const LEGACY_KEYS = [
    'mathmonstersProgress',
    'mathmonstersPlayerProfile',
    'mathmonstersNextBattleSnapshot',
    'mathmonstersGuestSession',
];
const getStorage = () => {
    if (typeof globalThis === 'undefined') {
        return null;
    }
    try {
        return globalThis.localStorage ?? null;
    }
    catch (error) {
        console.warn('Local storage unavailable.', error);
        return null;
    }
};
const selectDefaultGrade = (content) => content.grades?.[0] ?? 2;
const buildSkillState = (skills) => {
    return skills.reduce((acc, skill) => {
        acc[skill.id] = {
            difficulty: 1,
            correctStreak: 0,
            incorrectStreak: 0,
        };
        return acc;
    }, {});
};
const sanitizeGrade = (grade, content) => {
    if (content.grades.includes(grade)) {
        return grade;
    }
    const closest = content.grades.find((value) => value >= grade);
    return closest ?? selectDefaultGrade(content);
};
const sanitizeSkillState = (skillState, content) => {
    const stateCopy = {};
    for (const skill of content.skills) {
        const existing = skillState?.[skill.id];
        if (existing &&
            Number.isFinite(existing.difficulty) &&
            Number.isFinite(existing.correctStreak) &&
            Number.isFinite(existing.incorrectStreak)) {
            stateCopy[skill.id] = {
                difficulty: Math.min(5, Math.max(1, Math.floor(existing.difficulty))),
                correctStreak: Math.max(0, Math.floor(existing.correctStreak)),
                incorrectStreak: Math.max(0, Math.floor(existing.incorrectStreak)),
            };
            continue;
        }
        stateCopy[skill.id] = {
            difficulty: 1,
            correctStreak: 0,
            incorrectStreak: 0,
        };
    }
    return stateCopy;
};
export const createInitialSave = (content, { parentEmail = '', grade, selectedCreatureId, }) => {
    const starterCreature = selectedCreatureId || content.creatures.find((creature) => creature.starter)?.id;
    const safeCreatureId = starterCreature || content.creatures[0]?.id || 'shellfin';
    const validatedGrade = sanitizeGrade(grade ?? selectDefaultGrade(content), content);
    return {
        version: 1,
        createdAt: new Date().toISOString(),
        parentEmail: parentEmail?.trim() ?? '',
        child: {
            grade: validatedGrade,
            selectedCreatureId: safeCreatureId,
        },
        progress: {
            xp: 0,
            skillState: buildSkillState(content.skills),
            lastPlayedSkillId: content.skills[0]?.id ?? 'math.addition',
        },
        flags: {
            seenHomeHint: false,
            practiceMode: false,
        },
    };
};
const normalizeSave = (raw, content) => {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    try {
        const parsed = raw;
        if (parsed.version !== 1) {
            return null;
        }
        const grade = sanitizeGrade(Number(parsed.child?.grade), content);
        const selectedCreature = content.creatures.find((creature) => creature.id === parsed.child?.selectedCreatureId)?.id;
        const lastSkill = content.skills.find((skill) => skill.id === parsed.progress?.lastPlayedSkillId)?.id;
        return {
            version: 1,
            createdAt: parsed.createdAt || new Date().toISOString(),
            parentEmail: parsed.parentEmail?.trim() || '',
            child: {
                grade,
                selectedCreatureId: selectedCreature || content.creatures[0]?.id || 'shellfin',
            },
            progress: {
                xp: Math.max(0, Math.floor(Number(parsed.progress?.xp) || 0)),
                skillState: sanitizeSkillState(parsed.progress?.skillState || {}, content),
                lastPlayedSkillId: lastSkill || content.skills[0]?.id || 'math.addition',
            },
            flags: {
                seenHomeHint: Boolean(parsed.flags?.seenHomeHint),
                practiceMode: Boolean(parsed.flags?.practiceMode),
            },
        };
    }
    catch (error) {
        console.warn('Failed to normalize save data.', error);
        return null;
    }
};
export const persistSave = (save) => {
    const storage = getStorage();
    if (!storage) {
        return;
    }
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(save));
    }
    catch (error) {
        console.warn('Unable to persist save.', error);
    }
};
export const resetSave = () => {
    const storage = getStorage();
    if (!storage) {
        return;
    }
    try {
        storage.removeItem(STORAGE_KEY);
        for (const key of LEGACY_KEYS) {
            storage.removeItem(key);
        }
    }
    catch (error) {
        console.warn('Unable to reset save.', error);
    }
};
const scoreFromLegacyLevel = (level) => {
    if (!Number.isFinite(level)) {
        return 0;
    }
    const normalized = Math.max(1, Math.floor(Number(level)));
    return (normalized - 1) * 5;
};
export const migrateLegacyData = (content) => {
    const storage = getStorage();
    if (!storage) {
        return null;
    }
    let migrated = false;
    let email = '';
    let grade = selectDefaultGrade(content);
    let xp = 0;
    const rawProfile = storage.getItem('mathmonstersPlayerProfile');
    if (rawProfile) {
        try {
            const parsed = JSON.parse(rawProfile);
            if (parsed?.email) {
                email = String(parsed.email);
                migrated = true;
            }
            if (parsed?.grade) {
                grade = sanitizeGrade(Number(parsed.grade), content);
                migrated = true;
            }
        }
        catch (error) {
            console.warn('Unable to parse legacy profile.', error);
        }
    }
    const rawProgress = storage.getItem('mathmonstersProgress');
    if (rawProgress) {
        try {
            const parsed = JSON.parse(rawProgress);
            if (parsed?.currentLevel) {
                xp = Math.max(xp, scoreFromLegacyLevel(Number(parsed.currentLevel)));
                migrated = true;
            }
        }
        catch (error) {
            console.warn('Unable to parse legacy progress.', error);
        }
    }
    if (!migrated) {
        return null;
    }
    const save = createInitialSave(content, {
        parentEmail: email,
        grade,
        selectedCreatureId: content.creatures.find((creature) => creature.starter)?.id,
    });
    save.progress.xp = xp;
    persistSave(save);
    try {
        for (const key of LEGACY_KEYS) {
            storage.removeItem(key);
        }
    }
    catch (error) {
        console.warn('Failed to clear legacy keys.', error);
    }
    return save;
};
export const loadSave = (content) => {
    const storage = getStorage();
    if (!storage) {
        return null;
    }
    const migrated = migrateLegacyData(content);
    if (migrated) {
        return migrated;
    }
    try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw);
        return normalizeSave(parsed, content);
    }
    catch (error) {
        console.warn('Unable to load save.', error);
        return null;
    }
};
export const updateSave = (save, content) => {
    const normalized = normalizeSave(save, content);
    if (!normalized) {
        return createInitialSave(content, {
            parentEmail: save.parentEmail,
            grade: save.child.grade,
            selectedCreatureId: save.child.selectedCreatureId,
        });
    }
    persistSave(normalized);
    return normalized;
};
export const getStorageKey = () => STORAGE_KEY;
