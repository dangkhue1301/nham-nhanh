import { AnswerField, AnswerSpec, LearningStep, Question, QuestionSnapshot, Topic } from '../types.ts';
import { createPRNG, PRNG } from '../random.ts';
import { gcd } from '../arithmetic.ts';

export const THINKING_TOPICS = ['decomposition', 'identities', 'factoring', 'geometry'] as const;
const prefixes = { decomposition: 'N', identities: 'H', factoring: 'F', geometry: 'G' };
type ThinkingTopic = keyof typeof prefixes;
export function isThinkingTopic(topic: Topic): topic is ThinkingTopic {
  return (THINKING_TOPICS as readonly Topic[]).includes(topic);
}
const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
const term = (n: number, variable = '') => `${n < 0 ? '−' : '+'} ${Math.abs(n)}${variable}`;
const field = (label: string, type: AnswerField['type'] = 'integer'): AnswerField => ({ label, type });
function numberStep(prompt: string, answer: number, hint: string, explanation: string, type: AnswerField['type'] = 'integer'): LearningStep {
  return { prompt, answerType: type, answer, hint, explanation };
}
function blanks(labels: string[], values: number[], signed = false, unordered = false): AnswerSpec {
  return { answerType: 'blanks', answer: values, fields: labels.map(label => field(label, signed ? 'signed' : 'integer')), unordered };
}
function choice(rng: PRNG, correct: string, alternatives: string[]): AnswerSpec {
  const choices = rng.shuffle([...new Set([correct, ...alternatives])].slice(0, 4));
  return { answerType: 'choice', choices, answer: choices.indexOf(correct) };
}
function finish(topic: ThinkingTopic, level: number, seed: number, parameters: Record<string, number | string>, data: QuestionSnapshot): Question {
  const familyId = `${prefixes[topic]}0${level}`;
  return {
    ...data, id: `${familyId}-${seed}`, familyId, generatorVersion: 1, seed, topic, level,
    skillTags: [topic, familyId], parameters, semanticKey: `${familyId}:${data.prompt}`,
    memoryKey: `${familyId}:${data.prompt}`, normalLimitMs: level <= 2 ? 20000 : level <= 4 ? 40000 : 60000,
    hardLimitMs: level <= 2 ? 10000 : level <= 4 ? 20000 : 30000, timingProfileVersion: 2
  };
}

export function generateThinkingQuestion(topic: ThinkingTopic, level: number, seed: number): Question {
  const rng = createPRNG(seed);
  if (level < 1 || level > 5) throw new Error('Cấp độ tư duy phải từ 1 đến 5');
  if (topic === 'decomposition') return decomposition(level, seed, rng);
  if (topic === 'identities') return identities(level, seed, rng);
  if (topic === 'factoring') return factoring(level, seed, rng);
  return geometry(level, seed, rng);
}

