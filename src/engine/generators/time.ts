import { AnswerType, ClockAnswer, Question } from '../types.ts';
import { createPRNG } from '../random.ts';
import { TIME_TEMPLATES } from '../../content/lifeTemplates.ts';

export function generateTimeQuestion(familyId: string, level: number, seed: number): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer: any = 0;
  let answerType: AnswerType = 'integer';
  let unit = 'phút';
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['time'];

  let normalLimitMs = 40000;
  let hardLimitMs = 15000;

  switch (familyId) {
    case 'T01': {
      // Whole hours <-> minutes (exact division!) (Level 1)
      const toMinutes = prng.nextInt(0, 1) === 1;
      if (toMinutes) {
        const h = prng.nextInt(2, 8);
        const tpl = prng.pick(TIME_TEMPLATES.T01.hoursToMinutes);
        prompt = tpl(h);
        answer = h * 60;
        unit = 'phút';
        hint = `1 giờ = 60 phút. Lấy ${h} × 60.`;
        explanation = `${h} giờ = ${h} × 60 phút = ${h * 60} phút`;
        semanticKey = `time_h_to_m:${h}`;
      } else {
        const h = prng.nextInt(2, 6);
        const m = h * 60;
        const tpl = prng.pick(TIME_TEMPLATES.T01.minutesToHours);
        prompt = tpl(m);
        answer = h;
        unit = 'giờ';
        hint = `1 giờ = 60 phút. Lấy ${m} ÷ 60.`;
        explanation = `${m} phút = ${m} ÷ 60 = ${h} giờ`;
        semanticKey = `time_m_to_h:${m}`;
      }
      params = { toMinutes, answer };
      memoryKey = `skill:time_convert_h_m`;
      break;
    }

    case 'T02': {
      // Minutes <-> seconds (exact division!) (Level 2)
      const toSeconds = prng.nextInt(0, 1) === 1;
      if (toSeconds) {
        const m = prng.nextInt(2, 8);
        const tpl = prng.pick(TIME_TEMPLATES.T02.minutesToSeconds);
        prompt = tpl(m);
        answer = m * 60;
        unit = 'giây';
        hint = `1 phút = 60 giây. Lấy ${m} × 60.`;
        explanation = `${m} phút = ${m} × 60 giây = ${m * 60} giây`;
        semanticKey = `time_m_to_s:${m}`;
      } else {
        const m = prng.nextInt(2, 6);
        const s = m * 60;
        const tpl = prng.pick(TIME_TEMPLATES.T02.secondsToMinutes);
        prompt = tpl(s);
        answer = m;
        unit = 'phút';
        hint = `1 phút = 60 giây. Lấy ${s} ÷ 60.`;
        explanation = `${s} giây = ${s} ÷ 60 = ${m} phút`;
        semanticKey = `time_s_to_m:${s}`;
      }
      params = { toSeconds, answer };
      memoryKey = `skill:time_convert_m_s`;
      break;
    }

    case 'T03': {
      // Minute interval in same hour (Level 1)
      const h = prng.nextInt(7, 20);
      const m1 = prng.nextInt(0, 35);
      const diff = prng.nextInt(5, 24);
      const m2 = m1 + diff;
      params = { h, m1, m2, diff };
      const tpl = prng.pick(TIME_TEMPLATES.T03);
      prompt = tpl(h, m1, m2);
      answer = diff;
      unit = 'phút';
      hint = `Vì cùng trong giờ ${h}, lấy số phút sau trừ số phút trước: ${m2} − ${m1}.`;
      explanation = `${m2} phút − ${m1} phút = ${diff} phút`;
      semanticKey = `time_same_hour:${h}:${m1}-${m2}`;
      memoryKey = `skill:time_same_hour`;
      break;
    }

    case 'T04': {
      // Minute interval crossing hour boundary in same day (Level 2)
      // e.g. 9:45 -> 10:20 = 35 min
      const h1 = prng.nextInt(7, 18);
      const m1 = prng.nextInt(35, 55);
      const diff = prng.nextInt(20, 50);
      const totalMin = h1 * 60 + m1 + diff;
      const h2 = Math.floor(totalMin / 60);
      const m2 = totalMin % 60;
      const t1 = `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')}`;
      const t2 = `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`;
      params = { h1, m1, h2, m2, diff };
      const tpl = prng.pick(TIME_TEMPLATES.T04);
      prompt = tpl(t1, t2);
      answer = diff;
      unit = 'phút';
      const toNextHour = 60 - m1;
      hint = `Đếm từ ${t1} đến ${String(h1 + 1).padStart(2, '0')}:00 là ${toNextHour} phút, rồi cộng thêm ${m2} phút.`;
      explanation = `Từ ${t1} lên ${String(h1 + 1).padStart(2, '0')}:00 mất ${toNextHour} phút; thêm ${m2} phút để đến ${t2} ➔ ${toNextHour} + ${m2} = ${diff} phút`;
      semanticKey = `time_cross_hour:${t1}->${t2}`;
      memoryKey = `skill:time_cross_hour`;
      break;
    }

    case 'T05': {
      // Add/subtract minutes to find start/end time (Level 3)
      answerType = 'clock';
      const isAdd = prng.nextInt(0, 1) === 1;
      const startH = prng.nextInt(8, 17);
      const startM = prng.nextInt(0, 50);
      const duration = prng.nextInt(15, 55);
      let resTotalMin = 0;
      if (isAdd) {
        resTotalMin = startH * 60 + startM + duration;
        const startStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
        const tpl = prng.pick(TIME_TEMPLATES.T05);
        prompt = tpl(startStr, duration);
      } else {
        // e.g. 8:00 - 35 min = 07:25
        resTotalMin = startH * 60 + startM - duration;
        const targetStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
        prompt = `Thời điểm ${targetStr} lùi lại ${duration} phút là mấy giờ (HH:mm)?`;
      }
      const endH = Math.floor(resTotalMin / 60) % 24;
      const endM = resTotalMin % 60;
      answer = { hour: endH, minute: endM } as ClockAnswer;
      const ansStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      hint = `Cộng/trừ số phút và chú ý quy đổi 60 phút = 1 giờ.`;
      explanation = `Kết quả là ${ansStr}`;
      params = { startH, startM, duration, isAdd, answer };
      semanticKey = `time_calc_clock:${startH}:${startM}_${isAdd ? '+' : '-'}${duration}`;
      memoryKey = `skill:time_add_sub_minutes`;
      break;
    }

    case 'T06': {
      // Crossing midnight (Level 4)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      // Start between 22:30 and 23:55, duration 20..75 min
      const startH = prng.pick([22, 23]);
      const startM = prng.nextInt(startH === 22 ? 45 : 15, 55);
      const duration = prng.nextInt(20, 75);
      const totalMinutes = startH * 60 + startM + duration;
      const endMinutesOfDay = totalMinutes % (24 * 60);
      const endH = Math.floor(endMinutesOfDay / 60);
      const endM = endMinutesOfDay % 60;
      const startStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
      const tpl = prng.pick(TIME_TEMPLATES.T06);
      prompt = tpl(startStr, duration);
      answerType = 'clock';
      answer = { hour: endH, minute: endM } as ClockAnswer;
      const ansStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      const toMidnight = 24 * 60 - (startH * 60 + startM);
      const pastMidnight = duration - toMidnight;
      hint = `Đếm tới 24:00 (nửa đêm) hết ${toMidnight} phút, sau đó cộng thêm ${pastMidnight} phút sang ngày mới.`;
      explanation = `Từ ${startStr} đến 24:00 là ${toMidnight} phút; còn lại ${pastMidnight} phút sang ngày hôm sau ➔ ${ansStr} ngày hôm sau`;
      params = { startH, startM, duration, answer };
      semanticKey = `time_midnight:${startStr}+${duration}`;
      memoryKey = `skill:time_midnight`;
      break;
    }

    case 'T07': {
      // Multiple rounds with explicit breaks (Level 4)
      const rounds = prng.nextInt(3, 5);
      const roundMin = prng.pick([15, 20, 25, 30]);
      const breakCount = rounds - 1; // explicit breaks between rounds!
      const breakMin = prng.pick([5, 10]);
      const total = rounds * roundMin + breakCount * breakMin;
      params = { rounds, roundMin, breakCount, breakMin, total };
      const tpl = prng.pick(TIME_TEMPLATES.T07);
      prompt = tpl(rounds, roundMin, breakCount, breakMin);
      answer = total;
      unit = 'phút';
      hint = `Tính thời gian chơi (${rounds} × ${roundMin}) cộng với thời gian nghỉ (${breakCount} × ${breakMin}).`;
      explanation = `(${rounds} × ${roundMin}) + (${breakCount} × ${breakMin}) = ${rounds * roundMin} + ${breakCount * breakMin} = ${total} phút`;
      semanticKey = `time_rounds:${rounds}x${roundMin}+${breakCount}x${breakMin}`;
      memoryKey = `skill:time_rounds_and_breaks`;
      break;
    }

    case 'T08': {
      // Departure time from target time, travel duration and early buffer (Level 5)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      answerType = 'clock';
      const targetH = prng.nextInt(7, 10);
      const targetM = prng.pick([0, 15, 30, 45]);
      const travelMin = prng.pick([15, 20, 25, 30, 35, 40]);
      const bufferMin = prng.pick([5, 10, 15]);
      const totalBackMin = travelMin + bufferMin;
      const targetTotal = targetH * 60 + targetM;
      const departTotal = targetTotal - totalBackMin;
      const depH = Math.floor(departTotal / 60);
      const depM = departTotal % 60;
      answer = { hour: depH, minute: depM } as ClockAnswer;
      const targetStr = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`;
      const depStr = `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;
      const tpl = prng.pick(TIME_TEMPLATES.T08);
      prompt = tpl(targetStr, travelMin, bufferMin);
      hint = `Tính tổng thời gian cần trừ lùi: ${travelMin} + ${bufferMin} = ${totalBackMin} phút trước ${targetStr}.`;
      explanation = `Cần trừ đi: ${travelMin} + ${bufferMin} = ${totalBackMin} phút. Lấy ${targetStr} lùi ${totalBackMin} phút ➔ khởi hành lúc ${depStr}`;
      params = { targetH, targetM, travelMin, bufferMin, totalBackMin, answer };
      semanticKey = `time_departure:${targetStr}-${travelMin}-${bufferMin}`;
      memoryKey = `skill:time_departure`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'time',
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
