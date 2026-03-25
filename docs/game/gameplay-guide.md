# Claude Aqua — Gameplay Guide

## What is Claude Aqua?

Claude Aqua is a virtual aquarium that lives in your terminal. Your fish grow and evolve based on your **real Claude Code usage** — the more you code with Claude, the more your aquarium thrives. But there's a catch: you must have the aquarium open to earn EXP.

## Getting Started

```bash
npm start
```

You start with two fish:
- **Bubbles** — a Guppy
- **Zippy** — a Minnow

Open the aquarium in one terminal, use Claude Code in another, and watch your EXP grow.

## Controls

| Key | Action |
|-----|--------|
| `S` | Open the Shop |
| `I` | View Fish Info |
| `F` | Drop Food |
| `A` | View Achievements |
| `T` | View Stats |
| `R` | Manual Resync |
| `Q` | Save & Quit |
| `ESC` | Back to Aquarium |
| `↑ / ↓` | Navigate menus |
| `Enter` | Select / Buy |

## EXP System

EXP is earned **only while the aquarium is running**. Activity from Claude Code is detected in real-time:

| Activity | EXP |
|----------|-----|
| Conversation started | +5 |
| User message sent | +1 |
| Tool use by Claude | +2 |
| Fish eats food | +1 |

EXP that you earn is split into two pools:
- **Total EXP** — lifetime counter, determines your aquarium level
- **Spendable EXP** — currency used to buy fish, decorations, and tank upgrades

## Leveling

The leveling curve is steep. Each level requires 1.6x more EXP than the previous one, starting at 50 EXP for Level 2. High levels take sustained daily Claude usage.

| Level | Cumulative EXP Needed |
|-------|----------------------|
| 2 | 50 |
| 5 | ~250 |
| 10 | ~3,500 |
| 15 | ~35,000 |
| 20 | ~340,000 |

## Fish

### Species & Evolution

Fish evolve when they reach a certain level. Each fish earns its own EXP passively while the aquarium runs.

**Evolution Chain: Guppy Line**
```
Guppy (free) → Neon Tetra (Lv.8) → Angelfish (Lv.25)
```

**Evolution Chain: Minnow Line**
```
Minnow (free) → Goldfish (Lv.8) → Koi (Lv.25) → Dragon Koi (Lv.40)
```

**Evolution Chain: Clownfish Line**
```
Clownfish (100 EXP) → Butterflyfish (Lv.15)
```

**Evolution Chain: Pufferfish Line**
```
Pufferfish (120 EXP) → Blowfish (Lv.18)
```

**Evolution Chain: Crab Line**
```
Crab (200 EXP) → King Crab (Lv.20)
```

**Standalone Species**
- Jellyfish — 1,500 EXP (rare)
- Whale — 10,000 EXP (legendary)

### Rarity

| Rarity | Examples |
|--------|----------|
| Common | Guppy, Minnow, Clownfish, Pufferfish, Crab |
| Uncommon | Goldfish, Butterflyfish, Blowfish, King Crab |
| Rare | Angelfish, Koi, Jellyfish |
| Legendary | Dragon Koi, Whale |

### Special Behaviors

- **Crabs** walk along the sand floor instead of swimming
- **Fast fish** leave wake trails behind them
- **All fish** chase food when you drop it with `[F]`
- **Eating animation** — fish flash yellow with spark particles when they catch food

## Feeding

Press `F` to drop food into the tank. Food particles drift down slowly. Fish will aggressively chase and eat nearby food.

- Max 10 food particles at a time
- ~1.5 second cooldown between drops
- Each eaten food gives +1 EXP to the fish that ate it
- Fish flash and sparkle when eating

## Tank Upgrades

Your tank starts at Level 1. Upgrade to hold more fish and decorations.

| Tank Level | Max Fish | Max Decorations | Cost |
|------------|----------|-----------------|------|
| 1 | 3 | 3 | Free |
| 2 | 5 | 5 | 500 |
| 3 | 8 | 8 | 2,000 |
| 4 | 12 | 12 | 6,000 |
| 5 | 16 | 16 | 15,000 |

## Decorations

Available in the shop. Decorations are placed at the bottom of the tank.

| Decoration | Cost |
|------------|------|
| Shell | 30 |
| Rock | 50 |
| Seaweed | 60 |
| Tall Seaweed | 100 |
| Coral | 150 |
| Brain Coral | 180 |
| Air Bubbler | 220 |
| Anchor | 250 |
| Treasure Chest | 300 |
| Castle | 800 |

## Day/Night Cycle

The aquarium follows your real system clock:

| Time | Period | Effect |
|------|--------|--------|
| 6am–5pm | Day | Blue water, normal speed |
| 6pm–7pm | Dusk | Gray water, fish slow to 80% |
| 8pm–5am | Night | Dark water, fish slow to 60% |

## Achievements

12 achievements to unlock. Press `A` to view progress.

| Achievement | How to Unlock |
|-------------|---------------|
| First Splash | Buy your first fish |
| School | Have 5 fish at once |
| Deep Pockets | Earn 1,000 total EXP |
| Big Spender | Earn 10,000 total EXP |
| Night Owl | Use the aquarium at night |
| Evolutionist | Evolve a fish |
| Feeding Frenzy | Feed fish 10 times |
| Decorator | Place 5 decorations |
| Full Tank | Fill tank to capacity |
| Legendary | Own a legendary fish |
| Whale Watcher | Own a Whale |
| Claude Veteran | Track 50 Claude conversations |

## Tips

- Keep the aquarium open in a side terminal while you work with Claude Code
- Feed your fish regularly — it's free EXP
- Save up for tank upgrades early to unlock more fish slots
- Crabs are cheap and fun — they scuttle along the bottom
- The whale is the ultimate goal at 10,000 EXP
- Your game auto-saves every 30 seconds and on quit
