import { describe, it, expect } from 'vitest';
import {
  isLeapYear,
  getDaysInMonth,
  dateToEpochDays,
  epochDaysToDate,
  shiftWeekday
} from '../src/engine/calendarMath.ts';

describe('Gregorian Calendar Math Engine', () => {
  it('correctly calculates leap years across centuries', () => {
    // Divisible by 400 -> leap
    expect(isLeapYear(1600)).toBe(true);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);

    // Divisible by 100 but not 400 -> not leap
    expect(isLeapYear(1700)).toBe(false);
    expect(isLeapYear(1800)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);

    // Divisible by 4 and not 100 -> leap
    expect(isLeapYear(2020)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);

    // Not divisible by 4 -> not leap
    expect(isLeapYear(2021)).toBe(false);
    expect(isLeapYear(2022)).toBe(false);
    expect(isLeapYear(2023)).toBe(false);
    expect(isLeapYear(2025)).toBe(false);
  });

  it('correctly returns days in each month', () => {
    expect(getDaysInMonth(1, 2024)).toBe(31);
    expect(getDaysInMonth(2, 2024)).toBe(29); // leap
    expect(getDaysInMonth(2, 2025)).toBe(28); // regular
    expect(getDaysInMonth(3, 2024)).toBe(31);
    expect(getDaysInMonth(4, 2024)).toBe(30);
    expect(getDaysInMonth(5, 2024)).toBe(31);
    expect(getDaysInMonth(6, 2024)).toBe(30);
    expect(getDaysInMonth(7, 2024)).toBe(31);
    expect(getDaysInMonth(8, 2024)).toBe(31);
    expect(getDaysInMonth(9, 2024)).toBe(30);
    expect(getDaysInMonth(10, 2024)).toBe(31);
    expect(getDaysInMonth(11, 2024)).toBe(30);
    expect(getDaysInMonth(12, 2024)).toBe(31);
  });

  it('preserves date conversions without timezone distortion', () => {
    const epoch = dateToEpochDays(13, 9, 2026);
    const roundTrip = epochDaysToDate(epoch);
    expect(roundTrip).toEqual({ day: 13, month: 9, year: 2026 });
  });

  it('shifts weekdays with modulo 7', () => {
    // 2 = Monday, +1 -> 3 = Tuesday
    expect(shiftWeekday(2, 1)).toBe(3);
    // 8 = Sunday, +1 -> 2 = Monday
    expect(shiftWeekday(8, 1)).toBe(2);
    // 3 = Tuesday, -2 -> 8 = Sunday (handles negative)
    expect(shiftWeekday(3, -2)).toBe(8);
  });
});
