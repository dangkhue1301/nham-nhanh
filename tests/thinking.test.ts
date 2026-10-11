import { describe, expect, it } from 'vitest';
import { generateThinkingQuestion, THINKING_TOPICS } from '../src/engine/generators/thinking.ts';
import { validateQuestion } from '../src/engine/validateQuestion.ts';
import { areAnswersEqual, parseNumericAnswer, formatAnswer } from '../src/engine/normalizeAnswer.ts';

// Independent evaluator for the limited polynomial notation displayed by the generators.
function polynomial(text: string, x: number): number {
  return [...text.replace(/\s/g, '').replace(/−/g, '-').matchAll(/([+-]?)(\d+)(x[²³]?)?/g)].reduce((sum, m) => sum + (m[1] === '-' ? -1 : 1) * Number(m[2]) * (m[3] ? x ** (m[3] === 'x³' ? 3 : m[3] === 'x²' ? 2 : 1) : 1), 0);
}
function expression(text: string, x: number): number {
  const factors = text.match(/^\(([^()]+)\)(?:\(([^()]+)\)|([²³]))$/);
  if (!factors) return polynomial(text, x);
  const first = polynomial(factors[1], x);
  return factors[2] ? first * polynomial(factors[2], x) : first ** (factors[3] === '³' ? 3 : 2);
}
describe('THCS content and answer contracts', () => {
  it('validates 8,000 seeded problems including guided steps and both timer limits', () => {
    for (const topic of THINKING_TOPICS) for (let level = 1; level <= 5; level++) for (let seed = 1; seed <= 400; seed++) {
      const q = generateThinkingQuestion(topic, level, seed * 7001);
      expect(validateQuestion(q), `${topic}:${level}:${seed}`).toBe(true);
      expect(q.steps!.length).toBeGreaterThan(0);
      expect(q.normalLimitMs).toBe(level <= 2 ? 20000 : level <= 4 ? 40000 : 60000);
      expect(q.hardLimitMs).toBe(q.normalLimitMs / 2);
    }
  });
  it('all seven identities have exactly one mathematically correct MCQ or coefficient list', () => {
    const covered = new Set<string>();
    for (let level = 1; level <= 5; level++) for (let seed = 1; seed <= 150; seed++) {
      const q = generateThinkingQuestion('identities', level, seed * 733);
      const { a, b } = q.parameters;
      const signedB = q.parameters.negative === 'true' ? -b : b;
      covered.add(`${level}:${signedB < 0 ? '-' : '+'}`);
      const expected = (x: number) => level === 3 ? (a * x) ** 2 - b * b : level === 5 ? (a * x) ** 3 + signedB ** 3 : (a * x + signedB) ** (level === 4 ? 3 : 2);
      const points = [-3, 0, 2, 5];
      if (q.answerType === 'choice') {
        const valid = q.choices!.map((text, index) => points.every(x => expression(text, x) === expected(x)) ? index : -1).filter(index => index >= 0);
        expect(valid).toEqual([q.answer]);
      } else {
        const coefficients = q.answer as number[];
        for (const x of points) expect(coefficients.reduce((sum, c, i) => sum + c * x ** (coefficients.length - 1 - i), 0)).toBe(expected(x));
      }
    }
    expect(covered.has('4:-')).toBe(true); expect(covered.has('4:+')).toBe(true);
    expect(covered.has('5:-')).toBe(true); expect(covered.has('5:+')).toBe(true);
  });
  it('factored answers expand back to the original polynomial for positive and negative coefficients', () => {
    for (let level = 1; level <= 5; level++) for (let seed = 1; seed <= 200; seed++) {
      const q = generateThinkingQuestion('factoring', level, seed * 233);
      const original = q.prompt.split('=')[0];
      for (const x of [-4, 0, 3]) {
        let expanded: number;
        if (level === 1) { const [g, p, c] = q.answer as number[]; expanded = g * (p * x + c); }
        else if (level === 2) { const p = q.answer as number; expanded = q.parameters.variant === 'difference' ? (x - p) * (x + p) : (x + p) ** 2; }
        else { const [p, r] = q.answer as number[]; expanded = q.parameters.g * (x + p) * (x + r); }
        // Original monic polynomials omit coefficient 1; insert it only in the evaluator.
        expect(expanded).toBeCloseTo(polynomial(original.replace(/(^|[+−]\s*)x/g, '$11x'), x), 10);
      }
    }
  });
  it('area answers match shape measurements, include all shapes, and correctly convert square units', () => {
    const shapes = new Set<string>(); let converted = false;
    for (let level = 1; level <= 5; level++) for (let seed = 1; seed <= 200; seed++) {
      const q = generateThinkingQuestion('geometry', level, seed * 433);
      const { kind, dimensions: d } = q.diagram!; shapes.add(kind);
      let area = kind === 'circle' ? 3.14 * d.radius ** 2 : kind === 'triangle' ? d.base * d.height / 2 : kind === 'rhombus' ? d.d1 * d.d2 / 2 : kind === 'trapezoid' ? (d.base + d.top) * d.height / 2 : kind === 'parallelogram' ? d.base * d.height : kind === 'composite' ? d.width * d.height - d.cutWidth * d.cutHeight : d.width * d.height;
      if (q.unit === 'm²') { area /= 10000; converted = true; }
      expect(q.answer).toBeCloseTo(area, 8);
    }
    expect(shapes.size).toBe(8); expect(converted).toBe(true);
  });
  it('accepts signed coefficients, decimal commas/dots and reversed unordered factor pairs', () => {
    expect(parseNumericAnswer('−12', 'signed')).toEqual({ valid: true, value: -12 });
    expect(parseNumericAnswer('0,0036', 'decimal')).toEqual({ valid: true, value: 0.0036 });
    expect(parseNumericAnswer('12.5', 'decimal')).toEqual({ valid: true, value: 12.5 });
    for (const input of ['2e3', '1/2', '1,000.5', '-0.5', '12,12345']) expect(parseNumericAnswer(input, 'decimal').valid).toBe(false);
    expect(areAnswersEqual('blanks', [5, -3], [-3, 5], true)).toBe(true);
    expect(areAnswersEqual('blanks', [5, -3], [-3, 5])).toBe(false);
    expect(formatAnswer({ answerType: 'choice', answer: 1, choices: ['A', '(x − 2)(x + 2)'] })).toBe('(x − 2)(x + 2)');
    expect(formatAnswer({ answerType: 'clock', answer: { hour: 0, minute: 5 } })).toBe('00:05');
  });
});
