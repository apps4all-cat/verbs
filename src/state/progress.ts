import { GROUPS, TOTAL_GROUPS, VERBS, groupOfVerb, verbsInGroup, type Lang, type Verb } from '../data/verbs';

const STORAGE_KEY = 'verbs-irregulars-progress-v1';

/** Els jocs de grup que donen estrelles. Trios i Completa la taula el fan superar; En context és opcional i suma estrelles extra. */
export type GroupGame = 'trio' | 'table' | 'context';

/** Jocs obligatoris per superar un grup. */
export const REQUIRED_GAMES = ['trio', 'table'] as const;

export const GAME_LABELS: Record<GroupGame, string> = {
  trio: '🔗 Trios',
  table: '✏️ Completa la taula',
  context: '💬 En context',
};

/** Aspecte de l'app: fosc (el de sempre), clar o el que tingui el mòbil. */
export type Theme = 'dark' | 'light' | 'auto';

export interface Settings {
  relaxed: boolean;
  /** idioma de les traduccions */
  lang: Lang;
  theme: Theme;
}

export interface GroupProgress {
  best: Record<GroupGame, number>; // 0..1 millor encert de cada joc
  stars: number; // 0..9
  completed: boolean;
  /** última vegada que s'hi ha jugat (ms): si fa dies, el grup «es rovella» i demana repàs */
  lastPlayed: number;
}

export interface ProgressState {
  unlockedGroups: number;
  groups: Record<number, GroupProgress>;
  /** cartes de verb aconseguides */
  collected: string[];
  totalStars: number;
  crazyBest: number;
  examBest: number; // millor nota (0-10)
  simBest: number; // millor nota del simulacre d'examen (0-10)
  dictationBest: number;
  spotBest: number;
  /** «deute» de cada verb: puja quan falles i baixa quan l'encertes. Els que en tenen són els teus enemics. */
  debt: Record<string, number>;
  /** respostes totals, per a les estadístiques */
  answered: number;
  correct: number;
  streak: { days: number; last: string };
  settings: Settings;
}

function emptyGroup(): GroupProgress {
  return { best: { trio: 0, table: 0, context: 0 }, stars: 0, completed: false, lastPlayed: 0 };
}

function defaultState(): ProgressState {
  const groups: Record<number, GroupProgress> = {};
  for (let g = 1; g <= TOTAL_GROUPS; g++) groups[g] = emptyGroup();
  return {
    unlockedGroups: 1,
    groups,
    collected: [],
    totalStars: 0,
    crazyBest: 0,
    examBest: 0,
    simBest: 0,
    dictationBest: 0,
    spotBest: 0,
    debt: {},
    answered: 0,
    correct: 0,
    streak: { days: 0, last: '' },
    settings: { relaxed: false, lang: 'ca', theme: 'dark' },
  };
}

export function loadProgress(): ProgressState {
  const base = defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const groups = { ...base.groups };
    for (const [k, g] of Object.entries(parsed.groups ?? {})) {
      groups[Number(k)] = { ...emptyGroup(), ...g, best: { ...emptyGroup().best, ...g.best } };
    }
    return {
      ...base,
      ...parsed,
      groups,
      streak: { ...base.streak, ...parsed.streak },
      settings: { ...base.settings, ...parsed.settings },
      debt: parsed.debt ?? {},
      collected: parsed.collected ?? [],
    };
  } catch {
    return base;
  }
}

export function saveProgress(state: ProgressState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sense emmagatzematge: el progrés dura mentre l'app és oberta
  }
}

