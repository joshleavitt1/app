import type { Content, Question, Skill } from '../types.js';

export interface QuestionRngState {
  seed: string;
  cursor: number;
}

const clampDifficulty = (value: number) => Math.min(5, Math.max(1, Math.floor(value)));

const hashSeed = (seed: string) => {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const randomValue = (seed: string, cursor: number) => {
  const base = hashSeed(seed) + cursor * 0x9e3779b9;
  let state = base ^ (base << 13);
  state ^= state >>> 17;
  state ^= state << 5;
  return ((state >>> 0) % 4294967296) / 4294967296;
};

export const takeRandom = (
  rng: QuestionRngState
): { value: number; rng: QuestionRngState } => {
  const value = randomValue(rng.seed, rng.cursor);
  return { value, rng: { ...rng, cursor: rng.cursor + 1 } };
};

const randomInt = (
  rng: QuestionRngState,
  min: number,
  max: number
): { value: number; rng: QuestionRngState } => {
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  const { value, rng: next } = takeRandom(rng);
  const rolled = Math.floor(value * (floorMax - floorMin + 1)) + floorMin;
  return { value: rolled, rng: next };
};

const getSkill = (content: Content, skillId: string): Skill | null =>
  content.skills.find((skill) => skill.id === skillId) ?? null;

const pickRange = (skill: Skill, grade: number, difficulty: number): [number, number] => {
  const gradeKey = String(grade);
  const safeDifficulty = String(clampDifficulty(difficulty));
  const gradeRules = skill.gradeRules?.[gradeKey]?.difficultyRanges ?? null;
  const range = gradeRules?.[safeDifficulty];

  if (!range || range.length !== 2) {
    return [0, 10];
  }

  return [range[0], range[1]];
};

const generateAddition = (
  range: [number, number],
  rng: QuestionRngState
): { operands: [number, number]; answer: number; prompt: string; rng: QuestionRngState } => {
  const [min, max] = range;
  const { value: first, rng: afterFirst } = randomInt(rng, min, max);
  const { value: second, rng: afterSecond } = randomInt(afterFirst, min, max);
  const answer = first + second;
  return {
    operands: [first, second],
    answer,
    prompt: `${first} + ${second} = ?`,
    rng: afterSecond,
  };
};

const generateSubtraction = (
  range: [number, number],
  rng: QuestionRngState
): { operands: [number, number]; answer: number; prompt: string; rng: QuestionRngState } => {
  const [min, max] = range;
  const { value: first, rng: afterFirst } = randomInt(rng, min, max);
  const { value: second, rng: afterSecond } = randomInt(afterFirst, min, max);
  const [larger, smaller] = first >= second ? [first, second] : [second, first];
  const answer = larger - smaller;
  return {
    operands: [larger, smaller],
    answer,
    prompt: `${larger} - ${smaller} = ?`,
    rng: afterSecond,
  };
};

export const generateQuestion = (
  content: Content,
  skillId: string,
  grade: number,
  difficulty: number,
  rng: QuestionRngState
): { question: Question; rng: QuestionRngState } => {
  const skill = getSkill(content, skillId) ?? content.skills[0];
  const range = pickRange(skill, grade, difficulty);

  if (skill.id === 'math.subtraction') {
    const { prompt, answer, rng: nextRng, operands } = generateSubtraction(range, rng);
    return {
      question: { prompt, answer, operands, skillId: skill.id, difficulty },
      rng: nextRng,
    };
  }

  const { prompt, answer, rng: nextRng, operands } = generateAddition(range, rng);
  return {
    question: { prompt, answer, operands, skillId: skill.id, difficulty },
    rng: nextRng,
  };
};
