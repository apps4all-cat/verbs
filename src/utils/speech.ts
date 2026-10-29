import { Capacitor, registerPlugin } from '@capacitor/core';
import { forms, formClip, sentence, sentenceClip, type FormKey, type Verb } from '../data/verbs';

/**
 * Pronunciació en anglès. Primer els àudios gravats dins de l'app (public/audio, veu Piper): funcionen a
 * qualsevol mòbil i sense Internet. Si un clip no hi és o no es pot reproduir, la veu del sistema.
 */
interface SpeechPlugin {
  speak(options: { text: string; rate: number }): Promise<void>;
  available(): Promise<{ available: boolean }>;
}

const Native = registerPlugin<SpeechPlugin>('Apps4AllSpeech');

/** Una peça per dir: un clip gravat i el text per si s'ha de fer amb la veu del sistema. */
interface Piece {
  clip: string;
  text: string;
}

const PAUSE_MS = 220;
let player: HTMLAudioElement | null = null;
let turn = 0;

function systemSpeak(text: string, rate: number) {
  if (Capacitor.isNativePlatform()) {
    void Native.speak({ text, rate }).catch(() => undefined);
    return;
  }
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  u.rate = rate;
  synth.speak(u);
}

function playClip(clip: string, rate: number): Promise<boolean> {
  return new Promise((resolve) => {
    player?.pause();
    const audio = new Audio(`audio/${clip}.ogg`);
    player = audio;
    // Els clips es van gravar al ritme normal (0,9 a la veu del sistema): «a poc a poc» els alenteix.
    audio.playbackRate = Math.max(0.5, Math.min(1.2, rate / 0.9));
    audio.onended = () => resolve(true);
    audio.onerror = () => resolve(false);
    audio.play().catch(() => resolve(false));
  });
}

async function say(pieces: Piece[], rate: number) {
  const mine = ++turn;
  for (let i = 0; i < pieces.length; i++) {
    if (mine !== turn) return; // ha començat una altra locució
    if (i) await new Promise((r) => setTimeout(r, PAUSE_MS));
    if (!(await playClip(pieces[i].clip, rate))) {
      // Sense el clip: la resta, d'una tirada, amb la veu del sistema.
      systemSpeak(pieces.slice(i).map((p) => p.text).join(', '), rate);
      return;
    }
  }
}

function formPieces(verb: Verb, key: FormKey, only?: string): Piece[] {
  return (only ? [only] : forms(verb, key)).map((f) => ({ clip: `w/${formClip(verb, key, f)}`, text: f }));
}

/** Diu una forma (o totes les vàlides: «was, were»). */
export function speakForm(verb: Verb, key: FormKey, rate = 0.9, only?: string) {
  void say(formPieces(verb, key, only), rate);
}

/** Diu les formes demanades seguides: per defecte, base – past – participle. */
export function speakVerb(verb: Verb, keys: FormKey[] = ['base', 'past', 'pp'], rate = 0.9) {
  void say(keys.flatMap((k) => formPieces(verb, k)), rate);
}

/** Diu la frase d'exemple del mode En context, ja completa. */
export function speakSentence(verb: Verb, key: 'past' | 'pp', rate = 0.9) {
  void say([{ clip: `s/${sentenceClip(verb, key)}`, text: sentence(verb, key) }], rate);
}

/** Sempre hi ha veu: els clips van dins de l'app. */
export async function speechAvailable(): Promise<boolean> {
  return true;
}
