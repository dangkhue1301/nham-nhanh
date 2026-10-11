import React, { useCallback, useRef, useState } from 'react';
import { Attempt, ProgressState, Question, SessionConfiguration, SessionSummary } from '../engine/types.ts';
import { clearProgressState, loadProgressState, saveProgressState, sanitizeConfiguration } from '../storage/localProgress.ts';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { PracticeScreen } from '../screens/PracticeScreen.tsx';
import { ResultsScreen } from '../screens/ResultsScreen.tsx';
import { selectNextQuestion } from '../engine/selectNextQuestion.ts';
import { recordAttempt, summarizeSession } from '../engine/activity.ts';
import { ScrollbarAutohide } from '../components/ScrollbarAutohide.tsx';

interface ActiveSession {
  id: string; config: SessionConfiguration; startedAt: number; seed: number;
  index: number; total: number; attempts: Attempt[]; keys: string[]; ended: boolean;
}
export const App: React.FC = () => {
  const [initial] = useState(loadProgressState);
  const [progress, setProgress] = useState(initial.state);
  const progressRef = useRef(progress);
  const [isPersisted, setIsPersisted] = useState(initial.isPersisted);
  const [screen, setScreen] = useState<'home' | 'practice' | 'results'>('home');
  const [question, setQuestion] = useState<Question | null>(null);
  const questionRef = useRef<Question | null>(null);
  const sessionRef = useRef<ActiveSession | null>(null);
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [error, setError] = useState('');

  const persist = useCallback((next: ProgressState) => {
    progressRef.current = next;
    setIsPersisted(saveProgressState(next));
    setProgress(next);
  }, []);

  const prepare = useCallback((session: ActiveSession) => {
    const next = selectNextQuestion({ configuration: session.config, currentQuestionIndex: session.index, recentSemanticKeys: progressRef.current.recentSemanticKeys, sessionKeys: session.keys, seedOffset: session.index, sessionSeed: session.seed }).question;
    session.keys = [...session.keys, next.semanticKey, next.prompt];
    questionRef.current = next;
    setQuestion(next);
    setIndex(session.index);
  }, []);

  const start = useCallback((configuration: SessionConfiguration) => {
    const config = sanitizeConfiguration(configuration);
    const session: ActiveSession = { id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`, config, startedAt: Date.now(), seed: Math.floor(Math.random() * 0x7fffffff), index: 0, total: config.mode === 'learn' ? 10 : 20, attempts: [], keys: [], ended: false };
    sessionRef.current = session;
    setError('');
    try {
      prepare(session);
      persist({ ...progressRef.current, lastSelection: config });
      setScreen('practice');
    } catch (err) {
      session.ended = true;
      setError(err instanceof Error ? err.message : 'Chưa bắt đầu được lượt luyện. Hãy thử lại.');
      setScreen('home');
    }
  }, [persist, prepare]);

  const storeSummary = useCallback((state: ProgressState, next: SessionSummary): ProgressState => ({ ...state, recentSessions: [...state.recentSessions.filter(s => s.id !== next.id), next].slice(-100) }), []);

  const completeAttempt = useCallback((attempt: Attempt) => {
    const session = sessionRef.current;
    if (!session || session.ended || attempt.sessionId !== session.id || attempt.questionId !== questionRef.current?.id || session.attempts.some(a => a.id === attempt.id)) return;
    session.attempts = [...session.attempts, attempt];
    const partial = summarizeSession(session.id, session.config, session.startedAt, session.attempts, 'interrupted', session.total);
    persist(storeSummary(recordAttempt(progressRef.current, attempt), partial));
  }, [persist, storeSummary]);

  const nextQuestion = useCallback(() => {
    const session = sessionRef.current;
    if (!session || session.ended || session.attempts.length !== session.index + 1) return;
    session.index++;
    if (session.index >= session.total) {
      session.ended = true;
      const result = summarizeSession(session.id, session.config, session.startedAt, session.attempts, 'completed', session.total);
      setSummary(result);
      persist(storeSummary(progressRef.current, result));
      setScreen('results');
    } else {
      try { prepare(session); } catch (err) { setError(err instanceof Error ? err.message : 'Chưa tạo được câu tiếp theo.'); }
    }
  }, [persist, prepare, storeSummary]);

  const exit = useCallback(() => {
    const session = sessionRef.current;
    if (session && !session.ended) {
      session.ended = true;
      if (session.attempts.length) persist(storeSummary(progressRef.current, summarizeSession(session.id, session.config, session.startedAt, session.attempts, 'interrupted', session.total)));
    }
    setScreen('home');
  }, [persist, storeSummary]);

  const session = sessionRef.current;
  return <div className="app-shell">
    <ScrollbarAutohide />
    {error && <div className="notice notice-error" role="alert">{error}<button className="btn-text" onClick={exit}>Về trang chủ</button></div>}
    {screen === 'home' && <HomeScreen key={progress.statsStartedAt} progressState={progress} isPersisted={isPersisted} onStartSession={start} onUpdatePreferences={preferences => persist({ ...progressRef.current, preferences })} onClearProgress={() => { clearProgressState(); persist(loadProgressState().state); }} />}
    {screen === 'practice' && question && session && <PracticeScreen key={session.id} sessionId={session.id} configuration={session.config} currentQuestion={question} questionIndex={index} totalQuestions={session.total} autoAdvanceNormal={progress.preferences.autoAdvanceNormal} onAttemptCompleted={completeAttempt} onExitSession={exit} onNextQuestion={nextQuestion} />}
    {screen === 'results' && summary && session && <ResultsScreen summary={summary} attempts={session.attempts} onContinuePractice={() => start(session.config)} onHome={() => setScreen('home')} />}
  </div>;
};
