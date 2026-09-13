import { Attempt, AttemptStatus, Mode, Question, RawAnswerValue } from './types.ts';
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
}

export function scoreAttempt({
  question,
  submittedAnswer,
  action,
  hintUsed,
  elapsedMs,
  mode,
  sessionId,
  isInterrupted = false
}: ScoreAttemptInput): Attempt {
  const timeLimitMs = mode === 'hard' ? question.hardLimitMs : question.normalLimitMs;
  let status: AttemptStatus = 'incorrect';

  if (isInterrupted) {
    status = 'skipped';
  } else if (action === 'timeout' || elapsedMs > timeLimitMs) {
    status = 'timeout';
  } else if (action === 'skip') {
    status = 'skipped';
  } else if (hintUsed) {
    if (submittedAnswer !== undefined && areAnswersEqual(question.answerType, submittedAnswer, question.answer)) {
      status = 'assisted';
    } else {
      status = 'incorrect';
    }
  } else {
    // Standard submission without hint before deadline
    if (submittedAnswer !== undefined && areAnswersEqual(question.answerType, submittedAnswer, question.answer)) {
      status = 'correct';
    } else {
      status = 'incorrect';
    }
  }

  const timingEligible = !isInterrupted && status === 'correct' && !hintUsed;
  const progressEligible = !isInterrupted;

  return {
    questionId: question.id,
    familyId: question.familyId,
    generatorVersion: question.generatorVersion,
    topic: question.topic,
    level: question.level,
    tableId: question.tableId,
    parameters: question.parameters,
    questionSnapshot: {
      prompt: question.prompt,
      answerType: question.answerType,
      answer: question.answer,
      unit: question.unit,
      hint: question.hint,
      explanation: question.explanation
    },
    semanticKey: question.semanticKey,
    sessionId,
    mode,
    timingProfileVersion: question.timingProfileVersion,
    timeLimitMs,
    memoryKey: question.memoryKey,
    submittedAnswer,
    status,
    elapsedMs,
    timingEligible,
    progressEligible,
    hintUsed,
    reviewReason: question.reviewReason,
    answeredAt: Date.now()
  };
}
