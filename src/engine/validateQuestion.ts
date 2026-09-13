import { Question } from './types.ts';
import { isValidDate } from './calendarMath.ts';

export function validateQuestion(q: Question): boolean {
  if (!q.id || !q.familyId || !q.prompt || q.answer === undefined || q.answer === null) {
    return false;
  }

  if (q.normalLimitMs <= 0 || q.hardLimitMs <= 0 || q.hardLimitMs >= q.normalLimitMs) {
    return false;
  }

  // Check by answerType
  if (q.answerType === 'integer') {
    if (typeof q.answer !== 'number') return false;
    if (!Number.isSafeInteger(q.answer)) return false;
    if (q.answer < 0) return false;

    // Check maximum limits
    if (q.topic === 'money' && q.answer > 10_000_000) return false;
    if (q.topic !== 'money' && q.answer > 1_000_000) return false;
  } else if (q.answerType === 'clock') {
    const c = q.answer as any;
    if (typeof c !== 'object' || c === null) return false;
    if (!Number.isInteger(c.hour) || !Number.isInteger(c.minute)) return false;
    if (c.hour < 0 || c.hour > 23 || c.minute < 0 || c.minute > 59) return false;
  } else if (q.answerType === 'date') {
    const d = q.answer as any;
    if (typeof d !== 'object' || d === null) return false;
    if (!isValidDate(d.day, d.month, d.year)) return false;
  } else if (q.answerType === 'weekday') {
    const w = Number(q.answer);
    if (!Number.isInteger(w) || w < 2 || w > 8) return false;
  }

  // Level-specific invariant checks for basic operations
  if (q.topic === 'addition' && q.level === 1) {
    const p = q.parameters;
    if (p.a !== undefined && p.b !== undefined) {
      if (p.a + p.b > 9) return false; // Basic addition must strictly be < 10!
    }
  }

  if (q.topic === 'subtraction' && q.level === 1) {
    const p = q.parameters;
    if (p.a !== undefined && p.b !== undefined) {
      if (p.a > 9 || p.b > p.a || p.b < 0) return false; // Basic subtraction minuend <= 9
    }
  }

  if (q.topic === 'multiplication' && q.level === 1) {
    const p = q.parameters;
    if (p.a !== undefined && p.b !== undefined) {
      if (p.a > 9 || p.b > 10) return false; // Times table only
    }
  }

  if (q.topic === 'division' && q.parameters.d !== undefined && q.parameters.q !== undefined) {
    if (q.parameters.d === 0) return false; // Division by 0 forbidden
  }

  return true;
}
