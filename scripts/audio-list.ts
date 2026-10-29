// Escriu en JSON la llista de clips d'àudio (la fa servir generate_audio.py).
import { allClips } from '../src/data/verbs.ts';

process.stdout.write(JSON.stringify(allClips()));
