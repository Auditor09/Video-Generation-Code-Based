#!/usr/bin/env python3
"""
SpriteForge Audio, Speech Timing & Lip-Sync Pipeline
1. Synthesizes dialogue lines to WAV via Kokoro TTS (public/audio/...).
2. Extracts word-level timestamps via faster-whisper (for highlighted captions).
3. Extracts Rhubarb-compatible mouth cues (X, A-H) via `rhubarb` CLI (or deterministic fallback).
4. Updates the ProductionScript JSON with audioFile, words, phonemes, and adjusted scene timings.
"""

import argparse
import hashlib
import json
import shutil
import subprocess
import wave
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_KOKORO_PIPELINE: Any = None

MALE_VOICES = ["am_michael", "am_adam", "bm_george", "am_fenrir", "bm_lewis", "am_eric"]
FEMALE_VOICES = ["af_heart", "af_bella", "bf_emma", "af_nicole", "af_sarah", "bf_isabella"]
ALL_KNOWN_VOICES = set(MALE_VOICES + FEMALE_VOICES)


def get_kokoro_pipeline() -> Any:
    global _KOKORO_PIPELINE
    if _KOKORO_PIPELINE is None:
        from kokoro import KPipeline  # type: ignore
        _KOKORO_PIPELINE = KPipeline(lang_code="a")
    return _KOKORO_PIPELINE


def get_wav_duration(wav_path: Path) -> float:
    with wave.open(str(wav_path), "rb") as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        return frames / float(rate)


def infer_emotion_prosody(emotion_weights: Dict[str, float], emotion_tone: str = "") -> Tuple[float, float]:
    """
    Returns (speed, pitch_shift_ratio) based on dominant emotion or explicit emotionTone.
    """
    tone = emotion_tone.strip().lower()
    dominant = tone
    top_val = 0.0
    if not dominant and emotion_weights:
        for k, v in emotion_weights.items():
            if float(v) > top_val:
                top_val = float(v)
                dominant = k.lower()

    prosody_table: Dict[str, Tuple[float, float]] = {
        "excited": (1.14, 1.045),
        "happy": (1.07, 1.035),
        "surprised": (1.12, 1.055),
        "scared": (1.15, 1.05),
        "nervous": (1.09, 1.03),
        "panic": (1.18, 1.06),
        "angry": (1.08, 0.965),
        "frustrated": (1.06, 0.975),
        "determined": (1.03, 0.985),
        "confident": (0.98, 0.97),
        "smug": (0.94, 0.98),
        "suspicious": (0.95, 0.98),
        "sad": (0.87, 0.955),
        "bored": (0.89, 0.96),
        "embarrassed": (1.04, 1.02),
        "curious": (1.03, 1.025),
        "confused": (0.97, 1.015),
    }
    return prosody_table.get(dominant, (1.0, 1.0))


def shape_expressive_audio(audio: Any, pitch_ratio: float) -> Any:
    """
    Applies subtle, clean pitch inflection, soft peak normalization, and anti-click fades.
    """
    import numpy as np  # type: ignore

    arr = np.asarray(audio, dtype=np.float32)
    if arr.size < 64:
        return arr

    # Gentle pitch inflection via linear resampling if emotion requests it
    if abs(pitch_ratio - 1.0) > 0.005:
        target_len = max(64, int(round(arr.size / pitch_ratio)))
        src_x = np.linspace(0.0, 1.0, num=arr.size, endpoint=True)
        dst_x = np.linspace(0.0, 1.0, num=target_len, endpoint=True)
        arr = np.interp(dst_x, src_x, arr).astype(np.float32)

    # Peak normalize cleanly to -1 dBFS
    peak = float(np.max(np.abs(arr)))
    if peak > 1e-5:
        arr = arr * (0.90 / peak)

    # 25ms fade-in/out to prevent clicks
    fade_samples = min(arr.size // 4, 600)
    if fade_samples > 4:
        ramp = np.linspace(0.0, 1.0, fade_samples, dtype=np.float32)
        arr[:fade_samples] *= ramp
        arr[-fade_samples:] *= ramp[::-1]

    return arr


def synthesize_kokoro(
    text: str,
    out_wav: Path,
    voice: str = "af_heart",
    speed: float = 1.0,
    pitch_ratio: float = 1.0,
) -> None:
    try:
        import soundfile as sf  # type: ignore
        import numpy as np  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "Kokoro TTS or soundfile is not installed. Run: pip install -r tools/requirements.txt"
        ) from exc

    out_wav.parent.mkdir(parents=True, exist_ok=True)
    pipeline = get_kokoro_pipeline()
    audio_chunks = []
    for _, _, audio in pipeline(text, voice=voice, speed=speed):
        audio_chunks.append(audio)
    if not audio_chunks:
        raise RuntimeError(f"Kokoro returned empty audio for line: {text}")
    full_audio = np.concatenate(audio_chunks)
    shaped = shape_expressive_audio(full_audio, pitch_ratio=pitch_ratio)
    sf.write(str(out_wav), shaped, 24000)


