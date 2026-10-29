import { useState } from 'react';
import { TopBar } from '../components/TopBar';
import { useProgress } from '../state/ProgressContext';
import { UNLOCK_TOTAL_STARS, currentPracticeGroup, enemies, groupModeStatus, masteredVerbs, unlockedVerbs } from '../state/progress';
import { TOTAL_GROUPS } from '../data/verbs';
import { playClick } from '../utils/audio';

export type GameMode = 'study' | 'trio' | 'table' | 'context' | 'review' | 'enemies' | 'dictation' | 'spot' | 'crazy' | 'exam' | 'sim' | 'duel';

interface ModeCard {
  id: GameMode;
  title: string;
  desc: string;
  emoji: string;
  color: string;
  /** null si es pot jugar; si no, el motiu */
  lock?: string | null;
  badge?: string;
  /** el pas que toca ara: es ressalta perquè qui comença sàpiga per on anar */
  next?: boolean;
}

/** El joc que toca ara al grup que treballes: primer estudiar, després Trios i Completa la taula. */
function nextStep(status: ReturnType<typeof groupModeStatus>, completed: boolean): GameMode | null {
  if (completed) return null;
  if (status.trio === 0 && status.table === 0) return status.context === 0 ? 'study' : 'trio';
  return status.trio <= status.table ? 'trio' : 'table';
}

