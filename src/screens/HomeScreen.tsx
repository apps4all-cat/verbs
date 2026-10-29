import { useProgress } from '../state/ProgressContext';
import { currentStreak, enemies, rankOf } from '../state/progress';
import { VERBS } from '../data/verbs';
import { playClick } from '../utils/audio';

export function HomeScreen({
  onPlay,
  onCollection,
  onSettings,
  onEnemies,
}: {
  onPlay: () => void;
  onCollection: () => void;
  onSettings: () => void;
  onEnemies: () => void;
}) {
  const { progress } = useProgress();
  const rank = rankOf(progress.totalStars);
  const streak = currentStreak(progress);
  const foes = enemies(progress);
  const pct = Math.round((progress.collected.length / VERBS.length) * 100);
  const toNext = rank.next ? rank.next.min - progress.totalStars : 0;
  const firstTime = progress.answered === 0 && progress.totalStars === 0;

  const click = (fn: () => void) => () => {
    playClick();
    fn();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
      <div style={{ fontSize: '0.85rem', letterSpacing: '0.3em', color: 'var(--accent)', fontWeight: 700 }}>2n ESO · ENGLISH</div>
      <h1 style={{ fontSize: '2.4rem', margin: 0, lineHeight: 1.05 }}>
        Irregular
        <br />
        <span style={{ color: 'var(--pink)' }}>Verbs</span> ⚡
      </h1>
      <p style={{ margin: 0, color: 'var(--ink-muted)' }}>go – went – gone… els 99 verbs del curs, jugant.</p>

      {/* El primer cop els comptadors són tots a zero: només es mostra com començar. */}
      {!firstTime && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, width: '100%', maxWidth: 380 }}>
            <div className="card" style={{ padding: '10px 4px' }}>
              <div style={{ fontSize: '1.6rem' }}>{rank.emoji}</div>
              <div style={{ fontWeight: 700 }}>{rank.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{rank.next ? `${toNext}★ per a ${rank.next.name}` : 'Rang màxim!'}</div>
            </div>
            <div className="card" style={{ padding: '10px 4px' }}>
              <div style={{ fontSize: '1.6rem' }}>{streak > 0 ? '🔥' : '🧊'}</div>
              <div style={{ fontWeight: 700 }}>
                {streak} {streak === 1 ? 'dia' : 'dies'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{streak > 0 ? 'ratxa seguida' : 'juga avui!'}</div>
            </div>
            <div className="card" style={{ padding: '10px 4px' }}>
              <div style={{ fontSize: '1.6rem' }}>⭐</div>
              <div style={{ fontWeight: 700 }}>{progress.totalStars}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)' }}>de 180 estrelles</div>
            </div>
          </div>

          <div className="card" style={{ padding: '12px 18px', width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 8 }}>
              <span>🃏 Cartes de verb</span>
              <span>
                {progress.collected.length}/{VERBS.length}
              </span>
            </div>
            <div style={{ background: 'var(--surface-2)', borderRadius: 999, height: 12, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--pink), var(--yellow))',
                  borderRadius: 999,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        </>
      )}

      {firstTime && (
        <div className="card" style={{ padding: '12px 18px', width: '100%', maxWidth: 380, textAlign: 'left', fontSize: '0.92rem' }}>
          <strong>👋 Per començar</strong>
          <ol style={{ margin: '6px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <li>Estudia els verbs del grup 1.</li>
            <li>Juga a Trios i a Completa la taula.</li>
            <li>Quan el superis, s’obre el grup següent. La resta de jocs són a «Més jocs».</li>
          </ol>
        </div>
      )}

      <button className="btn btn--pink bounce-in" style={{ fontSize: '1.35rem', padding: '18px 56px' }} onClick={click(onPlay)}>
        ▶ Jugar
      </button>

      {foes.length > 0 && (
        <button className="btn btn--purple" onClick={click(onEnemies)}>
          👹 Els teus enemics ({foes.length})
        </button>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn--ghost" onClick={click(onCollection)}>
          🃏 Col·lecció
        </button>
        <button className="btn btn--ghost" onClick={click(onSettings)}>
          ⚙️ Opcions
        </button>
      </div>
    </div>
  );
}
