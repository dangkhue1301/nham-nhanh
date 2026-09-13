import { ProgressState, SessionConfiguration } from '../engine/types.ts';

const STORAGE_KEY = 'nham-nhanh:v1';

export const DEFAULT_CONFIGURATION: SessionConfiguration = {
  topic: 'addition',
  level: 1,
  mode: 'normal'
};

export const INITIAL_PROGRESS_STATE: ProgressState = {
  schemaVersion: 1,
  preferences: {
    autoAdvanceNormal: true
  },
  lastSelection: DEFAULT_CONFIGURATION,
  topicLevelWindows: {},
  tableWindows: {},
  recentSemanticKeys: [],
  recentSessions: [],
  bestHardRuns: {},
  memoryCards: {}
};

// In-memory fallback in case localStorage is blocked
let inMemoryStorage: ProgressState | null = null;

export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadProgressState(): { state: ProgressState; isPersisted: boolean } {
  try {
    if (!isLocalStorageAvailable()) {
      return {
        state: inMemoryStorage || { ...INITIAL_PROGRESS_STATE },
        isPersisted: false
      };
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: { ...INITIAL_PROGRESS_STATE }, isPersisted: true };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || parsed.schemaVersion !== 1) {
      // Outdated or corrupted schema -> reset gracefully
      return { state: { ...INITIAL_PROGRESS_STATE }, isPersisted: true };
    }

    // Merge with defaults to ensure all keys exist
    const state: ProgressState = {
      ...INITIAL_PROGRESS_STATE,
      ...parsed,
      preferences: {
        ...INITIAL_PROGRESS_STATE.preferences,
        ...(parsed.preferences || {})
      },
      lastSelection: {
        ...INITIAL_PROGRESS_STATE.lastSelection,
        ...(parsed.lastSelection || {})
      }
    };

    return { state, isPersisted: true };
  } catch (err) {
    console.warn('Failed to load progress state, using fallback:', err);
    return {
      state: inMemoryStorage || { ...INITIAL_PROGRESS_STATE },
      isPersisted: false
    };
  }
}

export function saveProgressState(state: ProgressState): boolean {
  try {
    // Apply bounds
    const boundedState: ProgressState = {
      ...state,
      recentSemanticKeys: state.recentSemanticKeys.slice(-200),
      recentSessions: state.recentSessions.slice(-100)
    };

    // Trim topicLevelWindows to 100 per window
    for (const key of Object.keys(boundedState.topicLevelWindows)) {
      if (boundedState.topicLevelWindows[key].length > 100) {
        boundedState.topicLevelWindows[key] = boundedState.topicLevelWindows[key].slice(-100);
      }
    }

    // Bound memoryCards to at most 2000
    const cardKeys = Object.keys(boundedState.memoryCards);
    if (cardKeys.length > 2000) {
      const sortedKeys = cardKeys.sort(
        (a, b) => boundedState.memoryCards[b].lastPracticedAt - boundedState.memoryCards[a].lastPracticedAt
      );
      const keepKeys = new Set(sortedKeys.slice(0, 2000));
      const prunedCards: Record<string, any> = {};
      for (const k of keepKeys) {
        prunedCards[k] = boundedState.memoryCards[k];
      }
      boundedState.memoryCards = prunedCards;
    }

    inMemoryStorage = boundedState;

    if (!isLocalStorageAvailable()) {
      return false;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boundedState));
    return true;
  } catch (err) {
    console.warn('Failed to persist progress state:', err);
    return false;
  }
}

export function clearProgressState(): boolean {
  try {
    inMemoryStorage = { ...INITIAL_PROGRESS_STATE };
    if (isLocalStorageAvailable()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return true;
  } catch {
    return false;
  }
}
