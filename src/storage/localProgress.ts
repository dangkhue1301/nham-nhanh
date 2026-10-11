import { Attempt, DailyCounts, DailyStats, ProgressState, SessionConfiguration, SessionSummary, Topic } from '../engine/types.ts';
import { TOPIC_NAMES } from '../engine/catalog.ts';
import { isThinkingTopic } from '../engine/generators/thinking.ts';
import { emptyCounts } from '../engine/activity.ts';

export const STORAGE_KEY = 'nham-nhanh:v2';
const LEGACY_KEY = 'nham-nhanh:v1';
export const DEFAULT_CONFIGURATION: SessionConfiguration = { topic: 'addition', level: 1, mode: 'normal' };

export function createInitialState(): ProgressState {
  return { schemaVersion: 2, preferences: { autoAdvanceNormal: true }, lastSelection: { ...DEFAULT_CONFIGURATION }, topicLevelWindows: {}, tableWindows: {}, recentSemanticKeys: [], recentSessions: [], bestHardRuns: {}, dailyStats: {}, recentAttemptIds: [], statsStartedAt: Date.now() };
}
export const INITIAL_PROGRESS_STATE = createInitialState();
let inMemoryStorage: ProgressState | null = null;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);

export function sanitizeConfiguration(value: unknown): SessionConfiguration {
  const v = record(value) ? value : {};
  const topic = typeof v.topic === 'string' && Object.prototype.hasOwnProperty.call(TOPIC_NAMES, v.topic) ? v.topic as Topic : 'addition';
  const level = typeof v.level === 'number' && Number.isInteger(v.level) && v.level >= 1 && v.level <= 5 ? v.level : 1;
  const mode = v.mode === 'hard' || (v.mode === 'learn' && isThinkingTopic(topic)) ? v.mode : 'normal';
  const tableId = (topic === 'multiplication' || topic === 'division') && level === 1 && typeof v.tableId === 'number' && Number.isInteger(v.tableId) && v.tableId >= 2 && v.tableId <= 9 ? v.tableId : undefined;
  return { topic, level, mode, tableId };
}

