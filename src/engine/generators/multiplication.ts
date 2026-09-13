import { Question } from '../types.ts';
import { createPRNG } from '../random.ts';
import { formatInteger } from '../arithmetic.ts';
import {
  strategySplitMultiply,
  strategyMultiply9,
  strategyMultiply99,
  strategyMultiply25,
  strategyMultiply50,
  strategyFactorPairing
} from '../../content/mentalStrategies.ts';

export function generateMultiplicationQuestion(
  familyId: string,
  level: number,
  seed: number,
  options?: { tableId?: number }
): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer = 0;
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['multiplication'];
  let tableId = options?.tableId;

  let normalLimitMs = 15000;
  let hardLimitMs = 6000;

  switch (familyId) {
    case 'M01': {
      // Times tables 2-9 x 1-10 (Level 1)
      normalLimitMs = 10000;
      hardLimitMs = 4000;
      skillTags.push('times_table');
      const table = (tableId && tableId >= 2 && tableId <= 9) ? tableId : prng.nextInt(2, 9);
      const b = prng.nextInt(1, 10);
      params = { a: table, b };
      tableId = table;
      prompt = `${table} × ${b} = ?`;
      answer = table * b;
      hint = `Bảng nhân ${table}: đếm thêm từng bước ${table}.`;
      explanation = `${table} × ${b} = ${answer}`;
      const minF = Math.min(table, b);
      const maxF = Math.max(table, b);
      semanticKey = `mul:${minF}x${maxF}`;
      memoryKey = `fact:mul:${table}x${b}`;
      break;
    }

    case 'M02': {
      // Multiply with 0, 1, 10 (Level 1)
      normalLimitMs = 10000;
      hardLimitMs = 4000;
      skillTags.push('times_table_special');
      const special = prng.pick([0, 1, 10]);
      const a = prng.nextInt(1, 9);
      params = { a, special };
      prompt = `${a} × ${special} = ?`;
      answer = a * special;
      if (special === 0) {
        hint = `Bất kỳ số nào nhân với 0 đều bằng 0.`;
      } else if (special === 1) {
        hint = `Bất kỳ số nào nhân với 1 đều bằng chính nó.`;
      } else {
        hint = `Nhân một số với 10: viết thêm một chữ số 0 vào bên phải.`;
      }
      explanation = `${a} × ${special} = ${answer}`;
      semanticKey = `mul_special:${a}x${special}`;
      memoryKey = `fact:mul_special:${special}`;
      break;
    }

    case 'M03': {
      // a x □ = p (missing factor)
      normalLimitMs = 10000;
      hardLimitMs = 4000;
      skillTags.push('missing_factor');
      const a = (tableId && tableId >= 2 && tableId <= 9) ? tableId : prng.nextInt(2, 9);
      const missing = prng.nextInt(1, 10);
      const p = a * missing;
      params = { a, missing, p };
      prompt = `${a} × □ = ${p}`;
      answer = missing;
      hint = `Dựa vào bảng nhân ${a} hoặc lấy ${p} ÷ ${a}.`;
      explanation = `□ = ${p} ÷ ${a} = ${missing}`;
      semanticKey = `missing_mul:${a}x_=${p}`;
      memoryKey = `skill:missing_mul_table`;
      break;
    }

    case 'M04': {
      // Multiply with 10, 100, round tens (Level 2)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('multiply_round');
      const base = prng.pick([10, 100, 20, 30]);
      const a = prng.nextInt(11, 49);
      params = { a, base };
      prompt = `${a} × ${base} = ?`;
      answer = a * base;
      hint = base === 10 ? `Thêm một số 0 vào sau ${a}.` : (base === 100 ? `Thêm hai số 0 vào sau ${a}.` : `Nhân ${a} với ${base / 10} rồi thêm số 0.`);
      explanation = `${a} × ${base} = ${formatInteger(answer)}`;
      semanticKey = `mul_round:${a}x${base}`;
      memoryKey = `skill:mul_round`;
      break;
    }

    case 'M05': {
      // 2-digit number x 2 or x 5 (Level 2)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('multiply_2_5');
      const mult = prng.pick([2, 5]);
      const a = prng.nextInt(11, 49);
      params = { a, mult };
      prompt = `${a} × ${mult} = ?`;
      answer = a * mult;
      if (mult === 2) {
        hint = `Nhân 2 tức là gấp đôi ${a}: gấp đôi hàng chục rồi gấp đôi hàng đơn vị.`;
      } else {
        hint = `Nhân 5: có thể nhân 10 rồi chia đôi (${a} × 10 ÷ 2).`;
      }
      explanation = strategySplitMultiply(a, mult);
      semanticKey = `mul_2_5:${a}x${mult}`;
      memoryKey = `skill:mul_2_5`;
      break;
    }

    case 'M06': {
      // 2-digit number x 3..9 (split tens & units) (Level 3)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('split_multiply');
      const a = prng.nextInt(12, 49);
      const b = prng.nextInt(3, 9);
      params = { a, b };
      prompt = `${a} × ${b} = ?`;
      answer = a * b;
      hint = `Tách ${a} thành hàng chục và hàng đơn vị rồi nhân lần lượt với ${b}.`;
      explanation = strategySplitMultiply(a, b);
      semanticKey = `mul_split:${a}x${b}`;
      memoryKey = `skill:mul_split`;
      break;
    }

    case 'M07': {
      // Multiply with 11, 12, 15, 20 (Level 4)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('multiply_special_factors');
      const factor = prng.pick([11, 12, 15, 20]);
      const a = prng.nextInt(12, 35);
      params = { a, factor };
      prompt = `${a} × ${factor} = ?`;
      answer = a * factor;
      if (factor === 11) {
        hint = `${a} × 11 = ${a} × 10 + ${a}.`;
      } else if (factor === 12) {
        hint = `${a} × 12 = ${a} × 10 + ${a} × 2.`;
      } else if (factor === 15) {
        hint = `${a} × 15 = ${a} × 10 + (${a} × 10 ÷ 2).`;
      } else {
        hint = `${a} × 20 = (${a} × 2) × 10.`;
      }
      explanation = `${a} × ${factor} = ${formatInteger(answer)}`;
      semanticKey = `mul_factor:${a}x${factor}`;
      memoryKey = `skill:mul_factor_${factor}`;
      break;
    }

    case 'M08': {
      // Multiply with 25 or 50 (clean integer division) (Level 4)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('multiply_25_50');
      const factor = prng.pick([25, 50]);
      // If 25, a must be divisible by 4 so (a/4)*100 is pure integer!
      // If 50, a must be divisible by 2 so (a/2)*100 is pure integer!
      const a = factor === 25 ? prng.nextInt(3, 15) * 4 : prng.nextInt(5, 25) * 2;
      params = { a, factor };
      prompt = `${a} × ${factor} = ?`;
      answer = a * factor;
      hint = factor === 25 ? `Nhân 25: lấy ${a} chia 4 rồi nhân 100.` : `Nhân 50: lấy ${a} chia đôi rồi nhân 100.`;
      explanation = factor === 25 ? strategyMultiply25(a) : strategyMultiply50(a);
      semanticKey = `mul_25_50:${a}x${factor}`;
      memoryKey = `skill:mul_${factor}`;
      break;
    }

    case 'M09': {
      // Multiply near round mark (x9, x99) (Level 5)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('multiply_near_round');
      const factor = prng.pick([9, 99]);
      const a = factor === 9 ? prng.nextInt(12, 50) : prng.nextInt(11, 45);
      params = { a, factor };
      prompt = `${a} × ${factor} = ?`;
      answer = a * factor;
      hint = factor === 9 ? `Lấy ${a} × 10 rồi trừ đi ${a}.` : `Lấy ${a} × 100 rồi trừ đi ${a}.`;
      explanation = factor === 9 ? strategyMultiply9(a) : strategyMultiply99(a);
      semanticKey = `mul_near_round:${a}x${factor}`;
      memoryKey = `skill:mul_near_round_${factor}`;
      break;
    }

    case 'M10': {
      // Factor pairing: e.g. 125 x 24 = 125 x 8 x 3 = 1000 x 3 = 3000 (Level 5)
      normalLimitMs = 40000;
      hardLimitMs = 15000;
      skillTags.push('factor_pairing');
      const mult8 = prng.nextInt(2, 9); // b = 8 * mult8
      const b = 8 * mult8;
      const a = 125;
      params = { a, b, mult8 };
      prompt = `${a} × ${b} = ?`;
      answer = a * b;
      hint = `Tách ${b} = 8 × ${mult8}, rồi tính (125 × 8) × ${mult8} = 1.000 × ${mult8}.`;
      explanation = strategyFactorPairing(a, b);
      semanticKey = `mul_pairing:${a}x${b}`;
      memoryKey = `skill:factor_pairing`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'multiplication',
    level,
    tableId,
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
