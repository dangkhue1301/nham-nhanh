import React from 'react';
import { AttemptStatus, Question } from '../engine/types.ts';
import { formatAnswer } from '../engine/normalizeAnswer.ts';

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

  const expectedFormatted = formatAnswer(question);

  return (
    <div
      role="status"
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
          <strong>Cách làm:</strong> {question.explanation}
        </div>
      )}

        <div className="feedback-next">
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            autoFocus={!isCorrect || hintUsed}
          >
            Câu tiếp ➔
          </button>
        </div>
    </div>
  );
};
