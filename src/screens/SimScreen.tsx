import { useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Confetti } from '../components/Confetti';
import { useProgress } from '../state/ProgressContext';
import { recordAnswer, recordFreeRound, unlockedVerbs } from '../state/progress';
import { LANG_NAME, VERBS, currentLang, display, meaning, meaningPrompt, type FormKey, type Verb } from '../data/verbs';
import { check, checkMeaning } from '../utils/answer';
import { shuffle } from '../utils/random';
import { playClick, playUnlock } from '../utils/audio';

/** Les quatre columnes del full d'examen. 'ca' és la traducció, en l'idioma triat a les opcions. */
type Col = FormKey | 'ca';
const COLS: Col[] = ['base', 'past', 'pp', 'ca'];

type Level = 'easy' | 'medium' | 'hard' | 'real';

const LEVELS: { id: Level; title: string; desc: string }[] = [
  { id: 'easy', title: '🟢 Fàcil', desc: 'Falta 1 casella de cada verb.' },
  { id: 'medium', title: '🟡 Mitjà', desc: 'Falten 2 caselles de cada verb.' },
  { id: 'hard', title: '🔴 Difícil', desc: 'Només en veus una: de vegades, la traducció.' },
  { id: 'real', title: '🔥 Com a l’examen', desc: 'Només la traducció: escriu les tres formes.' },
];

const SIZES = [10, 20, 30];

interface Row {
  verb: Verb;
  /** columnes que s'han d'omplir */
  blanks: Col[];
}

function blanksFor(level: Level): Col[] {
  if (level === 'real') return ['base', 'past', 'pp'];
  const missing = level === 'easy' ? 1 : level === 'medium' ? 2 : 3;
  const blanks = shuffle(COLS).slice(0, missing);
  return COLS.filter((c) => blanks.includes(c));
}

function isRight(row: Row, col: Col, value: string): boolean {
  return col === 'ca' ? checkMeaning(value, row.verb) : check(value, row.verb, col).ok;
}

function cellText(v: Verb, col: Col, given: boolean): string {
  if (col !== 'ca') return display(v, col);
  // Si la traducció és l'única pista, s'hi afegeix la inicial quan dos verbs la comparteixen (fer: do / make).
  return given ? meaningPrompt(v) : meaning(v);
}

/**
 * Simulacre d'examen: el full de sempre, una taula de quatre columnes (base, past, participle i traducció)
 * amb caselles buides segons el nivell. Es lliura sencer i es corregeix tot alhora, amb nota sobre 10.
 */
