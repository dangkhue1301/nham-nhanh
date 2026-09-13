import { describe, it, expect } from 'vitest';
import {
  createMemoryCardFromQuestion,
  updateMemoryCard,
  isDurableMemory,
  getDueMemoryCards
} from '../src/engine/spacedReview.ts';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';

describe('Spaced Repetition & Memory Retention Engine', () => {
  const dummyQ = generateAdditionQuestion('A01', 1, 100);

  it('correct and fast progression follows 1 -> 3 -> 7 -> 14 -> 30 days', () => {
    let card = createMemoryCardFromQuestion(dummyQ, '2026-09-13');

    // Day 1: First correct answer -> advances to stage 1 (due in 1 day)
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 2000,
      hardLimitMs: 4000,
      todayStr: '2026-09-13'
    });
    expect(card.scheduleStage).toBe(1);
    expect(card.dueLocalDate).toBe('2026-09-14');

    // Day 2 (due day): Correct and fast -> advances to stage 2 (due in 3 days)
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 2000,
      hardLimitMs: 4000,
      todayStr: '2026-09-14'
    });
    expect(card.scheduleStage).toBe(2);
    expect(card.dueLocalDate).toBe('2026-09-17');

    // Day 5 (due day 17): Correct and fast -> advances to stage 3 (due in 7 days)
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 2000,
      hardLimitMs: 4000,
      todayStr: '2026-09-17'
    });
    expect(card.scheduleStage).toBe(3);
    expect(card.dueLocalDate).toBe('2026-09-24');

    // Day 12 (due day 24): Correct and fast -> advances to stage 4 (due in 14 days)
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 2000,
      hardLimitMs: 4000,
      todayStr: '2026-09-24'
    });
    expect(card.scheduleStage).toBe(4);
    expect(card.dueLocalDate).toBe('2026-10-08');

    // Day 26 (due day Oct 8): Correct and fast -> advances to stage 5 (due in 30 days)
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 2000,
      hardLimitMs: 4000,
      todayStr: '2026-10-08'
    });
    expect(card.scheduleStage).toBe(5);
    expect(card.dueLocalDate).toBe('2026-11-07');
  });

  it('lapses reset stage to 1 and due tomorrow', () => {
    let card = createMemoryCardFromQuestion(dummyQ, '2026-09-13');
    card.scheduleStage = 4;
    card.dueLocalDate = '2026-09-13';

    // Mistake occurs
    card = updateMemoryCard({
      card,
      status: 'incorrect',
      elapsedMs: 2500,
      hardLimitMs: 4000,
      todayStr: '2026-09-13'
    });
    expect(card.scheduleStage).toBe(1);
    expect(card.dueLocalDate).toBe('2026-09-14');
    expect(card.lapses).toBe(1);
  });

  it('correct but slow keeps current stage and schedules for tomorrow', () => {
    let card = createMemoryCardFromQuestion(dummyQ, '2026-09-13');
    card.scheduleStage = 3;
    card.dueLocalDate = '2026-09-13';

    // Correct but slow (elapsed 5000 > hardLimit 4000)
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 5000,
      hardLimitMs: 4000,
      todayStr: '2026-09-13'
    });
    expect(card.scheduleStage).toBe(3); // stays at 3
    expect(card.dueLocalDate).toBe('2026-09-14'); // due tomorrow
  });

  it('verifies durable memory condition (>= 3 distinct successful days across >= 7 days)', () => {
    let card = createMemoryCardFromQuestion(dummyQ, '2026-09-01');
    card.successfulReviewDates = ['2026-09-01', '2026-09-02'];
    card.successRunStartDate = '2026-09-01';
    expect(isDurableMemory(card)).toBe(false); // only 2 days

    card.successfulReviewDates = ['2026-09-01', '2026-09-02', '2026-09-03'];
    expect(isDurableMemory(card)).toBe(false); // 3 days but only span of 2 days (< 7)

    card.successfulReviewDates = ['2026-09-01', '2026-09-04', '2026-09-08'];
    expect(isDurableMemory(card)).toBe(true); // 3 days, span is 7 days!
  });

  it('correctly filters due memory cards', () => {
    const cards = {
      card1: {
        ...createMemoryCardFromQuestion(dummyQ, '2026-09-10'),
        dueLocalDate: '2026-09-10'
      },
      card2: {
        ...createMemoryCardFromQuestion(dummyQ, '2026-09-15'),
        dueLocalDate: '2026-09-15'
      }
    };

    const dueToday = getDueMemoryCards(cards, '2026-09-13');
    expect(dueToday.length).toBe(1);
    expect(dueToday[0].dueLocalDate).toBe('2026-09-10');
  });
});
