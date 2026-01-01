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
const updateHomeView = () => {
    const currentSave = saveData;
    const currentContent = content;
    if (!currentSave || !currentContent)
        return;
    const creatureName = currentContent.creatures.find((creature) => creature.id === currentSave.child.selectedCreatureId)?.name;
    const creatureLabel = getElement('[data-creature-name]');
    const levelLabel = getElement('[data-creature-level]');
    const gradeLabel = getElement('[data-grade-display]');
    const xpLabel = getElement('[data-xp-display]');
    const practiceLabel = getElement('[data-practice-label]');
    const skillSelect = getElement('[data-skill-select]');
    const heroImage = getElement('[data-hero-image]');
    if (creatureLabel) {
        creatureLabel.textContent = creatureName ?? 'Your Creature';
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
    if (practiceLabel) {
        practiceLabel.textContent = currentSave.flags.practiceMode
            ? 'Practice Mode: On'
            : 'Practice Mode: Off';
    }
    if (heroImage) {
        heroImage.alt = creatureName ? `${creatureName} ready for battle` : 'Creature ready for battle';
    }
    if (skillSelect && currentContent.skills.length) {
        buildSelectOptions(skillSelect, currentContent.skills.map((skill) => ({
            value: skill.id,
            label: skill.name,
        })));
        skillSelect.value = currentSave.progress.lastPlayedSkillId;
    }
};
const showHomeHint = () => {
    const hint = getElement('[data-home-hint]');
    if (!hint || !saveData)
        return;
    hint.toggleAttribute('hidden', saveData.flags.seenHomeHint);
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
    const playerBar = getElement('[data-player-hp]');
    const enemyBar = getElement('[data-enemy-hp]');
    const questionText = getElement('[data-question]');
    const battleMeta = getElement('[data-battle-meta]');
    const answerInput = getElement('[data-answer-input]');
    const submitButton = getElement('[data-answer-submit]');
    const endActions = getElement('[data-battle-end-actions]');
    const feedback = getElement('[data-feedback]');
    const questionIndex = getElement('[data-question-index]');
    if (playerBar) {
        playerBar.textContent = formatHP(battle.playerHP, currentContent.battleConfig.playerHP);
        playerBar.style.setProperty('--value', String(battle.playerHP / currentContent.battleConfig.playerHP));
    }
    if (enemyBar) {
        enemyBar.textContent = formatHP(battle.enemyHP, currentContent.battleConfig.enemyHP);
        enemyBar.style.setProperty('--value', String(battle.enemyHP / currentContent.battleConfig.enemyHP));
    }
    if (questionText) {
        questionText.textContent = battle.currentQuestion.prompt;
    }
    if (battleMeta) {
        const enemyName = currentContent.enemies.find((enemy) => enemy.id === battle.enemyId)?.name;
        battleMeta.textContent = `${currentContent.skills.find((s) => s.id === battle.skillId)?.name ?? 'Skill'} vs. ${enemyName ?? 'Enemy'}`;
    }
    if (answerInput) {
        answerInput.value = '';
        answerInput.focus();
    }
    if (questionIndex) {
        questionIndex.textContent = `#${battle.questionIndex + 1}`;
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
        const outcomeText = result.outcome === 'player'
            ? 'You won! XP +1'
            : 'You lost. Keep practicing!';
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
    persistSave(saveData);
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
    const raw = answerInput?.value ?? '';
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
    persistSave(saveData);
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
    const setupForm = getElement('#setup-form');
    const setupCreatures = getElement('[data-setup-creatures]');
    const startBattleButton = getElement('[data-start-battle]');
    const settingsButton = getElement('[data-open-settings]');
    const settingsForm = getElement('#settings-form');
    const resetButton = getElement('[data-reset-save]');
    const hintDismiss = getElement('[data-dismiss-hint]');
    const answerForm = getElement('#answer-form');
    const playAgainButton = getElement('[data-play-again]');
    const backHomeButtons = Array.from(document.querySelectorAll('[data-back-home]'));
    setupForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!content)
            return;
        const emailInput = getElement('[data-setup-email]');
        const gradeSelect = getElement('[data-setup-grade]');
        const selectedCreature = setupCreatures?.querySelector('input[name="setup-creature"]:checked');
        saveData = createInitialSave(content, {
            parentEmail: emailInput?.value ?? '',
            grade: Number(gradeSelect?.value ?? content.grades[0]),
            selectedCreatureId: selectedCreature?.value,
        });
        persistSave(saveData);
        updateHomeView();
        showHomeHint();
        setScreen('home');
    });
    startBattleButton?.addEventListener('click', () => {
        const skillSelect = getElement('[data-skill-select]');
        const selectedSkill = skillSelect?.value;
        startBattleFlow(selectedSkill);
    });
    settingsButton?.addEventListener('click', () => {
        updateSettingsForm();
        setScreen('settings');
    });
    settingsForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!content || !saveData)
            return;
        const gradeSelect = getElement('[data-settings-grade]');
        const emailInput = getElement('[data-settings-email]');
        const practiceToggle = getElement('[data-settings-practice]');
        const creatureChoice = settingsForm.querySelector('input[name="settings-creature"]:checked');
        const updated = {
            ...saveData,
            parentEmail: emailInput?.value ?? saveData.parentEmail,
            child: {
                grade: Number(gradeSelect?.value ?? saveData.child.grade),
                selectedCreatureId: creatureChoice?.value ?? saveData.child.selectedCreatureId,
            },
            flags: {
                ...saveData.flags,
                practiceMode: Boolean(practiceToggle?.checked),
            },
        };
        saveData = updateSave(updated, content);
        persistSave(saveData);
        updateHomeView();
        setScreen('home');
    });
    resetButton?.addEventListener('click', () => {
        resetSave();
        saveData = null;
        activeBattle = null;
        populateSetupOptions();
        setScreen('setup');
    });
    hintDismiss?.addEventListener('click', () => {
        if (!saveData)
            return;
        saveData = {
            ...saveData,
            flags: {
                ...saveData.flags,
                seenHomeHint: true,
            },
        };
        persistSave(saveData);
        showHomeHint();
    });
    answerForm?.addEventListener('submit', handleAnswerSubmit);
    playAgainButton?.addEventListener('click', () => {
        startBattleFlow(activeBattle?.skillId ?? saveData?.progress.lastPlayedSkillId);
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
        const starterId = content.creatures.find((creature) => creature.starter)?.id ?? '';
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
        setScreen('setup');
        return;
    }
    saveData = updateSave(saveData, content);
    persistSave(saveData);
    updateHomeView();
    showHomeHint();
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
