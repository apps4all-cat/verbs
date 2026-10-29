import { VERBS, forms, meaning, type FormKey, type Verb } from '../data/verbs';

/** En anglès l'ortografia compta: només es perdonen majúscules, espais i apòstrofs tipogràfics. */
export function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ');
}

export type Verdict =
  | { ok: true }
  | { ok: false; kind: 'typo' | 'other-verb' | 'other-form' | 'wrong'; hint?: string };

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Comprova una forma. Accepta qualsevol de les vàlides i també totes dues escrites juntes
 * («was/were», «learnt, learned»). Si falla, intenta explicar per què.
 */
export function check(input: string, verb: Verb, key: FormKey): Verdict {
  const valid = forms(verb, key);
  const answer = normalize(input);
  const parts = answer.split(/\s*[/,]\s*|\s+or\s+/).filter(Boolean);
  if (parts.length > 0 && parts.every((p) => valid.includes(p))) return { ok: true };

  const given = parts[0] ?? '';
  const mixed = (['base', 'past', 'pp'] as FormKey[]).find((k) => k !== key && forms(verb, k).includes(given));
  if (mixed) {
    return {
      ok: false,
      kind: 'other-form',
      hint: mixed === 'base' ? 'Aquesta és la base form.' : mixed === 'past' ? 'Aquesta és la forma del past simple.' : 'Aquesta és la del past participle.',
    };
  }
  const other = VERBS.find((v) => v.id !== verb.id && (['base', 'past', 'pp'] as FormKey[]).some((k) => forms(v, k).includes(given)));
  if (other) {
    return { ok: false, kind: 'other-verb', hint: `Compte: «${given}» és del verb ${other.base} (${meaning(other)}).` };
  }
  if (valid.some((f) => distance(given, f) === 1 && f.length > 2)) {
    return { ok: false, kind: 'typo', hint: 'Gairebé! Revisa l’ortografia.' };
  }
  if (/ed$/.test(given) && key !== 'base') {
    return { ok: false, kind: 'wrong', hint: 'És irregular: no fa -ed!' };
  }
  return { ok: false, kind: 'wrong' };
}

/** Comprova la traducció (en l'idioma triat): n'hi ha prou amb una de les que dona el full. */
export function checkMeaning(input: string, verb: Verb): boolean {
  const strip = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\(.*?\)|-se\b|'s\b/g, '')
      .replace(/l·l|l\.l/g, 'll')
      .replace(/[^a-z ]/g, '')
      .trim();
  const answer = strip(input);
  if (!answer) return false;
  return meaning(verb).split(',').some((t) => strip(t) === answer);
}
