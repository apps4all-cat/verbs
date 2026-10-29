# Irregular Verbs

Els 99 verbs irregulars de l'anglès, per grups, amb jocs i àudio gravat. Sense anuncis i sense Internet.

Una app d'[Apps4All](https://apps4all-cat.github.io/apps/verbs/): gratuïta, sense anuncis i sense rastreig.
Versió 1.4. Identificador Android: `cat.apps4all.verbsirregulars`.

## Compilar

Cal Node.js 22 o més nou i una JDK 21.

```sh
npm ci
npm run build                 # edició Google Play
VITE_STORE=fdroid npm run build   # edició F-Droid
npx cap sync android
cd android && ./gradlew assembleRelease
```

Sense `keystore.properties`, l'APK de release surt sense signar.

## Privadesa

L'app no té cap permís, ni el d'Internet: no recull ni envia cap dada.
Política de privadesa: https://apps4all-cat.github.io/privacitat/verbs/

## Crèdits

- Veu anglesa dels àudios: Piper «alba» (corpus Alba, Universitat d'Edimburg), CC BY 4.0.
- Lletra Fredoka (SIL Open Font License 1.1).

## Llicència

GNU General Public License v3.0 (vegeu `LICENSE`).
