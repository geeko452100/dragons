// The shape of one roll
export type RngResult<T = number> = {
  value: T;
  nextSeed: number;
};

// The core function (mulberry32: tiny, fast, good enough for a game)
export function nextRandom(seed: number): RngResult {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0;
  let t = nextSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextSeed };
}

// Whole number in [min, max] inclusive
export function randomInt(seed: number, min: number, max: number): RngResult {
  const roll = nextRandom(seed);
  const value = min + Math.floor(roll.value * (max - min + 1));
  return { value, nextSeed: roll.nextSeed };
}

// Pick one item from a non-empty list
export function randomPick<T>(seed: number, items: T[]): RngResult<T> {
  if (items.length === 0) {
    throw new Error('randomPick: items must not be empty');
  }
  const roll = randomInt(seed, 0, items.length - 1);
  const value = items[roll.value];
  if (value === undefined) {
    throw new Error('randomPick: index out of range');
  }
  return { value, nextSeed: roll.nextSeed };
}
