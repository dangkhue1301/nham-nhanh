/**
 * Safe arithmetic functions and Vietnamese number formatting.
 */

export function formatInteger(n: number): string {
  if (!Number.isSafeInteger(n)) {
    throw new Error(`Number ${n} is not a safe integer`);
  }
  return n.toLocaleString('vi-VN');
}

export function formatVND(amount: number): string {
  return `${formatInteger(amount)} đ`;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b > 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

export function getDivisors(n: number): number[] {
  if (n <= 0) return [];
  const res: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      res.push(i);
      if (i * i !== n) {
        res.push(n / i);
      }
    }
  }
  res.sort((a, b) => a - b);
  return res;
}
