// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App.tsx';
import { PracticeScreen } from '../src/screens/PracticeScreen.tsx';
import { generateThinkingQuestion } from '../src/engine/generators/thinking.ts';
import { clearProgressState, createInitialState, loadProgressState, saveProgressState } from '../src/storage/localProgress.ts';
import { vietnamDate } from '../src/engine/activity.ts';
import { RawAnswerValue, SessionConfiguration } from '../src/engine/types.ts';
import { testLocks } from './helpers/locks.ts';
import { DailyStatsPanel } from '../src/components/DailyStatsPanel.tsx';

let container: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'performance', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('navigator', { locks: testLocks() });
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  window.localStorage.clear(); clearProgressState();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function hide(hidden: boolean) {
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(hidden);
  await act(async () => document.dispatchEvent(new Event('visibilitychange')));
}
async function button(text: string) {
  const node = [...container.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.trim().startsWith(text));
  expect(node, text).toBeDefined(); await act(async () => node!.click());
}
async function submit(value: RawAnswerValue) {
  const inputs = [...container.querySelectorAll<HTMLInputElement>('.answer-area input[type="text"]')];
  if (!inputs.length && typeof value === 'number') {
    await act(async () => container.querySelector<HTMLInputElement>(`.answer-area input[type="radio"][value="${value}"]`)!.click());
  }
  const values = Array.isArray(value) ? value : typeof value === 'number' ? [value] : 'hour' in value ? [value.hour, value.minute] : [value.day, value.month, value.year];
  await act(async () => {
    inputs.forEach((node, i) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(node, String(values[i])); node.dispatchEvent(new Event('input', { bubbles: true })); });
  });
  await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
