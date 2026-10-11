import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { clearProgressState, createInitialState, loadProgressState, saveProgressState, sanitizeConfiguration, STORAGE_KEY, updateProgressState } from '../src/storage/localProgress.ts';
import { acquirePracticeLock } from '../src/storage/practiceLock.ts';
import { testLocks } from './helpers/locks.ts';
import { emptyDay, recordAttempt, vietnamDate } from '../src/engine/activity.ts';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';
import { scoreAttempt } from '../src/engine/scoreAttempt.ts';

let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal('window', { localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) } });
  clearProgressState();
  vi.stubGlobal('navigator', { locks: testLocks() });
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
  it('keeps a failed write in memory even when an older disk version can still be read', () => {
    const old = createInitialState(); saveProgressState(old);
    const next = { ...old, lastSelection: { topic: 'geometry' as const, level: 3, mode: 'learn' as const } };
    window.localStorage.setItem = () => { throw new Error('quota'); };
    expect(saveProgressState(next)).toBe(false);
    expect(loadProgressState()).toEqual({ state: next, isPersisted: false });
    window.localStorage.setItem = (key, value) => data.set(key, value);
    expect(saveProgressState(loadProgressState().state)).toBe(true);
    expect(loadProgressState().state.lastSelection.topic).toBe('geometry');
  });
  it('does not reset live progress or claim success when clearing storage fails', () => {
    const old = createInitialState(); old.lastSelection.topic = 'geometry'; saveProgressState(old);
    window.localStorage.removeItem = () => { throw new Error('blocked'); };
    expect(clearProgressState()).toBe(false);
    expect(loadProgressState().state.lastSelection.topic).toBe('geometry');
  });
  it('does not resurrect cached progress after another tab clears its disk record', () => {
    const state = createInitialState(); state.lastSelection.topic = 'geometry'; saveProgressState(state);
    data.delete(STORAGE_KEY);
    expect(loadProgressState().state.lastSelection.topic).toBe('addition');
    expect(loadProgressState().state.dailyStats).toEqual({});
  });
  it('serializes concurrent updates using the latest state instead of overwriting another writer', async () => {
    const q = generateAdditionQuestion('A01', 1, 777);
    const a = scoreAttempt({ question: q, submittedAnswer: q.answer, action: 'submit', elapsedMs: 1000, mode: 'normal', sessionId: 'one', hintUsed: false });
    await Promise.all([
      updateProgressState(state => recordAttempt(state, a)),
      updateProgressState(state => ({ ...state, preferences: { autoAdvanceNormal: false } })),
      updateProgressState(state => recordAttempt(state, { ...a, id: 'another', sessionId: 'two' }))
    ]);
    const state = loadProgressState().state;
    expect(state.dailyStats[vietnamDate()].total).toBe(2);
    expect(state.preferences.autoAdvanceNormal).toBe(false);
  });
  it('allows one practice owner and releases it for the next tab', async () => {
    const release = await acquirePracticeLock();
    await expect(acquirePracticeLock()).rejects.toThrow('Đang có lượt luyện ở tab khác');
    await release();
    const nextRelease = await acquirePracticeLock(); await nextRelease();
  });
});