function decomposition(level: number, seed: number, rng: PRNG): Question {
  if (level === 1) {
    const base = rng.pick([10, 100]);
    const a = base === 10 ? rng.nextInt(3, 9) : rng.nextInt(21, 96);
    const needed = base - a;
    const b = needed + rng.nextInt(1, base === 10 ? 8 : 49);
    const rest = b - needed;
    return finish('decomposition', level, seed, { a, b, base }, {
      prompt: `Tách ${b} để tính nhanh ${a} + ${b}: ${b} = □ + □. Ô đầu giúp ${a} đủ ${base}.`,
      ...blanks([`Bù ${a} lên ${base}`, 'Phần còn lại'], [needed, rest]),
      hint: `Tìm ${base} − ${a}, rồi lấy ${b} trừ phần vừa dùng.`,
      explanation: `${b} = ${needed} + ${rest}; ${a} + ${b} = ${base} + ${rest} = ${a + b}. Tách để tạo mốc tròn trước.`,
      steps: [numberStep(`Cần thêm bao nhiêu để ${a} đủ ${base}?`, needed, `Lấy ${base} − ${a}.`, `${base} − ${a} = ${needed}.`), numberStep(`Đã lấy ${needed} từ ${b}. Còn lại bao nhiêu?`, rest, `Lấy ${b} − ${needed}.`, `${b} − ${needed} = ${rest}.`), numberStep(`Tính ${base} + ${rest}.`, a + b, 'Cộng phần còn lại vào mốc tròn.', `${a} + ${b} = ${a + b}.`)]
    });
  }
  if (level === 2) {
    const base = rng.pick([50, 100, 200, 500]);
    const delta = rng.nextInt(1, 9);
    const a = base - delta;
    const b = rng.nextInt(12, 79);
    const correct = `${base} + ${b} − ${delta}`;
    return finish('decomposition', level, seed, { a, b, base, delta }, {
      prompt: `Chọn cách bù đúng để nhẩm ${a} + ${b}.`,
      ...choice(rng, correct, [`${base} + ${b} + ${delta}`, `${base} − ${b} − ${delta}`, `${base} + ${b} − ${delta + 1}`]),
      hint: `Đã tăng ${a} thêm ${delta} thì phải bớt lại ${delta}.`,
      explanation: `${a} + ${b} = ${correct} = ${a + b}. Làm tròn giúp cộng dễ hơn, rồi trả lại phần tăng.`,
      steps: [numberStep(`Tăng ${a} lên ${base} là tăng bao nhiêu?`, delta, 'Lấy mốc tròn trừ số ban đầu.', `${base} − ${a} = ${delta}.`), numberStep(`Tính ${base} + ${b}.`, base + b, 'Cộng với số tròn trước.', `${base} + ${b} = ${base + b}.`), numberStep('Bớt phần đã tăng. Kết quả là bao nhiêu?', a + b, `Lấy ${base + b} − ${delta}.`, `${a} + ${b} = ${a + b}.`)]
    });
  }
  if (level === 3) {
    const factor = rng.pick([25, 50, 125]);
    const partner = factor === 25 ? 4 : factor === 50 ? 2 : 8;
    const k = rng.nextInt(2, 29);
    const b = partner * k;
    return finish('decomposition', level, seed, { factor, partner, k }, {
      prompt: `Nhẩm ${factor} × ${b} bằng cách ghép thừa số. Kết quả = ?`, answerType: 'integer', answer: factor * b,
      hint: `Tách ${b} = ${partner} × ${k}. ${factor} × ${partner} là số tròn.`,
      explanation: `${factor} × ${b} = (${factor} × ${partner}) × ${k} = ${factor * partner} × ${k} = ${fmt(factor * b)}.`,
      steps: [numberStep(`${factor} nhân mấy thì được ${factor * partner}?`, partner, `Dùng cặp ${factor} và ${partner}.`, `${factor} × ${partner} = ${factor * partner}.`), numberStep(`${b} = ${partner} × □. Điền ô trống.`, k, `Lấy ${b} ÷ ${partner}.`, `${b} = ${partner} × ${k}.`), numberStep(`Tính ${factor * partner} × ${k}.`, factor * b, 'Nhân với số tròn.', `Kết quả: ${fmt(factor * b)}.`)]
    });
  }
  if (level === 4) {
    const p = rng.nextInt(1, 12) * rng.pick([-1, 1]);
    const q = rng.nextInt(1, 12) * rng.pick([-1, 1]);
    return finish('decomposition', level, seed, { p, q }, {
      prompt: `Tìm hai số có tổng ${p + q} và tích ${p * q}.`, ...blanks(['Số thứ nhất', 'Số thứ hai'], [p, q], true, true),
      hint: `Xét các cặp ước của ${Math.abs(p * q)}. Tích ${p * q < 0 ? 'âm: hai số trái dấu' : 'dương: hai số cùng dấu'}.`,
      explanation: `${p} + (${q}) = ${p + q}; ${p} × (${q}) = ${p * q}. Cặp tổng–tích giúp tách hệ số giữa của đa thức.`,
      steps: [{ prompt: 'Hai số cùng dấu hay trái dấu?', ...choice(rng, p * q < 0 ? 'Trái dấu' : 'Cùng dấu', [p * q < 0 ? 'Cùng dấu' : 'Trái dấu']), hint: 'Nhìn dấu của tích.', explanation: 'Tích âm thì trái dấu; tích dương thì cùng dấu.' }, { prompt: `Điền cặp số có tổng ${p + q}, tích ${p * q}.`, ...blanks(['Số thứ nhất', 'Số thứ hai'], [p, q], true, true), hint: 'Thử cặp ước và kiểm tra tổng.', explanation: `Một thứ tự đúng: ${p}, ${q}.` }]
    });
  }
  const base = rng.pick([20, 30, 50, 100]);
  const d = rng.nextInt(1, 9);
  const a = base - d, b = base + d;
  return finish('decomposition', level, seed, { base, d }, {
    prompt: `Nhẩm ${a} × ${b} bằng hiệu hai bình phương.`, answerType: 'integer', answer: base * base - d * d,
    hint: `Hai số nằm hai bên ${base}: (${base} − ${d})(${base} + ${d}).`,
    explanation: `${a} × ${b} = ${base}² − ${d}² = ${base * base} − ${d * d} = ${a * b}.`,
    steps: [numberStep('Mốc ở chính giữa hai số là bao nhiêu?', base, `Lấy (${a} + ${b}) ÷ 2.`, `Mốc giữa là ${base}.`), numberStep('Mỗi số cách mốc giữa bao nhiêu?', d, `Lấy ${b} − ${base}.`, `Khoảng cách là ${d}.`), numberStep(`Tính ${base}² − ${d}².`, a * b, 'Bình phương mốc rồi trừ bình phương khoảng cách.', `${a * b}.`)]
  });
}

