import React from "react";
import { Box, Text } from "ink";
import { AquariumState } from "../types/aquarium.js";
import { getSpecies } from "../data/fishSpecies.js";
import { ACHIEVEMENTS } from "../data/achievements.js";
import { expToNextLevel } from "../data/expTable.js";

interface StatsViewProps {
  state: AquariumState;
}

function StatLine({
  label,
  value,
  color = "white",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Box>
      <Text color="gray">{label}: </Text>
      <Text color={color}>{typeof value === "number" ? value.toLocaleString() : value}</Text>
    </Box>
  );
}

export function StatsView({ state }: StatsViewProps) {
  const age = Math.floor(
    (Date.now() - new Date(state.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const { currentLevel } = expToNextLevel(state.totalExp);
  const achievementCount = Object.keys(state.achievements ?? {}).length;

  // Fish census by rarity
  const census: Record<string, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    legendary: 0,
  };
  for (const fish of state.fishes) {
    const sp = getSpecies(fish.speciesId);
    if (sp) census[sp.rarity] = (census[sp.rarity] ?? 0) + 1;
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="blue"
      paddingX={1}
    >
      <Box justifyContent="center">
        <Text color="blueBright" bold>
          ACTIVITY STATS
        </Text>
      </Box>
      <Text color="gray">{"─".repeat(50)}</Text>

      {/* Aquarium Info */}
      <Text color="cyanBright" bold>
        {" "}Aquarium
      </Text>
      <StatLine label="  Age" value={`${age} day${age !== 1 ? "s" : ""}`} />
      <StatLine label="  Level" value={currentLevel} color="cyan" />
      <StatLine label="  Tank Level" value={state.tankLevel} color="blue" />
      <StatLine label="  Total Fish" value={state.fishes.length} color="cyan" />
      <Text />

      {/* Claude Activity */}
      <Text color="cyanBright" bold>
        {" "}Claude Code Activity
      </Text>
      <StatLine
        label="  Conversations"
        value={state.stats.totalConversations}
        color="green"
      />
      <StatLine
        label="  Messages"
        value={state.stats.totalMessages}
        color="green"
      />
      <StatLine
        label="  Tool Uses"
        value={state.stats.totalToolUses}
        color="green"
      />
      <Text />

      {/* Economy */}
      <Text color="cyanBright" bold>
        {" "}Economy
      </Text>
      <StatLine
        label="  Total Earned"
        value={state.stats.totalExpEarned ?? state.totalExp}
        color="yellow"
      />
      <StatLine
        label="  Total Spent"
        value={state.stats.totalExpSpent ?? 0}
        color="red"
      />
      <StatLine
        label="  Balance"
        value={state.spendableExp}
        color="yellowBright"
      />
      <StatLine
        label="  Lifetime EXP"
        value={state.totalExp}
        color="white"
      />
      <Text />

      {/* Census */}
      <Text color="cyanBright" bold>
        {" "}Fish Census
      </Text>
      <StatLine label="  Common" value={census.common ?? 0} color="white" />
      <StatLine
        label="  Uncommon"
        value={census.uncommon ?? 0}
        color="green"
      />
      <StatLine label="  Rare" value={census.rare ?? 0} color="blueBright" />
      <StatLine
        label="  Legendary"
        value={census.legendary ?? 0}
        color="magentaBright"
      />
      <Text />

      {/* Misc */}
      <Text color="cyanBright" bold>
        {" "}Misc
      </Text>
      <StatLine
        label="  Achievements"
        value={`${achievementCount}/${ACHIEVEMENTS.length}`}
        color="magenta"
      />
      <StatLine
        label="  Times Fed"
        value={state.feedCount ?? 0}
        color="yellowBright"
      />

      <Text color="gray">{"─".repeat(50)}</Text>
      <Text color="gray"> Press ESC to go back</Text>
    </Box>
  );
}
