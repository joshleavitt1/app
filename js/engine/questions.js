const clampDifficulty = (value) => Math.min(5, Math.max(1, Math.floor(value)));
const hashSeed = (seed) => {
    let hash = 2166136261;
    for (let index = 0; index < seed.length; index += 1) {
        hash ^= seed.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};
const randomValue = (seed, cursor) => {
    const base = hashSeed(seed) + cursor * 0x9e3779b9;
    let state = base ^ (base << 13);
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 4294967296) / 4294967296;
};
export const takeRandom = (rng) => {
    const value = randomValue(rng.seed, rng.cursor);
    return { value, rng: { ...rng, cursor: rng.cursor + 1 } };
};
const randomInt = (rng, min, max) => {
    const floorMin = Math.ceil(min);
    const floorMax = Math.floor(max);
    const { value, rng: next } = takeRandom(rng);
    const rolled = Math.floor(value * (floorMax - floorMin + 1)) + floorMin;
    return { value: rolled, rng: next };
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
const generateAddition = (range, rng) => {
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
const generateSubtraction = (range, rng) => {
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
export const generateQuestion = (content, skillId, grade, difficulty, rng) => {
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
