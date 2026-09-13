import {
  AnswerType,
  ClockAnswer,
  DateAnswer,
  RawAnswerValue,
  WeekdayAnswer
} from './types.ts';
import { isValidDate } from './calendarMath.ts';

export interface ParseResult {
  valid: boolean;
  value?: RawAnswerValue;
  error?: string;
}

/**
 * Normalizes and validates an integer string input according to Vietnamese conventions.
 * Allowed: '25000', '25.000', '25 000', '0'
 * Disallowed: '12,5', '12.50', '2e3', negative numbers, empty strings, non-digits.
 */
export function parseIntegerAnswer(input: string): ParseResult {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { valid: false, error: 'Vui lòng nhập đáp án' };
  }

  // Reject exponential, algebraic, decimals, negatives
  if (/[eE+\-*/]/.test(trimmed) || trimmed.startsWith('-')) {
    return { valid: false, error: 'Đáp án phải là số nguyên không âm hợp lệ' };
  }
  if (trimmed.includes(',')) {
    return { valid: false, error: 'Không nhập số thập phân hoặc dấu phẩy' };
  }

  // Check if it is a single valid integer without grouping
  if (/^\d+$/.test(trimmed)) {
    // Check leading zeroes (allowed only if string is exactly "0")
    if (trimmed.length > 1 && trimmed.startsWith('0')) {
      return { valid: false, error: 'Số không được bắt đầu bằng chữ số 0 thừa' };
    }
    const num = Number(trimmed);
    if (!Number.isSafeInteger(num)) {
      return { valid: false, error: 'Số vượt quá giới hạn tính toán' };
    }
    return { valid: true, value: num };
  }

  // Check thousands grouping with dots: e.g. 1.000, 25.000, 1.000.000
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    const raw = trimmed.replace(/\./g, '');
    const num = Number(raw);
    if (!Number.isSafeInteger(num)) {
      return { valid: false, error: 'Số vượt quá giới hạn tính toán' };
    }
    return { valid: true, value: num };
  }

  // Check thousands grouping with spaces: e.g. 1 000, 25 000, 1 000 000
  if (/^\d{1,3}(\s\d{3})+$/.test(trimmed)) {
    const raw = trimmed.replace(/\s+/g, '');
    const num = Number(raw);
    if (!Number.isSafeInteger(num)) {
      return { valid: false, error: 'Số vượt quá giới hạn tính toán' };
    }
    return { valid: true, value: num };
  }

  // If contains dots not matching thousands groups, like 12.50
  if (trimmed.includes('.')) {
    return { valid: false, error: 'Định dạng số không hợp lệ (kiểm tra dấu chấm phân nhóm nghìn)' };
  }

  return { valid: false, error: 'Vui lòng chỉ nhập các chữ số' };
}

export function parseClockAnswer(hourStr: string, minStr: string): ParseResult {
  const hTrim = hourStr.trim();
  const mTrim = minStr.trim();

  if (hTrim === '' || mTrim === '') {
    return { valid: false, error: 'Vui lòng nhập đủ cả giờ và phút' };
  }

  if (!/^\d{1,2}$/.test(hTrim) || !/^\d{1,2}$/.test(mTrim)) {
    return { valid: false, error: 'Giờ và phút chỉ chứa chữ số' };
  }

  const hour = Number(hTrim);
  const minute = Number(mTrim);

  if (hour < 0 || hour > 23) {
    return { valid: false, error: 'Giờ phải từ 0 đến 23' };
  }
  if (minute < 0 || minute > 59) {
    return { valid: false, error: 'Phút phải từ 0 đến 59' };
  }

  return {
    valid: true,
    value: { hour, minute } as ClockAnswer
  };
}

export function parseDateAnswer(dayStr: string, monthStr: string, yearStr: string): ParseResult {
  const dTrim = dayStr.trim();
  const mTrim = monthStr.trim();
  const yTrim = yearStr.trim();

  if (dTrim === '' || mTrim === '' || yTrim === '') {
    return { valid: false, error: 'Vui lòng nhập đủ ngày, tháng, năm' };
  }

  if (!/^\d{1,2}$/.test(dTrim) || !/^\d{1,2}$/.test(mTrim) || !/^\d{4}$/.test(yTrim)) {
    return { valid: false, error: 'Ngày/tháng từ 1-2 chữ số, năm gồm 4 chữ số' };
  }

  const day = Number(dTrim);
  const month = Number(mTrim);
  const year = Number(yTrim);

  if (!isValidDate(day, month, year)) {
    return { valid: false, error: 'Ngày tháng năm không có thật trên lịch' };
  }

  return {
    valid: true,
    value: { day, month, year } as DateAnswer
  };
}

export function areAnswersEqual(
  type: AnswerType,
  submitted: RawAnswerValue,
  expected: RawAnswerValue
): boolean {
  if (type === 'integer') {
    return Number(submitted) === Number(expected);
  }
  if (type === 'weekday') {
    return Number(submitted) === Number(expected);
  }
  if (type === 'clock') {
    const s = submitted as ClockAnswer;
    const e = expected as ClockAnswer;
    return s.hour === e.hour && s.minute === e.minute;
  }
  if (type === 'date') {
    const s = submitted as DateAnswer;
    const e = expected as DateAnswer;
    return s.day === e.day && s.month === e.month && s.year === e.year;
  }
  return false;
}

export function formatExpectedAnswer(type: AnswerType, expected: RawAnswerValue, unit?: string): string {
  if (type === 'integer') {
    const val = (expected as number).toLocaleString('vi-VN');
    return unit ? `${val} ${unit}` : val;
  }
  if (type === 'clock') {
    const c = expected as ClockAnswer;
    return `${String(c.hour).padStart(2, '0')}:${String(c.minute).padStart(2, '0')}`;
  }
  if (type === 'date') {
    const d = expected as DateAnswer;
    return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
  }
  if (type === 'weekday') {
    const w = expected as WeekdayAnswer;
    const map: Record<number, string> = {
      2: 'Thứ Hai',
      3: 'Thứ Ba',
      4: 'Thứ Tư',
      5: 'Thứ Năm',
      6: 'Thứ Sáu',
      7: 'Thứ Bảy',
      8: 'Chủ Nhật'
    };
    return map[w] || String(w);
  }
  return String(expected);
}
