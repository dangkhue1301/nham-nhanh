import { Question } from '../types.ts';
import { createPRNG } from '../random.ts';

export function generateExpressionsQuestion(
  familyId: string,
  level: number,
  seed: number
): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer = 0;
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['expressions', 'order_of_operations'];

  let normalLimitMs = 25000;
  let hardLimitMs = 10000;

  switch (familyId) {
    case 'X01': {
      // a + b - c, non-negative intermediate and final (Level 2)
      normalLimitMs = 20000;
      hardLimitMs = 8000;
      const a = prng.nextInt(5, 15);
      const b = prng.nextInt(3, 15);
      const c = prng.nextInt(1, a + b);
      params = { a, b, c };
      prompt = `${a} + ${b} − ${c} = ?`;
      answer = a + b - c;
      hint = `Thực hiện lần lượt từ trái sang phải: tính ${a} + ${b} trước, sau đó trừ đi ${c}.`;
      explanation = `${a} + ${b} − ${c} = ${a + b} − ${c} = ${answer}`;
      semanticKey = `expr_add_sub:${a}+${b}-${c}`;
      memoryKey = `skill:expr_add_sub`;
      break;
    }

    case 'X02': {
      // a x b + c or a x b - c (Level 3)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      const a = prng.nextInt(2, 9);
      const b = prng.nextInt(2, 9);
      const isPlus = prng.nextInt(0, 1) === 1;
      const prod = a * b;
      let c = 0;
      if (isPlus) {
        c = prng.nextInt(5, 30);
        prompt = `${a} × ${b} + ${c} = ?`;
        answer = prod + c;
        hint = `Nhân chia trước, cộng trừ sau: tính ${a} × ${b} trước rồi cộng ${c}.`;
        explanation = `${a} × ${b} + ${c} = ${prod} + ${c} = ${answer}`;
      } else {
        c = prng.nextInt(1, prod);
        prompt = `${a} × ${b} − ${c} = ?`;
        answer = prod - c;
        hint = `Nhân chia trước, cộng trừ sau: tính ${a} × ${b} trước rồi trừ ${c}.`;
        explanation = `${a} × ${b} − ${c} = ${prod} − ${c} = ${answer}`;
      }
      params = { a, b, c, isPlus };
      semanticKey = `expr_mul_op:${a}x${b}${isPlus ? '+' : '-'}${c}`;
      memoryKey = `skill:expr_mul_add_sub`;
      break;
    }

    case 'X03': {
      // a ÷ b + c or a ÷ b - c (Level 3)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      const b = prng.nextInt(2, 9);
      const q = prng.nextInt(2, 10);
      const a = b * q; // ensures a divides cleanly by b
      const isPlus = prng.nextInt(0, 1) === 1;
      let c = 0;
      if (isPlus) {
        c = prng.nextInt(5, 30);
        prompt = `${a} ÷ ${b} + ${c} = ?`;
        answer = q + c;
        hint = `Thực hiện phép chia trước: ${a} ÷ ${b} rồi cộng ${c}.`;
        explanation = `${a} ÷ ${b} + ${c} = ${q} + ${c} = ${answer}`;
      } else {
        c = prng.nextInt(1, q);
        prompt = `${a} ÷ ${b} − ${c} = ?`;
        answer = q - c;
        hint = `Thực hiện phép chia trước: ${a} ÷ ${b} rồi trừ ${c}.`;
        explanation = `${a} ÷ ${b} − ${c} = ${q} − ${c} = ${answer}`;
      }
      params = { a, b, c, isPlus };
      semanticKey = `expr_div_op:${a}/${b}${isPlus ? '+' : '-'}${c}`;
      memoryKey = `skill:expr_div_add_sub`;
      break;
    }

    case 'X04': {
      // (a + b) x c or (a + b) ÷ c (Level 4)
      normalLimitMs = 25000;
      hardLimitMs = 10000;
      const isMul = prng.nextInt(0, 1) === 1;
      if (isMul) {
        const a = prng.nextInt(3, 15);
        const b = prng.nextInt(3, 15);
        const c = prng.nextInt(2, 6);
        prompt = `(${a} + ${b}) × ${c} = ?`;
        answer = (a + b) * c;
        hint = `Tính trong dấu ngoặc trước: (${a} + ${b}) rồi nhân với ${c}.`;
        explanation = `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${answer}`;
        params = { a, b, c, isMul };
      } else {
        const c = prng.nextInt(2, 8);
        const q = prng.nextInt(3, 12);
        const targetSum = c * q;
        const a = prng.nextInt(2, targetSum - 2);
        const b = targetSum - a;
        prompt = `(${a} + ${b}) ÷ ${c} = ?`;
        answer = q;
        hint = `Tính trong dấu ngoặc trước: (${a} + ${b}) rồi chia cho ${c}.`;
        explanation = `(${a} + ${b}) ÷ ${c} = ${a + b} ÷ ${c} = ${answer}`;
        params = { a, b, c, isMul };
      }
      semanticKey = `expr_paren:${params.a}+${params.b}_${isMul ? 'x' : '/'}${params.c}`;
      memoryKey = `skill:expr_parentheses`;
      break;
    }

    case 'X05': {
      // a + b + c + d, deliberately pairing round tens (Level 4)
      normalLimitMs = 30000;
      hardLimitMs = 12000;
      skillTags.push('four_numbers_pairing');
      // Pair 1: sum to base1 (e.g. 20, 30, 50)
      const base1 = prng.pick([20, 30, 40]);
      const a = prng.nextInt(3, base1 - 3);
      const b = base1 - a;
      // Pair 2: sum to base2
      const base2 = prng.pick([20, 30, 40]);
      const c = prng.nextInt(3, base2 - 3);
      const d = base2 - c;
      const nums = prng.shuffle([a, b, c, d]);
      prompt = `${nums[0]} + ${nums[1]} + ${nums[2]} + ${nums[3]} = ?`;
      answer = base1 + base2;
      hint = `Tìm các cặp số ghép lại thành số tròn chục: (${a} + ${b} = ${base1}) và (${c} + ${d} = ${base2}).`;
      explanation = `(${a} + ${b}) + (${c} + ${d}) = ${base1} + ${base2} = ${answer}`;
      params = { a, b, c, d, nums };
      const sorted = [...nums].sort((x, y) => x - y);
      semanticKey = `expr_add4:${sorted.join('+')}`;
      memoryKey = `skill:expr_pairing_four`;
      break;
    }

    case 'X06': {
      // (a + b) x c - d or (a - b) x c + d, up to 3 steps (Level 5)
      normalLimitMs = 40000;
      hardLimitMs = 15000;
      skillTags.push('three_step_expression');
      const isAdd = prng.nextInt(0, 1) === 1;
      if (isAdd) {
        const a = prng.nextInt(5, 20);
        const b = prng.nextInt(5, 20);
        const c = prng.nextInt(2, 5);
        const prod = (a + b) * c;
        const d = prng.nextInt(5, prod - 1);
        prompt = `(${a} + ${b}) × ${c} − ${d} = ?`;
        answer = prod - d;
        hint = `Thực hiện trong ngoặc (${a} + ${b}), rồi nhân với ${c}, cuối cùng trừ đi ${d}.`;
        explanation = `(${a} + ${b}) × ${c} − ${d} = ${a + b} × ${c} − ${d} = ${prod} − ${d} = ${answer}`;
        params = { a, b, c, d, isAdd };
      } else {
        const a = prng.nextInt(20, 50);
        const b = prng.nextInt(5, a - 5);
        const c = prng.nextInt(2, 5);
        const prod = (a - b) * c;
        const d = prng.nextInt(5, 50);
        prompt = `(${a} − ${b}) × ${c} + ${d} = ?`;
        answer = prod + d;
        hint = `Thực hiện trong ngoặc (${a} − ${b}), rồi nhân với ${c}, cuối cùng cộng thêm ${d}.`;
        explanation = `(${a} − ${b}) × ${c} + ${d} = ${a - b} × ${c} + ${d} = ${prod} + ${d} = ${answer}`;
        params = { a, b, c, d, isAdd };
      }
      semanticKey = `expr_3step:${params.a}_${isAdd ? '+' : '-'}_${params.b}_x${params.c}`;
      memoryKey = `skill:expr_three_steps`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'mixed',
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
