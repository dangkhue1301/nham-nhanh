import { Attempt, MasteryStatus } from './types.ts';

export interface EvaluationResult {
  status: MasteryStatus;
  independentCorrectCount: number;
  totalEvaluated: number;
  accuracyPercent: number;
  medianRatio: number | null;
  canAdvance: boolean;
  recommendation: string;
}

export function evaluateAttemptsWindow(
  attempts: Attempt[],
  windowSize = 40
): EvaluationResult {
  // Filter out interrupted attempts
  const eligible = attempts.filter((a) => a.progressEligible);
  const recent = eligible.slice(-windowSize);

  if (recent.length < windowSize) {
    return {
      status: 'learning',
      independentCorrectCount: recent.filter((a) => a.status === 'correct').length,
      totalEvaluated: recent.length,
      accuracyPercent: recent.length ? Math.round((recent.filter((a) => a.status === 'correct').length / recent.length) * 100) : 0,
      medianRatio: null,
      canAdvance: false,
      recommendation: `Đang luyện tập (${recent.length}/${windowSize} câu gần nhất). Cần ít nhất 36 câu đúng để vững kiến thức.`
    };
  }

  // Count unique sessionIds to ensure at least 2 sessions
  const sessionIds = new Set(recent.map((a) => a.sessionId));
  if (sessionIds.size < 2) {
    return {
      status: 'learning',
      independentCorrectCount: recent.filter((a) => a.status === 'correct').length,
      totalEvaluated: recent.length,
      accuracyPercent: Math.round((recent.filter((a) => a.status === 'correct').length / recent.length) * 100),
      medianRatio: null,
      canAdvance: false,
      recommendation: 'Cần hoàn thành thêm ít nhất một lượt luyện tập nữa để đánh giá toàn diện.'
    };
  }

  const independentCorrect = recent.filter((a) => a.status === 'correct');
  const correctCount = independentCorrect.length;
  const accuracy = Math.round((correctCount / windowSize) * 100);

  // Calculate median of (elapsedMs / hardLimitMs) for timingEligible correct answers
  const timingEligible = independentCorrect.filter((a) => a.timingEligible && a.timeLimitMs > 0);
  let medianRatio: number | null = null;
  if (timingEligible.length >= 5) {
    const ratios = timingEligible.map((a) => a.elapsedMs / (a.timeLimitMs > 0 ? a.timeLimitMs : 10000)).sort((x, y) => x - y);
    const mid = Math.floor(ratios.length / 2);
    medianRatio = ratios.length % 2 === 0 ? (ratios[mid - 1] + ratios[mid]) / 2 : ratios[mid];
  }

  if (correctCount < 36) {
    return {
      status: 'learning',
      independentCorrectCount: correctCount,
      totalEvaluated: windowSize,
      accuracyPercent: accuracy,
      medianRatio,
      canAdvance: false,
      recommendation: `Đạt ${correctCount}/40 câu đúng độc lập (${accuracy}%). Nên luyện thêm để đạt trên 90%.`
    };
  }

  // correctCount >= 36 -> Solid!
  const isFast = medianRatio !== null && medianRatio <= 1.0;

  if (isFast) {
    return {
      status: 'fast',
      independentCorrectCount: correctCount,
      totalEvaluated: windowSize,
      accuracyPercent: accuracy,
      medianRatio,
      canAdvance: true,
      recommendation: 'Xuất sắc! Bạn đã vừa đúng vững vừa nhẩm nhanh. Hãy sẵn sàng lên Level tiếp theo!'
    };
  }

  return {
    status: 'solid',
    independentCorrectCount: correctCount,
    totalEvaluated: windowSize,
    accuracyPercent: accuracy,
    medianRatio,
    canAdvance: true,
    recommendation: 'Bạn tính rất chuẩn xác! Có thể chuyển sang Hard mode để tăng tốc độ phản xạ hoặc lên Level tiếp theo.'
  };
}

export function evaluateTableWindow(
  attempts: Attempt[],
  tableId: number
): EvaluationResult {
  const eligible = attempts.filter((a) => a.progressEligible && a.tableId === tableId);
  const recent = eligible.slice(-20);

  if (recent.length < 20) {
    return {
      status: 'learning',
      independentCorrectCount: recent.filter((a) => a.status === 'correct').length,
      totalEvaluated: recent.length,
      accuracyPercent: recent.length ? Math.round((recent.filter((a) => a.status === 'correct').length / recent.length) * 100) : 0,
      medianRatio: null,
      canAdvance: false,
      recommendation: `Đang luyện bảng ${tableId} (${recent.length}/20 câu).`
    };
  }

  const correctCount = recent.filter((a) => a.status === 'correct').length;
  const accuracy = Math.round((correctCount / 20) * 100);

  if (correctCount < 18) {
    return {
      status: 'learning',
      independentCorrectCount: correctCount,
      totalEvaluated: 20,
      accuracyPercent: accuracy,
      medianRatio: null,
      canAdvance: false,
      recommendation: `Bảng ${tableId} đúng ${correctCount}/20 câu. Hãy luyện thêm cho thật thuộc bảng này.`
    };
  }

  return {
    status: 'solid',
    independentCorrectCount: correctCount,
    totalEvaluated: 20,
    accuracyPercent: accuracy,
    medianRatio: null,
    canAdvance: true,
    recommendation: `Đã nắm vững bảng ${tableId}!`
  };
}
