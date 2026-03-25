import React from "react";
import { Box, Text } from "ink";
import { AquariumState, AppView } from "../types/aquarium.js";
import { expToNextLevel, getTankLevel } from "../data/expTable.js";

interface StatusBarProps {
  state: AquariumState;
  view: AppView;
  notification: string | null;
  width: number;
}

function ProgressBar({
  progress,
  width,
}: {
  progress: number;
  width: number;
}) {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  return (
    <Text>
      <Text color="green">{"█".repeat(filled)}</Text>
      <Text color="gray">{"░".repeat(empty)}</Text>
    </Text>
  );
}

export function StatusBar({ state, view, notification, width }: StatusBarProps) {
  const { currentLevel, expIntoLevel, expNeeded, progress } = expToNextLevel(
    state.totalExp
  );
  const tank = getTankLevel(state.tankLevel);

  const barWidth = Math.min(15, Math.max(5, Math.floor(width / 8)));

  return (
    <Box flexDirection="column">
      {notification && (
        <Box justifyContent="center">
          <Text color="yellowBright" bold>
            ✨ {notification} ✨
          </Text>
        </Box>
      )}
      <Box justifyContent="space-between" paddingX={1}>
        <Box>
          <Text color="cyan" bold>
            EXP:{" "}
          </Text>
          <Text color="white">{state.totalExp.toLocaleString()} </Text>
          <Text color="gray">(Lv.{currentLevel}) </Text>
          <ProgressBar progress={progress} width={barWidth} />
          <Text color="gray">
            {" "}
            {expIntoLevel}/{expNeeded}
          </Text>
        </Box>
        <Box>
          <Text color="yellow" bold>
            💰 {state.spendableExp.toLocaleString()}
          </Text>
        </Box>
        <Box>
          <Text color="cyan">
            🐟 {state.fishes.length}/{tank.maxFish}
          </Text>
        </Box>
        <Box>
          <Text color="blue">
            Tank Lv.{state.tankLevel}
          </Text>
        </Box>
      </Box>
      <Box paddingX={1}>
        <Text color={view === "aquarium" ? "white" : "gray"}>
          {view === "aquarium" ? (
            <Text>
              <Text color="yellowBright">[S]</Text>
              <Text>hop </Text>
              <Text color="yellowBright">[I]</Text>
              <Text>nfo </Text>
              <Text color="yellowBright">[D]</Text>
              <Text>eco </Text>
              <Text color="yellowBright">[R]</Text>
              <Text>esync </Text>
              <Text color="yellowBright">[Q]</Text>
              <Text>uit</Text>
            </Text>
          ) : (
            <Text>
              <Text color="yellowBright">[ESC]</Text>
              <Text> Back </Text>
              <Text color="yellowBright">[↑↓]</Text>
              <Text> Navigate </Text>
              <Text color="yellowBright">[Enter]</Text>
              <Text> Select</Text>
            </Text>
          )}
        </Text>
      </Box>
    </Box>
  );
}
