import { MemoryCard, Question, SessionConfiguration } from './types.ts';
import { getFamiliesForTopicAndLevel, getFamily } from './catalog.ts';
import { createPRNG } from './random.ts';
import { validateQuestion } from './validateQuestion.ts';

export interface QuestionSelectorContext {
  configuration: SessionConfiguration;
  memoryCards: Record<string, MemoryCard>;
  dueCards: MemoryCard[];
  withinSessionRetryQueue: { question: Question; failedAtIndex: number }[];
  currentQuestionIndex: number; // 0..19
  recentSemanticKeys: string[];
  seedOffset: number;
}

export function selectNextQuestion(context: QuestionSelectorContext): {
  question: Question;
  retryQueueConsumed?: boolean;
} {
  const {
    configuration,
    memoryCards,
    dueCards,
    withinSessionRetryQueue,
    currentQuestionIndex,
    recentSemanticKeys,
    seedOffset
  } = context;

  const prng = createPRNG(Date.now() + seedOffset * 1009 + currentQuestionIndex * 7919);

  // 1. Check if within-session retry queue has an eligible question (at least 5 intervening questions)
  if (withinSessionRetryQueue.length > 0) {
    const eligibleIdx = withinSessionRetryQueue.findIndex(
      (item) => currentQuestionIndex - item.failedAtIndex >= 5
    );
    if (eligibleIdx !== -1) {
      const [item] = withinSessionRetryQueue.splice(eligibleIdx, 1);
      // Generate a fresh variation of the same family and parameters, or use item with reviewReason
      const retryQuestion: Question = {
        ...item.question,
        id: `${item.question.familyId}-${item.question.level}-${Date.now()}-retry`,
        reviewReason: 'within_session'
      };
      return { question: retryQuestion, retryQueueConsumed: true };
    }
  }

  // 2. Determine generation strategy
  // In Hard mode: 100% current level
  // In Normal mode:
  // - If custom review session (e.g. Due reviews): generate from due card
  if (configuration.isCustomReview && dueCards.length > 0) {
    const card = prng.pick(dueCards);
    const fam = getFamily(card.familyId);
    const qSeed = prng.nextInt(1, 10000000);
    const q = fam.generator(qSeed, card.level, { tableId: configuration.tableId });
    q.reviewReason = 'due';
    return { question: q };
  }

  // Standard session:
  // Decide slot type:
  // 40% practice (slots 0..7), 20% weak skills (slots 8..11), 40% due review (slots 12..19)
  let slotType: 'practice' | 'weak' | 'due' = 'practice';
  if (configuration.mode === 'normal') {
    const mod = currentQuestionIndex % 10;
    if (mod < 4) {
      slotType = 'practice';
    } else if (mod < 6) {
      slotType = 'weak';
    } else {
      slotType = 'due';
    }
  }

  // If 'due' requested and dueCards available:
  if (slotType === 'due' && dueCards.length > 0) {
    const matchingDue = dueCards.filter(
      (c) => c.topic === configuration.topic && c.level <= configuration.level
    );
    if (matchingDue.length > 0) {
      const card = prng.pick(matchingDue);
      const fam = getFamily(card.familyId);
      const qSeed = prng.nextInt(1, 10000000);
      const q = fam.generator(qSeed, card.level, { tableId: configuration.tableId });
      q.reviewReason = 'due';
      return { question: q };
    }
  }

  // If 'weak' requested: pick cards with lapses > 0 in current topic
  if (slotType === 'weak') {
    const weakCards = Object.values(memoryCards).filter(
      (c) => c.topic === configuration.topic && c.lapses > 0 && c.level <= configuration.level
    );
    if (weakCards.length > 0) {
      const card = prng.pick(weakCards);
      const fam = getFamily(card.familyId);
      const qSeed = prng.nextInt(1, 10000000);
      const q = fam.generator(qSeed, card.level, { tableId: configuration.tableId });
      q.reviewReason = 'mistake';
      return { question: q };
    }
  }

  // Default: Practice current topic & level with deduplication
  const availableFamilies = getFamiliesForTopicAndLevel(
    configuration.topic,
    configuration.level
  );

  if (availableFamilies.length === 0) {
    throw new Error(
      `No families available for topic ${configuration.topic} level ${configuration.level}`
    );
  }

  // Try up to 50 times to generate a non-duplicate valid question
  for (let attempt = 0; attempt < 50; attempt++) {
    const fam = prng.pick(availableFamilies);
    const qSeed = prng.nextInt(1, 1000000000);
    const q = fam.generator(qSeed, configuration.level, { tableId: configuration.tableId });

    if (validateQuestion(q)) {
      if (!recentSemanticKeys.includes(q.semanticKey) || attempt > 30) {
        return { question: q };
      }
    }
  }

  // Fallback if 50 attempts exceeded
  const fallbackFam = prng.pick(availableFamilies);
  const fallbackSeed = prng.nextInt(1, 1000000000);
  const fallbackQ = fallbackFam.generator(fallbackSeed, configuration.level, {
    tableId: configuration.tableId
  });
  return { question: fallbackQ };
}
