import { applyAnswerResult, startBattle } from '../engine/battle.js';
import { createInitialSave, loadSave, persistSave, resetSave, updateSave } from '../state/save.js';
import type { AnswerResult, BattleSession, Content, SaveData } from '../types.js';

const contentPath = './content/content.json';

type ScreenName = 'setup' | 'home' | 'settings' | 'battle';

const screens: Record<ScreenName, HTMLElement | null> = {
  setup: null,
  home: null,
  settings: null,
  battle: null,
};

let content: Content | null = null;
let saveData: SaveData | null = null;
let activeBattle: BattleSession | null = null;

const getElement = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);

const formatMs = (ms: number) => {
  if (!Number.isFinite(ms) || ms <= 0) {
    return '—';
  }
  return `${(ms / 1000).toFixed(1)}s`;
};

const setScreen = (screen: ScreenName) => {
  (Object.keys(screens) as ScreenName[]).forEach((name) => {
    const element = screens[name];
    if (!element) return;
    const isActive = name === screen;
    element.toggleAttribute('hidden', !isActive);
    element.classList.toggle('screen--active', isActive);
  });
};

const levelFromXp = (xp: number) => Math.floor(xp / 5) + 1;

const formatHP = (value: number, max: number) => `${Math.max(0, value)} / ${max}`;

const buildSelectOptions = (
  select: HTMLSelectElement,
  values: Array<{ value: string | number; label: string }>
) => {
  select.innerHTML = '';
  values.forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = label;
    select.append(option);
  });
};

const renderCreatureChoices = (
  container: HTMLElement,
  creatures: Content['creatures'],
  selectedId: string,
  inputName: string
) => {
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

const fetchContent = async (): Promise<Content> => {
  const response = await fetch(contentPath);
  if (!response.ok) {
    throw new Error('Unable to load game content.');
  }
  return response.json();
};

const getSkillState = (skillId: string) => saveData?.progress.skillState?.[skillId] ?? null;

const updateSkillDetails = () => {
  if (!content || !saveData) return;
  const skillSelect = getElement<HTMLSelectElement>('[data-skill-select]');
  const selectedSkillId = skillSelect?.value || saveData.progress.lastPlayedSkillId;
  const skill = content.skills.find((item) => item.id === selectedSkillId);
  const skillDescription = getElement<HTMLElement>('[data-skill-description]');
  const meter = getElement<HTMLElement>('[data-difficulty-meter]');
  const meterLabel = getElement<HTMLElement>('[data-difficulty-label]');

  const state = selectedSkillId ? getSkillState(selectedSkillId) : null;
  const difficultyValue = state?.difficulty ?? 1;
  const value = difficultyValue / 5;

  if (skillDescription) {
    skillDescription.textContent = skill?.description ?? 'Choose a skill to see details.';
  }

  if (meter) {
    meter.style.setProperty('--value', value.toString());
  }

  if (meterLabel) {
    meterLabel.textContent = `${difficultyValue} of 5`;
  }
};

const updateHomeView = () => {
  const currentSave = saveData;
  const currentContent = content;
  if (!currentSave || !currentContent) return;

  const creatureName = currentContent.creatures.find(
    (creature) => creature.id === currentSave.child.selectedCreatureId
  )?.name;

  const creatureLabel = getElement<HTMLElement>('[data-creature-name]');
  const levelLabel = getElement<HTMLElement>('[data-creature-level]');
  const gradeLabel = getElement<HTMLElement>('[data-grade-display]');
  const xpLabel = getElement<HTMLElement>('[data-xp-display]');
  const heroImage = getElement<HTMLImageElement>('[data-hero-image]');
  const heroTitle = getElement<HTMLElement>('[data-hero-title]');
  const practicePill = getElement<HTMLElement>('[data-practice-pill]');
  const battleCount = getElement<HTMLElement>('[data-battle-count]');
  const averageTime = getElement<HTMLElement>('[data-average-time]');
  const skillSelect = getElement<HTMLSelectElement>('[data-skill-select]');
  const preferredSkillId = skillSelect?.value || currentSave.progress.lastPlayedSkillId;

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
    buildSelectOptions(
      skillSelect,
      currentContent.skills.map((skill) => ({
        value: skill.id,
        label: skill.name,
      }))
    );
    skillSelect.value = preferredSkillId;
    updateSkillDetails();
  }

  const selectedSkillId = skillSelect?.value || preferredSkillId;
  const selectedSkillState = selectedSkillId ? getSkillState(selectedSkillId) : null;
  if (averageTime) {
    averageTime.textContent = formatMs(selectedSkillState?.averageResponseMs ?? 0);
  }
};

