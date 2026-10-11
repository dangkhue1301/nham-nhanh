import { useEffect } from 'react';

// Adapted from evondevKit's ui-ux/rules-state.md (MIT; see THIRD_PARTY_NOTICES.md).
export function ScrollbarAutohide() {
  useEffect(() => {
    const timers = new Map<Element, number>();
    const handleScroll = (event: Event) => {
      const element = event.target instanceof Element ? event.target : document.scrollingElement;
      if (!element) return;
      element.classList.add('is-scrolling');
      window.clearTimeout(timers.get(element));
      timers.set(element, window.setTimeout(() => { element.classList.remove('is-scrolling'); timers.delete(element); }, 700));
    };
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => { window.removeEventListener('scroll', handleScroll, { capture: true }); for (const [element, timer] of timers) { window.clearTimeout(timer); element.classList.remove('is-scrolling'); } };
  }, []);
  return null;
}
