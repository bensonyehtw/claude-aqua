export interface FishInstance {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  exp: number;
  position: { x: number; y: number };
  direction: "left" | "right";
  velocity: { vx: number; vy: number };
  phase: number;
  evolvedFrom: string | null;
  createdAt: string;
  eatAnimTick: number; // tick when fish last ate (0 = never)
}

export interface PlacedDecoration {
  id: string;
  decorationId: string;
  position: { x: number; y: number };
}

export interface FoodParticle {
  id: string;
  x: number;
  y: number;
  char: string;
  color: string;
}

export interface AquariumState {
  version: number;
  createdAt: string;
  lastSyncedAt: string;
  lastHistoryOffset: number;
  totalExp: number;
  spendableExp: number;
  fishes: FishInstance[];
  decorations: PlacedDecoration[];
  unlockedSpecies: string[];
  unlockedDecorations: string[];
  tankLevel: number;
  achievements: Record<string, string>;
  feedCount: number;
  stats: {
    totalConversations: number;
    totalToolUses: number;
    totalMessages: number;
    totalExpEarned: number;
    totalExpSpent: number;
  };
}

export interface BubbleInstance {
  id: string;
  x: number;
  y: number;
  char: string;
}

export type AppView =
  | "aquarium"
  | "shop"
  | "fishinfo"
  | "decorations"
  | "naming"
  | "achievements"
  | "stats";

export interface AppState {
  aquarium: AquariumState;
  view: AppView;
  selectedIndex: number;
  notification: string | null;
  notificationTick: number;
  bubbles: BubbleInstance[];
  foodParticles: FoodParticle[];
  lastFeedTick: number;
  tick: number;
  tankWidth: number;
  tankHeight: number;
  selectedFishId: string | null;
  namingFishId: string | null;
}

export type Action =
  | { type: "TICK" }
  | { type: "ADD_EXP"; amount: number; source: string }
  | { type: "EVOLVE_FISH"; fishId: string; newSpeciesId: string }
  | { type: "BUY_FISH"; speciesId: string }
  | { type: "BUY_DECORATION"; decorationId: string }
  | { type: "SET_VIEW"; view: AppView }
  | { type: "SET_SELECTED"; index: number }
  | { type: "SET_NOTIFICATION"; message: string }
  | { type: "CLEAR_NOTIFICATION" }
  | { type: "RESIZE"; width: number; height: number }
  | { type: "SET_SELECTED_FISH"; fishId: string | null }
  | { type: "NAME_FISH"; fishId: string; name: string }
  | { type: "LOAD_STATE"; state: AquariumState }
  | { type: "DROP_FOOD" }
  | {
      type: "SYNC_STATS";
      stats: Pick<
        AquariumState["stats"],
        "totalConversations" | "totalToolUses" | "totalMessages"
      >;
      expGained: number;
      offset: number;
    };
