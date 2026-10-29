import type { ReactNode } from 'react';
import { Confetti } from './Confetti';
import { Stars } from './Stars';
import { VERB_BY_ID, meaning } from '../data/verbs';
import {
  GAME_LABELS,
  groupModeStatus,
  neededForNextStar,
  REQUIRED_GAMES,
  UNLOCK_MIN_STARS_PER_GAME,
  UNLOCK_TOTAL_STARS,
  type GroupProgress,
} from '../state/progress';

export function RoundSummary({
  title,
  correct,
  total,
  stars,
  groupProgress,
  unlockedNextGroup,
  newlyCollected = [],
  mistakes = [],
  extra,
  onRetry,
  onMenu,
}: {
  title?: string;
  correct: number;
  total: number;
  stars?: number;
  groupProgress?: GroupProgress;
  unlockedNextGroup?: number;
  newlyCollected?: string[];
  /** verbs fallats en aquesta partida, per repassar-los */
  mistakes?: string[];
  extra?: ReactNode;
  onRetry: () => void;
  onMenu: () => void;
}) {
  const great = total > 0 && correct === total;
  const status = groupProgress ? groupModeStatus(groupProgress) : null;
  const needed = stars !== undefined && stars < 3 ? neededForNextStar(correct, total) : null;
  const uniqueMistakes = [...new Set(mistakes)];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,4,20,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 16,
      }}
    >
      {(great || unlockedNextGroup || newlyCollected.length > 0) && <Confetti />}
      <div className="card bounce-in" style={{ padding: '24px 22px', maxWidth: 380, width: '100%', textAlign: 'center', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ fontSize: '3rem' }}>{great ? '🏆' : total > 0 && correct / total >= 0.6 ? '😎' : '💪'}</div>
        <h2 style={{ margin: '6px 0 4px' }}>{title ?? `${correct} de ${total} encerts!`}</h2>
        {stars !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 12px' }}>
            <Stars count={stars} size={30} />
          </div>
        )}
        {needed !== null && needed <= 2 && (
          <p style={{ margin: '0 0 10px', fontWeight: 700, color: 'var(--accent)' }}>
            ✨ {needed > 1 ? `Et falten ${needed} encerts` : 'Et falta 1 encert'} per a {stars! + 1}★!
          </p>
        )}
        {extra}
        {status && (
          <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '10px 14px', marginBottom: 10, textAlign: 'left' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              {Math.min(status.required, UNLOCK_TOTAL_STARS)} de {UNLOCK_TOTAL_STARS} estrelles per superar el grup:
            </p>
            {REQUIRED_GAMES.map((key) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
                <span style={{ fontWeight: 600, flex: 1 }}>{GAME_LABELS[key]}</span>
                <Stars count={status[key]} size={14} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', color: 'var(--ink-muted)' }}>
              <span style={{ fontWeight: 600, flex: 1 }}>{GAME_LABELS.context} (opcional)</span>
              <Stars count={status.context} size={14} />
            </div>
            {!groupProgress?.completed && (
              <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--yellow)', fontWeight: 600 }}>
                {status.required < UNLOCK_TOTAL_STARS
                  ? `Et falten ${UNLOCK_TOTAL_STARS - status.required} estrelles per superar-lo.`
                  : !status.meetsSafetyNet
                    ? `Necessites almenys ${UNLOCK_MIN_STARS_PER_GAME}★ a Trios i a Completa la taula.`
                    : null}
              </p>
            )}
          </div>
        )}
        {newlyCollected.length > 0 && (
          <p style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px', fontWeight: 700 }}>
            🃏 Cartes noves: {newlyCollected.map((id) => `${VERB_BY_ID[id].emoji} ${id}`).join(' · ')}
          </p>
        )}
        {unlockedNextGroup && (
          <p style={{ background: 'var(--tint-yellow)', borderRadius: 14, padding: '10px 12px', fontWeight: 700, color: 'var(--yellow)' }}>
            🎉 Grup superat! Has desbloquejat el grup {unlockedNextGroup}.
          </p>
        )}
        {uniqueMistakes.length > 0 && (
          <div style={{ textAlign: 'left', background: 'var(--surface-2)', borderRadius: 14, padding: '10px 14px', marginBottom: 10 }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Repassa aquests:</p>
            {uniqueMistakes.map((id) => {
              const v = VERB_BY_ID[id];
              return (
                <div key={id} style={{ fontSize: '0.92rem', padding: '2px 0' }}>
                  {v.emoji} <strong>{v.base}</strong> – {v.past.join('/')} – {v.pp.join('/')} <span style={{ color: 'var(--ink-muted)' }}>({meaning(v)})</span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <button className="btn btn--green" onClick={onRetry}>
            🔁 Torna-hi
          </button>
          <button className="btn btn--ghost" onClick={onMenu}>
            Tornar al menú
          </button>
        </div>
      </div>
    </div>
  );
}
