export type Topic =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'mixed'
  | 'money'
  | 'time'
  | 'calendar'
  | 'decomposition'
  | 'identities'
  | 'factoring'
  | 'geometry';

export type Mode = 'normal' | 'hard' | 'learn';

export type AnswerType = 'integer' | 'signed' | 'decimal' | 'clock' | 'date' | 'weekday' | 'choice' | 'blanks';

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

export type RawAnswerValue = number | number[] | ClockAnswer | DateAnswer | WeekdayAnswer;

export interface AnswerField {
  label: string;
  type: 'integer' | 'signed' | 'decimal';
  unit?: string;
}

export interface AnswerSpec {
  answerType: AnswerType;
  answer: RawAnswerValue;
  unit?: string;
  fields?: AnswerField[];
  choices?: string[];
  unordered?: boolean;
}

export interface LearningStep extends AnswerSpec {
  prompt: string;
  hint: string;
  explanation: string;
}

export interface GeometryDiagram {
  kind: 'rectangle' | 'square' | 'triangle' | 'parallelogram' | 'rhombus' | 'trapezoid' | 'circle' | 'composite';
  dimensions: Record<string, number>;
  unit: string;
}

export interface QuestionSnapshot extends AnswerSpec {
  prompt: string;
  hint: string;
  explanation: string;
  steps?: LearningStep[];
  diagram?: GeometryDiagram;
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
}

export type AttemptStatus =
  | 'correct'
  | 'incorrect'
  | 'assisted'
  | 'skipped'
  | 'timeout';

export interface Attempt {
  id: string;
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
  benchmarkLimitMs: number;
  memoryKey: string;
  submittedAnswer: any;
  status: AttemptStatus;
  elapsedMs: number;
  timingEligible: boolean;
  progressEligible: boolean;
  hintUsed: boolean;
  answeredAt: number;
}

export interface SessionConfiguration {
  topic: Topic;
  level: number;
  mode: Mode;
  tableId?: number;
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

export interface DailyCounts {
  total: number;
  correct: number;
  assisted: number;
  incorrect: number;
  skipped: number;
  timeout: number;
  timedCorrectCount: number;
  correctElapsedMs: number;
}

export interface DailyStats extends DailyCounts {
  bySelection: Record<string, DailyCounts>;
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
  dailyStats: Record<string, DailyStats>;
  recentAttemptIds: string[];
  statsStartedAt: number;
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
