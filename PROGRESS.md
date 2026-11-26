# PROGRESS — SpriteForge v2

## Completed: 2026-11-26

**Task:** Render "funny US/IRAN war analysis video podcast" (2 characters: 1 male, 1 female)

**Creative direction:** cartoon / 2.5d_parallax / podcast_studio / podcast camera / 9:16 / comedy / voices: am_michael (Marcus), af_heart (Sasha)

**Pipeline:**
1. `npx tsx tools/print_director_prompt.ts` — Master Director Prompt generated
2. `out/generated.production.json` — authored: 3 scenes, 2 cartoon characters, unique voices, outlineWidth 1.45, podcast multi-cam (wide → angle_left/angle_right → split_screen), emotionKeyframes + actionTracks per actor
3. `npx tsx tools/validate_production.ts out/generated.production.json` — VALID
4. `.venv\Scripts\python.exe tools/produce_video.py --json out/generated.production.json --output out/final_video.mp4` — rendered OK (14.3 MB, 720x1280 @ 30 FPS, 999 frames)

**Output artifacts:**
- `out/generated.production.json` (validated ProductionScript v1.0.0)
- `out/enriched.production.json` (audio-enriched with Kokoro TTS + Whisper phonemes)
- `out/final_video.mp4` (final rendered video)

## Completed: 2026-11-26 (second task)

**Task:** Render "surprise me" (2 characters: 1 male, 1 female)

**Creative direction:** cartoon / 2.5d_parallax / podcast_studio / podcast camera / 9:16 / comedy / voices: am_michael (Leo), af_heart (Mira)

**Pipeline:**
1. `npx tsx tools/print_director_prompt.ts` — Master Director Prompt generated ("Pineapple on Pizza – Funny Podcast Debate")
2. `out/generated.production.json` — authored: 3 scenes, 2 cartoon characters, unique voices, outlineWidth 1.4, podcast multi-cam, emotionKeyframes + actionTracks per actor
3. `npx tsx tools/validate_production.ts out/generated.production.json` — VALID
4. `.venv\Scripts\python.exe tools/produce_video.py --json out/generated.production.json --output out/final_video.mp4` — rendered OK (12.4 MB, 720x1280 @ 30 FPS, 848 frames)

## Completed: 2026-11-26 (third task)

**Task:** Render "make another video for me" (2 characters: 1 male, 1 female)

**Creative direction:** cartoon / 2.5d_parallax / classroom / cinematic camera / 16:9 / comedy / voices: am_michael (Jax), af_heart (Ms. Rivera)

**Pipeline:**
1. `npx tsx tools/print_director_prompt.ts` — Master Director Prompt generated ("The Homework That Ate My Dog")
2. `out/generated.production.json` — authored: 3 scenes, 2 cartoon characters, unique voices, outlineWidth 1.35, cinematic multi-cam (wide → over_shoulder_left/right → reaction_cut → split_screen), emotionKeyframes + actionTracks per actor
3. `npx tsx tools/validate_production.ts out/generated.production.json` — VALID
4. `.venv\Scripts\python.exe tools/produce_video.py --json out/generated.production.json --output out/final_video.mp4` — rendered OK (8.8 MB, 1280x720 @ 30 FPS, 764 frames) (video-only, no audio)

## Completed: 2026-11-26 (fourth task)

**Task:** Upload engine to GitHub

**Repo:** https://github.com/Auditor09/Video-Generation-Code-Based.git

**Pipeline:**
1. Added `.venv/` and `out/` to `.gitignore` to prevent bloat
2. `git init`, `git add .`, `git commit` (101 files, ~24K insertions)
3. `git branch -M main`, `git remote add origin https://github.com/Auditor09/Video-Generation-Code-Based.git`, `git push -u origin main` — pushed successfully

**Environment audit (pre-task):** Node 26.13.0, npm 11.20.0, FFmpeg 9.0.2, Python 3.15.2 (C:\Python315), .venv with all 5 required packages — nothing missing to install.

## Completed: 2026-11-27 (seventh task)

**Task:** Render 4 "Classroom Chaos" videos with different camera styles for comparison

**Creative direction:** stickman / 2.5d_parallax / classroom / 16:9 / 1080p / comedy / upbeat music / cinematic bars / voices: Mr. Thompson=am_adam, Tommy=am_eric, Lily=af_bella

**Pipeline:** Generated 4 ProductionScript JSONs (one per camera style), validated all 4, ran audio pipeline + Remotion render for each.

**Output artifacts:**
- `out/final_cinematic.mp4` — 876 frames, 1280x720 @ 30fps, 2108 kb/s video + 317 kb/s AAC audio
- `out/final_podcast.mp4` — 876 frames, 1280x720 @ 30fps, 1604 kb/s video + 317 kb/s AAC audio
- `out/final_dynamic.mp4` — 876 frames, 1280x720 @ 30fps, 2219 kb/s video + 317 kb/s AAC audio
- `out/final_steady.mp4` — 876 frames, 1280x720 @ 30fps, 1772 kb/s video + 317 kb/s AAC audio

