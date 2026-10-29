import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { Speak } from '../components/Speak';
import { FAMILY_INFO, GROUPS, VERBS, display, family, meaning, currentLang, LANG_NAME, verbsInGroup, type Verb } from '../data/verbs';
import { playClick } from '../utils/audio';

type Column = 'base' | 'past' | 'pp' | 'ca';
const columns = (): { key: Column; label: string }[] => [
  { key: 'base', label: 'Base' },
  { key: 'past', label: 'Past' },
  { key: 'pp', label: 'Participle' },
  { key: 'ca', label: LANG_NAME[currentLang()].replace(/^./, (c) => c.toUpperCase()) },
];

/**
 * La llista del full, per grups o per ordre alfabètic. Es pot amagar qualsevol columna i destapar
 * les cel·les una a una per posar-se a prova; l'altaveu diu les tres formes.
 */
export function StudyScreen({ onBack }: { onBack: () => void }) {
  const [hidden, setHidden] = useState<Set<Column>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'groups' | 'az'>('groups');

  function toggle(col: Column) {
    playClick();
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
    setRevealed(new Set());
  }

  function cell(v: Verb, col: Column) {
    const id = `${v.id}:${col}`;
    const text = col === 'ca' ? meaning(v) : display(v, col);
    const show = !hidden.has(col) || revealed.has(id);
    return (
      <button
        key={col}
        onClick={() => {
          if (!show) {
            playClick();
            setRevealed((r) => new Set(r).add(id));
          }
        }}
        style={{
          flex: col === 'ca' ? 1.25 : 1.1,
          minWidth: 0,
          border: 'none',
          background: show ? 'transparent' : 'var(--surface-2)',
          borderRadius: 8,
          padding: '6px 2px',
          font: 'inherit',
          fontSize: col === 'ca' ? '0.78rem' : '0.9rem',
          fontWeight: col === 'base' ? 700 : 500,
          color: col === 'ca' ? 'var(--ink-muted)' : col === 'base' ? 'var(--ink)' : 'var(--accent)',
          textAlign: 'left',
          cursor: show ? 'default' : 'pointer',
          // cap paraula no es parteix (brough-t, començ-ar): les columnes ja hi caben a 360 px
          overflowWrap: 'normal',
        }}
      >
        {show ? text : '❓'}
      </button>
    );
  }

  function row(v: Verb) {
    return (
      <div key={v.id} style={{ borderTop: '1px solid var(--line)', padding: '4px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 24, textAlign: 'center' }}>{v.emoji}</span>
          {columns().map((c) => cell(v, c.key))}
          <Speak verb={v} size={30} />
        </div>
        {v.note && <div style={{ fontSize: '0.75rem', color: 'var(--yellow)', paddingLeft: 30 }}>🗣️ {v.note}</div>}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Estudia" onBack={onBack} />
      <div className="card" style={{ padding: '12px 14px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
          Amaga una columna i toca els ❓ per comprovar si te’n recordes. 🔊 per escoltar-les.
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {columns().map((c) => (
            <button key={c.key} className={`btn btn--small ${hidden.has(c.key) ? 'btn--pink' : 'btn--ghost'}`} onClick={() => toggle(c.key)}>
              {hidden.has(c.key) ? '🙈' : '👀'} {c.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`btn btn--small ${view === 'groups' ? 'btn--blue' : 'btn--ghost'}`} onClick={() => setView('groups')}>
            Per famílies
          </button>
          <button className={`btn btn--small ${view === 'az' ? 'btn--blue' : 'btn--ghost'}`} onClick={() => setView('az')}>
            A – Z (com el full)
          </button>
        </div>
      </div>

      {view === 'groups' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
          {GROUPS.map((g, i) => {
            const verbs = verbsInGroup(i + 1);
            const fam = family(verbs[0]);
            return (
              <div key={g.title} className="card" style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <strong style={{ color: 'var(--pink)' }}>
                    Grup {i + 1} · {g.title}
                  </strong>
                  <span className="chip">{FAMILY_INFO[fam].label}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', margin: '2px 0 4px' }}>
                  Patró: <em>{g.hint}</em>
                </div>
                {verbs.map(row)}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: '10px 12px', marginBottom: 20 }}>
          {[...VERBS].sort((a, b) => a.base.localeCompare(b.base)).map(row)}
        </div>
      )}
    </div>
  );
}
