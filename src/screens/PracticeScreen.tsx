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
    <header className="practice-header">
      <button className="btn-back" onClick={onExitSession} aria-label="Kết thúc lượt và về trang chủ">←</button>
      <div className="practice-heading"><div className="eyebrow">{TOPIC_NAMES[configuration.topic]}</div><h1>{LEVEL_LABELS[configuration.topic][question.level].replace(/^(Level|Mức) \d+ · /, '')}</h1></div>
      <div className="question-counter"><strong>Câu {questionIndex + 1}/{totalQuestions}</strong><span className="muted">{learning ? 'Học từng bước' : configuration.mode === 'hard' ? 'Tốc độ cao' : 'Luyện nhẩm'}</span></div>
    </header>
    <div className="session-track" role="progressbar" aria-label="Tiến độ lượt luyện" aria-valuemin={0} aria-valuemax={totalQuestions} aria-valuenow={questionIndex}><span style={{ width: `${questionIndex / totalQuestions * 100}%` }} /></div>
    {!learning && <div className={`timer-row ${remaining <= 3000 ? 'timer-warning' : ''}`}><span>Còn {Math.ceil(remaining / 1000)} giây</span><div className="timer-track"><span style={{ width: `${remaining / timeLimit * 100}%` }} /></div></div>}
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
