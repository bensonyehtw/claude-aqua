import {
  FishInstance,
  BubbleInstance,
  PlacedDecoration,
  FoodParticle,
} from "../types/aquarium.js";
import { getSpecies } from "../data/fishSpecies.js";
import { getDecoration } from "../data/decorations.js";

export interface RenderCell {
  char: string;
  color: string;
}

export function createEmptyGrid(
  width: number,
  height: number,
  waterColor: string = "blue"
): RenderCell[][] {
  const grid: RenderCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: RenderCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ char: " ", color: waterColor });
    }
    grid.push(row);
  }
  return grid;
}

export function renderSand(
  grid: RenderCell[][],
  width: number,
  height: number,
  sandColor: string = "yellow"
) {
  const sandChars = [".", "·", ",", ".", "·", " ", "."];
  const sandRow = height - 1;
  if (sandRow >= 0 && sandRow < grid.length) {
    for (let x = 0; x < width; x++) {
      grid[sandRow]![x] = {
        char: sandChars[x % sandChars.length]!,
        color: sandColor,
      };
    }
  }
}

export function renderDecorations(
  grid: RenderCell[][],
  decorations: PlacedDecoration[],
  tankHeight: number
) {
  for (const placed of decorations) {
    const def = getDecoration(placed.decorationId);
    if (!def) continue;

    const baseY = tankHeight - def.height;
    for (let dy = 0; dy < def.art.length; dy++) {
      const line = def.art[dy]!;
      const renderY = baseY + dy;
      if (renderY < 0 || renderY >= grid.length) continue;

      for (let dx = 0; dx < line.length; dx++) {
        const renderX = placed.position.x + dx;
        if (
          renderX < 0 ||
          renderX >= (grid[0]?.length ?? 0) ||
          line[dx] === " "
        )
          continue;

        grid[renderY]![renderX] = {
          char: line[dx]!,
          color: def.color,
        };
      }
    }
  }
}

// Render wake trails behind fast-moving fish
export function renderTrails(grid: RenderCell[][], fishes: FishInstance[]) {
  for (const fish of fishes) {
    const speed = Math.abs(fish.velocity.vx);
    if (speed <= 0.8) continue;

    const species = getSpecies(fish.speciesId);
    if (!species) continue;

    const trailLen = Math.min(3, Math.floor(speed * 2));
    const midY = Math.round(fish.position.y + species.height / 2);
    const trailChars = ["~", "~", "."];
    const gridW = grid[0]?.length ?? 0;

    for (let i = 0; i < trailLen; i++) {
      let tx: number;
      if (fish.direction === "right") {
        tx = Math.round(fish.position.x) - 1 - i;
      } else {
        tx = Math.round(fish.position.x) + species.width + i;
      }

      if (tx < 0 || tx >= gridW || midY < 0 || midY >= grid.length) continue;

      const cell = grid[midY]![tx]!;
      if (cell.char === " ") {
        grid[midY]![tx] = { char: trailChars[i] ?? ".", color: "gray" };
      }
    }
  }
}

// Render food particles
export function renderFood(grid: RenderCell[][], food: FoodParticle[]) {
  for (const f of food) {
    const ry = Math.round(f.y);
    const rx = Math.round(f.x);
    if (
      ry >= 0 &&
      ry < grid.length &&
      rx >= 0 &&
      rx < (grid[0]?.length ?? 0)
    ) {
      grid[ry]![rx] = { char: f.char, color: f.color };
    }
  }
}

