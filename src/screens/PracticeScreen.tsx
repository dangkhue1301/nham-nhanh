import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Attempt, Question, RawAnswerValue, SessionConfiguration } from '../engine/types.ts';
import { QuestionCard } from '../components/QuestionCard.tsx';
import { AnswerInput } from '../components/AnswerInput.tsx';
import { Feedback } from '../components/Feedback.tsx';
import { scoreAttempt } from '../engine/scoreAttempt.ts';
import { areAnswersEqual, formatAnswer } from '../engine/normalizeAnswer.ts';
import { LEVEL_LABELS, TOPIC_NAMES } from '../engine/catalog.ts';

interface PracticeScreenProps {
  sessionId: string; configuration: SessionConfiguration; currentQuestion: Question;
  questionIndex: number; totalQuestions: number; autoAdvanceNormal: boolean;
  onAttemptCompleted: (attempt: Attempt) => void; onExitSession: () => void; onNextQuestion: () => void;
}
export const PracticeScreen: React.FC<PracticeScreenProps> = ({ sessionId, configuration, currentQuestion: question, questionIndex, totalQuestions, autoAdvanceNormal, onAttemptCompleted, onExitSession, onNextQuestion }) => {
  const learning = configuration.mode === 'learn';
  const timeLimit = learning ? 0 : configuration.mode === 'hard' ? question.hardLimitMs : question.normalLimitMs;
  const [state, setState] = useState<'answering' | 'feedback' | 'paused'>('answering');
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [remaining, setRemaining] = useState(timeLimit);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepFeedback, setStepFeedback] = useState(false);
  const [stepError, setStepError] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const started = useRef(performance.now());
  const paused = useRef<number | null>(null);
  const pausedDuration = useRef(0);
  const interrupted = useRef(false);
  const assisted = useRef(false);
  const completed = useRef(false);
  const advancing = useRef(false);
  const stepLocked = useRef(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const steps = question.steps || [];
  const spec = learning && steps.length ? steps[stepIndex] : question;
  const completedCount = questionIndex + (state === 'feedback' ? 1 : 0);
  const timerRatio = timeLimit ? Math.min(1, Math.max(0, remaining / timeLimit)) : 0;

  useEffect(() => {
    setState('answering'); setAttempt(null); setRemaining(timeLimit); setStepIndex(0); setStepFeedback(false); setStepError(''); setHintLevel(0);
    started.current = performance.now(); paused.current = null; pausedDuration.current = 0;
    interrupted.current = false; assisted.current = false; completed.current = false; advancing.current = false; stepLocked.current = false;
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [question.id, timeLimit]);

  const next = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    onNextQuestion();
  }, [onNextQuestion]);

  const finish = useCallback((action: 'submit' | 'skip' | 'timeout', value?: RawAnswerValue) => {
    if (completed.current || state !== 'answering') return;
    completed.current = true;
    const elapsedMs = Math.max(1, Math.round(performance.now() - started.current - pausedDuration.current));
    const scored = scoreAttempt({ question, submittedAnswer: value, action, hintUsed: assisted.current, elapsedMs, mode: configuration.mode, selectedTopic: configuration.topic, sessionId, isInterrupted: interrupted.current });
    setAttempt(scored); setState('feedback'); onAttemptCompleted(scored);
  }, [state, question, configuration.mode, configuration.topic, sessionId, onAttemptCompleted]);

  useEffect(() => {
    if (state !== 'answering' || learning) return;
    const tick = () => {
      const left = timeLimit - (performance.now() - started.current - pausedDuration.current);
      setRemaining(Math.max(0, left));
      if (left <= 0) finish('timeout');
    };
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [state, learning, timeLimit, finish]);

  useEffect(() => {
    if (state !== 'feedback' || attempt?.status !== 'correct' || learning || (configuration.mode === 'normal' && !autoAdvanceNormal)) return;
    autoTimer.current = setTimeout(next, 300);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [state, attempt, learning, configuration.mode, autoAdvanceNormal, next]);

  useEffect(() => {
    const visibility = () => {
      if (!document.hidden) return;
      if (configuration.mode === 'hard') { onExitSession(); return; }
      if (state === 'answering' && paused.current === null) {
        paused.current = performance.now(); interrupted.current = true; setState('paused');
      }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [configuration.mode, state, onExitSession]);

  const submit = (value: RawAnswerValue) => {
    if (completed.current || stepLocked.current || state !== 'answering') return;
    if (!learning || !steps.length) { finish('submit', value); return; }
    if (!areAnswersEqual(spec.answerType, value, spec.answer, spec.unordered)) {
      assisted.current = true; setStepError('Chưa đúng. Kiểm tra lại dấu, phép tính hoặc dùng gợi ý.'); return;
    }
    setStepError(''); stepLocked.current = true;
    if (stepIndex === steps.length - 1) finish('submit', question.answer);
    else setStepFeedback(true);
  };
  const showHint = () => { assisted.current = true; setHintLevel(prev => Math.min(prev + 1, 2)); };
  const resume = () => {
    if (paused.current !== null) { pausedDuration.current += performance.now() - paused.current; paused.current = null; }
    setState('answering');
  };
  if (state === 'paused') return <section className="glass-card practice-card pause-screen">
    <span className="eyebrow">Lượt luyện đã tạm dừng</span><h1>Tiếp tục khi bạn sẵn sàng</h1>
    <p className="muted">Các câu đã làm vẫn được lưu. Câu này không dùng để đánh giá tốc độ vì đã có gián đoạn.</p>
    <button className="btn-primary" onClick={resume}>Tiếp tục làm bài</button><button className="btn-text" onClick={onExitSession}>Về trang chủ</button>
  </section>;

  return <section className="glass-card practice-card">
    <div className="practice-toolbar">
      <header className="practice-header">
        <button className="btn-back practice-back" onClick={onExitSession} aria-label="Kết thúc lượt và về trang chủ"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg></button>
        <div className="practice-heading"><h1>{TOPIC_NAMES[configuration.topic]}</h1><p className="practice-level">{LEVEL_LABELS[configuration.topic][question.level].replace('Level', 'Mức')}</p></div>
      </header>
      <div className="practice-status-row">
        <div className="practice-status-text"><strong className="question-counter">Câu {questionIndex + 1}/{totalQuestions}</strong>{!learning && <span className="practice-mode">{configuration.mode === 'hard' ? 'Tốc độ cao' : 'Luyện nhẩm'}</span>}</div>
        {learning ? <span className="practice-untimed">Học từng bước</span> : <div className={`timer-row ${remaining <= 3000 && state === 'answering' ? 'timer-warning' : ''} ${state === 'feedback' ? 'timer-finished' : ''}`} role="timer" aria-live="off" aria-label={state === 'feedback' ? 'Đã trả lời câu này' : `Còn ${Math.ceil(remaining / 1000)} giây`}>
          <svg className="timer-ring" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle className="timer-ring-track" cx="12" cy="12" r="10" /><circle className="timer-ring-fill" cx="12" cy="12" r="10" strokeDasharray="62.832" strokeDashoffset={62.832 * (1 - timerRatio)} /><path d="M12 7v5l3 2" /></svg>
          <span>{state === 'feedback' ? 'Đã trả lời' : <><span className="timer-label">Còn </span><strong>{Math.ceil(remaining / 1000)}s</strong></>}</span>
        </div>}
      </div>
      <div className="session-track" role="progressbar" aria-label="Tiến độ lượt luyện" aria-valuemin={0} aria-valuemax={totalQuestions} aria-valuenow={completedCount} aria-valuetext={`${completedCount}/${totalQuestions} câu đã làm`} style={{ gridTemplateColumns: `repeat(${totalQuestions}, minmax(0, 1fr))` }}>{Array.from({ length: totalQuestions }, (_, i) => <span key={i} className={i < completedCount ? 'is-complete' : i === questionIndex ? 'is-current' : undefined} />)}</div>
    </div>
    <QuestionCard question={question} />
    {learning && state === 'answering' && <div className="learning-step"><span className="eyebrow">Bước {stepIndex + 1}/{steps.length}</span><h2>{spec.prompt}</h2></div>}
    <AnswerInput key={`${question.id}:${stepIndex}`} questionId={`${question.id}:${stepIndex}`} spec={spec} disabled={state !== 'answering' || stepFeedback} onSubmit={submit} submitLabel={learning ? 'Kiểm tra bước này' : 'Trả lời'} />
    {state === 'answering' && <div className="secondary-actions">
      {configuration.mode !== 'hard' && !stepFeedback && <button className="btn-secondary" onClick={showHint} disabled={hintLevel === 2}>{hintLevel ? 'Gợi ý tiếp' : 'Gợi ý'}</button>}
      <button className="btn-text" onClick={() => finish('skip')}>Bỏ qua câu này</button>
    </div>}
    {hintLevel > 0 && state === 'answering' && <div className="notice notice-hint" role="status"><strong>{hintLevel === 1 ? 'Gợi ý' : 'Cách làm'}</strong><p>{hintLevel === 1 ? spec.hint : `${spec.explanation} Đáp án: ${formatAnswer(spec)}`}</p></div>}
    {stepError && <div className="notice notice-error" role="status">{stepError}</div>}
    {stepFeedback && state === 'answering' && <div className="feedback-box feedback-success" role="status"><strong>Bước này đúng rồi</strong><p>{spec.explanation}</p><button className="btn-primary" autoFocus onClick={() => { setStepIndex(i => i + 1); setStepFeedback(false); setHintLevel(0); stepLocked.current = false; }}>Bước tiếp</button></div>}
    {state === 'feedback' && attempt && <Feedback status={attempt.status} question={question} hintUsed={attempt.hintUsed} onNext={next} />}
  </section>;
};
