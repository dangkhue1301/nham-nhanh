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

let container: HTMLDivElement, root: Root;
beforeEach(() => {
  vi.useFakeTimers(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  window.localStorage.clear(); clearProgressState();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); });
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
});
