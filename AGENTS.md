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

## Valid Backgrounds (20)

neighborhood_street, forest_trail, city_street, rooftop_night, cozy_living_room, cafe_diner, office_desk, classroom, laboratory, police_precinct, podcast_studio, tv_studio, studio_backdrop, lahore_courtyard, chai_dhaba, badshahi_mosque_square, karachi_bazaar, hunza_valley, pakistani_truck_highway

## Character Presets (13)

char_rookie_officer (Officer Marcus, am_michael), char_lab_scientist (Dr. Elena Vance, af_heart), char_detective_noir (Detective Miller, am_adam), char_street_skater (Maya Lin, af_bella), char_british_host (Arthur Pendelton, bm_george), char_emma_anchor (Emma Sterling, bf_emma), char_fenrir_bouncer (Viktor Kane, am_fenrir), char_nicole_producer (Nicole Mercer, af_nicole), char_basic_clean (Basic Character, am_eric), char_zainab_pakistani (Zainab Tariq, af_sarah), char_hamza_pakistani (Hamza Abbasi, bm_lewis), char_bilal_lahori (Ustad Bilal, am_liam), char_ayesha_punjabi (Ayesha Malik, bf_isabella)

## Valid Emotions (17)

scared, happy, sad, angry, surprised, disgusted, confident, determined, confused, suspicious, excited, nervous, embarrassed, bored, curious, frustrated, smug

## Valid Actions (25)

idle, walk, run, sprint, jump, point, wave, shrug, lean_in, think_chin, nod_agree, desk_slam, clap, punch, kick, dodge, laugh, cry, panic, tremble, celebrate, facepalm, look_around, gasp, hold_prop

## Kokoro Voices (13)

am_michael, af_heart, am_adam, af_bella, bm_george, bf_emma, am_fenrir, af_nicole, bm_lewis, am_eric, af_sarah, bf_isabella, am_liam

## New Tools (added in latest engine update)

- `tools/story_arc_planner.py` — Offline story-to-script compiler (no LLM needed). Parses screenplays or plain text into ProductionScript JSON with auto voice pairing, camera shots, transitions, SFX.
- `tools/blender_export.py` — Blender bpy armature + lip-sync + VSE export. Creates .blend files with cel-shaded rigs, camera keyframes, audio strips.
- `tools/check_tools.py` — Environment preflight checker. Run `python tools/check_tools.py` to see what's installed/missing.

## New Studio Components (added in latest engine update)

- `src/studio/MusicStudioPanel.tsx` — UI for generating procedural music tracks and SFX, download as WAV, preview in browser
- `src/studio/TimelineAnnotations.tsx` — Add text notes to specific frames on the production timeline, color-coded, resolvable
- `src/engine/audio/` — `musicEngine.ts` (procedural music, 5 moods), `sfxEngine.ts` (deterministic WAV SFX), `browserAudio.ts` (Web Audio playback)

## New Equipment Asset IDs (Pakistani-themed)

- Hair: hair_pakistani_parted, hair_pakistani_paranda
- Facial Hair: beard_maulana_sunnah, mustache_pahelwan
- Upper Body: shalwar_kameez_top, kurta_embroidered, waistcoat_pakistani, sherwani_royal, anarkali_frock, pathani_suit
- Lower Body: shalwar_trousers, gharara_sharara, churidar_pajama
- Footwear: peshawari_chappal, khussa_embroidered, kolhapuri_chappal
- Headwear: pakol_cap, jinnah_cap, sindhi_topi, turban_pagri, dupatta_head_drape, dupatta_hijab
- Piercing: jhumka_ear_l, jhumka_ear_r, nath_nose_stud, maang_tikka
- Accessory: ajrak_shawl, truck_art_satchel, bangles_chooriyan
- Prop: chai_kulhad, cricket_bat_pak, chai_ketli, dhol_drum, tasbih_beads
- Tattoo: tat_mehndi_henna

## New SFX Types (added)

chai_pour, cricket_hit, applause, bell_chime (in addition to whoosh, thud, pop, ding, gasp, slam, footstep, door_knock)

## New Voices (added)

am_liam (warm steady male), af_sarah (clear articulate female), bf_isabella (warm British female), bm_lewis (British composed male) — in addition to the original 9

## Memory

- `PROGRESS.md` — full task history, creative decisions, rendered videos, lessons learned
- Update `PROGRESS.md` at the end of every task with a short note

## Git

- Repo: https://github.com/Auditor09/Video-Generation-Code-Based.git
- Branch: main
- `.venv/` and `out/` are gitignored (large files)
- Run `git add . && git commit -m "..." && git push` after significant changes
