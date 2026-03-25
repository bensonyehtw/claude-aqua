# Claude Aqua — Development Guide

## Setup

```bash
# Install dependencies
npm install

# Run the app
npm start

# Run with file watching (auto-restart on changes)
npm run dev

# Type check
npx tsc --noEmit
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `react` | UI component model |
| `ink` | React renderer for terminal |
| `ink-text-input` | Text input component (for fish naming) |
| `tsx` | TypeScript execution without build |
| `typescript` | Type checking |
| `@types/react` | React type definitions |
| `@types/node` | Node.js type definitions |

## Adding a New Fish Species

Edit `src/data/fishSpecies.ts`:

```typescript
newfish: {
  id: "newfish",
  name: "New Fish",
  description: "A brand new fish",
  frames: makeFrames([
    ["right-facing ASCII art line 1", "line 2"],  // frame 1
    ["alternate frame line 1", "line 2"],           // frame 2
  ]),
  width: 10,        // max width of ASCII art
  height: 2,        // number of lines
  color: "cyan",    // Ink color name
  speed: 0.8,       // movement speed
  amplitude: 1.0,   // vertical wave amplitude (0 = bottom dweller)
  frequency: 0.1,   // vertical wave frequency (0 = bottom dweller)
  cost: 500,        // EXP cost in shop
  unlockLevel: 5,   // min tank level to appear
  evolvesTo: null,   // species ID or null
  evolveLevel: 0,    // level to evolve (0 if no evolution)
  rarity: "uncommon",
},
```

The `makeFrames()` helper auto-generates left-facing art by mirroring characters (`>` ↔ `<`, `/` ↔ `\`, etc.).

**Bottom dwellers:** Set `amplitude: 0` and `frequency: 0`. The movement engine will pin them to the sand floor.

## Adding a New Decoration

Edit `src/data/decorations.ts`:

```typescript
newdeco: {
  id: "newdeco",
  name: "New Decoration",
  art: ["line1", "line2", "line3"],
  width: 5,
  height: 3,
  cost: 100,
  color: "green",
},
```

Decorations are anchored to the bottom of the tank automatically.

## Adding a New Achievement

Edit `src/data/achievements.ts`:

```typescript
{
  id: "unique_id",
  name: "Display Name",
  description: "How to unlock",
  icon: "🏆",
  condition: (state) => state.someField >= someValue,
},
```

Conditions receive the full `AquariumState` and return a boolean. They're checked lazily (every 100 ticks and after state-changing events).

## Adding a New View

1. Add the view name to `AppView` type in `src/types/aquarium.ts`
2. Create a component in `src/components/YourView.tsx`
3. In `App.tsx`:
   - Import the component
   - Add a keyboard shortcut in `useInput`
   - Add rendering in the JSX return block
4. Update the controls line in `renderStatusToAnsi` in `src/engine/renderer.ts`

## Rendering Pipeline

The aquarium view composites layers onto a 2D grid in this order:

```
1. createEmptyGrid()    — empty water cells
2. renderSand()         — bottom row texture
3. renderDecorations()  — static bottom art
4. renderTrails()       — wake effects behind fast fish
5. renderFood()         — falling food particles
6. renderFish()         — fish ASCII art + eat animation
7. renderBubbles()      — rising bubble particles
```

The grid is then converted to ANSI escape sequences by `renderFrameToAnsi()` and written directly to stdout.

## State Flow

```
User Input → dispatch(Action) → reducer() → new AppState
                                     ↓
                              stateRef.current
                                     ↓
                              draw() reads ref → ANSI output
```

The reducer is the single source of truth. The draw loop reads from a ref to avoid triggering React re-renders (which would cause Ink flickering).

## Save File Format

`aquarium-save.json` — JSON with 2-space indentation. Key fields:

```json
{
  "version": 2,
  "totalExp": 1234,
  "spendableExp": 800,
  "fishes": [{ "id": "...", "speciesId": "guppy", "level": 3, ... }],
  "decorations": [{ "id": "...", "decorationId": "rock1", ... }],
  "achievements": { "first_splash": "2026-03-25T..." },
  "lastHistoryOffset": 5678,
  "stats": { "totalConversations": 42, ... }
}
```

When adding new fields, update `migrateState()` in `saveManager.ts` with a default value to maintain backward compatibility.

## Testing

No test framework is set up. To test manually:

```bash
# Run the app
npm start

# Delete save to start fresh
rm aquarium-save.json aquarium-save.json.bak

# Type check
npx tsc --noEmit
```

Key things to verify:
- Fish stay within tank bounds (especially large fish like Whale)
- Food chasing and eat animation work
- Day/night colors change based on system time
- EXP only grows from activity while app is open
- Save/load preserves all state correctly
- Achievement notifications trigger at the right time
