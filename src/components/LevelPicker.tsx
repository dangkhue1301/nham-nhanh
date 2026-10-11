import React from 'react';
import { SessionConfiguration, Topic, Mode } from '../engine/types.ts';
import { LEVEL_LABELS, TOPIC_NAMES } from '../engine/catalog.ts';
import { isThinkingTopic } from '../engine/generators/thinking.ts';

export const TOPIC_GROUPS: { name: string; topics: Topic[] }[] = [
  { name: 'Nhẩm cơ bản', topics: ['addition','subtraction','multiplication','division','mixed','decomposition'] },
  { name: 'Tư duy toán THCS', topics: ['identities','factoring','geometry'] },
  { name: 'Toán đời sống', topics: ['money','time','calendar'] }
];
export const MODE_NAMES: Record<Mode, string> = { normal: 'Luyện nhẩm', hard: 'Tốc độ cao', learn: 'Học từng bước' };
interface Props { configuration: SessionConfiguration; onChange: (config: SessionConfiguration) => void; }
export const LevelPicker: React.FC<Props> = ({ configuration: config, onChange }) => {
  const thinking = isThinkingTopic(config.topic);
  const changeTopic = (topic: Topic) => onChange({ ...config, topic, level: 1, tableId: undefined, mode: config.mode === 'learn' && !isThinkingTopic(topic) ? 'normal' : config.mode });
  const table = (config.topic === 'multiplication' || config.topic === 'division') && config.level === 1;
  return <div className="configuration-form">
    <div className="picker-fields">
      <div className="form-group"><label className="form-label" htmlFor="topic">Chủ đề</label><select id="topic" className="select-control" value={config.topic} onChange={e => changeTopic(e.target.value as Topic)}>{TOPIC_GROUPS.map(group => <optgroup label={group.name} key={group.name}>{group.topics.map(topic => <option key={topic} value={topic}>{TOPIC_NAMES[topic]}</option>)}</optgroup>)}</select></div>
      <div className="form-group"><label className="form-label" htmlFor="level">Cấp độ</label><select id="level" className="select-control" value={config.level} onChange={e => onChange({ ...config, level: Number(e.target.value), tableId: undefined })}>{[1,2,3,4,5].map(level => <option key={level} value={level}>{LEVEL_LABELS[config.topic][level].replace('Level', 'Mức')}</option>)}</select></div>
    </div>
    {table && <div className="form-group"><label className="form-label" htmlFor="table">Bảng đang luyện</label><select id="table" className="select-control" value={config.tableId ?? 'all'} onChange={e => onChange({ ...config, tableId: e.target.value === 'all' ? undefined : Number(e.target.value) })}><option value="all">Tất cả các bảng (2–9)</option>{[2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>Bảng {n}</option>)}</select></div>}
    <fieldset className="form-group mode-fieldset"><legend className="form-label">Cách luyện</legend><div className={`mode-toggle-group ${thinking ? 'three-modes' : ''}`}>{(thinking ? ['normal','hard','learn'] : ['normal','hard']).map(mode => <button key={mode} type="button" className={`mode-btn ${config.mode === mode ? 'active' : ''}`} aria-pressed={config.mode === mode} onClick={() => onChange({ ...config, mode: mode as Mode })}>{MODE_NAMES[mode as Mode]}</button>)}</div><p className="control-help">{config.mode === 'learn' ? '10 bài, không đếm ngược. Điền từng bước và xem cách làm.' : config.mode === 'hard' ? '20 câu, thời gian ngắn hơn. Không dùng gợi ý.' : '20 câu có thời gian. Có gợi ý khi bạn cần.'}</p></fieldset>
  </div>;
};