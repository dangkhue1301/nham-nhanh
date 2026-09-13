import { AnswerType, DateAnswer, Question, WeekdayAnswer } from '../types.ts';
import { createPRNG } from '../random.ts';
import {
  addDaysToDate,
  formatDateVN,
  getDaysInMonth,
  shiftWeekday,
  WEEKDAY_NAMES,
  WEEKDAY_TITLES
} from '../calendarMath.ts';
import { CALENDAR_TEMPLATES } from '../../content/lifeTemplates.ts';

export function generateCalendarQuestion(familyId: string, level: number, seed: number): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer: any = 0;
  let answerType: AnswerType = 'integer';
  let unit: string | undefined = undefined;
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['calendar'];

  let normalLimitMs = 40000;
  let hardLimitMs = 15000;

  switch (familyId) {
    case 'C01': {
      // Weekday before/after 1..6 days (Level 1)
      answerType = 'weekday';
      const startW = prng.pick([2, 3, 4, 5, 6, 7, 8]) as WeekdayAnswer;
      const days = prng.nextInt(1, 6);
      const isAfter = prng.nextInt(0, 1) === 1;
      const targetW = shiftWeekday(startW, isAfter ? days : -days);
      const tpl = prng.pick(CALENDAR_TEMPLATES.C01);
      prompt = tpl(WEEKDAY_TITLES[startW], days, isAfter);
      answer = targetW;
      hint = `Đếm ${isAfter ? 'tiến' : 'lùi'} từng ngày từ ${WEEKDAY_NAMES[startW]}.`;
      explanation = `Từ ${WEEKDAY_NAMES[startW]}, ${isAfter ? 'tiến' : 'lùi'} ${days} ngày là ${WEEKDAY_NAMES[targetW]}.`;
      params = { startW, days, isAfter, targetW };
      semanticKey = `cal_weekday_short:${startW}_${isAfter ? '+' : '-'}${days}`;
      memoryKey = `skill:cal_weekday_short`;
      break;
    }

    case 'C02': {
      // Weekday 7..60 days (modulo 7) (Level 2)
      answerType = 'weekday';
      const startW = prng.pick([2, 3, 4, 5, 6, 7, 8]) as WeekdayAnswer;
      const days = prng.nextInt(7, 60);
      const isAfter = prng.nextInt(0, 1) === 1;
      const rem = days % 7;
      const targetW = shiftWeekday(startW, isAfter ? days : -days);
      const tpl = prng.pick(CALENDAR_TEMPLATES.C02);
      prompt = tpl(WEEKDAY_TITLES[startW], days, isAfter);
      answer = targetW;
      hint = `Một tuần có 7 ngày. Lấy ${days} ÷ 7 = ${Math.floor(days / 7)} tuần, dư ${rem} ngày. Chỉ cần tính cho ${rem} ngày.`;
      explanation = `${days} ngày = ${Math.floor(days / 7)} tuần + ${rem} ngày ➔ thứ giống như ${isAfter ? 'tiến' : 'lùi'} ${rem} ngày từ ${WEEKDAY_NAMES[startW]} ➔ là ${WEEKDAY_NAMES[targetW]}`;
      params = { startW, days, isAfter, rem, targetW };
      semanticKey = `cal_weekday_cycle:${startW}_${isAfter ? '+' : '-'}${days}`;
      memoryKey = `skill:cal_weekday_cycle`;
      break;
    }

    case 'C03': {
      // Add/subtract days in same month (Level 1)
      const year = prng.nextInt(2024, 2028);
      const month = prng.pick([1, 3, 5, 7, 8, 10, 12]); // 31 days
      const isAfter = prng.nextInt(0, 1) === 1;
      let day = 0;
      let offset = 0;
      if (isAfter) {
        day = prng.nextInt(1, 18);
        offset = prng.nextInt(3, 10);
      } else {
        day = prng.nextInt(15, 28);
        offset = prng.nextInt(3, 10);
      }
      const targetDay = isAfter ? day + offset : day - offset;
      const tpl = prng.pick(CALENDAR_TEMPLATES.C03);
      prompt = tpl(day, month, year, offset, isAfter);
      answer = targetDay;
      unit = `tháng ${month}`;
      hint = `Trong cùng tháng ${month}, chỉ cần lấy số ngày ${day} ${isAfter ? '+' : '−'} ${offset}.`;
      explanation = `${day} ${isAfter ? '+' : '−'} ${offset} = ngày ${targetDay} (tháng ${month})`;
      params = { day, month, year, offset, isAfter, targetDay };
      semanticKey = `cal_same_month:${month}_${day}_${isAfter ? '+' : '-'}${offset}`;
      memoryKey = `skill:cal_same_month`;
      break;
    }

    case 'C04': {
      // Days between two dates in same month (not counting start) (Level 2)
      const year = prng.nextInt(2024, 2028);
      const month = prng.nextInt(1, 12);
      const maxDays = getDaysInMonth(month, year);
      const d1 = prng.nextInt(1, maxDays - 15);
      const diff = prng.nextInt(3, 14);
      const d2 = d1 + diff;
      const tpl = prng.pick(CALENDAR_TEMPLATES.C04);
      prompt = tpl(d1, d2, month, year);
      answer = diff;
      unit = 'ngày';
      hint = `Vì cùng tháng và không tính ngày bắt đầu, lấy ngày kết thúc trừ ngày bắt đầu: ${d2} − ${d1}.`;
      explanation = `${d2} − ${d1} = ${diff} ngày`;
      params = { d1, d2, month, year, diff };
      semanticKey = `cal_days_between_same:${month}_${d1}->${d2}`;
      memoryKey = `skill:cal_days_between_same_month`;
      break;
    }

    case 'C05': {
      // Crossing month boundary (Level 3)
      answerType = 'date';
      const year = prng.nextInt(2024, 2028);
      const month = prng.pick([1, 3, 4, 5, 7, 8, 10]); // avoid year end and feb for standard C05
      const daysInM = getDaysInMonth(month, year);
      const d = prng.nextInt(daysInM - 6, daysInM);
      const offset = prng.nextInt(5, 12);
      const startDate: DateAnswer = { day: d, month, year };
      const targetDate = addDaysToDate(startDate, offset);
      const tpl = prng.pick(CALENDAR_TEMPLATES.C05);
      prompt = tpl(formatDateVN(startDate), offset, true);
      answer = targetDate;
      const remainingInMonth = daysInM - d;
      const intoNext = offset - remainingInMonth;
      hint = `Tháng ${month} có ${daysInM} ngày. Từ ngày ${d} đến hết tháng còn ${remainingInMonth} ngày; thêm ${intoNext} ngày sang tháng sau.`;
      explanation = `Hết tháng ${month} còn ${remainingInMonth} ngày; sang tháng ${month + 1} thêm ${intoNext} ngày ➔ ngày ${formatDateVN(targetDate)}`;
      params = { startDate, offset, targetDate };
      semanticKey = `cal_cross_month:${formatDateVN(startDate)}+${offset}`;
      memoryKey = `skill:cal_cross_month`;
      break;
    }

    case 'C06': {
      // Crossing year boundary (Level 4)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      answerType = 'date';
      const year = prng.nextInt(2024, 2028);
      // Dec 28..31
      const day = prng.nextInt(28, 31);
      const offset = prng.nextInt(3, 10);
      const startDate: DateAnswer = { day, month: 12, year };
      const targetDate = addDaysToDate(startDate, offset);
      const tpl = prng.pick(CALENDAR_TEMPLATES.C06);
      prompt = tpl(formatDateVN(startDate), offset, true);
      answer = targetDate;
      const remInYear = 31 - day;
      const intoNewYear = offset - remInYear;
      hint = `Tháng 12 có 31 ngày. Đến hết năm còn ${remInYear} ngày, sau đó bước sang năm ${year + 1}.`;
      explanation = `Hết năm ${year} còn ${remInYear} ngày; sang năm ${year + 1} thêm ${intoNewYear} ngày ➔ ngày ${formatDateVN(targetDate)}`;
      params = { startDate, offset, targetDate };
      semanticKey = `cal_cross_year:${formatDateVN(startDate)}+${offset}`;
      memoryKey = `skill:cal_cross_year`;
      break;
    }

    case 'C07': {
      // February in leap vs non-leap years (Level 4)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      answerType = 'date';
      const isLeap = prng.nextInt(0, 1) === 1;
      const year = isLeap ? 2024 : 2025; // 2024 is leap, 2025 is regular
      const leapNote = isLeap ? `năm ${year} là năm nhuận, tháng 2 có 29 ngày` : `năm ${year} là năm thường, tháng 2 có 28 ngày`;
      const day = 28;
      const offset = prng.pick([1, 2, 3]);
      const startDate: DateAnswer = { day, month: 2, year };
      const targetDate = addDaysToDate(startDate, offset);
      const tpl = prng.pick(CALENDAR_TEMPLATES.C07);
      prompt = tpl(formatDateVN(startDate), offset, leapNote);
      answer = targetDate;
      hint = isLeap ? `Năm ${year} nhuận nên có ngày 29/02 rồi mới sang 01/03.` : `Năm ${year} thường nên sau 28/02 là 01/03 luôn.`;
      explanation = isLeap
        ? `Năm ${year} nhuận có ngày 29/02 ➔ từ 28/02 sau ${offset} ngày là ${formatDateVN(targetDate)}`
        : `Năm ${year} thường, tháng 2 chỉ có 28 ngày ➔ sau ${offset} ngày là ${formatDateVN(targetDate)}`;
      params = { startDate, offset, isLeap, targetDate };
      semanticKey = `cal_feb_leap:${year}_28/02+${offset}`;
      memoryKey = `skill:cal_feb_leap`;
      break;
    }

    case 'C08': {
      // Inclusive interval (both endpoints counted) = difference + 1 (Level 5)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      const year = prng.nextInt(2024, 2028);
      const month = prng.nextInt(1, 12);
      const maxD = getDaysInMonth(month, year);
      const d1 = prng.nextInt(1, maxD - 15);
      const diff = prng.nextInt(5, 14);
      const d2 = d1 + diff;
      const dateA: DateAnswer = { day: d1, month, year };
      const dateB: DateAnswer = { day: d2, month, year };
      const tpl = prng.pick(CALENDAR_TEMPLATES.C08);
      prompt = tpl(formatDateVN(dateA), formatDateVN(dateB));
      answer = diff + 1; // inclusive!
      unit = 'ngày';
      hint = `Tính cả ngày đầu và ngày cuối: số ngày = (ngày cuối − ngày đầu) + 1.`;
      explanation = `Hiệu số ngày: ${d2} − ${d1} = ${diff}. Tính cả hai đầu: ${diff} + 1 = ${diff + 1} ngày`;
      params = { dateA, dateB, diff, answer };
      semanticKey = `cal_inclusive:${formatDateVN(dateA)}->${formatDateVN(dateB)}`;
      memoryKey = `skill:cal_inclusive`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'calendar',
    level,
    skillTags,
    parameters: params,
    prompt,
    answerType,
    answer,
    unit,
    hint,
    explanation,
    semanticKey,
    memoryKey,
    normalLimitMs,
    hardLimitMs,
    timingProfileVersion: 1
  };
}
