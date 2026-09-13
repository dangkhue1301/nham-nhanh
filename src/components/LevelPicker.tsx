import React from 'react';
import { Mode, SessionConfiguration, Topic } from '../engine/types.ts';
import { LEVEL_LABELS, TOPIC_NAMES } from '../engine/catalog.ts';

interface LevelPickerProps {
  configuration: SessionConfiguration;
  onChange: (config: SessionConfiguration) => void;
}

export const LevelPicker: React.FC<LevelPickerProps> = ({ configuration, onChange }) => {
  const topics: Topic[] = [
    'addition',
    'subtraction',
    'multiplication',
    'division',
    'mixed',
    'money',
    'time',
    'calendar'
  ];

  const handleTopicChange = (topic: Topic) => {
    onChange({
      ...configuration,
      topic,
      level: 1,
      tableId: (topic === 'multiplication' || topic === 'division') ? undefined : undefined
    });
  };

  const handleLevelChange = (level: number) => {
    onChange({
      ...configuration,
      level
    });
  };

  const handleModeChange = (mode: Mode) => {
    onChange({
      ...configuration,
      mode
    });
  };

  const handleTableChange = (tableIdVal: string) => {
    const tableId = tableIdVal === 'all' ? undefined : Number(tableIdVal);
    onChange({
      ...configuration,
      tableId
    });
  };

  const isBasicTableTopic =
    (configuration.topic === 'multiplication' || configuration.topic === 'division') &&
    configuration.level === 1;

  const currentLevelLabels = LEVEL_LABELS[configuration.topic];

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Chủ đề</label>
        <select
          className="select-control"
          value={configuration.topic}
          onChange={(e) => handleTopicChange(e.target.value as Topic)}
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {TOPIC_NAMES[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Cấp độ</label>
        <select
          className="select-control"
          value={configuration.level}
          onChange={(e) => handleLevelChange(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((lvl) => (
            <option key={lvl} value={lvl}>
              {currentLevelLabels[lvl]}
            </option>
          ))}
        </select>
      </div>

      {isBasicTableTopic && (
        <div className="form-group">
          <label className="form-label">Bảng đang luyện</label>
          <select
            className="select-control"
            value={configuration.tableId ?? 'all'}
            onChange={(e) => handleTableChange(e.target.value)}
          >
            <option value="all">Tất cả các bảng (2–9)</option>
            {[2, 3, 4, 5, 6, 7, 8, 9].map((tbl) => (
              <option key={tbl} value={tbl}>
                Bảng {tbl}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Tốc độ luyện tập</label>
        <div className="mode-toggle-group">
          <button
            type="button"
            className={`mode-btn ${configuration.mode === 'normal' ? 'active' : ''}`}
            onClick={() => handleModeChange('normal')}
          >
            Normal · Bình thường
          </button>
          <button
            type="button"
            className={`mode-btn ${configuration.mode === 'hard' ? 'active' : ''}`}
            onClick={() => handleModeChange('hard')}
          >
            Hard · Tốc độ cao
          </button>
        </div>
      </div>
    </div>
  );
};
