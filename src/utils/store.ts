// Edició de l'app, segons la botiga on es publica (VITE_STORE en compilar):
// - play (per defecte): «Quant a» només enllaça el web d'Apps4All. Cap invitació a fer aportacions,
//   per complir la política de pagaments de Google Play.
// - fdroid: també hi ha la invitació a convidar a un cafè.
export const STORE: 'play' | 'fdroid' = import.meta.env.VITE_STORE === 'fdroid' ? 'fdroid' : 'play';

declare const __APP_VERSION__: string;
/** versionName d'android/app/build.gradle (vite.config.ts el llegeix en compilar). */
export const APP_VERSION = __APP_VERSION__;

const WEB = 'https://apps4all-cat.github.io';
export const LINKS = {
  web: `${WEB}/`,
  support: `${WEB}/suport/`,
  privacy: `${WEB}/privacitat/verbs/`,
};
