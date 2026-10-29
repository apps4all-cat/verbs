import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { GroupPicker } from '../components/GroupPicker';
import { RoundSummary } from '../components/RoundSummary';
import { AnswerField, type Feedback } from '../components/AnswerField';
import { Sentence } from '../components/Sentence';
import { useProgress } from '../state/ProgressContext';
import { currentPracticeGroup, recordAnswer, recordGroupResult, starsForResult, type RoundOutcome } from '../state/progress';
import { FORM_LABEL, display, meaning, verbsInGroup, type Verb } from '../data/verbs';
import { check } from '../utils/answer';
import { shuffle } from '../utils/random';
import { speakSentence } from '../utils/speech';
import { playCorrect, playUnlock, playWrong } from '../utils/audio';

interface Q {
  verb: Verb;
  key: 'past' | 'pp';
}

/**
 * En context: frases amb un buit. Cal decidir si va el past simple («Yesterday I ___») o el
 * participle («Have you ever ___»), que és el que més costa a classe.
 */
export function ContextScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const [group, setGroup] = useState(() => currentPracticeGroup(progress));
  const [questions, setQuestions] = useState<Q[]>([]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const correctRef = useRef(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<(RoundOutcome & { correct: number }) | null>(null);

  function reset() {
    const start = Math.random() < 0.5 ? 0 : 1;
    setQuestions(shuffle(verbsInGroup(group)).map((verb, i) => ({ verb, key: (i + start) % 2 === 0 ? 'past' : 'pp' })));
    setIndex(0);
    setValue('');
    setFeedback(null);
    correctRef.current = 0;
    setMistakes([]);
    setOutcome(null);
  }

  useEffect(reset, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = questions[index];

  function submit() {
    if (!current) return;
    const verdict = check(value, current.verb, current.key);
    setFeedback({ ok: verdict.ok, expected: display(current.verb, current.key), hint: verdict.ok ? undefined : verdict.hint });
    apply((s) => recordAnswer(s, current.verb.id, verdict.ok));
    speakSentence(current.verb, current.key);
    if (verdict.ok) {
      playCorrect();
      correctRef.current += 1;
      setTimeout(next, 1400);
    } else {
      playWrong();
      setMistakes((m) => [...m, current.verb.id]);
    }
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setValue('');
      setFeedback(null);
      return;
    }
    const c = correctRef.current;
    const result = apply((s) => recordGroupResult(s, group, 'context', c, questions.length));
    if (result.justUnlockedGroup) playUnlock();
    setOutcome({ ...result, correct: c });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="💬 En context" onBack={onBack} />
      <GroupPicker progress={progress} selected={group} onSelect={setGroup} />

      {current && (
        <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'var(--ink-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
            <span>
              {index + 1} / {questions.length}
            </span>
            <span className="chip" style={{ color: current.key === 'past' ? 'var(--blue)' : 'var(--pink)' }}>
              {FORM_LABEL[current.key]}
            </span>
          </div>
          <Sentence
            text={current.verb.ctx[current.key === 'past' ? 0 : 1]}
            fill={feedback ? (feedback.ok ? value.trim() : display(current.verb, current.key)) : undefined}
            ok={feedback?.ok}
          />
          <div style={{ color: 'var(--ink-muted)' }}>
            {current.verb.emoji} ({current.verb.base} · {meaning(current.verb)})
          </div>
          <AnswerField value={value} onChange={setValue} onSubmit={submit} feedback={feedback} placeholder={`${FORM_LABEL[current.key]} de ${current.verb.base}`} />
          {feedback && !feedback.ok && (
            <button className="btn btn--blue" onClick={next}>
              Continua →
            </button>
          )}
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-faint)', textAlign: 'center' }}>
            Pista: amb <em>yesterday, last…, ago</em> va el past simple; després de <em>have / has</em>, el participle.
          </p>
        </div>
      )}

      {outcome && (
        <RoundSummary
          correct={outcome.correct}
          total={questions.length}
          stars={starsForResult(outcome.correct, questions.length)}
          groupProgress={outcome.state.groups[group]}
          unlockedNextGroup={outcome.justUnlockedGroup}
          newlyCollected={outcome.newlyCollected}
          mistakes={mistakes}
          onRetry={reset}
          onMenu={onBack}
        />
      )}
    </div>
  );
}
