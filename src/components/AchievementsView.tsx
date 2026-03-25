import React from "react";
import { Box, Text } from "ink";
import { AquariumState } from "../types/aquarium.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

interface AchievementsViewProps {
  state: AquariumState;
  selectedIndex: number;
}

export function AchievementsView({
  state,
  selectedIndex,
}: AchievementsViewProps) {
  const achievements = state.achievements ?? {};
  const unlockedCount = Object.keys(achievements).length;

  const startIdx = Math.max(
    0,
    Math.min(selectedIndex - 5, ACHIEVEMENTS.length - 12)
  );
  const visible = ACHIEVEMENTS.slice(startIdx, startIdx + 12);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      paddingX={1}
    >
      <Box justifyContent="center">
        <Text color="magentaBright" bold>
          ACHIEVEMENTS — {unlockedCount}/{ACHIEVEMENTS.length} Unlocked
        </Text>
      </Box>
      <Text color="gray">{"─".repeat(55)}</Text>

      {visible.map((ach, i) => {
        const realIdx = startIdx + i;
        const selected = realIdx === selectedIndex;
        const unlocked = !!achievements[ach.id];
        const unlockDate = achievements[ach.id];

        return (
          <Box key={ach.id}>
            <Text color={selected ? "magentaBright" : "white"}>
              {selected ? "▸ " : "  "}
            </Text>
            <Text>{unlocked ? ach.icon : "🔒"} </Text>
            <Text
              color={unlocked ? "greenBright" : "gray"}
              bold={unlocked}
              dimColor={!unlocked}
            >
              {ach.name}
            </Text>
            <Text color="gray"> — </Text>
            <Text color={unlocked ? "white" : "gray"} dimColor={!unlocked}>
              {ach.description}
            </Text>
            {unlocked && unlockDate && (
              <Text color="gray">
                {" "}
                ({new Date(unlockDate).toLocaleDateString()})
              </Text>
            )}
          </Box>
        );
      })}

      <Text color="gray">{"─".repeat(55)}</Text>
      <Text color="gray">
        {unlockedCount === ACHIEVEMENTS.length
          ? "All achievements unlocked! You are a true aquarist!"
          : `${ACHIEVEMENTS.length - unlockedCount} remaining`}
      </Text>
    </Box>
  );
}
