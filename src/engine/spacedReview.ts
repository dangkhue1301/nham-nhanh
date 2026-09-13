import { AttemptStatus, MemoryCard, Question } from './types.ts';
import { addDaysToDate } from './calendarMath.ts';

export const REVIEW_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
};

export function getTodayLocalDateStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function parseLocalDateStr(str: string): { year: number; month: number; day: number } {
  const [y, m, d] = str.split('-').map(Number);
  return { year: y, month: m, day: d };
}

export function formatLocalDateStr(parts: { year: number; month: number; day: number }): string {
  const yyyy = parts.year;
  const mm = String(parts.month).padStart(2, '0');
  const dd = String(parts.day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function addDaysToLocalDateStr(dateStr: string, days: number): string {
  const p = parseLocalDateStr(dateStr);
  const next = addDaysToDate(p, days);
  return formatLocalDateStr(next);
}

export function createMemoryCardFromQuestion(q: Question, todayStr: string): MemoryCard {
  return {
    memoryKey: q.memoryKey,
    kind: q.memoryKey.startsWith('fact:') ? 'fact' : 'skill',
    topic: q.topic,
    level: q.level,
    familyId: q.familyId,
    factParameters: q.memoryKey.startsWith('fact:') ? q.parameters : undefined,
    scheduleStage: 0,
    dueLocalDate: todayStr,
    lastPracticedAt: Date.now(),
    successfulReviewDates: [],
    lastOutcome: 'skipped',
    lapses: 0
  };
}

export interface UpdateCardInput {
  card: MemoryCard;
  status: AttemptStatus;
  elapsedMs: number;
  hardLimitMs: number;
  todayStr: string;
  nowMs?: number;
  snapshot?: any;
}

export function updateMemoryCard({
  card,
  status,
  elapsedMs,
  hardLimitMs,
  todayStr,
  nowMs = Date.now(),
  snapshot
}: UpdateCardInput): MemoryCard {
  const updated: MemoryCard = {
    ...card,
    lastPracticedAt: nowMs,
    lastOutcome: status,
    successfulReviewDates: [...card.successfulReviewDates]
  };

  const isIndependentCorrect = status === 'correct';
  const isFast = elapsedMs <= hardLimitMs;
  const isDue = card.dueLocalDate <= todayStr;

  if (!isIndependentCorrect) {
    // Incorrect, assisted, skipped, or timeout:
    // Reset to stage 1, due tomorrow, record lapse and snapshot
    updated.scheduleStage = 1;
    updated.dueLocalDate = addDaysToLocalDateStr(todayStr, 1);
    updated.lapses += 1;
    if (snapshot) {
      updated.latestIncorrectSnapshot = snapshot;
    }
    return updated;
  }

  // Independent correct!
  if (!isFast) {
    // Correct but slow: keep current stage, due tomorrow (reinforcement)
    updated.dueLocalDate = addDaysToLocalDateStr(todayStr, 1);
    return updated;
  }

  // Correct AND fast!
  // Check if we can advance stage (must be due, and max 1 stage advance per day)
  const alreadyAdvancedToday = card.lastAdvancedLocalDate === todayStr;

  if (isDue && !alreadyAdvancedToday) {
    const nextStage = Math.min(5, (card.scheduleStage || 0) + 1);
    updated.scheduleStage = nextStage;
    updated.lastAdvancedLocalDate = todayStr;
    const intervalDays = REVIEW_INTERVALS[nextStage] || 30;
    updated.dueLocalDate = addDaysToLocalDateStr(todayStr, intervalDays);

    if (!updated.successfulReviewDates.includes(todayStr)) {
      updated.successfulReviewDates.push(todayStr);
    }
    if (!updated.successRunStartDate) {
      updated.successRunStartDate = todayStr;
    }
  } else if (!isDue) {
    // Answered before due date: keep current schedule, do not advance
    // card.dueLocalDate stays as is
  } else {
    // Already advanced today: keep due date from the earlier advance
  }

  return updated;
}

export function isDurableMemory(card: MemoryCard): boolean {
  // At least 3 distinct successful review days across at least 7 days
  if (card.successfulReviewDates.length < 3) return false;
  if (!card.successRunStartDate) return false;

  const firstDate = parseLocalDateStr(card.successRunStartDate);
  const lastDate = parseLocalDateStr(card.successfulReviewDates[card.successfulReviewDates.length - 1]);
  // Calculate difference
  const diffDays = Math.floor(
    (Date.UTC(lastDate.year, lastDate.month - 1, lastDate.day) -
      Date.UTC(firstDate.year, firstDate.month - 1, firstDate.day)) /
      (24 * 60 * 60 * 1000)
  );
  return diffDays >= 7;
}

export function getDueMemoryCards(
  cards: Record<string, MemoryCard>,
  todayStr: string,
  filter?: { topic?: string; level?: number }
): MemoryCard[] {
  return Object.values(cards).filter((c) => {
    if (c.dueLocalDate > todayStr) return false;
    if (filter?.topic && c.topic !== filter.topic) return false;
    if (filter?.level !== undefined && c.level > filter.level) return false;
    return true;
  });
}