/** Estrelles (0-3) d'una partida: 100%→3, ≥80%→2, ≥50%→1. */
export function starsForAccuracy(accuracy: number): number {
  if (accuracy >= 1) return 3;
  if (accuracy >= 0.8) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

export function starsForResult(correct: number, total: number): number {
  return starsForAccuracy(total > 0 ? correct / total : 0);
}

export function neededForNextStar(correct: number, total: number): number | null {
  const stars = starsForResult(correct, total);
  if (stars >= 3) return null;
  const nextFraction = stars === 2 ? 1 : stars === 1 ? 0.8 : 0.5;
  return Math.max(1, Math.ceil(nextFraction * total) - correct);
}

export const UNLOCK_TOTAL_STARS = 4; // de 6 (Trios i Completa la taula, 3 estrelles cadascun)
export const UNLOCK_MIN_STARS_PER_GAME = 1; // cap dels dos no es pot saltar

export function groupModeStatus(g: GroupProgress) {
  const trio = starsForAccuracy(g.best.trio);
  const table = starsForAccuracy(g.best.table);
  const context = starsForAccuracy(g.best.context);
  return {
    trio,
    table,
    context,
    /** estrelles que compten per superar el grup (sense En context) */
    required: trio + table,
    /** totes, també les extra d'En context: és el que suma al rang */
    total: trio + table + context,
    meetsSafetyNet: trio >= UNLOCK_MIN_STARS_PER_GAME && table >= UNLOCK_MIN_STARS_PER_GAME,
  };
}

function isGroupMastered(g: GroupProgress): boolean {
  const s = groupModeStatus(g);
  return s.required >= UNLOCK_TOTAL_STARS && s.meetsSafetyNet;
}

export interface RoundOutcome {
  state: ProgressState;
  justUnlockedGroup?: number;
  newlyCollected: string[];
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Ratxa de dies seguits jugant (com Duolingo). */
function touchStreak(state: ProgressState) {
  const t = today();
  if (state.streak.last === t) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  state.streak = { days: state.streak.last === yesterday ? state.streak.days + 1 : 1, last: t };
}

/** Ratxa visible: si ahir no es va jugar, ja s'ha perdut. */
export function currentStreak(state: ProgressState): number {
  const t = today();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  return state.streak.last === t || state.streak.last === yesterday ? state.streak.days : 0;
}

export function recordGroupResult(state: ProgressState, group: number, game: GroupGame, correct: number, total: number): RoundOutcome {
  const g = state.groups[group];
  g.best[game] = Math.max(g.best[game], total > 0 ? correct / total : 0);
  g.lastPlayed = Date.now();
  const wasCompleted = g.completed;
  g.completed = g.completed || isGroupMastered(g);
  const prevStars = g.stars;
  g.stars = groupModeStatus(g).total;
  state.totalStars += Math.max(0, g.stars - prevStars);
  touchStreak(state);

  let justUnlockedGroup: number | undefined;
  let newlyCollected: string[] = [];
  if (!wasCompleted && g.completed) {
    const ids = GROUPS[group - 1].ids;
    newlyCollected = ids.filter((id) => !state.collected.includes(id));
    state.collected = [...state.collected, ...newlyCollected];
    if (state.unlockedGroups === group && group < TOTAL_GROUPS) {
      state.unlockedGroups = group + 1;
      justUnlockedGroup = group + 1;
    }
  }
  saveProgress(state);
  return { state: { ...state }, justUnlockedGroup, newlyCollected };
}

/** Anota cada resposta d'un verb: els errors fan pujar el deute (els «enemics»), els encerts el fan baixar. */
export function recordAnswer(state: ProgressState, verbId: string, ok: boolean): ProgressState {
  const d = state.debt[verbId] ?? 0;
  const next = ok ? Math.max(0, d - 1) : Math.min(6, d + 2);
  const debt = { ...state.debt };
  if (next === 0) delete debt[verbId];
  else debt[verbId] = next;
  const groupId = groupOfVerb(verbId);
  if (groupId > 0 && state.groups[groupId]) state.groups[groupId].lastPlayed = Date.now();
  const updated = { ...state, debt, answered: state.answered + 1, correct: state.correct + (ok ? 1 : 0) };
  saveProgress(updated);
  return updated;
}

export function recordFreeRound(state: ProgressState, field: 'crazyBest' | 'examBest' | 'simBest' | 'dictationBest' | 'spotBest', score: number) {
  const newRecord = score > state[field];
  const next = { ...state, [field]: Math.max(state[field], score) };
  touchStreak(next);
  saveProgress(next);
  return { state: next, newRecord };
}

export function updateSettings(state: ProgressState, change: Partial<Settings>): ProgressState {
  const next = { ...state, settings: { ...state.settings, ...change } };
  saveProgress(next);
  return next;
}

export function unlockedVerbs(state: ProgressState): Verb[] {
  const out: Verb[] = [];
  for (let g = 1; g <= state.unlockedGroups; g++) out.push(...verbsInGroup(g));
  return out;
}

/** Verbs dels grups superats: el banc del mode Crazy, que creix a mesura que avances. */
export function masteredVerbs(state: ProgressState): Verb[] {
  const out: Verb[] = [];
  for (let g = 1; g <= TOTAL_GROUPS; g++) if (state.groups[g]?.completed) out.push(...verbsInGroup(g));
  return out;
}

export function enemies(state: ProgressState): Verb[] {
  return VERBS.filter((v) => (state.debt[v.id] ?? 0) > 0).sort((a, b) => (state.debt[b.id] ?? 0) - (state.debt[a.id] ?? 0));
}

const RUST_DAYS = 7;

/** Grup superat al qual fa més d'una setmana que no s'hi juga. */
export function isRusty(state: ProgressState, group: number): boolean {
  const g = state.groups[group];
  return !!g?.completed && g.lastPlayed > 0 && Date.now() - g.lastPlayed > RUST_DAYS * 86_400_000;
}

export function currentPracticeGroup(state: ProgressState): number {
  for (let g = 1; g <= state.unlockedGroups; g++) {
    if (!state.groups[g].completed) return g;
  }
  return state.unlockedGroups;
}

/** Tria verbs a l'atzar donant més pes als que falles (repàs espaiat senzill). */
export function weightedPick(state: ProgressState, pool: Verb[], n: number): Verb[] {
  const bag = pool.map((v) => ({ v, w: 1 + 2 * (state.debt[v.id] ?? 0) + Math.random() * 3 }));
  bag.sort((a, b) => b.w - a.w);
  return bag.slice(0, n).map((x) => x.v);
}

export const RANKS = [
  { min: 0, name: 'Rookie', emoji: '🥚' },
  { min: 15, name: 'Bronze', emoji: '🥉' },
  { min: 45, name: 'Plata', emoji: '🥈' },
  { min: 90, name: 'Or', emoji: '🥇' },
  { min: 140, name: 'Diamant', emoji: '💎' },
  { min: 175, name: 'Màster', emoji: '👑' },
];

export function rankOf(stars: number) {
  let r = RANKS[0];
  for (const x of RANKS) if (stars >= x.min) r = x;
  const next = RANKS[RANKS.indexOf(r) + 1];
  return { ...r, next };
}
