import React, { useState, useEffect, useRef } from 'react';
import { AnswerType, RawAnswerValue, WeekdayAnswer } from '../engine/types.ts';
import {
  parseIntegerAnswer,
  parseClockAnswer,
  parseDateAnswer
} from '../engine/normalizeAnswer.ts';
import { WEEKDAY_TITLES } from '../engine/calendarMath.ts';

interface AnswerInputProps {
  answerType: AnswerType;
  unit?: string;
  disabled: boolean;
  onSubmit: (val: RawAnswerValue) => void;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  answerType,
  unit,
  disabled,
  onSubmit
}) => {
  // Integer state
  const [intStr, setIntStr] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clock state
  const [clockHour, setClockHour] = useState('');
  const [clockMin, setClockMin] = useState('');

  // Date state
  const [dateDay, setDateDay] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateYear, setDateYear] = useState('');

  // Weekday state
  const [selectedWeekday, setSelectedWeekday] = useState<WeekdayAnswer | null>(null);

  const intInputRef = useRef<HTMLInputElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const dayInputRef = useRef<HTMLInputElement>(null);

  // Auto focus input when question changes
  useEffect(() => {
    setIntStr('');
    setClockHour('');
    setClockMin('');
    setDateDay('');
    setDateMonth('');
    setDateYear('');
    setSelectedWeekday(null);
    setErrorMsg(null);

    const timer = setTimeout(() => {
      if (answerType === 'integer') {
        intInputRef.current?.focus();
      } else if (answerType === 'clock') {
        hourInputRef.current?.focus();
      } else if (answerType === 'date') {
        dayInputRef.current?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [answerType]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled) return;
    setErrorMsg(null);

    if (answerType === 'integer') {
      const res = parseIntegerAnswer(intStr);
      if (!res.valid) {
        setErrorMsg(res.error || 'Đáp án chưa hợp lệ');
        return;
      }
      onSubmit(res.value!);
    } else if (answerType === 'clock') {
      const res = parseClockAnswer(clockHour, clockMin);
      if (!res.valid) {
        setErrorMsg(res.error || 'Giờ/phút chưa hợp lệ');
        return;
      }
      onSubmit(res.value!);
    } else if (answerType === 'date') {
      const res = parseDateAnswer(dateDay, dateMonth, dateYear);
      if (!res.valid) {
        setErrorMsg(res.error || 'Ngày tháng chưa hợp lệ');
        return;
      }
      onSubmit(res.value!);
    } else if (answerType === 'weekday') {
      if (!selectedWeekday) {
        setErrorMsg('Vui lòng chọn một thứ trong tuần');
        return;
      }
      onSubmit(selectedWeekday);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="answer-area">
      {answerType === 'integer' && (
        <div>
          <div style={{ position: 'relative' }}>
            <input
              ref={intInputRef}
              type="text"
              inputMode="numeric"
              className="input-control answer-input-integer"
              value={intStr}
              placeholder="?"
              disabled={disabled}
              onChange={(e) => {
                setIntStr(e.target.value);
                setErrorMsg(null);
              }}
              autoComplete="off"
            />
            {unit && (
              <span
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  pointerEvents: 'none'
                }}
              >
                {unit}
              </span>
            )}
          </div>
        </div>
      )}

      {answerType === 'clock' && (
        <div className="clock-inputs">
          <input
            ref={hourInputRef}
            type="text"
            inputMode="numeric"
            className="input-control clock-field"
            value={clockHour}
            placeholder="HH"
            maxLength={2}
            disabled={disabled}
            onChange={(e) => {
              setClockHour(e.target.value);
              setErrorMsg(null);
              if (e.target.value.length === 2) {
                const next = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
                next?.focus();
              }
            }}
          />
          <span style={{ fontSize: '24px', fontWeight: 800 }}>:</span>
          <input
            type="text"
            inputMode="numeric"
            className="input-control clock-field"
            value={clockMin}
            placeholder="mm"
            maxLength={2}
            disabled={disabled}
            onChange={(e) => {
              setClockMin(e.target.value);
              setErrorMsg(null);
            }}
          />
        </div>
      )}

      {answerType === 'date' && (
        <div className="date-inputs">
          <input
            ref={dayInputRef}
            type="text"
            inputMode="numeric"
            className="input-control date-field"
            value={dateDay}
            placeholder="DD"
            maxLength={2}
            disabled={disabled}
            onChange={(e) => {
              setDateDay(e.target.value);
              setErrorMsg(null);
            }}
          />
          <span style={{ fontSize: '20px', fontWeight: 700 }}>/</span>
          <input
            type="text"
            inputMode="numeric"
            className="input-control date-field"
            value={dateMonth}
            placeholder="MM"
            maxLength={2}
            disabled={disabled}
            onChange={(e) => {
              setDateMonth(e.target.value);
              setErrorMsg(null);
            }}
          />
          <span style={{ fontSize: '20px', fontWeight: 700 }}>/</span>
          <input
            type="text"
            inputMode="numeric"
            className="input-control date-field"
            style={{ width: '90px' }}
            value={dateYear}
            placeholder="YYYY"
            maxLength={4}
            disabled={disabled}
            onChange={(e) => {
              setDateYear(e.target.value);
              setErrorMsg(null);
            }}
          />
        </div>
      )}

      {answerType === 'weekday' && (
        <div className="weekday-buttons">
          {([2, 3, 4, 5, 6, 7, 8] as WeekdayAnswer[]).map((w) => (
            <button
              key={w}
              type="button"
              className={`weekday-btn ${selectedWeekday === w ? 'selected' : ''}`}
              disabled={disabled}
              onClick={() => {
                setSelectedWeekday(w);
                setErrorMsg(null);
              }}
            >
              {WEEKDAY_TITLES[w]}
            </button>
          ))}
        </div>
      )}

      {errorMsg && <div className="error-text">{errorMsg}</div>}

      <div style={{ display: 'none' }}>
        <button type="submit">Submit</button>
      </div>
    </form>
  );
};
