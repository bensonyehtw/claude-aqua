import React, { useReducer, useEffect, useRef, useCallback } from "react";
import { Box, Text, useInput, useApp, useStdout } from "ink";
import { ShopView, getShopItems } from "./components/Shop.js";
import { FishInfoView } from "./components/FishInfo.js";
import { AchievementsView } from "./components/AchievementsView.js";
import { StatsView } from "./components/StatsView.js";
import { AppState, Action, BubbleInstance, FoodParticle } from "./types/aquarium.js";
import { updateFishPosition, applyRepulsion } from "./engine/movement.js";
import { loadState, saveState } from "./services/saveManager.js";
import {
  scanClaudeActivity,
  quickScan,
  watchHistory,
} from "./services/claudeTracker.js";
import { getSpecies } from "./data/fishSpecies.js";
import { expToNextLevel, getTankLevel, EXP_VALUES } from "./data/expTable.js";
import { getAllDecorations } from "./data/decorations.js";
import { checkAchievements } from "./data/achievements.js";
import {
  getTimeOfDay,
  getSpeedMultiplier,
  getWaterBgAnsi,
  getSandColor,
  getBubbleColor,
  getWaterColor,
} from "./engine/daynight.js";
import {
  createEmptyGrid,
  renderSand,
  renderDecorations,
  renderTrails,
  renderFood,
  renderFish,
  renderBubbles,
  renderFrameToAnsi,
  renderStatusToAnsi,
} from "./engine/renderer.js";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createBubble(tankWidth: number, tankHeight: number): BubbleInstance {
  return {
    id: generateId(),
    x: Math.floor(Math.random() * (tankWidth - 4)) + 2,
    y: tankHeight - 2,
    char: Math.random() > 0.5 ? "o" : "°",
  };
}

