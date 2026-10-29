import { speakVerb } from '../utils/speech';
import type { FormKey, Verb } from '../data/verbs';

/** Botó d'altaveu: pronuncia les formes del verb (per defecte, totes tres). */
export function Speak({ verb, keys, size = 34 }: { verb: Verb; keys?: FormKey[]; size?: number }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speakVerb(verb, keys);
      }}
      aria-label={`Escolta: ${verb.base}`}
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: '50%',
        border: 'none',
        background: 'var(--surface-2)',
        color: 'var(--accent)',
        fontSize: size * 0.48,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      🔊
    </button>
  );
}
