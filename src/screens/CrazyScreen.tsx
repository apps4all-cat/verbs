import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { RoundSummary } from '../components/RoundSummary';
import { AnswerField, type Feedback } from '../components/AnswerField';
import { useProgress } from '../state/ProgressContext';
import { masteredVerbs, recordAnswer, recordFreeRound, weightedPick } from '../state/progress';
import { FORM_LABEL, display, meaning, meaningLabel, meaningPrompt, type FormKey, type Verb } from '../data/verbs';
import { check, checkMeaning } from '../utils/answer';
import { fakeForm } from '../utils/fakes';
import { pick } from '../utils/random';
import { playCorrect, playStar, playUnlock, playWrong } from '../utils/audio';

const START_SECONDS = 60;
const BONUS_SECONDS = 3;
const LIVES = 3;

/** Tipus de pregunta: escriure una forma a partir d'una altra, el significat, o una trampa (sí / no). */
type Q =
  | { kind: 'type'; verb: Verb; from: FormKey | 'ca'; to: FormKey | 'ca' }
  | { kind: 'trap'; verb: Verb; shown: [string, string, string]; isRight: boolean };

const ROUTES: [FormKey | 'ca', FormKey | 'ca'][] = [
  ['base', 'past'],
  ['base', 'pp'],
  ['ca', 'base'],
  ['past', 'base'],
  ['pp', 'base'],
  ['past', 'pp'],
  ['base', 'ca'],
];

function makeQuestion(verb: Verb): Q {
  if (Math.random() < 0.2) {
    const wrong = Math.random() < 0.6 ? pick<'past' | 'pp'>(['past', 'pp']) : null;
    const shown: [string, string, string] = [
      verb.base,
      wrong === 'past' ? fakeForm(verb, 'past') : display(verb, 'past'),
      wrong === 'pp' ? fakeForm(verb, 'pp') : display(verb, 'pp'),
    ];
    return { kind: 'trap', verb, shown, isRight: wrong === null };
  }
  const [from, to] = pick(ROUTES);
  return { kind: 'type', verb, from, to };
}

function label(k: FormKey | 'ca') {
  return k === 'ca' ? meaningLabel() : FORM_LABEL[k];
}

function shown(verb: Verb, k: FormKey | 'ca') {
  return k === 'ca' ? meaningPrompt(verb) : display(verb, k);
}

function multiplier(combo: number) {
  return combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
}

/**
 * Mode Crazy: tots els verbs dels grups superats, preguntats en qualsevol direcció. 60 segons que
 * creixen amb cada encert, 3 vides, combos ×2 i ×3 i preguntes trampa. En mode tranquil no hi ha rellotge.
 */
