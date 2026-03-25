import { DecorationDef } from "../types/species.js";

export const DECORATIONS: Record<string, DecorationDef> = {
  seaweed1: {
    id: "seaweed1",
    name: "Seaweed",
    art: ["  )", " (", "  )", " (", " |"],
    width: 3,
    height: 5,
    cost: 60,
    color: "green",
  },
  seaweed2: {
    id: "seaweed2",
    name: "Tall Seaweed",
    art: [" }", "{", " }", "{", " }", "{", " |"],
    width: 3,
    height: 7,
    cost: 100,
    color: "greenBright",
  },
  rock1: {
    id: "rock1",
    name: "Rock",
    art: ["  ___  ", " /   \\ ", "/     \\", "~~~~~~~"],
    width: 7,
    height: 4,
    cost: 50,
    color: "gray",
  },
  coral1: {
    id: "coral1",
    name: "Coral",
    art: [" Y Y ", "\\|/|\\", " |||  ", " /|\\  "],
    width: 5,
    height: 4,
    cost: 150,
    color: "red",
  },
  coral2: {
    id: "coral2",
    name: "Brain Coral",
    art: ["  @@@ ", " @@@@@", "  @@@ "],
    width: 6,
    height: 3,
    cost: 180,
    color: "magenta",
  },
  chest: {
    id: "chest",
    name: "Treasure Chest",
    art: [" _____ ", "|  $  |", "|_____|"],
    width: 7,
    height: 3,
    cost: 300,
    color: "yellow",
  },
  castle: {
    id: "castle",
    name: "Castle",
    art: [" |T|  |T| ", " | |__| | ", " |      | ", " |  []  | ", " |______|"],
    width: 10,
    height: 5,
    cost: 800,
    color: "gray",
  },
  anchor: {
    id: "anchor",
    name: "Anchor",
    art: ["  _|_  ", "  | |  ", " / | \\ ", " \\_|_/ ", "   |   "],
    width: 7,
    height: 5,
    cost: 250,
    color: "white",
  },
  shell: {
    id: "shell",
    name: "Shell",
    art: [" @)) "],
    width: 5,
    height: 1,
    cost: 30,
    color: "yellowBright",
  },
  bubbler: {
    id: "bubbler",
    name: "Air Bubbler",
    art: ["  o ", " oO ", "  o ", " [=]"],
    width: 4,
    height: 4,
    cost: 220,
    color: "cyanBright",
  },
};

export function getDecoration(id: string): DecorationDef {
  return DECORATIONS[id]!;
}

export function getAllDecorations(): DecorationDef[] {
  return Object.values(DECORATIONS);
}
