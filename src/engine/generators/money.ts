import { Question } from '../types.ts';
import { createPRNG } from '../random.ts';
import { formatVND } from '../arithmetic.ts';
import { MONEY_TEMPLATES } from '../../content/lifeTemplates.ts';

const SAMPLE_ITEMS = [
  'quyển vở', 'cây bút', 'hộp sữa', 'ổ bánh mì', 'ly trà sữa',
  'thước kẻ', 'gói bánh', 'chai nước', 'quyển sách', 'hộp màu'
];

export function generateMoneyQuestion(familyId: string, level: number, seed: number): Question {
  const prng = createPRNG(seed);
  let prompt = '';
  let answer = 0;
  let unit = 'đồng';
  let hint = '';
  let explanation = '';
  let params: Record<string, any> = {};
  let semanticKey = '';
  let memoryKey = '';
  let skillTags: string[] = ['money', 'shopping'];

  let normalLimitMs = 40000;
  let hardLimitMs = 15000;

  switch (familyId) {
    case 'P01': {
      // Total price of two items (Level 1)
      const p1 = prng.nextInt(5, 50) * 1000;
      const p2 = prng.nextInt(5, 50) * 1000;
      const item1 = prng.pick(SAMPLE_ITEMS);
      let item2 = prng.pick(SAMPLE_ITEMS);
      while (item2 === item1) item2 = prng.pick(SAMPLE_ITEMS);
      const total = p1 + p2;
      params = { p1, p2, total, item1, item2 };
      const tpl = prng.pick(MONEY_TEMPLATES.P01);
      prompt = tpl(item1, formatVND(p1), item2, formatVND(p2));
      answer = total;
      hint = `Cộng hai số tiền: ${formatVND(p1)} + ${formatVND(p2)}.`;
      explanation = `${formatVND(p1)} + ${formatVND(p2)} = ${formatVND(total)}`;
      semanticKey = `money_total:${Math.min(p1, p2)}+${Math.max(p1, p2)}`;
      memoryKey = `skill:money_total`;
      break;
    }

    case 'P02': {
      // Change received (Level 1)
      const bill = prng.nextInt(10, 95) * 1000;
      const billThousands = bill / 1000;
      // Pick a denomination >= bill
      let paidThousands = 100;
      if (billThousands < 20) paidThousands = 20;
      else if (billThousands < 50) paidThousands = 50;
      else if (billThousands < 100) paidThousands = 100;
      else paidThousands = 200;
      const paid = paidThousands * 1000;
      const change = paid - bill;
      params = { bill, paid, change };
      const tpl = prng.pick(MONEY_TEMPLATES.P02);
      prompt = tpl(formatVND(bill), formatVND(paid));
      answer = change;
      hint = `Lấy số tiền khách đưa trừ đi hóa đơn: ${formatVND(paid)} − ${formatVND(bill)}.`;
      explanation = `${formatVND(paid)} − ${formatVND(bill)} = ${formatVND(change)}`;
      semanticKey = `money_change:${paid}-${bill}`;
      memoryKey = `skill:money_change`;
      break;
    }

    case 'P03': {
      // Buy q items with unit price p (Level 2)
      const q = prng.nextInt(2, 6);
      const unitPrice = prng.nextInt(5, 30) * 1000;
      const total = q * unitPrice;
      const item = prng.pick(SAMPLE_ITEMS);
      params = { q, unitPrice, total, item };
      const tpl = prng.pick(MONEY_TEMPLATES.P03);
      prompt = tpl(q, item, formatVND(unitPrice));
      answer = total;
      hint = `Lấy số lượng nhân với đơn giá: ${q} × ${formatVND(unitPrice)}.`;
      explanation = `${q} × ${formatVND(unitPrice)} = ${formatVND(total)}`;
      semanticKey = `money_buy_q:${q}x${unitPrice}`;
      memoryKey = `skill:money_buy_quantity`;
      break;
    }

    case 'P04': {
      // Cart with 2 item types: q1 * p1 + q2 * p2 (Level 3)
      const q1 = prng.nextInt(2, 4);
      const p1 = prng.nextInt(5, 20) * 1000;
      const q2 = prng.nextInt(2, 4);
      const p2 = prng.nextInt(5, 20) * 1000;
      const item1 = prng.pick(SAMPLE_ITEMS);
      let item2 = prng.pick(SAMPLE_ITEMS);
      while (item2 === item1) item2 = prng.pick(SAMPLE_ITEMS);
      const total = q1 * p1 + q2 * p2;
      params = { q1, p1, q2, p2, total, item1, item2 };
      const tpl = prng.pick(MONEY_TEMPLATES.P04);
      prompt = tpl(q1, item1, formatVND(p1), q2, item2, formatVND(p2));
      answer = total;
      hint = `Tính tiền từng món: (${q1} × ${formatVND(p1)}) + (${q2} × ${formatVND(p2)}).`;
      explanation = `(${q1} × ${formatVND(p1)}) + (${q2} × ${formatVND(p2)}) = ${formatVND(q1 * p1)} + ${formatVND(q2 * p2)} = ${formatVND(total)}`;
      semanticKey = `money_cart:${q1}x${p1}+${q2}x${p2}`;
      memoryKey = `skill:money_cart_two_types`;
      break;
    }

    case 'P05': {
      // Split bill evenly among n people (exact integer VND!) (Level 3)
      const n = prng.pick([2, 3, 4, 5]);
      const perPerson = prng.nextInt(10, 80) * 1000;
      const total = n * perPerson; // guarantees exact integer!
      params = { n, total, perPerson };
      const tpl = prng.pick(MONEY_TEMPLATES.P05);
      prompt = tpl(formatVND(total), n);
      answer = perPerson;
      hint = `Lấy tổng tiền chia cho số người: ${formatVND(total)} ÷ ${n}.`;
      explanation = `${formatVND(total)} ÷ ${n} = ${formatVND(perPerson)}`;
      semanticKey = `money_split:${total}/${n}`;
      memoryKey = `skill:money_split_evenly`;
      break;
    }

    case 'P06': {
      // Maximum items affordable with budget B (Level 4)
      const unitPrice = prng.nextInt(4, 15) * 1000;
      const maxItems = prng.nextInt(3, 8);
      const remainder = prng.nextInt(1, 3) * 1000;
      const budget = maxItems * unitPrice + remainder;
      const item = prng.pick(SAMPLE_ITEMS);
      params = { budget, unitPrice, maxItems, remainder, item };
      unit = item;
      const tpl = prng.pick(MONEY_TEMPLATES.P06);
      prompt = tpl(formatVND(budget), formatVND(unitPrice), item);
      answer = maxItems;
      hint = `Lấy ngân sách chia cho đơn giá, lấy phần nguyên: ${formatVND(budget)} ÷ ${formatVND(unitPrice)}.`;
      explanation = `${formatVND(budget)} = ${maxItems} × ${formatVND(unitPrice)} + ${formatVND(remainder)} ➔ mua tối đa ${maxItems} ${item}`;
      semanticKey = `money_max_items:${budget}/${unitPrice}`;
      memoryKey = `skill:money_max_items`;
      break;
    }

    case 'P07': {
      // Remaining money after buying max items (Level 4)
      const unitPrice = prng.nextInt(4, 15) * 1000;
      const maxItems = prng.nextInt(3, 8);
      const remainder = prng.nextInt(1, 3) * 1000;
      const budget = maxItems * unitPrice + remainder;
      const item = prng.pick(SAMPLE_ITEMS);
      params = { budget, unitPrice, maxItems, remainder, item };
      unit = 'đồng';
      const tpl = prng.pick(MONEY_TEMPLATES.P07);
      prompt = tpl(formatVND(budget), formatVND(unitPrice), item);
      answer = remainder;
      hint = `Số tiền mua ${maxItems} ${item} là ${formatVND(maxItems * unitPrice)}. Lấy ngân sách trừ đi: ${formatVND(budget)} − ${formatVND(maxItems * unitPrice)}.`;
      explanation = `${formatVND(budget)} − (${maxItems} × ${formatVND(unitPrice)}) = ${formatVND(budget)} − ${formatVND(maxItems * unitPrice)} = ${formatVND(remainder)}`;
      semanticKey = `money_rem:${budget}%${unitPrice}`;
      memoryKey = `skill:money_remainder`;
      break;
    }

    case 'P08': {
      // Save p per day for n days + initial savings (Level 4)
      const daily = prng.nextInt(5, 30) * 1000;
      const days = prng.nextInt(5, 12);
      const initial = prng.nextInt(20, 100) * 1000;
      const saved = daily * days;
      const total = initial + saved;
      params = { daily, days, initial, saved, total };
      const tpl = prng.pick(MONEY_TEMPLATES.P08);
      prompt = tpl(formatVND(daily), days, formatVND(initial));
      answer = total;
      hint = `Tính số tiền tiết kiệm trong ${days} ngày: ${days} × ${formatVND(daily)}, rồi cộng với số tiền sẵn có (${formatVND(initial)}).`;
      explanation = `${formatVND(initial)} + (${days} × ${formatVND(daily)}) = ${formatVND(initial)} + ${formatVND(saved)} = ${formatVND(total)}`;
      semanticKey = `money_savings:${initial}+${days}x${daily}`;
      memoryKey = `skill:money_savings`;
      break;
    }

    case 'P09': {
      // Fixed discount, ask price to pay (Level 5)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      const original = prng.nextInt(50, 400) * 1000;
      const discount = prng.nextInt(10, 45) * 1000;
      const finalPrice = original - discount;
      params = { original, discount, finalPrice };
      const tpl = prng.pick(MONEY_TEMPLATES.P09);
      prompt = tpl(formatVND(original), formatVND(discount));
      answer = finalPrice;
      hint = `Lấy giá gốc trừ đi số tiền được giảm: ${formatVND(original)} − ${formatVND(discount)}.`;
      explanation = `${formatVND(original)} − ${formatVND(discount)} = ${formatVND(finalPrice)}`;
      semanticKey = `money_fixed_discount:${original}-${discount}`;
      memoryKey = `skill:money_fixed_discount`;
      break;
    }

    case 'P10': {
      // Percentage discount 10%, 20%, 25%, 50%, all integer (Level 5)
      normalLimitMs = 60000;
      hardLimitMs = 25000;
      const percent = prng.pick([10, 20, 25, 50]);
      // Multiples of 100.000 so percent is always clean integer!
      const originalThousands = prng.nextInt(2, 10) * 100; // 200k, 300k, ... 1000k
      const original = originalThousands * 1000;
      const discount = (original * percent) / 100;
      const finalPrice = original - discount;
      params = { original, percent, discount, finalPrice };
      const tpl = prng.pick(MONEY_TEMPLATES.P10);
      prompt = tpl(formatVND(original), percent);
      answer = finalPrice;
      let mentalHint = '';
      if (percent === 10) mentalHint = `10% tức là bớt một số 0: giảm ${formatVND(discount)}.`;
      else if (percent === 20) mentalHint = `20% bằng hai lần 10%: giảm ${formatVND(discount)}.`;
      else if (percent === 25) mentalHint = `25% tức là một phần tư (chia 4): giảm ${formatVND(discount)}.`;
      else mentalHint = `50% tức là một nửa (chia đôi): giảm ${formatVND(discount)}.`;
      hint = `Tính số tiền giảm (${percent}%), rồi lấy giá gốc trừ đi. ${mentalHint}`;
      explanation = `Tiền giảm: ${formatVND(original)} × ${percent}% = ${formatVND(discount)}. Giá sau giảm: ${formatVND(original)} − ${formatVND(discount)} = ${formatVND(finalPrice)}`;
      semanticKey = `money_pct_discount:${original}x${percent}%`;
      memoryKey = `skill:money_pct_discount`;
      break;
    }
  }

  return {
    id: `${familyId}-${level}-${seed}`,
    familyId,
    generatorVersion: 1,
    seed,
    topic: 'money',
    level,
    skillTags,
    parameters: params,
    prompt,
    answerType: 'integer',
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
