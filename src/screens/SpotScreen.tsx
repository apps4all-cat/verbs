import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { RoundSummary } from '../components/RoundSummary';
import { useProgress } from '../state/ProgressContext';
import { recordAnswer, recordFreeRound, unlockedVerbs, weightedPick } from '../state/progress';
import { display, meaning, type Verb } from '../data/verbs';
import { fakeForm } from '../utils/fakes';
import { playCorrect, playUnlock, playWrong } from '../utils/audio';

const SIZE = 12;

type Slot = 'past' | 'pp';
interface Q {
  verb: Verb;
  /** casella falsa, o null si el trio és correcte */
  wrong: Slot | null;
  fake: string;
}

/** Caça l'error: surt un trio i has de dir si és correcte o tocar la forma falsa. */
export function SpotScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<{ choice: Slot | 'none'; ok: boolean } | null>(null);
  const correctRef = useRef(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<{ correct: number; newRecord: boolean } | null>(null);

  function reset() {
    setQuestions(
      weightedPick(progress, unlockedVerbs(progress), SIZE).map((verb) => {
        const r = Math.random();
        const wrong: Slot | null = r < 0.4 ? null : r < 0.7 ? 'past' : 'pp';
        return { verb, wrong, fake: wrong ? fakeForm(verb, wrong) : '' };
      }),
    );
    setIndex(0);
    setAnswer(null);
    correctRef.current = 0;
    setMistakes([]);
    setOutcome(null);
  }

  useEffect(reset, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = questions[index];

  function choose(choice: Slot | 'none') {
    if (answer || !current) return;
    const ok = choice === (current.wrong ?? 'none');
    setAnswer({ choice, ok });
    apply((s) => recordAnswer(s, current.verb.id, ok));
    if (ok) {
      playCorrect();
      correctRef.current += 1;
    } else {
      playWrong();
      setMistakes((m) => [...m, current.verb.id]);
    }
    setTimeout(next, ok ? 1100 : 2400);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setAnswer(null);
      return;
    }
    const c = correctRef.current;
    const result = apply((s) => recordFreeRound(s, 'spotBest', c));
    if (result.newRecord) playUnlock();
    setOutcome({ correct: c, newRecord: result.newRecord });
  }

  function cell(slot: 'base' | Slot) {
    if (!current) return null;
    const isFake = slot !== 'base' && current.wrong === slot;
    const text = isFake ? current.fake : display(current.verb, slot);
    const revealed = !!answer;
    const tappable = slot !== 'base' && !answer;
    let bg = 'var(--surface-2)';
    if (revealed && isFake) bg = 'var(--red-dark)';
    else if (revealed && answer?.choice === slot) bg = 'var(--tint-orange)';
    return (
      <button
        key={slot}
        onClick={() => tappable && choose(slot as Slot)}
        style={{
          flex: 1,
          border: 'none',
          borderRadius: 14,
          padding: '16px 4px',
          fontFamily: 'inherit',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'var(--ink)',
          background: bg,
          cursor: tappable ? 'pointer' : 'default',
          boxShadow: tappable ? '0 4px 0 var(--shadow)' : 'none',
          overflowWrap: 'anywhere',
        }}
      >
        <div className="label" style={{ marginBottom: 4 }}>
          {slot === 'base' ? 'Base' : slot === 'past' ? 'Past' : 'Participle'}
        </div>
        {revealed && isFake ? (
          <>
            <s>{text}</s>
            <div style={{ color: 'var(--green)', fontSize: '0.95rem' }}>{display(current.verb, slot as Slot)}</div>
          </>
        ) : (
          text
        )}
      </button>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="🕵️ Caça l’error" onBack={onBack} />
      {current && (
        <div className="card" style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-muted)', fontWeight: 600 }}>
            <span>
              {index + 1} / {questions.length}
            </span>
            <span>✅ {correctRef.current}</span>
          </div>
          <p style={{ margin: 0, textAlign: 'center', color: 'var(--ink-muted)' }}>
            {current.verb.emoji} «{meaning(current.verb)}». Hi ha alguna forma falsa? Toca-la!
          </p>
          <div style={{ display: 'flex', gap: 8 }}>{(['base', 'past', 'pp'] as const).map(cell)}</div>
          <button className="btn btn--green" disabled={!!answer} onClick={() => choose('none')}>
            ✅ Tot és correcte
          </button>
          {answer && (
            <p className="pop" style={{ margin: 0, textAlign: 'center', fontWeight: 700, color: answer.ok ? 'var(--green)' : 'var(--red)' }}>
              {answer.ok ? 'Ben vist! 🔎' : current.wrong ? 'Se t’ha escapat l’error!' : 'Ep, aquest era correcte!'}
            </p>
          )}
        </div>
      )}
      {outcome && (
        <RoundSummary
          correct={outcome.correct}
          total={questions.length}
          title={outcome.newRecord ? `🏅 Nou rècord: ${outcome.correct}/${questions.length}!` : undefined}
          mistakes={mistakes}
          onRetry={reset}
          onMenu={onBack}
        />
      )}
    </div>
  );
}
