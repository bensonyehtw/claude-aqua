import React from "react";
import { Box, Text } from "ink";
import { AquariumState } from "../types/aquarium.js";
import { getSpecies } from "../data/fishSpecies.js";
import { expToNextLevel } from "../data/expTable.js";

interface FishInfoProps {
  state: AquariumState;
  selectedIndex: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: "white",
  uncommon: "green",
  rare: "blueBright",
  legendary: "magentaBright",
};

export function FishInfoView({ state, selectedIndex }: FishInfoProps) {
  const fishes = state.fishes;

  if (fishes.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        paddingX={1}
      >
        <Text color="gray">No fish yet! Visit the shop to buy some.</Text>
      </Box>
    );
  }

  const selected = fishes[Math.min(selectedIndex, fishes.length - 1)]!;
  const species = getSpecies(selected.speciesId);
  const { currentLevel, expIntoLevel, expNeeded, progress } = expToNextLevel(
    selected.exp
  );

  const frame =
    species?.frames[0]?.[selected.direction === "right" ? "right" : "left"] ??
    [];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
    >
      <Box justifyContent="center">
        <Text color="cyanBright" bold>
          🐠 FISH INFO
        </Text>
      </Box>
      <Text color="gray">{"─".repeat(50)}</Text>

      {/* Fish list */}
      {fishes.map((fish, i) => {
        const sp = getSpecies(fish.speciesId);
        const isSelected = i === Math.min(selectedIndex, fishes.length - 1);
        return (
          <Box key={fish.id}>
            <Text color={isSelected ? "cyanBright" : "white"}>
              {isSelected ? "▸ " : "  "}
            </Text>
            <Text
              color={RARITY_COLORS[sp?.rarity ?? "common"]}
              bold={isSelected}
            >
              {fish.name}
            </Text>
            <Text color="gray">
              {" "}
              ({sp?.name}) Lv.{fish.level}
            </Text>
          </Box>
        );
      })}

      <Text color="gray">{"─".repeat(50)}</Text>

      {/* Selected fish detail */}
      <Box flexDirection="column" paddingY={1}>
        <Box>
          <Text color={RARITY_COLORS[species?.rarity ?? "common"]} bold>
            {selected.name}
          </Text>
          <Text color="gray"> — {species?.name}</Text>
        </Box>

        {/* ASCII preview */}
        <Box flexDirection="column" paddingY={1}>
          {frame.map((line, i) => (
            <Text key={i} color={species?.color ?? "white"}>
              {"    "}
              {line}
            </Text>
          ))}
        </Box>

        <Text color="gray">{species?.description}</Text>
        <Text>
          <Text color="cyan">Level: </Text>
          <Text color="white">{currentLevel}</Text>
          <Text color="gray">
            {" "}
            ({expIntoLevel}/{expNeeded} EXP)
          </Text>
        </Text>
        <Text>
          <Text color="cyan">Rarity: </Text>
          <Text color={RARITY_COLORS[species?.rarity ?? "common"]}>
            {species?.rarity?.toUpperCase()}
          </Text>
        </Text>
        {species?.evolvesTo && (
          <Text>
            <Text color="cyan">Evolves: </Text>
            <Text color="magenta">
              {getSpecies(species.evolvesTo)?.name ?? species.evolvesTo} at Lv.
              {species.evolveLevel}
            </Text>
          </Text>
        )}

        <Text color="gray" dimColor>
          Press [N] to rename
        </Text>
      </Box>
    </Box>
  );
}
