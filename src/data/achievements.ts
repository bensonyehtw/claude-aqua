import { AquariumState } from "../types/aquarium.js";
import { getSpecies } from "./fishSpecies.js";
import { getTankLevel } from "./expTable.js";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: AquariumState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_splash",
    name: "First Splash",
    description: "Buy your first fish",
    icon: "🐟",
    condition: (s) => s.fishes.length > 2,
  },
  {
    id: "school",
    name: "School",
    description: "Have 5 fish at once",
    icon: "🐠",
    condition: (s) => s.fishes.length >= 5,
  },
  {
    id: "deep_pockets",
    name: "Deep Pockets",
    description: "Earn 1,000 total EXP",
    icon: "💰",
    condition: (s) => s.totalExp >= 1000,
  },
  {
    id: "big_spender",
    name: "Big Spender",
    description: "Earn 10,000 total EXP",
    icon: "💎",
    condition: (s) => s.totalExp >= 10000,
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Use the aquarium at night",
    icon: "🌙",
    condition: () => {
      const h = new Date().getHours();
      return h >= 20 || h < 6;
    },
  },
  {
    id: "evolutionist",
    name: "Evolutionist",
    description: "Evolve a fish for the first time",
    icon: "✨",
    condition: (s) => s.fishes.some((f) => f.evolvedFrom !== null),
  },
  {
    id: "whale_watcher",
    name: "Whale Watcher",
    description: "Own a Whale",
    icon: "🐋",
    condition: (s) => s.fishes.some((f) => f.speciesId === "whale"),
  },
  {
    id: "feeding_frenzy",
    name: "Feeding Frenzy",
    description: "Feed fish 10 times",
    icon: "🍕",
    condition: (s) => (s.feedCount ?? 0) >= 10,
  },
  {
    id: "legendary",
    name: "Legendary",
    description: "Own a legendary fish",
    icon: "⭐",
    condition: (s) =>
      s.fishes.some((f) => {
        const sp = getSpecies(f.speciesId);
        return sp?.rarity === "legendary";
      }),
  },
  {
    id: "decorator",
    name: "Decorator",
    description: "Place 5 decorations",
    icon: "🎨",
    condition: (s) => s.decorations.length >= 5,
  },
  {
    id: "full_tank",
    name: "Full Tank",
    description: "Fill tank to capacity",
    icon: "🏠",
    condition: (s) => {
      const tank = getTankLevel(s.tankLevel);
      return s.fishes.length >= tank.maxFish;
    },
  },
  {
    id: "claude_veteran",
    name: "Claude Veteran",
    description: "Have 50 Claude conversations tracked",
    icon: "🤖",
    condition: (s) => s.stats.totalConversations >= 50,
  },
];

export function checkAchievements(
  state: AquariumState,
  unlocked: Record<string, string>
): AchievementDef[] {
  const newlyUnlocked: AchievementDef[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (unlocked[achievement.id]) continue;
    try {
      if (achievement.condition(state)) {
        newlyUnlocked.push(achievement);
      }
    } catch {
      // skip if condition errors
    }
  }
  return newlyUnlocked;
}
