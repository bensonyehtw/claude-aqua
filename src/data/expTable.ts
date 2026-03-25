// EXP required to reach each level (cumulative)
// Steeper curve: takes real Claude usage to progress
const BASE_EXP = 50;
const GROWTH = 1.6;

export function expForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_EXP * Math.pow(GROWTH, level - 2));
}

export function totalExpForLevel(level: number): number {
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += expForLevel(i);
  }
  return total;
}

export function levelFromExp(exp: number): number {
  let level = 1;
  let needed = 0;
  while (true) {
    const next = expForLevel(level + 1);
    if (needed + next > exp) return level;
    needed += next;
    level++;
    if (level > 99) return 99;
  }
}

export function expToNextLevel(currentExp: number): {
  currentLevel: number;
  expIntoLevel: number;
  expNeeded: number;
  progress: number;
} {
  const currentLevel = levelFromExp(currentExp);
  const currentLevelTotal = totalExpForLevel(currentLevel);
  const nextLevelExp = expForLevel(currentLevel + 1);
  const expIntoLevel = currentExp - currentLevelTotal;

  return {
    currentLevel,
    expIntoLevel,
    expNeeded: nextLevelExp,
    progress: nextLevelExp > 0 ? expIntoLevel / nextLevelExp : 1,
  };
}

// EXP values for Claude Code activities — smaller rewards
export const EXP_VALUES = {
  CONVERSATION: 5,
  USER_MESSAGE: 1,
  TOOL_USE: 2,
  SESSION_COMPLETE: 8,
  NEW_PROJECT: 15,
  FOOD_BONUS: 1,
};

// Tank upgrades cost significantly more
export const TANK_LEVELS = [
  { level: 1, maxFish: 3, maxDecorations: 3, cost: 0 },
  { level: 2, maxFish: 5, maxDecorations: 5, cost: 500 },
  { level: 3, maxFish: 8, maxDecorations: 8, cost: 2000 },
  { level: 4, maxFish: 12, maxDecorations: 12, cost: 6000 },
  { level: 5, maxFish: 16, maxDecorations: 16, cost: 15000 },
];

export function getTankLevel(level: number) {
  return TANK_LEVELS[Math.min(level - 1, TANK_LEVELS.length - 1)]!;
}
