export type TimeOfDay = "day" | "dusk" | "night";

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 17) return "day";
  if (hour >= 18 && hour <= 19) return "dusk";
  return "night";
}

export function getSpeedMultiplier(tod: TimeOfDay): number {
  switch (tod) {
    case "day":
      return 1.0;
    case "dusk":
      return 0.8;
    case "night":
      return 0.6;
  }
}

export function getWaterBgAnsi(tod: TimeOfDay): string {
  switch (tod) {
    case "day":
      return "\x1b[44m"; // blue bg
    case "dusk":
      return "\x1b[100m"; // dark gray bg
    case "night":
      return "\x1b[40m"; // black bg
  }
}

export function getSandColor(tod: TimeOfDay): string {
  return tod === "night" ? "gray" : "yellow";
}

export function getBubbleColor(tod: TimeOfDay): string {
  return tod === "night" ? "gray" : "cyanBright";
}

export function getWaterColor(tod: TimeOfDay): string {
  switch (tod) {
    case "day":
      return "blue";
    case "dusk":
      return "blue";
    case "night":
      return "black";
  }
}
