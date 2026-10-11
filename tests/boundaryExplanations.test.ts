import { describe, expect, it } from 'vitest';
import { generateTimeQuestion } from '../src/engine/generators/time.ts';
import { generateCalendarQuestion } from '../src/engine/generators/calendar.ts';
import { generateSubtractionQuestion } from '../src/engine/generators/subtraction.ts';

describe('Boundary problems agree with their prompts and intermediate explanations', () => {
  it('T04 always reaches the next hour and the displayed minute equation is true', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const q = generateTimeQuestion('T04', 2, seed * 1013);
      const p = q.parameters;
      expect(p.h2).toBe(p.h1 + 1);
      expect(q.answer).toBe((p.h2 - p.h1) * 60 + p.m2 - p.m1);
      const equation = q.explanation.match(/➔ (\d+) \+ (\d+) = (\d+) phút/)!;
      expect(Number(equation[1]) + Number(equation[2])).toBe(Number(equation[3]));
    }
  });
  it('T06 always ends on the next day without negative minutes in the explanation', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const q = generateTimeQuestion('T06', 4, seed * 1013), p = q.parameters;
      const total = p.startH * 60 + p.startM + p.duration;
      expect(total).toBeGreaterThanOrEqual(1440);
      expect(q.answer).toEqual({ hour: Math.floor((total - 1440) / 60), minute: (total - 1440) % 60 });
      expect(q.explanation).not.toMatch(/-\d+ phút/);
      expect(q.generatorVersion).toBe(2);
    }
  });
  it.each([['C05', 3], ['C06', 4]] as const)('%s actually crosses its stated month/year boundary', (family, level) => {
    for (let seed = 1; seed <= 1000; seed++) {
      const q = generateCalendarQuestion(family, level, seed * 1013), p = q.parameters;
      const start = p.startDate, target = p.targetDate;
      if (family === 'C05') expect(target.month).toBe(start.month + 1);
      else { expect(target.year).toBe(start.year + 1); expect(target.month).toBe(1); }
      expect(Date.UTC(target.year, target.month - 1, target.day) - Date.UTC(start.year, start.month - 1, start.day)).toBe(p.offset * 86400000);
      expect(q.explanation).not.toMatch(/-\d+ ngày/);
      expect(q.generatorVersion).toBe(2);
    }
  });
  it('subtraction from 20 teaches borrowing rather than subtracting from zero', () => {
    const q = generateSubtractionQuestion('S03', 2, 5065);
    expect(q.prompt).toBe('20 − 2 = ?');
    expect(q.hint).toContain('10 − 2'); expect(q.hint).not.toContain('0 − 2,');
    expect(q.answer).toBe(18);
  });
});
