import React, { useEffect, useId, useRef, useState } from 'react';
import { AnswerSpec, RawAnswerValue, WeekdayAnswer } from '../engine/types.ts';
import { parseClockAnswer, parseDateAnswer, parseNumericAnswer } from '../engine/normalizeAnswer.ts';
import { WEEKDAY_TITLES } from '../engine/calendarMath.ts';

interface AnswerInputProps {
  questionId: string; spec: AnswerSpec; disabled: boolean;
  onSubmit: (value: RawAnswerValue) => void; submitLabel?: string;
}
export const AnswerInput: React.FC<AnswerInputProps> = ({ questionId, spec, disabled, onSubmit, submitLabel = 'Trả lời' }) => {
  const id = useId();
  const [values, setValues] = useState<string[]>([]);
  const [selection, setSelection] = useState<number | null>(null);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setValues([]); setSelection(null); setError('');
    const timer = setTimeout(() => formRef.current?.querySelector<HTMLInputElement>('input')?.focus(), 50);
    return () => clearTimeout(timer);
  }, [questionId]);

  const update = (index: number, value: string) => { setValues(prev => { const next = [...prev]; next[index] = value; return next; }); setError(''); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    if (spec.answerType === 'choice' || spec.answerType === 'weekday') {
      if (selection === null) { setError('Chọn một đáp án trước khi kiểm tra.'); return; }
      onSubmit(selection); return;
    }
    if (spec.answerType === 'clock' || spec.answerType === 'date') {
      const parsed = spec.answerType === 'clock' ? parseClockAnswer(values[0] || '', values[1] || '') : parseDateAnswer(values[0] || '', values[1] || '', values[2] || '');
      if (!parsed.valid) { setError(parsed.error || 'Đáp án chưa hợp lệ.'); return; }
      onSubmit(parsed.value!); return;
    }
    if (spec.answerType === 'blanks') {
      const parsed = (spec.fields || []).map((f, i) => parseNumericAnswer(values[i] || '', f.type));
      const invalid = parsed.findIndex(p => !p.valid);
      if (invalid >= 0) { setError(`${spec.fields![invalid].label}: ${parsed[invalid].error}`); return; }
      onSubmit(parsed.map(p => p.value as number)); return;
    }
    const parsed = parseNumericAnswer(values[0] || '', spec.answerType as 'integer' | 'signed' | 'decimal');
    if (!parsed.valid) { setError(parsed.error || 'Đáp án chưa hợp lệ.'); return; }
    onSubmit(parsed.value!);
  };
  const input = (index: number, label: string, type: 'integer' | 'signed' | 'decimal', unit?: string, maxLength?: number) => <div className="answer-field" key={index}>
    <label className="form-label" htmlFor={`${id}-${index}`}>{label}</label>
    <div className="input-with-unit">
      <input id={`${id}-${index}`} type="text" inputMode={type === 'signed' ? 'text' : type === 'decimal' ? 'decimal' : 'numeric'} className="input-control answer-number" value={values[index] || ''} placeholder={type === 'signed' ? 'Ví dụ: −3' : type === 'decimal' ? 'Ví dụ: 12,5' : '?'} maxLength={maxLength} disabled={disabled} onChange={e => update(index, e.target.value)} autoComplete="off" aria-invalid={!!error} aria-describedby={`${id}-error`} />
      {unit && <span className="input-unit">{unit}</span>}
    </div>
  </div>;
  const options = spec.answerType === 'choice' ? spec.choices!.map((label, value) => ({ label, value })) : ([2,3,4,5,6,7,8] as WeekdayAnswer[]).map(value => ({ label: WEEKDAY_TITLES[value], value }));
  return <form ref={formRef} onSubmit={submit} className="answer-area">
    {['integer','signed','decimal'].includes(spec.answerType) && input(0, 'Đáp án của bạn', spec.answerType as 'integer' | 'signed' | 'decimal', spec.unit)}
    {spec.answerType === 'blanks' && <div className="blank-fields">{spec.fields!.map((f, i) => input(i, f.label, f.type, f.unit))}</div>}
    {spec.answerType === 'clock' && <div className="date-fields">{input(0, 'Giờ (0–23)', 'integer', undefined, 2)}{input(1, 'Phút (0–59)', 'integer', undefined, 2)}</div>}
    {spec.answerType === 'date' && <div className="date-fields">{input(0, 'Ngày', 'integer', undefined, 2)}{input(1, 'Tháng', 'integer', undefined, 2)}{input(2, 'Năm', 'integer', undefined, 4)}</div>}
    {(spec.answerType === 'choice' || spec.answerType === 'weekday') && <fieldset className={spec.answerType === 'weekday' ? 'choice-grid weekdays' : 'choice-grid'}>
      <legend className="form-label">Chọn đáp án</legend>
      {options.map(({ label, value }) => <label className={`choice-option ${selection === value ? 'selected' : ''}`} key={value}>
        <input type="radio" name={id} value={value} checked={selection === value} disabled={disabled} onChange={() => { setSelection(value); setError(''); }} /><span>{label}</span>
      </label>)}
    </fieldset>}
    <div id={`${id}-error`} className="input-error" role="status" aria-live="polite">{error}</div>
    <button type="submit" className="btn-primary" disabled={disabled}>{submitLabel}<span className="key-hint" aria-hidden="true">Enter</span></button>
  </form>;
};
