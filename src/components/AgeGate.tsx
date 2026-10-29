import { useState } from 'react';
import { playClick } from '../utils/audio';

/**
 * Porta d'edat neutra abans d'obrir un enllaç fora de l'app (programa Famílies de Google Play).
 * Demana l'any de naixement sense suggerir la resposta i no el guarda enlloc.
 */
export function AgeGate({ onAdult, onCancel }: { onAdult: () => void; onCancel: () => void }) {
  const [year, setYear] = useState('');
  const [blocked, setBlocked] = useState(false);
  const now = new Date().getFullYear();

  function check() {
    playClick();
    const y = Number(year);
    if (!Number.isInteger(y) || y < now - 120 || y > now) return;
    if (now - y >= 18) onAdult();
    else setBlocked(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(10, 8, 30, 0.72)',
      }}
    >
      <div className="card pop" style={{ padding: 22, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
        {blocked ? (
          <>
            <strong style={{ fontSize: '1.1rem' }}>🧑 Demana-ho a una persona adulta</strong>
            <span style={{ color: 'var(--ink-muted)' }}>Aquest enllaç surt de l’app i l’ha d’obrir una persona adulta.</span>
            <button className="btn btn--blue" onClick={onCancel}>D’acord</button>
          </>
        ) : (
          <>
            <strong style={{ fontSize: '1.1rem' }}>Aquest enllaç surt de l’app</strong>
            <label htmlFor="age-gate-year" style={{ color: 'var(--ink-muted)' }}>Escriu el teu any de naixement</label>
            <input
              id="age-gate-year"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              style={{ fontSize: '1.4rem', textAlign: 'center', padding: '10px 12px', borderRadius: 14, border: '2px solid var(--ink-muted)', background: 'transparent', color: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn--ghost btn--small" onClick={onCancel}>Cancel·lar</button>
              <button className="btn btn--blue btn--small" disabled={year.length !== 4} onClick={check}>Continuar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
