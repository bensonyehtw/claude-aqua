# Claude Aqua

A terminal aquarium that comes alive from your [Claude Code](https://docs.anthropic.com/en/docs/claude-code) activity. Fish grow, evolve, and thrive as you code — every conversation, message, and tool use earns EXP that powers your aquatic world.

```
   ╔══════════════════════════════════════════════════╗
   ║  ~~ Claude Aqua ~~          Tank Lv.3  ⭐ 2450  ║
   ║                                                  ║
   ║        ><>          ,---,            /\          ║
   ║                    /     \          /  \         ║
   ║    ><|>~           ~~~~~~~     ><  >             ║
   ║                     | | |          \  /          ║
   ║  ,__,               | | |           \/           ║
   ║ >    >=<                                         ║
   ║  '--'         ><>              ><~               ║
   ║                                                  ║
   ║ ~▓~ ⌂  ~▓~  ◈  ~▓~  ▒▓▒  ~▓~  ◈  ⌂  ~▓~  ◈   ║
   ╚══════════════════════════════════════════════════╝
```

## Features

- **Live Activity Tracking** — Monitors your Claude Code usage in real-time and converts it into EXP
- **Fish Evolution** — Multiple evolution chains: Guppy -> Neon Tetra -> Angelfish, Minnow -> Goldfish -> Koi -> Dragon Koi, and more
- **15 Fish Species** — From tiny Guppies to legendary Whales and Dragon Koi, each with unique ASCII art
- **Day/Night Cycle** — Water color and fish behavior change based on your system clock
- **Shop System** — Spend EXP on new fish, decorations, and tank upgrades
- **12 Achievements** — Unlock milestones like Evolutionist, Whale Watcher, and Claude Veteran
- **Persistent Saves** — Auto-saves every 30 seconds; pick up right where you left off
- **Bottom Dwellers** — Crabs scuttle along the sea floor with their own movement physics

## Quick Start

```bash
# Clone the repo
git clone https://github.com/bensonyehtw/claude-aqua.git
cd claude-aqua

# Install dependencies
npm install

# Launch the aquarium
npm start
```

You'll start with two fish — **Bubbles** (Guppy) and **Zippy** (Minnow). Keep the aquarium running in one terminal while you use Claude Code in another to earn EXP.

## How It Works

Claude Aqua reads your local Claude Code activity from `~/.claude/` to detect conversations and tool usage. No data leaves your machine.

| Activity              | EXP |
| --------------------- | --- |
| Conversation started  | +5  |
| User message sent     | +1  |
| Tool use by Claude    | +2  |
| Session completed     | +8  |
| New project detected  | +15 |
| Fish eats food        | +1  |

EXP is both your aquarium level score **and** your currency for the shop.

## Controls

| Key   | Action              |
| ----- | ------------------- |
| `S`   | Open Shop           |
| `I`   | Fish Info            |
| `F`   | Drop Food            |
| `A`   | Achievements         |
| `T`   | Stats                |
| `Q`   | Save & Quit          |
| `Esc` | Back to aquarium     |
| `Up/Down` | Navigate menus   |
| `Enter`   | Select / Buy     |

## Evolution Chains

```
Guppy ——Lv.8——> Neon Tetra ——Lv.25——> Angelfish
Minnow ——Lv.8——> Goldfish ——Lv.25——> Koi ——Lv.40——> Dragon Koi
Clownfish ——Lv.15——> Butterflyfish
Pufferfish ——Lv.18——> Blowfish
Crab ——Lv.20——> King Crab
```

Standalone species: Jellyfish, Whale

## Tank Upgrades

| Level | Max Fish | Max Decorations | Cost       |
| ----- | -------- | --------------- | ---------- |
| 1     | 3        | 3               | Free       |
| 2     | 5        | 5               | 500 EXP    |
| 3     | 8        | 8               | 2,000 EXP  |
| 4     | 12       | 12              | 6,000 EXP  |
| 5     | 16       | 16              | 15,000 EXP |

## Tech Stack

- **React 18** + **[Ink 5](https://github.com/vadimdemedes/ink)** — Terminal UI framework
- **TypeScript** — Strict mode
- **Custom ANSI renderer** — Direct escape-sequence output for flicker-free aquarium rendering
- **tsx** — Zero-build TypeScript execution

## Project Structure

```
src/
├── index.tsx            # Entry point & splash screen
├── App.tsx              # Root component, game loops, state management
├── types/               # TypeScript interfaces
├── engine/
│   ├── renderer.ts      # 2D grid ANSI compositor
│   ├── movement.ts      # Fish physics & food chasing
│   └── daynight.ts      # Time-of-day system
├── data/
│   ├── fishSpecies.ts   # All fish with ASCII art frames
│   ├── decorations.ts   # Decoration catalog
│   ├── expTable.ts      # Leveling curve & EXP values
│   └── achievements.ts  # Achievement definitions
├── services/
│   ├── claudeTracker.ts # Claude Code activity monitor
│   └── saveManager.ts   # JSON save/load with migrations
└── components/          # Ink UI overlays (Shop, FishInfo, etc.)
```

## Development

```bash
# Run in watch mode (auto-restarts on file changes)
npm run dev
```

## License

[Apache 2.0](LICENSE)