// Check achievements and apply unlocks inline
function applyAchievementCheck(state: AppState): AppState {
  const newlyUnlocked = checkAchievements(
    state.aquarium,
    state.aquarium.achievements ?? {}
  );
  if (newlyUnlocked.length === 0) return state;

  const first = newlyUnlocked[0]!;
  const updatedAchievements = { ...(state.aquarium.achievements ?? {}) };
  for (const a of newlyUnlocked) {
    updatedAchievements[a.id] = new Date().toISOString();
  }

  return {
    ...state,
    aquarium: {
      ...state.aquarium,
      achievements: updatedAchievements,
    },
    notification: `${first.icon} Achievement: ${first.name}!`,
    notificationTick: state.tick,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "TICK": {
      const newTick = state.tick + 1;
      const tod = getTimeOfDay();
      const speedMul = getSpeedMultiplier(tod);

      let fishes = state.aquarium.fishes.map((fish) =>
        updateFishPosition(
          fish,
          newTick,
          state.tankWidth,
          state.tankHeight,
          speedMul,
          state.foodParticles
        )
      );
      fishes = applyRepulsion(fishes, state.tankWidth, state.tankHeight);

      // Distribute EXP to fish every 100th tick
      if (newTick % 100 === 0 && state.aquarium.totalExp > 0) {
        fishes = fishes.map((fish) => {
          const share = Math.max(
            1,
            Math.floor(state.aquarium.totalExp / (fishes.length * 50))
          );
          const newExp = fish.exp + share;
          const { currentLevel } = expToNextLevel(newExp);
          return { ...fish, exp: newExp, level: currentLevel };
        });
      }

      // Check evolutions
      let notification = state.notification;
      let notificationTick = state.notificationTick;
      fishes = fishes.map((fish) => {
        const species = getSpecies(fish.speciesId);
        if (species?.evolvesTo && fish.level >= species.evolveLevel) {
          const newSpecies = getSpecies(species.evolvesTo);
          if (newSpecies) {
            notification = `${fish.name} evolved into ${newSpecies.name}!`;
            notificationTick = newTick;
            return {
              ...fish,
              speciesId: species.evolvesTo,
              evolvedFrom: fish.speciesId,
            };
          }
        }
        return fish;
      });

      if (notification && newTick - notificationTick > 40) {
        notification = null;
      }

      // Update bubbles
      let bubbles = state.bubbles
        .map((b) => ({
          ...b,
          y: b.y - 0.2,
          x: b.x + (Math.random() - 0.5) * 0.2,
        }))
        .filter((b) => b.y > 0);

      if (Math.random() < 0.06) {
        bubbles.push(createBubble(state.tankWidth, state.tankHeight));
      }

      // Update food particles
      let foodParticles = state.foodParticles
        .map((f) => ({
          ...f,
          y: f.y + 0.15,
          x: f.x + (Math.random() - 0.5) * 0.1,
        }))
        .filter((f) => f.y < state.tankHeight - 2);

      // Check fish eating food
      let feedCount = state.aquarium.feedCount;
      let updatedFishes = [...fishes];
      const eatenIds = new Set<string>();

      for (const food of foodParticles) {
        for (let fi = 0; fi < updatedFishes.length; fi++) {
          const fish = updatedFishes[fi]!;
          const species = getSpecies(fish.speciesId);
          if (!species) continue;
          const cx = fish.position.x + species.width / 2;
          const cy = fish.position.y + species.height / 2;
          const dx = food.x - cx;
          const dy = food.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2.5) {
            eatenIds.add(food.id);
            feedCount++;
            updatedFishes[fi] = {
              ...fish,
              exp: fish.exp + EXP_VALUES.FOOD_BONUS,
              eatAnimTick: newTick,
            };
            break;
          }
        }
      }

      if (eatenIds.size > 0) {
        foodParticles = foodParticles.filter((f) => !eatenIds.has(f.id));
      }

      let result: AppState = {
        ...state,
        tick: newTick,
        aquarium: {
          ...state.aquarium,
          fishes: updatedFishes,
          feedCount,
        },
        bubbles,
        foodParticles,
        notification,
        notificationTick,
      };

      // Check achievements every 100 ticks
      if (newTick % 100 === 0) {
        result = applyAchievementCheck(result);
      }

      return result;
    }

    case "DROP_FOOD": {
      if (state.foodParticles.length >= 10) {
        return {
          ...state,
          notification: "Too much food! Wait for fish to eat.",
          notificationTick: state.tick,
        };
      }
      if (state.tick - state.lastFeedTick < 10) {
        return state; // cooldown
      }

      const food: FoodParticle = {
        id: generateId(),
        x: Math.floor(Math.random() * (state.tankWidth - 4)) + 2,
        y: 1,
        char: Math.random() > 0.5 ? "*" : ".",
        color: "yellowBright",
      };

      return {
        ...state,
        foodParticles: [...state.foodParticles, food],
        lastFeedTick: state.tick,
      };
    }

    case "ADD_EXP": {
      const result: AppState = {
        ...state,
        aquarium: {
          ...state.aquarium,
          totalExp: state.aquarium.totalExp + action.amount,
          spendableExp: state.aquarium.spendableExp + action.amount,
          stats: {
            ...state.aquarium.stats,
            totalExpEarned:
              (state.aquarium.stats.totalExpEarned ?? 0) + action.amount,
          },
        },
        notification: `+${action.amount} EXP from ${action.source}!`,
        notificationTick: state.tick,
      };
      return applyAchievementCheck(result);
    }

    case "SYNC_STATS": {
      const result: AppState = {
        ...state,
        aquarium: {
          ...state.aquarium,
          stats: {
            ...state.aquarium.stats,
            totalConversations: action.stats.totalConversations,
            totalToolUses: action.stats.totalToolUses,
            totalMessages: action.stats.totalMessages,
            totalExpEarned:
              (state.aquarium.stats.totalExpEarned ?? 0) + action.expGained,
          },
          totalExp: state.aquarium.totalExp + action.expGained,
          spendableExp: state.aquarium.spendableExp + action.expGained,
          lastHistoryOffset: action.offset,
          lastSyncedAt: new Date().toISOString(),
        },
        notification:
          action.expGained > 0
            ? `Synced! +${action.expGained} EXP from Claude activity`
            : "Synced - no new activity",
        notificationTick: state.tick,
      };
      return applyAchievementCheck(result);
    }

    case "BUY_FISH": {
      const species = getSpecies(action.speciesId);
      if (!species) return state;

      const tank = getTankLevel(state.aquarium.tankLevel);
      if (state.aquarium.fishes.length >= tank.maxFish) return state;
      if (state.aquarium.spendableExp < species.cost) return state;

      const newFish = {
        id: generateId(),
        speciesId: action.speciesId,
        name: species.name,
        level: 1,
        exp: 0,
        position: {
          x:
            Math.floor(
              Math.random() * Math.max(1, state.tankWidth - species.width - 4)
            ) + 2,
          y:
            Math.floor(
              Math.random() * Math.max(1, state.tankHeight - species.height - 2)
            ) + 1,
        },
        direction: (Math.random() > 0.5 ? "right" : "left") as
          | "right"
          | "left",
        velocity: {
          vx: (Math.random() > 0.5 ? 1 : -1) * species.speed,
          vy: 0,
        },
        phase: Math.random() * Math.PI * 2,
        evolvedFrom: null,
        createdAt: new Date().toISOString(),
        eatAnimTick: 0,
      };

      const result: AppState = {
        ...state,
        aquarium: {
          ...state.aquarium,
          fishes: [...state.aquarium.fishes, newFish],
          spendableExp: state.aquarium.spendableExp - species.cost,
          stats: {
            ...state.aquarium.stats,
            totalExpSpent:
              (state.aquarium.stats.totalExpSpent ?? 0) + species.cost,
          },
          unlockedSpecies: state.aquarium.unlockedSpecies.includes(
            action.speciesId
          )
            ? state.aquarium.unlockedSpecies
            : [...state.aquarium.unlockedSpecies, action.speciesId],
        },
        notification: `Welcome ${species.name} to the aquarium!`,
        notificationTick: state.tick,
      };
      return applyAchievementCheck(result);
    }

    case "BUY_DECORATION": {
      const items = getShopItems(state.aquarium);
      const tankItem = items.find(
        (i) => i.type === "tank" && i.id === action.decorationId
      );

      if (tankItem) {
        if (state.aquarium.spendableExp < tankItem.cost) return state;
        const newLevel = state.aquarium.tankLevel + 1;
        return {
          ...state,
          aquarium: {
            ...state.aquarium,
            tankLevel: newLevel,
            spendableExp: state.aquarium.spendableExp - tankItem.cost,
            stats: {
              ...state.aquarium.stats,
              totalExpSpent:
                (state.aquarium.stats.totalExpSpent ?? 0) + tankItem.cost,
            },
          },
          notification: `Tank upgraded to Level ${newLevel}!`,
          notificationTick: state.tick,
        };
      }

      const allDecos = getAllDecorations();
      const deco = allDecos.find((d) => d.id === action.decorationId);
      if (!deco) return state;
      if (state.aquarium.spendableExp < deco.cost) return state;

      const tank = getTankLevel(state.aquarium.tankLevel);
      if (state.aquarium.decorations.length >= tank.maxDecorations)
        return state;

      const placed = {
        id: generateId(),
        decorationId: action.decorationId,
        position: {
          x:
            Math.floor(Math.random() * (state.tankWidth - deco.width - 4)) + 2,
          y: 0,
        },
      };

      const result: AppState = {
        ...state,
        aquarium: {
          ...state.aquarium,
          decorations: [...state.aquarium.decorations, placed],
          spendableExp: state.aquarium.spendableExp - deco.cost,
          stats: {
            ...state.aquarium.stats,
            totalExpSpent:
              (state.aquarium.stats.totalExpSpent ?? 0) + deco.cost,
          },
          unlockedDecorations: state.aquarium.unlockedDecorations.includes(
            action.decorationId
          )
            ? state.aquarium.unlockedDecorations
            : [...state.aquarium.unlockedDecorations, action.decorationId],
        },
        notification: `Added ${deco.name}!`,
        notificationTick: state.tick,
      };
      return applyAchievementCheck(result);
    }

    case "SET_VIEW":
      return { ...state, view: action.view, selectedIndex: 0 };

    case "SET_SELECTED":
      return { ...state, selectedIndex: action.index };

    case "SET_NOTIFICATION":
      return {
        ...state,
        notification: action.message,
        notificationTick: state.tick,
      };

    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null };

    case "RESIZE":
      return { ...state, tankWidth: action.width, tankHeight: action.height };

    case "NAME_FISH": {
      return {
        ...state,
        aquarium: {
          ...state.aquarium,
          fishes: state.aquarium.fishes.map((f) =>
            f.id === action.fishId ? { ...f, name: action.name } : f
          ),
        },
        view: "fishinfo",
      };
    }

    case "LOAD_STATE":
      return { ...state, aquarium: action.state };

    default:
      return state;
  }
}

