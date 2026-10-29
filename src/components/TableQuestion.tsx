import { useEffect, useRef, useState } from 'react';
import { Speak } from './Speak';
import { FORM_LABEL, display, meaning, meaningLabel, meaningPrompt, type FormKey, type Verb } from '../data/verbs';
import { check, checkMeaning, type Verdict } from '../utils/answer';

/** Què et donen: la base, el past o la traducció. La resta s'ha d'escriure. */
export type Given = 'base' | 'past' | 'ca';

export function blanksFor(given: Given): FormKey[] {
  if (given === 'base') return ['past', 'pp'];
  if (given === 'past') return ['base', 'pp'];
  return ['base', 'past', 'pp'];
}

export function pickGiven(): Given {
  const r = Math.random();
  return r < 0.5 ? 'base' : r < 0.8 ? 'ca' : 'past';
}

/** Una casella de la fila: una de les tres formes o la traducció (en l'idioma triat a les opcions). */
type Col = FormKey | 'ca';

/** Quan et donen una forma, de vegades també has d'escriure la traducció, com al full d'examen. */
export function pickAskMeaning(given: Given): boolean {
  return given !== 'ca' && Math.random() < 0.4;
}

/**
 * Una fila de la taula amb les caselles buides. Si `showResult` és fals (mode examen) només recull les
 * respostes; si és cert, corregeix i mostra les pistes.
 */
export function TableQuestion({
  verb,
  given,
  onAnswered,
  askMeaning = false,
  showResult = true,
  compact = false,
}: {
  verb: Verb;
  given: Given;
  /** afegeix la traducció a les caselles que s'han d'omplir (si no és la pista) */
  askMeaning?: boolean;
  onAnswered: (ok: boolean, values: Record<string, string>) => void;
  showResult?: boolean;
  compact?: boolean;
}) {
  const asksMeaning = askMeaning && given !== 'ca';
  const blanks: Col[] = asksMeaning ? [...blanksFor(given), 'ca'] : blanksFor(given);
  const [values, setValues] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, Verdict> | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setValues({});
    setVerdicts(null);
    if (!compact) refs.current[0]?.focus();
  }, [verb, given, askMeaning, compact]);

  const filled = blanks.every((k) => (values[k] ?? '').trim());

  function submit() {
    if (!filled || verdicts) return;
    const v: Record<string, Verdict> = {};
    for (const k of blanks)
      v[k] = k === 'ca' ? (checkMeaning(values[k] ?? '', verb) ? { ok: true } : { ok: false, kind: 'wrong' }) : check(values[k] ?? '', verb, k);
    if (showResult) setVerdicts(v);
    onAnswered(
      blanks.every((k) => v[k].ok),
      values,
    );
  }

  const shownForms: FormKey[] = given === 'ca' ? [] : [given];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}
    >
      <div style={{ textAlign: 'center' }}>
        {given === 'ca' ? (
          <>
            <div className="label">{meaningLabel()}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{meaningPrompt(verb)}</div>
          </>
        ) : (
          <>
            <div className="label">{FORM_LABEL[given]}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {display(verb, given)}
              <Speak verb={verb} keys={[given]} />
            </div>
            {!asksMeaning && <div style={{ color: 'var(--ink-muted)' }}>({meaning(verb)})</div>}
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${blanks.length}, 1fr)`, gap: 8 }}>
        {blanks.map((k, i) => {
          const verdict = verdicts?.[k];
          return (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span className="label" style={{ textAlign: 'center' }}>
                {k === 'ca' ? meaningLabel() : FORM_LABEL[k]}
              </span>
              <input
                ref={(el) => {
                  refs.current[i] = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && i < blanks.length - 1) {
                    e.preventDefault();
                    refs.current[i + 1]?.focus();
                  }
                }}
                value={values[k] ?? ''}
                disabled={!!verdicts}
                onChange={(e) => setValues((vs) => ({ ...vs, [k]: e.target.value }))}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint={i === blanks.length - 1 ? 'send' : 'next'}
                className={`answer-input ${verdict ? (verdict.ok ? 'answer-input--ok' : 'answer-input--ko') : ''}`}
                style={{ fontSize: '1.05rem', padding: '10px 6px' }}
              />
              {verdict && !verdict.ok && (
                <span className="pop" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                  <strong style={{ color: 'var(--green)' }}>{k === 'ca' ? meaning(verb) : display(verb, k)}</strong>
                  {verdict.hint && <span style={{ display: 'block', color: 'var(--yellow)' }}>{verdict.hint}</span>}
                </span>
              )}
            </label>
          );
        })}
      </div>
      {shownForms.length === 0 && verdicts && (
        <div style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>
          {verb.base} – {display(verb, 'past')} – {display(verb, 'pp')}
        </div>
      )}
      {!verdicts && (
        <button type="submit" className="btn btn--pink" disabled={!filled} style={{ alignSelf: 'center' }}>
          {showResult ? 'Comprovar' : 'Següent →'}
        </button>
      )}
    </form>
  );
}