const showHomeHint = () => {
  const hint = getElement<HTMLElement>('[data-home-hint]');
  if (!hint || !saveData) return;

  hint.toggleAttribute('hidden', saveData.flags.seenHomeHint);
};

const showMigrationNote = () => {
  const note = getElement<HTMLElement>('[data-migration-note]');
  if (!note || !saveData) return;
  note.toggleAttribute('hidden', !saveData.flags.migratedFromLegacy);
};

const updateSettingsForm = () => {
  if (!saveData || !content) return;

  const gradeSelect = getElement<HTMLSelectElement>('[data-settings-grade]');
  const creatureContainer = getElement<HTMLElement>('[data-settings-creatures]');
  const parentEmail = getElement<HTMLInputElement>('[data-settings-email]');
  const practiceToggle = getElement<HTMLInputElement>('[data-settings-practice]');

  if (gradeSelect) {
    buildSelectOptions(
      gradeSelect,
      content.grades.map((grade) => ({ value: grade, label: `Grade ${grade}` }))
    );
    gradeSelect.value = String(saveData.child.grade);
  }

  if (creatureContainer) {
    renderCreatureChoices(
      creatureContainer,
      content.creatures,
      saveData.child.selectedCreatureId,
      'settings-creature'
    );
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
  if (!saveData || !currentContent || !battle) return;

  const playerText = getElement<HTMLElement>('[data-player-hp]');
  const enemyText = getElement<HTMLElement>('[data-enemy-hp]');
  const playerBar = getElement<HTMLElement>('[data-player-hp-bar]');
  const enemyBar = getElement<HTMLElement>('[data-enemy-hp-bar]');
  const questionText = getElement<HTMLElement>('[data-question]');
  const battleMeta = getElement<HTMLElement>('[data-battle-meta]');
  const answerInput = getElement<HTMLInputElement>('[data-answer-input]');
  const submitButton = getElement<HTMLButtonElement>('[data-answer-submit]');
  const endActions = getElement<HTMLElement>('[data-battle-end-actions]');
  const feedback = getElement<HTMLElement>('[data-feedback]');
  const questionIndex = getElement<HTMLElement>('[data-question-index]');
  const questionTotal = getElement<HTMLElement>('[data-question-total]');

  if (playerText) {
    playerText.textContent = formatHP(
      battle.playerHP,
      currentContent.battleConfig.playerHP
    );
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
    const enemyName = currentContent.enemies.find((enemy) => enemy.id === battle.enemyId)?.name;
    const difficulty = getSkillState(battle.skillId)?.difficulty ?? 1;
    battleMeta.textContent = `${currentContent.skills.find((s) => s.id === battle.skillId)?.name ?? 'Skill'} vs. ${enemyName ?? 'Enemy'} • Difficulty ${difficulty}`;
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

const showBattleResult = (result: AnswerResult) => {
  const feedback = getElement<HTMLElement>('[data-feedback]');
  const endActions = getElement<HTMLElement>('[data-battle-end-actions]');
  const submitButton = getElement<HTMLButtonElement>('[data-answer-submit]');

  if (feedback) {
    const xpGain =
      result.battleEnded && result.outcome !== 'in-progress'
        ? result.outcome === 'player'
          ? 2
          : 1
        : 0;
    const outcomeText =
      result.outcome === 'player'
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

const showAnswerFeedback = (result: AnswerResult) => {
  const feedback = getElement<HTMLElement>('[data-feedback]');
  if (!feedback) return;

  if (result.correct) {
    feedback.textContent = result.fastBonusApplied
      ? `Correct and quick! Dealt ${result.damageToEnemy} damage.`
      : `Correct! Dealt ${result.damageToEnemy} damage.`;
  } else {
    feedback.textContent = `Incorrect. You took ${result.damageToPlayer} damage.`;
  }
};

const startBattleFlow = (skillId?: string) => {
  if (!content || !saveData) return;
  const { session, save } = startBattle(content, saveData, skillId);
  saveData = updateSave(save, content);
  activeBattle = session;
  updateBattleView();
  setScreen('battle');
};

const handleAnswerSubmit = (event: SubmitEvent) => {
  event.preventDefault();
  if (!content || !saveData || !activeBattle) return;

  const answerInput = getElement<HTMLInputElement>('[data-answer-input]');
  const feedback = getElement<HTMLElement>('[data-feedback]');
  const raw = answerInput?.value ?? '';
  const parsed = Number(raw.trim());

  if (!Number.isFinite(parsed)) {
    if (feedback) {
      feedback.textContent = 'Enter a number to attack!';
    }
    return;
  }

  const responseTime = Date.now() - activeBattle.questionStartedAt;
  const { session, save, result } = applyAnswerResult(
    content,
    saveData,
    activeBattle,
    parsed,
    responseTime
  );

  saveData = updateSave(save, content);
  activeBattle = session;

  if (result.battleEnded) {
    showBattleResult(result);
  } else {
    showAnswerFeedback(result);
    updateBattleView();
  }
};

const attachEventListeners = () => {
  const setupForm = getElement<HTMLFormElement>('#setup-form');
  const setupCreatures = getElement<HTMLElement>('[data-setup-creatures]');
  const startBattleButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-start-battle]')
  );
  const settingsButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-open-settings]')
  );
  const settingsForm = getElement<HTMLFormElement>('#settings-form');
  const resetButton = getElement<HTMLButtonElement>('[data-reset-save]');
  const hintDismiss = getElement<HTMLButtonElement>('[data-dismiss-hint]');
  const answerForm = getElement<HTMLFormElement>('#answer-form');
  const playAgainButton = getElement<HTMLButtonElement>('[data-play-again]');
  const backHomeButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[data-back-home]')
  );
  const migrationDismiss = getElement<HTMLButtonElement>('[data-dismiss-migration]');
  const skillSelect = getElement<HTMLSelectElement>('[data-skill-select]');

  setupForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!content) return;

    const emailInput = getElement<HTMLInputElement>('[data-setup-email]');
    const gradeSelect = getElement<HTMLSelectElement>('[data-setup-grade]');
    const selectedCreature = setupCreatures?.querySelector<HTMLInputElement>(
      'input[name="setup-creature"]:checked'
    );

    saveData = createInitialSave(content, {
      parentEmail: emailInput?.value ?? '',
      grade: Number(gradeSelect?.value ?? content.grades[0]),
      selectedCreatureId: selectedCreature?.value,
    });

    persistSave(saveData);
    updateHomeView();
    updateSkillDetails();
    showHomeHint();
    const migrationNote = getElement<HTMLElement>('[data-migration-note]');
    migrationNote?.toggleAttribute('hidden', true);
    setScreen('home');
  });

  startBattleButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const selectedSkill = skillSelect?.value;
      startBattleFlow(selectedSkill);
    })
  );

  settingsButtons.forEach((button) =>
    button.addEventListener('click', () => {
      updateSettingsForm();
      setScreen('settings');
    })
  );

  skillSelect?.addEventListener('change', () => {
    updateSkillDetails();
    updateHomeView();
  });

  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!content || !saveData) return;

    const gradeSelect = getElement<HTMLSelectElement>('[data-settings-grade]');
    const emailInput = getElement<HTMLInputElement>('[data-settings-email]');
    const practiceToggle = getElement<HTMLInputElement>('[data-settings-practice]');
    const creatureChoice = settingsForm.querySelector<HTMLInputElement>(
      'input[name="settings-creature"]:checked'
    );

    const updated: SaveData = {
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
    if (!saveData) return;
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

  migrationDismiss?.addEventListener('click', () => {
    if (!saveData) return;
    saveData = {
      ...saveData,
      flags: {
        ...saveData.flags,
        migratedFromLegacy: false,
      },
    };
    persistSave(saveData);
    const note = getElement<HTMLElement>('[data-migration-note]');
    note?.toggleAttribute('hidden', true);
  });

  backHomeButtons.forEach((button) =>
    button.addEventListener('click', () => {
      activeBattle = null;
      updateHomeView();
      setScreen('home');
    })
  );
};

