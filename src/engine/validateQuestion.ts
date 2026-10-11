import { AnswerSpec, Question } from './types.ts';
import { isValidDate } from './calendarMath.ts';

export function validateQuestion(q: Question): boolean {
  if (!q.id || !q.familyId || !q.prompt || q.answer === undefined || q.answer === null) {
    return false;
  }

  if (q.normalLimitMs <= 0 || q.hardLimitMs <= 0 || q.hardLimitMs >= q.normalLimitMs) {
    return false;
  }
  if (!validateAnswerSpec(q) || (q.steps && (!q.steps.length || q.steps.some(s => !s.prompt || !validateAnswerSpec(s))))) return false;

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

function validateAnswerSpec(spec: AnswerSpec): boolean {
  const n = spec.answer;
  if (spec.answerType === 'integer' || spec.answerType === 'signed') return typeof n === 'number' && Number.isSafeInteger(n) && (spec.answerType === 'signed' || n >= 0) && Math.abs(n) <= 10_000_000;
  if (spec.answerType === 'decimal') return typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1_000_000 && Math.abs(n * 10000 - Math.round(n * 10000)) < 1e-6;
  if (spec.answerType === 'blanks') return Array.isArray(n) && n.length > 0 && n.length === spec.fields?.length && spec.fields.every((f, i) => validateAnswerSpec({ answerType: f.type, answer: n[i] }));
  if (spec.answerType === 'choice') return typeof n === 'number' && Number.isInteger(n) && !!spec.choices && spec.choices.length >= 2 && spec.choices.length <= 4 && new Set(spec.choices).size === spec.choices.length && n >= 0 && n < spec.choices.length;
  if (spec.answerType === 'clock') return typeof n === 'object' && n !== null && 'hour' in n && 'minute' in n && Number.isInteger(n.hour) && Number.isInteger(n.minute) && n.hour >= 0 && n.hour <= 23 && n.minute >= 0 && n.minute <= 59;
  if (spec.answerType === 'date') return typeof n === 'object' && n !== null && 'day' in n && 'month' in n && 'year' in n && isValidDate(n.day, n.month, n.year);
  if (spec.answerType === 'weekday') return typeof n === 'number' && Number.isInteger(n) && n >= 2 && n <= 8;
  return false;
}
