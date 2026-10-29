let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, gainPeak: number) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(gainPeak, c.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.02);
}

export function playCorrect() {
  tone(523.25, 0, 0.12, 'sine', 0.2);
  tone(659.25, 0.08, 0.12, 'sine', 0.2);
  tone(783.99, 0.16, 0.18, 'sine', 0.22);
}

export function playWrong() {
  tone(220, 0, 0.18, 'sawtooth', 0.12);
  tone(174.6, 0.08, 0.22, 'sawtooth', 0.12);
}

export function playClick() {
  tone(440, 0, 0.06, 'triangle', 0.1);
}

export function playUnlock() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.22, 'sine', 0.22));
}

export function playStar() {
  tone(987.77, 0, 0.1, 'sine', 0.18);
  tone(1318.5, 0.06, 0.14, 'sine', 0.18);
}
