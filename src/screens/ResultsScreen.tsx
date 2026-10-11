import React from 'react';
import { Attempt, AttemptStatus, SessionSummary } from '../engine/types.ts';
import { TOPIC_NAMES } from '../engine/catalog.ts';
import { formatAnswer } from '../engine/normalizeAnswer.ts';
import { MODE_NAMES } from '../components/LevelPicker.tsx';

const STATUS_NAMES: Record<AttemptStatus, string> = { correct: 'Đúng độc lập', assisted: 'Có trợ giúp', incorrect: 'Sai', skipped: 'Bỏ qua', timeout: 'Hết giờ' };
interface Props { summary: SessionSummary; attempts: Attempt[]; onContinuePractice: () => void; onHome: () => void; }
export const ResultsScreen: React.FC<Props> = ({ summary, attempts, onContinuePractice, onHome }) => {
  const accuracy = summary.scoredCount ? Math.round(summary.independentCorrectCount / summary.scoredCount * 100) : 0;
  const mistakes = attempts.filter(a => a.status !== 'correct');
  return <main className="glass-card results-card">
    <header className="results-summary"><span className="accent-label">Hoàn thành lượt luyện</span><h1>{TOPIC_NAMES[summary.configuration.topic]} · Mức {summary.configuration.level}</h1><p className="muted">{MODE_NAMES[summary.configuration.mode]}</p><div className="score-display">{summary.independentCorrectCount}/{summary.scoredCount}</div><p>Đúng độc lập · {accuracy}%</p></header>
    <dl className="result-stats"><div><dt>Câu đã làm</dt><dd>{summary.scoredCount}</dd></div><div><dt>Tốc độ điển hình</dt><dd>{summary.medianCorrectMs === null ? '—' : `${(summary.medianCorrectMs / 1000).toFixed(1)}s`}</dd></div></dl>
    <dl className="status-counts">{(['assisted', 'incorrect', 'skipped', 'timeout'] as const).map(status => <div key={status}><dt>{STATUS_NAMES[status]}</dt><dd>{summary[`${status}Count`]}</dd></div>)}</dl>
    <div className="notice notice-hint"><p>{mistakes.length ? 'Đọc cách làm bên dưới để hiểu chỗ vướng. Giữ mức này thêm vài lượt trước khi tăng tốc.' : summary.configuration.mode === 'learn' ? 'Bạn đã tự làm đúng mọi bước. Có thể thử chế độ Luyện nhẩm ở mức này.' : 'Bạn đã tính đúng toàn bộ lượt này. Thử rút ngắn thời gian hoặc chọn mức tiếp theo.'}</p><p className="muted">Kết quả đã được ghi vào thống kê hôm nay.</p></div>
    <div className="result-actions"><button className="btn-primary" onClick={onContinuePractice}>Luyện tiếp {summary.configuration.mode === 'learn' ? '10 bài' : '20 câu'} →</button><button className="btn-secondary" onClick={onHome}>Về trang chủ</button></div>
    <details className="answer-details"><summary>Xem đáp án và cách làm ({attempts.length} câu)</summary><ol className="answer-list">{attempts.map(attempt => <li key={attempt.id}><div className="answer-status">{STATUS_NAMES[attempt.status]}</div><strong>{attempt.questionSnapshot.prompt}</strong><p>Đáp án: {formatAnswer(attempt.questionSnapshot)}</p><p className="muted">{attempt.questionSnapshot.explanation}</p></li>)}</ol></details>
  </main>;
};
