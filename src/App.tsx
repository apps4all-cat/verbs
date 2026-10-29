import { useState } from 'react';
import { ProgressProvider } from './state/ProgressContext';
import { HomeScreen } from './screens/HomeScreen';
import { ModeSelectScreen, type GameMode } from './screens/ModeSelectScreen';
import { StudyScreen } from './screens/StudyScreen';
import { TrioScreen } from './screens/TrioScreen';
import { TableScreen } from './screens/TableScreen';
import { ContextScreen } from './screens/ContextScreen';
import { DictationScreen } from './screens/DictationScreen';
import { SpotScreen } from './screens/SpotScreen';
import { CrazyScreen } from './screens/CrazyScreen';
import { ExamScreen } from './screens/ExamScreen';
import { SimScreen } from './screens/SimScreen';
import { DuelScreen } from './screens/DuelScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AboutScreen } from './screens/AboutScreen';

type Screen = { name: 'home' } | { name: 'modes' } | { name: 'collection' } | { name: 'settings' } | { name: 'about' } | { name: 'game'; mode: GameMode };

function Shell() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const goModes = () => setScreen({ name: 'modes' });
  const goHome = () => setScreen({ name: 'home' });

  if (screen.name === 'home') {
    return (
      <HomeScreen
        onPlay={goModes}
        onCollection={() => setScreen({ name: 'collection' })}
        onSettings={() => setScreen({ name: 'settings' })}
        onEnemies={() => setScreen({ name: 'game', mode: 'enemies' })}
      />
    );
  }
  if (screen.name === 'modes') return <ModeSelectScreen onBack={goHome} onSelect={(mode) => setScreen({ name: 'game', mode })} />;
  if (screen.name === 'collection') return <CollectionScreen onBack={goHome} />;
  if (screen.name === 'settings') return <SettingsScreen onBack={goHome} onAbout={() => setScreen({ name: 'about' })} />;
  if (screen.name === 'about') return <AboutScreen onBack={() => setScreen({ name: 'settings' })} />;

  const back = screen.mode === 'enemies' ? goHome : goModes;
  switch (screen.mode) {
    case 'study':
      return <StudyScreen onBack={back} />;
    case 'trio':
      return <TrioScreen onBack={back} />;
    case 'table':
      return <TableScreen variant="group" onBack={back} />;
    case 'review':
      return <TableScreen variant="review" onBack={back} />;
    case 'enemies':
      return <TableScreen variant="enemies" onBack={back} />;
    case 'context':
      return <ContextScreen onBack={back} />;
    case 'dictation':
      return <DictationScreen onBack={back} />;
    case 'spot':
      return <SpotScreen onBack={back} />;
    case 'crazy':
      return <CrazyScreen onBack={back} />;
    case 'exam':
      return <ExamScreen onBack={back} />;
    case 'sim':
      return <SimScreen onBack={back} />;
    case 'duel':
      return <DuelScreen onBack={back} />;
  }
}

export default function App() {
  return (
    <ProgressProvider>
      <div className="app-shell">
        <Shell />
      </div>
    </ProgressProvider>
  );
}
