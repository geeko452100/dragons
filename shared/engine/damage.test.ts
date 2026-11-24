import { describe, test, expect } from 'vitest';
import { calcDamage } from './damage';

describe('calcDamage()', () => {
  test('basic attack is attack minus defense', () => {
    expect(calcDamage(10, 0, 4, false)).toBe(6);
  });

  test('ability power adds to the damage', () => {
    expect(calcDamage(10, 12, 4, false)).toBe(18);
  });

  test('damage is never below 1', () => {
    expect(calcDamage(2, 0, 9, false)).toBe(1);
  });

  test('defending reduces damage', () => {
    const normal = calcDamage(10, 0, 4, false);
    const defending = calcDamage(10, 0, 4, true);
    expect(defending).toBeLessThan(normal);
  });

  test('defending still takes at least 1', () => {
    expect(calcDamage(2, 0, 9, true)).toBe(1);
  });
});