function identities(level: number, seed: number, rng: PRNG): Question {
  const a = rng.nextInt(1, 8), b = rng.nextInt(1, 9);
  const negative = level === 2 || ((level === 4 || level === 5) && rng.pick([true, false]));
  const sign = negative ? '−' : '+';
  const signedB = negative ? -b : b;
  if (level <= 2) {
    const coefficients = [a * a, 2 * a * signedB, b * b];
    const expanded = `${a * a}x² ${term(2 * a * signedB, 'x')} + ${b * b}`;
    const useChoice = rng.pick([true, false]);
    return finish('identities', level, seed, { a, b, negative: String(negative), format: useChoice ? 'choice' : 'blanks' }, {
      prompt: useChoice ? `Khai triển (${a}x ${sign} ${b})².` : `(${a}x ${sign} ${b})² = Ax² + Bx + C. Điền A, B, C (có dấu).`,
      ...(useChoice ? choice(rng, expanded, [`${a * a}x² ${term(a * signedB, 'x')} + ${b * b}`, `${a * a}x² ${term(-2 * a * signedB, 'x')} + ${b * b}`, `${a * a}x² ${term(2 * a * signedB, 'x')} − ${b * b}`]) : blanks(['A · hệ số x²', 'B · hệ số x', 'C · hằng số'], coefficients, true)),
      hint: `(A ${sign} B)² = A² ${sign} 2AB + B². Đừng quên số 2 ở hạng giữa.`,
      explanation: `(${a}x ${sign} ${b})² = ${expanded}. Hạng giữa là ${negative ? '−' : ''}2 × ${a} × ${b} × x.`,
      steps: [numberStep(`Hệ số của x²: ${a}² = ?`, a * a, 'Bình phương cả hệ số.', `${a}² = ${a * a}.`), numberStep(`Hệ số của x: ${negative ? '−' : ''}2 × ${a} × ${b} = ?`, 2 * a * signedB, 'Nhân đủ 2, hệ số x và hằng số; giữ dấu.', `${2 * a * signedB}.`, 'signed'), numberStep(`Hằng số: ${b}² = ?`, b * b, 'Bình phương số cuối.', `${b}² = ${b * b}.`)]
    });
  }
  if (level === 3) {
    const value = a * a - b * b;
    return finish('identities', level, seed, { a, b }, {
      prompt: `Chọn phân tích đúng của ${a * a}x² − ${b * b}.`,
      ...choice(rng, `(${a}x − ${b})(${a}x + ${b})`, [`(${a}x − ${b})²`, `(${a}x + ${b})²`, `(${a}x − ${b})(${a}x + ${b + 1})`]),
      hint: 'A² − B² = (A − B)(A + B).', explanation: `${a * a}x² − ${b * b} = (${a}x − ${b})(${a}x + ${b}). Một ngoặc trừ, một ngoặc cộng.`,
      steps: [numberStep(`Căn của hệ số ${a * a} là bao nhiêu?`, a, 'Tìm số bình phương lên được hệ số đầu.', `${a}² = ${a * a}.`), numberStep(`Căn của ${b * b} là bao nhiêu?`, b, 'Tìm số bình phương lên được hằng số.', `${b}² = ${b * b}.`), numberStep('Thay x = 1 để kiểm tra: giá trị biểu thức là bao nhiêu?', value, `Tính ${a * a} − ${b * b}.`, `${value}.`, 'signed')]
    });
  }
  if (level === 4) {
    const coefficients = [a ** 3, 3 * a * a * signedB, 3 * a * b * b, signedB ** 3];
    return finish('identities', level, seed, { a, b, negative: String(negative) }, {
      prompt: `(${a}x ${sign} ${b})³ = Ax³ + Bx² + Cx + D. Điền hệ số có dấu.`, ...blanks(['A · x³', 'B · x²', 'C · x', 'D · hằng số'], coefficients, true),
      hint: `(A ${sign} B)³ = A³ ${sign} 3A²B + 3AB² ${sign} B³.`,
      explanation: `Hệ số lần lượt: ${coefficients.join(', ')}. Bình phương số âm vẫn dương; lập phương giữ dấu âm.`,
      steps: [numberStep(`Tính ${a}³.`, coefficients[0], 'Nhân ba thừa số bằng nhau.', `${a}³ = ${coefficients[0]}.`), numberStep(`Tính ${negative ? '−' : ''}3 × ${a}² × ${b}.`, coefficients[1], 'Hệ số 3 và bình phương số đầu.', `${coefficients[1]}.`, 'signed'), numberStep(`Tính 3 × ${a} × ${b}².`, coefficients[2], 'Bình phương số cuối nên hạng này dương.', `${coefficients[2]}.`), numberStep(`Tính (${signedB})³.`, coefficients[3], 'Lập phương giữ dấu của số.', `${coefficients[3]}.`, 'signed')]
    });
  }
  const correct = `(${a}x ${sign} ${b})(${a * a}x² ${term(-a * signedB, 'x')} + ${b * b})`;
  return finish('identities', level, seed, { a, b, negative: String(negative) }, {
    prompt: `Phân tích ${a ** 3}x³ ${term(signedB ** 3)}.`,
    ...choice(rng, correct, [`(${a}x ${sign} ${b})³`, `(${a}x ${sign} ${b})(${a * a}x² ${term(a * signedB, 'x')} + ${b * b})`, `(${a}x ${negative ? '+' : '−'} ${b})(${a * a}x² ${term(-a * signedB, 'x')} + ${b * b})`]),
    hint: `A³ ${sign} B³ = (A ${sign} B)(A² ${negative ? '+' : '−'} AB + B²).`, explanation: `${a ** 3}x³ ${term(signedB ** 3)} = ${correct}. Dấu ở hạng AB của ngoặc sau ngược với dấu trong ngoặc đầu.`,
    steps: [numberStep(`Tìm số có lập phương bằng ${a ** 3}.`, a, 'Tìm căn bậc ba của hệ số đầu.', `${a}³ = ${a ** 3}.`), numberStep('Hệ số của x trong ngoặc bậc hai là bao nhiêu?', -a * signedB, `Tính ${negative ? '' : '−'}${a} × ${b}.`, `${-a * signedB}.`, 'signed'), numberStep('Hằng số trong ngoặc bậc hai là bao nhiêu?', b * b, `Lấy ${b}².`, `${b * b}.`)]
  });
}

