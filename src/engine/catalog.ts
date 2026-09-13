import { FamilyDefinition, Topic } from './types.ts';
import { generateAdditionQuestion } from './generators/addition.ts';
import { generateSubtractionQuestion } from './generators/subtraction.ts';
import { generateMultiplicationQuestion } from './generators/multiplication.ts';
import { generateDivisionQuestion } from './generators/division.ts';
import { generateExpressionsQuestion } from './generators/expressions.ts';
import { generateMoneyQuestion } from './generators/money.ts';
import { generateTimeQuestion } from './generators/time.ts';
import { generateCalendarQuestion } from './generators/calendar.ts';

export const TOPIC_NAMES: Record<Topic, string> = {
  addition: 'Phép cộng',
  subtraction: 'Phép trừ',
  multiplication: 'Phép nhân',
  division: 'Phép chia',
  mixed: 'Trộn bốn phép',
  money: 'Tiền & mua sắm',
  time: 'Thời gian',
  calendar: 'Ngày tháng'
};

export const LEVEL_LABELS: Record<Topic, Record<number, string>> = {
  addition: {
    1: 'Level 1 · Dưới 10',
    2: 'Level 2 · Trong phạm vi 20',
    3: 'Level 3 · Trong phạm vi 100',
    4: 'Level 4 · Trong phạm vi 1.000',
    5: 'Level 5 · Nhẩm linh hoạt'
  },
  subtraction: {
    1: 'Level 1 · Dưới 10',
    2: 'Level 2 · Trong phạm vi 20',
    3: 'Level 3 · Trong phạm vi 100',
    4: 'Level 4 · Trong phạm vi 1.000',
    5: 'Level 5 · Nhẩm linh hoạt'
  },
  multiplication: {
    1: 'Level 1 · Bảng cửu chương',
    2: 'Level 2 · Nhân số tròn',
    3: 'Level 3 · 2 chữ số × 1 chữ số',
    4: 'Level 4 · 2 chữ số × 2 chữ số',
    5: 'Level 5 · Nhẩm linh hoạt'
  },
  division: {
    1: 'Level 1 · Bảng chia',
    2: 'Level 2 · Chia số tròn',
    3: 'Level 3 · Chia cho 1 chữ số',
    4: 'Level 4 · Chia cho 2 chữ số',
    5: 'Level 5 · Nhẩm linh hoạt'
  },
  mixed: {
    1: 'Level 1 · Cơ bản',
    2: 'Level 2 · Hai bước phạm vi 20',
    3: 'Level 3 · Hai bước có nhân/chia',
    4: 'Level 4 · Dấu ngoặc & ghép số',
    5: 'Level 5 · Biểu thức ba bước'
  },
  money: {
    1: 'Level 1 · Tròn nghìn & tiền thừa',
    2: 'Level 2 · Mua nhiều món cùng giá',
    3: 'Level 3 · Giỏ hàng & chia tiền',
    4: 'Level 4 · Mua tối đa & tích lũy',
    5: 'Level 5 · Giảm giá nguyên đồng'
  },
  time: {
    1: 'Level 1 · Đổi giờ-phút & cùng giờ',
    2: 'Level 2 · Đổi phút-giây & qua giờ',
    3: 'Level 3 · Giờ kết thúc & bắt đầu',
    4: 'Level 4 · Qua nửa đêm & nhiều lượt',
    5: 'Level 5 · Tính ngược giờ khởi hành'
  },
  calendar: {
    1: 'Level 1 · Thứ trước/sau vài ngày',
    2: 'Level 2 · Chu kỳ tuần & trong tháng',
    3: 'Level 3 · Qua ranh giới tháng',
    4: 'Level 4 · Qua năm & tháng 2 nhuận',
    5: 'Level 5 · Đếm ngày có cả hai đầu'
  }
};

