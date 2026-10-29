import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Speak } from '../components/Speak';
import { Stars } from '../components/Stars';
import { useProgress } from '../state/ProgressContext';
import { FAMILY_INFO, GROUPS, RARITY_COLOR, VERBS, display, family, groupOfVerb, meaning, rarity, type Verb } from '../data/verbs';
import { isRusty } from '../state/progress';

/** Col·lecció de cartes: una per verb, que s'aconsegueix en superar el seu grup. Les rares brillen més. */
export function CollectionScreen({ onBack }: { onBack: () => void }) {
  const { progress } = useProgress();
  const [open, setOpen] = useState<Verb | null>(null);
  const counts = { comú: 0, rar: 0, èpic: 0, llegendari: 0 };
  for (const id of progress.collected) counts[rarity(VERBS.find((v) => v.id === id)!)]++;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="🃏 La meva col·lecció" onBack={onBack} />
      <div className="card" style={{ padding: '12px 16px', marginBottom: 14, textAlign: 'center' }}>
        <strong>
          {progress.collected.length} de {VERBS.length}
        </strong>{' '}
        cartes · <strong>{progress.totalStars}</strong> ⭐
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          {(Object.keys(counts) as (keyof typeof counts)[]).map((r) => (
            <span key={r} className="chip" style={{ color: RARITY_COLOR[r] }}>
              {r}: {counts[r]}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8, marginBottom: 20 }}>
        {VERBS.map((v) => {
          const have = progress.collected.includes(v.id);
          const r = rarity(v);
          return (
            <button
              key={v.id}
              onClick={() => have && setOpen(v)}
              style={{
                border: `2px solid ${have ? RARITY_COLOR[r] : 'var(--surface-2)'}`,
                borderRadius: 14,
                background: have ? `linear-gradient(160deg, var(--surface-2), var(--surface))` : 'var(--surface)',
                boxShadow: have && r === 'llegendari' ? `0 0 14px ${RARITY_COLOR[r]}` : 'none',
                color: 'var(--ink)',
                padding: '10px 4px',
                fontFamily: 'inherit',
                cursor: have ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                opacity: have ? 1 : 0.45,
              }}
            >
              <span style={{ fontSize: '1.7rem', filter: have ? 'none' : 'grayscale(1) brightness(0.4)' }}>{v.emoji}</span>
              <strong style={{ fontSize: '0.85rem' }}>{have ? v.base : '???'}</strong>
              <span style={{ fontSize: '0.62rem', color: have ? RARITY_COLOR[r] : 'var(--ink-faint)' }}>{have ? r : `grup ${groupOfVerb(v.id)}`}</span>
            </button>
          );
        })}
      </div>

      <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px' }}>Estrelles per grup</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {GROUPS.map((g, i) => {
          const n = i + 1;
          const gp = progress.groups[n];
          const unlocked = n <= progress.unlockedGroups;
          return (
            <div key={g.title} className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, opacity: unlocked ? 1 : 0.45 }}>
              <div style={{ minWidth: 0 }}>
                <strong>
                  {n}. {g.title}
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  {unlocked ? g.ids.join(', ') : '🔒 Bloquejat'}
                  {isRusty(progress, n) && <span style={{ color: 'var(--orange)' }}> · cal repàs</span>}
                </div>
              </div>
              <strong style={{ whiteSpace: 'nowrap' }}>⭐ {gp.stars}/9</strong>
            </div>
          );
        })}
      </div>

      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(5,4,20,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
        >
          <div
            className="card bounce-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: 24,
              width: '100%',
              maxWidth: 300,
              textAlign: 'center',
              border: `3px solid ${RARITY_COLOR[rarity(open)]}`,
              boxShadow: `0 0 30px ${RARITY_COLOR[rarity(open)]}`,
            }}
          >
            <div className="label" style={{ color: RARITY_COLOR[rarity(open)] }}>
              {rarity(open)}
            </div>
            <div style={{ fontSize: '4rem' }}>{open.emoji}</div>
            <h2 style={{ margin: '4px 0' }}>{open.base}</h2>
            <div style={{ fontSize: '1.15rem', color: 'var(--accent)', fontWeight: 600 }}>
              {display(open, 'past')} · {display(open, 'pp')}
            </div>
            <div style={{ color: 'var(--ink-muted)', margin: '6px 0' }}>{meaning(open)}</div>
            <div className="chip" style={{ margin: '4px 0 10px' }}>
              {FAMILY_INFO[family(open)].label}
            </div>
            <p style={{ fontStyle: 'italic', margin: '0 0 12px', fontSize: '0.9rem' }}>“{open.ctx[0].replace('___', open.past[0])}”</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center' }}>
              <Speak verb={open} size={44} />
              <Stars count={Math.min(3, Math.round(progress.groups[groupOfVerb(open.id)].stars / 3))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
