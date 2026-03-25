import { FishSpecies } from "../types/species.js";

function mirror(lines: string[]): string[] {
  return lines.map((line) => {
    return line
      .split("")
      .reverse()
      .map((c) => {
        if (c === ">") return "<";
        if (c === "<") return ">";
        if (c === "/") return "\\";
        if (c === "\\") return "/";
        if (c === "(") return ")";
        if (c === ")") return "(";
        if (c === "{") return "}";
        if (c === "}") return "{";
        if (c === "[") return "]";
        if (c === "]") return "[";
        if (c === "d") return "b";
        if (c === "b") return "d";
        return c;
      })
      .join("");
  });
}

function makeFrames(
  rightFrames: string[][]
): { right: string[]; left: string[] }[] {
  return rightFrames.map((rf) => ({ right: rf, left: mirror(rf) }));
}

export const FISH_SPECIES: Record<string, FishSpecies> = {
  guppy: {
    id: "guppy",
    name: "Guppy",
    description: "A tiny, energetic starter fish",
    frames: makeFrames([[" ><> "], [" ><>~"]]),
    width: 5,
    height: 1,
    color: "cyan",
    speed: 1.2,
    amplitude: 0.8,
    frequency: 0.15,
    cost: 0,
    unlockLevel: 0,
    evolvesTo: "tetra",
    evolveLevel: 8,
    rarity: "common",
  },

  tetra: {
    id: "tetra",
    name: "Neon Tetra",
    description: "Glowing with Claude's energy",
    frames: makeFrames([[" ≈><>>"], [" ~><>>"]]),
    width: 6,
    height: 1,
    color: "blueBright",
    speed: 1.0,
    amplitude: 1.0,
    frequency: 0.12,
    cost: 150,
    unlockLevel: 3,
    evolvesTo: "angelfish",
    evolveLevel: 25,
    rarity: "common",
  },

  angelfish: {
    id: "angelfish",
    name: "Angelfish",
    description: "Graceful and majestic",
    frames: makeFrames([
      ["  /\\ ", " /  \\", "><  >", " \\  /", "  \\/ "],
      ["  /\\ ", " /  \\", "> < >", " \\  /", "  \\/ "],
    ]),
    width: 5,
    height: 5,
    color: "white",
    speed: 0.6,
    amplitude: 1.2,
    frequency: 0.08,
    cost: 800,
    unlockLevel: 10,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "rare",
  },

  minnow: {
    id: "minnow",
    name: "Minnow",
    description: "Small but determined",
    frames: makeFrames([[" >< "], [" ><~"]]),
    width: 4,
    height: 1,
    color: "gray",
    speed: 1.5,
    amplitude: 0.5,
    frequency: 0.2,
    cost: 0,
    unlockLevel: 0,
    evolvesTo: "goldfish",
    evolveLevel: 8,
    rarity: "common",
  },

  goldfish: {
    id: "goldfish",
    name: "Goldfish",
    description: "The classic companion",
    frames: makeFrames([
      [" ,__,  ", ">    >=<", " '--'  "],
      [" ,__,  ", ">    >~<", " '--'  "],
    ]),
    width: 8,
    height: 3,
    color: "yellow",
    speed: 0.8,
    amplitude: 1.0,
    frequency: 0.1,
    cost: 250,
    unlockLevel: 3,
    evolvesTo: "koi",
    evolveLevel: 25,
    rarity: "uncommon",
  },

  koi: {
    id: "koi",
    name: "Koi",
    description: "Symbol of perseverance",
    frames: makeFrames([
      ["  ,.___,  ", " /      \\ ", ">  o    >=<", " \\      / ", "  '·---'  "],
      ["  ,.___,  ", " /      \\ ", ">  o    >~<", " \\      / ", "  '·---'  "],
    ]),
    width: 10,
    height: 5,
    color: "redBright",
    speed: 0.5,
    amplitude: 1.5,
    frequency: 0.06,
    cost: 1500,
    unlockLevel: 12,
    evolvesTo: "dragonkoi",
    evolveLevel: 40,
    rarity: "rare",
  },

  dragonkoi: {
    id: "dragonkoi",
    name: "Dragon Koi",
    description: "Legendary transformation of the Koi",
    frames: makeFrames([
      [
        "   /\\/\\     ",
        "  /.___,\\   ",
        " / *     \\  ",
        ">   ◊    >==<",
        " \\       /  ",
        "  \\'---'/   ",
        "   \\/\\/     ",
      ],
      [
        "   /\\/\\     ",
        "  /.___,\\   ",
        " / *     \\  ",
        ">   ◊    >~~<",
        " \\       /  ",
        "  \\'---'/   ",
        "   \\/\\/     ",
      ],
    ]),
    width: 14,
    height: 7,
    color: "magenta",
    speed: 0.4,
    amplitude: 2.0,
    frequency: 0.04,
    cost: 8000,
    unlockLevel: 25,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "legendary",
  },

  clownfish: {
    id: "clownfish",
    name: "Clownfish",
    description: "Found it!",
    frames: makeFrames([
      [" ><|> "],
      [" ><|>~"],
    ]),
    width: 6,
    height: 1,
    color: "red",
    speed: 1.0,
    amplitude: 0.7,
    frequency: 0.13,
    cost: 100,
    unlockLevel: 2,
    evolvesTo: "butterflyfish",
    evolveLevel: 15,
    rarity: "common",
  },

  butterflyfish: {
    id: "butterflyfish",
    name: "Butterflyfish",
    description: "Elegant stripes and flowing fins",
    frames: makeFrames([
      ["  /~~\\ ", " / -- \\", ">|    |>", " \\ -- /", "  \\~~/ "],
      ["  /~~\\ ", " / -- \\", ">|  . |>", " \\ -- /", "  \\~~/ "],
    ]),
    width: 8,
    height: 5,
    color: "yellowBright",
    speed: 0.7,
    amplitude: 1.3,
    frequency: 0.09,
    cost: 1000,
    unlockLevel: 6,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "uncommon",
  },

  pufferfish: {
    id: "pufferfish",
    name: "Pufferfish",
    description: "Don't poke it!",
    frames: makeFrames([
      [" (o )>"],
      [" (o)> "],
    ]),
    width: 6,
    height: 1,
    color: "greenBright",
    speed: 0.9,
    amplitude: 0.6,
    frequency: 0.11,
    cost: 120,
    unlockLevel: 2,
    evolvesTo: "blowfish",
    evolveLevel: 18,
    rarity: "common",
  },

  blowfish: {
    id: "blowfish",
    name: "Blowfish",
    description: "Fully inflated and proud",
    frames: makeFrames([
      [" /--\\ ", "( o  )>", " \\--/ "],
      [" /--\\ ", "(  o )>", " \\--/ "],
    ]),
    width: 7,
    height: 3,
    color: "green",
    speed: 0.5,
    amplitude: 0.8,
    frequency: 0.07,
    cost: 500,
    unlockLevel: 8,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "uncommon",
  },

  jellyfish: {
    id: "jellyfish",
    name: "Jellyfish",
    description: "Ethereal and mesmerizing",
    frames: makeFrames([
      [" ,---, ", "/     \\", "~~~~~~~", " | | | ", " | | | "],
      [" ,---, ", "/     \\", "~~~~~~~", "  | |  ", " | | | "],
    ]),
    width: 7,
    height: 5,
    color: "magentaBright",
    speed: 0.3,
    amplitude: 2.0,
    frequency: 0.05,
    cost: 1500,
    unlockLevel: 15,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "rare",
  },

  whale: {
    id: "whale",
    name: "Whale",
    description: "The gentle giant of the deep",
    frames: makeFrames([
      [
        "   ___      ",
        " /     \\    ",
        "/  ·    \\   ",
        "         >=<",
        "\\       /   ",
        " \\_____/    ",
      ],
      [
        "   ___      ",
        " /     \\    ",
        "/  ·    \\   ",
        "         >~<",
        "\\       /   ",
        " \\_____/    ",
      ],
    ]),
    width: 12,
    height: 6,
    color: "blueBright",
    speed: 0.3,
    amplitude: 1.0,
    frequency: 0.03,
    cost: 10000,
    unlockLevel: 30,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "legendary",
  },

  crab: {
    id: "crab",
    name: "Crab",
    description: "Scuttles along the bottom, pinch pinch!",
    frames: makeFrames([
      [" (\\/)  ", "(\\ ·· /)", " V)  (V", "  |  |  "],
      [" (\\/)  ", "(\\ ·· /)", "  )  (V", " V|  |  "],
    ]),
    width: 8,
    height: 4,
    color: "redBright",
    speed: 0.6,
    amplitude: 0.0,
    frequency: 0.0,
    cost: 200,
    unlockLevel: 2,
    evolvesTo: "kingcrab",
    evolveLevel: 20,
    rarity: "common",
  },

  kingcrab: {
    id: "kingcrab",
    name: "King Crab",
    description: "The royalty of the sea floor",
    frames: makeFrames([
      ["  _/\\_/\\_  ", " / ·  · \\ ", "(V)    (V)", " ||    || "],
      ["  _/\\_/\\_  ", " / ·  · \\ ", "(V)    ( V", " ||    ||  "],
    ]),
    width: 11,
    height: 4,
    color: "red",
    speed: 0.4,
    amplitude: 0.0,
    frequency: 0.0,
    cost: 1200,
    unlockLevel: 10,
    evolvesTo: null,
    evolveLevel: 0,
    rarity: "uncommon",
  },
};

export function getSpecies(id: string): FishSpecies {
  return FISH_SPECIES[id]!;
}

export function getAllSpecies(): FishSpecies[] {
  return Object.values(FISH_SPECIES);
}
