import { describe, it, expect } from 'vitest';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';
import { generateSubtractionQuestion } from '../src/engine/generators/subtraction.ts';
import { generateMultiplicationQuestion } from '../src/engine/generators/multiplication.ts';
import { selectNextQuestion } from '../src/engine/selectNextQuestion.ts';
import { SessionConfiguration } from '../src/engine/types.ts';
import { getFamily } from '../src/engine/catalog.ts';

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

  it('S02 (Missing subtrahend): No zeros across Level 1, 2, 3 and strict ranges', () => {
    // Level 1: a in 2..9, missing >= 1, c >= 1
    for (let seed = 1; seed <= 50; seed++) {
      const q = generateSubtractionQuestion('S02', 1, seed * 123);
      expect(q.parameters.a).toBeGreaterThanOrEqual(2);
      expect(q.parameters.a).toBeLessThanOrEqual(9);
      expect(q.parameters.missing).toBeGreaterThanOrEqual(1);
      expect(q.parameters.c).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeGreaterThanOrEqual(1);
    }
    // Level 2: a strictly in 10..20, missing >= 1, c >= 1
    for (let seed = 1; seed <= 50; seed++) {
      const q = generateSubtractionQuestion('S02', 2, seed * 456);
      expect(q.parameters.a).toBeGreaterThanOrEqual(10);
      expect(q.parameters.a).toBeLessThanOrEqual(20);
      expect(q.parameters.missing).toBeGreaterThanOrEqual(1);
      expect(q.parameters.c).toBeGreaterThanOrEqual(1);
      expect(q.answer).toBeGreaterThanOrEqual(1);
    }
    // Level 3: a strictly in 20..100
    for (let seed = 1; seed <= 50; seed++) {
      const q = generateSubtractionQuestion('S02', 3, seed * 789);
      expect(q.parameters.a).toBeGreaterThanOrEqual(20);
      expect(q.parameters.a).toBeLessThanOrEqual(100);
      expect(q.parameters.missing).toBeGreaterThanOrEqual(2);
      expect(q.parameters.c).toBeGreaterThanOrEqual(2);
      expect(q.answer).toBeGreaterThanOrEqual(2);
    }
  });

  it('S04 & S05 (Level 3 Subtraction within 100): No zeros! answer >= 1, operands 2-digit', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const q4 = generateSubtractionQuestion('S04', 3, seed * 111);
      expect(q4.parameters.a).toBeGreaterThanOrEqual(20);
      expect(q4.parameters.b).toBeGreaterThanOrEqual(10);
      expect(q4.answer).toBeGreaterThanOrEqual(10); // S04 no borrow guarantees answer >= 10

      const q5 = generateSubtractionQuestion('S05', 3, seed * 222);
      expect(q5.parameters.a).toBeGreaterThanOrEqual(20);
      expect(q5.parameters.b).toBeGreaterThanOrEqual(11);
      expect(q5.answer).toBeGreaterThanOrEqual(1);
    }
  });

  it('S06, S07, S08 (Level 4 & 5 Subtraction): Positive non-zero answers', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const q6 = generateSubtractionQuestion('S06', 4, seed * 333);
      expect(q6.parameters.a).toBeGreaterThanOrEqual(201);
      expect(q6.answer).toBeGreaterThanOrEqual(10);

      const q7 = generateSubtractionQuestion('S07', 5, seed * 444);
      expect(q7.answer).toBeGreaterThanOrEqual(5);

      const q8 = generateSubtractionQuestion('S08', 5, seed * 555);
      expect(q8.answer).toBeGreaterThanOrEqual(5);
    }
  });

  it('A02 (Missing addend): No zeros across Level 1, 2, 3 and strict ranges', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const q1 = generateAdditionQuestion('A02', 1, seed * 101);
      expect(q1.parameters.t).toBeGreaterThanOrEqual(2);
      expect(q1.parameters.t).toBeLessThanOrEqual(9);
      expect(q1.parameters.a).toBeGreaterThanOrEqual(1);
      expect(q1.answer).toBeGreaterThanOrEqual(1);

      const q2 = generateAdditionQuestion('A02', 2, seed * 202);
      expect(q2.parameters.t).toBeGreaterThanOrEqual(10);
      expect(q2.parameters.t).toBeLessThanOrEqual(20);
      expect(q2.parameters.a).toBeGreaterThanOrEqual(1);
      expect(q2.answer).toBeGreaterThanOrEqual(1);

      const q3 = generateAdditionQuestion('A02', 3, seed * 303);
      expect(q3.parameters.t).toBe(100);
      expect(q3.parameters.a).toBeGreaterThanOrEqual(5);
      expect(q3.parameters.a).toBeLessThanOrEqual(95);
      expect(q3.answer).toBeGreaterThanOrEqual(5);
    }
  });

  it('Retry queue strictly isolates topics and levels (no Money or wrong level leaking into Addition L1)', () => {
    const config: SessionConfiguration = {
      topic: 'addition',
      level: 1,
      mode: 'hard'
    };

    // Simulate a retry queue that has a Money Level 4 question from an earlier failure
    const moneyFam = getFamily('P06');
    const moneyQuestion = moneyFam.generator(12345, 4);

    const retryQueue = [{ question: moneyQuestion, failedAtIndex: 0 }];

    // Select question at index 16 (where currentQuestionIndex - failedAtIndex = 16 >= 5)
    const { question, retryQueueConsumed } = selectNextQuestion({
      configuration: config,
      memoryCards: {},
      dueCards: [],
      withinSessionRetryQueue: retryQueue,
      currentQuestionIndex: 16,
      recentSemanticKeys: [],
      sessionKeys: [],
      seedOffset: 16
    });

    // The money question MUST NOT be consumed or returned!
    expect(retryQueueConsumed).toBeUndefined();
    expect(retryQueue.length).toBe(1);
    expect(question.topic).toBe('addition');
    expect(question.level).toBe(1);
    expect(question.reviewReason).not.toBe('within_session');
  });
});

