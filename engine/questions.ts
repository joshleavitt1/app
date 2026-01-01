import content from "@/content/content.json";
import type { Question, SkillContent, SkillId } from "@/types/game";

function getSkill(skillId: SkillId): SkillContent {
  const skill = content.skills.find((item) => item.id === skillId);
  if (!skill) {
    return content.skills[0];
  }
  return skill;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRange(skill: SkillContent, grade: number, difficulty: number) {
  const rules = skill.gradeRules[String(grade) as keyof typeof skill.gradeRules];
  const ranges = rules?.difficultyRanges ?? {};
  const key = String(Math.max(1, Math.min(5, difficulty))) as keyof typeof ranges;
  const fallback: [number, number] = [0, 10];
  return (ranges?.[key] as [number, number]) ?? fallback;
}

export function generateQuestion(
  skillId: SkillId,
  grade: 2 | 3,
  difficulty: number
): Question {
  const skill = getSkill(skillId);
  const [min, max] = getRange(skill, grade, difficulty);
  let a = randomInt(min, max);
  let b = randomInt(min, max);

  if (skill.id === "math.subtraction" && a < b) {
    [a, b] = [b, a];
  }

  const answer = skill.id === "math.subtraction" ? a - b : a + b;
  const operator = skill.id === "math.subtraction" ? "-" : "+";

  return {
    prompt: `${a} ${operator} ${b} = ?`,
    answer,
    operands: { a, b }
  };
}
