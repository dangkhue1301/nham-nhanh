import React, { useState } from 'react';
import { Preferences } from '../engine/types.ts';

interface PreferencesModalProps {
  isOpen: boolean;
  preferences: Preferences;
  isPersisted: boolean;
  onClose: () => void;
  onUpdatePreferences: (pref: Preferences) => void;
  onClearProgress: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  preferences,
  isPersisted,
  onClose,
  onUpdatePreferences,
  onClearProgress
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Tùy chọn luyện tập</h3>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={preferences.autoAdvanceNormal}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  autoAdvanceNormal: e.target.checked
                })
              }
              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
              Tự động chuyển câu khi đúng ở Normal (300ms)
            </span>
          </label>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          {isPersisted
            ? '✓ Tiến độ lưu trên trình duyệt này.'
            : '⚠ Phiên này chưa lưu được tiến độ vào trình duyệt (đang dùng bộ nhớ phiên).'}
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginBottom: '16px' }}>
          {!confirmClear ? (
            <button
              type="button"
              className="btn-secondary"
              style={{ color: 'var(--color-error)', borderColor: '#FCA5A5' }}
              onClick={() => setConfirmClear(true)}
            >
              Xóa dữ liệu tiến độ
            </button>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--color-error)', marginBottom: '8px' }}>
                Bạn có chắc chắn muốn xóa toàn bộ lịch sử ôn tập và điểm số?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: 'var(--color-error)' }}
                  onClick={() => {
                    onClearProgress();
                    setConfirmClear(false);
                    onClose();
                  }}
                >
                  Xác nhận xóa
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setConfirmClear(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
