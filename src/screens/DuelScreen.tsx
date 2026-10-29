import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Confetti } from '../components/Confetti';
import { AnswerField, type Feedback } from '../components/AnswerField';
import { useProgress } from '../state/ProgressContext';
import { unlockedVerbs } from '../state/progress';
import { FORM_LABEL, display, meaningLabel, meaningPrompt, type FormKey, type Verb } from '../data/verbs';
import { check } from '../utils/answer';
import { pick, shuffle } from '../utils/random';
import { playClick, playCorrect, playUnlock, playWrong } from '../utils/audio';

const TURNS_EACH = 6;
const TURN_SECONDS = 15;
const PLAYERS = [
  { name: 'Jugador 1', color: 'var(--blue)', emoji: '🔵' },
  { name: 'Jugador 2', color: 'var(--pink)', emoji: '🔴' },
];

interface Q {
  verb: Verb;
  from: FormKey | 'ca';
  to: FormKey;
}

function makeQ(verb: Verb): Q {
  const [from, to] = pick<[FormKey | 'ca', FormKey]>([
    ['base', 'past'],
    ['base', 'pp'],
    ['ca', 'base'],
    ['past', 'pp'],
  ]);
  return { verb, from, to };
}

/**
 * Duel a un sol mòbil: els dos jugadors s'alternen. Cada encert val 10 punts més els segons que
 * sobren. Entre torn i torn es passa el mòbil (la pantalla s'amaga perquè no es vegi la resposta).
 */
export function DuelScreen({ onBack }: { onBack: () => void }) {
  const { progress } = useProgress();
  const relaxed = progress.settings.relaxed;
  const [questions, setQuestions] = useState<Q[]>([]);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<'handoff' | 'play' | 'end'>('handoff');
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [time, setTime] = useState(TURN_SECONDS);
  const [scores, setScores] = useState([0, 0]);
  const [hits, setHits] = useState([0, 0]);
  const timeRef = useRef(TURN_SECONDS);

  function reset() {
    const pool = shuffle(unlockedVerbs(progress));
    const total = TURNS_EACH * 2;
    setQuestions(Array.from({ length: total }, (_, i) => makeQ(pool[i % pool.length])));
    setTurn(0);
    setPhase('handoff');
    setScores([0, 0]);
    setHits([0, 0]);
  }

  useEffect(reset, []); // eslint-disable-line react-hooks/exhaustive-deps

  const player = turn % 2;
  const q = questions[turn];

  useEffect(() => {
    if (phase !== 'play' || feedback || relaxed) return;
    const id = setInterval(() => {
      timeRef.current = Math.max(0, +(timeRef.current - 0.1).toFixed(1));
      setTime(timeRef.current);
      if (timeRef.current <= 0) resolve(false, 'S’ha acabat el temps!');
    }, 100);
    return () => clearInterval(id);
  }); // es reprograma a cada render; el temps viu a timeRef

  function start() {
    playClick();
    timeRef.current = TURN_SECONDS;
    setTime(TURN_SECONDS);
    setValue('');
    setFeedback(null);
    setPhase('play');
  }

  function resolve(ok: boolean, hint?: string) {
    if (feedback || !q) return;
    setFeedback({ ok, expected: display(q.verb, q.to), hint });
    if (ok) {
      playCorrect();
      const pts = 10 + (relaxed ? 5 : Math.ceil(timeRef.current));
      setScores((s) => s.map((x, i) => (i === player ? x + pts : x)));
      setHits((h) => h.map((x, i) => (i === player ? x + 1 : x)));
    } else {
      playWrong();
    }
  }

  function submit() {
    if (!q) return;
    const verdict = check(value, q.verb, q.to);
    resolve(verdict.ok, verdict.ok ? undefined : verdict.hint);
  }

  function nextTurn() {
    if (turn + 1 >= questions.length) {
      playUnlock();
      setPhase('end');
      return;
    }
    setTurn((t) => t + 1);
    setPhase('handoff');
  }

  const scoreBar = (
    <div className="card" style={{ padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
      {PLAYERS.map((p, i) => (
        <span key={p.name} style={{ color: p.color, opacity: phase === 'play' && i !== player ? 0.5 : 1 }}>
          {p.emoji} {p.name}: {scores[i]}
        </span>
      ))}
    </div>
  );

  if (phase === 'end') {
    const winner = scores[0] === scores[1] ? -1 : scores[0] > scores[1] ? 0 : 1;
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Confetti />
        <TopBar title="⚔️ Duel" onBack={onBack} />
        {scoreBar}
        <div className="card bounce-in" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem' }}>{winner === -1 ? '🤝' : '🏆'}</div>
          <h2 style={{ margin: '6px 0', color: winner === -1 ? 'var(--ink)' : PLAYERS[winner].color }}>
            {winner === -1 ? 'Empat!' : `Guanya el ${PLAYERS[winner].name}!`}
          </h2>
          <p style={{ color: 'var(--ink-muted)' }}>
            Encerts: {hits[0]} – {hits[1]} (de {TURNS_EACH} cadascú)
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn--green" onClick={reset}>
              🔁 Revenja!
            </button>
            <button className="btn btn--ghost" onClick={onBack}>
              Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="⚔️ Duel" onBack={onBack} />
      {scoreBar}
      {phase === 'handoff' ? (
        <div className="card bounce-in" style={{ padding: 28, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: '3rem' }}>📱➡️</div>
          <h2 style={{ margin: 0, color: PLAYERS[player].color }}>
            Torn del {PLAYERS[player].name}
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>
            Ronda {Math.floor(turn / 2) + 1} de {TURNS_EACH}. {relaxed ? 'Sense rellotge.' : `Tens ${TURN_SECONDS} segons.`}
          </p>
          <button className="btn btn--pink" style={{ fontSize: '1.2rem' }} onClick={start}>
            Preparat! ▶
          </button>
        </div>
      ) : (
        q && (
          <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            {!relaxed && (
              <div style={{ width: '100%', background: 'var(--surface-2)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(time / TURN_SECONDS) * 100}%`,
                    height: '100%',
                    background: time < 5 ? 'var(--red)' : PLAYERS[player].color,
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            )}
            <div style={{ textAlign: 'center' }}>
              <div className="label">{q.from === 'ca' ? meaningLabel() : FORM_LABEL[q.from]}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {q.verb.emoji} {q.from === 'ca' ? meaningPrompt(q.verb) : display(q.verb, q.from)}
              </div>
            </div>
            <div style={{ fontSize: '1.1rem' }}>
              ➜ <strong style={{ color: 'var(--accent)' }}>{FORM_LABEL[q.to]}</strong>?
            </div>
            <AnswerField key={turn} value={value} onChange={setValue} onSubmit={submit} feedback={feedback} />
            {feedback && (
              <>
                {feedback.ok && <div style={{ color: 'var(--green)', fontWeight: 700 }}>Correcte! +{10 + (relaxed ? 5 : Math.ceil(time))}</div>}
                <button className="btn btn--blue" onClick={nextTurn}>
                  {turn + 1 >= questions.length ? 'Veure el resultat 🏁' : 'Passa el mòbil →'}
                </button>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
