import { describe, it, expect } from 'vitest';
import {
  parseIntegerAnswer,
  parseClockAnswer,
  parseDateAnswer,
  areAnswersEqual,
  formatExpectedAnswer
} from '../src/engine/normalizeAnswer.ts';

describe('Answer Parsing & Normalization', () => {
  describe('parseIntegerAnswer', () => {
    it('accepts raw digits', () => {
      expect(parseIntegerAnswer('0')).toEqual({ valid: true, value: 0 });
      expect(parseIntegerAnswer('7')).toEqual({ valid: true, value: 7 });
      expect(parseIntegerAnswer('42')).toEqual({ valid: true, value: 42 });
      expect(parseIntegerAnswer('1000000')).toEqual({ valid: true, value: 1000000 });
    });

    it('accepts Vietnamese thousands dot grouping', () => {
      expect(parseIntegerAnswer('1.000')).toEqual({ valid: true, value: 1000 });
      expect(parseIntegerAnswer('25.000')).toEqual({ valid: true, value: 25000 });
      expect(parseIntegerAnswer('1.500.000')).toEqual({ valid: true, value: 1500000 });
    });

    it('accepts Vietnamese thousands space grouping', () => {
      expect(parseIntegerAnswer('1 000')).toEqual({ valid: true, value: 1000 });
      expect(parseIntegerAnswer('25 000')).toEqual({ valid: true, value: 25000 });
      expect(parseIntegerAnswer('1 500 000')).toEqual({ valid: true, value: 1500000 });
    });

    it('rejects decimals, negatives, algebra and empty strings', () => {
      expect(parseIntegerAnswer('').valid).toBe(false);
      expect(parseIntegerAnswer('   ').valid).toBe(false);
      expect(parseIntegerAnswer('-5').valid).toBe(false);
      expect(parseIntegerAnswer('12,5').valid).toBe(false);
      expect(parseIntegerAnswer('12.50').valid).toBe(false);
      expect(parseIntegerAnswer('2e3').valid).toBe(false);
      expect(parseIntegerAnswer('2+3').valid).toBe(false);
      expect(parseIntegerAnswer('abc').valid).toBe(false);
      expect(parseIntegerAnswer('05').valid).toBe(false); // leading zero rejected
    });
  });

  describe('parseClockAnswer', () => {
    it('validates 24-hour clock input', () => {
      expect(parseClockAnswer('0', '0')).toEqual({ valid: true, value: { hour: 0, minute: 0 } });
      expect(parseClockAnswer('7', '25')).toEqual({ valid: true, value: { hour: 7, minute: 25 } });
      expect(parseClockAnswer('23', '59')).toEqual({ valid: true, value: { hour: 23, minute: 59 } });

      expect(parseClockAnswer('24', '0').valid).toBe(false);
      expect(parseClockAnswer('12', '60').valid).toBe(false);
      expect(parseClockAnswer('-1', '10').valid).toBe(false);
      expect(parseClockAnswer('', '10').valid).toBe(false);
    });
  });

  describe('parseDateAnswer', () => {
    it('validates calendar date input', () => {
      expect(parseDateAnswer('1', '1', '2026')).toEqual({
        valid: true,
        value: { day: 1, month: 1, year: 2026 }
      });
      expect(parseDateAnswer('29', '2', '2024')).toEqual({
        valid: true,
        value: { day: 29, month: 2, year: 2024 }
      });

      // Invalid dates
      expect(parseDateAnswer('29', '2', '2025').valid).toBe(false);
      expect(parseDateAnswer('31', '4', '2026').valid).toBe(false);
      expect(parseDateAnswer('32', '1', '2026').valid).toBe(false);
      expect(parseDateAnswer('0', '1', '2026').valid).toBe(false);
    });
  });

  describe('areAnswersEqual and formatExpectedAnswer', () => {
    it('compares integers correctly', () => {
      expect(areAnswersEqual('integer', 25, 25)).toBe(true);
      expect(areAnswersEqual('integer', 25, 26)).toBe(false);
    });

    it('compares clocks correctly', () => {
      expect(areAnswersEqual('clock', { hour: 7, minute: 25 }, { hour: 7, minute: 25 })).toBe(true);
      expect(areAnswersEqual('clock', { hour: 7, minute: 25 }, { hour: 7, minute: 26 })).toBe(false);
    });

    it('formats expected answers nicely', () => {
      expect(formatExpectedAnswer('integer', 25000, 'đồng')).toBe('25.000 đồng');
      expect(formatExpectedAnswer('clock', { hour: 7, minute: 5 })).toBe('07:05');
      expect(formatExpectedAnswer('date', { day: 1, month: 5, year: 2026 })).toBe('01/05/2026');
      expect(formatExpectedAnswer('weekday', 6)).toBe('Thứ Sáu');
    });
  });
});
