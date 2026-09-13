import React, { useState, useEffect, useCallback } from 'react';
import {
  Attempt,
  ProgressState,
  Question,
  SessionConfiguration,
  SessionSummary
} from '../engine/types.ts';
import {
  clearProgressState,
  loadProgressState,
  saveProgressState
} from '../storage/localProgress.ts';
import { HomeScreen } from '../screens/HomeScreen.tsx';
import { PracticeScreen } from '../screens/PracticeScreen.tsx';
import { ResultsScreen } from '../screens/ResultsScreen.tsx';
import { selectNextQuestion } from '../engine/selectNextQuestion.ts';
import {
  createMemoryCardFromQuestion,
  getDueMemoryCards,
  getTodayLocalDateStr,
  updateMemoryCard
} from '../engine/spacedReview.ts';

export const App: React.FC = () => {
  const [progressState, setProgressState] = useState<ProgressState>(() => loadProgressState().state);
  const [isPersisted, setIsPersisted] = useState<boolean>(() => loadProgressState().isPersisted);

  // App screen navigation: 'home' | 'practice' | 'results'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'practice' | 'results'>('home');

  // Session state
  const [currentConfig, setCurrentConfig] = useState<SessionConfiguration>(progressState.lastSelection);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [sessionAttempts, setSessionAttempts] = useState<Attempt[]>([]);
  const [withinSessionRetryQueue, setWithinSessionRetryQueue] = useState<
    { question: Question; failedAtIndex: number }[]
  >([]);
  const [latestSummary, setLatestSummary] = useState<SessionSummary | null>(null);

  const TOTAL_SESSION_QUESTIONS = 20;

  // Persist state whenever it changes
  useEffect(() => {
    const success = saveProgressState(progressState);
    setIsPersisted(success);
  }, [progressState]);

  // Generate next question
  const prepareNextQuestion = useCallback(
    (index: number, config: SessionConfiguration, retryQueue = withinSessionRetryQueue) => {
      const todayStr = getTodayLocalDateStr();
      const dueCards = getDueMemoryCards(progressState.memoryCards, todayStr);

      const next = selectNextQuestion({
        configuration: config,
        memoryCards: progressState.memoryCards,
        dueCards,
        withinSessionRetryQueue: retryQueue,
        currentQuestionIndex: index,
        recentSemanticKeys: progressState.recentSemanticKeys,
        seedOffset: index
      });

      setCurrentQuestion(next.question);
    },
    [progressState, withinSessionRetryQueue]
  );

  // Start a new session
  const handleStartSession = (config: SessionConfiguration) => {
    setCurrentConfig(config);
    setQuestionIndex(0);
    setSessionAttempts([]);
    setWithinSessionRetryQueue([]);

    // Update last selection in progress
    setProgressState((prev) => ({
      ...prev,
      lastSelection: config
    }));

    prepareNextQuestion(0, config, []);
    setCurrentScreen('practice');
  };

  // When an attempt is completed
  const handleAttemptCompleted = (attempt: Attempt) => {
    const updatedAttempts = [...sessionAttempts, attempt];
    setSessionAttempts(updatedAttempts);

    const todayStr = getTodayLocalDateStr();

    // Update or create memory card for spaced repetition
    setProgressState((prev) => {
      const card =
        prev.memoryCards[attempt.memoryKey] ||
        createMemoryCardFromQuestion(currentQuestion!, todayStr);

      const updatedCard = updateMemoryCard({
        card,
        status: attempt.status,
        elapsedMs: attempt.elapsedMs,
        hardLimitMs: attempt.timeLimitMs,
        todayStr,
        snapshot: attempt.questionSnapshot
      });

      // Update topic level window
      const windowKey = `${attempt.mode}:${attempt.topic}:${attempt.level}`;
      const existingWindow = prev.topicLevelWindows[windowKey] || [];
      const updatedWindow = [...existingWindow, attempt].slice(-100);

      // Update table window if applicable
      const tableWindows = { ...prev.tableWindows };
      if (attempt.tableId) {
        const tableKey = `${attempt.mode}:${attempt.topic}:${attempt.level}:${attempt.tableId}`;
        const existingTableWindow = tableWindows[tableKey] || [];
        tableWindows[tableKey] = [...existingTableWindow, attempt].slice(-40);
      }

      return {
        ...prev,
        memoryCards: {
          ...prev.memoryCards,
          [attempt.memoryKey]: updatedCard
        },
        topicLevelWindows: {
          ...prev.topicLevelWindows,
          [windowKey]: updatedWindow
        },
        tableWindows,
        recentSemanticKeys: [...prev.recentSemanticKeys, attempt.semanticKey].slice(-200)
      };
    });

    // If incorrect, assisted, or timeout, queue for retry within session
    if (attempt.status !== 'correct' && currentQuestion) {
      setWithinSessionRetryQueue((prev) => [
        ...prev,
        { question: currentQuestion, failedAtIndex: questionIndex }
      ]);
    }
  };

  // Move to next question or complete session
  const handleNextQuestion = () => {
    const nextIdx = questionIndex + 1;
    if (nextIdx >= TOTAL_SESSION_QUESTIONS) {
      // Session finished! Calculate summary
      const scoredCount = sessionAttempts.length;
      const independentCorrect = sessionAttempts.filter((a) => a.status === 'correct');
      const correctCount = independentCorrect.length;
      const assistedCount = sessionAttempts.filter((a) => a.status === 'assisted').length;
      const skippedCount = sessionAttempts.filter((a) => a.status === 'skipped').length;
      const timeoutCount = sessionAttempts.filter((a) => a.status === 'timeout').length;
      const incorrectCount = sessionAttempts.filter((a) => a.status === 'incorrect').length;

      let medianCorrectMs: number | null = null;
      const eligibleTiming = independentCorrect.filter((a) => a.timingEligible);
      if (eligibleTiming.length >= 5) {
        const sortedTimes = eligibleTiming.map((a) => a.elapsedMs).sort((a, b) => a - b);
        const mid = Math.floor(sortedTimes.length / 2);
        medianCorrectMs =
          sortedTimes.length % 2 === 0
            ? Math.round((sortedTimes[mid - 1] + sortedTimes[mid]) / 2)
            : sortedTimes[mid];
      }

      const summary: SessionSummary = {
        id: `sess-${Date.now()}`,
        configuration: currentConfig,
        startedAt: Date.now() - 60000,
        completedAt: Date.now(),
        status: 'completed',
        scoredCount,
        independentCorrectCount: correctCount,
        assistedCount,
        skippedCount,
        incorrectCount,
        timeoutCount,
        unansweredCount: 0,
        medianCorrectMs,
        bestEligible: currentConfig.mode === 'hard' && scoredCount === 20
      };

      setLatestSummary(summary);
      setProgressState((prev) => ({
        ...prev,
        recentSessions: [...prev.recentSessions, summary].slice(-100)
      }));

      setCurrentScreen('results');
    } else {
      setQuestionIndex(nextIdx);
      prepareNextQuestion(nextIdx, currentConfig);
    }
  };

  const handleExitSession = () => {
    setCurrentScreen('home');
  };

  const handleUpdatePreferences = (pref: any) => {
    setProgressState((prev) => ({
      ...prev,
      preferences: pref
    }));
  };

  const handleClearProgress = () => {
    clearProgressState();
    const fresh = loadProgressState();
    setProgressState(fresh.state);
  };

  const handleReviewMistakes = () => {
    // Review mistakes from current session
    handleStartSession({
      ...currentConfig,
      mode: 'normal',
      isCustomReview: true
    });
  };

  return (
    <div style={{ width: '100%' }}>
      {currentScreen === 'home' && (
        <HomeScreen
          progressState={progressState}
          isPersisted={isPersisted}
          onStartSession={handleStartSession}
          onUpdatePreferences={handleUpdatePreferences}
          onClearProgress={handleClearProgress}
        />
      )}

      {currentScreen === 'practice' && currentQuestion && (
        <PracticeScreen
          configuration={currentConfig}
          currentQuestion={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={TOTAL_SESSION_QUESTIONS}
          autoAdvanceNormal={progressState.preferences.autoAdvanceNormal}
          onAttemptCompleted={handleAttemptCompleted}
          onExitSession={handleExitSession}
          onNextQuestion={handleNextQuestion}
        />
      )}

      {currentScreen === 'results' && latestSummary && (
        <ResultsScreen
          summary={latestSummary}
          attempts={sessionAttempts}
          onContinuePractice={() => handleStartSession(currentConfig)}
          onReviewMistakes={sessionAttempts.some((a) => a.status !== 'correct') ? handleReviewMistakes : undefined}
          onHome={() => setCurrentScreen('home')}
        />
      )}
    </div>
  );
};
