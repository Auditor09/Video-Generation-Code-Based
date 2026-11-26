# SpriteForge — Complete Procedural 2D Character Studio & Automated Video Engine

> **For OpenCode**: Read this document from top to bottom before running installs or modifying files. Every subsystem from Phase 0 through Phase 6 is implemented in this bundle—your job is to audit the local environment against Section 3, install **only** missing external tools/packages, and verify end-to-end rendering.

---

## 1. Folder Portability (Renaming & Monorepo Placement)

This bundle is completely folder-name independent:
- `vite.config.ts` and `tsconfig.json` use relative paths (`./src`, `__dirname`), so you can rename this folder (e.g. `spriteforge-engine/`) and move it directly into an existing OpenCode project.
- Do **not** leave a nested `.git` folder inside if placing inside an existing Git repository.
- Run `npm install` inside this directory (and inside `apps/renderer/` for Remotion) so Node dependencies resolve locally.

---

## 2. Complete Bundle Architecture

```text
.
├── src/
│   ├── schemas/
│   │   ├── character.schema.ts        # CharacterDefinition, EmotionWeights, SceneDefinition, validator
│   │   └── production.schema.ts       # Multi-scene ProductionScript, DialogueLineSpec, keyframes
│   ├── assets/
│   │   ├── types.ts                   # Layer slots, attachment points, color tokens
│   │   ├── hairCatalog.tsx            # 22 procedural SVG hairstyles (back/front + physics swing)
│   │   ├── facialHairCatalog.tsx      # 14 procedural SVG facial hair styles
│   │   ├── wardrobeCatalog.tsx        # Joint-segmented upper/lower garments & footwear
│   │   ├── accessoriesCatalog.tsx     # Headwear, eyewear, piercings, surface tattoos, props
│   │   └── registry.ts                # Asset registry & color token resolver
│   ├── engine/
│   │   ├── character/                 # bodyGeometry.ts, skeleton.ts, HandRenderer.tsx, CharacterRig.tsx
│   │   ├── expression/                # expressionSolver.ts (17 emotions + Rhubarb X,A-H), ProceduralFace.tsx
│   │   ├── animation/                 # math.ts (Bezier, springs, deterministic noise), evaluator.ts
│   │   ├── scene/                     # scenePrimitives.tsx, SceneCanvas.tsx (16:9 & 9:16)
│   │   └── production/                # sequencer.ts (multi-scene interpolation), ProductionStage.tsx (captions/fades)
│   ├── examples/
│   │   ├── sampleProduction.ts        # Typed 2-scene sample production (Blue Wire Lab)
│   │   └── productionDemos.ts         # 4 curated multi-genre CinemaToon 2.5D showcase productions
│   ├── studio/                        # CharacterInspector, EmotionInspector, AnimationInspector, SceneInspector, ProductionInspector, ExportImportModal
│   └── App.tsx                        # Standalone CinemaToon 2.5D Studio UI
├── apps/
│   └── renderer/                      # Remotion video renderer sub-package (isolated from root Vite build)
│       ├── package.json
│       ├── tsconfig.json
│       ├── render.mjs                 # CLI MP4 / transparent WebM renderer
│       └── src/
│           ├── index.ts
│           ├── Root.tsx               # Dynamic 16:9 (1280x720) & 9:16 (720x1280) Remotion Composition
│           └── SpriteForgeComposition.tsx
├── .opencode/
│   └── commands/
│       └── spriteforge-director.md    # Native OpenCode /spriteforge-director slash command
├── tools/
│   ├── requirements.txt               # Python packages (kokoro, soundfile, faster-whisper, requests, jsonschema)
│   ├── print_director_prompt.ts       # Plain-English idea -> live-catalog Master Director Prompt CLI
│   ├── validate_production.ts         # Strict ProductionScript v1.0.0 schema + asset ID validator
│   ├── script_to_production.py        # Qwen / Hermes LLM: idea/script -> validated JSON (with auto-repair)
│   ├── audio_pipeline.py              # Kokoro TTS + faster-whisper word timing + Rhubarb mouth cues
│   └── produce_video.py               # Single-command end-to-end orchestrator (idea/script -> audio -> Remotion MP4)
├── examples/
│   └── productions/
│       └── bomb_defusal.production.json
└── tests/
    └── spriteforge.test.ts            # Unit & determinism test suite
```

---

## 3. OpenCode Environment Audit & Installation Protocol

**Mandatory instruction for OpenCode:** Check what is already installed before downloading anything. Only install items that are missing or below minimum version.

### Step A: Audit Existing Environment
Run these checks first:
1. **Node.js & npm**: `node -v && npm -v` (Need Node `>= 20.x`)
2. **FFmpeg**: `ffmpeg -version` (Required by Remotion for MP4 encoding)
3. **Python 3**: `python3 --version && pip3 --version` (Need Python `>= 3.10`)
4. **Rhubarb Lip Sync**: `which rhubarb || rhubarb --version` (Recommended for accurate phoneme extraction; `tools/audio_pipeline.py` includes a deterministic fallback if absent)
5. **Ollama / Local LLM**: `which ollama && ollama list` (Check for `qwen2.5` or `hermes` models if LLM script conversion is used)
6. **Existing Python packages**: `python3 -m pip list` (Check for `kokoro`, `soundfile`, `faster-whisper`, `requests`, `jsonschema`)
7. **Existing Node dependencies**: Check root `node_modules/` and `apps/renderer/node_modules/`.

