import { Attempt, AttemptStatus, Mode, Question, RawAnswerValue, Topic } from './types.ts';
import { areAnswersEqual } from './normalizeAnswer.ts';

export interface ScoreAttemptInput {
  question: Question;
  submittedAnswer?: RawAnswerValue;
  action: 'submit' | 'skip' | 'timeout';
  hintUsed: boolean;
  elapsedMs: number;
  mode: Mode;
  sessionId: string;
  isInterrupted?: boolean;
  selectedTopic?: Topic;
}

export function scoreAttempt({
  question,
  submittedAnswer,
  action,
  hintUsed,
  elapsedMs,
  mode,
  sessionId,
  isInterrupted = false,
  selectedTopic = question.topic
}: ScoreAttemptInput): Attempt {
  const timeLimitMs = mode === 'learn' ? 0 : mode === 'hard' ? question.hardLimitMs : question.normalLimitMs;
  let status: AttemptStatus = 'incorrect';

  if (mode !== 'learn' && (action === 'timeout' || elapsedMs >= timeLimitMs)) {
    status = 'timeout';
  } else if (action === 'skip') {
    status = 'skipped';
  } else if (hintUsed) {
    if (submittedAnswer !== undefined && areAnswersEqual(question.answerType, submittedAnswer, question.answer, question.unordered)) {
      status = 'assisted';
    } else {
      status = 'incorrect';
    }
  } else {
    // Standard submission without hint before deadline
    if (submittedAnswer !== undefined && areAnswersEqual(question.answerType, submittedAnswer, question.answer, question.unordered)) {
      status = 'correct';
    } else {
      status = 'incorrect';
    }
  }

  const timingEligible = mode !== 'learn' && !isInterrupted && status === 'correct' && !hintUsed;
  const progressEligible = true;

  return {
    id: `${sessionId}:${question.id}`,
    questionId: question.id,
    familyId: question.familyId,
    generatorVersion: question.generatorVersion,
    topic: selectedTopic,
    level: question.level,
    tableId: question.tableId,
    parameters: question.parameters,
    questionSnapshot: {
      prompt: question.prompt,
      answerType: question.answerType,
      answer: question.answer,
      unit: question.unit,
      hint: question.hint,
      explanation: question.explanation,
      fields: question.fields, choices: question.choices, unordered: question.unordered,
      steps: question.steps, diagram: question.diagram
    },
    semanticKey: question.semanticKey,
    sessionId,
    mode,
    timingProfileVersion: question.timingProfileVersion,
    timeLimitMs,
    benchmarkLimitMs: question.hardLimitMs,
    memoryKey: question.memoryKey,
    submittedAnswer,
    status,
    elapsedMs,
    timingEligible,
    progressEligible,
    hintUsed,
    answeredAt: Date.now()
  };
}
