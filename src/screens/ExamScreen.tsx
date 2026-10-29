import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Confetti } from '../components/Confetti';
import { TableQuestion, blanksFor, pickGiven, type Given } from '../components/TableQuestion';
import { useProgress } from '../state/ProgressContext';
import { recordAnswer, recordFreeRound, unlockedVerbs, weightedPick } from '../state/progress';
import { display, type Verb } from '../data/verbs';
import { check } from '../utils/answer';
import { shuffle } from '../utils/random';
import { playUnlock } from '../utils/audio';

const SIZE = 20;

interface Row {
  verb: Verb;
  given: Given;
  values?: Record<string, string>;
}

function gradeOf(rows: Row[]) {
  let points = 0;
  let total = 0;
  for (const r of rows) {
    for (const k of blanksFor(r.given)) {
      total += 1;
      if (r.values && check(r.values[k] ?? '', r.verb, k).ok) points += 1;
    }
  }
  return { points, total, grade: total ? Math.round((points / total) * 100) / 10 : 0 };
}

/** Mode examen: 20 verbs com a la prova escrita, sense correcció fins al final i nota sobre 10. */
export function ExamScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const [rows, setRows] = useState<Row[]>([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ grade: number; points: number; total: number; newRecord: boolean } | null>(null);

  function reset() {
    const pool = unlockedVerbs(progress);
    setRows(shuffle(weightedPick(progress, pool, Math.min(SIZE, pool.length))).map((verb) => ({ verb, given: pickGiven() })));
    setIndex(0);
    setResult(null);
  }

  useEffect(reset, []); // eslint-disable-line react-hooks/exhaustive-deps

  function answered(ok: boolean, values: Record<string, string>) {
    const updated = rows.map((r, i) => (i === index ? { ...r, values } : r));
    setRows(updated);
    apply((s) => recordAnswer(s, rows[index].verb.id, ok));
    if (index + 1 < rows.length) {
      setIndex(index + 1);
      return;
    }
    const g = gradeOf(updated);
    const rec = apply((s) => recordFreeRound(s, 'examBest', g.grade));
    if (g.grade >= 5) playUnlock();
    setResult({ ...g, newRecord: rec.newRecord });
  }

  if (result) {
    const color = result.grade >= 9 ? 'var(--green)' : result.grade >= 5 ? 'var(--yellow)' : 'var(--red)';
    const verdict = result.grade >= 9 ? 'Excel·lent!' : result.grade >= 7 ? 'Notable!' : result.grade >= 6 ? 'Bé!' : result.grade >= 5 ? 'Suficient' : 'Cal repassar-ho';
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {result.grade >= 9 && <Confetti />}
        <TopBar title="🧪 Resultat de l’examen" onBack={onBack} />
        <div className="card bounce-in" style={{ padding: 20, textAlign: 'center', marginBottom: 14 }}>
          <div className="label">Nota</div>
          <div style={{ fontSize: '4rem', fontWeight: 700, color, lineHeight: 1.1 }}>{result.grade.toLocaleString('ca')}</div>
          <div style={{ fontWeight: 700 }}>{verdict}</div>
          <div style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {result.points} de {result.total} caselles bé · {new Date().toLocaleDateString('ca')}
            {result.newRecord && ' · 🏅 millor nota!'}
          </div>
        </div>
        <div className="card" style={{ padding: '10px 12px', marginBottom: 14 }}>
          {rows.map((r) => (
            <div key={r.verb.id} style={{ display: 'flex', gap: 6, padding: '6px 0', borderTop: '1px solid var(--line)', fontSize: '0.9rem', alignItems: 'baseline' }}>
              <span style={{ width: 22 }}>{r.verb.emoji}</span>
              {(['base', 'past', 'pp'] as const).map((k) => {
                const asked = blanksFor(r.given).includes(k);
                const typed = r.values?.[k] ?? '';
                const ok = !asked || check(typed, r.verb, k).ok;
                return (
                  <span key={k} style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                    {asked && !ok ? (
                      <>
                        <s style={{ color: 'var(--red)' }}>{typed || '—'}</s> <strong style={{ color: 'var(--green)' }}>{display(r.verb, k)}</strong>
                      </>
                    ) : (
                      <span style={{ color: asked ? 'var(--green)' : 'var(--ink-muted)', fontWeight: asked ? 700 : 400 }}>{display(r.verb, k)}</span>
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', textAlign: 'center', marginTop: 0 }}>
          Pots fer una captura de pantalla d’aquest resultat per ensenyar-la al professor.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
          <button className="btn btn--green" onClick={reset}>
            🔁 Un altre examen
          </button>
          <button className="btn btn--ghost" onClick={onBack}>
            Menú
          </button>
        </div>
      </div>
    );
  }

  const current = rows[index];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="🧪 Mode examen" onBack={onBack} />
      <div style={{ background: 'var(--surface-2)', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ width: `${(index / Math.max(1, rows.length)) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
      </div>
      {current && (
        <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ color: 'var(--ink-muted)', fontWeight: 600 }}>
            Verb {index + 1} de {rows.length} · no veuràs la correcció fins al final
          </span>
          <TableQuestion key={index} verb={current.verb} given={current.given} showResult={false} onAnswered={answered} />
        </div>
      )}
    </div>
  );
}
