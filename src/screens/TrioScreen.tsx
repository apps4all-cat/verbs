import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { GroupPicker } from '../components/GroupPicker';
import { RoundSummary } from '../components/RoundSummary';
import { useProgress } from '../state/ProgressContext';
import { currentPracticeGroup, recordAnswer, recordGroupResult, starsForResult, type RoundOutcome } from '../state/progress';
import { display, meaning, verbsInGroup, type FormKey, type Verb } from '../data/verbs';
import { shuffle } from '../utils/random';
import { speakVerb } from '../utils/speech';
import { playClick, playCorrect, playUnlock, playWrong } from '../utils/audio';

interface Tile {
  key: string;
  text: string;
}

const ORDER: FormKey[] = ['base', 'past', 'pp'];
const SLOT_LABEL = ['Base', 'Past', 'Participle'];

/** Trios: entre 15 fitxes barrejades, toca base → past → participle de cada verb. */
export function TrioScreen({ onBack }: { onBack: () => void }) {
  const { progress, apply } = useProgress();
  const [group, setGroup] = useState(() => currentPracticeGroup(progress));
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [building, setBuilding] = useState<{ verb: Verb; picked: string[] } | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrongTile, setWrongTile] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [outcome, setOutcome] = useState<(RoundOutcome & { correct: number }) | null>(null);
  const verbs = verbsInGroup(group);

  function reset() {
    const vs = verbsInGroup(group);
    setTiles(shuffle(vs.flatMap((v) => ORDER.map((k) => ({ key: `${v.id}:${k}`, text: display(v, k) })))));
    setBuilding(null);
    setDone([]);
    setMistakes([]);
    setMistakeCount(0);
    setOutcome(null);
  }

  useEffect(reset, [group]); // eslint-disable-line react-hooks/exhaustive-deps

  function fail(tile: Tile, verb?: Verb) {
    playWrong();
    setWrongTile(tile.key);
    setMistakeCount((m) => m + 1);
    if (verb) {
      setMistakes((m) => [...m, verb.id]);
      apply((s) => recordAnswer(s, verb.id, false));
    }
    setTimeout(() => setWrongTile(null), 400);
    setBuilding(null);
  }

  function tap(tile: Tile) {
    if (outcome) return;
    if (!building) {
      const verb = verbs.find((v) => display(v, 'base') === tile.text && !done.includes(v.id));
      if (!verb) return fail(tile);
      playClick();
      setBuilding({ verb, picked: [tile.key] });
      return;
    }
    if (building.picked.includes(tile.key)) return;
    const step = building.picked.length;
    if (tile.text !== display(building.verb, ORDER[step])) return fail(tile, building.verb);
    const picked = [...building.picked, tile.key];
    if (picked.length < 3) {
      playClick();
      setBuilding({ verb: building.verb, picked });
      return;
    }
    // trio complet
    playCorrect();
    speakVerb(building.verb);
    apply((s) => recordAnswer(s, building.verb.id, true));
    const nextDone = [...done, building.verb.id];
    setDone(nextDone);
    setTiles((ts) => ts.filter((t) => !picked.includes(t.key)));
    setBuilding(null);
    if (nextDone.length === verbs.length) {
      const correct = Math.max(0, verbs.length - mistakeCount);
      const result = apply((s) => recordGroupResult(s, group, 'trio', correct, verbs.length));
      if (result.justUnlockedGroup) playUnlock();
      setOutcome({ ...result, correct });
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="🔗 Trios" onBack={onBack} />
      <GroupPicker progress={progress} selected={group} onSelect={setGroup} />

      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLOT_LABEL.map((label, i) => {
            const key = building?.picked[i];
            const text = key ? tiles.find((t) => t.key === key)?.text : null;
            return (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <div className="label">{label}</div>
                <div
                  style={{
                    marginTop: 4,
                    minHeight: 44,
                    borderRadius: 12,
                    border: `2px dashed ${text ? 'var(--accent)' : 'var(--surface-2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}
                >
                  {text ?? ''}
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
          {building ? `${building.verb.emoji} ${meaning(building.verb)} · ara toca el ${SLOT_LABEL[building.picked.length].toLowerCase()}` : 'Toca la base form d’un verb per començar el trio.'}{' '}
          · Errors: {mistakeCount}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {tiles.map((t) => {
          const picked = building?.picked.includes(t.key);
          return (
            <button
              key={t.key}
              onClick={() => tap(t)}
              className={wrongTile === t.key ? 'shake' : 'pop'}
              style={{
                border: 'none',
                borderRadius: 14,
                padding: '14px 6px',
                fontWeight: 700,
                fontSize: '0.98rem',
                fontFamily: 'inherit',
                cursor: 'pointer',
                background: wrongTile === t.key ? 'var(--red-dark)' : picked ? 'var(--brand)' : 'var(--surface)',
                color: 'var(--ink)',
                boxShadow: '0 4px 0 var(--shadow)',
                overflowWrap: 'anywhere',
              }}
            >
              {t.text}
            </button>
          );
        })}
      </div>

      {outcome && (
        <RoundSummary
          correct={outcome.correct}
          total={verbs.length}
          stars={starsForResult(outcome.correct, verbs.length)}
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
