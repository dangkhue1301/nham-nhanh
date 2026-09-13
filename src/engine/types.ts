export type Topic =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'mixed'
  | 'money'
  | 'time'
  | 'calendar';

export type Mode = 'normal' | 'hard';

export type AnswerType = 'integer' | 'clock' | 'date' | 'weekday';

export interface ClockAnswer {
  hour: number;   // 0 - 23
  minute: number; // 0 - 59
}

export interface DateAnswer {
  day: number;    // 1 - 31
  month: number;  // 1 - 12
  year: number;   // 2000 - 2099
}

// weekday answer: 2 = Thứ Hai, 3 = Thứ Ba, 4 = Thứ Tư, 5 = Thứ Năm, 6 = Thứ Sáu, 7 = Thứ Bảy, 8 = Chủ Nhật
export type WeekdayAnswer = 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RawAnswerValue = number | ClockAnswer | DateAnswer | WeekdayAnswer;

export interface QuestionSnapshot {
  prompt: string;
  answerType: AnswerType;
  answer: RawAnswerValue;
  unit?: string;
  hint: string;
  explanation: string;
}

export interface Question extends QuestionSnapshot {
  id: string;
  familyId: string;
  generatorVersion: number;
  seed: number;
  topic: Topic;
  level: number;
  tableId?: number; // 2..9 for basic mult / div
  skillTags: string[];
  parameters: Record<string, any>;
  semanticKey: string;
  memoryKey: string;
  normalLimitMs: number;
  hardLimitMs: number;
  timingProfileVersion: number;
  reviewReason?: 'due' | 'mistake' | 'slow' | 'within_session';
}

export type AttemptStatus =
  | 'correct'
  | 'incorrect'
  | 'assisted'
  | 'skipped'
  | 'timeout';

export interface Attempt {
  questionId: string;
  familyId: string;
  generatorVersion: number;
  topic: Topic;
  level: number;
  tableId?: number;
  parameters: Record<string, any>;
  questionSnapshot: QuestionSnapshot;
  semanticKey: string;
  sessionId: string;
  mode: Mode;
  timingProfileVersion: number;
  timeLimitMs: number;
  memoryKey: string;
  submittedAnswer: any;
  status: AttemptStatus;
  elapsedMs: number;
  timingEligible: boolean;
  progressEligible: boolean;
  hintUsed: boolean;
  reviewReason?: 'due' | 'mistake' | 'slow' | 'within_session';
  answeredAt: number;
}

export interface SessionConfiguration {
  topic: Topic;
  level: number;
  mode: Mode;
  tableId?: number;
  isCustomReview?: boolean; // Review Due or Review Mistakes
}

export interface SessionSummary {
  id: string;
  configuration: SessionConfiguration;
  startedAt: number;
  completedAt?: number;
  status: 'completed' | 'interrupted';
  scoredCount: number;
  independentCorrectCount: number;
  assistedCount: number;
  skippedCount: number;
  incorrectCount: number;
  timeoutCount: number;
  unansweredCount: number;
  medianCorrectMs: number | null;
  bestEligible: boolean;
  recommendation?: string;
}

export interface MemoryCard {
  memoryKey: string;
  kind: 'fact' | 'skill';
  topic: Topic;
  level: number;
  familyId: string;
  factParameters?: Record<string, any>;
  scheduleStage: number; // 0..5 (0: none, 1: 1d, 2: 3d, 3: 7d, 4: 14d, 5: 30d)
  dueLocalDate: string; // YYYY-MM-DD
  lastPracticedAt: number;
  lastAdvancedLocalDate?: string;
  successfulReviewDates: string[]; // List of YYYY-MM-DD
  successRunStartDate?: string;
  lastOutcome: AttemptStatus;
  lapses: number;
  latestIncorrectSnapshot?: QuestionSnapshot;
}

export interface Preferences {
  autoAdvanceNormal: boolean;
}

export interface ProgressState {
  schemaVersion: number;
  preferences: Preferences;
  lastSelection: SessionConfiguration;
  topicLevelWindows: Record<string, Attempt[]>; // key: "mode:topic:level"
  tableWindows: Record<string, Attempt[]>;      // key: "mode:topic:level:tableId"
  recentSemanticKeys: string[];
  recentSessions: SessionSummary[];
  bestHardRuns: Record<string, { correctCount: number; totalElapsedMs: number; date: string }>;
  memoryCards: Record<string, MemoryCard>;
}

export type MasteryStatus = 'learning' | 'solid' | 'fast'; // Đang luyện | Đúng vững | Nhẩm nhanh

export interface FamilyDefinition {
  familyId: string;
  name: string;
  topic: Topic;
  allowedLevels: number[];
  skillTags: string[];
  normalLimitMs: (level: number) => number;
  hardLimitMs: (level: number) => number;
  timingProfileVersion: number;
  generator: (seed: number, level: number, options?: { tableId?: number }) => Question;
}
