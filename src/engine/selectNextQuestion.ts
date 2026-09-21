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
  sessionKeys?: string[]; // Prompts and semantic keys already present in this session
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
    sessionKeys = [],
    seedOffset
  } = context;

  const prng = createPRNG(Date.now() + seedOffset * 1009 + currentQuestionIndex * 7919);
  const sessionKeySet = new Set(sessionKeys);
  const isDuplicate = (q: Question) => sessionKeySet.has(q.semanticKey) || sessionKeySet.has(q.prompt);

  // 1. Check if within-session retry queue has an eligible question (at least 5 intervening questions)
  if (withinSessionRetryQueue.length > 0) {
    const eligibleIdx = withinSessionRetryQueue.findIndex(
      (item) => currentQuestionIndex - item.failedAtIndex >= 5
    );
    if (eligibleIdx !== -1) {
      const [item] = withinSessionRetryQueue.splice(eligibleIdx, 1);
      const fam = getFamily(item.question.familyId);
      // Generate a fresh non-duplicate variation of the same family for the retry
      for (let attempt = 0; attempt < 50; attempt++) {
        const qSeed = prng.nextInt(1, 10000000);
        const retryQ = fam.generator(qSeed, item.question.level, { tableId: configuration.tableId });
        if (validateQuestion(retryQ) && !isDuplicate(retryQ)) {
          retryQ.reviewReason = 'within_session';
          return { question: retryQ, retryQueueConsumed: true };
        }
      }
      // If variations exhausted, use fresh id
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
    for (let attempt = 0; attempt < 50; attempt++) {
      const card = prng.pick(dueCards);
      const fam = getFamily(card.familyId);
      const qSeed = prng.nextInt(1, 10000000);
      const q = fam.generator(qSeed, card.level, { tableId: configuration.tableId });
      if (validateQuestion(q) && !isDuplicate(q)) {
        q.reviewReason = 'due';
        return { question: q };
      }
    }
  }

  // Standard session:
  // Decide slot type:
  // 40% practice (slots 0..3, 10..13), 20% weak skills (slots 4..5, 14..15), 40% due review (slots 6..9, 16..19)
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

  // Strictly match level for practice sessions to prevent lower levels from leaking
  const targetLevel = configuration.level;

  // If 'due' requested and dueCards available for current topic and exact level:
  if (slotType === 'due' && dueCards.length > 0) {
    const matchingDue = dueCards.filter(
      (c) => c.topic === configuration.topic && c.level === targetLevel
    );
    if (matchingDue.length > 0) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const card = prng.pick(matchingDue);
        const fam = getFamily(card.familyId);
        const qSeed = prng.nextInt(1, 10000000);
        const q = fam.generator(qSeed, card.level, { tableId: configuration.tableId });
        if (validateQuestion(q) && !isDuplicate(q)) {
          q.reviewReason = 'due';
          return { question: q };
        }
      }
    }
  }

  // If 'weak' requested: pick cards with lapses > 0 in current topic and exact level
  if (slotType === 'weak') {
    const weakCards = Object.values(memoryCards).filter(
      (c) => c.topic === configuration.topic && c.lapses > 0 && c.level === targetLevel
    );
    if (weakCards.length > 0) {
      for (let attempt = 0; attempt < 30; attempt++) {
        const card = prng.pick(weakCards);
        const fam = getFamily(card.familyId);
        const qSeed = prng.nextInt(1, 10000000);
        const q = fam.generator(qSeed, card.level, { tableId: configuration.tableId });
        if (validateQuestion(q) && !isDuplicate(q)) {
          q.reviewReason = 'mistake';
          return { question: q };
        }
      }
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

  // Try up to 150 times to generate a non-duplicate valid question for this session
  for (let attempt = 0; attempt < 150; attempt++) {
    const fam = prng.pick(availableFamilies);
    const qSeed = prng.nextInt(1, 1000000000);
    const q = fam.generator(qSeed, configuration.level, { tableId: configuration.tableId });

    if (validateQuestion(q)) {
      if (!isDuplicate(q)) {
        if (!recentSemanticKeys.includes(q.semanticKey) || attempt > 50) {
          return { question: q };
        }
      }
    }
  }

  // Fallback: try picking any valid non-duplicate question from available families
  for (const fam of availableFamilies) {
    for (let i = 0; i < 30; i++) {
      const fallbackSeed = prng.nextInt(1, 1000000000);
      const fallbackQ = fam.generator(fallbackSeed, configuration.level, {
        tableId: configuration.tableId
      });
      if (validateQuestion(fallbackQ) && !isDuplicate(fallbackQ)) {
        return { question: fallbackQ };
      }
    }
  }

  // Ultimate fallback if catalog pool for this level is smaller than 20 unique combinations
  const fallbackFam = prng.pick(availableFamilies);
  const fallbackSeed = prng.nextInt(1, 1000000000);
  const fallbackQ = fallbackFam.generator(fallbackSeed, configuration.level, {
    tableId: configuration.tableId
  });
  return { question: fallbackQ };
}
