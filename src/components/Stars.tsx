export function Stars({ count, max = 3, size = 22 }: { count: number; max?: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }} aria-label={`${count} de ${max} estrelles`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2.5l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.8z"
            fill={i < count ? '#FFC93C' : 'var(--star-off)'}
            stroke={i < count ? '#F0A500' : 'var(--star-off-line)'}
            strokeWidth={1}
          />
        </svg>
      ))}
    </span>
  );
}
