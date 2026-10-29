/** Frase amb el buit (___) ressaltat; si es passa `fill`, hi posa la resposta. */
export function Sentence({ text, fill, ok }: { text: string; fill?: string; ok?: boolean }) {
  const [before, after] = text.split('___');
  return (
    <p style={{ fontSize: '1.35rem', lineHeight: 1.5, margin: 0, textAlign: 'center', fontWeight: 500 }}>
      {before}
      <span
        style={{
          display: 'inline-block',
          minWidth: 70,
          padding: '0 6px',
          borderBottom: `3px solid ${fill ? (ok ? 'var(--green)' : 'var(--red)') : 'var(--accent)'}`,
          color: fill ? (ok ? 'var(--green)' : 'var(--red)') : 'var(--accent)',
          fontWeight: 700,
        }}
      >
        {fill ?? ' '}
      </span>
      {after}
    </p>
  );
}
