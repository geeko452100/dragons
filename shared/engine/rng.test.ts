import { describe, test, expect } from 'vitest';
import { nextRandom, randomInt, randomPick } from './rng';

describe('rng', () => {
  test('same seed gives same value and nextSeed', () => {
    expect(nextRandom(1)).toEqual(nextRandom(1));
  });

  test('different seeds give different values', () => {
    expect(nextRandom(1).value).not.toEqual(nextRandom(2).value);
  });

  test('value is always in [0, 1)', () => {
    let seed = 1;
    for (let i = 0; i < 1000; i++) {
      const roll = nextRandom(seed);
      expect(roll.value).toBeGreaterThanOrEqual(0);
      expect(roll.value).toBeLessThan(1);
      seed = roll.nextSeed;
    }
  });

  test('same starting seed gives the same sequence', () => {
    function rollTen(startSeed: number): number[] {
      let seed = startSeed;
      const values: number[] = [];
      for (let i = 0; i < 10; i++) {
        const roll = nextRandom(seed);
        values.push(roll.value);
        seed = roll.nextSeed;
      }
      return values;
    }
    expect(rollTen(7)).toEqual(rollTen(7));
  });

  test('randomInt stays within min and max, and hits both ends', () => {
    const seen = new Set<number>();
    let seed = 1;

    // Loop 1: roll 500 times and collect the results
    for (let i = 0; i < 500; i++) {
      const r = randomInt(seed, 1, 3);
      seen.add(r.value);
      seed = r.nextSeed;
    }

    // Loop 2: check what was collected
    for (const v of seen) {
      expect([1, 2, 3]).toContain(v);
    }

    expect(seen.has(1)).toBe(true);
    expect(seen.has(3)).toBe(true);
  });

  test('randomPick returns an item from the list', () => {
    expect(['a', 'b', 'c']).toContain(randomPick(5, ['a', 'b', 'c']).value);
  });

  test('randomPick throws on an empty list', () => {
    expect(() => randomPick(5, [])).toThrow();
  });
});