export function renderFish(
  grid: RenderCell[][],
  fishes: FishInstance[],
  tick: number
) {
  const gridW = grid[0]?.length ?? 0;
  const gridH = grid.length;

  for (const fish of fishes) {
    const species = getSpecies(fish.speciesId);
    if (!species) continue;

    // Check if fish is in eat animation
    const eatAge = fish.eatAnimTick > 0 ? tick - fish.eatAnimTick : 999;
    const isEating = eatAge < 8; // animation lasts 8 ticks (~1.2s)

    const frameIndex = Math.floor(tick / 5) % species.frames.length;
    const frame = species.frames[frameIndex]!;
    const art = fish.direction === "right" ? frame.right : frame.left;

    const baseX = Math.round(fish.position.x);
    const baseY = Math.round(fish.position.y);

    // During eat animation: flash the fish color and show particles
    const fishColor = isEating
      ? eatAge % 4 < 2
        ? "yellowBright"
        : "white"
      : species.color;

    for (let dy = 0; dy < art.length; dy++) {
      const line = art[dy]!;
      const renderY = baseY + dy;
      if (renderY < 0 || renderY >= gridH) continue;

      for (let dx = 0; dx < line.length; dx++) {
        const renderX = baseX + dx;
        if (renderX < 0 || renderX >= gridW || line[dx] === " ") continue;

        grid[renderY]![renderX] = {
          char: line[dx]!,
          color: fishColor,
        };
      }
    }

    // Eat animation: burst particles around the fish
    if (isEating) {
      const cx = baseX + Math.floor(species.width / 2);
      const cy = baseY + Math.floor(species.height / 2);
      const sparkChars = ["*", "·", "✦", "°", "+"];
      const sparkColors = ["yellowBright", "white", "yellow"];

      // Expanding ring of particles based on animation age
      const radius = Math.floor(eatAge / 2) + 1;
      const positions = [
        [cx - radius, cy],
        [cx + radius, cy],
        [cx, cy - 1],
        [cx, cy + 1],
        [cx - radius + 1, cy - 1],
        [cx + radius - 1, cy + 1],
      ];

      for (let pi = 0; pi < positions.length; pi++) {
        const [px, py] = positions[pi]!;
        if (px! >= 0 && px! < gridW && py! >= 0 && py! < gridH) {
          const cell = grid[py!]![px!]!;
          // Only draw on empty water cells
          if (cell.char === " " || cell.char === "." || cell.char === "·") {
            grid[py!]![px!] = {
              char: sparkChars[pi % sparkChars.length]!,
              color: sparkColors[pi % sparkColors.length]!,
            };
          }
        }
      }
    }
  }
}

export function renderBubbles(
  grid: RenderCell[][],
  bubbles: BubbleInstance[],
  bubbleColor: string = "cyanBright"
) {
  for (const bubble of bubbles) {
    const ry = Math.round(bubble.y);
    const rx = Math.round(bubble.x);
    if (
      ry >= 0 &&
      ry < grid.length &&
      rx >= 0 &&
      rx < (grid[0]?.length ?? 0)
    ) {
      grid[ry]![rx] = { char: bubble.char, color: bubbleColor };
    }
  }
}

// ANSI color codes
const ANSI_COLORS: Record<string, string> = {
  blue: "\x1b[34m",
  blueBright: "\x1b[94m",
  cyan: "\x1b[36m",
  cyanBright: "\x1b[96m",
  green: "\x1b[32m",
  greenBright: "\x1b[92m",
  yellow: "\x1b[33m",
  yellowBright: "\x1b[93m",
  red: "\x1b[31m",
  redBright: "\x1b[91m",
  magenta: "\x1b[35m",
  magentaBright: "\x1b[95m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  black: "\x1b[30m",
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function moveTo(row: number, col: number): string {
  return `\x1b[${row};${col}H`;
}

export function renderFrameToAnsi(
  grid: RenderCell[][],
  tankWidth: number,
  tankHeight: number,
  startRow: number = 2,
  bgAnsi: string = ""
): string {
  const innerW = grid[0]?.length ?? 0;
  const parts: string[] = [];

  // Top border
  parts.push(
    moveTo(startRow, 1) +
      (ANSI_COLORS["cyanBright"] ?? "") +
      "╔" +
      "═".repeat(innerW) +
      "╗" +
      RESET
  );

  // Grid rows
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]!;
    parts.push(moveTo(startRow + 1 + y, 1));
    parts.push((ANSI_COLORS["cyanBright"] ?? "") + "║" + RESET);
    parts.push(bgAnsi); // apply water background

    let currentColor = "";
    for (let x = 0; x < row.length; x++) {
      const cell = row[x]!;
      const ansi = ANSI_COLORS[cell.color] ?? "";
      if (ansi !== currentColor) {
        parts.push(ansi);
        currentColor = ansi;
      }
      parts.push(cell.char);
    }
    parts.push(RESET);
    parts.push((ANSI_COLORS["cyanBright"] ?? "") + "║" + RESET);
  }

  // Bottom border
  parts.push(
    moveTo(startRow + 1 + grid.length, 1) +
      (ANSI_COLORS["cyanBright"] ?? "") +
      "╚" +
      "═".repeat(innerW) +
      "╝" +
      RESET
  );

  return parts.join("");
}

