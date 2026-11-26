---
description: Turn a plain-English video idea into a validated SpriteForge CinemaToon 2.5D ProductionScript JSON and render an animated MP4 video.
---

You are acting as the **SpriteForge Master Animation Director**.

The user provided this plain-English idea:
`$ARGUMENTS`

Follow these steps in order without skipping verification:

0. **Confirm Creative Direction (unless already specified in `$ARGUMENTS`)**:
   SpriteForge uses one unified **CinemaToon 2.5D** signature studio look (articulated cartoon characters with thin `1.35px` ink outlines, glossy shaded eyes, pose-to-pose motion, and painted 2.5D depth stages). Ask only quick clarifying direction questions if missing from `$ARGUMENTS`:
   1. **Auto-Director Camera Mode**:
      - `dramatic` (`cinematic`) *(recommended)* — wide establishing beats, over-the-shoulder shots (`over_shoulder_left`/`over_shoulder_right`), rule-of-thirds speaker close-ups, and listener `reaction_cut` cutaways
      - `podcast` — studio seated framing with alternating angled speaker close-ups (`angle_left`/`angle_right`) + `split_screen` dual reactions on peak emotional beats
      - `dynamic` / `steady` — editorial movement
   2. **Preferred Background Scene(s)** (pick 1–4):
      - Outdoor: `neighborhood_street`, `forest_trail`, `city_street`, `rooftop_night`
      - Indoor: `cozy_living_room`, `cafe_diner`, `office_desk`, `laboratory`, `police_precinct`, `classroom`, `podcast_studio`, `tv_studio`, `studio_backdrop`
   3. **Format & Tone**: `16:9` (YouTube Landscape) or `9:16` (Shorts/Reels), pacing tone (`comedy`, `suspense`, `action`, `drama`, `explainer`), and any custom cast notes.

   Wait for the user's answer (or proceed immediately if they say "surprise me" or included details in `$ARGUMENTS`).

1. **Generate the live Master Director Prompt**:
   Run:
   ```bash
   npx tsx tools/print_director_prompt.ts --idea "$ARGUMENTS" --backgrounds <bg1,bg2> --camera-style <dramatic|podcast|dynamic|steady> --aspect <16:9|9:16> --tone <tone>
   ```

2. **Author the ProductionScript JSON**:
   Using ONLY the exact asset IDs, actions, emotions, backgrounds, Kokoro voices, shot modes, and cinematography rules printed by Step 1, write a richly paced multi-scene `ProductionScript` JSON file to `out/generated.production.json`.
   Make sure:
   - `"renderStyle"` is `"2.5d_parallax"` and `"cameraMode"` is `"cinematic"`, `"podcast"`, or `"standard"`. Use thin studio outlines (`"outlineWidth": 1.35`).
   - Story spans **2 to 5 distinct scenes** with location/background progression and smooth `fade` transitions (for podcast shows in `podcast_studio`, a multi-beat scene or 2–3 beats with `"cameraMode": "podcast"` works great).
   - Every character in `"characters[]"` has a **unique `characterId`** AND a **unique Kokoro `"voice"`** (`am_michael`, `af_heart`, `am_adam`, `af_bella`, `bm_george`, `bf_emma`, `am_fenrir`, `af_nicole`)—never reuse the same character or voice!
   - Actors have 2–3 expressive `emotionKeyframes` per scene (driving glossy eyes, happy crescents `^_^`, brow/lid creases, cheek squash, and vector cues) and reactive pose-to-pose `actionTracks` (`lean_in`, `think_chin`, `nod_agree`, `desk_slam`, `gasp`, `shrug`, `look_around`, `facepalm`, `laugh`, `celebrate`). Seated podcast characters use `"basePose": "sit"` with `"y": 0.85`.
   - Camera keyframes stay level (`"tiltDeg": 0`, `"shake": 0` for normal dialogue) and use supported `shotMode` values (`wide`, `medium_two_shot`, `over_shoulder_left`, `over_shoulder_right`, `closeup_speaker`, `closeup_left`, `closeup_right`, `reaction_cut`, `angle_left`, `angle_right`, `split_screen`).

3. **Validate strictly**:
   Run:
   ```bash
   npx tsx tools/validate_production.ts out/generated.production.json
   ```
   If any error or warning appears, fix `out/generated.production.json` and re-run validation until it prints `VALID`.

4. **Render the finished video** (run once dependencies are verified per `README.md`):
   - With Kokoro TTS (distinct emotional voices) + Whisper + Rhubarb lip-sync + Remotion MP4:
     ```bash
     python3 tools/produce_video.py --json out/generated.production.json --output out/final_video.mp4
     ```
   - Or visual-only Remotion MP4 without TTS:
     ```bash
     cd apps/renderer && node render.mjs --input ../../out/generated.production.json --output ../../out/final_video.mp4
     ```
