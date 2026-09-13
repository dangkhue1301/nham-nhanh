import { Question } from '../types.ts';
import { createPRNG } from '../random.ts';
import { formatInteger } from '../arithmetic.ts';
import { strategyMakeTen } from '../../content/mentalStrategies.ts';

export function generateAdditionQuestion(familyId: string, level: number, seed: number): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer = 0;
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['addition'];

  // Default timing limits in ms
  let normalLimitMs = 15000;
  let hardLimitMs = 6000;

  switch (familyId) {
    case 'A01': {
      // a + b <= 9, a, b >= 0 (Level 1)
      normalLimitMs = 10000;
      hardLimitMs = 4000;
      skillTags.push('under_10');
      const sum = prng.nextInt(0, 9);
      const a = prng.nextInt(0, sum);
      const b = sum - a;
      params = { a, b };
      prompt = `${a} + ${b} = ?`;
      answer = sum;
      hint = `Cộng nhẩm từ ${a}, đếm thêm ${b} đơn vị.`;
      explanation = `${a} + ${b} = ${sum}`;
      // Canonical semantic key
      const minVal = Math.min(a, b);
      const maxVal = Math.max(a, b);
      semanticKey = `add:${minVal}+${maxVal}`;
      memoryKey = `fact:add:${minVal}+${maxVal}`;
      break;
    }

    case 'A02': {
      // a + □ = t
      // L1: t <= 9
      // L2: t = 10..20
      // L3: t = 100
      let t = 9;
      if (level === 1) {
        normalLimitMs = 10000;
        hardLimitMs = 4000;
        t = prng.nextInt(1, 9);
      } else if (level === 2) {
        normalLimitMs = 15000;
        hardLimitMs = 6000;
        t = prng.nextInt(10, 20);
      } else {
        normalLimitMs = 15000;
        hardLimitMs = 6000;
        t = 100;
      }
      const a = prng.nextInt(0, t);
      const missing = t - a;
      params = { a, t, missing };
      prompt = `${formatInteger(a)} + □ = ${formatInteger(t)}`;
      answer = missing;
      hint = `Tìm số còn thiếu bằng cách lấy ${formatInteger(t)} − ${formatInteger(a)}.`;
      explanation = `□ = ${formatInteger(t)} − ${formatInteger(a)} = ${formatInteger(missing)}`;
      semanticKey = `missing_add:${a}+_=${t}`;
      memoryKey = `skill:missing_add:L${level}`;
      break;
    }

    case 'A03': {
      // 1-digit + 1-digit crossing 10, total in [10, 20] (Level 2)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('cross_10');
      // a in [2..9], b in [2..9] such that a + b in [10, 18]
      const a = prng.nextInt(2, 9);
      const minB = Math.max(1, 10 - a);
      const b = prng.nextInt(minB, 9);
      const sum = a + b;
      params = { a, b };
      prompt = `${a} + ${b} = ?`;
      answer = sum;
      hint = `Tách số hạng thứ hai để ghép với ${a} cho tròn 10.`;
      explanation = strategyMakeTen(a, b);
      const minVal = Math.min(a, b);
      const maxVal = Math.max(a, b);
      semanticKey = `add:${minVal}+${maxVal}`;
      memoryKey = `fact:add:${minVal}+${maxVal}`;
      break;
    }

    case 'A04': {
      // Within 100, no carry (Level 3)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('within_100', 'no_carry');
      const uA = prng.nextInt(0, 9);
      const uB = prng.nextInt(0, 9 - uA); // units sum <= 9
      const tA = prng.nextInt(1, 8);
      const tB = prng.nextInt(1, 9 - tA); // tens sum <= 9
      const a = tA * 10 + uA;
      const b = tB * 10 + uB;
      params = { a, b };
      prompt = `${a} + ${b} = ?`;
      answer = a + b;
      hint = `Cộng hàng chục trước: ${tA * 10} + ${tB * 10}, rồi cộng hàng đơn vị: ${uA} + ${uB}.`;
      explanation = `${a} + ${b} = (${tA * 10} + ${tB * 10}) + (${uA} + ${uB}) = ${(tA + tB) * 10} + ${uA + uB} = ${a + b}`;
      const minVal = Math.min(a, b);
      const maxVal = Math.max(a, b);
      semanticKey = `add_no_carry:${minVal}+${maxVal}`;
      memoryKey = `skill:add_within_100_no_carry`;
      break;
    }

    case 'A05': {
      // Within 100, carry at units (Level 3)
      normalLimitMs = 15000;
      hardLimitMs = 6000;
      skillTags.push('within_100', 'carry');
      const uA = prng.nextInt(2, 9);
      const uB = prng.nextInt(10 - uA, 9); // units sum in [10, 18]
      const maxTens = 8; // sum < 100
      const tA = prng.nextInt(1, maxTens - 1);
      const tB = prng.nextInt(1, maxTens - tA);
      const a = tA * 10 + uA;
      const b = tB * 10 + uB;
      params = { a, b };
      prompt = `${a} + ${b} = ?`;
      answer = a + b;
      hint = `Cộng chục với chục, đơn vị với đơn vị và nhớ 1 sang hàng chục.`;
      explanation = `${a} + ${b} = (${tA * 10} + ${tB * 10}) + (${uA} + ${uB}) = ${(tA + tB) * 10} + ${uA + uB} = ${a + b}`;
      const minVal = Math.min(a, b);
      const maxVal = Math.max(a, b);
      semanticKey = `add_carry:${minVal}+${maxVal}`;
      memoryKey = `skill:add_within_100_carry`;
      break;
    }

    case 'A06': {
      // Within 1,000 (Level 4)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('within_1000');
      // Mix round tens/hundreds (50%) or full 3-digits (50%)
      const isRound = prng.nextInt(0, 1) === 1;
      let a = 0;
      let b = 0;
      if (isRound) {
        a = prng.nextInt(10, 50) * 10;
        b = prng.nextInt(10, 99 - Math.floor(a / 10)) * 10;
      } else {
        a = prng.nextInt(101, 500);
        b = prng.nextInt(101, 999 - a);
      }
      params = { a, b };
      prompt = `${formatInteger(a)} + ${formatInteger(b)} = ?`;
      answer = a + b;
      hint = `Tách phần trăm, phần chục và phần đơn vị để nhẩm.`;
      explanation = `${formatInteger(a)} + ${formatInteger(b)} = ${formatInteger(a + b)}`;
      const minVal = Math.min(a, b);
      const maxVal = Math.max(a, b);
      semanticKey = `add_1000:${minVal}+${maxVal}`;
      memoryKey = `skill:add_within_1000`;
      break;
    }

    case 'A07': {
      // a from 1000 to 9999, b from 1 to 99 (891,000 distinct pairs!) (Level 5)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      skillTags.push('large_small_addition');
      const a = prng.nextInt(1000, 9999);
      const b = prng.nextInt(1, 99);
      params = { a, b };
      prompt = `${formatInteger(a)} + ${b} = ?`;
      answer = a + b;
      hint = `Tách ${formatInteger(a)} thành phần nghìn và hai chữ số cuối để cộng nhẩm với ${b}.`;
      explanation = `${formatInteger(a)} + ${b} = ${formatInteger(a + b)}`;
      semanticKey = `add_large_small:${a}+${b}`;
      memoryKey = `skill:add_large_small`;
      break;
    }

    case 'A08': {
      // 3 numbers with a pair making round number, sum <= 1.000.000 (Level 5)
      normalLimitMs = 40000;
      hardLimitMs = 15000;
      skillTags.push('three_numbers_grouping');
      // Generate pair (p1, p2) that sums to round base (100, 1000, or 10000)
      const base = prng.pick([100, 1000, 10000]);
      const p1 = prng.nextInt(Math.floor(base * 0.1), Math.floor(base * 0.9));
      const p2 = base - p1;
      const c = prng.nextInt(10, base);
      // Shuffle display order
      const nums = prng.shuffle([p1, p2, c]);
      params = { nums, base, p1, p2, c };
      prompt = `${formatInteger(nums[0])} + ${formatInteger(nums[1])} + ${formatInteger(nums[2])} = ?`;
      answer = p1 + p2 + c;
      hint = `Ghép cặp hai số có tổng tròn (${formatInteger(p1)} + ${formatInteger(p2)} = ${formatInteger(base)}) trước.`;
      explanation = `(${formatInteger(p1)} + ${formatInteger(p2)}) + ${formatInteger(c)} = ${formatInteger(base)} + ${formatInteger(c)} = ${formatInteger(answer)}`;
      const sorted = [...nums].sort((x, y) => x - y);
      semanticKey = `add3:${sorted.join('+')}`;
      memoryKey = `skill:add_three_grouping`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'addition',
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
