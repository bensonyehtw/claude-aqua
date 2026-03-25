import * as fs from "fs";
import * as path from "path";
import { AquariumState } from "../types/aquarium.js";

const SAVE_DIR = path.resolve(".");
const SAVE_FILE = path.join(SAVE_DIR, "aquarium-save.json");
const BACKUP_FILE = SAVE_FILE + ".bak";

export function createDefaultState(): AquariumState {
  return {
    version: 2,
    createdAt: new Date().toISOString(),
    lastSyncedAt: "",
    lastHistoryOffset: 0,
    totalExp: 0,
    spendableExp: 0,
    fishes: [
      {
        id: "starter-1",
        speciesId: "guppy",
        name: "Bubbles",
        level: 1,
        exp: 0,
        position: { x: 20, y: 5 },
        direction: "right",
        velocity: { vx: 0.8, vy: 0 },
        phase: 0,
        evolvedFrom: null,
        createdAt: new Date().toISOString(),
        eatAnimTick: 0,
      },
      {
        id: "starter-2",
        speciesId: "minnow",
        name: "Zippy",
        level: 1,
        exp: 0,
        position: { x: 40, y: 8 },
        direction: "left",
        velocity: { vx: -1.0, vy: 0 },
        phase: Math.PI / 2,
        evolvedFrom: null,
        createdAt: new Date().toISOString(),
        eatAnimTick: 0,
      },
    ],
    decorations: [
      {
        id: "default-seaweed",
        decorationId: "seaweed1",
        position: { x: 10, y: 0 },
      },
      {
        id: "default-rock",
        decorationId: "rock1",
        position: { x: 50, y: 0 },
      },
    ],
    unlockedSpecies: ["guppy", "minnow"],
    unlockedDecorations: ["seaweed1", "rock1", "shell"],
    tankLevel: 1,
    achievements: {},
    feedCount: 0,
    stats: {
      totalConversations: 0,
      totalToolUses: 0,
      totalMessages: 0,
      totalExpEarned: 0,
      totalExpSpent: 0,
    },
  };
}

function migrateState(state: Record<string, any>): AquariumState {
  const s = state as AquariumState;
  return {
    ...s,
    achievements: s.achievements ?? {},
    feedCount: s.feedCount ?? 0,
    fishes: (s.fishes ?? []).map((f: any) => ({
      ...f,
      eatAnimTick: f.eatAnimTick ?? 0,
    })),
    stats: {
      ...s.stats,
      totalExpEarned:
        (s.stats as any).totalExpEarned ?? s.totalExp ?? 0,
      totalExpSpent:
        (s.stats as any).totalExpSpent ??
        (s.totalExp ?? 0) - (s.spendableExp ?? 0),
    },
  };
}

export function loadState(): AquariumState {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      const data = fs.readFileSync(SAVE_FILE, "utf-8");
      const state = JSON.parse(data);
      return migrateState(state);
    }
  } catch {
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const data = fs.readFileSync(BACKUP_FILE, "utf-8");
        return migrateState(JSON.parse(data));
      }
    } catch {
      // both corrupted
    }
  }

  return createDefaultState();
}

export function saveState(state: AquariumState): void {
  try {
    if (fs.existsSync(SAVE_FILE)) {
      fs.copyFileSync(SAVE_FILE, BACKUP_FILE);
    }

    fs.writeFileSync(SAVE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    process.stderr.write(`Save failed: ${err}\n`);
  }
}
