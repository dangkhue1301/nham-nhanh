import { describe, it, expect } from 'vitest';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';
import { generateSubtractionQuestion } from '../src/engine/generators/subtraction.ts';
import { generateMultiplicationQuestion } from '../src/engine/generators/multiplication.ts';
import { selectNextQuestion } from '../src/engine/selectNextQuestion.ts';
import { SessionConfiguration } from '../src/engine/types.ts';

describe('Level Range Invariants, Elimination of 0, and Session Uniqueness', () => {
  it('A01 (Level 1 Addition): No zeros! Operands >= 1, sum in [2, 9]', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = generateAdditionQuestion('A01', 1, seed * 1999);
      const { a, b } = q.parameters;
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(a + b).toBeLessThanOrEqual(9);
      expect(a + b).toBeGreaterThanOrEqual(2);
      expect(q.answer).toBe(a + b);
      expect(q.prompt).not.toContain('0');
    }
  });

  it('A03 (Level 2 Addition): Scope strictly in [10, 20], no zeros! sum in [10, 20]', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = generateAdditionQuestion('A03', 2, seed * 2333);
      const { a, b } = q.parameters;
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(a + b).toBeGreaterThanOrEqual(10);
      expect(a + b).toBeLessThanOrEqual(20);
      expect(q.answer).toBe(a + b);
      expect(q.answer).toBeGreaterThanOrEqual(10);
      expect(q.answer).toBeLessThanOrEqual(20);
    }
  });

  it('S01 (Level 1 Subtraction): No zeros! a >= 2, b >= 1, answer >= 1, a <= 9', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = generateSubtractionQuestion('S01', 1, seed * 3457);
      const { a, b } = q.parameters;
      expect(a).toBeGreaterThanOrEqual(2);
      expect(a).toBeLessThanOrEqual(9);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(b).toBeLessThan(a);
      expect(q.answer).toBe(a - b);
      expect(q.answer).toBeGreaterThanOrEqual(1);
      expect(q.prompt).not.toContain('0');
    }
  });

  it('S03 (Level 2 Subtraction): Minuend a strictly in [10, 20], never under 10! No zeros!', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const q = generateSubtractionQuestion('S03', 2, seed * 4567);
      const { a, b } = q.parameters;
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(20);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBe(a - b);
      expect(q.answer).toBeGreaterThanOrEqual(1);
    }
  });

  it('M02 (Multiplication Special): No zeros! Multiplies with 1 or 10', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const q = generateMultiplicationQuestion('M02', 1, seed * 789);
      expect(q.parameters.special).not.toBe(0);
      expect([1, 10]).toContain(q.parameters.special);
      expect(q.answer).toBeGreaterThanOrEqual(1);
    }
  });

  it('Session Uniqueness: 20 consecutive questions in a session have 0 duplicate prompts and keys', () => {
    const config: SessionConfiguration = {
      topic: 'addition',
      level: 2,
      mode: 'normal'
    };

    const sessionKeys: string[] = [];
    const prompts: string[] = [];

    for (let i = 0; i < 20; i++) {
      const { question } = selectNextQuestion({
        configuration: config,
        memoryCards: {},
        dueCards: [],
        withinSessionRetryQueue: [],
        currentQuestionIndex: i,
        recentSemanticKeys: [],
        sessionKeys,
        seedOffset: i
      });

      expect(sessionKeys.includes(question.semanticKey)).toBe(false);
      expect(prompts.includes(question.prompt)).toBe(false);

      sessionKeys.push(question.semanticKey, question.prompt);
      prompts.push(question.prompt);
    }

    expect(new Set(prompts).size).toBe(20);
  });

  it('Session Uniqueness: Subtraction Level 2 also has 20 unique questions per session', () => {
    const config: SessionConfiguration = {
      topic: 'subtraction',
      level: 2,
      mode: 'normal'
    };

    const sessionKeys: string[] = [];
    const prompts: string[] = [];

    for (let i = 0; i < 20; i++) {
      const { question } = selectNextQuestion({
        configuration: config,
        memoryCards: {},
        dueCards: [],
        withinSessionRetryQueue: [],
        currentQuestionIndex: i,
        recentSemanticKeys: [],
        sessionKeys,
        seedOffset: i
      });

      expect(sessionKeys.includes(question.semanticKey)).toBe(false);
      expect(prompts.includes(question.prompt)).toBe(false);
      expect(question.level).toBe(2);

      sessionKeys.push(question.semanticKey, question.prompt);
      prompts.push(question.prompt);
    }

    expect(new Set(prompts).size).toBe(20);
  });
});
