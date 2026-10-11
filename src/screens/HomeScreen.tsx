import React, { useState } from 'react';
import { Preferences, ProgressState, SessionConfiguration } from '../engine/types.ts';
import { LevelPicker, MODE_NAMES } from '../components/LevelPicker.tsx';
import { evaluateAttemptsWindow } from '../engine/progress.ts';
import { PreferencesModal } from '../components/PreferencesModal.tsx';
import { DailyStatsPanel } from '../components/DailyStatsPanel.tsx';
import { TOPIC_NAMES } from '../engine/catalog.ts';

interface Props {
  progressState: ProgressState; isPersisted: boolean;
  onStartSession: (config: SessionConfiguration) => void;
  onUpdatePreferences: (pref: Preferences) => void; onClearProgress: () => void;
}
export const HomeScreen: React.FC<Props> = ({ progressState, isPersisted, onStartSession, onUpdatePreferences, onClearProgress }) => {
  const [config, setConfig] = useState(progressState.lastSelection);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const evaluation = evaluateAttemptsWindow(progressState.topicLevelWindows[`${config.mode}:${config.topic}:${config.level}`] || []);
  return <>
    <header className="home-header">
      <div><div className="brand"><span className="brand-mark" aria-hidden="true">ϟ</span><h1>Nhẩm Nhanh</h1></div><p className="muted">Nhanh hơn từ những phép tính nhỏ mỗi ngày.</p></div>
      <button className="btn-secondary settings-button" onClick={() => setPreferencesOpen(true)}>Tùy chọn</button>
    </header>
    <main className="home-grid">
      <section className="glass-card training-card" aria-labelledby="training-title">
        <span className="accent-label">Ưu tiên luyện tính nhẩm nhanh</span>
        <h2 id="training-title">Bắt đầu lượt luyện</h2>
        <p className="muted section-intro">Chọn mức vừa sức. Tính đúng trước, rồi rút ngắn thời gian.</p>
        <LevelPicker configuration={config} onChange={setConfig} />
        <button className="btn-primary" onClick={() => onStartSession(config)}>{config.mode === 'learn' ? 'Bắt đầu 10 bài từng bước' : 'Bắt đầu 20 câu'}<span aria-hidden="true">→</span></button>
        <button className="btn-text quick-reset" onClick={() => setConfig({ topic: 'mixed', level: 1, mode: 'normal' })}>Chọn nhanh: nhẩm 4 phép tính cơ bản</button>
        <details className="progress-details"><summary>Tiến độ ở mức đang chọn <span>{evaluation.totalEvaluated ? `${evaluation.independentCorrectCount}/${evaluation.totalEvaluated} đúng` : 'Chưa có kết quả'}</span></summary><div className="details-body"><strong>{evaluation.status === 'fast' ? 'Nhẩm nhanh' : evaluation.status === 'solid' ? 'Đúng vững' : 'Đang luyện'}</strong><p>{evaluation.recommendation}</p><p>Đánh giá trên 40 câu gần nhất của chủ đề, cấp độ và cách luyện này.</p></div></details>
        <div className="learning-path"><h3>Xây nền tảng để nhẩm nhanh</h3><p>Tách–ghép số → Hằng đẳng thức → Phân tích nhân tử → Diện tích.</p><p className="muted">Chưa biết cách làm? Chọn “Học từng bước” ở các chủ đề này.</p></div>
      </section>
      <DailyStatsPanel progress={progressState} />
      {progressState.recentSessions.length > 0 && <section className="glass-card history-card" aria-labelledby="history-title"><h2 id="history-title">Các lượt gần đây</h2><ul className="session-list">{progressState.recentSessions.slice(-5).reverse().map(session => <li key={session.id}><div><strong>{TOPIC_NAMES[session.configuration.topic]} · Mức {session.configuration.level}</strong><span className="muted">{new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(session.startedAt)} · {MODE_NAMES[session.configuration.mode]} · {session.status === 'completed' ? 'Hoàn thành' : 'Dừng giữa lượt'}</span></div><span className="session-score">{session.independentCorrectCount}/{session.scoredCount}<small>đúng</small></span></li>)}</ul></section>}
    </main>
    <footer className="home-footer"><p>{isPersisted ? 'Tiến độ được lưu trên trình duyệt này sau mỗi câu.' : 'Chưa lưu được trên trình duyệt. Kết quả hiện chỉ giữ trong phiên này.'}</p><p>Ngày thống kê theo giờ Việt Nam. Bài nhiều bước chỉ tính một câu.</p></footer>
    <PreferencesModal isOpen={preferencesOpen} preferences={progressState.preferences} isPersisted={isPersisted} onClose={() => setPreferencesOpen(false)} onUpdatePreferences={onUpdatePreferences} onClearProgress={onClearProgress} />
  </>;
};