export function ModeSelectScreen({ onBack, onSelect }: { onBack: () => void; onSelect: (mode: GameMode) => void }) {
  const { progress } = useProgress();
  const group = currentPracticeGroup(progress);
  const mastered = masteredVerbs(progress).length;
  const unlocked = unlockedVerbs(progress).length;
  const foes = enemies(progress).length;
  const needMastered = mastered === 0 ? '🔒 Supera el grup 1' : null;
  const gp = progress.groups[group];
  const status = groupModeStatus(gp);
  const step = nextStep(status, gp.completed);
  // Qui comença només veu el camí del grup; la resta de jocs hi són, però plegats, fins que supera el primer grup.
  const [showAll, setShowAll] = useState(mastered > 0);

  const learn: { title: string; subtitle: string; modes: ModeCard[] } = {
    title: `Grup ${group} de ${TOTAL_GROUPS}`,
    subtitle: gp.completed
      ? 'Grup superat! Pots repetir-lo o passar al següent des de cada joc.'
      : `Estudia’l i després aconsegueix ${UNLOCK_TOTAL_STARS} ★ entre Trios i Completa la taula per superar-lo.`,
    modes: [
      { id: 'study', title: '1 · Estudia', desc: 'La taula amb àudio. Amaga columnes i posa’t a prova.', emoji: '📖', color: 'var(--green-dark)' },
      {
        id: 'trio',
        title: '2 · Trios',
        desc: 'Uneix les tres formes de cada verb.',
        emoji: '🔗',
        color: 'var(--blue-dark)',
        badge: status.trio ? '★'.repeat(status.trio) : undefined,
      },
      {
        id: 'table',
        title: '3 · Completa la taula',
        desc: 'Et donen una forma o la traducció: escriu el que falta.',
        emoji: '✏️',
        color: 'var(--purple-dark)',
        badge: status.table ? '★'.repeat(status.table) : undefined,
      },
    ].map((m) => ({ ...m, id: m.id as GameMode, next: m.id === step })),
  };

  const more: { title: string; subtitle: string; modes: ModeCard[] }[] = [
    {
      title: 'Repassa',
      subtitle: `${unlocked} verbs desbloquejats`,
      modes: [
        { id: 'review', title: 'Repàs aleatori', desc: 'Verbs barrejats de tots els grups oberts.', emoji: '🎲', color: 'var(--blue-dark)' },
        {
          id: 'enemies',
          title: 'Els teus enemics',
          desc: 'Els verbs que més falles, fins que els dominis.',
          emoji: '👹',
          color: 'var(--purple-dark)',
          lock: foes === 0 ? '✨ Encara cap' : null,
          badge: foes > 0 ? `${foes}` : undefined,
        },
        {
          id: 'spot',
          title: 'Caça l’error',
          desc: 'goed? teached? Descobreix les formes falses.',
          emoji: '🕵️',
          color: 'var(--pink-dark)',
          badge: progress.spotBest ? `🏅 ${progress.spotBest}` : undefined,
        },
      ],
    },
    {
      title: 'Posa’t a prova',
      subtitle: 'Amb els verbs dels grups que ja has superat. El simulacre, amb tots quan vulguis.',
      modes: [
        {
          id: 'crazy',
          title: 'Mode Crazy',
          desc: '60 segons, 3 vides, combos ×3 i trampes!',
          emoji: '🤪',
          color: '#b0228a',
          lock: needMastered,
          badge: mastered ? `🏆 ${progress.crazyBest}` : undefined,
        },
        {
          id: 'exam',
          title: 'Mode examen',
          desc: '20 verbs com a l’examen. Nota sobre 10.',
          emoji: '🧪',
          color: 'var(--blue-dark)',
          lock: needMastered,
          badge: progress.examBest ? `🏅 ${progress.examBest}` : undefined,
        },
        {
          id: 'sim',
          title: 'Simulacre d’examen',
          desc: 'La taula del full, amb caselles buides. Tria la dificultat.',
          emoji: '📝',
          color: 'var(--green-dark)',
          badge: progress.simBest ? `🏅 ${progress.simBest}` : undefined,
        },
        { id: 'duel', title: 'Duel', desc: 'Dos jugadors, un mòbil. Qui en sap més?', emoji: '⚔️', color: '#b45309', lock: unlocked < 5 ? '🔒' : null },
      ],
    },
    {
      title: 'Extres (opcionals)',
      subtitle: 'No cal fer-los per avançar, però donen estrelles i rècords.',
      modes: [
        {
          id: 'context',
          title: 'En context',
          desc: 'Omple la frase amb el past o el participle. Suma ★ extra al grup.',
          emoji: '💬',
          color: 'var(--pink-dark)',
          badge: status.context ? '★'.repeat(status.context) : undefined,
        },
        {
          id: 'dictation',
          title: 'Dictat',
          desc: 'Escolta la forma i escriu-la bé (bought ≠ brought!).',
          emoji: '👂',
          color: 'var(--green-dark)',
          badge: progress.dictationBest ? `🏅 ${progress.dictationBest}` : undefined,
        },
      ],
    },
  ];
  const sections = showAll ? [learn, ...more] : [learn];
  const hiddenGames = more.reduce((n, s) => n + s.modes.length, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Tria un joc" onBack={onBack} />
      {sections.map((s) => (
        <section key={s.title} style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 2px' }}>{s.title}</h2>
          <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>{s.subtitle}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
            {s.modes.map((m, i) => {
              const locked = !!m.lock;
              return (
                <button
                  key={m.id}
                  className="card bounce-in"
                  disabled={locked}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    cursor: locked ? 'not-allowed' : 'pointer',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    textAlign: 'center',
                    color: 'var(--ink)',
                    opacity: locked ? 0.5 : 1,
                    position: 'relative',
                    outline: m.next ? '3px solid var(--accent)' : undefined,
                  }}
                  onClick={() => {
                    playClick();
                    onSelect(m.id);
                  }}
                >
                  {m.next && (
                    <span className="chip" style={{ position: 'absolute', top: 8, left: 8, color: 'var(--accent)' }}>
                      👉 Ara
                    </span>
                  )}
                  {m.badge && (
                    <span className="chip" style={{ position: 'absolute', top: 8, right: 8, color: 'var(--yellow)' }}>
                      {m.badge}
                    </span>
                  )}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: m.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.6rem',
                    }}
                  >
                    {m.emoji}
                  </div>
                  <strong>{m.title}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{m.lock ?? m.desc}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <button className="btn btn--ghost" style={{ alignSelf: 'center', marginBottom: 12 }} onClick={() => setShowAll((v) => !v)}>
        {showAll ? '➖ Menys jocs' : `➕ Més jocs (${hiddenGames})`}
      </button>
    </div>
  );
}
