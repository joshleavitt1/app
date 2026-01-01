import content from "@/content/content.json";
import type { ContentData, SaveData, SkillId, SkillProgress } from "@/types/game";

export const STORAGE_KEY = "mathMonstersSave_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function clampDifficulty(value: number) {
  return Math.min(5, Math.max(1, value));
}

function buildSkillState(gameContent: ContentData): Record<SkillId, SkillProgress> {
  return gameContent.skills.reduce((state, skill) => {
    state[skill.id] = {
      difficulty: 1,
      correctStreak: 0,
      incorrectStreak: 0
    };
    return state;
  }, {} as Record<SkillId, SkillProgress>);
}

function normalizeSave(raw: SaveData, gameContent: ContentData): SaveData {
  const starterCreature =
    gameContent.creatures.find((c) => c.starter) || gameContent.creatures[0];
  const validCreature =
    gameContent.creatures.find((c) => c.id === raw.child.selectedCreatureId)?.id ??
    starterCreature.id;
  const fallbackSkill = gameContent.skills[0]?.id as SkillId;
  const mergedSkillState = { ...buildSkillState(gameContent), ...raw.progress.skillState };

  return {
    version: 1,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    parentEmail: raw.parentEmail ?? "",
    child: {
      grade: (gameContent.grades.includes(raw.child.grade) ? raw.child.grade : gameContent.grades[0]) as 2 | 3,
      selectedCreatureId: validCreature
    },
    progress: {
      xp: Number.isFinite(raw.progress.xp) ? raw.progress.xp : 0,
      skillState: Object.fromEntries(
        Object.entries(mergedSkillState).map(([skillId, progress]) => [
          skillId as SkillId,
          {
            difficulty: clampDifficulty(progress.difficulty ?? 1),
            correctStreak: progress.correctStreak ?? 0,
            incorrectStreak: progress.incorrectStreak ?? 0
          }
        ])
      ) as Record<SkillId, SkillProgress>,
      lastPlayedSkillId:
        (raw.progress.lastPlayedSkillId as SkillId) || fallbackSkill
    },
    flags: {
      seenHomeHint: raw.flags?.seenHomeHint ?? false
    }
  };
}

export function createInitialSave(params: {
  parentEmail: string;
  grade: 2 | 3;
  selectedCreatureId: SaveData["child"]["selectedCreatureId"];
}): SaveData {
  const starterSkill = content.skills[0].id as SkillId;

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    parentEmail: params.parentEmail,
    child: {
      grade: params.grade,
      selectedCreatureId: params.selectedCreatureId
    },
    progress: {
      xp: 0,
      skillState: buildSkillState(content),
      lastPlayedSkillId: starterSkill
    },
    flags: {
      seenHomeHint: false
    }
  };
}

export function loadSave(): SaveData | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SaveData;
    if (parsed.version !== content.version) {
      return null;
    }
    return normalizeSave(parsed, content);
  } catch (error) {
    console.warn("Failed to parse save data", error);
    return null;
  }
}

export function persistSave(save: SaveData) {
  if (!isBrowser()) return;
  const normalized = normalizeSave(save, content);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export function resetSave() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
