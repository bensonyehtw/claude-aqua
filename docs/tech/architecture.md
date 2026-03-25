# Claude Aqua — Technical Architecture

## Tech Stack

- **React 18** + **Ink 5** — Terminal UI framework (same as Claude Code)
- **TypeScript** — Strict mode
- **tsx** — Runtime execution without build step

## Project Structure

```
src/
├── index.tsx                   # Entry point, splash screen, Ink render
├── App.tsx                     # Root component, state reducer, game loops
│
├── types/
│   ├── aquarium.ts             # Core types: AppState, AquariumState, FishInstance, Action
│   └── species.ts              # FishSpecies, DecorationDef interfaces
│
├── engine/
│   ├── renderer.ts             # 2D grid compositor, ANSI output
│   ├── movement.ts             # Fish physics, food chasing, boundary clamping
│   └── daynight.ts             # Time-of-day utilities
│
├── data/
│   ├── fishSpecies.ts          # Species definitions, ASCII art, evolution chains
│   ├── decorations.ts          # Decoration catalog
│   ├── expTable.ts             # Leveling curve, EXP values, tank levels
│   └── achievements.ts         # Achievement definitions and condition checker
│
├── services/
│   ├── claudeTracker.ts        # Reads ~/.claude/ for activity data
│   └── saveManager.ts          # JSON save/load with migration
│
└── components/
    ├── Aquarium.tsx             # Ink-based aquarium (unused, kept for reference)
    ├── StatusBar.tsx            # Ink-based status bar (unused)
    ├── Shop.tsx                 # Shop overlay (Ink)
    ├── FishInfo.tsx             # Fish detail view (Ink)
    ├── AchievementsView.tsx     # Achievement list (Ink)
    └── StatsView.tsx            # Activity stats (Ink)
```

## Rendering Architecture

The app uses a **dual rendering approach** to avoid terminal flickering:

### Aquarium View — Direct ANSI stdout

When viewing the aquarium, Ink returns an empty `<Box />`. All rendering is done by writing ANSI escape sequences directly to `process.stdout`:

1. A **physics loop** runs every 150ms, dispatching `TICK` actions to update state
2. A **draw loop** runs every 150ms, reading state from a ref and compositing:
   ```
   createEmptyGrid() → renderSand() → renderDecorations() → renderTrails()
   → renderFood() → renderFish() → renderBubbles() → renderFrameToAnsi()
   ```
3. `renderFrameToAnsi()` uses cursor positioning (`\x1b[row;colH`) to overwrite each cell in-place — no full-screen clear, no flicker

### Menu Views — Ink Components

Shop, FishInfo, Achievements, and Stats views use standard React/Ink components. The screen is cleared when switching between aquarium and menu views.

## State Management

All state is managed via `useReducer` in `App.tsx`.

### AppState (runtime)

```typescript
{
  aquarium: AquariumState    // persisted game state
  view: AppView              // current UI view
  selectedIndex: number      // menu cursor position
  notification: string|null  // temporary message
  bubbles: BubbleInstance[]  // visual-only particles
  foodParticles: FoodParticle[]
  tick: number               // global tick counter
  tankWidth/Height: number   // terminal dimensions
}
```

### AquariumState (persisted)

```typescript
{
  totalExp, spendableExp     // dual EXP pools
  fishes: FishInstance[]     // all fish with position, velocity, level
  decorations, achievements
  feedCount                  // lifetime feed count
  lastHistoryOffset          // byte offset for incremental file scanning
  stats: { conversations, messages, toolUses, expEarned, expSpent }
}
```

### Key Actions

| Action | Trigger | Effect |
|--------|---------|--------|
| `TICK` | 150ms interval | Physics, evolution checks, food collision |
| `DROP_FOOD` | `F` key | Spawn food particle |
| `BUY_FISH` | Shop enter | Create fish, deduct EXP |
| `SYNC_STATS` | 5s polling / startup | Update from Claude activity |
| `ADD_EXP` | File watcher | Real-time EXP from Claude |

## Fish Movement Engine

`src/engine/movement.ts`

### Normal Swimming

- Horizontal: constant velocity (`vx`) based on species speed
- Vertical: sine wave oscillation (`amplitude * sin(tick * frequency + phase)`)
- Random speed variation: 1% chance per tick, 80-120% of base speed
- Soft repulsion between fish to prevent overlap

### Food Chasing

When food exists within 25 units:
- Fish overrides normal velocity, beelines toward food at 1.5x speed
- Flips direction to face the food
- Sine wave motion disabled during chase

### Bottom Dwellers

Species with `amplitude: 0` and `frequency: 0` (crabs):
- Pinned to the sand floor (`y = maxY`)
- No vertical movement
- Only horizontal scuttling

### Boundary Clamping

Hard clamp on all edges. `maxX` and `maxY` use `Math.max()` to prevent negative values for large fish.

## Claude Activity Tracking

`src/services/claudeTracker.ts`

### Data Sources

- `~/.claude/history.jsonl` — one JSON line per conversation
- `~/.claude/projects/*/` — session JSONL files with message types

### Tracking Strategy

1. **On startup:** scan history to record current file offset — award **0 EXP** (no retroactive rewards)
2. **Live watcher:** `fs.watch` on `history.jsonl` with 500ms debounce
3. **5-second polling:** `quickScan()` reads new bytes from last offset
4. **Manual resync:** `R` key triggers full scan from offset 0

EXP is only earned while the aquarium is running.

### EXP Calculation

```
conversations × 5 + messages × 1 + toolUses × 2
```

## Save System

`src/services/saveManager.ts`

- **File:** `aquarium-save.json` in working directory
- **Backup:** `.bak` copy created before each save
- **Auto-save:** every 30 seconds + on quit
- **Migration:** `migrateState()` adds default values for new fields, ensuring backward compatibility

## Day/Night Cycle

`src/engine/daynight.ts`

Uses `new Date().getHours()` to determine time period:

| Period | Hours | Water BG | Fish Speed |
|--------|-------|----------|------------|
| Day | 6-17 | Blue (`\x1b[44m`) | 1.0x |
| Dusk | 18-19 | Dark Gray (`\x1b[100m`) | 0.8x |
| Night | 20-5 | Black (`\x1b[40m`) | 0.6x |

## Achievement System

`src/data/achievements.ts`

- 12 achievements with predicate-based conditions
- Checked lazily: every 100 ticks + after buy/evolve/sync events
- `checkAchievements(state, unlocked)` returns newly unlocked list
- Unlocks stored as `{ achievementId: ISO date string }`

## Performance Notes

- **10 FPS target** (150ms tick) — smooth enough for ASCII animation
- Grid compositing: O(width × height) per frame, typically ~80×15 = 1,200 cells
- Color runs optimized: only emit ANSI codes when color changes
- Food collision: max 10 particles × max 16 fish = 160 distance checks
- Achievement checking: 12 simple predicates, not every tick
- Session file scanning: capped at 1,000 lines per file
