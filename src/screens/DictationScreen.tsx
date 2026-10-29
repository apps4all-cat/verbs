import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { RoundSummary } from '../components/RoundSummary';
import { AnswerField, type Feedback } from '../components/AnswerField';
import { useProgress } from '../state/ProgressContext';
import { recordAnswer, recordFreeRound, unlockedVerbs, weightedPick } from '../state/progress';
import { FORM_LABEL, forms, meaning, type FormKey, type Verb } from '../data/verbs';
import { check } from '../utils/answer';
import { pick } from '../utils/random';
import { speakForm } from '../utils/speech';
import { playCorrect, playUnlock, playWrong } from '../utils/audio';

const SIZE = 10;

const say = (q: Q, rate: number) => speakForm(q.verb, q.key, rate, q.text);

interface Q {
  verb: Verb;
  key: FormKey;
  text: string;
}

/** Dictat: escoltes una forma i l'has d'escriure ben escrita (bought / brought, caught, thought…). */
export function DictationScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const correctRef = useRef(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<{ correct: number; newRecord: boolean } | null>(null);

  function reset() {
    const qs = weightedPick(progress, unlockedVerbs(progress), SIZE).map((verb) => {
      const key = pick<FormKey>(['past', 'past', 'pp', 'pp', 'base']);
      return { verb, key, text: pick(forms(verb, key)) };
    });
    setQuestions(qs);
    setIndex(0);
    setValue('');
    setFeedback(null);
    correctRef.current = 0;
    setMistakes([]);
    setOutcome(null);
    setTimeout(() => say(qs[0], 0.8), 400);
  }

  useEffect(reset, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = questions[index];

  function submit() {
    const verdict = check(value, current.verb, current.key);
    setFeedback({ ok: verdict.ok, expected: current.text, hint: verdict.ok ? undefined : verdict.hint });
    apply((s) => recordAnswer(s, current.verb.id, verdict.ok));
    if (verdict.ok) {
      playCorrect();
      correctRef.current += 1;
      setTimeout(next, 900);
    } else {
      playWrong();
      setMistakes((m) => [...m, current.verb.id]);
    }
  }

  function next() {
    if (index + 1 < questions.length) {
      const n = questions[index + 1];
      setIndex((i) => i + 1);
      setValue('');
      setFeedback(null);
      setTimeout(() => say(n, 0.8), 250);
      return;
    }
    const c = correctRef.current;
    const result = apply((s) => recordFreeRound(s, 'dictationBest', c));
    if (result.newRecord) playUnlock();
    setOutcome({ correct: c, newRecord: result.newRecord });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="👂 Dictat" onBack={onBack} />
      {current && (
        <div className="card" style={{ padding: '22px 16px', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-muted)', fontWeight: 600 }}>
            {index + 1} / {questions.length} · ✅ {correctRef.current}
          </span>
          <button
            className="btn btn--blue pulse"
            style={{ width: 110, height: 110, borderRadius: '50%', fontSize: '2.6rem', padding: 0 }}
            onClick={() => say(current, 0.8)}
            aria-label="Torna-ho a escoltar"
          >
            🔊
          </button>
          <button className="btn btn--ghost btn--small" onClick={() => say(current, 0.5)}>
            🐢 Més a poc a poc
          </button>
          <div style={{ textAlign: 'center' }}>
            <span className="chip">{FORM_LABEL[current.key]}</span>
            <div style={{ color: 'var(--ink-muted)', marginTop: 6 }}>del verb que vol dir «{meaning(current.verb)}»</div>
          </div>
          <AnswerField value={value} onChange={setValue} onSubmit={submit} feedback={feedback} placeholder="Escriu el que sents" />
          {feedback && !feedback.ok && (
            <button className="btn btn--blue" onClick={next}>
              Continua →
            </button>
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
