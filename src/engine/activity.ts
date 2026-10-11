import { Attempt, DailyCounts, DailyStats, ProgressState, SessionConfiguration, SessionSummary } from './types.ts';

export const emptyCounts = (): DailyCounts => ({ total: 0, correct: 0, assisted: 0, incorrect: 0, skipped: 0, timeout: 0, timedCorrectCount: 0, correctElapsedMs: 0 });
export const emptyDay = (): DailyStats => ({ ...emptyCounts(), bySelection: {} });

export function vietnamDate(timestamp = Date.now()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(timestamp);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function addCount(counts: DailyCounts, attempt: Attempt): DailyCounts {
  return {
    ...counts, total: counts.total + 1, [attempt.status]: counts[attempt.status] + 1,
    timedCorrectCount: counts.timedCorrectCount + (attempt.timingEligible ? 1 : 0),
    correctElapsedMs: counts.correctElapsedMs + (attempt.timingEligible ? attempt.elapsedMs : 0)
  };
}

export function recordAttempt(state: ProgressState, attempt: Attempt): ProgressState {
  if (state.recentAttemptIds.includes(attempt.id)) return state;
  const date = vietnamDate(attempt.answeredAt);
  const day = state.dailyStats[date] ?? emptyDay();
  const selectionKey = `${attempt.mode}:${attempt.topic}`;
  const windowKey = `${attempt.mode}:${attempt.topic}:${attempt.level}`;
  const tableWindows = { ...state.tableWindows };
  if (attempt.tableId) {
    const key = `${windowKey}:${attempt.tableId}`;
    tableWindows[key] = [...(tableWindows[key] || []), attempt].slice(-40);
  }
  return {
    ...state,
    dailyStats: { ...state.dailyStats, [date]: { ...addCount(day, attempt), bySelection: { ...day.bySelection, [selectionKey]: addCount(day.bySelection[selectionKey] ?? emptyCounts(), attempt) } } },
    recentAttemptIds: [...state.recentAttemptIds, attempt.id].slice(-1000),
    recentSemanticKeys: [...state.recentSemanticKeys, attempt.semanticKey].slice(-200),
    topicLevelWindows: { ...state.topicLevelWindows, [windowKey]: [...(state.topicLevelWindows[windowKey] || []), attempt].slice(-100) },
    tableWindows
  };
}

export function filterDay(day: DailyStats | undefined, topic: string, mode: string): DailyCounts {
  if (!day) return emptyCounts();
  if (topic === 'all' && mode === 'all') return day;
  const total = emptyCounts();
  for (const [key, counts] of Object.entries(day.bySelection)) {
    const [segmentMode, segmentTopic] = key.split(':');
    if ((topic === 'all' || topic === segmentTopic) && (mode === 'all' || mode === segmentMode)) {
      for (const field of Object.keys(total) as (keyof DailyCounts)[]) total[field] += counts[field];
    }
  }
  return total;
}

export function summarizeSession(id: string, configuration: SessionConfiguration, startedAt: number, attempts: Attempt[], status: SessionSummary['status'], totalQuestions: number): SessionSummary {
  const times = attempts.filter(a => a.timingEligible).map(a => a.elapsedMs).sort((a, b) => a - b);
  const mid = Math.floor(times.length / 2);
  return {
    id, configuration, startedAt, completedAt: Date.now(), status, scoredCount: attempts.length,
    independentCorrectCount: attempts.filter(a => a.status === 'correct').length,
    assistedCount: attempts.filter(a => a.status === 'assisted').length,
    incorrectCount: attempts.filter(a => a.status === 'incorrect').length,
    skippedCount: attempts.filter(a => a.status === 'skipped').length,
    timeoutCount: attempts.filter(a => a.status === 'timeout').length,
    unansweredCount: Math.max(0, totalQuestions - attempts.length),
    medianCorrectMs: times.length ? (times.length % 2 ? times[mid] : Math.round((times[mid - 1] + times[mid]) / 2)) : null,
    bestEligible: status === 'completed' && configuration.mode === 'hard' && attempts.length === totalQuestions && attempts.every(a => a.timingEligible)
  };
}
