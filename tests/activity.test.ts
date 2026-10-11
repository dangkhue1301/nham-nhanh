import { describe, expect, it } from 'vitest';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';
import { generateThinkingQuestion } from '../src/engine/generators/thinking.ts';
import { scoreAttempt } from '../src/engine/scoreAttempt.ts';
import { createInitialState } from '../src/storage/localProgress.ts';
import { recordAttempt, summarizeSession, vietnamDate, filterDay } from '../src/engine/activity.ts';
import { evaluateAttemptsWindow } from '../src/engine/progress.ts';

const question = generateAdditionQuestion('A01', 1, 100);
const attempt = (index = 0) => scoreAttempt({ question: { ...question, id: `question-${index}` }, submittedAnswer: question.answer, action: 'submit', elapsedMs: 1000, mode: 'normal', sessionId: 'stable-session', hintUsed: false });
describe('Scoring, sessions and daily persistence', () => {
  it('marks a correct answer after pause as correct but excludes its speed', () => {
    const a = scoreAttempt({ question, submittedAnswer: question.answer, action: 'submit', elapsedMs: 1000, mode: 'normal', sessionId: 'pause', hintUsed: false, isInterrupted: true });
    expect(a.status).toBe('correct'); expect(a.timingEligible).toBe(false); expect(a.progressEligible).toBe(true);
  });
  it('learn mode has no timeout or speed, and answers at a timed deadline are timeouts', () => {
    const q = generateThinkingQuestion('geometry', 1, 100);
    const a = scoreAttempt({ question: q, submittedAnswer: q.answer, action: 'submit', elapsedMs: 900000, mode: 'learn', sessionId: 'learn', hintUsed: true });
    expect(a.status).toBe('assisted'); expect(a.timeLimitMs).toBe(0); expect(a.timingEligible).toBe(false);
    const timed = scoreAttempt({ question, submittedAnswer: question.answer, action: 'submit', elapsedMs: question.normalLimitMs, mode: 'normal', sessionId: 'timed', hintUsed: false });
    expect(timed.status).toBe('timeout');
  });
  it('uses the hard benchmark when evaluating speed in normal practice', () => {
    const slow = Array.from({ length: 40 }, (_, i) => ({ ...attempt(i), elapsedMs: question.hardLimitMs + 1000, sessionId: i < 20 ? 'one' : 'two' }));
    expect(evaluateAttemptsWindow(slow).status).toBe('solid');
    expect(evaluateAttemptsWindow(slow.map(a => ({ ...a, elapsedMs: 1000 }))).status).toBe('fast');
  });
  it('counts each finalized problem once, including a guided problem, with all statuses in accuracy denominator', () => {
    let state = createInitialState();
    const a = { ...attempt(0), answeredAt: Date.parse('2026-10-10T17:01:00Z') };
    state = recordAttempt(state, a);
    expect(recordAttempt(state, a)).toBe(state);
    for (const [index, status] of (['assisted', 'incorrect', 'skipped', 'timeout'] as const).entries()) state = recordAttempt(state, { ...attempt(index + 1), status, mode: 'learn', topic: 'factoring', timingEligible: false, answeredAt: a.answeredAt });
    const day = state.dailyStats['2026-10-11'];
    expect(day.total).toBe(5); expect(day.correct).toBe(1); expect(day.correct / day.total).toBe(.2);
    expect(day.timedCorrectCount).toBe(1); expect(day.correctElapsedMs).toBe(1000);
    expect(filterDay(day, 'factoring', 'learn').total).toBe(4);
    expect(filterDay(day, 'addition', 'normal').total).toBe(1);
  });
  it('assigns attempts to Vietnamese days across midnight', () => {
    expect(vietnamDate(Date.parse('2026-10-10T16:59:59Z'))).toBe('2026-10-10');
    expect(vietnamDate(Date.parse('2026-10-10T17:00:00Z'))).toBe('2026-10-11');
  });
  it('attributes basic mixed questions to the selected mixed topic in filters and mastery', () => {
    const a = scoreAttempt({ question, selectedTopic: 'mixed', submittedAnswer: question.answer, action: 'submit', elapsedMs: 1000, mode: 'normal', sessionId: 'mixed', hintUsed: false });
    const state = recordAttempt(createInitialState(), a);
    expect(state.topicLevelWindows['normal:mixed:1']).toHaveLength(1);
    expect(filterDay(state.dailyStats[vietnamDate()], 'mixed', 'all').total).toBe(1);
    expect(filterDay(state.dailyStats[vietnamDate()], 'addition', 'all').total).toBe(0);
  });
  it('includes the final answer in a 20-question session and keeps a partial session honest', () => {
    const list = Array.from({ length: 20 }, (_, i) => attempt(i));
    const start = Date.parse('2026-10-10T17:00:00Z');
    const result = summarizeSession('stable-session', { topic: 'addition', level: 1, mode: 'normal' }, start, list, 'completed', 20);
    expect(result.scoredCount).toBe(20); expect(result.independentCorrectCount).toBe(20); expect(result.startedAt).toBe(start); expect(result.unansweredCount).toBe(0);
    const partial = summarizeSession('stable-session', result.configuration, start, list.slice(0, 3), 'interrupted', 20);
    expect(partial.scoredCount).toBe(3); expect(partial.unansweredCount).toBe(17); expect(partial.bestEligible).toBe(false);
  });
  it('retains daily totals after bounded attempt history rolls over', () => {
    let state = createInitialState();
    for (let i = 0; i < 150; i++) state = recordAttempt(state, attempt(i));
    expect(state.topicLevelWindows['normal:addition:1'].length).toBe(100);
    expect(state.dailyStats[vietnamDate()].total).toBe(150);
  });
});
