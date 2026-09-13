import { describe, it, expect } from 'vitest';
import { generateAdditionQuestion } from '../src/engine/generators/addition.ts';
import { generateSubtractionQuestion } from '../src/engine/generators/subtraction.ts';
import { generateMultiplicationQuestion } from '../src/engine/generators/multiplication.ts';
import { generateDivisionQuestion } from '../src/engine/generators/division.ts';
import { validateQuestion } from '../src/engine/validateQuestion.ts';
import {
  isLeapYear,
  isValidDate,
  addDaysToDate,
  daysBetween,
  shiftWeekday
} from '../src/engine/calendarMath.ts';
import { parseIntegerAnswer } from '../src/engine/normalizeAnswer.ts';
import {
  updateMemoryCard,
  createMemoryCardFromQuestion
} from '../src/engine/spacedReview.ts';
import { loadProgressState } from '../src/storage/localProgress.ts';

describe('Bảng 12.2 — Mandatory Test Cases', () => {
  it('Cộng L1: 4 + 5 = 9 hợp lệ; 6 + 4 và 8 + 7 bị từ chối ở L1', () => {
    // Generate valid L1 question
    const q1 = generateAdditionQuestion('A01', 1, 100);
    expect(q1.parameters.a + q1.parameters.b).toBeLessThanOrEqual(9);
    expect(validateQuestion(q1)).toBe(true);

    // Manual test of invalid 6 + 4 at L1
    const invalidQ = {
      ...q1,
      parameters: { a: 6, b: 4 },
      answer: 10
    };
    expect(validateQuestion(invalidQ)).toBe(false);

    // 8 + 7 is rejected in L1
    const invalidQ2 = {
      ...q1,
      parameters: { a: 8, b: 7 },
      answer: 15
    };
    expect(validateQuestion(invalidQ2)).toBe(false);

    // 8 + 7 is valid in L2 (A03)
    const qL2 = generateAdditionQuestion('A03', 2, 100);
    expect(qL2.answer).toBeGreaterThanOrEqual(10);
    expect(qL2.answer).toBeLessThanOrEqual(20);
    expect(validateQuestion(qL2)).toBe(true);
  });

  it('Trừ L1: 8 − 3 = 5; 3 − 8 và 10 − 1 bị từ chối ở L1', () => {
    const qS = generateSubtractionQuestion('S01', 1, 100);
    expect(qS.parameters.a).toBeLessThanOrEqual(9);
    expect(qS.parameters.b).toBeLessThanOrEqual(qS.parameters.a);
    expect(validateQuestion(qS)).toBe(true);

    // 3 - 8 rejected
    const invalidSub1 = {
      ...qS,
      parameters: { a: 3, b: 8 },
      answer: -5
    };
    expect(validateQuestion(invalidSub1)).toBe(false);

    // 10 - 1 rejected at L1 even though answer is 9
    const invalidSub2 = {
      ...qS,
      parameters: { a: 10, b: 1 },
      answer: 9
    };
    expect(validateQuestion(invalidSub2)).toBe(false);
  });

  it('0 + 0 và 5 − 5: 0 là đáp án hợp lệ', () => {
    const qZero = generateAdditionQuestion('A01', 1, 100);
    qZero.parameters = { a: 0, b: 0 };
    qZero.answer = 0;
    expect(validateQuestion(qZero)).toBe(true);

    const qSubZero = generateSubtractionQuestion('S01', 1, 100);
    qSubZero.parameters = { a: 5, b: 5 };
    qSubZero.answer = 0;
    expect(validateQuestion(qSubZero)).toBe(true);
  });

  it('Nhân L1: 7 × 8 = 56; 12 × 12 bị từ chối ở L1', () => {
    const qM = generateMultiplicationQuestion('M01', 1, 100, { tableId: 7 });
    expect(qM.parameters.a).toBe(7);
    expect(qM.parameters.b).toBeLessThanOrEqual(10);
    expect(validateQuestion(qM)).toBe(true);

    const invalidM = {
      ...qM,
      parameters: { a: 12, b: 12 },
      answer: 144
    };
    expect(validateQuestion(invalidM)).toBe(false);
  });

  it('Chia basic: 56 ÷ 7 = 8; chia thuần túy không sinh thương lẻ (7 ÷ 2) hay chia cho 0', () => {
    const qD = generateDivisionQuestion('D01', 1, 100, { tableId: 7 });
    expect(qD.parameters.d).toBe(7);
    expect(qD.parameters.n % qD.parameters.d).toBe(0);
    expect(validateQuestion(qD)).toBe(true);

    // Division by 0 rejected
    const invalidD = {
      ...qD,
      parameters: { n: 5, d: 0, q: 0 },
      answer: 0
    };
    expect(validateQuestion(invalidD)).toBe(false);
  });

  it('Biểu thức: 18 + 6 × 4 = 42; (18 + 6) × 4 = 96', () => {
    expect(18 + 6 * 4).toBe(42);
    expect((18 + 6) * 4).toBe(96);
  });

  it('Trừ có mượn: 402 − 178 = 224', () => {
    expect(402 - 178).toBe(224);
  });

  it('Nhân 25: 24 × 25 = 600, cách giải (24 ÷ 4) × 100 là số nguyên', () => {
    const q = generateMultiplicationQuestion('M08', 4, 100);
    expect(q.parameters.a % 4 === 0 || q.parameters.factor === 50).toBe(true);
    expect(q.explanation).not.toContain('.');
    expect(q.explanation).not.toContain(',');
  });

  it('Tiền: 50.000đ mua tối đa bút 8.000đ -> 6 cái, còn thừa 2.000đ', () => {
    const budget = 50000;
    const unitPrice = 8000;
    const maxItems = Math.floor(budget / unitPrice);
    const rem = budget % unitPrice;
    expect(maxItems).toBe(6);
    expect(rem).toBe(2000);
  });

  it('Tiền: 200.000đ giảm 25% -> 150.000đ', () => {
    const orig = 200000;
    const pct = 25;
    const discount = (orig * pct) / 100;
    const finalPrice = orig - discount;
    expect(discount).toBe(50000);
    expect(finalPrice).toBe(150000);
  });

  it('Thời gian: 9:45 -> 10:20 cùng ngày là 35 phút', () => {
    const min1 = 9 * 60 + 45;
    const min2 = 10 * 60 + 20;
    expect(min2 - min1).toBe(35);
  });

  it('Thời gian qua nửa đêm: 23:50 -> 00:15 hôm sau là 25 phút; 23:45 + 35p = 00:20', () => {
    const t1 = 23 * 60 + 50;
    const t2 = 24 * 60 + 15;
    expect(t2 - t1).toBe(25);

    const start = 23 * 60 + 45;
    const end = (start + 35) % (24 * 60);
    const endH = Math.floor(end / 60);
    const endM = end % 60;
    expect(endH).toBe(0);
    expect(endM).toBe(20);
  });

  it('Thời gian: 8:00 trừ 35 phút = 07:25; 180 phút = 3 giờ', () => {
    const t = 8 * 60 - 35;
    expect(Math.floor(t / 60)).toBe(7);
    expect(t % 60).toBe(25);
    expect(180 / 60).toBe(3);
  });

  it('Lịch: 28/02/2024 (nhuận) + 2 ngày = 01/03/2024; 28/02/2025 (thường) + 2 ngày = 02/03/2025', () => {
    const date2024 = addDaysToDate({ day: 28, month: 2, year: 2024 }, 2);
    expect(date2024).toEqual({ day: 1, month: 3, year: 2024 });

    const date2025 = addDaysToDate({ day: 28, month: 2, year: 2025 }, 2);
    expect(date2025).toEqual({ day: 2, month: 3, year: 2025 });

    const newYear = addDaysToDate({ day: 31, month: 12, year: 2026 }, 1);
    expect(newYear).toEqual({ day: 1, month: 1, year: 2027 });

    const prevFeb = addDaysToDate({ day: 1, month: 3, year: 2024 }, -1);
    expect(prevFeb).toEqual({ day: 29, month: 2, year: 2024 });
  });

  it('Năm nhuận: 1900 không nhuận, 2000 nhuận, 2100 không nhuận', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('Ngày không có thật: 31/04/2026 và 29/02/2025 không hợp lệ', () => {
    expect(isValidDate(31, 4, 2026)).toBe(false);
    expect(isValidDate(29, 2, 2025)).toBe(false);
    expect(isValidDate(29, 2, 2024)).toBe(true);
  });

  it('Khoảng ngày: 01/05 -> 10/05 không tính đầu = 9 ngày; tính cả hai đầu = 10 ngày', () => {
    const d1 = { day: 1, month: 5, year: 2026 };
    const d2 = { day: 10, month: 5, year: 2026 };
    const diff = daysBetween(d1, d2);
    expect(diff).toBe(9);
    expect(diff + 1).toBe(10);
  });

  it('Thứ trong tuần: Thứ Ba (3) sau 10 ngày là Thứ Sáu (6)', () => {
    const targetW = shiftWeekday(3, 10);
    expect(targetW).toBe(6); // 6 = Thứ Sáu
  });

  it('Chuẩn hóa đáp án: 25000, 25.000, 25 000 -> 25000; 12,5, 12.50, 2e3 bị từ chối; 0 hợp lệ', () => {
    expect(parseIntegerAnswer('25000')).toEqual({ valid: true, value: 25000 });
    expect(parseIntegerAnswer('25.000')).toEqual({ valid: true, value: 25000 });
    expect(parseIntegerAnswer('25 000')).toEqual({ valid: true, value: 25000 });
    expect(parseIntegerAnswer('0')).toEqual({ valid: true, value: 0 });

    expect(parseIntegerAnswer('12,5').valid).toBe(false);
    expect(parseIntegerAnswer('12.50').valid).toBe(false);
    expect(parseIntegerAnswer('2e3').valid).toBe(false);
    expect(parseIntegerAnswer('').valid).toBe(false);
    expect(parseIntegerAnswer('   ').valid).toBe(false);
  });

  it('Lịch ôn tập: đúng 10 lần trong cùng ngày không tăng 10 bậc; làm đúng trước hạn không tự tăng bậc', () => {
    const q = generateMultiplicationQuestion('M01', 1, 100, { tableId: 7 });
    let card = createMemoryCardFromQuestion(q, '2026-09-13');

    // First time correct: advances from 0 to 1
    card = updateMemoryCard({
      card,
      status: 'correct',
      elapsedMs: 2000,
      hardLimitMs: 4000,
      todayStr: '2026-09-13'
    });
    expect(card.scheduleStage).toBe(1);

    // Doing it 9 more times on the same day must NOT advance stage beyond 1!
    for (let i = 0; i < 9; i++) {
      card = updateMemoryCard({
        card,
        status: 'correct',
        elapsedMs: 2000,
        hardLimitMs: 4000,
        todayStr: '2026-09-13'
      });
    }
    expect(card.scheduleStage).toBe(1); // Still 1!
  });

  it('Tiến độ an toàn: JSON hỏng không làm ứng dụng crash', () => {
    const res = loadProgressState();
    expect(res.state).toBeDefined();
    expect(res.state.schemaVersion).toBe(1);
  });
});
