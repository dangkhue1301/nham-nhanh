import React, { useState } from 'react';
import { ProgressState, DailyCounts } from '../engine/types.ts';
import { emptyCounts, filterDay, vietnamDate } from '../engine/activity.ts';
import { TOPIC_GROUPS, MODE_NAMES } from './LevelPicker.tsx';
import { TOPIC_NAMES } from '../engine/catalog.ts';

const percent = (counts: DailyCounts) => counts.total ? `${Math.round(counts.correct / counts.total * 100)}%` : '—';
const speed = (counts: DailyCounts) => counts.timedCorrectCount ? `${(counts.correctElapsedMs / counts.timedCorrectCount / 1000).toFixed(1)}s` : '—';
const shortDate = (date: string) => `${date.slice(8)}/${date.slice(5, 7)}`;
function lastDays(today: string, count: number): string[] {
  const end = Date.parse(`${today}T12:00:00Z`);
  return Array.from({ length: count }, (_, i) => new Date(end - (count - i - 1) * 86400000).toISOString().slice(0, 10));
}
export const DailyStatsPanel: React.FC<{ progress: ProgressState }> = ({ progress }) => {
  const [topic, setTopic] = useState('all');
  const [mode, setMode] = useState('all');
  const [range, setRange] = useState('7');
  const today = vietnamDate();
  const todayCounts = filterDay(progress.dailyStats[today], topic, mode);
  const dates = range === 'all' ? [...new Set([...Object.keys(progress.dailyStats), today])].sort() : lastDays(today, Number(range));
  const rows = dates.map(date => ({ date, counts: filterDay(progress.dailyStats[date], topic, mode) }));
  const total = rows.reduce((sum, row) => { for (const key of Object.keys(sum) as (keyof DailyCounts)[]) sum[key] += row.counts[key]; return sum; }, emptyCounts());
  const bars = lastDays(today, 7).map(date => ({ date, counts: filterDay(progress.dailyStats[date], topic, mode) }));
  const max = Math.max(1, ...bars.map(row => row.counts.total));
  return <section className="glass-card activity-card" aria-labelledby="activity-title">
    <div className="section-heading"><h2 id="activity-title">Tiến độ mỗi ngày</h2><span className="muted">{shortDate(today)} · hôm nay</span></div>
    <div className="stats-filters"><div><label htmlFor="stats-topic" className="form-label">Chủ đề thống kê</label><select id="stats-topic" className="select-control" value={topic} onChange={e => setTopic(e.target.value)}><option value="all">Tất cả chủ đề</option>{TOPIC_GROUPS.map(group => <optgroup label={group.name} key={group.name}>{group.topics.map(t => <option value={t} key={t}>{TOPIC_NAMES[t]}</option>)}</optgroup>)}</select></div><div><label htmlFor="stats-mode" className="form-label">Cách luyện</label><select id="stats-mode" className="select-control" value={mode} onChange={e => setMode(e.target.value)}><option value="all">Tất cả</option>{Object.entries(MODE_NAMES).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div></div>
    <dl className="today-stats"><div><dt>Câu đã làm hôm nay</dt><dd>{todayCounts.total}</dd></div><div><dt>Độ chính xác</dt><dd>{percent(todayCounts)}</dd></div><div><dt>TB câu đúng có giờ</dt><dd>{speed(todayCounts)}</dd></div></dl>
    <p className="stats-definition">Độ chính xác = đúng độc lập / tổng câu đã làm. Dùng gợi ý hoặc sai ở một bước được tính là có trợ giúp.</p>
    <div className="daily-chart" aria-label="Số câu đã làm trong 7 ngày gần nhất">{bars.map(({ date, counts }) => <div className="chart-column" key={date}><span className="bar-value">{counts.total}</span><div className="bar-track"><div className="bar-fill" style={{ height: `${counts.total / max * 100}%` }} /></div><span className={date === today ? 'chart-date today' : 'chart-date'}>{shortDate(date)}</span></div>)}</div>
    <div className="range-heading"><label htmlFor="stats-range">Lịch sử theo ngày</label><select id="stats-range" className="select-control compact-select" value={range} onChange={e => setRange(e.target.value)}><option value="7">7 ngày</option><option value="30">30 ngày</option><option value="all">Tất cả ngày</option></select></div>
    <div className="daily-table-wrap"><table className="daily-table"><caption className="sr-only">Số câu, độ chính xác và thời gian trung bình theo ngày</caption><thead><tr><th scope="col">Ngày</th><th scope="col">Số câu</th><th scope="col">Chính xác</th><th scope="col">TB đúng</th></tr></thead><tbody>{rows.slice().reverse().map(({ date, counts }) => <tr key={date}><th scope="row">{shortDate(date)}<small>{date.slice(0, 4)}</small></th><td>{counts.total}</td><td>{percent(counts)}</td><td>{speed(counts)}</td></tr>)}</tbody></table></div>
    <details className="stats-breakdown"><summary>Chi tiết {range === 'all' ? 'toàn bộ lịch sử' : `${range} ngày`}: {total.total} câu · {percent(total)} đúng</summary><dl><div><dt>Đúng độc lập</dt><dd>{total.correct}</dd></div><div><dt>Có trợ giúp</dt><dd>{total.assisted}</dd></div><div><dt>Sai</dt><dd>{total.incorrect}</dd></div><div><dt>Bỏ qua</dt><dd>{total.skipped}</dd></div><div><dt>Hết giờ</dt><dd>{total.timeout}</dd></div></dl></details>
    <p className="stats-definition migration-note">Thống kê ngày bắt đầu từ {shortDate(vietnamDate(progress.statsStartedAt))}/{vietnamDate(progress.statsStartedAt).slice(0, 4)}. Lịch sử cũ vẫn được giữ trong tiến độ.</p>
  </section>;
};