export function CrazyScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const relaxed = progress.settings.relaxed;
  const pool = masteredVerbs(progress);
  const [q, setQ] = useState<Q | null>(null);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [time, setTime] = useState(START_SECONDS);
  const [lives, setLives] = useState(LIVES);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [skips, setSkips] = useState(1);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<{ score: number; newRecord: boolean } | null>(null);
  const scoreRef = useRef(0);
  const recent = useRef<string[]>([]);

  function nextQuestion() {
    const candidates = pool.filter((v) => !recent.current.includes(v.id));
    const verb = weightedPick(progress, candidates.length ? candidates : pool, 1)[0];
    recent.current = [...recent.current, verb.id].slice(-Math.min(6, pool.length - 1));
    setQ(makeQuestion(verb));
    setValue('');
    setFeedback(null);
  }

  function reset() {
    setTime(START_SECONDS);
    setLives(LIVES);
    setCombo(0);
    setScore(0);
    scoreRef.current = 0;
    setAnswered(0);
    setSkips(1);
    setMistakes([]);
    setOutcome(null);
    recent.current = [];
    if (pool.length) nextQuestion();
  }

  useEffect(reset, []); // eslint-disable-line react-hooks/exhaustive-deps

  // rellotge: només corre mentre hi ha una pregunta oberta (no durant la correcció)
  useEffect(() => {
    if (relaxed || outcome || feedback || !q) return;
    const id = setInterval(() => setTime((t) => Math.max(0, +(t - 0.1).toFixed(1))), 100);
    return () => clearInterval(id);
  }, [relaxed, outcome, feedback, q]);

  useEffect(() => {
    if (!relaxed && time <= 0 && !outcome && q) finish();
  }, [time]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    const s = scoreRef.current;
    const result = apply((st) => recordFreeRound(st, 'crazyBest', s));
    if (result.newRecord) playUnlock();
    setOutcome({ score: s, newRecord: result.newRecord });
  }

  function resolve(ok: boolean, expected: string, hint?: string) {
    if (!q) return;
    setAnswered((a) => a + 1);
    apply((s) => recordAnswer(s, q.verb.id, ok));
    if (ok) {
      const nextCombo = combo + 1;
      const pts = 10 * multiplier(nextCombo);
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setCombo(nextCombo);
      if (!relaxed) setTime((t) => t + BONUS_SECONDS);
      if (multiplier(nextCombo) > multiplier(combo)) playStar();
      else playCorrect();
      setFeedback({ ok: true, expected });
      setTimeout(nextQuestion, 450);
    } else {
      playWrong();
      setCombo(0);
      setMistakes((m) => [...m, q.verb.id]);
      setFeedback({ ok: false, expected, hint });
      const left = lives - 1;
      setLives(left);
      setTimeout(() => (left <= 0 ? finish() : nextQuestion()), 1700);
    }
  }

  function submitTyped() {
    if (!q || q.kind !== 'type') return;
    if (q.to === 'ca') {
      resolve(checkMeaning(value, q.verb), meaning(q.verb));
      return;
    }
    const verdict = check(value, q.verb, q.to);
    resolve(verdict.ok, display(q.verb, q.to), verdict.ok ? undefined : verdict.hint);
  }

  function answerTrap(saysRight: boolean) {
    if (!q || q.kind !== 'trap' || feedback) return;
    const ok = saysRight === q.isRight;
    resolve(ok, `${q.verb.base} – ${display(q.verb, 'past')} – ${display(q.verb, 'pp')}`, q.isRight ? 'Era correcte!' : 'Hi havia una trampa!');
  }

  if (!pool.length) {
    return (
      <div style={{ flex: 1 }}>
        <TopBar title="🤪 Mode Crazy" onBack={onBack} />
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🔒</div>
          <p style={{ fontWeight: 700 }}>Encara no has superat cap grup!</p>
          <p style={{ color: 'var(--ink-muted)' }}>Supera el grup 1 (Trios, Completa la taula i En context) i els seus verbs apareixeran aquí.</p>
        </div>
      </div>
    );
  }

  const mult = multiplier(combo);
  const danger = !relaxed && time <= 10;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="🤪 Mode Crazy" onBack={onBack} />
      <div className={mult > 1 ? `card combo-glow combo-glow--${mult}` : 'card'} style={{ padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
        <span className={danger ? 'pulse' : ''} style={{ color: danger ? 'var(--red)' : 'var(--ink)', minWidth: 64 }}>
          {relaxed ? '😌 ∞' : `⏱️ ${Math.ceil(time)}s`}
        </span>
        <span>{'❤️'.repeat(lives)}{'🖤'.repeat(LIVES - lives)}</span>
        <span style={{ color: 'var(--yellow)' }}>⭐ {score}</span>
      </div>
      <div style={{ textAlign: 'center', minHeight: 30, marginBottom: 6 }}>
        {combo >= 3 && (
          <span key={mult} className="combo" style={{ fontWeight: 700, color: mult === 3 ? 'var(--pink)' : mult === 2 ? 'var(--yellow)' : 'var(--accent)' }}>
            🔥 Combo {combo}
            {mult > 1 ? ` · ×${mult}!` : ''}
          </span>
        )}
      </div>

      {q && (
        <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
            {pool.length} verbs dominats · rècord {progress.crazyBest} · pregunta {answered + 1}
          </span>
          {q.kind === 'type' ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div className="label">{label(q.from)}</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                  {q.verb.emoji} {shown(q.verb, q.from)}
                </div>
              </div>
              <div style={{ fontSize: '1.1rem' }}>
                ➜ <strong style={{ color: 'var(--accent)' }}>{label(q.to)}</strong>?
              </div>
              <AnswerField
                key={`${answered}`}
                value={value}
                onChange={setValue}
                onSubmit={submitTyped}
                feedback={feedback}
                placeholder={q.to === 'ca' ? 'Què vol dir?' : label(q.to)}
              />
            </>
          ) : (
            <>
              <div className="label">💣 Pregunta trampa: és correcte?</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center' }}>{q.shown.join(' – ')}</div>
              <div style={{ color: 'var(--ink-muted)' }}>({meaning(q.verb)})</div>
              {feedback ? (
                <div className="pop" style={{ textAlign: 'center', fontWeight: 700, color: feedback.ok ? 'var(--green)' : 'var(--red)' }}>
                  {feedback.ok ? 'Correcte!' : feedback.hint}
                  <div style={{ color: 'var(--ink)' }}>{feedback.expected}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn--green" onClick={() => answerTrap(true)}>
                    ✅ Correcte
                  </button>
                  <button className="btn btn--pink" onClick={() => answerTrap(false)}>
                    ❌ Hi ha error
                  </button>
                </div>
              )}
            </>
          )}
          {!feedback && skips > 0 && (
            <button
              className="btn btn--ghost btn--small"
              onClick={() => {
                setSkips(0);
                setCombo(0);
                nextQuestion();
              }}
            >
              ⏭️ Salta (només 1 cop)
            </button>
          )}
        </div>
      )}

      {outcome && (
        <RoundSummary
          title={outcome.newRecord ? `🏆 Nou rècord: ${outcome.score} punts!` : `${outcome.score} punts`}
          correct={answered - mistakes.length}
          total={answered}
          extra={
            <p style={{ color: 'var(--ink-muted)', marginTop: 0 }}>
              {answered - mistakes.length} encerts de {answered} · rècord {Math.max(progress.crazyBest, outcome.score)}
            </p>
          }
          mistakes={mistakes}
          onRetry={reset}
          onMenu={onBack}
        />
      )}
    </div>
  );
}
