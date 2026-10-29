import { GROUPS, TOTAL_GROUPS } from '../data/verbs';
import { isRusty, type ProgressState } from '../state/progress';
import { playClick } from '../utils/audio';

/** Fila de grups: els bloquejats amb cadenat, els superats en verd i els «rovellats» (cal repàs) en taronja. */
export function GroupPicker({
  progress,
  selected,
  onSelect,
}: {
  progress: ProgressState;
  selected: number;
  onSelect: (g: number) => void;
}) {
  const info = GROUPS[selected - 1];
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        {Array.from({ length: TOTAL_GROUPS }, (_, i) => i + 1).map((g) => {
          const locked = g > progress.unlockedGroups;
          const gp = progress.groups[g];
          const rusty = isRusty(progress, g);
          const active = g === selected;
          return (
            <button
              key={g}
              disabled={locked}
              onClick={() => {
                playClick();
                onSelect(g);
              }}
              style={{
                flex: '0 0 auto',
                minWidth: 46,
                border: active ? '2px solid var(--accent)' : '2px solid transparent',
                borderRadius: 14,
                padding: '8px 10px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: locked ? 'not-allowed' : 'pointer',
                background: locked ? 'var(--surface-2)' : rusty ? 'var(--tint-orange)' : gp.completed ? 'var(--tint-green)' : 'var(--surface)',
                color: locked ? 'var(--ink-faint)' : 'var(--ink)',
              }}
              aria-label={`Grup ${g}${locked ? ' (bloquejat)' : ''}`}
            >
              {locked ? '🔒' : rusty ? `${g}🟠` : gp.completed ? `${g}✓` : g}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: 4 }}>
        <strong style={{ color: 'var(--ink)' }}>Grup {selected}:</strong> {info.title} · <em>{info.hint}</em>
        {isRusty(progress, selected) && <span style={{ color: 'var(--orange)' }}> · fa dies que no el repasses!</span>}
      </div>
    </div>
  );
}
