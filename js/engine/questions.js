const clampDifficulty = (value) => Math.min(5, Math.max(1, Math.floor(value)));
const randomInt = (min, max) => {
    const floorMin = Math.ceil(min);
    const floorMax = Math.floor(max);
    return Math.floor(Math.random() * (floorMax - floorMin + 1)) + floorMin;
};
const getSkill = (content, skillId) => content.skills.find((skill) => skill.id === skillId) ?? null;
const pickRange = (skill, grade, difficulty) => {
    const gradeKey = String(grade);
    const safeDifficulty = String(clampDifficulty(difficulty));
    const gradeRules = skill.gradeRules?.[gradeKey]?.difficultyRanges ?? null;
    const range = gradeRules?.[safeDifficulty];
    if (!range || range.length !== 2) {
        return [0, 10];
    }
    return [range[0], range[1]];
};
const generateAddition = (range) => {
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
const generateSubtraction = (range) => {
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
export const generateQuestion = (content, skillId, grade, difficulty) => {
    const skill = getSkill(content, skillId) ?? content.skills[0];
    const range = pickRange(skill, grade, difficulty);
    if (skill.id === 'math.subtraction') {
        const { prompt, answer } = generateSubtraction(range);
        return { prompt, answer };
    }
    const { prompt, answer } = generateAddition(range);
    return { prompt, answer };
};
