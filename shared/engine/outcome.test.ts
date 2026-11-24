import { describe, test, expect } from 'vitest';
import { checkOutcome, isAlive } from './outcome';
import type { GameState } from '../src';

// A minimal state with the given HP values
function makeState(partyHps: number[], enemyHps: number[]): GameState {
  return {
    party: partyHps.map((hp, i) => ({
      id: i + 1,
      name: `hero${i + 1}`,
      class: 'warrior',
      level: 1,
      hp,
      stats: { maxHp: 10, attack: 5, defense: 5, speed: 5 },
      equipment: [],
    })),
    enemies: enemyHps.map((hp, i) => ({
      id: i + 100,
      name: `monster${i + 1}`,
      hp,
      stats: { maxHp: 10, attack: 5, defense: 5, speed: 5 },
      isDragon: false,
    })),
    turnOrder: [],
    rngSeed: 1,
    outcome: 'ongoing',
  };
}

describe('isAlive()', () => {
  test('hp above 0 is alive', () => {
    expect(isAlive({ hp: 1 })).toBe(true);
  });

  test('hp 0 is dead', () => {
    expect(isAlive({ hp: 0 })).toBe(false);
  });
});

describe('checkOutcome()', () => {
  test('ongoing while both sides have someone alive', () => {
    expect(checkOutcome(makeState([10, 0], [5]))).toBe('ongoing');
  });

  test('win when every enemy is dead', () => {
    expect(checkOutcome(makeState([10], [0]))).toBe('win');
  });

  test('lose when every party member is dead', () => {
    expect(checkOutcome(makeState([0, 0], [5]))).toBe('lose');
  });

  test('both sides dead counts as lose', () => {
    expect(checkOutcome(makeState([0], [0]))).toBe('lose');
  });

  test('does not change the state it was given', () => {
    const state = makeState([10], [0]);
    checkOutcome(state);
    expect(state.outcome).toBe('ongoing');
  });
});
