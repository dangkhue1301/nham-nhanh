import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { clearProgressState, createInitialState, loadProgressState, saveProgressState, sanitizeConfiguration, STORAGE_KEY } from '../src/storage/localProgress.ts';
import { emptyDay, recordAttempt, vietnamDate } from '../src/engine/activity.ts';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';
import { scoreAttempt } from '../src/engine/scoreAttempt.ts';

let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal('window', { localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) } });
  clearProgressState();
});
afterEach(() => { vi.unstubAllGlobals(); });
describe('Safe local progress and v1 migration', () => {
  it('preserves legacy sessions and windows without inventing daily counts or trusting legacy speed', () => {
    const q = generateAdditionQuestion('A01', 1, 123);
    const a = scoreAttempt({ question: q, submittedAnswer: q.answer, action: 'submit', elapsedMs: 1000, mode: 'normal', sessionId: 'old-session', hintUsed: false });
    const { id: _id, benchmarkLimitMs: _benchmark, ...old } = a;
    const legacy = { ...createInitialState(), schemaVersion: 1, memoryCards: {}, preferences: { autoAdvanceNormal: false }, topicLevelWindows: { 'normal:addition:1': [old] }, recentSessions: [{ id: 'old-session', configuration: { topic: 'addition', level: 1, mode: 'normal' }, startedAt: 1790000000000, scoredCount: 19, independentCorrectCount: 19, status: 'completed' }], bestHardRuns: { old: { correctCount: 20, totalElapsedMs: 40000, date: '2026-09-13' } } };
    const backup = JSON.stringify(legacy); data.set('nham-nhanh:v1', backup);
    const { state } = loadProgressState();
    expect(state.schemaVersion).toBe(2); expect(state.preferences.autoAdvanceNormal).toBe(false);
    expect(state.recentSessions[0].scoredCount).toBe(19); expect(state.bestHardRuns.old.correctCount).toBe(20);
    expect(state.dailyStats).toEqual({}); expect(state.topicLevelWindows['normal:addition:1'][0].timingEligible).toBe(false);
    saveProgressState(state); expect(data.get('nham-nhanh:v1')).toBe(backup);
  });
  it('recovers from malformed JSON and malformed nested values without crashing', () => {
    data.set(STORAGE_KEY, '{invalid');
    expect(loadProgressState().state.schemaVersion).toBe(2);
    data.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 2, preferences: null, statsStartedAt: 1e30, lastSelection: { topic: 'toString', level: 99, mode: 'learn' }, recentSessions: [null, { id: 'bad', startedAt: 1e30, scoredCount: -1, independentCorrectCount: -1, configuration: {} }], topicLevelWindows: { test: null, other: [null, 12] }, dailyStats: { '2026-10-11': { ...emptyDay(), total: 2, correct: 1 } }, recentAttemptIds: null }));
    const state = loadProgressState().state;
    expect(state.lastSelection).toMatchObject({ topic: 'addition', level: 1, mode: 'normal' });
    expect(state.recentSessions).toEqual([]); expect(state.dailyStats).toEqual({}); expect(state.topicLevelWindows.other).toEqual([]);
    expect(() => vietnamDate(state.statsStartedAt)).not.toThrow();
  });
  it('reloading preserves a problem saved before its session finishes', () => {
    const q = generateAdditionQuestion('A01', 1, 777);
    const a = scoreAttempt({ question: q, submittedAnswer: q.answer, action: 'submit', elapsedMs: 1700, mode: 'normal', sessionId: 'partial', hintUsed: false });
    const state = recordAttempt(createInitialState(), a);
    expect(saveProgressState(state)).toBe(true);
    const loaded = loadProgressState().state;
    expect(loaded.dailyStats[vietnamDate()].total).toBe(1); expect(loaded.dailyStats[vietnamDate()].correct).toBe(1);
    expect(recordAttempt(loaded, a)).toBe(loaded);
  });
  it('storage write failure retains live progress in memory', () => {
    const state = createInitialState(); state.lastSelection = { topic: 'geometry', level: 3, mode: 'learn' };
    vi.stubGlobal('window', { get localStorage() { throw new Error('blocked'); } });
    expect(saveProgressState(state)).toBe(false); expect(loadProgressState().state.lastSelection.topic).toBe('geometry');
  });
  it('accepts learning only for new topics and table selection only at basic multiplication/division', () => {
    expect(sanitizeConfiguration({ topic: 'addition', mode: 'learn', level: 1, tableId: 7 })).toMatchObject({ mode: 'normal', tableId: undefined });
    expect(sanitizeConfiguration({ topic: 'factoring', mode: 'learn', level: 4 })).toMatchObject({ mode: 'learn', level: 4 });
    expect(sanitizeConfiguration({ topic: 'multiplication', mode: 'hard', level: 1, tableId: 7 }).tableId).toBe(7);
  });
});