function factoring(level: number, seed: number, rng: PRNG): Question {
  if (level === 1) {
    const g = rng.nextInt(2, 12), p = rng.nextInt(2, 9);
    let q = rng.nextInt(2, 11);
    while (gcd(p, q) !== 1) q = q === 11 ? 2 : q + 1;
    return finish('factoring', level, seed, { g, p, q }, {
      prompt: `${g * p}x + ${g * q} = A(Bx + C). Điền A là nhân tử chung lớn nhất.`, ...blanks(['A · nhân tử chung', 'B · hệ số còn lại', 'C · số còn lại'], [g, p, q]),
      hint: 'Tìm ước chung lớn nhất của hai hệ số, rồi chia từng hệ số cho nó.', explanation: `${g * p}x + ${g * q} = ${g}(${p}x + ${q}). Đặt ${g} ra ngoài vì cả hai hạng tử đều chia hết cho ${g}.`,
      steps: [numberStep(`Ước chung lớn nhất của ${g * p} và ${g * q} là bao nhiêu?`, g, 'Xét các ước chung của hai số.', `ƯCLN = ${g}.`), numberStep(`${g * p} ÷ ${g} = ?`, p, 'Chia hệ số đầu cho nhân tử chung.', `${p}.`), numberStep(`${g * q} ÷ ${g} = ?`, q, 'Chia cả hạng tử cuối cho nhân tử chung.', `${q}.`)]
    });
  }
  if (level === 2) {
    const a = rng.nextInt(2, 15);
    const variant = rng.pick(['difference', 'square']);
    const sign = rng.pick([-1, 1]);
    return finish('factoring', level, seed, { a, variant, sign }, {
      prompt: variant === 'difference' ? `x² − ${a * a} = (x − p)(x + p). Điền p dương.` : `x² ${term(2 * sign * a, 'x')} + ${a * a} = (x + p)². Điền p có dấu.`,
      answerType: 'signed', answer: variant === 'difference' ? a : sign * a,
      hint: variant === 'difference' ? 'Nhận ra hiệu hai bình phương.' : 'Hạng giữa phải là 2px; dấu của p theo hạng giữa.',
      explanation: variant === 'difference' ? `x² − ${a * a} = (x − ${a})(x + ${a}).` : `x² ${term(2 * sign * a, 'x')} + ${a * a} = (x ${term(sign * a)})².`,
      steps: [numberStep(`Số dương nào bình phương bằng ${a * a}?`, a, 'Tìm căn bậc hai.', `${a}² = ${a * a}.`), numberStep('Điền p trong dạng phân tích của đề.', variant === 'difference' ? a : sign * a, 'Kiểm tra dấu của hạng giữa hoặc dạng hiệu hai bình phương.', `p = ${variant === 'difference' ? a : sign * a}.`, 'signed')]
    });
  }
  const p = rng.nextInt(1, 9) * (level >= 4 ? rng.pick([-1, 1]) : 1);
  const q = rng.nextInt(1, 9) * (level >= 4 ? rng.pick([-1, 1]) : 1);
  const g = level === 5 ? rng.nextInt(2, 9) : 1;
  const poly = level === 3 ? `x² + ${p}x + ${q}x + ${p * q}` : `${g === 1 ? '' : g}x² ${term(g * (p + q), 'x')} ${term(g * p * q)}`;
  return finish('factoring', level, seed, { p, q, g }, {
    prompt: `${poly} = ${g === 1 ? '' : `${g}`}(x + p)(x + q). Điền p, q có dấu.`, ...blanks(['p', 'q'], [p, q], true, true),
    hint: level === 3 ? `Nhóm x² + ${p}x và ${q}x + ${p * q}; tìm ngoặc chung.` : `${g > 1 ? `Đặt ${g} ra ngoài trước. ` : ''}Tìm hai số có tổng ${p + q}, tích ${p * q}.`,
    explanation: level === 3 ? `x(x + ${p}) + ${q}(x + ${p}) = (x + ${p})(x + ${q}). Hai nhóm có chung ngoặc (x + ${p}).` : `${g > 1 ? `Đặt ${g} ra ngoài. ` : ''}${p} + (${q}) = ${p + q}, ${p} × (${q}) = ${p * q}, nên kết quả là ${g === 1 ? '' : g}(x ${term(p)})(x ${term(q)}).`,
    steps: [numberStep(level === 3 ? 'Ngoặc chung có hằng số nào?' : 'Sau khi đặt nhân tử chung, hệ số của x là bao nhiêu?', level === 3 ? p : p + q, level === 3 ? `Nhóm đầu là x(x + ${p}).` : `Lấy ${g * (p + q)} ÷ ${g}.`, `${level === 3 ? p : p + q}.`, 'signed'), numberStep('Hai số trong ngoặc cần có tích bao nhiêu?', p * q, `Hằng số sau khi đặt ${g} ra ngoài là ${p * q}.`, `${p * q}.`, 'signed'), { prompt: 'Điền p, q để hoàn tất phân tích.', ...blanks(['p', 'q'], [p, q], true, true), hint: `Kiểm tra tổng ${p + q} và tích ${p * q}.`, explanation: `p, q có thể là ${p}, ${q} hoặc đảo thứ tự.` }]
  });
}

