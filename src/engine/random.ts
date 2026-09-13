/**
 * Mulberry32 PRNG - 32-bit deterministic seeded pseudo-random number generator.
 */
export function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface PRNG {
  nextFloat(): number;
  nextInt(min: number, max: number): number; // inclusive [min, max]
  pick<T>(array: readonly T[]): T;
  shuffle<T>(array: readonly T[]): T[];
}

export function createPRNG(seed: number): PRNG {
  // Ensure non-zero integer seed
  let s = (seed ^ 0x12345678) >>> 0;
  if (s === 0) s = 1;
  const rand = mulberry32(s);

  return {
    nextFloat(): number {
      return rand();
    },
    nextInt(min: number, max: number): number {
      const a = Math.ceil(min);
      const b = Math.floor(max);
      const low = Math.min(a, b);
      const high = Math.max(a, b);
      return Math.floor(rand() * (high - low + 1)) + low;
    },
    pick<T>(array: readonly T[]): T {
      if (array.length === 0) {
        throw new Error('Cannot pick from an empty array');
      }
      const idx = Math.floor(rand() * array.length);
      return array[idx];
    },
    shuffle<T>(array: readonly T[]): T[] {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    }
  };
}
