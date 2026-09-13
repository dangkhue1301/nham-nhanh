import { Question } from '../types.ts';
import { createPRNG } from '../random.ts';
import { formatInteger } from '../arithmetic.ts';
import { strategySplitDivision } from '../../content/mentalStrategies.ts';

export function generateDivisionQuestion(
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
  let skillTags: string[] = ['division'];
  let tableId = options?.tableId;

  let normalLimitMs = 15000;
  let hardLimitMs = 6000;

  switch (familyId) {
    case 'D01': {
      // Inverse of times tables 2..9 (Level 1)
      normalLimitMs = 10000;
      hardLimitMs = 4000;
      skillTags.push('division_table');
      const d = (tableId && tableId >= 2 && tableId <= 9) ? tableId : prng.nextInt(2, 9);
      const q = prng.nextInt(1, 10);
      const n = d * q;
      tableId = d;
      params = { n, d, q };
      prompt = `${n} ÷ ${d} = ?`;
      answer = q;
      hint = `Nhớ lại bảng nhân ${d}: ${d} nhân mấy thì bằng ${n}?`;
      explanation = `${n} ÷ ${d} = ${q} (vì ${d} × ${q} = ${n})`;
      semanticKey = `div:${n}/${d}`;
      memoryKey = `fact:div:${n}/${d}`;
      break;
    }

    case 'D02': {
      // Round numbers divided by 2, 5, 10, 100 (Level 2)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('divide_round');
      const d = prng.pick([2, 5, 10, 100]);
      let q = 0;
      if (d === 100) {
        q = prng.nextInt(2, 50);
      } else if (d === 10) {
        q = prng.nextInt(5, 80);
      } else {
        q = prng.nextInt(10, 50);
      }
      const n = d * q;
      params = { n, d, q };
      prompt = `${formatInteger(n)} ÷ ${d} = ?`;
      answer = q;
      if (d === 10) {
        hint = `Bỏ bớt một chữ số 0 ở tận cùng của ${formatInteger(n)}.`;
      } else if (d === 100) {
        hint = `Bỏ bớt hai chữ số 0 ở tận cùng của ${formatInteger(n)}.`;
      } else if (d === 5) {
        hint = `Chia 5: nhân đôi số bị chia rồi chia cho 10 (${formatInteger(n)} × 2 ÷ 10).`;
      } else {
        hint = `Lấy một nửa của ${formatInteger(n)}.`;
      }
      explanation = `${formatInteger(n)} ÷ ${d} = ${formatInteger(q)}`;
      semanticKey = `div_round:${n}/${d}`;
      memoryKey = `skill:div_round_${d}`;
      break;
    }

    case 'D03': {
      // 2-digit divided by 1-digit (Level 3)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('divide_2digit_1digit');
      const d = prng.nextInt(2, 9);
      const q = prng.nextInt(11, Math.floor(99 / d));
      const n = d * q;
      params = { n, d, q };
      prompt = `${n} ÷ ${d} = ?`;
      answer = q;
      hint = `Tách ${n} thành các phần dễ chia hết cho ${d}.`;
      explanation = strategySplitDivision(n, d);
      semanticKey = `div_split:${n}/${d}`;
      memoryKey = `skill:div_split_1digit`;
      break;
    }

    case 'D04': {
      // 3-digit divided by 1-digit (Level 3)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('divide_3digit_1digit');
      const d = prng.nextInt(3, 9);
      const q = prng.nextInt(12, 99);
      const n = d * q;
      params = { n, d, q };
      prompt = `${formatInteger(n)} ÷ ${d} = ?`;
      answer = q;
      hint = `Chia từ hàng trăm, hàng chục rồi đến hàng đơn vị.`;
      explanation = `${formatInteger(n)} ÷ ${d} = ${q}`;
      semanticKey = `div_3digit:${n}/${d}`;
      memoryKey = `skill:div_3digit`;
      break;
    }

    case 'D05': {
      // Divided by 2-digit number (Level 4)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('divide_2digit_divisor');
      const d = prng.pick([11, 12, 13, 14, 15, 16, 20, 25]);
      const q = prng.nextInt(3, 20);
      const n = d * q;
      params = { n, d, q };
      prompt = `${formatInteger(n)} ÷ ${d} = ?`;
      answer = q;
      hint = `Ước lượng thương và thử nhân ngược lại: ${d} × mấy thì gần hoặc bằng ${n}.`;
      explanation = `${formatInteger(n)} ÷ ${d} = ${q} (vì ${d} × ${q} = ${formatInteger(n)})`;
      semanticKey = `div_2digit_div:${n}/${d}`;
      memoryKey = `skill:div_2digit_divisor`;
      break;
    }

    case 'D06': {
      // Divide by 25, 50, 125 (Level 5)
      normalLimitMs = 40000;
      hardLimitMs = 15000;
      skillTags.push('divide_special_base');
      const d = prng.pick([25, 50, 125]);
      let q = 0;
      if (d === 25) {
        q = prng.nextInt(4, 80);
      } else if (d === 50) {
        q = prng.nextInt(4, 60);
      } else {
        q = prng.nextInt(2, 40);
      }
      const n = d * q;
      params = { n, d, q };
      prompt = `${formatInteger(n)} ÷ ${d} = ?`;
      answer = q;
      if (d === 25) {
        hint = `Chia 25: nhân số bị chia với 4 rồi chia cho 100 (${formatInteger(n)} × 4 ÷ 100).`;
      } else if (d === 50) {
        hint = `Chia 50: nhân đôi số bị chia rồi chia cho 100 (${formatInteger(n)} × 2 ÷ 100).`;
      } else {
        hint = `Chia 125: nhân số bị chia với 8 rồi chia cho 1.000 (${formatInteger(n)} × 8 ÷ 1.000).`;
      }
      explanation = `${formatInteger(n)} ÷ ${d} = ${formatInteger(q)}`;
      semanticKey = `div_special:${n}/${d}`;
      memoryKey = `skill:div_${d}`;
      break;
    }

    case 'D07': {
      // □ ÷ d = q (missing dividend) (Level 2)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('missing_dividend');
      const d = prng.nextInt(2, 9);
      const q = prng.nextInt(2, 10);
      const missing = d * q;
      params = { d, q, missing };
      prompt = `□ ÷ ${d} = ${q}`;
      answer = missing;
      hint = `Tìm số bị chia bằng cách nhân số chia với thương: ${d} × ${q}.`;
      explanation = `□ = ${d} × ${q} = ${missing}`;
      semanticKey = `missing_div:_/${d}=${q}`;
      memoryKey = `skill:missing_div`;
      break;
    }

    case 'D08': {
      // Simplify common factor 10 or 100: e.g. 4800 ÷ 60 = 80 (Level 5)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('divide_simplify_zeros');
      const factor = prng.pick([10, 100]);
      const baseD = prng.nextInt(2, 9);
      const baseQ = prng.nextInt(3, 15);
      const d = baseD * factor;
      const n = (baseD * baseQ) * factor;
      params = { n, d, baseD, baseQ, factor };
      prompt = `${formatInteger(n)} ÷ ${formatInteger(d)} = ?`;
      answer = baseQ;
      hint = `Cùng bớt ${factor === 10 ? 'một số 0' : 'hai số 0'} ở cả hai số: ${formatInteger(n / factor)} ÷ ${formatInteger(d / factor)}.`;
      explanation = `${formatInteger(n)} ÷ ${formatInteger(d)} = ${formatInteger(n / factor)} ÷ ${formatInteger(d / factor)} = ${baseQ}`;
      semanticKey = `div_simplify:${n}/${d}`;
      memoryKey = `skill:div_simplify_zeros`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'division',
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
