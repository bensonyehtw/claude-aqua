import React, { useMemo } from "react";
import { Box, Text } from "ink";
import {
  createEmptyGrid,
  renderSand,
  renderDecorations,
  renderFish,
  renderBubbles,
  gridToLines,
} from "../engine/renderer.js";
import { FishInstance, BubbleInstance, PlacedDecoration } from "../types/aquarium.js";

interface AquariumProps {
  width: number;
  height: number;
  fishes: FishInstance[];
  decorations: PlacedDecoration[];
  bubbles: BubbleInstance[];
  tick: number;
}

const COLOR_MAP: Record<string, string> = {
  cyan: "cyan",
  cyanBright: "cyanBright",
  blue: "blue",
  blueBright: "blueBright",
  green: "green",
  greenBright: "greenBright",
  yellow: "yellow",
  yellowBright: "yellowBright",
  red: "red",
  redBright: "redBright",
  magenta: "magenta",
  magentaBright: "magentaBright",
  white: "white",
  gray: "gray",
  black: "black",
};

// Render a single line with color runs
function ColoredLine({ chars, colors }: { chars: string; colors: string[] }) {
  // Group consecutive same-color characters
  const segments: { text: string; color: string }[] = [];
  let currentColor = colors[0] ?? "blue";
  let currentText = "";

  for (let i = 0; i < chars.length; i++) {
    const c = colors[i] ?? "blue";
    if (c === currentColor) {
      currentText += chars[i];
    } else {
      if (currentText) segments.push({ text: currentText, color: currentColor });
      currentColor = c;
      currentText = chars[i] ?? "";
    }
  }
  if (currentText) segments.push({ text: currentText, color: currentColor });

  return (
    <Text>
      {segments.map((seg, i) => (
        <Text key={i} color={COLOR_MAP[seg.color] ?? "blue"}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

export function AquariumView({
  width,
  height,
  fishes,
  decorations,
  bubbles,
  tick,
}: AquariumProps) {
  const innerW = Math.max(width - 2, 10);
  const innerH = Math.max(height - 2, 5);

  const lines = useMemo(() => {
    const grid = createEmptyGrid(innerW, innerH);
    renderSand(grid, innerW, innerH);
    renderDecorations(grid, decorations, innerH);
    renderFish(grid, fishes, tick);
    renderBubbles(grid, bubbles);
    return gridToLines(grid);
  }, [innerW, innerH, fishes, decorations, bubbles, tick]);

  const topBorder = "╔" + "═".repeat(innerW) + "╗";
  const bottomBorder = "╚" + "═".repeat(innerW) + "╝";

  return (
    <Box flexDirection="column">
      <Text color="cyanBright">{topBorder}</Text>
      {lines.map((line, i) => (
        <Text key={i}>
          <Text color="cyanBright">║</Text>
          <ColoredLine chars={line.chars} colors={line.colors} />
          <Text color="cyanBright">║</Text>
        </Text>
      ))}
      <Text color="cyanBright">{bottomBorder}</Text>
    </Box>
  );
}