export const CATALOG: FamilyDefinition[] = [
  // Addition (A01 - A08)
  {
    familyId: 'A01',
    name: 'Cộng dưới 10',
    topic: 'addition',
    allowedLevels: [1],
    skillTags: ['addition', 'under_10'],
    normalLimitMs: () => 10000,
    hardLimitMs: () => 4000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A01', level, seed)
  },
  {
    familyId: 'A02',
    name: 'Tìm số hạng còn thiếu',
    topic: 'addition',
    allowedLevels: [1, 2, 3],
    skillTags: ['addition', 'missing_number'],
    normalLimitMs: (lvl) => (lvl === 1 ? 10000 : 15000),
    hardLimitMs: (lvl) => (lvl === 1 ? 4000 : 6000),
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A02', level, seed)
  },
  {
    familyId: 'A03',
    name: 'Cộng qua 10 phạm vi 20',
    topic: 'addition',
    allowedLevels: [2],
    skillTags: ['addition', 'cross_10'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A03', level, seed)
  },
  {
    familyId: 'A04',
    name: 'Cộng phạm vi 100 không nhớ',
    topic: 'addition',
    allowedLevels: [3],
    skillTags: ['addition', 'within_100', 'no_carry'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A04', level, seed)
  },
  {
    familyId: 'A05',
    name: 'Cộng phạm vi 100 có nhớ',
    topic: 'addition',
    allowedLevels: [3],
    skillTags: ['addition', 'within_100', 'carry'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A05', level, seed)
  },
  {
    familyId: 'A06',
    name: 'Cộng trong phạm vi 1.000',
    topic: 'addition',
    allowedLevels: [4],
    skillTags: ['addition', 'within_1000'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A06', level, seed)
  },
  {
    familyId: 'A07',
    name: 'Cộng số nhỏ vào số lớn',
    topic: 'addition',
    allowedLevels: [5],
    skillTags: ['addition', 'large_small_addition'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A07', level, seed)
  },
  {
    familyId: 'A08',
    name: 'Cộng ghép 3 số tròn',
    topic: 'addition',
    allowedLevels: [5],
    skillTags: ['addition', 'three_numbers_grouping'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateAdditionQuestion('A08', level, seed)
  },

  // Subtraction (S01 - S08)
  {
    familyId: 'S01',
    name: 'Trừ dưới 10',
    topic: 'subtraction',
    allowedLevels: [1],
    skillTags: ['subtraction', 'under_10'],
    normalLimitMs: () => 10000,
    hardLimitMs: () => 4000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S01', level, seed)
  },
  {
    familyId: 'S02',
    name: 'Tìm số trừ còn thiếu',
    topic: 'subtraction',
    allowedLevels: [1, 2, 3],
    skillTags: ['subtraction', 'missing_number'],
    normalLimitMs: (lvl) => (lvl === 1 ? 10000 : 15000),
    hardLimitMs: (lvl) => (lvl === 1 ? 4000 : 6000),
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S02', level, seed)
  },
  {
    familyId: 'S03',
    name: 'Trừ qua 10 phạm vi 20',
    topic: 'subtraction',
    allowedLevels: [2],
    skillTags: ['subtraction', 'cross_10'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S03', level, seed)
  },
  {
    familyId: 'S04',
    name: 'Trừ phạm vi 100 không mượn',
    topic: 'subtraction',
    allowedLevels: [3],
    skillTags: ['subtraction', 'within_100', 'no_borrow'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S04', level, seed)
  },
  {
    familyId: 'S05',
    name: 'Trừ phạm vi 100 có mượn',
    topic: 'subtraction',
    allowedLevels: [3],
    skillTags: ['subtraction', 'within_100', 'borrow'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S05', level, seed)
  },
  {
    familyId: 'S06',
    name: 'Trừ qua hàng chục bằng 0',
    topic: 'subtraction',
    allowedLevels: [4],
    skillTags: ['subtraction', 'borrow_through_zero'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S06', level, seed)
  },
  {
    familyId: 'S07',
    name: 'Trừ từ mốc tròn',
    topic: 'subtraction',
    allowedLevels: [5],
    skillTags: ['subtraction', 'round_base'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S07', level, seed)
  },
  {
    familyId: 'S08',
    name: 'Đếm thêm / Bù số tìm hiệu',
    topic: 'subtraction',
    allowedLevels: [5],
    skillTags: ['subtraction', 'compensate'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateSubtractionQuestion('S08', level, seed)
  },

  // Multiplication (M01 - M10)
  {
    familyId: 'M01',
    name: 'Bảng cửu chương 2–9',
    topic: 'multiplication',
    allowedLevels: [1],
    skillTags: ['multiplication', 'times_table'],
    normalLimitMs: () => 10000,
    hardLimitMs: () => 4000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M01', level, seed, opts)
  },
  {
    familyId: 'M02',
    name: 'Nhân với 0, 1, 10',
    topic: 'multiplication',
    allowedLevels: [1],
    skillTags: ['multiplication', 'times_table_special'],
    normalLimitMs: () => 10000,
    hardLimitMs: () => 4000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M02', level, seed, opts)
  },
  {
    familyId: 'M03',
    name: 'Tìm thừa số còn thiếu',
    topic: 'multiplication',
    allowedLevels: [1, 2],
    skillTags: ['multiplication', 'missing_factor'],
    normalLimitMs: () => 10000,
    hardLimitMs: () => 4000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M03', level, seed, opts)
  },
  {
    familyId: 'M04',
    name: 'Nhân số tròn 10, 100',
    topic: 'multiplication',
    allowedLevels: [2],
    skillTags: ['multiplication', 'multiply_round'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M04', level, seed, opts)
  },
  {
    familyId: 'M05',
    name: 'Nhân 2 và nhân 5',
    topic: 'multiplication',
    allowedLevels: [2],
    skillTags: ['multiplication', 'multiply_2_5'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M05', level, seed, opts)
  },
  {
    familyId: 'M06',
    name: '2 chữ số × 1 chữ số',
    topic: 'multiplication',
    allowedLevels: [3],
    skillTags: ['multiplication', 'split_multiply'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M06', level, seed, opts)
  },
  {
    familyId: 'M07',
    name: 'Nhân với 11, 12, 15, 20',
    topic: 'multiplication',
    allowedLevels: [4],
    skillTags: ['multiplication', 'special_factors'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M07', level, seed, opts)
  },
  {
    familyId: 'M08',
    name: 'Nhân với 25 và 50',
    topic: 'multiplication',
    allowedLevels: [4],
    skillTags: ['multiplication', 'multiply_25_50'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M08', level, seed, opts)
  },
  {
    familyId: 'M09',
    name: 'Nhân gần mốc tròn (×9, ×99)',
    topic: 'multiplication',
    allowedLevels: [5],
    skillTags: ['multiplication', 'near_round'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M09', level, seed, opts)
  },
  {
    familyId: 'M10',
    name: 'Ghép thừa số (125 × 24)',
    topic: 'multiplication',
    allowedLevels: [5],
    skillTags: ['multiplication', 'factor_pairing'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateMultiplicationQuestion('M10', level, seed, opts)
  },

  // Division (D01 - D08)
  {
    familyId: 'D01',
    name: 'Bảng chia đảo',
    topic: 'division',
    allowedLevels: [1],
    skillTags: ['division', 'division_table'],
    normalLimitMs: () => 10000,
    hardLimitMs: () => 4000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D01', level, seed, opts)
  },
  {
    familyId: 'D02',
    name: 'Chia số tròn chục / trăm',
    topic: 'division',
    allowedLevels: [2],
    skillTags: ['division', 'divide_round'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D02', level, seed, opts)
  },
  {
    familyId: 'D03',
    name: 'Chia 2 chữ số cho 1 chữ số',
    topic: 'division',
    allowedLevels: [3],
    skillTags: ['division', 'divide_2digit_1digit'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D03', level, seed, opts)
  },
  {
    familyId: 'D04',
    name: 'Chia 3 chữ số cho 1 chữ số',
    topic: 'division',
    allowedLevels: [3],
    skillTags: ['division', 'divide_3digit_1digit'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D04', level, seed, opts)
  },
  {
    familyId: 'D05',
    name: 'Chia cho số 2 chữ số',
    topic: 'division',
    allowedLevels: [4],
    skillTags: ['division', 'divide_2digit_divisor'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D05', level, seed, opts)
  },
  {
    familyId: 'D06',
    name: 'Chia cho 25, 50, 125',
    topic: 'division',
    allowedLevels: [5],
    skillTags: ['division', 'divide_special_base'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D06', level, seed, opts)
  },
  {
    familyId: 'D07',
    name: 'Tìm số bị chia còn thiếu',
    topic: 'division',
    allowedLevels: [2],
    skillTags: ['division', 'missing_dividend'],
    normalLimitMs: () => 15000,
    hardLimitMs: () => 6000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D07', level, seed, opts)
  },
  {
    familyId: 'D08',
    name: 'Chia rút gọn cùng số 0',
    topic: 'division',
    allowedLevels: [5],
    skillTags: ['division', 'divide_simplify_zeros'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level, opts) => generateDivisionQuestion('D08', level, seed, opts)
  },

  // Expressions (X01 - X06)
  {
    familyId: 'X01',
    name: 'Biểu thức cộng trừ 2 bước',
    topic: 'mixed',
    allowedLevels: [2],
    skillTags: ['mixed', 'order_of_operations'],
    normalLimitMs: () => 20000,
    hardLimitMs: () => 8000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateExpressionsQuestion('X01', level, seed)
  },
  {
    familyId: 'X02',
    name: 'Biểu thức nhân và cộng/trừ',
    topic: 'mixed',
    allowedLevels: [3],
    skillTags: ['mixed', 'order_of_operations'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateExpressionsQuestion('X02', level, seed)
  },
  {
    familyId: 'X03',
    name: 'Biểu thức chia và cộng/trừ',
    topic: 'mixed',
    allowedLevels: [3],
    skillTags: ['mixed', 'order_of_operations'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateExpressionsQuestion('X03', level, seed)
  },
  {
    familyId: 'X04',
    name: 'Biểu thức có dấu ngoặc',
    topic: 'mixed',
    allowedLevels: [4],
    skillTags: ['mixed', 'parentheses'],
    normalLimitMs: () => 25000,
    hardLimitMs: () => 10000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateExpressionsQuestion('X04', level, seed)
  },
  {
    familyId: 'X05',
    name: 'Cộng 4 số ghép tròn chục',
    topic: 'mixed',
    allowedLevels: [4],
    skillTags: ['mixed', 'grouping'],
    normalLimitMs: () => 30000,
    hardLimitMs: () => 12000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateExpressionsQuestion('X05', level, seed)
  },
  {
    familyId: 'X06',
    name: 'Biểu thức ba bước tính',
    topic: 'mixed',
    allowedLevels: [5],
    skillTags: ['mixed', 'three_steps'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateExpressionsQuestion('X06', level, seed)
  },

  // Money (P01 - P10)
  {
    familyId: 'P01',
    name: 'Tổng tiền hai món',
    topic: 'money',
    allowedLevels: [1],
    skillTags: ['money', 'total'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P01', level, seed)
  },
  {
    familyId: 'P02',
    name: 'Tính tiền thừa',
    topic: 'money',
    allowedLevels: [1],
    skillTags: ['money', 'change'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P02', level, seed)
  },
  {
    familyId: 'P03',
    name: 'Mua nhiều món cùng giá',
    topic: 'money',
    allowedLevels: [2],
    skillTags: ['money', 'quantity'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P03', level, seed)
  },
  {
    familyId: 'P04',
    name: 'Giỏ hàng hai loại món',
    topic: 'money',
    allowedLevels: [3],
    skillTags: ['money', 'cart'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P04', level, seed)
  },
  {
    familyId: 'P05',
    name: 'Chia tiền đều cho người',
    topic: 'money',
    allowedLevels: [3],
    skillTags: ['money', 'split'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P05', level, seed)
  },
  {
    familyId: 'P06',
    name: 'Mua tối đa bao nhiêu món',
    topic: 'money',
    allowedLevels: [4],
    skillTags: ['money', 'max_items'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P06', level, seed)
  },
  {
    familyId: 'P07',
    name: 'Tiền còn lại sau khi mua',
    topic: 'money',
    allowedLevels: [4],
    skillTags: ['money', 'remainder'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P07', level, seed)
  },
  {
    familyId: 'P08',
    name: 'Tiết kiệm tiền theo ngày',
    topic: 'money',
    allowedLevels: [4],
    skillTags: ['money', 'savings'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P08', level, seed)
  },
  {
    familyId: 'P09',
    name: 'Giảm giá số tiền cố định',
    topic: 'money',
    allowedLevels: [5],
    skillTags: ['money', 'fixed_discount'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P09', level, seed)
  },
  {
    familyId: 'P10',
    name: 'Giảm giá theo phần trăm',
    topic: 'money',
    allowedLevels: [5],
    skillTags: ['money', 'percent_discount'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateMoneyQuestion('P10', level, seed)
  },

  // Time (T01 - T08)
  {
    familyId: 'T01',
    name: 'Đổi giờ nguyên ↔ phút',
    topic: 'time',
    allowedLevels: [1],
    skillTags: ['time', 'convert_h_m'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T01', level, seed)
  },
  {
    familyId: 'T02',
    name: 'Đổi phút nguyên ↔ giây',
    topic: 'time',
    allowedLevels: [2],
    skillTags: ['time', 'convert_m_s'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T02', level, seed)
  },
  {
    familyId: 'T03',
    name: 'Khoảng phút cùng giờ',
    topic: 'time',
    allowedLevels: [1],
    skillTags: ['time', 'same_hour'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T03', level, seed)
  },
  {
    familyId: 'T04',
    name: 'Khoảng phút qua giờ',
    topic: 'time',
    allowedLevels: [2],
    skillTags: ['time', 'cross_hour'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T04', level, seed)
  },
  {
    familyId: 'T05',
    name: 'Cộng/trừ phút tìm giờ',
    topic: 'time',
    allowedLevels: [3],
    skillTags: ['time', 'add_sub_minutes'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T05', level, seed)
  },
  {
    familyId: 'T06',
    name: 'Thời gian qua nửa đêm',
    topic: 'time',
    allowedLevels: [4],
    skillTags: ['time', 'midnight'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T06', level, seed)
  },
  {
    familyId: 'T07',
    name: 'Nhiều lượt có khoảng nghỉ',
    topic: 'time',
    allowedLevels: [4],
    skillTags: ['time', 'rounds_and_breaks'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T07', level, seed)
  },
  {
    familyId: 'T08',
    name: 'Tính ngược giờ khởi hành',
    topic: 'time',
    allowedLevels: [5],
    skillTags: ['time', 'departure'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateTimeQuestion('T08', level, seed)
  },

  // Calendar (C01 - C08)
  {
    familyId: 'C01',
    name: 'Thứ trước/sau vài ngày',
    topic: 'calendar',
    allowedLevels: [1],
    skillTags: ['calendar', 'weekday_short'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C01', level, seed)
  },
  {
    familyId: 'C02',
    name: 'Thứ theo chu kỳ tuần',
    topic: 'calendar',
    allowedLevels: [2],
    skillTags: ['calendar', 'weekday_cycle'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C02', level, seed)
  },
  {
    familyId: 'C03',
    name: 'Cộng/trừ ngày trong tháng',
    topic: 'calendar',
    allowedLevels: [1],
    skillTags: ['calendar', 'same_month'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C03', level, seed)
  },
  {
    familyId: 'C04',
    name: 'Khoảng ngày trong cùng tháng',
    topic: 'calendar',
    allowedLevels: [2],
    skillTags: ['calendar', 'days_between_same_month'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C04', level, seed)
  },
  {
    familyId: 'C05',
    name: 'Khoảng ngày qua ranh giới tháng',
    topic: 'calendar',
    allowedLevels: [3],
    skillTags: ['calendar', 'cross_month'],
    normalLimitMs: () => 40000,
    hardLimitMs: () => 15000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C05', level, seed)
  },
  {
    familyId: 'C06',
    name: 'Khoảng ngày qua năm mới',
    topic: 'calendar',
    allowedLevels: [4],
    skillTags: ['calendar', 'cross_year'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C06', level, seed)
  },
  {
    familyId: 'C07',
    name: 'Tháng 2 năm thường / nhuận',
    topic: 'calendar',
    allowedLevels: [4],
    skillTags: ['calendar', 'feb_leap'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C07', level, seed)
  },
  {
    familyId: 'C08',
    name: 'Đếm ngày tính cả hai đầu',
    topic: 'calendar',
    allowedLevels: [5],
    skillTags: ['calendar', 'inclusive_days'],
    normalLimitMs: () => 60000,
    hardLimitMs: () => 25000,
    timingProfileVersion: 1,
    generator: (seed, level) => generateCalendarQuestion('C08', level, seed)
  }
];

export const CATALOG_MAP = new Map<string, FamilyDefinition>(
  CATALOG.map((f) => [f.familyId, f])
);

export function getFamily(familyId: string): FamilyDefinition {
  const f = CATALOG_MAP.get(familyId);
  if (!f) throw new Error(`Family ${familyId} not found in catalog`);
  return f;
}

export function getFamiliesForTopicAndLevel(topic: Topic, level: number): FamilyDefinition[] {
  if (topic === 'mixed') {
    // For mixed topic, pull available families up to current level
    if (level === 1) {
      // Level 1: 1-step basic operations (A01, S01, M01, D01)
      return CATALOG.filter(f => ['A01', 'S01', 'M01', 'D01'].includes(f.familyId));
    }
    return CATALOG.filter(f => f.topic === 'mixed' && f.allowedLevels.includes(level));
  }
  return CATALOG.filter((f) => f.topic === topic && f.allowedLevels.includes(level));
}
