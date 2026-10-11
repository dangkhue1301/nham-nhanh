import React, { useEffect, useRef, useState } from 'react';
import { Preferences } from '../engine/types.ts';

interface Props {
  isOpen: boolean; preferences: Preferences; isPersisted: boolean;
  onClose: () => void; onUpdatePreferences: (pref: Preferences) => void; onClearProgress: () => void;
}
export const PreferencesModal: React.FC<Props> = ({ isOpen, preferences, isPersisted, onClose, onUpdatePreferences, onClearProgress }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!isOpen) return;
    setConfirmClear(false);
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLElement>('input, button')?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const nodes = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="modal-overlay" onClick={onClose}>
    <div ref={dialog} className="modal-content" role="dialog" aria-modal="true" aria-labelledby="preferences-title" onClick={e => e.stopPropagation()}>
      <div className="section-heading"><h2 id="preferences-title">Tùy chọn luyện tập</h2><button className="btn-back" aria-label="Đóng tùy chọn" onClick={onClose}>×</button></div>
      <label className="checkbox-control"><input type="checkbox" checked={preferences.autoAdvanceNormal} onChange={e => onUpdatePreferences({ autoAdvanceNormal: e.target.checked })} /><span>Tự chuyển câu sau khi trả lời đúng<small>Áp dụng cho Luyện nhẩm. Học từng bước luôn chờ bạn.</small></span></label>
      <p className="muted">{isPersisted ? 'Tiến độ đang được lưu trên trình duyệt này.' : 'Trình duyệt chưa lưu được dữ liệu; kết quả chỉ giữ trong phiên đang mở.'}</p>
      <div className="clear-progress">{!confirmClear ? <button className="btn-secondary danger-button" onClick={() => setConfirmClear(true)}>Xóa toàn bộ tiến độ</button> : <div><p className="error-text">Xóa số liệu theo ngày, lịch sử luyện và bản dữ liệu cũ? Không thể khôi phục sau khi xóa.</p><div className="confirm-actions"><button className="btn-secondary" onClick={() => setConfirmClear(false)}>Giữ dữ liệu</button><button className="btn-primary danger-button" onClick={() => { onClearProgress(); onClose(); }}>Xác nhận xóa</button></div></div>}</div>
      <div className="modal-actions"><button className="btn-secondary" onClick={onClose}>Đóng</button></div>
    </div>
  </div>;
};
