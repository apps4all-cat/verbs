#!/usr/bin/env python3
"""Genera els àudios dels verbs amb una veu Piper anglesa (sense connexió) a public/audio/.

Ús (des de apps/verbs/app):
    python scripts/generate_audio.py [--force]

Requereix: python -m pip install --user piper-tts imageio-ffmpeg
i la veu a apps/verbs/tools/voices/ (fora del git):
    python -m piper.download_voices en_GB-alba-medium --data-dir ../tools/voices

La llista de clips surt de src/data/verbs.ts (scripts/audio-list.ts): cada forma dels 99 verbs (w/<forma>.ogg)
i les dues frases d'exemple de cada verb (s/<verb>-past.ogg, s/<verb>-pp.ogg). Es comprimeix a Opus mono dins d'Ogg (.ogg: Android el serveix com a audio/ogg).
Si el text i els paràmetres no han canviat, no es torna a generar (scripts/audio-cache.json).
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import subprocess
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE = ROOT.parent / "tools" / "voices" / "en_GB-alba-medium.onnx"
OUT = ROOT / "public" / "audio"
CACHE = ROOT / "scripts" / "audio-cache.json"
BITRATE = "24k"
LENGTH_WORD = 1.15  # les formes soles, una mica més lentes: és un dictat
LENGTH_SENTENCE = 1.0


def synthesize(voice, text: str, length_scale: float) -> bytes:
    from piper.config import SynthesisConfig

    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        voice.synthesize_wav(text, wf, syn_config=SynthesisConfig(length_scale=length_scale))
    return buf.getvalue()


def to_opus(wav: bytes, out: Path) -> None:
    import imageio_ffmpeg

    out.parent.mkdir(parents=True, exist_ok=True)
    # Treu el silenci del principi i del final perquè les formes encadenades no quedin separades.
    trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse"
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y", "-f", "wav", "-i", "pipe:0",
                    "-af", trim, "-c:a", "libopus", "-b:a", BITRATE, "-ac", "1", str(out)], input=wav, check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    clips = json.loads(subprocess.run(["node", str(ROOT / "scripts" / "audio-list.ts")], capture_output=True, check=True,
                                      encoding="utf-8").stdout)
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() and not args.force else {}
    from piper import PiperVoice

    voice = PiperVoice.load(str(VOICE))
    done = 0
    for name, text in clips:
        length = LENGTH_WORD if name.startswith("w/") else LENGTH_SENTENCE
        key = hashlib.sha1(f"{VOICE.name}|{BITRATE}|{length}|pad60|{text}".encode()).hexdigest()
        out = OUT / f"{name}.ogg"
        if cache.get(name) == key and out.exists():
            continue
        to_opus(synthesize(voice, text, length), out)
        cache[name] = key
        done += 1
    # Esborra els clips que ja no surten a la llista.
    wanted = {f"{n}.ogg" for n, _ in clips}
    for f in OUT.rglob("*.ogg"):
        if f.relative_to(OUT).as_posix() not in wanted:
            f.unlink()
    CACHE.write_text(json.dumps(dict(sorted(cache.items())), indent=0), encoding="utf-8")
    size = sum(f.stat().st_size for f in OUT.rglob("*.ogg"))
    print(f"{done} clips nous · {len(clips)} en total · {size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
