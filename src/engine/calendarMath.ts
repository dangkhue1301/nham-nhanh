import { DateAnswer, WeekdayAnswer } from './types.ts';

export function isLeapYear(year: number): boolean {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

export function getDaysInMonth(month: number, year: number): number {
  switch (month) {
    case 1: return 31;
    case 2: return isLeapYear(year) ? 29 : 28;
    case 3: return 31;
    case 4: return 30;
    case 5: return 31;
    case 6: return 30;
    case 7: return 31;
    case 8: return 31;
    case 9: return 30;
    case 10: return 31;
    case 11: return 30;
    case 12: return 31;
    default: return 0;
  }
}

export function isValidDate(day: number, month: number, year: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return false;
  }
  if (year < 1900 || year > 2150) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInMonth(month, year);
  return day >= 1 && day <= maxDays;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function dateToEpochDays(day: number, month: number, year: number): number {
  if (!isValidDate(day, month, year)) {
    throw new Error(`Invalid date: ${day}/${month}/${year}`);
  }
  // Use UTC to avoid timezone/DST shifts
  return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

export function epochDaysToDate(epochDays: number): DateAnswer {
  const d = new Date(epochDays * MS_PER_DAY);
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth() + 1,
    year: d.getUTCFullYear()
  };
}

export function addDaysToDate(date: DateAnswer, days: number): DateAnswer {
  const epoch = dateToEpochDays(date.day, date.month, date.year);
  return epochDaysToDate(epoch + days);
}

export function daysBetween(dateA: DateAnswer, dateB: DateAnswer): number {
  const epochA = dateToEpochDays(dateA.day, dateA.month, dateA.year);
  const epochB = dateToEpochDays(dateB.day, dateB.month, dateB.year);
  return epochB - epochA;
}

export function formatDateVN(date: DateAnswer): string {
  const dd = String(date.day).padStart(2, '0');
  const mm = String(date.month).padStart(2, '0');
  const yyyy = String(date.year);
  return `${dd}/${mm}/${yyyy}`;
}

export const WEEKDAY_NAMES: Record<WeekdayAnswer, string> = {
  2: 'thứ Hai',
  3: 'thứ Ba',
  4: 'thứ Tư',
  5: 'thứ Năm',
  6: 'thứ Sáu',
  7: 'thứ Bảy',
  8: 'Chủ Nhật'
};

export const WEEKDAY_TITLES: Record<WeekdayAnswer, string> = {
  2: 'Thứ Hai',
  3: 'Thứ Ba',
  4: 'Thứ Tư',
  5: 'Thứ Năm',
  6: 'Thứ Sáu',
  7: 'Thứ Bảy',
  8: 'Chủ Nhật'
};

export function shiftWeekday(startWeekday: WeekdayAnswer, daysOffset: number): WeekdayAnswer {
  // startWeekday: 2..8 -> 0..6
  const base = startWeekday - 2;
  const shifted = ((base + daysOffset) % 7 + 7) % 7;
  return (shifted + 2) as WeekdayAnswer;
}
