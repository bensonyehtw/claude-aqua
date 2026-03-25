export interface FishFrame {
  right: string[];
  left: string[];
}

export interface FishSpecies {
  id: string;
  name: string;
  description: string;
  frames: FishFrame[];
  width: number;
  height: number;
  color: string;
  speed: number;
  amplitude: number;
  frequency: number;
  cost: number;
  unlockLevel: number;
  evolvesTo: string | null;
  evolveLevel: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

export interface DecorationDef {
  id: string;
  name: string;
  art: string[];
  width: number;
  height: number;
  cost: number;
  color: string;
}
