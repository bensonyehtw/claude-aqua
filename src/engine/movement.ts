import { FishInstance, FoodParticle } from "../types/aquarium.js";
import { getSpecies } from "../data/fishSpecies.js";

export function updateFishPosition(
  fish: FishInstance,
  tick: number,
  tankWidth: number,
  tankHeight: number,
  speedMultiplier: number = 1.0,
  foodParticles: FoodParticle[] = []
): FishInstance {
  const species = getSpecies(fish.speciesId);
  if (!species) return fish;

  let { x, y } = fish.position;
  let { vx, vy } = fish.velocity;
  let direction = fish.direction;

  const maxX = Math.max(2, tankWidth - species.width - 1);
  const maxY = Math.max(1, tankHeight - species.height - 1);

  // Food chasing — aggressively swim toward nearest food
  let isChasing = false;
  if (foodParticles.length > 0) {
    const fishCenterX = x + species.width / 2;
    const fishCenterY = y + species.height / 2;
    let nearestDist = 25;
    let nearestDx = 0;
    let nearestDy = 0;

    for (const food of foodParticles) {
      const dx = food.x - fishCenterX;
      const dy = food.y - fishCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestDx = dx;
        nearestDy = dy;
      }
    }

    if (nearestDist < 25 && nearestDist > 0) {
      isChasing = true;
      const nx = nearestDx / nearestDist;
      const ny = nearestDy / nearestDist;

      const chaseSpeed = species.speed * 1.5;
      vx = nx * chaseSpeed;
      vy = ny * chaseSpeed * 0.7;

      direction = nearestDx > 0 ? "right" : "left";
    }
  }

  // Bottom-dwelling creatures (crabs) stay on the sand
  const isBottomDweller = species.amplitude === 0.0 && species.frequency === 0.0;

  // Apply velocity
  x += vx * speedMultiplier;
  if (!isBottomDweller) {
    y += vy * speedMultiplier;
  }

  // Sine wave only when not chasing food
  if (!isChasing && !isBottomDweller) {
    const yOffset =
      Math.sin(tick * species.frequency + fish.phase) * species.amplitude;
    y += yOffset * 0.1;

    // Random direction change (rare)
    if (Math.random() < 0.005) {
      vy = (Math.random() - 0.5) * 0.3;
    }

    // Dampen vertical velocity when idle
    vy *= 0.95;
  }

  // Occasional random speed variation (only when not chasing)
  if (!isChasing && Math.random() < 0.01) {
    const speedMod = 0.8 + Math.random() * 0.4;
    vx = (direction === "right" ? 1 : -1) * Math.abs(species.speed * speedMod);
  }

  // Hard boundary clamp — fish can never leave the tank
  if (x < 1) {
    x = 1;
    vx = Math.abs(vx) || species.speed;
    direction = "right";
  } else if (x > maxX) {
    x = maxX;
    vx = -(Math.abs(vx) || species.speed);
    direction = "left";
  }

  // Bottom-dwellers stick to the sand
  if (isBottomDweller) {
    y = maxY;
    vy = 0;
  } else if (y < 0) {
    y = 0;
    vy = Math.abs(vy) * 0.3;
  } else if (y > maxY) {
    y = maxY;
    vy = -(Math.abs(vy) * 0.3);
  }

  return {
    ...fish,
    position: { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 },
    velocity: { vx, vy },
    direction,
  };
}

export function applyRepulsion(
  fishes: FishInstance[],
  tankWidth: number,
  tankHeight: number
): FishInstance[] {
  const MIN_DIST = 4;

  return fishes.map((fish, i) => {
    let pushX = 0;
    let pushY = 0;

    for (let j = 0; j < fishes.length; j++) {
      if (i === j) continue;
      const other = fishes[j]!;
      const dx = fish.position.x - other.position.x;
      const dy = fish.position.y - other.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MIN_DIST && dist > 0) {
        const force = (MIN_DIST - dist) / MIN_DIST;
        pushX += (dx / dist) * force * 0.3;
        pushY += (dy / dist) * force * 0.2;
      }
    }

    if (pushX === 0 && pushY === 0) return fish;

    const species = getSpecies(fish.speciesId);
    const maxX = Math.max(2, tankWidth - (species?.width ?? 4) - 1);
    const maxY = Math.max(1, tankHeight - (species?.height ?? 1) - 1);

    const newX = Math.max(1, Math.min(maxX, fish.position.x + pushX));
    const newY = Math.max(0, Math.min(maxY, fish.position.y + pushY));

    return {
      ...fish,
      position: {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      },
    };
  });
}
