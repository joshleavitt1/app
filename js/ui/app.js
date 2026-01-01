import { applyAnswerResult, startBattle } from '../engine/battle.js';
import { createInitialSave, loadSave, persistSave, resetSave, updateSave } from '../state/save.js';
const contentPath = './content/content.json';
const screens = {
    setup: null,
    home: null,
    settings: null,
    battle: null,
};
let content = null;
let saveData = null;
let activeBattle = null;
const getElement = (selector) => document.querySelector(selector);
const formatMs = (ms) => {
    if (!Number.isFinite(ms) || ms <= 0) {
        return '—';
    }
    return `${(ms / 1000).toFixed(1)}s`;
};
const setScreen = (screen) => {
    Object.keys(screens).forEach((name) => {
        const element = screens[name];
        if (!element)
            return;
        const isActive = name === screen;
        element.toggleAttribute('hidden', !isActive);
        element.classList.toggle('screen--active', isActive);
    });
};
const levelFromXp = (xp) => Math.floor(xp / 5) + 1;
const formatHP = (value, max) => `${Math.max(0, value)} / ${max}`;
const buildSelectOptions = (select, values) => {
    select.innerHTML = '';
    values.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = String(value);
        option.textContent = label;
        select.append(option);
    });
};
const renderCreatureChoices = (container, creatures, selectedId, inputName) => {
    container.innerHTML = '';
    creatures.forEach((creature) => {
        const id = `${inputName}-${creature.id}`;
        const wrapper = document.createElement('label');
        wrapper.className = 'creature-choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = inputName;
        input.value = creature.id;
        input.id = id;
        input.checked = creature.id === selectedId;
        const title = document.createElement('span');
        title.textContent = creature.name;
        wrapper.append(input, title);
        container.append(wrapper);
    });
};
const fetchContent = async () => {
    const response = await fetch(contentPath);
    if (!response.ok) {
        throw new Error('Unable to load game content.');
    }
    return response.json();
};
const getSkillState = (skillId) => { var _a; return ((_a = saveData === null || saveData === void 0 ? void 0 : saveData.progress.skillState) === null || _a === void 0 ? void 0 : _a[skillId]) ?? null; };
const updateSkillDetails = () => {
    if (!content || !saveData)
        return;
    const skillSelect = getElement('[data-skill-select]');
    const selectedSkillId = (skillSelect === null || skillSelect === void 0 ? void 0 : skillSelect.value) || saveData.progress.lastPlayedSkillId;
    const skill = content.skills.find((item) => item.id === selectedSkillId);
    const skillDescription = getElement('[data-skill-description]');
    const meter = getElement('[data-difficulty-meter]');
    const meterLabel = getElement('[data-difficulty-label]');
    const state = selectedSkillId ? getSkillState(selectedSkillId) : null;
    const difficultyValue = (state === null || state === void 0 ? void 0 : state.difficulty) ?? 1;
    const value = difficultyValue / 5;
    if (skillDescription) {
        skillDescription.textContent = (skill === null || skill === void 0 ? void 0 : skill.description) ?? 'Choose a skill to see details.';
    }
    if (meter) {
        meter.style.setProperty('--value', value.toString());
    }
    if (meterLabel) {
        meterLabel.textContent = `${difficultyValue} of 5`;
    }
};
const updateHomeView = () => {
    var _a;
    const currentSave = saveData;
    const currentContent = content;
    if (!currentSave || !currentContent)
        return;
    const creatureName = (_a = currentContent.creatures.find((creature) => creature.id === currentSave.child.selectedCreatureId)) === null || _a === void 0 ? void 0 : _a.name;
    const creatureLabel = getElement('[data-creature-name]');
    const levelLabel = getElement('[data-creature-level]');
    const gradeLabel = getElement('[data-grade-display]');
    const xpLabel = getElement('[data-xp-display]');
    const heroImage = getElement('[data-hero-image]');
    const heroTitle = getElement('[data-hero-title]');
    const practicePill = getElement('[data-practice-pill]');
    const battleCount = getElement('[data-battle-count]');
    const averageTime = getElement('[data-average-time]');
    const skillSelect = getElement('[data-skill-select]');
    const preferredSkillId = (skillSelect === null || skillSelect === void 0 ? void 0 : skillSelect.value) || currentSave.progress.lastPlayedSkillId;
    if (creatureLabel) {
        creatureLabel.textContent = creatureName ?? 'Your Creature';
    }
    if (heroTitle) {
        heroTitle.textContent = creatureName ? `${creatureName} is ready` : 'Ready for battle';
    }
    if (levelLabel) {
        levelLabel.textContent = `Level ${levelFromXp(currentSave.progress.xp)}`;
    }
    if (gradeLabel) {
        gradeLabel.textContent = `Grade ${currentSave.child.grade}`;
    }
    if (xpLabel) {
        xpLabel.textContent = `${currentSave.progress.xp} XP`;
    }
    if (battleCount) {
        battleCount.textContent = `${currentSave.progress.battlesPlayed} played`;
    }
    if (practicePill) {
        practicePill.textContent = currentSave.flags.practiceMode ? 'Practice on' : 'Practice off';
        practicePill.classList.toggle('pill-muted', !currentSave.flags.practiceMode);
    }
    if (heroImage) {
        heroImage.alt = creatureName ? `${creatureName} ready for battle` : 'Creature ready for battle';
    }
    if (skillSelect && currentContent.skills.length) {
        buildSelectOptions(skillSelect, currentContent.skills.map((skill) => ({
            value: skill.id,
            label: skill.name,
        })));
        skillSelect.value = preferredSkillId;
        updateSkillDetails();
    }
    const selectedSkillId = (skillSelect === null || skillSelect === void 0 ? void 0 : skillSelect.value) || preferredSkillId;
    const selectedSkillState = selectedSkillId ? getSkillState(selectedSkillId) : null;
    if (averageTime) {
        averageTime.textContent = formatMs((selectedSkillState === null || selectedSkillState === void 0 ? void 0 : selectedSkillState.averageResponseMs) ?? 0);
    }
};
const showHomeHint = () => {
    const hint = getElement('[data-home-hint]');
    if (!hint || !saveData)
        return;
    hint.toggleAttribute('hidden', saveData.flags.seenHomeHint);
};
const showMigrationNote = () => {
    const note = getElement('[data-migration-note]');
    if (!note || !saveData)
        return;
    note.toggleAttribute('hidden', !saveData.flags.migratedFromLegacy);
};
const updateSettingsForm = () => {
    if (!saveData || !content)
        return;
    const gradeSelect = getElement('[data-settings-grade]');
    const creatureContainer = getElement('[data-settings-creatures]');
    const parentEmail = getElement('[data-settings-email]');
    const practiceToggle = getElement('[data-settings-practice]');
    if (gradeSelect) {
        buildSelectOptions(gradeSelect, content.grades.map((grade) => ({ value: grade, label: `Grade ${grade}` })));
        gradeSelect.value = String(saveData.child.grade);
    }
    if (creatureContainer) {
        renderCreatureChoices(creatureContainer, content.creatures, saveData.child.selectedCreatureId, 'settings-creature');
    }
    if (parentEmail) {
        parentEmail.value = saveData.parentEmail;
    }
    if (practiceToggle) {
        practiceToggle.checked = Boolean(saveData.flags.practiceMode);
    }
};
const updateBattleView = () => {
    const battle = activeBattle;
    const currentContent = content;
    if (!saveData || !currentContent || !battle)
        return;
    const playerText = getElement('[data-player-hp]');
    const enemyText = getElement('[data-enemy-hp]');
    const playerBar = getElement('[data-player-hp-bar]');
    const enemyBar = getElement('[data-enemy-hp-bar]');
    const questionText = getElement('[data-question]');
    const battleMeta = getElement('[data-battle-meta]');
    const answerInput = getElement('[data-answer-input]');
    const submitButton = getElement('[data-answer-submit]');
    const endActions = getElement('[data-battle-end-actions]');
    const feedback = getElement('[data-feedback]');
    const questionIndex = getElement('[data-question-index]');
    const questionTotal = getElement('[data-question-total]');
    if (playerText) {
        playerText.textContent = formatHP(battle.playerHP, currentContent.battleConfig.playerHP);
    }
    if (playerBar) {
        playerBar.style.setProperty('--value', String(battle.playerHP / currentContent.battleConfig.playerHP));
    }
    if (enemyText) {
        enemyText.textContent = formatHP(battle.enemyHP, currentContent.battleConfig.enemyHP);
    }
    if (enemyBar) {
        enemyBar.style.setProperty('--value', String(battle.enemyHP / currentContent.battleConfig.enemyHP));
    }
    if (questionText) {
        questionText.textContent = battle.currentQuestion.prompt;
    }
    if (battleMeta) {
        const enemy = currentContent.enemies.find((enemy) => enemy.id === battle.enemyId);
        const skill = currentContent.skills.find((s) => s.id === battle.skillId);
        const difficulty = (getSkillState(battle.skillId)?.difficulty) ?? 1;
        battleMeta.textContent = `${(skill === null || skill === void 0 ? void 0 : skill.name) ?? 'Skill'} vs. ${((enemy === null || enemy === void 0 ? void 0 : enemy.name) ?? 'Enemy')} • Difficulty ${difficulty}`;
    }
    if (answerInput) {
        answerInput.value = '';
        answerInput.focus();
    }
    if (questionIndex) {
        questionIndex.textContent = String(battle.questionIndex + 1);
    }
    if (questionTotal) {
        questionTotal.textContent = String(battle.questionLimit);
    }
    if (submitButton) {
        submitButton.disabled = false;
    }
    if (endActions) {
        endActions.toggleAttribute('hidden', true);
    }
    if (feedback) {
        feedback.textContent = '';
    }
};
const showBattleResult = (result) => {
    const feedback = getElement('[data-feedback]');
    const endActions = getElement('[data-battle-end-actions]');
    const submitButton = getElement('[data-answer-submit]');
    if (feedback) {
        const xpGain = result.battleEnded && result.outcome !== 'in-progress'
            ? result.outcome === 'player'
                ? 2
                : 1
            : 0;
        const outcomeText = result.outcome === 'player'
            ? `Victory!${xpGain ? ` XP +${xpGain}` : ''}`
            : `Battle over.${xpGain ? ` XP +${xpGain}` : ''}`;
        const hitText = result.correct
            ? `Dealt ${result.damageToEnemy} damage${result.fastBonusApplied ? ' (fast bonus!)' : ''}.`
            : `Took ${result.damageToPlayer} damage.`;
        feedback.textContent = `${hitText} ${outcomeText}`;
    }
    if (submitButton) {
        submitButton.disabled = true;
    }
    if (endActions) {
        endActions.toggleAttribute('hidden', false);
    }
    updateHomeView();
    updateSkillDetails();
};
const showAnswerFeedback = (result) => {
    const feedback = getElement('[data-feedback]');
    if (!feedback)
        return;
    if (result.correct) {
        feedback.textContent = result.fastBonusApplied
            ? `Correct and quick! Dealt ${result.damageToEnemy} damage.`
            : `Correct! Dealt ${result.damageToEnemy} damage.`;
    }
    else {
        feedback.textContent = `Incorrect. You took ${result.damageToPlayer} damage.`;
    }
};
const startBattleFlow = (skillId) => {
    if (!content || !saveData)
        return;
    const { session, save } = startBattle(content, saveData, skillId);
    saveData = updateSave(save, content);
    activeBattle = session;
    updateBattleView();
    setScreen('battle');
};
const handleAnswerSubmit = (event) => {
    event.preventDefault();
    if (!content || !saveData || !activeBattle)
        return;
    const answerInput = getElement('[data-answer-input]');
    const feedback = getElement('[data-feedback]');
    const raw = (answerInput === null || answerInput === void 0 ? void 0 : answerInput.value) ?? '';
    const parsed = Number(raw.trim());
    if (!Number.isFinite(parsed)) {
        if (feedback) {
            feedback.textContent = 'Enter a number to attack!';
        }
        return;
    }
    const responseTime = Date.now() - activeBattle.questionStartedAt;
    const { session, save, result } = applyAnswerResult(content, saveData, activeBattle, parsed, responseTime);
    saveData = updateSave(save, content);
    activeBattle = session;
    if (result.battleEnded) {
        showBattleResult(result);
    }
    else {
        showAnswerFeedback(result);
        updateBattleView();
    }
};
const attachEventListeners = () => {
    var _a;
    const setupForm = getElement('#setup-form');
    const setupCreatures = getElement('[data-setup-creatures]');
    const startBattleButtons = Array.from(document.querySelectorAll('[data-start-battle]'));
    const settingsButtons = Array.from(document.querySelectorAll('[data-open-settings]'));
    const settingsForm = getElement('#settings-form');
    const resetButton = getElement('[data-reset-save]');
    const hintDismiss = getElement('[data-dismiss-hint]');
    const answerForm = getElement('#answer-form');
    const playAgainButton = getElement('[data-play-again]');
    const backHomeButtons = Array.from(document.querySelectorAll('[data-back-home]'));
    const migrationDismiss = getElement('[data-dismiss-migration]');
    const skillSelect = getElement('[data-skill-select]');
    setupForm === null || setupForm === void 0 ? void 0 : setupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!content)
            return;
        const emailInput = getElement('[data-setup-email]');
        const gradeSelect = getElement('[data-setup-grade]');
        const selectedCreature = setupCreatures === null || setupCreatures === void 0 ? void 0 : setupCreatures.querySelector('input[name="setup-creature"]:checked');
        saveData = createInitialSave(content, {
            parentEmail: (emailInput === null || emailInput === void 0 ? void 0 : emailInput.value) ?? '',
            grade: Number((gradeSelect === null || gradeSelect === void 0 ? void 0 : gradeSelect.value) ?? content.grades[0]),
            selectedCreatureId: selectedCreature === null || selectedCreature === void 0 ? void 0 : selectedCreature.value,
        });
        persistSave(saveData);
        updateHomeView();
        updateSkillDetails();
        showHomeHint();
        const migrationNote = getElement('[data-migration-note]');
        migrationNote === null || migrationNote === void 0 ? void 0 : migrationNote.toggleAttribute('hidden', true);
        setScreen('home');
    });
    startBattleButtons.forEach((button) => button.addEventListener('click', () => {
        var _a;
        const selectedSkill = (_a = skillSelect === null || skillSelect === void 0 ? void 0 : skillSelect.value) !== null && _a !== void 0 ? _a : undefined;
        startBattleFlow(selectedSkill);
    }));
    settingsButtons.forEach((button) => button.addEventListener('click', () => {
        updateSettingsForm();
        setScreen('settings');
    }));
    skillSelect === null || skillSelect === void 0 ? void 0 : skillSelect.addEventListener('change', () => {
        updateSkillDetails();
        updateHomeView();
    });
    settingsForm === null || settingsForm === void 0 ? void 0 : settingsForm.addEventListener('submit', (event) => {
        var _a;
        event.preventDefault();
        if (!content || !saveData)
            return;
        const gradeSelect = getElement('[data-settings-grade]');
        const emailInput = getElement('[data-settings-email]');
        const practiceToggle = getElement('[data-settings-practice]');
        const creatureChoice = settingsForm.querySelector('input[name="settings-creature"]:checked');
        const updated = Object.assign(Object.assign({}, saveData), { parentEmail: (emailInput === null || emailInput === void 0 ? void 0 : emailInput.value) ?? saveData.parentEmail, child: {
                grade: Number((gradeSelect === null || gradeSelect === void 0 ? void 0 : gradeSelect.value) ?? saveData.child.grade),
                selectedCreatureId: (creatureChoice === null || creatureChoice === void 0 ? void 0 : creatureChoice.value) ?? saveData.child.selectedCreatureId,
            }, flags: Object.assign(Object.assign({}, saveData.flags), { practiceMode: Boolean(practiceToggle === null || practiceToggle === void 0 ? void 0 : practiceToggle.checked) }) });
        saveData = updateSave(updated, content);
        updateHomeView();
        (_a = getElement('[data-migration-note]')) === null || _a === void 0 ? void 0 : _a.toggleAttribute('hidden', true);
        setScreen('home');
    });
    resetButton === null || resetButton === void 0 ? void 0 : resetButton.addEventListener('click', () => {
        resetSave();
        saveData = null;
        activeBattle = null;
        populateSetupOptions();
        setScreen('setup');
    });
    hintDismiss === null || hintDismiss === void 0 ? void 0 : hintDismiss.addEventListener('click', () => {
        if (!saveData)
            return;
        saveData = Object.assign(Object.assign({}, saveData), { flags: Object.assign(Object.assign({}, saveData.flags), { seenHomeHint: true }) });
        persistSave(saveData);
        showHomeHint();
    });
    answerForm === null || answerForm === void 0 ? void 0 : answerForm.addEventListener('submit', handleAnswerSubmit);
    playAgainButton === null || playAgainButton === void 0 ? void 0 : playAgainButton.addEventListener('click', () => {
        var _a, _b;
        startBattleFlow((_b = (_a = activeBattle === null || activeBattle === void 0 ? void 0 : activeBattle.skillId) !== null && _a !== void 0 ? _a : saveData === null || saveData === void 0 ? void 0 : saveData.progress.lastPlayedSkillId) !== null && _b !== void 0 ? _b : undefined);
    });
    migrationDismiss === null || migrationDismiss === void 0 ? void 0 : migrationDismiss.addEventListener('click', () => {
        const note = getElement('[data-migration-note]');
        if (!saveData)
            return;
        saveData = Object.assign(Object.assign({}, saveData), { flags: Object.assign(Object.assign({}, saveData.flags), { migratedFromLegacy: false }) });
        persistSave(saveData);
        note === null || note === void 0 ? void 0 : note.toggleAttribute('hidden', true);
    });
    backHomeButtons.forEach((button) => button.addEventListener('click', () => {
        activeBattle = null;
        updateHomeView();
        setScreen('home');
    }));
};
const populateSetupOptions = () => {
    if (!content)
        return;
    const gradeSelect = getElement('[data-setup-grade]');
    const creatureContainer = getElement('[data-setup-creatures]');
    if (gradeSelect) {
        buildSelectOptions(gradeSelect, content.grades.map((grade) => ({ value: grade, label: `Grade ${grade}` })));
    }
    if (creatureContainer) {
        const starter = content.creatures.find((creature) => creature.starter);
        const starterId = (starter === null || starter === void 0 ? void 0 : starter.id) ?? '';
        renderCreatureChoices(creatureContainer, content.creatures, starterId, 'setup-creature');
    }
};
const showHomeOrSetup = () => {
    if (!content)
        return;
    const loaded = loadSave(content);
    saveData = loaded ?? null;
    if (!saveData) {
        populateSetupOptions();
        const note = getElement('[data-migration-note]');
        note === null || note === void 0 ? void 0 : note.toggleAttribute('hidden', true);
        setScreen('setup');
        return;
    }
    saveData = updateSave(saveData, content);
    updateHomeView();
    updateSkillDetails();
    showHomeHint();
    showMigrationNote();
    setScreen('home');
};
const registerServiceWorker = () => {
    if (!('serviceWorker' in navigator))
        return;
    navigator.serviceWorker
        .register('./sw.js')
        .catch((error) => console.warn('Service worker registration failed.', error));
};
const initScreens = () => {
    screens.setup = getElement('#setup-screen');
    screens.home = getElement('#home-screen');
    screens.settings = getElement('#settings-screen');
    screens.battle = getElement('#battle-screen');
};
const bootstrap = async () => {
    initScreens();
    attachEventListeners();
    try {
        content = await fetchContent();
        populateSetupOptions();
        showHomeOrSetup();
    }
    catch (error) {
        console.error('Unable to initialize app.', error);
        const root = getElement('#app');
        if (root) {
            root.textContent = 'Unable to start Math Monsters. Please try again later.';
        }
        return;
    }
    registerServiceWorker();
};
window.addEventListener('DOMContentLoaded', bootstrap);