const populateSetupOptions = () => {
  if (!content) return;
  const gradeSelect = getElement<HTMLSelectElement>('[data-setup-grade]');
  const creatureContainer = getElement<HTMLElement>('[data-setup-creatures]');

  if (gradeSelect) {
    buildSelectOptions(
      gradeSelect,
      content.grades.map((grade) => ({ value: grade, label: `Grade ${grade}` }))
    );
  }

  if (creatureContainer) {
    const starterId = content.creatures.find((creature) => creature.starter)?.id ?? '';
    renderCreatureChoices(creatureContainer, content.creatures, starterId, 'setup-creature');
  }
};

const showHomeOrSetup = () => {
  if (!content) return;
  const loaded = loadSave(content);
  saveData = loaded ?? null;

  if (!saveData) {
    populateSetupOptions();
    const note = getElement<HTMLElement>('[data-migration-note]');
    note?.toggleAttribute('hidden', true);
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
  if (!('serviceWorker' in navigator)) return;
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
  } catch (error) {
    console.error('Unable to initialize app.', error);
    const root = getElement<HTMLElement>('#app');
    if (root) {
      root.textContent = 'Unable to start Math Monsters. Please try again later.';
    }
    return;
  }

  registerServiceWorker();
};

window.addEventListener('DOMContentLoaded', bootstrap);