export function SimScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const unlocked = unlockedVerbs(progress);
  const [level, setLevel] = useState<Level>('real');
  const [size, setSize] = useState(20);
  const [allVerbs, setAllVerbs] = useState(true);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ grade: number; points: number; total: number; newRecord: boolean } | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const langTitle = LANG_NAME[currentLang()].replace(/^./, (c) => c.toUpperCase());

  function start() {
    playClick();
    const pool = allVerbs ? VERBS : unlocked;
    setRows(shuffle(pool).slice(0, Math.min(size, pool.length)).map((verb) => ({ verb, blanks: blanksFor(level) })));
    setValues({});
    setResult(null);
    refs.current = [];
    window.scrollTo(0, 0);
  }

  function hand() {
    if (!rows) return;
    let points = 0;
    let total = 0;
    for (const r of rows) {
      let all = true;
      for (const c of r.blanks) {
        total += 1;
        if (isRight(r, c, values[`${r.verb.id}:${c}`] ?? '')) points += 1;
        else all = false;
      }
      apply((s) => recordAnswer(s, r.verb.id, all));
    }
    const grade = total ? Math.round((points / total) * 100) / 10 : 0;
    const rec = apply((s) => recordFreeRound(s, 'simBest', grade));
    if (grade >= 5) playUnlock();
    setResult({ grade, points, total, newRecord: rec.newRecord });
    window.scrollTo(0, 0);
  }

  if (!rows) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
        <TopBar title="📝 Simulacre d’examen" onBack={onBack} />
        <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: '0.92rem' }}>
          La taula de verbs com al full d’examen: quatre columnes i caselles buides per omplir. No hi ha correcció fins que el lliures.
        </p>

        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Dificultat</strong>
          {LEVELS.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={level === l.id}
              className={`btn btn--small ${level === l.id ? 'btn--blue' : 'btn--ghost'}`}
              style={{ justifyContent: 'flex-start', textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
              onClick={() => {
                playClick();
                setLevel(l.id);
              }}
            >
              <span>{l.title}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.85 }}>{l.desc}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <strong>Quants verbs?</strong>
          <div style={{ display: 'flex', gap: 8 }}>
            {SIZES.map((n) => (
              <button key={n} className={`btn btn--small ${size === n ? 'btn--blue' : 'btn--ghost'}`} onClick={() => setSize(n)}>
                {n}
              </button>
            ))}
          </div>
          <strong style={{ marginTop: 6 }}>Quins verbs?</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={`btn btn--small ${allVerbs ? 'btn--blue' : 'btn--ghost'}`} onClick={() => setAllVerbs(true)}>
              Tots els 99
            </button>
            <button className={`btn btn--small ${!allVerbs ? 'btn--blue' : 'btn--ghost'}`} onClick={() => setAllVerbs(false)}>
              Els desbloquejats ({unlocked.length})
            </button>
          </div>
        </div>

        <button className="btn btn--pink" style={{ alignSelf: 'center', fontSize: '1.2rem', padding: '16px 40px' }} onClick={start}>
          Comença l’examen
        </button>
        {progress.simBest > 0 && (
          <p style={{ textAlign: 'center', margin: 0, color: 'var(--ink-muted)' }}>🏅 Millor nota: {progress.simBest.toLocaleString('ca')}</p>
        )}
      </div>
    );
  }

  const empty = rows.reduce((n, r) => n + r.blanks.filter((c) => !(values[`${r.verb.id}:${c}`] ?? '').trim()).length, 0);
  const color = result ? (result.grade >= 9 ? 'var(--green)' : result.grade >= 5 ? 'var(--yellow)' : 'var(--red)') : '';
  const header: Record<Col, string> = { base: 'Base form', past: 'Past simple', pp: 'Past participle', ca: langTitle };
  let inputIndex = 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
      {result && result.grade >= 9 && <Confetti />}
      <TopBar title="📝 Simulacre d’examen" onBack={onBack} />

      {result && (
        <div className="card bounce-in" style={{ padding: 16, textAlign: 'center' }}>
          <div className="label">Nota</div>
          <div style={{ fontSize: '3.4rem', fontWeight: 700, color, lineHeight: 1.1 }}>{result.grade.toLocaleString('ca')}</div>
          <div style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            {result.points} de {result.total} caselles bé · {LEVELS.find((l) => l.id === level)?.title}
            {result.newRecord && ' · 🏅 millor nota!'}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '8px 8px 4px' }}>
        <div className="sim-row sim-head">
          {COLS.map((c) => (
            <span key={c}>{header[c]}</span>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.verb.id} className="sim-row">
            {COLS.map((c) => {
              if (!r.blanks.includes(c)) {
                return (
                  <span key={c} className={`sim-given ${c === 'ca' ? 'sim-given--ca' : ''}`}>
                    {cellText(r.verb, c, true)}
                  </span>
                );
              }
              const id = `${r.verb.id}:${c}`;
              const value = values[id] ?? '';
              const ok = result ? isRight(r, c, value) : null;
              const my = inputIndex++;
              return (
                <span key={c} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <input
                    ref={(el) => {
                      refs.current[my] = el;
                    }}
                    value={value}
                    disabled={!!result}
                    onChange={(e) => setValues((vs) => ({ ...vs, [id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        refs.current[my + 1]?.focus();
                      }
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    enterKeyHint="next"
                    aria-label={`${header[c]} de ${r.blanks.includes('ca') ? r.verb.base : cellText(r.verb, 'ca', true)}`}
                    className={`answer-input sim-input ${ok === null ? '' : ok ? 'answer-input--ok' : 'answer-input--ko'}`}
                  />
                  {ok === false && <strong className="sim-fix">{cellText(r.verb, c, false)}</strong>}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {!result ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {empty > 0 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              {empty === 1 ? 'Queda 1 casella buida' : `Queden ${empty} caselles buides`}: comptaran com a error.
            </span>
          )}
          <button className="btn btn--pink" onClick={hand}>
            ✋ Lliura l’examen
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', textAlign: 'center', margin: 0 }}>
            En verd, el que tens bé; en vermell, els errors amb la resposta correcta a sota.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn--green" onClick={start}>
              🔁 Un altre
            </button>
            <button className="btn btn--ghost" onClick={() => setRows(null)}>
              Canvia el nivell
            </button>
            <button className="btn btn--ghost" onClick={onBack}>
              Menú
            </button>
          </div>
        </>
      )}
    </div>
  );
}
