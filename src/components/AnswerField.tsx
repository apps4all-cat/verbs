import { useEffect, useRef } from 'react';

export interface Feedback {
  ok: boolean;
  expected: string;
  hint?: string;
}

/** Camp per escriure una forma, amb la correcció a sota. El pare decideix si és correcte. */
export function AnswerField({
  value,
  onChange,
  onSubmit,
  feedback,
  placeholder,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  feedback: Feedback | null;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus && !feedback) ref.current?.focus();
  }, [autoFocus, feedback]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!feedback && value.trim()) onSubmit();
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}
    >
      <input
        ref={ref}
        value={value}
        disabled={!!feedback}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Escriu-ho aquí…'}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="send"
        className={`answer-input ${feedback ? (feedback.ok ? 'answer-input--ok' : 'answer-input--ko shake') : ''}`}
        style={{ maxWidth: 340 }}
      />
      {feedback && !feedback.ok && (
        <div className="pop" style={{ textAlign: 'center' }}>
          {feedback.hint && <div style={{ color: 'var(--yellow)', fontWeight: 600, marginBottom: 4 }}>{feedback.hint}</div>}
          <div style={{ color: 'var(--red)', fontWeight: 700 }}>
            Era: <span style={{ color: 'var(--ink)' }}>{feedback.expected}</span>
          </div>
        </div>
      )}
      {!feedback && (
        <button type="submit" className="btn btn--pink" disabled={!value.trim()}>
          Comprovar
        </button>
      )}
    </form>
  );
}