def build_cast_voice_map(script: Dict[str, Any], user_voice_map: Dict[str, str]) -> Dict[str, str]:
    """
    Guarantees every character gets a distinct Kokoro voice so no two speakers sound identical.
    Maps characterId -> kokoro_voice_id.
    """
    assigned: Dict[str, str] = {}
    used_voices: set[str] = set()

    characters = script.get("characters", [])
    for idx, ch in enumerate(characters):
        cid = ch.get("id", f"char_{idx}")
        explicit = user_voice_map.get(cid) or ch.get("voice")
        if explicit and explicit in ALL_KNOWN_VOICES and explicit not in used_voices:
            assigned[cid] = explicit
            used_voices.add(explicit)
            continue

        name_lower = f"{cid} {ch.get('name', '')} {ch.get('description', '')}".lower()
        equip = ch.get("equipment", {})
        has_facial_hair = equip.get("facialHair", "none") not in ("none", "", None)
        male_hints = ("officer", "detective", "miller", "alex", "leo", "marcus", "boss", "man", "guy", "bro", "dad", "mr", "sir")
        female_hints = ("elena", "maya", "sarah", "nurse", "queen", "girl", "woman", "mom", "ms", "mrs", "dr. elena")

        if has_facial_hair or any(h in name_lower for h in male_hints):
            pool = MALE_VOICES + FEMALE_VOICES
        elif any(h in name_lower for h in female_hints):
            pool = FEMALE_VOICES + MALE_VOICES
        else:
            pool = (MALE_VOICES + FEMALE_VOICES) if idx % 2 == 0 else (FEMALE_VOICES + MALE_VOICES)

        digest = int(hashlib.sha256(cid.encode("utf-8")).hexdigest(), 16)
        chosen: Optional[str] = None
        for offset in range(len(pool)):
            candidate = pool[(digest + offset) % len(pool)]
            if candidate not in used_voices:
                chosen = candidate
                break
        if chosen is None:
            chosen = pool[idx % len(pool)]

        assigned[cid] = chosen
        used_voices.add(chosen)

    return assigned


def get_actor_emotion_at(scene: Dict[str, Any], actor_id: str, time_sec: float) -> Dict[str, float]:
    for actor in scene.get("actors", []):
        if actor.get("id") != actor_id:
            continue
        kfs = sorted(actor.get("emotionKeyframes", []), key=lambda k: float(k.get("timeSec", 0.0)))
        if not kfs:
            return {}
        best = kfs[0]
        for kf in kfs:
            if float(kf.get("timeSec", 0.0)) <= time_sec + 0.15:
                best = kf
        return {str(k): float(v) for k, v in (best.get("emotion") or {}).items()}
    return {}


def extract_whisper_words(wav_path: Path, offset_sec: float) -> List[Dict[str, Any]]:
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        return []

    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(wav_path), word_timestamps=True)
    words: List[Dict[str, Any]] = []
    for seg in segments:
        if not seg.words:
            continue
        for w in seg.words:
            words.append({
                "word": w.word.strip(),
                "startSec": round(offset_sec + float(w.start), 3),
                "endSec": round(offset_sec + float(w.end), 3),
            })
    return words