async function mountApp(config: SessionConfiguration = { topic: 'addition', level: 1, mode: 'normal' }, auto = true) {
  saveProgressState({ ...createInitialState(), lastSelection: config, preferences: { autoAdvanceNormal: auto } });
  await act(async () => root.render(<App />));
}
function additionAnswer() {
  const text = container.querySelector('.question-math')!.textContent!;
  const plain = text.match(/(\d+) \+ (\d+) =/);
  const missing = text.match(/(\d+) \+ □ = (\d+)/);
  return plain ? Number(plain[1]) + Number(plain[2]) : Number(missing![2]) - Number(missing![1]);
}
describe('Actual React session lifecycle', () => {
  it('saves all 20 correct answers immediately and includes the last answer in the summary', async () => {
    await mountApp(); await button('Bắt đầu 20 câu');
    for (let i = 1; i <= 20; i++) {
      expect(container.querySelector('.question-counter')!.textContent).toContain(`Câu ${i}/20`);
      await submit(additionAnswer());
      expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(i);
      await act(async () => { vi.advanceTimersByTime(300); });
    }
    expect(container.querySelector('.score-display')?.textContent).toBe('20/20');
    const state = loadProgressState().state;
    expect(state.recentSessions.slice(-1)[0].scoredCount).toBe(20);
    expect(new Set(state.topicLevelWindows['normal:addition:1'].map(a => a.sessionId)).size).toBe(1);
  });
  it('keeps a visible next button when auto advance is off, and exiting retains partial progress', async () => {
    await mountApp(undefined, false); await button('Bắt đầu 20 câu'); await submit(additionAnswer());
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(container.querySelector('.question-counter')!.textContent).toContain('Câu 1/20');
    await button('Câu tiếp');
    await act(async () => container.querySelector<HTMLButtonElement>('.btn-back')!.click());
    expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
    expect(loadProgressState().state.recentSessions.slice(-1)[0].status).toBe('interrupted');
    await act(async () => root.unmount()); root = createRoot(container);
    await act(async () => root.render(<App />));
    expect(container.querySelector('.today-stats dd')!.textContent).toBe('1');
  });
  it('a guided problem counts once after all steps and a retry marks it assisted', async () => {
    const q = generateThinkingQuestion('decomposition', 1, 7193);
    const completed = vi.fn();
    await act(async () => root.render(<PracticeScreen sessionId="guided" configuration={{ topic: 'decomposition', level: 1, mode: 'learn' }} currentQuestion={q} questionIndex={0} totalQuestions={10} autoAdvanceNormal onAttemptCompleted={completed} onExitSession={() => {}} onNextQuestion={() => {}} />));
    expect(container.querySelector('.timer-row')).toBeNull();
    await submit(999); expect(completed).not.toHaveBeenCalled();
    for (let i = 0; i < q.steps!.length; i++) {
      await submit(q.steps![i].answer);
      if (i < q.steps!.length - 1) { expect(completed).not.toHaveBeenCalled(); await button('Bước tiếp'); }
    }
    expect(completed).toHaveBeenCalledTimes(1); expect(completed.mock.calls[0][0].status).toBe('assisted');
    await act(async () => container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(completed).toHaveBeenCalledTimes(1);
  });
  it('does not auto advance after leaving a completed question', async () => {
    await mountApp(); await button('Bắt đầu 20 câu'); await submit(additionAnswer());
    await act(async () => container.querySelector<HTMLButtonElement>('.btn-back')!.click());
    await act(async () => { vi.advanceTimersByTime(60000); });
    expect(container.querySelector('.practice-card')).toBeNull();
    expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
  });
  it('accepts a geometry MCQ followed by a decimal step without counting substeps', async () => {
    const q = generateThinkingQuestion('geometry', 1, 338);
    const completed = vi.fn();
    await act(async () => root.render(<PracticeScreen sessionId="area" configuration={{ topic: 'geometry', level: 1, mode: 'learn' }} currentQuestion={q} questionIndex={0} totalQuestions={10} autoAdvanceNormal onAttemptCompleted={completed} onExitSession={() => {}} onNextQuestion={() => {}} />));
    expect(container.querySelector('svg[role="img"]')).not.toBeNull();
    await submit(q.steps![0].answer); expect(completed).not.toHaveBeenCalled(); await button('Bước tiếp');
    await submit(q.steps![1].answer);
    expect(completed).toHaveBeenCalledTimes(1); expect(completed.mock.calls[0][0].status).toBe('correct');
  });
  it('accepts signed factor pairs in either order in timed practice', async () => {
    const q = generateThinkingQuestion('factoring', 4, 7193);
    const completed = vi.fn();
    await act(async () => root.render(<PracticeScreen sessionId="factor" configuration={{ topic: 'factoring', level: 4, mode: 'normal' }} currentQuestion={q} questionIndex={0} totalQuestions={20} autoAdvanceNormal={false} onAttemptCompleted={completed} onExitSession={() => {}} onNextQuestion={() => {}} />));
    await submit((q.answer as number[]).slice().reverse());
    expect(completed).toHaveBeenCalledTimes(1); expect(completed.mock.calls[0][0].status).toBe('correct');
  });
  it('preserves an unfinished answer and excludes time spent paused', async () => {
    await mountApp(undefined, false); await button('Bắt đầu 20 câu');
    const input = container.querySelector<HTMLInputElement>('.answer-area input')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, '42'); input.dispatchEvent(new Event('input', { bubbles: true })); vi.advanceTimersByTime(1000); });
    await hide(true); await act(async () => { vi.advanceTimersByTime(30000); });
    expect(loadProgressState().state.dailyStats[vietnamDate()]).toBeUndefined();
    await hide(false); await button('Tiếp tục làm bài');
    expect(container.querySelector<HTMLInputElement>('.answer-area input')!.value).toBe('42');
    await submit(additionAnswer());
    const a = loadProgressState().state.topicLevelWindows['normal:addition:1'][0];
    expect(a.status).toBe('correct'); expect(a.elapsedMs).toBe(1000); expect(a.timingEligible).toBe(false);
  });
  it('holds correct feedback while hidden and starts the next question only after resume', async () => {
    await mountApp(); await button('Bắt đầu 20 câu'); await submit(additionAnswer()); await hide(true);
    await act(async () => { vi.advanceTimersByTime(30000); });
    expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
    expect(container.querySelector('.question-counter')!.textContent).toContain('Câu 1/20');
    await hide(false); await button('Tiếp tục làm bài');
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(container.querySelector('.question-counter')!.textContent).toContain('Câu 2/20');
    expect(loadProgressState().state.dailyStats[vietnamDate()].timeout).toBe(0);
  });
  it('preserves a selected option and the current learning step after pause', async () => {
    await mountApp({ topic: 'geometry', level: 1, mode: 'learn' }); await button('Bắt đầu 10 bài');
    const radio = container.querySelector<HTMLInputElement>('input[type="radio"]')!;
    await act(async () => radio.click());
    const value = radio.value;
    await hide(true); await hide(false); await button('Tiếp tục làm bài');
    expect(container.querySelector<HTMLInputElement>('input[type="radio"]:checked')!.value).toBe(value);
    expect(container.querySelector('.learning-step .eyebrow')!.textContent).toBe('Bước 1/2');
  });
  it('ends hard practice on hiding, saves previous answers and frees the practice lock', async () => {
    await mountApp({ topic: 'addition', level: 1, mode: 'hard' }); await button('Bắt đầu 20 câu'); await submit(additionAnswer());
    await hide(true);
    expect(container.querySelector('.practice-card')).toBeNull();
    expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
    await hide(false); await button('Bắt đầu 20 câu');
    expect(container.querySelector('.practice-card')).not.toBeNull();
  });
  it.each(['correct', 'incorrect', 'skipped', 'timeout'] as const)('finalizes the session immediately when its last answer is %s', async status => {
    await mountApp(undefined, false); await button('Bắt đầu 20 câu');
    for (let i = 0; i < 19; i++) { await submit(additionAnswer()); await button('Câu tiếp'); }
    if (status === 'skipped') await button('Bỏ qua câu này');
    else if (status === 'timeout') await act(async () => { vi.advanceTimersByTime(10000); });
    else await submit(status === 'correct' ? additionAnswer() : 999);
    expect(loadProgressState().state.recentSessions.slice(-1)[0]).toMatchObject({ status: 'completed', scoredCount: 20, unansweredCount: 0 });
    expect([...container.querySelectorAll('button')].some(b => b.textContent === 'Xem kết quả')).toBe(true);
    await act(async () => container.querySelector<HTMLButtonElement>('.practice-back')!.click());
    expect(loadProgressState().state.recentSessions.slice(-1)[0]?.status).toBe('completed');
  });
  it('blocks a second tab without replacing the first tab progress and lets it start after exit', async () => {
    await mountApp(undefined, false);
    const other = document.createElement('div'); document.body.appendChild(other); const otherRoot = createRoot(other);
    try {
      await act(async () => otherRoot.render(<App />));
      await button('Bắt đầu 20 câu'); await submit(additionAnswer());
      const start = [...other.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent?.startsWith('Bắt đầu 20 câu'))!;
      await act(async () => start.click());
      expect(other.textContent).toContain('Đang có lượt luyện ở tab khác');
      expect(other.querySelector('.practice-card')).toBeNull();
      expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
      await act(async () => [...other.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'Tùy chọn')!.click());
      await act(async () => [...other.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'Xóa toàn bộ tiến độ')!.click());
      await act(async () => [...other.querySelectorAll<HTMLButtonElement>('button')].find(b => b.textContent === 'Xác nhận xóa')!.click());
      expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
      await act(async () => container.querySelector<HTMLButtonElement>('.practice-back')!.click());
      await act(async () => start.click());
      expect(other.querySelector('.practice-card')).not.toBeNull();
      expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(1);
    } finally { await act(async () => otherRoot.unmount()); other.remove(); }
  });
  it('finalizes 10 guided problems once each, including an assisted last problem', async () => {
    await mountApp({ topic: 'decomposition', level: 1, mode: 'learn' }); await button('Bắt đầu 10 bài');
    for (let i = 0; i < 10; i++) {
      const prompt = container.querySelector('.question-life')!.textContent!;
      const values = prompt.match(/Tách (\d+) để tính nhanh (\d+) \+ \d+:[\s\S]*đủ (\d+)\./)!;
      const b = Number(values[1]), a = Number(values[2]), base = Number(values[3]);
      if (i === 9) await button('Gợi ý');
      for (const [step, value] of [base - a, b - (base - a), a + b].entries()) {
        await submit(value); if (step < 2) await button('Bước tiếp');
      }
      expect(loadProgressState().state.dailyStats[vietnamDate()].total).toBe(i + 1);
      if (i < 9) await button('Câu tiếp');
    }
    expect(loadProgressState().state.recentSessions.slice(-1)[0]).toMatchObject({ status: 'completed', scoredCount: 10, independentCorrectCount: 9, assistedCount: 1 });
    await button('Xem kết quả'); expect(container.querySelector('.score-display')!.textContent).toBe('9/10');
  });
  it('refreshes a viewing tab after a storage notification', async () => {
    await mountApp(); const state = loadProgressState().state;
    saveProgressState({ ...state, dailyStats: { [vietnamDate()]: { total: 2, correct: 2, assisted: 0, incorrect: 0, skipped: 0, timeout: 0, timedCorrectCount: 0, correctElapsedMs: 0, bySelection: {} } } });
    await act(async () => window.dispatchEvent(new StorageEvent('storage', { key: 'nham-nhanh:v2' })));
    expect(container.querySelector('.today-stats dd')!.textContent).toBe('2');
  });
  it('rejects practice when browser locks are unavailable', async () => {
    vi.stubGlobal('navigator', {}); await mountApp(); await button('Bắt đầu 20 câu');
    expect(container.textContent).toContain('Hãy cập nhật trình duyệt');
    expect(container.querySelector('.practice-card')).toBeNull();
  });
  it('updates today at Vietnamese midnight and when returning after a suspended clock', async () => {
    vi.setSystemTime(new Date('2026-10-10T16:59:59Z'));
    await act(async () => root.render(<DailyStatsPanel progress={createInitialState()} />));
    expect(container.querySelector('.section-heading .muted')!.textContent).toContain('10/10');
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(container.querySelector('.section-heading .muted')!.textContent).toContain('11/10');
    vi.setSystemTime(new Date('2026-10-12T02:00:00Z'));
    await act(async () => window.dispatchEvent(new Event('focus')));
    expect(container.querySelector('.section-heading .muted')!.textContent).toContain('12/10');
  });
});
