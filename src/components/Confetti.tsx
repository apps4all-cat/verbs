import { useMemo } from 'react';

const COLORS = ['#4F46E5', '#ff6fa5', '#ffc93c', '#46d19e', '#3fb5e8', '#ff5c5c'];

export function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.4 + Math.random() * 1.1,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 140,
        size: 6 + Math.random() * 7,
        round: Math.random() > 0.5,
      })),
    [count],
  );

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 200 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? '50%' : 3,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            // @ts-expect-error custom property used by keyframes
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 110vh) rotate(540deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
