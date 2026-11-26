# SpriteForge — Project Instructions for OpenCode

## Session Start Protocol

At the start of EVERY session in this project:

1. **Read `PROGRESS.md`** — it contains the full history of completed tasks, rendered videos, creative decisions, and lessons learned. This is your memory for this project.
2. **Read `README.md`** — it contains the project architecture, installation protocol, and usage instructions.
3. **Check `git status`** — to see if there are uncommitted changes from a previous session.

## Project Overview

SpriteForge is a 100% free, open-source code-based 2.5D video engine:
- **Studio UI** (`npm run dev` → `http://localhost:3000`) — interactive character/scene/animation editor
- **Remotion Renderer** (`apps/renderer/`) — headless MP4/WebM rendering
- **Audio Pipeline** (`tools/audio_pipeline.py`) — Kokoro TTS + faster-whisper + Foley SFX
- **Prompt Generator** (`tools/print_director_prompt.ts`) — generates Master Director Prompts
- **Validator** (`tools/validate_production.ts`) — strict ProductionScript JSON validation
- **Blender Export** (`tools/blender_export.py`) — .blend file export with armature rigs

## Key Rules

1. **Never use `Math.random()` or `Date.now()`** in `src/engine/` evaluation paths — all animation must be deterministic.
2. **Keep clothing segmented** across bending joints (upper arm/forearm, pelvis/thigh/shin).
3. **Always run `npm test && npm run lint && npm run build`** after code changes.
4. **Use only registered asset IDs** — check `src/assets/registry.ts` for valid IDs.
5. **Use only allowed emotions/actions/voices** — see `src/schemas/character.schema.ts` and `src/schemas/production.schema.ts`.
6. **Resolution support:** 720p (1280×720), 1080p (1920×1080), 1440p (2560×1440), 4k (3840×2160). Set via `"resolution"` field in ProductionScript JSON. Root.tsx uses `RESOLUTION_DIMENSIONS` to calculate composition dimensions.
7. **render.mjs flags:** Use `--script` and `--out` (NOT `--input`/`--output`). Wrong flags cause fallback to default bomb_defusal production with no audio.
8. **audio_pipeline.py flags:** Positional input + `--out` (NOT `--input`/`--output`/`--public-dir`).

## Rendering Pipeline (correct order)

```bash
# 1. Validate
npx tsx tools/validate_production.ts out/generated.production.json

# 2. Audio (Kokoro TTS + Whisper + SFX)
.venv\Scripts\python.exe tools/audio_pipeline.py out/generated.production.json --out out/enriched.production.json

# 3. Render MP4 (Remotion)
cd apps/renderer && node render.mjs --script ..\..\out\enriched.production.json --out ..\..\out\final_video.mp4
```

## Python Environment

- Python 3.15 at `C:\Python315\python.exe`
- Virtual env at `.venv\` (kokoro, soundfile, faster-whisper, numpy, requests)
- Rhubarb Lip Sync at `C:\shorts-factory\tools\Rhubarb-Lip-Sync-1.14.0-Windows\rhubarb.exe` (on PATH)
- FFmpeg 9.0.2 (on PATH)
- Node.js 26.13.0, npm 11.20.0

## Character Type

- `cartoon` — articulated rigs with layered outfits, glossy eyes, detailed faces
- `stickman` — sleek expressive stickman with thin ink lines, hats/props, bold expressions

## Camera Modes

- `cinematic` — wide establishing, over-the-shoulder, rule-of-thirds close-ups, reaction cutaways, dutch_tension, low_angle_hero
- `podcast` — seated angled close-ups (angle_left/angle_right) + split_screen at peaks
- `standard` — basic framing
- `dynamic` / `steady` — editorial movement

## Valid Shot Modes

wide, medium_two_shot, over_shoulder_left, over_shoulder_right, closeup_speaker, closeup_left, closeup_right, reaction_cut, angle_left, angle_right, dutch_tension, low_angle_hero

## Valid Transitions

cut, fade, wipe_left, iris, whip_left, whip_right, zoom_push

## Valid SFX Types

whoosh, thud, pop, ding, gasp, slam, footstep, door_knock, chai_pour, cricket_hit, applause, bell_chime

## Valid Emotions (17)

scared, happy, sad, angry, surprised, disgusted, confident, determined, confused, suspicious, excited, nervous, embarrassed, bored, curious, frustrated, smug

## Valid Actions (25)

idle, walk, run, sprint, jump, point, wave, shrug, lean_in, think_chin, nod_agree, desk_slam, clap, punch, kick, dodge, laugh, cry, panic, tremble, celebrate, facepalm, look_around, gasp, hold_prop

## Kokoro Voices (13)

am_michael, af_heart, am_adam, af_bella, bm_george, bf_emma, am_fenrir, af_nicole, bm_lewis, am_eric, af_sarah, bf_isabella, am_liam

## Memory

- `PROGRESS.md` — full task history, creative decisions, rendered videos, lessons learned
- Update `PROGRESS.md` at the end of every task with a short note

## Git

- Repo: https://github.com/Auditor09/Video-Generation-Code-Based.git
- Branch: main
- `.venv/` and `out/` are gitignored (large files)
- Run `git add . && git commit -m "..." && git push` after significant changes
