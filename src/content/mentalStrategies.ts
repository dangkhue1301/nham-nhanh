/**
 * Mental math strategies and explanations in Vietnamese.
 */

export function strategyMakeTen(a: number, b: number): string {
  // e.g. 8 + 7 = 8 + 2 + 5 = 15
  const needed = 10 - a;
  const rem = b - needed;
  return `Tách ${b} = ${needed} + ${rem}: ${a} + ${needed} = 10, rồi 10 + ${rem} = ${a + b}`;
}

export function strategyCompensateAdd(a: number, b: number, roundBase: number): string {
  // e.g. 398 + 247 = 400 + 247 - 2 = 645
  const diff = roundBase - a;
  return `Làm tròn ${a} lên ${roundBase} (thêm ${diff}): ${roundBase} + ${b} - ${diff} = ${a + b}`;
}

export function strategyCompensateSub(a: number, b: number, roundBase: number): string {
  // e.g. 52 - 29 = 52 - 30 + 1 = 23
  const diff = roundBase - b;
  return `Làm tròn số trừ ${b} lên ${roundBase} (thêm ${diff}): ${a} - ${roundBase} + ${diff} = ${a - b}`;
}

export function strategyCountUp(a: number, b: number): string {
  // e.g. 1000 - 675: from 675 to 700 is 25, to 1000 is 300 -> 325
  const nextHundred = Math.ceil(b / 100) * 100;
  if (nextHundred > b && nextHundred < a) {
    const step1 = nextHundred - b;
    const step2 = a - nextHundred;
    return `Đếm thêm: từ ${b} lên ${nextHundred} là ${step1}, thêm ${step2} lên ${a} ➔ hiệu là ${step1 + step2}`;
  }
  return `Đếm thêm từ ${b} lên ${a} ➔ hiệu là ${a - b}`;
}

export function strategySplitMultiply(a: number, b: number): string {
  // e.g. 23 x 4 = (20 x 4) + (3 x 4) = 80 + 12 = 92
  const tens = Math.floor(a / 10) * 10;
  const units = a % 10;
  if (units === 0) return `${a} × ${b} = ${a * b}`;
  return `Tách ${a} = ${tens} + ${units}: (${tens} × ${b}) + (${units} × ${b}) = ${tens * b} + ${units * b} = ${a * b}`;
}

export function strategyMultiply9(a: number): string {
  // a x 9 = a x 10 - a
  return `${a} × 9 = ${a} × 10 − ${a} = ${a * 10} − ${a} = ${a * 9}`;
}

export function strategyMultiply99(a: number): string {
  // a x 99 = a x 100 - a
  return `${a} × 99 = ${a} × 100 − ${a} = ${a * 100} − ${a} = ${a * 99}`;
}

export function strategyMultiply25(a: number): string {
  // a x 25 = (a / 4) x 100
  return `${a} × 25 = (${a} ÷ 4) × 100 = ${a / 4} × 100 = ${(a / 4) * 100}`;
}

export function strategyMultiply50(a: number): string {
  // a x 50 = (a / 2) x 100
  return `${a} × 50 = (${a} ÷ 2) × 100 = ${a / 2} × 100 = ${(a / 2) * 100}`;
}

export function strategySplitDivision(n: number, d: number): string {
  // 96 / 6 = (60 / 6) + (36 / 6) = 10 + 6 = 16
  const tensPart = Math.floor(n / (d * 10)) * (d * 10);
  const remPart = n - tensPart;
  if (tensPart > 0 && remPart > 0) {
    return `Tách ${n} = ${tensPart} + ${remPart}: (${tensPart} ÷ ${d}) + (${remPart} ÷ ${d}) = ${tensPart / d} + ${remPart / d} = ${n / d}`;
  }
  return `${n} ÷ ${d} = ${n / d}`;
}

export function strategyFactorPairing(a: number, b: number): string {
  // 125 x 24 = 125 x 8 x 3 = 1000 x 3 = 3000
  if (a === 125 && b % 8 === 0) {
    return `Ghép thừa số: 125 × ${b} = 125 × 8 × ${b / 8} = 1.000 × ${b / 8} = ${(b / 8) * 1000}`;
  }
  return `${a} × ${b} = ${a * b}`;
}
