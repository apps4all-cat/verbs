import { useEffect, useRef, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { GroupPicker } from '../components/GroupPicker';
import { RoundSummary } from '../components/RoundSummary';
import { TableQuestion, pickAskMeaning, pickGiven, type Given } from '../components/TableQuestion';
import { useProgress } from '../state/ProgressContext';
import {
  currentPracticeGroup,
  enemies,
  recordAnswer,
  recordGroupResult,
  starsForResult,
  unlockedVerbs,
  weightedPick,
  type RoundOutcome,
} from '../state/progress';
import { verbsInGroup, type Verb } from '../data/verbs';
import { shuffle } from '../utils/random';
import { playCorrect, playUnlock, playWrong } from '../utils/audio';

type Variant = 'group' | 'review' | 'enemies';

const TITLES: Record<Variant, string> = {
  group: '✏️ Completa la taula',
  review: '🎲 Repàs aleatori',
  enemies: '👹 Els teus enemics',
};

const REVIEW_SIZE = 10;

/**
 * Et donen una forma (o el significat) i has d'escriure les que falten; de vegades, també la traducció. En mode grup puntua per
 * superar-lo; en repàs barreja els verbs oberts (més sovint els que falles); a «enemics» només surten
 * els que falles, i un enemic desapareix quan l'encertes prou vegades.
 */
export function TableScreen({ variant, onBack }: { variant: Variant; onBack: () => void }) {
  const { progress, apply } = useProgress();
  const [group, setGroup] = useState(() => currentPracticeGroup(progress));
  const [questions, setQuestions] = useState<{ verb: Verb; given: Given; askMeaning: boolean }[]>([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const correctRef = useRef(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<(Partial<RoundOutcome> & { correct: number }) | null>(null);

  function build(): Verb[] {
    if (variant === 'group') return shuffle(verbsInGroup(group));
    if (variant === 'review') return weightedPick(progress, unlockedVerbs(progress), REVIEW_SIZE);
    return shuffle(enemies(progress).slice(0, REVIEW_SIZE));
  }

  function reset() {
    setQuestions(
      build().map((verb) => {
        const given = pickGiven();
        return { verb, given, askMeaning: pickAskMeaning(given) };
      }),
    );
    setIndex(0);
    setAnswered(null);
    setCorrect(0);
    correctRef.current = 0;
    setMistakes([]);
    setOutcome(null);
  }

  useEffect(reset, [group, variant]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = questions[index];

  function onAnswered(ok: boolean) {
    setAnswered(ok);
    if (ok) {
      playCorrect();
      correctRef.current += 1;
      setCorrect(correctRef.current);
      setTimeout(next, 900);
    } else {
      playWrong();
      setMistakes((m) => [...m, current.verb.id]);
    }
    apply((s) => recordAnswer(s, current.verb.id, ok));
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
      setAnswered(null);
      return;
    }
    finish();
  }

  function finish() {
    const c = correctRef.current;
    if (variant === 'group') {
      const result = apply((s) => recordGroupResult(s, group, 'table', c, questions.length));
      if (result.justUnlockedGroup) playUnlock();
      setOutcome({ ...result, correct: c });
    } else {
      setOutcome({ correct: c });
    }
  }

  if (variant === 'enemies' && questions.length === 0 && !outcome) {
    return (
      <div style={{ flex: 1 }}>
        <TopBar title={TITLES.enemies} onBack={onBack} />
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>😇</div>
          <p style={{ fontWeight: 700 }}>No tens cap enemic!</p>
          <p style={{ color: 'var(--ink-muted)' }}>Quan fallis un verb en qualsevol joc, apareixerà aquí fins que el dominis.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={TITLES[variant]} onBack={onBack} />
      {variant === 'group' && <GroupPicker progress={progress} selected={group} onSelect={setGroup} />}
      {variant === 'enemies' && (
        <p style={{ margin: '0 0 12px', color: 'var(--ink-muted)', fontSize: '0.88rem' }}>
          Cada encert debilita un enemic; quan l’encertes prou vegades, desapareix. Queden <strong>{enemies(progress).length}</strong>.
        </p>
      )}

      {current && (
        <div className="card" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-muted)', fontWeight: 600, fontSize: '0.9rem' }}>
            <span>
              {index + 1} / {questions.length}
            </span>
            <span>
              {current.verb.emoji} ✅ {correct}
            </span>
          </div>
          <TableQuestion
            verb={current.verb}
            given={current.given}
            askMeaning={current.askMeaning}
            onAnswered={onAnswered}
            key={`${index}-${current.verb.id}`}
          />
          {answered === false && (
            <button className="btn btn--blue" style={{ alignSelf: 'center' }} onClick={next} autoFocus>
              Continua →
            </button>
          )}
        </div>
      )}

      {outcome && (
        <RoundSummary
          correct={outcome.correct}
          total={questions.length}
          stars={starsForResult(outcome.correct, questions.length)}
          groupProgress={variant === 'group' ? outcome.state?.groups[group] : undefined}
          unlockedNextGroup={outcome.justUnlockedGroup}
          newlyCollected={outcome.newlyCollected}
          mistakes={mistakes}
          extra={variant === 'enemies' ? <p style={{ color: 'var(--ink-muted)', marginTop: 0 }}>Enemics que queden: {enemies(progress).length}</p> : undefined}
          onRetry={reset}
          onMenu={onBack}
        />
      )}
    </div>
  );
}