export function renderStatusToAnsi(
  row: number,
  width: number,
  totalExp: number,
  spendableExp: number,
  level: number,
  expIntoLevel: number,
  expNeeded: number,
  progress: number,
  fishCount: number,
  maxFish: number,
  tankLevel: number,
  notification: string | null,
  isAquariumView: boolean
): string {
  const parts: string[] = [];

  // Notification line
  if (notification) {
    const notifPad = Math.max(
      0,
      Math.floor((width - notification.length - 4) / 2)
    );
    parts.push(
      moveTo(row, 1) +
        " ".repeat(notifPad) +
        (ANSI_COLORS["yellowBright"] ?? "") +
        BOLD +
        "* " +
        notification +
        " *" +
        RESET +
        " ".repeat(Math.max(0, width - notifPad - notification.length - 4))
    );
    row++;
  } else {
    parts.push(moveTo(row, 1) + " ".repeat(width + 2));
    row++;
  }

  // EXP bar
  const barWidth = Math.min(15, Math.max(5, Math.floor(width / 8)));
  const filled = Math.round(progress * barWidth);
  const empty = barWidth - filled;

  const expLine =
    (ANSI_COLORS["cyan"] ?? "") +
    BOLD +
    " EXP: " +
    RESET +
    (ANSI_COLORS["white"] ?? "") +
    totalExp.toLocaleString() +
    " " +
    RESET +
    (ANSI_COLORS["gray"] ?? "") +
    "(Lv." +
    level +
    ") " +
    RESET +
    (ANSI_COLORS["green"] ?? "") +
    "█".repeat(filled) +
    RESET +
    (ANSI_COLORS["gray"] ?? "") +
    "░".repeat(empty) +
    RESET +
    (ANSI_COLORS["gray"] ?? "") +
    " " +
    expIntoLevel +
    "/" +
    expNeeded +
    RESET +
    "    " +
    (ANSI_COLORS["yellow"] ?? "") +
    BOLD +
    "$ " +
    spendableExp.toLocaleString() +
    RESET +
    "    " +
    (ANSI_COLORS["cyan"] ?? "") +
    "Fish: " +
    fishCount +
    "/" +
    maxFish +
    RESET +
    "    " +
    (ANSI_COLORS["blue"] ?? "") +
    "Tank Lv." +
    tankLevel +
    RESET;

  parts.push(moveTo(row, 1) + expLine + "   ");
  row++;

  // Controls line
  if (isAquariumView) {
    parts.push(
      moveTo(row, 1) +
        (ANSI_COLORS["yellowBright"] ?? "") +
        " [S]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        "hop " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[I]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        "nfo " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[F]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        "eed " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[A]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        "ch " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[T]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        "stats " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[Q]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        "uit" +
        RESET +
        "          "
    );
  } else {
    parts.push(
      moveTo(row, 1) +
        (ANSI_COLORS["yellowBright"] ?? "") +
        " [ESC]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        " Back " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[↑↓]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        " Navigate " +
        RESET +
        (ANSI_COLORS["yellowBright"] ?? "") +
        "[Enter]" +
        RESET +
        (ANSI_COLORS["white"] ?? "") +
        " Select" +
        RESET +
        "                    "
    );
  }

  return parts.join("");
}

export function gridToLines(
  grid: RenderCell[][]
): { chars: string; colors: string[] }[] {
  return grid.map((row) => {
    const chars = row.map((c) => c.char).join("");
    const colors = row.map((c) => c.color);
    return { chars, colors };
  });
}
