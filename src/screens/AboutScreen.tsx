import { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { TopBar } from '../components/TopBar';
import { AgeGate } from '../components/AgeGate';
import { APP_VERSION, LINKS, STORE } from '../utils/store';
import { playClick } from '../utils/audio';

/**
 * Quant a: versió, crèdits i enllaços al web d'Apps4All. Tots els enllaços surten de l'app (al navegador)
 * i passen abans per la porta d'edat. La invitació a convidar a un cafè només hi és a l'edició F-Droid.
 */
export function AboutScreen({ onBack }: { onBack: () => void }) {
  const [pending, setPending] = useState<string | null>(null);

  function ask(url: string) {
    playClick();
    setPending(url);
  }

  async function open() {
    const url = pending;
    setPending(null);
    if (url) await Browser.open({ url });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TopBar title="ℹ️ Quant a" onBack={onBack} />

      <div className="card" style={{ padding: 18, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong style={{ fontSize: '1.3rem' }}>Irregular Verbs</strong>
        <span style={{ color: 'var(--ink-muted)' }}>Versió {APP_VERSION}</span>
        <span>Una app d’Apps4All: gratuïta, sense anuncis i sense rastreig.</span>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn--blue" onClick={() => ask(LINKS.web)}>🌐 Més apps d’Apps4All</button>
        {STORE === 'fdroid' && (
          <>
            <span style={{ fontSize: '0.92rem', color: 'var(--ink-muted)', textAlign: 'center' }}>
              Et resulta útil? Si t’ha resolt una necessitat, pots convidar-me a un cafè.
            </span>
            <button className="btn btn--pink" onClick={() => ask(LINKS.support)}>☕ Convida a un cafè</button>
          </>
        )}
        <button className="btn btn--ghost btn--small" onClick={() => ask(LINKS.privacy)}>🔒 Política de privadesa</button>
      </div>

      <div className="card" style={{ padding: 16, fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
        <strong style={{ color: 'inherit' }}>Crèdits</strong>
        <p style={{ margin: '6px 0 0' }}>
          Veu anglesa: Piper «alba» (corpus Alba, Universitat d’Edimburg), llicència CC BY 4.0.
        </p>
      </div>

      {pending && <AgeGate onAdult={open} onCancel={() => setPending(null)} />}
    </div>
  );
}