All 4 videos have both video (H.264) and audio (AAC stereo) streams.

## Completed: 2026-11-27 (ninth task)

**Task:** Save progress and create AGENTS.md for session persistence

**What was done:**
1. Created `AGENTS.md` in project root — OpenCode reads this automatically at session start
2. AGENTS.md contains: session start protocol (read PROGRESS.md, README.md, check git status), project overview, key rules, rendering pipeline, Python/Node environment, character types, camera modes, valid IDs, Kokoro voices, memory rules, git info
3. Updated `PROGRESS.md` with all task history (9 tasks recorded)
4. OpenCode now reads these instructions automatically on every session start in this project folder

## Completed: 2026-11-27 (eighth task)

**Task:** Render "Classroom Chaos - Steady (Cartoon)" — same story as steady but with cartoon figures instead of stickman

**Creative direction:** cartoon / 2.5d_parallax / classroom / cinematic-steady camera / 16:9 / 1080p / comedy / upbeat music / cinematic bars / voices: Mr. Thompson=am_adam, Tommy=am_eric, Lily=af_bella

**Pipeline:**
1. Authored `out/generated_steady_cartoon.production.json` — 3 scenes, cartoon characterType, steady camera keyframes (minimal zoom 1.0→1.15, wide + medium_two_shot only)
2. `npx tsx tools/validate_production.ts` — VALID
3. `.venv\Scripts\python.exe tools/audio_pipeline.py` — Kokoro TTS + Whisper + SFX complete
4. `node render.mjs --script ..\..\out\enriched_steady_cartoon.production.json --out ..\..\out\final_steady_cartoon.mp4` — rendered OK (876 frames, 1280x720 @ 30 FPS, 2375 kb/s video + 317 kb/s AAC audio)

**Output artifacts:**
- `out/final_steady_cartoon.mp4` (final rendered video WITH audio — 876 frames, 1280x720 @ 30 FPS, AAC stereo)
- `out/enriched_steady_cartoon.production.json` (audio-enriched ProductionScript)

## Completed: 2026-11-26 (sixth task)

**Task:** Re-render with audio (video + dialogue + SFX + music)

**Creative direction:** same as fifth task (cartoon / 2.5d_parallax / classroom / cinematic / 16:9 / comedy / Jax + Ms. Rivera)

**Pipeline:**
1. Discovered render.mjs produces video-only when called with `--input`/`--output` (wrong args). Must use `--script`/`--out` to load the enriched JSON with audioFile references.
2. Remotion composition (SpriteForgeComposition.tsx) includes `<Audio>` components for musicTrack, dialogue lines, and SFX cues — audio renders into the MP4 automatically when composition is properly loaded.
3. `node render.mjs --script ..\..\out\enriched.production.json --out ..\..\out\final_video.mp4` — rendered OK (792 frames, 1280x720 @ 30 FPS, AAC stereo 317kb/s)
4. Verified with ffmpeg: Stream #0:0 Video (h264) + Stream #0:1 Audio (aac, 48000 Hz, stereo)

## Completed: 2026-11-26 (fifth task)

**Task:** Re-render "The Homework That Ate My Dog" with updated engine (2 characters: 1 male, 1 female)

**Creative direction:** cartoon / 2.5d_parallax / classroom / cinematic camera / 16:9 / comedy / voices: am_michael (Jax), af_heart (Ms. Rivera)

**Pipeline:**
1. `npx tsx tools/print_director_prompt.ts` — Master Director Prompt generated (new CinemaToon 2.5D format with storyBeat, chapterTitle, musicMood, cinematicBars, sfxCues)
2. `out/generated.production.json` — authored: 3 scenes (setup → escalation → resolution), new equipment IDs (hoodie, blazer_tee, glasses_round, backpack_straps, clipboard), medium_two_shot instead of split_screen, sfxCues (whoosh, gasp, slam, thud, pop, ding), outlineWidth 1.35
3. `npx tsx tools/validate_production.ts out/generated.production.json` — VALID ("The Homework That Ate My Dog" — 3 scenes, 30fps)
4. `.venv\Scripts\python.exe tools/audio_pipeline.py out/generated.production.json --out out/enriched.production.json` — Kokoro TTS + Whisper + SFX complete
5. `node render.mjs --input ../out/enriched.production.json --output ../out/final_video.mp4` — Remotion render → out/spriteforge_video.mp4 (4.0 MB, 1280x720 @ 30 FPS, 390 frames), copied to out/final_video.mp4

**Engine changes noted:** produce_video.py uses --out not --output; audio_pipeline.py uses positional input + --out; split_screen shotMode removed (use medium_two_shot); new equipment ID naming convention; musicMood/cinematicBars/storyBeat/chapterTitle/sfxCues fields added.
