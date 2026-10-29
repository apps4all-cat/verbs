import { Capacitor, registerPlugin } from '@capacitor/core';

/** Plugin natiu (android/.../BackupPlugin.java). */
interface BackupPlugin {
  getGoogleBackup(): Promise<{ enabled: boolean }>;
  setGoogleBackup(options: { enabled: boolean }): Promise<void>;
  exportZip(options: { json: string; fileName: string }): Promise<{ saved: boolean }>;
  importZip(): Promise<{ json?: string }>;
}

const Native = registerPlugin<BackupPlugin>('Apps4AllBackup');

/** Totes les dades del joc són a localStorage amb aquest prefix (progrés, rècords i preferències). */
const PREFIX = 'verbs-irregulars';

export const backupAvailable = Capacitor.isNativePlatform();

export async function getGoogleBackup(): Promise<boolean> {
  return backupAvailable ? (await Native.getGoogleBackup()).enabled : false;
}

export async function setGoogleBackup(enabled: boolean): Promise<void> {
  if (backupAvailable) await Native.setGoogleBackup({ enabled });
}

function collect(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) data[key] = localStorage.getItem(key) ?? '';
  }
  return data;
}

/** Desa el progrés en un .zip on triï l'usuari. Retorna false si s'ha cancel·lat. */
export async function exportProgress(): Promise<boolean> {
  const date = new Date().toISOString().slice(0, 10);
  const json = JSON.stringify({ app: 'verbs-irregulars', version: 1, data: collect() });
  return (await Native.exportZip({ json, fileName: `VerbsIrregulars_${date}.zip` })).saved;
}

/**
 * Llegeix un .zip exportat abans i substitueix el progrés actual.
 * 'cancelled' si l'usuari no tria cap fitxer, 'invalid' si no és una còpia del joc.
 */
export async function importProgress(): Promise<'ok' | 'cancelled' | 'invalid'> {
  const { json } = await Native.importZip();
  if (json === undefined) return 'cancelled';
  try {
    const parsed = JSON.parse(json) as { app?: string; data?: Record<string, string> };
    if (parsed.app !== 'verbs-irregulars' || !parsed.data) return 'invalid';
    Object.keys(collect()).forEach((k) => localStorage.removeItem(k));
    for (const [k, v] of Object.entries(parsed.data)) {
      if (k.startsWith(PREFIX)) localStorage.setItem(k, v);
    }
    return 'ok';
  } catch {
    return 'invalid';
  }
}
