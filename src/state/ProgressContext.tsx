import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { loadProgress, saveProgress, type ProgressState } from './progress';
import { setLang } from '../data/verbs';
import { applyTheme } from '../utils/theme';

interface ProgressContextValue {
  progress: ProgressState;
  /**
   * Aplica un canvi sobre l'estat més recent (no sobre el que hi havia quan es va pintar la pantalla),
   * perquè les respostes que arriben dins d'un setTimeout no es trepitgin entre elles.
   */
  apply: <T extends { state: ProgressState } | ProgressState>(fn: (current: ProgressState) => T) => T;
  reload: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(loadProgress);
  const ref = useRef(progress);
  // Abans de pintar els fills: les traduccions surten en l'idioma triat.
  setLang(progress.settings.lang);

  useEffect(() => applyTheme(progress.settings.theme), [progress.settings.theme]);

  const apply: ProgressContextValue['apply'] = (fn) => {
    const result = fn(structuredClone(ref.current));
    const next = 'state' in result && 'unlockedGroups' in result.state ? result.state : (result as ProgressState);
    ref.current = next;
    saveProgress(next);
    setProgress(next);
    return result;
  };

  const reload = () => {
    const next = loadProgress();
    ref.current = next;
    setProgress(next);
  };

  return <ProgressContext.Provider value={{ progress, apply, reload }}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
