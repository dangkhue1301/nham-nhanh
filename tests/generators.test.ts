import { describe, it, expect } from 'vitest';
import { CATALOG, getFamily } from '../src/engine/catalog.ts';
import { validateQuestion } from '../src/engine/validateQuestion.ts';

describe('All 66 Question Families Integrity & Invariants', () => {
  it('has exactly 66 families defined in CATALOG', () => {
    expect(CATALOG.length).toBe(66);
  });

  CATALOG.forEach((fam) => {
    it(`Family ${fam.familyId} (${fam.name}) generates valid questions across all allowed levels`, () => {
      fam.allowedLevels.forEach((lvl) => {
        // Test with 20 different seeds for each level
        for (let seed = 1; seed <= 20; seed++) {
          const q = fam.generator(seed * 1013, lvl);

          expect(q.id).toBeDefined();
          expect(q.familyId).toBe(fam.familyId);
          expect(q.level).toBe(lvl);
          expect(q.prompt.length).toBeGreaterThan(0);
          expect(q.semanticKey.length).toBeGreaterThan(0);
          expect(q.memoryKey.length).toBeGreaterThan(0);
          expect(q.explanation.length).toBeGreaterThan(0);

          // Invariant validation
          const isValid = validateQuestion(q);
          if (!isValid) {
            console.error(`Validation failed for ${fam.familyId} L${lvl} seed ${seed}:`, q);
          }
          expect(isValid).toBe(true);
        }
      });
    });
  });

  it('verifies determinism: same seed generates identical question', () => {
    const fam = getFamily('A07');
    const q1 = fam.generator(424242, 5);
    const q2 = fam.generator(424242, 5);
    expect(q1.prompt).toBe(q2.prompt);
    expect(q1.answer).toBe(q2.answer);
    expect(q1.semanticKey).toBe(q2.semanticKey);
  });
});