function geometry(level: number, seed: number, rng: PRNG): Question {
  const a = rng.nextInt(3, 25), b = rng.nextInt(3, 19);
  let kind: NonNullable<Question['diagram']>['kind'] = 'rectangle';
  let dimensions: Record<string, number> = { width: a, height: b };
  let prompt = '', formula = '', area = 0;
  let steps: LearningStep[] = [];
  let unit = 'cm²';
  if (level === 1) {
    kind = rng.pick(['square', 'rectangle']);
    dimensions = { width: a, height: kind === 'square' ? a : b };
    area = a * dimensions.height;
    prompt = kind === 'square' ? `Hình vuông cạnh ${a} cm. Diện tích bằng bao nhiêu?` : `Hình chữ nhật dài ${a} cm, rộng ${b} cm. Tính diện tích.`;
    formula = kind === 'square' ? `S = cạnh × cạnh = ${a} × ${a}` : `S = dài × rộng = ${a} × ${b}`;
    steps = [{ prompt: 'Chọn công thức diện tích.', ...choice(rng, 'Nhân hai kích thước', ['Cộng hai kích thước', 'Nhân tổng hai kích thước với 2', 'Lấy kích thước lớn trừ kích thước nhỏ']), hint: 'Diện tích đếm số ô vuông phủ kín hình.', explanation: 'Hình chữ nhật lấy dài × rộng; hình vuông lấy cạnh × cạnh.' }, numberStep('Tính diện tích theo công thức vừa chọn.', area, formula, `${fmt(area)} cm².`)];
  } else if (level === 2) {
    kind = 'triangle'; dimensions = { base: a, height: b }; area = a * b / 2;
    prompt = `Tam giác có đáy ${a} cm, chiều cao vuông góc ${b} cm. Tính diện tích.`;
    formula = `S = đáy × chiều cao ÷ 2 = ${a} × ${b} ÷ 2`;
    steps = [numberStep(`Tính ${a} × ${b}.`, a * b, 'Nhân đáy với chiều cao trước.', `${a * b}.`), numberStep('Lấy một nửa kết quả để được diện tích.', area, `Lấy ${a * b} ÷ 2.`, `${fmt(area)} cm².`, 'decimal')];
  } else if (level === 3) {
    kind = rng.pick(['parallelogram', 'rhombus', 'trapezoid']);
    const c = rng.nextInt(2, a - 1);
    if (kind === 'parallelogram') {
      dimensions = { base: a, height: b }; area = a * b;
      prompt = `Hình bình hành có đáy ${a} cm, chiều cao ${b} cm. Tính diện tích.`; formula = `S = đáy × chiều cao = ${a} × ${b}`;
      steps = [numberStep('Nhân đáy với chiều cao vuông góc.', area, 'Không dùng cạnh nghiêng làm chiều cao.', `${fmt(area)} cm².`)];
    } else if (kind === 'rhombus') {
      dimensions = { d1: a, d2: b }; area = a * b / 2;
      prompt = `Hình thoi có hai đường chéo ${a} cm và ${b} cm. Tính diện tích.`; formula = `S = hai đường chéo nhân nhau ÷ 2 = ${a} × ${b} ÷ 2`;
      steps = [numberStep('Tích hai đường chéo là bao nhiêu?', a * b, 'Nhân hai đường chéo.', `${a * b}.`), numberStep('Lấy một nửa tích để được diện tích.', area, 'Chia tích cho 2.', `${fmt(area)} cm².`, 'decimal')];
    } else {
      dimensions = { base: a, top: c, height: b }; area = (a + c) * b / 2;
      prompt = `Hình thang có hai đáy ${a} cm và ${c} cm, chiều cao ${b} cm. Tính diện tích.`; formula = `S = (${a} + ${c}) × ${b} ÷ 2`;
      steps = [numberStep('Tổng hai đáy là bao nhiêu?', a + c, 'Cộng hai cạnh song song.', `${a + c}.`), numberStep('Nhân tổng hai đáy với chiều cao rồi chia 2.', area, formula, `${fmt(area)} cm².`, 'decimal')];
    }
  } else if (level === 4) {
    if (rng.pick([true, false])) {
      kind = 'circle'; const r = rng.nextInt(2, 15); dimensions = { radius: r }; area = Math.round(314 * r * r) / 100;
      prompt = `Hình tròn bán kính ${r} cm. Lấy π = 3,14. Tính diện tích.`; formula = `S = π × r² = 3,14 × ${r}²`;
      steps = [numberStep(`Bình phương bán kính ${r} cm.`, r * r, 'r² = r × r.', `${r * r}.`), numberStep('Nhân kết quả với 3,14.', area, formula, `${fmt(area)} cm².`, 'decimal')];
    } else {
      dimensions = { width: a, height: b }; area = a * b / 10000; unit = 'm²';
      prompt = `Hình chữ nhật dài ${a} cm, rộng ${b} cm. Diện tích bằng bao nhiêu m²?`;
      formula = `S = ${a} × ${b} = ${a * b} cm²; 1 m² = 10.000 cm²`;
      steps = [numberStep('Tính diện tích theo cm².', a * b, 'Nhân dài với rộng.', `${a * b} cm².`), numberStep('Đổi sang m².', area, 'Chia diện tích cm² cho 10.000.', `${area.toLocaleString('vi-VN', { maximumFractionDigits: 4 })} m².`, 'decimal')];
    }
  } else {
    kind = 'composite'; const cutW = rng.nextInt(1, a - 1), cutH = rng.nextInt(1, b - 1);
    dimensions = { width: a, height: b, cutWidth: cutW, cutHeight: cutH }; area = a * b - cutW * cutH;
    prompt = `Từ hình chữ nhật ${a} × ${b} cm, cắt bỏ góc ${cutW} × ${cutH} cm. Diện tích phần tô màu còn lại là bao nhiêu?`;
    formula = `S = diện tích lớn − phần cắt = ${a} × ${b} − ${cutW} × ${cutH}`;
    steps = [numberStep('Diện tích hình chữ nhật ban đầu?', a * b, 'Nhân kích thước ngoài.', `${a * b} cm².`), numberStep('Diện tích phần bị cắt?', cutW * cutH, 'Nhân hai kích thước phần cắt.', `${cutW * cutH} cm².`), numberStep('Diện tích phần còn lại?', area, 'Lấy diện tích lớn trừ phần cắt.', `${area} cm².`)];
  }
  return finish('geometry', level, seed, { kind, ...dimensions, unit }, {
    prompt, answerType: 'decimal', answer: area, unit,
    hint: formula, explanation: `${formula}. Kết quả: ${area.toLocaleString('vi-VN', { maximumFractionDigits: 4 })} ${unit}.`,
    steps, diagram: { kind, dimensions, unit: 'cm' }
  });
}