def extract_rhubarb_cues(wav_path: Path, offset_sec: float, duration_sec: float) -> List[Dict[str, Any]]:
    rhubarb_bin = shutil.which("rhubarb")
    if rhubarb_bin:
        proc = subprocess.run(
            [rhubarb_bin, "-f", "json", str(wav_path)],
            capture_output=True,
            text=True,
            check=True,
        )
        data = json.loads(proc.stdout)
        return [
            {
                "startSec": round(offset_sec + float(cue["start"]), 3),
                "endSec": round(offset_sec + float(cue["end"]), 3),
                "phoneme": cue["value"],
            }
            for cue in data.get("mouthCues", [])
        ]

    # Deterministic fallback viseme cycle if Rhubarb binary is unavailable
    cycle = ["B", "D", "A", "E", "C", "F", "B", "X"]
    step = 0.14
    cues: List[Dict[str, Any]] = []
    cur = 0.0
    idx = 0
    while cur < duration_sec:
        nxt = min(duration_sec, cur + step)
        cues.append({
            "startSec": round(offset_sec + cur, 3),
            "endSec": round(offset_sec + nxt, 3),
            "phoneme": cycle[idx % len(cycle)],
        })
        cur = nxt
        idx += 1
    return cues


def process_production(input_json: Path, output_json: Path, audio_root: Path, voice_map: Dict[str, str]) -> None:
    script = json.loads(input_json.read_text(encoding="utf-8"))
    prod_id = script.get("id", "production")
    char_voice_map = build_cast_voice_map(script, voice_map)

    for s_idx, scene in enumerate(script.get("scenes", [])):
        actor_to_char = {
            act.get("id", ""): act.get("characterId", "")
            for act in scene.get("actors", [])
        }
        cursor = 0.25
        for l_idx, line in enumerate(scene.get("dialogue", [])):
            line_id = line.get("id", f"s{s_idx}_l{l_idx}")
            actor_id = line.get("actorId", "")
            char_id = actor_to_char.get(actor_id, actor_id)

            explicit_line_voice = line.get("voice")
            if explicit_line_voice and explicit_line_voice in ALL_KNOWN_VOICES:
                voice = explicit_line_voice
            else:
                voice = voice_map.get(actor_id) or char_voice_map.get(char_id) or (
                    MALE_VOICES[l_idx % len(MALE_VOICES)] if l_idx % 2 == 0 else FEMALE_VOICES[l_idx % len(FEMALE_VOICES)]
                )

            line_start_guess = max(cursor, float(line.get("startSec", cursor)))
            emotion_weights = get_actor_emotion_at(scene, actor_id, line_start_guess)
            speed, pitch_ratio = infer_emotion_prosody(emotion_weights, str(line.get("emotionTone", "")))

            rel_audio = f"audio/{prod_id}/{line_id}.wav"
            wav_path = audio_root / rel_audio
            synthesize_kokoro(
                line["text"],
                wav_path,
                voice=voice,
                speed=speed,
                pitch_ratio=pitch_ratio,
            )
            dur = get_wav_duration(wav_path)

            line_start = line_start_guess
            line_end = round(line_start + dur, 3)

            line["voice"] = voice
            line["startSec"] = round(line_start, 3)
            line["endSec"] = line_end
            line["audioFile"] = rel_audio
            line["phonemes"] = extract_rhubarb_cues(wav_path, line_start, dur)
            whisper_words = extract_whisper_words(wav_path, line_start)
            if whisper_words:
                line["words"] = whisper_words

            cursor = line_end + 0.25

        scene["durationSec"] = round(max(float(scene.get("durationSec", 1.0)), cursor + 0.4), 2)

    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(script, indent=2), encoding="utf-8")
    print(f"Audio & lip-sync pipeline complete: {output_json}")


def main() -> None:
    parser = argparse.ArgumentParser(description="SpriteForge Kokoro + Whisper + Rhubarb Audio Pipeline")
    parser.add_argument("--input", required=True, help="Input ProductionScript JSON")
    parser.add_argument("--output", required=True, help="Output enriched ProductionScript JSON")
    parser.add_argument("--public-dir", default="public", help="Public folder where audio/ files are written")
    args = parser.parse_args()

    process_production(
        Path(args.input),
        Path(args.output),
        Path(args.public_dir),
        voice_map={},
    )


if __name__ == "__main__":
    main()
