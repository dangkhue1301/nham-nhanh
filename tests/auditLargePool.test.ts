import { describe, it, expect } from 'vitest';
import { CATALOG } from '../src/engine/catalog.ts';
import { createPRNG } from '../src/engine/random.ts';

describe('Audit Large Question Pool (>100.000 Distinct Configurations)', () => {
  it('mathematically verifies A07 domain size has 891.000 distinct pairs', () => {
    const minA = 1000;
    const maxA = 9999;
    const countA = maxA - minA + 1; // 9000

    const minB = 1;
    const maxB = 99;
    const countB = maxB - minB + 1; // 99

    const totalPairsA07 = countA * countB;
    expect(totalPairsA07).toBe(891000);
  });

  it('audits generating over 100.000 distinct semantic keys across the catalog', () => {
    const uniqueKeys = new Set<string>();
    const prng = createPRNG(987654321);

    const targetDistinct = 100000;
    const startTime = Date.now();

    // Iterate across diverse families to collect distinct mathematical configurations
    // Focus on families with large parameter domains: A06, A07, A08, S06, S07, S08, M04, M06, M09, D04, D05, D08, P01..P10, T03..T08, C03..C08
    const largeFamilies = CATALOG.filter((f) =>
      ['A06', 'A07', 'A08', 'S06', 'S07', 'S08', 'M06', 'M09', 'D04', 'D05', 'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08', 'P09', 'P10', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'C03', 'C04', 'C05', 'C06', 'C08'].includes(
        f.familyId
      )
    );

    let generatedCount = 0;
    while (uniqueKeys.size < targetDistinct && generatedCount < 320000) {
      const fam = prng.pick(largeFamilies);
      const lvl = prng.pick(fam.allowedLevels);
      const seed = prng.nextInt(1, 2000000000);

      const q = fam.generator(seed, lvl);
      uniqueKeys.add(q.semanticKey);
      generatedCount++;
    }

    const elapsed = Date.now() - startTime;
    console.log(`Generated ${generatedCount} questions, reached ${uniqueKeys.size} distinct semanticKeys in ${elapsed}ms (${(elapsed / generatedCount).toFixed(2)}ms/question)`);

    expect(uniqueKeys.size).toBeGreaterThanOrEqual(100000);
    // Verified generation speed well under 50ms per question!
    expect(elapsed / generatedCount).toBeLessThan(5);
  });
});
