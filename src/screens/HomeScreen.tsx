import React, { useState } from 'react';
import { ProgressState, SessionConfiguration } from '../engine/types.ts';
import { LevelPicker } from '../components/LevelPicker.tsx';
import { getDueMemoryCards, getTodayLocalDateStr } from '../engine/spacedReview.ts';
import { evaluateAttemptsWindow } from '../engine/progress.ts';
import { PreferencesModal } from '../components/PreferencesModal.tsx';
import { LEVEL_LABELS, TOPIC_NAMES } from '../engine/catalog.ts';

interface HomeScreenProps {
  progressState: ProgressState;
  isPersisted: boolean;
  onStartSession: (config: SessionConfiguration) => void;
  onUpdatePreferences: (pref: any) => void;
  onClearProgress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progressState,
  isPersisted,
  onStartSession,
  onUpdatePreferences,
  onClearProgress
}) => {
  const [config, setConfig] = useState<SessionConfiguration>(progressState.lastSelection);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);

  const todayStr = getTodayLocalDateStr();
  const dueCards = getDueMemoryCards(progressState.memoryCards, todayStr);

  const currentWindowKey = `${config.mode}:${config.topic}:${config.level}`;
  const currentAttempts = progressState.topicLevelWindows[currentWindowKey] || [];
  const evaluation = evaluateAttemptsWindow(currentAttempts);

  const hasHistory = progressState.recentSessions.length > 0;

  const handleStartPractice = () => {
    onStartSession(config);
  };

  const handleStartDueReview = () => {
    onStartSession({
      topic: config.topic,
      level: config.level,
      mode: 'normal',
      isCustomReview: true
    });
  };

  return (
    <div className="glass-card">
      <div className="app-title">
        <span>⚡</span> Nhẩm Nhanh
      </div>
      <div className="app-subtitle">Luyện tính nhanh mỗi ngày</div>

      <LevelPicker configuration={config} onChange={setConfig} />

      {/* Progress line */}
      <div
        style={{
          margin: '16px 0 20px',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>
          {TOPIC_NAMES[config.topic]} · {LEVEL_LABELS[config.topic][config.level]}
        </span>
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {currentAttempts.length > 0
            ? `${evaluation.independentCorrectCount}/${Math.min(currentAttempts.length, 40)} câu đúng`
            : 'Mới bắt đầu'}
        </span>
      </div>

      {/* Start Button */}
      <button type="button" className="btn-primary" onClick={handleStartPractice}>
        {hasHistory ? 'Luyện tiếp 20 câu' : 'Bắt đầu'}
      </button>

      {/* Due reviews button */}
      {dueCards.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            onClick={handleStartDueReview}
          >
            Ôn hôm nay · {dueCards.length} mục đến hạn
          </button>
        </div>
      )}

      {/* Options link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button
          type="button"
          className="btn-text"
          onClick={() => setIsPreferencesOpen(true)}
        >
          ⚙ Tùy chọn
        </button>

        <button
          type="button"
          className="btn-text"
          onClick={() => setIsProgressExpanded(!isProgressExpanded)}
        >
          {isProgressExpanded ? '▲ Thu gọn tiến độ' : '▼ Chi tiết tiến độ'}
        </button>
      </div>

      {/* Detailed progress accordion */}
      {isProgressExpanded && (
        <div className="collapsible-section">
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>
            Trạng thái level hiện tại:
          </p>
          <div style={{ marginBottom: '8px' }}>
            <strong>Đánh giá: </strong>
            {evaluation.status === 'fast' && '⚡ Nhẩm nhanh'}
            {evaluation.status === 'solid' && '✓ Đúng vững'}
            {evaluation.status === 'learning' && '⏳ Đang luyện'}
          </div>
          <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
            {evaluation.recommendation}
          </p>

          <div style={{ marginTop: '14px' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Thẻ ghi nhớ đang theo dõi:</p>
            <p>Tổng số: {Object.keys(progressState.memoryCards).length} thẻ</p>
            <p>Đến hạn hôm nay: {dueCards.length} thẻ</p>
          </div>
        </div>
      )}

      <PreferencesModal
        isOpen={isPreferencesOpen}
        preferences={progressState.preferences}
        isPersisted={isPersisted}
        onClose={() => setIsPreferencesOpen(false)}
        onUpdatePreferences={onUpdatePreferences}
        onClearProgress={onClearProgress}
      />
    </div>
  );
};
