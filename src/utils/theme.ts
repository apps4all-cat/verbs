import type { Theme } from '../state/progress';

const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
let current: Theme = 'dark';

function paint() {
  const light = current === 'light' || (current === 'auto' && !!media?.matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#F5F7FF' : '#121124');
}

media?.addEventListener('change', () => {
  if (current === 'auto') paint();
});

/** Posa l'aspecte clar o fosc a tota l'app (data-theme a <html>; els colors són a global.css). */
export function applyTheme(theme: Theme) {
  current = theme;
  paint();
}
