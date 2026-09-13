import { Question } from '../types.ts';
import { createPRNG } from '../random.ts';
import { formatInteger } from '../arithmetic.ts';
import { strategyCompensateSub, strategyCountUp } from '../../content/mentalStrategies.ts';

export function generateSubtractionQuestion(familyId: string, level: number, seed: number): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer = 0;
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['subtraction'];

  let normalLimitMs = 15000;
  let hardLimitMs = 6000;

  switch (familyId) {
    case 'S01': {
      // 0 <= b <= a <= 9 (Level 1)
      normalLimitMs = 10000;
      hardLimitMs = 4000;
      skillTags.push('under_10');
      const a = prng.nextInt(0, 9);
      const b = prng.nextInt(0, a);
      params = { a, b };
      prompt = `${a} − ${b} = ?`;
      answer = a - b;
      hint = `Bắt đầu từ ${a}, đếm lùi ${b} đơn vị.`;
      explanation = `${a} − ${b} = ${answer}`;
      semanticKey = `sub:${a}-${b}`;
      memoryKey = `fact:sub:${a}-${b}`;
      break;
    }

    case 'S02': {
      // a - □ = c
      let maxA = 9;
      if (level === 1) {
        normalLimitMs = 10000;
        hardLimitMs = 4000;
        maxA = 9;
      } else if (level === 2) {
        normalLimitMs = 15000;
        hardLimitMs = 6000;
        maxA = 20;
      } else {
        normalLimitMs = 15000;
        hardLimitMs = 6000;
        maxA = 100;
      }
      const a = prng.nextInt(1, maxA);
      const c = prng.nextInt(0, a);
      const missing = a - c;
      params = { a, c, missing };
      prompt = `${formatInteger(a)} − □ = ${formatInteger(c)}`;
      answer = missing;
      hint = `Tìm số trừ bằng cách lấy ${formatInteger(a)} − ${formatInteger(c)}.`;
      explanation = `□ = ${formatInteger(a)} − ${formatInteger(c)} = ${formatInteger(missing)}`;
      semanticKey = `missing_sub:${a}-_=${c}`;
      memoryKey = `skill:missing_sub:L${level}`;
      break;
    }

    case 'S03': {
      // Crossing 10, a in [10..20], b in [2..9] such that a - b in [1..9] (Level 2)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('cross_10');
      const b = prng.nextInt(2, 9);
      const res = prng.nextInt(1, 9);
      const a = res + b;
      // ensure a in [10, 18]
      params = { a, b };
      prompt = `${a} − ${b} = ?`;
      answer = a - b;
      hint = `Trừ ${a - 10} để về 10, rồi trừ tiếp phần còn lại của ${b}.`;
      explanation = `${a} − ${b} = (${a} − ${a - 10}) − (${b - (a - 10)}) = 10 − ${b - (a - 10)} = ${answer}`;
      semanticKey = `sub_cross10:${a}-${b}`;
      memoryKey = `fact:sub:${a}-${b}`;
      break;
    }

    case 'S04': {
      // Within 100, no borrow (Level 3)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('within_100', 'no_borrow');
      const uA = prng.nextInt(0, 9);
      const uB = prng.nextInt(0, uA);
      const tA = prng.nextInt(2, 9);
      const tB = prng.nextInt(1, tA);
      const a = tA * 10 + uA;
      const b = tB * 10 + uB;
      params = { a, b };
      prompt = `${a} − ${b} = ?`;
      answer = a - b;
      hint = `Trừ hàng chục trước: ${tA * 10} − ${tB * 10}, rồi trừ hàng đơn vị: ${uA} − ${uB}.`;
      explanation = `${a} − ${b} = (${tA * 10} − ${tB * 10}) + (${uA} − ${uB}) = ${(tA - tB) * 10} + ${uA - uB} = ${answer}`;
      semanticKey = `sub_no_borrow:${a}-${b}`;
      memoryKey = `skill:sub_within_100_no_borrow`;
      break;
    }

    case 'S05': {
      // Within 100, with borrow (Level 3)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('within_100', 'borrow');
      const uA = prng.nextInt(0, 8);
      const uB = prng.nextInt(uA + 1, 9); // units borrow
      const tA = prng.nextInt(2, 9);
      const tB = prng.nextInt(1, tA - 1); // ensure a > b
      const a = tA * 10 + uA;
      const b = tB * 10 + uB;
      params = { a, b };
      prompt = `${a} − ${b} = ?`;
      answer = a - b;
      hint = `Trừ số tròn chục gần nhất rồi cộng bù đơn vị, hoặc trừ từng bước.`;
      explanation = strategyCompensateSub(a, b, (tB + 1) * 10);
      semanticKey = `sub_borrow:${a}-${b}`;
      memoryKey = `skill:sub_within_100_borrow`;
      break;
    }

    case 'S06': {
      // Within 1,000, borrowing through 0 tens (Level 4)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('within_1000', 'borrow_through_zero');
      // e.g. 402 - 178 = 224 or 503 - 247
      const hA = prng.nextInt(2, 8);
      const uA = prng.nextInt(1, 6);
      const a = hA * 100 + uA; // middle digit is 0
      const b = prng.nextInt(101, a - 10);
      params = { a, b };
      prompt = `${formatInteger(a)} − ${formatInteger(b)} = ?`;
      answer = a - b;
      hint = `Lấy 1 từ hàng trăm đổi thành 9 chục và 10 đơn vị để trừ.`;
      explanation = `${formatInteger(a)} − ${formatInteger(b)} = ${formatInteger(a - b)}`;
      semanticKey = `sub_through_zero:${a}-${b}`;
      memoryKey = `skill:sub_through_zero`;
      break;
    }

    case 'S07': {
      // Subtract from round mark: 100, 1.000, 10.000, 100.000 (Level 5)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('subtract_from_round_base');
      const base = prng.pick([100, 1000, 10000, 100000]);
      const b = prng.nextInt(Math.floor(base * 0.1), Math.floor(base * 0.95));
      params = { base, b };
      prompt = `${formatInteger(base)} − ${formatInteger(b)} = ?`;
      answer = base - b;
      hint = `Quy tắc trừ số tròn: các chữ số cộng lại thành 9, chữ số cuối cùng cộng lại thành 10.`;
      explanation = strategyCountUp(base, b);
      semanticKey = `sub_round:${base}-${b}`;
      memoryKey = `skill:sub_round_base`;
      break;
    }

    case 'S08': {
      // Close numbers or subtrahend near round mark (Level 5)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('count_up_or_compensate');
      const isClose = prng.nextInt(0, 1) === 1;
      let a = 0;
      let b = 0;
      if (isClose) {
        // e.g. 5000 - 4875 or 732 - 718
        a = prng.nextInt(500, 5000);
        b = a - prng.nextInt(5, 45);
      } else {
        // subtrahend ends in 8 or 9 (near round)
        const roundBase = prng.nextInt(10, 100) * 10;
        b = roundBase - prng.pick([1, 2]);
        a = b + prng.nextInt(50, 500);
      }
      params = { a, b };
      prompt = `${formatInteger(a)} − ${formatInteger(b)} = ?`;
      answer = a - b;
      hint = isClose ? `Hai số rất gần nhau: đếm thêm từ ${formatInteger(b)} lên ${formatInteger(a)}.` : `Làm tròn số trừ rồi bù lại.`;
      explanation = `${formatInteger(a)} − ${formatInteger(b)} = ${formatInteger(a - b)}`;
      semanticKey = `sub_compensate:${a}-${b}`;
      memoryKey = `skill:sub_compensate`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'subtraction',
    level,
    skillTags,
    parameters: params,
    prompt,
    answerType: 'integer',
    answer,
    hint,
    explanation,
    semanticKey,
    memoryKey,
    normalLimitMs,
    hardLimitMs,
    timingProfileVersion: 1
  };
}
