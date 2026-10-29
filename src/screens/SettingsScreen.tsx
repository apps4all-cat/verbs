import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { useProgress } from '../state/ProgressContext';
import { updateSettings, type Theme } from '../state/progress';
import { VERB_BY_ID, type Lang } from '../data/verbs';
import { backupAvailable, exportProgress, getGoogleBackup, importProgress, setGoogleBackup } from '../utils/backup';
import { speakVerb } from '../utils/speech';
import { playClick } from '../utils/audio';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'ca', label: 'Català' },
  { id: 'es', label: 'Castellà' },
];

const THEMES: { id: Theme; label: string }[] = [
  { id: 'dark', label: '🌙 Fosc' },
  { id: 'light', label: '☀️ Clar' },
  { id: 'auto', label: '📱 Com el mòbil' },
];

/** Opcions: idioma de les traduccions, aspecte, mode tranquil, prova de veu, estadístiques i còpia de seguretat. */
export function SettingsScreen({ onBack, onAbout }: { onBack: () => void; onAbout: () => void }) {
  const { progress, apply, reload } = useProgress();
  const [google, setGoogle] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const accuracy = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;

  useEffect(() => {
    void getGoogleBackup().then(setGoogle);
  }, []);

  async function toggleGoogle() {
    playClick();
    const next = !google;
    await setGoogleBackup(next);
    setGoogle(next);
  }

  async function doExport() {
    playClick();
    try {
      setMessage((await exportProgress()) ? '✅ Progrés desat al fitxer.' : null);
    } catch {
      setMessage('❌ No s’ha pogut desar el fitxer.');
    }
  }

  async function doImport() {
    playClick();
    try {
      const result = await importProgress();
      if (result === 'ok') {
        reload();
        setMessage('✅ Progrés importat.');
      } else if (result === 'invalid') setMessage('❌ Aquest fitxer no és una còpia d’Irregular Verbs.');
    } catch {
      setMessage('❌ No s’ha pogut llegir el fitxer.');
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
      <TopBar title="⚙️ Opcions" onBack={onBack} />

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <strong>🌍 Idioma de les traduccions</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {LANGS.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={progress.settings.lang === l.id}
              className={`btn btn--small ${progress.settings.lang === l.id ? 'btn--blue' : 'btn--ghost'}`}
              onClick={() => {
                playClick();
                apply((s) => updateSettings(s, { lang: l.id }));
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
          La traducció dels verbs a l’estudi, als jocs i a l’examen. Quan et pregunten què vol dir un verb, l’has d’escriure en aquest idioma.
        </span>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <strong>🎨 Aspecte</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={progress.settings.theme === t.id}
              className={`btn btn--small ${progress.settings.theme === t.id ? 'btn--blue' : 'btn--ghost'}`}
              onClick={() => {
                playClick();
                apply((s) => updateSettings(s, { theme: t.id }));
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ flex: 1 }}>😌 Mode tranquil</strong>
          <button
            role="switch"
            aria-checked={progress.settings.relaxed}
            className={`btn btn--small ${progress.settings.relaxed ? 'btn--green' : 'btn--ghost'}`}
            onClick={() => {
              playClick();
              apply((s) => updateSettings(s, { relaxed: !s.settings.relaxed }));
            }}
          >
            {progress.settings.relaxed ? 'Activat' : 'Desactivat'}
          </button>
        </div>
        <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
          Treu el rellotge del mode Crazy i del Duel. Les vides i els combos continuen.
        </span>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ flex: 1 }}>🔊 Veu en anglès</strong>
          <button className="btn btn--small btn--blue" onClick={() => speakVerb(VERB_BY_ID.go)}>
            Prova-la
          </button>
        </div>
        <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
          Les formes dels 99 verbs i les frases d’exemple estan gravades dins de l’app: funcionen sense Internet. Si no sents res, puja el volum multimèdia del mòbil.
        </span>
      </div>

      <div className="card" style={{ padding: 16 }}>
        <strong>📊 Les teves estadístiques</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, fontSize: '0.92rem', color: 'var(--ink-muted)' }}>
          <span>Respostes: {progress.answered}</span>
          <span>Encert: {accuracy}%</span>
          <span>Rècord Crazy: {progress.crazyBest}</span>
          <span>Millor examen: {progress.examBest.toLocaleString('ca')}</span>
          <span>Millor simulacre: {progress.simBest.toLocaleString('ca')}</span>
          <span>Rècord dictat: {progress.dictationBest}</span>
          <span>Caça l’error: {progress.spotBest}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <strong>💾 Còpia de seguretat</strong>
        {!backupAvailable && <span style={{ color: 'var(--yellow)', fontSize: '0.88rem' }}>Només funciona a l’app del mòbil.</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1 }}>☁️ Còpia al compte de Google</span>
          <button
            role="switch"
            aria-checked={google}
            disabled={!backupAvailable}
            onClick={toggleGoogle}
            className={`btn btn--small ${google ? 'btn--green' : 'btn--ghost'}`}
          >
            {google ? 'Activada' : 'Desactivada'}
          </button>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
          {google
            ? 'Android guarda el progrés a la còpia xifrada del teu compte de Google i el recupera si canvies de mòbil.'
            : 'Res no surt d’aquest mòbil. Per passar el progrés a un altre mòbil, fes servir el fitxer .zip.'}
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn--blue btn--small" disabled={!backupAvailable} onClick={doExport}>
            📦 Exportar .zip
          </button>
          <button className="btn btn--ghost btn--small" disabled={!backupAvailable} onClick={doImport}>
            Importar
          </button>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>En importar, se substitueix el progrés actual.</span>
      </div>

      {message && (
        <div className="card pop" style={{ padding: 14, textAlign: 'center', fontWeight: 700 }}>
          {message}
        </div>
      )}
      <button className="btn btn--ghost" onClick={() => { playClick(); onAbout(); }}>
        ℹ️ Quant a
      </button>
      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-faint)' }}>Apps4All · gratuïta, sense anuncis i sense rastreig</p>
    </div>
  );
}
