import React from 'react';
import { AttemptStatus, Question } from '../engine/types.ts';
import { formatExpectedAnswer } from '../engine/normalizeAnswer.ts';

interface FeedbackProps {
  status: AttemptStatus;
  question: Question;
  hintUsed: boolean;
  onNext: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({
  status,
  question,
  hintUsed,
  onNext
}) => {
  const isCorrect = status === 'correct';
  const isAssisted = status === 'assisted';
  const isTimeout = status === 'timeout';
  const isSkipped = status === 'skipped';

  const expectedFormatted = formatExpectedAnswer(
    question.answerType,
    question.answer,
    question.unit
  );

  return (
    <div
      className={`feedback-box ${
        isCorrect || isAssisted ? 'feedback-success' : 'feedback-error'
      }`}
    >
      <div className="feedback-title">
        {isCorrect && '✓ Đúng rồi! Tuyệt vời.'}
        {isAssisted && '✓ Đúng sau khi xem gợi ý.'}
        {isTimeout && `⏱ Hết giờ! Đáp án là: ${expectedFormatted}`}
        {isSkipped && `↷ Đã bỏ qua. Đáp án là: ${expectedFormatted}`}
        {!isCorrect && !isAssisted && !isTimeout && !isSkipped && `✗ Chưa đúng. Đáp án là: ${expectedFormatted}`}
      </div>

      {question.explanation && (
        <div className="feedback-explanation">
          <strong>Cách nhẩm:</strong> {question.explanation}
        </div>
      )}

      {(!isCorrect || hintUsed) && (
        <div style={{ marginTop: '14px', textAlign: 'right' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ width: 'auto', display: 'inline-flex', padding: '8px 20px' }}
            onClick={onNext}
            autoFocus
          >
            Câu tiếp ➔
          </button>
        </div>
      )}
    </div>
  );
};