export function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const cols = stdout?.columns ?? 80;
  const rows = stdout?.rows ?? 24;

  const tankW = Math.max(cols - 2, 30);
  const tankH = Math.max(rows - 7, 10);

  const savedState = useRef(loadState());

  const [state, dispatch] = useReducer(reducer, {
    aquarium: savedState.current,
    view: "aquarium",
    selectedIndex: 0,
    notification: null,
    notificationTick: 0,
    bubbles: [],
    foodParticles: [],
    lastFeedTick: 0,
    tick: 0,
    tankWidth: tankW,
    tankHeight: tankH,
    selectedFishId: null,
    namingFishId: null,
  } as AppState);

  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Direct-to-stdout rendering (aquarium view) ──────────────────────
  useEffect(() => {
    if (state.view !== "aquarium") return;

    process.stdout.write("\x1b[?25l");

    const draw = () => {
      const s = stateRef.current;
      const innerW = Math.max(s.tankWidth - 2, 10);
      const innerH = Math.max(s.tankHeight - 2, 5);

      const tod = getTimeOfDay();
      const grid = createEmptyGrid(innerW, innerH, getWaterColor(tod));
      renderSand(grid, innerW, innerH, getSandColor(tod));
      renderDecorations(grid, s.aquarium.decorations, innerH);
      renderTrails(grid, s.aquarium.fishes);
      renderFood(grid, s.foodParticles);
      renderFish(grid, s.aquarium.fishes, s.tick);
      renderBubbles(grid, s.bubbles, getBubbleColor(tod));

      const { currentLevel, expIntoLevel, expNeeded, progress } =
        expToNextLevel(s.aquarium.totalExp);
      const tank = getTankLevel(s.aquarium.tankLevel);

      const frame =
        renderFrameToAnsi(
          grid,
          s.tankWidth,
          s.tankHeight,
          2,
          getWaterBgAnsi(tod)
        ) +
        renderStatusToAnsi(
          2 + innerH + 2,
          innerW,
          s.aquarium.totalExp,
          s.aquarium.spendableExp,
          currentLevel,
          expIntoLevel,
          expNeeded,
          progress,
          s.aquarium.fishes.length,
          tank.maxFish,
          s.aquarium.tankLevel,
          s.notification,
          true
        );

      process.stdout.write(frame);
    };

    draw();
    const interval = setInterval(draw, 150);

    return () => {
      clearInterval(interval);
      process.stdout.write("\x1b[?25h");
    };
  }, [state.view]);

  // ── Game physics loop ───────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      saveState(stateRef.current.aquarium);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // On startup: just record the current file offset so we only
  // earn EXP from activity that happens while the aquarium is open.
  useEffect(() => {
    (async () => {
      try {
        const result = await scanClaudeActivity(
          savedState.current.lastHistoryOffset
        );
        // Skip past all existing history — only update the offset, no EXP
        dispatch({
          type: "SYNC_STATS",
          stats: {
            totalConversations:
              savedState.current.stats.totalConversations +
              result.totalConversations,
            totalToolUses:
              savedState.current.stats.totalToolUses + result.totalToolUses,
            totalMessages:
              savedState.current.stats.totalMessages + result.totalMessages,
          },
          expGained: 0, // no free EXP from past activity
          offset: result.newOffset,
        });
      } catch {
        // ignore
      }
    })();
  }, []);

  // Watch for live Claude activity
  useEffect(() => {
    const unwatch = watchHistory((exp) => {
      dispatch({ type: "ADD_EXP", amount: exp, source: "Claude Code" });
    });
    return () => {
      if (unwatch) unwatch();
    };
  }, []);

  // Auto-sync every 5s
  const lastOffsetRef = useRef(state.aquarium.lastHistoryOffset);
  lastOffsetRef.current = state.aquarium.lastHistoryOffset;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const result = await quickScan(lastOffsetRef.current);
        if (result.expGained > 0) {
          dispatch({
            type: "SYNC_STATS",
            stats: {
              totalConversations:
                stateRef.current.aquarium.stats.totalConversations +
                result.conversations,
              totalToolUses: stateRef.current.aquarium.stats.totalToolUses,
              totalMessages: stateRef.current.aquarium.stats.totalMessages,
            },
            expGained: result.expGained,
            offset: result.newOffset,
          });
        }
      } catch {
        // ignore
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Resize
  useEffect(() => {
    const onResize = () => {
      const w = stdout?.columns ?? 80;
      const h = stdout?.rows ?? 24;
      dispatch({
        type: "RESIZE",
        width: Math.max(w - 2, 30),
        height: Math.max(h - 7, 10),
      });
      if (stateRef.current.view === "aquarium") {
        process.stdout.write("\x1b[2J");
      }
    };
    stdout?.on("resize", onResize);
    return () => {
      stdout?.off("resize", onResize);
    };
  }, [stdout]);

  // Resync handler
  const handleResync = useCallback(async () => {
    try {
      const result = await scanClaudeActivity(0);
      dispatch({
        type: "SYNC_STATS",
        stats: {
          totalConversations: result.totalConversations,
          totalToolUses: result.totalToolUses,
          totalMessages: result.totalMessages,
        },
        expGained: result.expGained,
        offset: result.newOffset,
      });
    } catch {
      dispatch({ type: "SET_NOTIFICATION", message: "Resync failed" });
    }
  }, []);

  // Keyboard
  useInput((input, key) => {
    if (state.view === "aquarium") {
      if (input === "q" || input === "Q") {
        saveState(state.aquarium);
        process.stdout.write("\x1b[?25h\x1b[2J\x1b[H");
        exit();
        return;
      }
      if (input === "s" || input === "S") {
        process.stdout.write("\x1b[2J\x1b[H");
        dispatch({ type: "SET_VIEW", view: "shop" });
        return;
      }
      if (input === "i" || input === "I") {
        process.stdout.write("\x1b[2J\x1b[H");
        dispatch({ type: "SET_VIEW", view: "fishinfo" });
        return;
      }
      if (input === "f" || input === "F") {
        dispatch({ type: "DROP_FOOD" });
        return;
      }
      if (input === "a" || input === "A") {
        process.stdout.write("\x1b[2J\x1b[H");
        dispatch({ type: "SET_VIEW", view: "achievements" });
        return;
      }
      if (input === "t" || input === "T") {
        process.stdout.write("\x1b[2J\x1b[H");
        dispatch({ type: "SET_VIEW", view: "stats" });
        return;
      }
      if (input === "r" || input === "R") {
        handleResync();
        return;
      }
    } else {
      if (key.escape) {
        process.stdout.write("\x1b[2J\x1b[H");
        process.stdout.write(
          "\x1b[1;1H\x1b[96m\x1b[1m          Claude Aquarium\x1b[0m"
        );
        dispatch({ type: "SET_VIEW", view: "aquarium" });
        return;
      }
      if (key.upArrow) {
        dispatch({
          type: "SET_SELECTED",
          index: Math.max(0, state.selectedIndex - 1),
        });
        return;
      }
      if (key.downArrow) {
        dispatch({ type: "SET_SELECTED", index: state.selectedIndex + 1 });
        return;
      }
      if (key.return) {
        if (state.view === "shop") {
          const items = getShopItems(state.aquarium);
          const item = items[state.selectedIndex];
          if (!item) return;

          const tank = getTankLevel(state.aquarium.tankLevel);

          if (state.aquarium.spendableExp < item.cost) {
            dispatch({
              type: "SET_NOTIFICATION",
              message: `Not enough EXP! Need ${item.cost}, have ${state.aquarium.spendableExp}`,
            });
          } else if (
            item.type === "fish" &&
            state.aquarium.fishes.length >= tank.maxFish
          ) {
            dispatch({
              type: "SET_NOTIFICATION",
              message: `Tank full! Max ${tank.maxFish} fish at Tank Lv.${state.aquarium.tankLevel}. Upgrade your tank first!`,
            });
          } else if (
            item.type === "deco" &&
            state.aquarium.decorations.length >= tank.maxDecorations
          ) {
            dispatch({
              type: "SET_NOTIFICATION",
              message: `No room! Max ${tank.maxDecorations} decorations at Tank Lv.${state.aquarium.tankLevel}. Upgrade your tank!`,
            });
          } else if (item.type === "fish") {
            dispatch({ type: "BUY_FISH", speciesId: item.id });
          } else {
            dispatch({ type: "BUY_DECORATION", decorationId: item.id });
          }
        }
        return;
      }
    }
  });

  // ── Render ────────────────────────────────────────────────────────
  if (state.view === "aquarium") {
    return <Box />;
  }

  return (
    <Box flexDirection="column">
      <Box justifyContent="center">
        <Text color="cyanBright" bold>
          Claude Aquarium
        </Text>
      </Box>

      {state.notification && (
        <Box justifyContent="center" paddingY={0}>
          <Text color="yellowBright" bold>
            {state.notification}
          </Text>
        </Box>
      )}

      {state.view === "shop" && (
        <ShopView
          state={state.aquarium}
          selectedIndex={state.selectedIndex}
          tab="fish"
        />
      )}

      {state.view === "fishinfo" && (
        <FishInfoView
          state={state.aquarium}
          selectedIndex={state.selectedIndex}
        />
      )}

      {state.view === "achievements" && (
        <AchievementsView
          state={state.aquarium}
          selectedIndex={state.selectedIndex}
        />
      )}

      {state.view === "stats" && <StatsView state={state.aquarium} />}
    </Box>
  );
}