### Step B: Install Only Missing Dependencies
1. **Root Studio & Engine**:
   ```bash
   npm install
   npm run lint
   npm test
   npm run build
   ```
2. **Remotion Renderer (`apps/renderer`)**:
   If `apps/renderer/node_modules` is missing:
   ```bash
   cd apps/renderer && npm install && cd ../..
   ```
   *(If `ffmpeg` is missing on the host OS, install it via the OS package manager, e.g. `brew install ffmpeg` or `sudo apt-get install -y ffmpeg`.)*
3. **Python Audio & Automation Tools (`tools/`)**:
   If any packages from `tools/requirements.txt` are missing, create/reuse a virtual environment and install only missing requirements:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r tools/requirements.txt
   ```
4. **Optional Binaries (if missing)**:
   - **Rhubarb Lip Sync**: Download the binary for your OS from the official Rhubarb releases and add `rhubarb` to `PATH`.
   - **Ollama + Qwen/Hermes**: If using local LLM script generation and no model is pulled yet, run `ollama pull qwen2.5:14b` (or set `SPRITEFORGE_LLM_ENDPOINT` & `SPRITEFORGE_LLM_MODEL` to your local OpenAI-compatible server).

---

## 4. How to Run & Produce Videos

### A. Launch Standalone Character & Scene Studio (Includes Showcase Demos & Master Prompt Builder)
```bash
npm run dev
```
Open `http://localhost:3000`. Explore **Character Studio** (8 curated CinemaToon cast members with thin `1.35px` outlines and unique Kokoro voices), **Emotion Lab**, **Animation Rig** (25 pose-to-pose actions including `lean_in`, `think_chin`, `nod_agree`, `desk_slam`), and **Scene Director** (`Single Scene` or `Full Production (Multi-Scene)`). Inside **Full Production (Multi-Scene)**, load any of the **4 Showcase Productions** (*Podcast Debate*, *Blue Wire Lab*, *Street to Cafe*, *Noir Rooftop*), switch Auto-Director camera modes (`cinematic`, `podcast`, `standard`), or generate a catalog-grounded Master Director Prompt from a plain-English idea.

### B. OpenCode Native Slash Command (`/spriteforge-director`)
Because `.opencode/commands/spriteforge-director.md` is included, inside OpenCode you can simply type:
```text
/spriteforge-director Two podcast hosts react to wild breaking news
```
OpenCode will confirm your **Camera Style** (`dramatic` cinematic auto-director, `podcast` multi-cam with angled close-ups + split-screen reactions, `dynamic`, or `steady`), **Background Scene Options** (13 CinemaToon 2.5D painted stages including `podcast_studio`, `tv_studio`, `cafe_diner`, and `rooftop_night`), and **Format & Tone**, run `tools/print_director_prompt.ts`, write a validated `out/generated.production.json` with distinct character voices, and render the MP4.

### C. CLI Master Prompt Generator & Validator
Generate a catalog-grounded Master Director Prompt from the terminal:
```bash
npx tsx tools/print_director_prompt.ts --idea "Two roommates argue at a midnight diner" --aspect 9:16 --duration 25 --tone comedy --camera-style dramatic --backgrounds city_street,cafe_diner
```
Strictly validate any `.production.json` file against every asset ID, action, emotion, camera shot mode, voice, and character schema rule:
```bash
npx tsx tools/validate_production.ts out/generated.production.json
```

### D. Render the Included Example Production Directly to MP4 (No LLM Needed)
```bash
cd apps/renderer
node render.mjs --input ../../examples/productions/bomb_defusal.production.json --output ../../out/bomb_defusal.mp4
```
For transparent character export (`VP9` WebM with alpha):
```bash
cd apps/renderer
node render.mjs --input ../../examples/productions/bomb_defusal.production.json --output ../../out/bomb_defusal.webm --transparent
```

### E. Full End-to-End Automation (Plain-English Idea or Script -> Distinct Emotional Audio -> Remotion MP4)
From a plain-English idea:
```bash
source .venv/bin/activate
python tools/produce_video.py --idea "Two hosts debate a wild conspiracy theory on their podcast" --backgrounds podcast_studio --camera-style podcast --aspect 16:9 --duration 30 --tone comedy --output out/final_video.mp4
# Or add --interactive to choose Camera Style, Background Scenes, Aspect, and Tone interactively
```
From a story text file (YouTube Shorts `9:16`):
```bash
python tools/produce_video.py --script path/to/story.txt --camera-style dramatic --aspect 9:16 --fps 30 --output out/short_video.mp4
```
To synthesize distinct emotion-modulated Kokoro voices + lip-sync from an existing `.production.json` without calling an LLM:
```bash
python tools/produce_video.py --json examples/productions/bomb_defusal.production.json --output out/bomb_defusal_voiced.mp4
```

---

## 5. Mandatory Development Rules for OpenCode
1. Never use AI-generated bitmap artwork or stock assets; keep all artwork procedural SVG.
2. Never introduce `Math.random()` or `Date.now()` into `src/engine/` evaluation paths.
3. Keep clothing segmented across bending joints (upper arm / forearm, pelvis / thigh / shin).
4. Always run `npm test && npm run lint && npm run build` after code changes.
