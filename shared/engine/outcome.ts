import type { GameState } from '../src';

// Is this unit or monster still standing?
export function isAlive(unit: {hp: number}): boolean {
  return unit.hp > 0;
}

// Function to check outcome and manage battle state
export function checkOutcome(state: GameState): 'ongoing' | 'win' | 'lose' {
  const partyAlive = state.party.some(isAlive);
  const enemiesAlive = state.enemies.some(isAlive);

  if (!partyAlive) return 'lose';

  if (!enemiesAlive) return 'win';

  return 'ongoing';
}
