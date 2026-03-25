import React from "react";
import { Box, Text } from "ink";
import { AquariumState } from "../types/aquarium.js";
import { getAllSpecies } from "../data/fishSpecies.js";
import { getAllDecorations } from "../data/decorations.js";
import { getTankLevel, TANK_LEVELS } from "../data/expTable.js";

interface ShopProps {
  state: AquariumState;
  selectedIndex: number;
  tab: "fish" | "deco" | "tank";
}

export function getShopItems(state: AquariumState) {
  const fishItems = getAllSpecies()
    .filter((s) => s.cost > 0)
    .map((s) => {
      const count = state.fishes.filter((f) => f.speciesId === s.id).length;
      return {
        type: "fish" as const,
        id: s.id,
        name: s.name,
        cost: s.cost,
        description: s.description + (count > 0 ? ` (owned: ${count})` : ""),
        rarity: s.rarity,
        unlockLevel: s.unlockLevel,
        owned: false,
        color: s.color,
      };
    });

  const decoItems = getAllDecorations().map((d) => {
    const count = state.decorations.filter((p) => p.decorationId === d.id).length;
    return {
      type: "deco" as const,
      id: d.id,
      name: d.name,
      cost: d.cost,
      description: count > 0 ? `(owned: ${count})` : "",
      rarity: "common" as const,
      unlockLevel: 0,
      owned: false,
      color: d.color,
    };
  });

  const tankItems = TANK_LEVELS.filter(
    (t) => t.level > state.tankLevel
  ).map((t) => ({
    type: "tank" as const,
    id: `tank-${t.level}`,
    name: `Tank Level ${t.level}`,
    cost: t.cost,
    description: `Max ${t.maxFish} fish, ${t.maxDecorations} decorations`,
    rarity: "common" as const,
    unlockLevel: 0,
    owned: false,
    color: "cyan",
  }));

  return [...fishItems, ...decoItems, ...tankItems];
}

const RARITY_COLORS: Record<string, string> = {
  common: "white",
  uncommon: "green",
  rare: "blueBright",
  legendary: "magentaBright",
};

export function ShopView({ state, selectedIndex }: ShopProps) {
  const items = getShopItems(state);
  const tank = getTankLevel(state.tankLevel);

  const startIdx = Math.max(
    0,
    Math.min(selectedIndex - 5, items.length - 12)
  );
  const visible = items.slice(startIdx, startIdx + 12);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="yellow"
      paddingX={1}
    >
      <Box justifyContent="center">
        <Text color="yellowBright" bold>
          🏪 SHOP — 💰 {state.spendableExp.toLocaleString()} EXP available
        </Text>
      </Box>
      <Text color="gray">{"─".repeat(50)}</Text>
      {visible.map((item, i) => {
        const realIdx = startIdx + i;
        const selected = realIdx === selectedIndex;
        const canAfford = state.spendableExp >= item.cost;

        return (
          <Box key={item.id}>
            <Text color={selected ? "yellowBright" : "white"}>
              {selected ? "▸ " : "  "}
            </Text>
            <Text
              color={
                item.owned
                  ? "gray"
                  : selected
                    ? "yellowBright"
                    : RARITY_COLORS[item.rarity] ?? "white"
              }
              strikethrough={item.owned}
            >
              {item.name}
            </Text>
            <Text color="gray"> — </Text>
            <Text color={item.owned ? "gray" : canAfford ? "green" : "red"}>
              {item.owned ? "OWNED" : `${item.cost} EXP`}
            </Text>
            {item.description && (
              <Text color="gray"> {item.description}</Text>
            )}
          </Box>
        );
      })}
      <Text color="gray">{"─".repeat(50)}</Text>
      <Text color="gray">
        {items.length} items | Fish: {state.fishes.length}/{tank.maxFish}
      </Text>
    </Box>
  );
}
