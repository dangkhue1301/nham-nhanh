import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Attempt, ProgressState, Question, SessionConfiguration, SessionSummary } from '../engine/types.ts';
import { clearProgressState, loadProgressState, updateProgressState, sanitizeConfiguration, STORAGE_KEY } from '../storage/localProgress.ts';
import { acquirePracticeLock } from '../storage/practiceLock.ts';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { PracticeScreen } from '../screens/PracticeScreen.tsx';
import { ResultsScreen } from '../screens/ResultsScreen.tsx';
import { selectNextQuestion } from '../engine/selectNextQuestion.ts';
import { recordAttempt, summarizeSession } from '../engine/activity.ts';
import { ScrollbarAutohide } from '../components/ScrollbarAutohide.tsx';

interface ActiveSession {
  id: string; config: SessionConfiguration; startedAt: number; seed: number;
  index: number; total: number; attempts: Attempt[]; keys: string[]; ended: boolean;
  release: () => Promise<void>;
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
  const starting = useRef(false);
  const startToken = useRef(0);
  const mounted = useRef(true);
  const pendingSave = useRef<Promise<void>>(Promise.resolve());

  const acceptProgress = useCallback((next: ReturnType<typeof loadProgressState>) => {
    progressRef.current = next.state;
    if (mounted.current) { setIsPersisted(next.isPersisted); setProgress(next.state); }
  }, []);
  const persist = useCallback(async (update: (state: ProgressState) => ProgressState) => {
    acceptProgress(await updateProgressState(update));
  }, [acceptProgress]);

  useEffect(() => {
    mounted.current = true;
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY || event.key === null) acceptProgress(loadProgressState()); };
    window.addEventListener('storage', sync);
    return () => {
      mounted.current = false; startToken.current++;
      window.removeEventListener('storage', sync);
      const session = sessionRef.current;
      if (session) { session.ended = true; void pendingSave.current.finally(session.release); }
    };
  }, [acceptProgress]);

  const prepare = useCallback((session: ActiveSession) => {
    const next = selectNextQuestion({ configuration: session.config, currentQuestionIndex: session.index, recentSemanticKeys: progressRef.current.recentSemanticKeys, sessionKeys: session.keys, seedOffset: session.index, sessionSeed: session.seed }).question;
    session.keys = [...session.keys, next.semanticKey, next.prompt];
    questionRef.current = next;
    setQuestion(next);
    setIndex(session.index);
  }, []);

  const start = useCallback(async (configuration: SessionConfiguration) => {
    if (starting.current || (sessionRef.current && !sessionRef.current.ended)) return;
    starting.current = true;
    const token = ++startToken.current;
    let release: (() => Promise<void>) | undefined;
    const config = sanitizeConfiguration(configuration);
    setError('');
    try {
      release = await acquirePracticeLock();
      if (!mounted.current || token !== startToken.current) { await release(); return; }
      await pendingSave.current;
      await persist(state => ({ ...state, lastSelection: config }));
      if (!mounted.current || token !== startToken.current) { await release(); return; }
      const session: ActiveSession = { id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`, config, startedAt: Date.now(), seed: Math.floor(Math.random() * 0x7fffffff), index: 0, total: config.mode === 'learn' ? 10 : 20, attempts: [], keys: [], ended: false, release };
      sessionRef.current = session;
      prepare(session);
      setScreen('practice');
    } catch (err) {
      if (release) await release();
      if (sessionRef.current) sessionRef.current.ended = true;
      if (mounted.current) { setError(err instanceof Error ? err.message : 'Chưa bắt đầu được lượt luyện. Hãy thử lại.'); setScreen('home'); }
    } finally { starting.current = false; }
  }, [persist, prepare]);

  const storeSummary = useCallback((state: ProgressState, next: SessionSummary): ProgressState => ({ ...state, recentSessions: [...state.recentSessions.filter(s => s.id !== next.id), next].slice(-100) }), []);

  const completeAttempt = useCallback((attempt: Attempt) => {
    const session = sessionRef.current;
    if (!session || session.ended || attempt.sessionId !== session.id || attempt.questionId !== questionRef.current?.id || session.attempts.some(a => a.id === attempt.id)) return;
    session.attempts = [...session.attempts, attempt];
    const finished = session.attempts.length === session.total;
    const result = summarizeSession(session.id, session.config, session.startedAt, session.attempts, finished ? 'completed' : 'interrupted', session.total);
    if (finished) setSummary(result);
    pendingSave.current = pendingSave.current.then(() => persist(state => storeSummary(recordAttempt(state, attempt), result))).catch(err => { if (mounted.current) setError(String(err)); });
  }, [persist, storeSummary]);

  const nextQuestion = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || session.ended || session.attempts.length !== session.index + 1) return;
    await pendingSave.current;
    if (session.ended || !mounted.current || document.hidden) return;
    session.index++;
    if (session.index >= session.total) {
      session.ended = true;
      await session.release();
      setScreen('results');
    } else {
      try { prepare(session); } catch (err) { setError(err instanceof Error ? err.message : 'Chưa tạo được câu tiếp theo.'); }
    }
  }, [prepare]);

  const exit = useCallback(() => {
    startToken.current++;
    const session = sessionRef.current;
    if (session && !session.ended) {
      session.ended = true;
      void pendingSave.current.finally(session.release);
    }
    setScreen('home');
  }, []);

  const changeProgress = useCallback(async (update?: (state: ProgressState) => ProgressState) => {
    let release: (() => Promise<void>) | undefined;
    try {
      release = await acquirePracticeLock();
      if (update) await persist(update);
      else await navigator.locks.request('nham-nhanh:progress', () => {
        if (!clearProgressState()) throw new Error('Chưa xóa được tiến độ. Dữ liệu đang có vẫn được giữ trong phiên này.');
        acceptProgress(loadProgressState());
      });
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : String(err)); }
    finally { if (release) await release(); }
  }, [persist, acceptProgress]);

  const session = sessionRef.current;
  return <div className="app-shell">
    <ScrollbarAutohide />
    {error && <div className="notice notice-error" role="alert">{error}<button className="btn-text" onClick={exit}>Về trang chủ</button></div>}
    {screen === 'home' && <HomeScreen key={progress.statsStartedAt} progressState={progress} isPersisted={isPersisted} onStartSession={start} onUpdatePreferences={preferences => { void changeProgress(state => ({ ...state, preferences })); }} onClearProgress={() => { void changeProgress(); }} />}
    {screen === 'practice' && question && session && <PracticeScreen key={session.id} sessionId={session.id} configuration={session.config} currentQuestion={question} questionIndex={index} totalQuestions={session.total} autoAdvanceNormal={progress.preferences.autoAdvanceNormal} onAttemptCompleted={completeAttempt} onExitSession={exit} onNextQuestion={nextQuestion} />}
    {screen === 'results' && summary && session && <ResultsScreen summary={summary} attempts={session.attempts} onContinuePractice={() => start(session.config)} onHome={() => setScreen('home')} />}
  </div>;
};
