import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Attempt, Question, RawAnswerValue, SessionConfiguration } from '../engine/types.ts';
import { QuestionCard } from '../components/QuestionCard.tsx';
import { AnswerInput } from '../components/AnswerInput.tsx';
import { Feedback } from '../components/Feedback.tsx';
import { scoreAttempt } from '../engine/scoreAttempt.ts';
import { LEVEL_LABELS, TOPIC_NAMES } from '../engine/catalog.ts';

interface PracticeScreenProps {
  configuration: SessionConfiguration;
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  autoAdvanceNormal: boolean;
  onAttemptCompleted: (attempt: Attempt) => void;
  onExitSession: () => void;
  onNextQuestion: () => void;
}

type PracticeState = 'answering' | 'feedback' | 'paused';

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  configuration,
  currentQuestion,
  questionIndex,
  totalQuestions,
  autoAdvanceNormal,
  onAttemptCompleted,
  onExitSession,
  onNextQuestion
}) => {
  const [screenState, setScreenState] = useState<PracticeState>('answering');
  const [hintUsed, setHintUsed] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [isInterrupted, setIsInterrupted] = useState(false);

  const startTimeRef = useRef<number>(performance.now());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedDurationRef = useRef<number>(0);
  const timeLimitMs = configuration.mode === 'hard' ? currentQuestion.hardLimitMs : currentQuestion.normalLimitMs;

  // Initialize question state
  useEffect(() => {
    setScreenState('answering');
    setHintUsed(false);
    setCurrentAttempt(null);
    setIsInterrupted(false);
    startTimeRef.current = performance.now();
    pausedAtRef.current = null;
    totalPausedDurationRef.current = 0;
    setRemainingSec(Math.ceil(timeLimitMs / 1000));
  }, [currentQuestion.id, timeLimitMs]);

  // Handle visibility changes (tab hiding / blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (configuration.mode === 'hard') {
          // Hard mode: tab switch terminates session as interrupted
          onExitSession();
        } else {
          // Normal mode: pause timer, conceal question
          if (screenState === 'answering') {
            pausedAtRef.current = performance.now();
            setScreenState('paused');
            setIsInterrupted(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [configuration.mode, screenState, onExitSession]);

  const handleResume = () => {
    if (pausedAtRef.current !== null) {
      totalPausedDurationRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setScreenState('answering');
  };

  // Process attempt completion
  const completeAttempt = useCallback(
    (action: 'submit' | 'skip' | 'timeout', submittedAnswer?: RawAnswerValue) => {
      if (screenState !== 'answering') return;

      const now = performance.now();
      const rawElapsed = now - startTimeRef.current - totalPausedDurationRef.current;
      const elapsedMs = Math.max(10, Math.round(rawElapsed));

      const attempt = scoreAttempt({
        question: currentQuestion,
        submittedAnswer,
        action,
        hintUsed,
        elapsedMs,
        mode: configuration.mode,
        sessionId: `${configuration.topic}-${configuration.level}-${Date.now()}`,
        isInterrupted
      });

      setCurrentAttempt(attempt);
      onAttemptCompleted(attempt);
      setScreenState('feedback');

      // Auto advance check:
      // Hard mode: always auto advance in 300ms
      // Normal mode: auto advance in 300ms if correct and autoAdvanceNormal is true
      const shouldAutoAdvance =
        configuration.mode === 'hard' ||
        (attempt.status === 'correct' && !hintUsed && autoAdvanceNormal);

      if (shouldAutoAdvance) {
        setTimeout(() => {
          onNextQuestion();
        }, 300);
      }
    },
    [
      screenState,
      currentQuestion,
      hintUsed,
      configuration,
      isInterrupted,
      autoAdvanceNormal,
      onAttemptCompleted,
      onNextQuestion
    ]
  );

  // Countdown timer loop
  useEffect(() => {
    if (screenState !== 'answering') return;

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current - totalPausedDurationRef.current;
      const remainingMs = timeLimitMs - elapsed;

      if (remainingMs <= 0) {
        clearInterval(interval);
        setRemainingSec(0);
        completeAttempt('timeout');
      } else {
        setRemainingSec(Math.ceil(remainingMs / 1000));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [screenState, timeLimitMs, completeAttempt]);

  const handleAnswerSubmit = (val: RawAnswerValue) => {
    completeAttempt('submit', val);
  };

  const handleSkip = () => {
    completeAttempt('skip');
  };

  const handleShowHint = () => {
    if (configuration.mode === 'hard') return;
    setHintUsed(true);
  };

  if (screenState === 'paused') {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Đang tạm dừng</h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
          Bạn vừa chuyển tab hoặc rời ứng dụng. Bấm tiếp tục để làm tiếp.
        </p>
        <button type="button" className="btn-primary" onClick={handleResume}>
          Tiếp tục làm bài
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card">
      {/* Practice Header */}
      <div className="practice-header">
        <div className="header-left">
          <button type="button" className="btn-back" onClick={onExitSession} title="Quay về">
            ←
          </button>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>
              {TOPIC_NAMES[configuration.topic]} · {LEVEL_LABELS[configuration.topic][configuration.level]}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
              <span className={`badge ${configuration.mode === 'hard' ? 'badge-hard' : 'badge-normal'}`}>
                {configuration.mode === 'hard' ? 'Hard' : 'Normal'}
              </span>
              {currentQuestion.reviewReason && (
                <span className="badge" style={{ background: '#FEF3C7', color: '#B45309' }}>
                  {currentQuestion.reviewReason === 'due'
                    ? 'Ôn đến hạn'
                    : currentQuestion.reviewReason === 'within_session'
                    ? 'Lặp lại'
                    : 'Củng cố'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Câu {questionIndex + 1}/{totalQuestions}
          </div>
          <div className={`timer-indicator ${remainingSec <= 3 ? 'timer-warning' : ''}`}>
            ⏱ Còn {remainingSec}s
          </div>
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard question={currentQuestion} />

      {/* Answer Input */}
      <AnswerInput
        key={currentQuestion.id}
        questionId={currentQuestion.id}
        answerType={currentQuestion.answerType}
        unit={currentQuestion.unit}
        disabled={screenState !== 'answering'}
        onSubmit={handleAnswerSubmit}
      />

      {/* Hint display */}
      {hintUsed && currentQuestion.hint && screenState === 'answering' && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#FEF3C7',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#92400E'
          }}
        >
          💡 <strong>Gợi ý:</strong> {currentQuestion.hint}
        </div>
      )}

      {/* Actions */}
      {screenState === 'answering' && (
        <div className="secondary-actions">
          {configuration.mode === 'normal' && !hintUsed && (
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 14px' }}
              onClick={handleShowHint}
            >
              💡 Gợi ý
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 14px', marginLeft: 'auto' }}
            onClick={handleSkip}
          >
            Bỏ qua ➔
          </button>
        </div>
      )}

      {/* Feedback Panel */}
      {screenState === 'feedback' && currentAttempt && (
        <Feedback
          status={currentAttempt.status}
          question={currentQuestion}
          hintUsed={currentAttempt.hintUsed}
          onNext={onNextQuestion}
        />
      )}
    </div>
  );
};
