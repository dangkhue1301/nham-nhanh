import React, { useState } from 'react';
import { Attempt, SessionSummary } from '../engine/types.ts';
import { LEVEL_LABELS, TOPIC_NAMES } from '../engine/catalog.ts';

interface ResultsScreenProps {
  summary: SessionSummary;
  attempts: Attempt[];
  onContinuePractice: () => void;
  onReviewMistakes?: () => void;
  onHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  summary,
  attempts,
  onContinuePractice,
  onReviewMistakes,
  onHome
}) => {
  const [isReviewListExpanded, setIsReviewListExpanded] = useState(false);

  const { scoredCount, independentCorrectCount, medianCorrectMs, configuration } = summary;
  const accuracy = scoredCount > 0 ? Math.round((independentCorrectCount / scoredCount) * 100) : 0;

  // Find incorrect, timeout, or assisted attempts for review
  const mistakeAttempts = attempts.filter((a) => a.status !== 'correct');

  // Generate targeted advice based on mistakes
  let advice = '';
  if (mistakeAttempts.length === 0) {
    advice = 'Tuyệt vời! Bạn không sai câu nào trong lượt này.';
  } else {
    // Check if mistakes concentrated in a specific table or family
    const tableMistakes = mistakeAttempts.filter((a) => a.tableId !== undefined);
    if (tableMistakes.length >= 2) {
      advice = `Bạn hay nhầm bảng ${tableMistakes[0].tableId}. Hãy luyện thêm bảng này!`;
    } else if (mistakeAttempts.some((a) => a.familyId.startsWith('S03') || a.familyId.startsWith('S05'))) {
      advice = 'Nên luyện thêm kỹ năng trừ qua chục và có mượn.';
    } else if (mistakeAttempts.some((a) => a.familyId.startsWith('A03') || a.familyId.startsWith('A05'))) {
      advice = 'Nên luyện thêm kỹ năng cộng có nhớ và ghép đủ 10.';
    } else {
      advice = `Có ${mistakeAttempts.length} câu cần củng cố lại. Hệ thống đã lên lịch ôn tập cho bạn.`;
    }
  }

  const formatSec = (ms: number) => (ms / 1000).toFixed(1) + 's';

  return (
    <div className="glass-card">
      <div className="results-summary">
        <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          Kết quả: {TOPIC_NAMES[configuration.topic]} · {LEVEL_LABELS[configuration.topic][configuration.level]}
        </div>
        <div className="score-display">
          {independentCorrectCount}/{scoredCount}
        </div>
        <div className="score-label">Đúng độc lập ({accuracy}%)</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">
            {medianCorrectMs !== null ? formatSec(medianCorrectMs) : '--'}
          </div>
          <div className="stat-caption">
            {medianCorrectMs !== null ? 'Tốc độ điển hình' : 'Chưa đủ câu'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: mistakeAttempts.length > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {mistakeAttempts.length} câu
          </div>
          <div className="stat-caption">Cần ôn lại</div>
        </div>
      </div>

      {advice && <div className="advice-card">💡 {advice}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button type="button" className="btn-primary" onClick={onContinuePractice}>
          Luyện tiếp 20 câu
        </button>

        {mistakeAttempts.length > 0 && onReviewMistakes && (
          <button type="button" className="btn-secondary" onClick={onReviewMistakes}>
            Ôn câu sai ({mistakeAttempts.length} câu)
          </button>
        )}

        <button type="button" className="btn-secondary" onClick={onHome}>
          Về trang chủ
        </button>
      </div>

      {/* Review list accordion */}
      {mistakeAttempts.length > 0 && (
        <div className="collapsible-section">
          <button
            type="button"
            className="collapsible-trigger"
            onClick={() => setIsReviewListExpanded(!isReviewListExpanded)}
          >
            <span>Danh sách câu cần ôn ({mistakeAttempts.length})</span>
            <span>{isReviewListExpanded ? '▲' : '▼'}</span>
          </button>

          {isReviewListExpanded && (
            <div className="collapsible-content">
              <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                {mistakeAttempts.map((att, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>
                    <strong>{att.questionSnapshot.prompt}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Đáp án: {String(att.questionSnapshot.answer)} {att.questionSnapshot.unit || ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
