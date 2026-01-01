import type { Content, Question, Skill } from '../types.js';

const clampDifficulty = (value: number) => Math.min(5, Math.max(1, Math.floor(value)));

const randomInt = (min: number, max: number) => {
  const floorMin = Math.ceil(min);
  const floorMax = Math.floor(max);
  return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
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
  range: [number, number]
): { operands: [number, number]; answer: number; prompt: string } => {
  const [min, max] = range;
  const first = randomInt(min, max);
  const second = randomInt(min, max);
  const answer = first + second;
  return {
    operands: [first, second],
    answer,
    prompt: `${first} + ${second} = ?`,
  };
};

const generateSubtraction = (
  range: [number, number]
): { operands: [number, number]; answer: number; prompt: string } => {
  const [min, max] = range;
  const first = randomInt(min, max);
  const second = randomInt(min, max);
  const [larger, smaller] = first >= second ? [first, second] : [second, first];
  const answer = larger - smaller;
  return {
    operands: [larger, smaller],
    answer,
    prompt: `${larger} - ${smaller} = ?`,
  };
};

export const generateQuestion = (
  content: Content,
  skillId: string,
  grade: number,
  difficulty: number
): Question => {
  const skill = getSkill(content, skillId) ?? content.skills[0];
  const range = pickRange(skill, grade, difficulty);

  if (skill.id === 'math.subtraction') {
    const { prompt, answer } = generateSubtraction(range);
    return { prompt, answer } satisfies Question;
  }

  const { prompt, answer } = generateAddition(range);
  return { prompt, answer } satisfies Question;
};