function cleanWindows(value: unknown): Record<string, Attempt[]> {
  if (!record(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, list]) => Array.isArray(list)).map(([key, list]) => [key, (list as unknown[]).filter((a): a is Attempt => record(a) && typeof a.questionId === 'string' && typeof a.answeredAt === 'number' && typeof a.elapsedMs === 'number' && Number.isFinite(a.elapsedMs) && typeof a.status === 'string' && ['correct','incorrect','assisted','skipped','timeout'].includes(a.status) && record(a.questionSnapshot) && typeof a.questionSnapshot.prompt === 'string').slice(-100).map(a => ({ ...a, id: a.id || `legacy:${a.questionId}:${a.answeredAt}`, sessionId: a.id ? a.sessionId : 'legacy', timingEligible: !!a.id && a.timingEligible && Number.isFinite(a.benchmarkLimitMs) && a.benchmarkLimitMs > 0, progressEligible: a.progressEligible !== false, benchmarkLimitMs: a.benchmarkLimitMs || 0 }))]));
}
function cleanCounts(value: unknown): DailyCounts | null {
  if (!record(value)) return null;
  const counts = emptyCounts();
  for (const key of Object.keys(counts) as (keyof DailyCounts)[]) {
    const n = value[key];
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || !Number.isSafeInteger(n)) return null;
    counts[key] = n;
  }
  if (counts.total !== counts.correct + counts.assisted + counts.incorrect + counts.skipped + counts.timeout || counts.timedCorrectCount > counts.correct) return null;
  return counts;
}
function cleanDays(value: unknown): Record<string, DailyStats> {
  if (!record(value)) return {};
  const days: Record<string, DailyStats> = {};
  for (const [date, raw] of Object.entries(value)) {
    const counts = cleanCounts(raw);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !counts || !record(raw)) continue;
    const bySelection: Record<string, DailyCounts> = {};
    if (record(raw.bySelection)) for (const [key, segment] of Object.entries(raw.bySelection)) {
      const count = cleanCounts(segment);
      if (count) bySelection[key] = count;
    }
    days[date] = { ...counts, bySelection };
  }
  return days;
}
function sanitizeState(raw: unknown): ProgressState {
  const defaults = createInitialState();
  if (!record(raw) || (raw.schemaVersion !== 1 && raw.schemaVersion !== 2)) return defaults;
  const preferences = record(raw.preferences) ? raw.preferences : {};
  const recentSessions = Array.isArray(raw.recentSessions) ? raw.recentSessions.filter((s): s is SessionSummary => record(s) && typeof s.id === 'string' && typeof s.startedAt === 'number' && Math.abs(s.startedAt) <= 8.64e15 && typeof s.scoredCount === 'number' && Number.isSafeInteger(s.scoredCount) && s.scoredCount >= 0 && typeof s.independentCorrectCount === 'number' && Number.isSafeInteger(s.independentCorrectCount) && s.independentCorrectCount >= 0 && s.independentCorrectCount <= s.scoredCount && record(s.configuration)).slice(-100).map(s => ({ ...s, configuration: sanitizeConfiguration(s.configuration) })) : [];
  const bestHardRuns = record(raw.bestHardRuns) ? Object.fromEntries(Object.entries(raw.bestHardRuns).filter(([, run]) => record(run) && typeof run.correctCount === 'number' && Number.isSafeInteger(run.correctCount) && run.correctCount >= 0 && typeof run.totalElapsedMs === 'number' && Number.isFinite(run.totalElapsedMs) && run.totalElapsedMs >= 0 && typeof run.date === 'string')) as ProgressState['bestHardRuns'] : {};
  return {
    ...defaults, preferences: { autoAdvanceNormal: typeof preferences.autoAdvanceNormal === 'boolean' ? preferences.autoAdvanceNormal : true },
    lastSelection: sanitizeConfiguration(raw.lastSelection), topicLevelWindows: cleanWindows(raw.topicLevelWindows), tableWindows: cleanWindows(raw.tableWindows),
    recentSessions, bestHardRuns, recentSemanticKeys: Array.isArray(raw.recentSemanticKeys) ? raw.recentSemanticKeys.filter((k): k is string => typeof k === 'string').slice(-200) : [],
    dailyStats: raw.schemaVersion === 2 ? cleanDays(raw.dailyStats) : {},
    recentAttemptIds: Array.isArray(raw.recentAttemptIds) ? raw.recentAttemptIds.filter((k): k is string => typeof k === 'string').slice(-1000) : [],
    statsStartedAt: typeof raw.statsStartedAt === 'number' && Number.isFinite(raw.statsStartedAt) && Math.abs(raw.statsStartedAt) <= 8.64e15 ? raw.statsStartedAt : defaults.statsStartedAt
  };
}

export function isLocalStorageAvailable(): boolean {
  try { return typeof window !== 'undefined' && !!window.localStorage; } catch { return false; }
}
export function loadProgressState(): { state: ProgressState; isPersisted: boolean } {
  if (!isLocalStorageAvailable()) return { state: inMemoryStorage ?? createInitialState(), isPersisted: false };
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (record(parsed) && (parsed.schemaVersion === 1 || parsed.schemaVersion === 2)) return { state: sanitizeState(parsed), isPersisted: true };
      } catch { /* Recover from legacy data below. */ }
    }
    raw = window.localStorage.getItem(LEGACY_KEY);
    if (raw) {
      try { return { state: sanitizeState(JSON.parse(raw)), isPersisted: true }; } catch { /* Recover usable in-memory data. */ }
    }
    return { state: inMemoryStorage ?? createInitialState(), isPersisted: true };
  } catch { return { state: inMemoryStorage ?? createInitialState(), isPersisted: false }; }
}
export function saveProgressState(state: ProgressState): boolean {
  inMemoryStorage = state;
  try {
    if (!isLocalStorageAvailable()) return false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}
export function clearProgressState(): boolean {
  inMemoryStorage = createInitialState();
  try {
    if (isLocalStorageAvailable()) {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_KEY);
    }
    return true;
  } catch { return false; }
}
