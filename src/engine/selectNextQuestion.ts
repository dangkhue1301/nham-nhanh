import { Question, SessionConfiguration } from './types.ts';
import { getFamiliesForTopicAndLevel } from './catalog.ts';
import { createPRNG } from './random.ts';
import { validateQuestion } from './validateQuestion.ts';

export interface QuestionSelectorContext {
  configuration: SessionConfiguration;
  currentQuestionIndex: number;
  recentSemanticKeys: string[];
  sessionKeys?: string[];
  seedOffset: number;
  sessionSeed?: number;
}

export function selectNextQuestion(context: QuestionSelectorContext): { question: Question } {
  const { configuration, currentQuestionIndex, recentSemanticKeys, sessionKeys = [], seedOffset } = context;
  let families = getFamiliesForTopicAndLevel(configuration.topic, configuration.level);
  // M02 teaches ×1 and ×10, rather than a selected table. A table run uses its actual facts.
  if (configuration.topic === 'multiplication' && configuration.level === 1 && configuration.tableId) {
    families = families.filter(f => f.familyId !== 'M02');
  }
  if (!families.length) throw new Error('Không có dạng bài phù hợp với lựa chọn này.');
  const rng = createPRNG((context.sessionSeed ?? Date.now()) + seedOffset * 1009 + currentQuestionIndex * 7919);
  const used = new Set(sessionKeys);
  let validFallback: Question | undefined;
  for (let i = 0; i < 400; i++) {
    const family = rng.pick(families);
    const generated = family.generator(rng.nextInt(1, 1000000000), configuration.level, { tableId: configuration.tableId });
    if (!validateQuestion(generated)) continue;
    const q = { ...generated, id: `${generated.id}-${currentQuestionIndex}` };
    validFallback ??= q;
    if (used.has(q.semanticKey) || used.has(q.prompt)) continue;
    if (!recentSemanticKeys.includes(q.semanticKey) || i >= 100) return { question: q };
  }
  // Very small tables can have fewer than 20 facts. Exhaust valid variations before repeating.
  if (validFallback) return { question: validFallback };
  throw new Error('Chưa sinh được câu hợp lệ. Hãy chọn lại chủ đề.');
}
