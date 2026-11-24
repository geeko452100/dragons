// Function to calculate damage points
export function calcDamage(
  attack: number, // attacker's stats.attack
  power: number, // ability power; use 0 for a basic attack
  defense: number, // target's stats.defense
  targetIsDefending: boolean,
): number {
  let raw = attack + power - defense;

  if (targetIsDefending) {
    raw = Math.floor(raw / 2);
  }
  return Math.max(1, raw); // a hit always does at least 1
}
