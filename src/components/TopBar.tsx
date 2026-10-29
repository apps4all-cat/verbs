import type { ReactNode } from 'react';

export function TopBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
        minHeight: 44,
      }}
    >
      {onBack && (
        <button
          className="btn btn--ghost"
          onClick={onBack}
          style={{ padding: '10px 16px', fontSize: '1.3rem', lineHeight: 1 }}
          aria-label="Enrere"
        >
          ←
        </button>
      )}
      <h1
        style={{
          fontSize: '1.4rem',
          fontWeight: 700,
          margin: 0,
          flex: 1,
          color: 'var(--ink)',
        }}
      >
        {title}
      </h1>
      {right}
    </div>
  );
}
