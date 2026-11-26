/**
 * SpriteForge Master Director Prompt Generator (CinemaToon 2.5D v2.0)
 * Converts a plain-English video idea into a strict, cinematography-aware Master Prompt
 * grounded in the live SpriteForge asset catalog, emotions, actions, and ProductionScript schema.
 */

import { ALL_ASSETS } from '../assets/registry';
import {
  BackgroundSceneId,
  CHARACTER_PRESETS,
  CharacterType,
  RenderStyle,
} from '../schemas/character.schema';

export interface DirectorPromptOptions {
  idea: string;
  aspectRatio: '16:9' | '9:16';
  targetDurationSec?: number;
  tone?: 'comedy' | 'suspense' | 'action' | 'drama' | 'explainer';
  castMode?: 'presets_and_custom' | 'custom_only';
  renderStyle?: RenderStyle;
  characterType?: CharacterType;
  preferredBackgrounds?: BackgroundSceneId[];
  cameraStyle?: 'dynamic' | 'steady' | 'dramatic' | 'podcast';
}

export const KOKORO_VOICE_CATALOG = [
  'am_michael (warm male baritone)',
  'af_heart (warm expressive female)',
  'am_adam (crisp authoritative male)',
  'af_bella (bright energetic female)',
  'bm_george (British dramatic male)',
  'bf_emma (British poised female)',
  'am_fenrir (deep gravelly male)',
  'af_nicole (soft conversational female)',
];

function listIds(category: string): string {
  return ALL_ASSETS.filter((a) => a.category === category)
    .map((a) => a.id)
    .join(', ');
}

export function buildMasterDirectorPrompt(opts: DirectorPromptOptions): string {
  const duration = opts.targetDurationSec ?? (opts.aspectRatio === '9:16' ? 25 : 45);
  const tone = opts.tone ?? 'suspense';
  const cameraStyle = opts.cameraStyle ?? 'dramatic';
  const isPodcast =
    cameraStyle === 'podcast' ||
    Boolean(opts.preferredBackgrounds?.includes('podcast_studio'));

  const presetList = CHARACTER_PRESETS.map((p) => `${p.id} (${p.name}, voice: ${p.voice ?? 'am_adam'})`).join(', ');
  const preferredBgText =
    opts.preferredBackgrounds && opts.preferredBackgrounds.length > 0
      ? opts.preferredBackgrounds.join(', ')
      : 'Choose 2 to 4 contrasting CinemaToon locations matching the story beats';

  const cameraMode = isPodcast ? 'podcast' : cameraStyle === 'steady' ? 'standard' : 'cinematic';

  return `You are the SpriteForge Master Animation Director.
Convert the following plain-English video idea into a complete, studio-grade SpriteForge CinemaToon 2.5D ProductionScript v1.0.0 JSON.

============================================================
USER IDEA & CREATIVE DIRECTION
============================================================
"${opts.idea.trim()}"

Target Format: ${opts.aspectRatio} (${opts.aspectRatio === '9:16' ? '720x1280 YouTube Shorts / Vertical' : '1280x720 YouTube Landscape'})
Target Total Duration: ~${duration} seconds @ 30 FPS
Target Tone / Pacing: ${tone}
Signature Aesthetic: CinemaToon 2.5D (articulated vector characters with 1.35px thin ink outlines, glossy iris shading, painted tonal stages)
Preferred Background Scenes: ${preferredBgText}
Auto-Director Camera Mode: ${cameraMode} (${cameraStyle})

============================================================
DIRECTION & ANIMATION QUALITY RULES (MANDATORY)
============================================================
1. MULTI-SCENE PROGRESSION & LOCATION CHANGES:
   - Break multi-beat stories into 2 to 5 distinct scenes with clear dramatic beats (hook -> escalation -> turn -> payoff).
   - Change the "background" or staging across scenes when the story moves (or use multi-angle cuts inside podcast_studio).
   - Keep each dialogue line short and punchy (1.5s–3.5s) with natural pauses (0.2s–0.4s) between speakers.
   - Use "transitionIn": "fade" (0.35s) on location changes, or "cut" for sharp comedic reactions.

2. AUTO-DIRECTOR CINEMATOGRAPHY & PODCAST MULTI-CAM (ZERO JITTER):
   - NEVER leave cameraKeyframes frozen without direction! Set "cameraMode": "${cameraMode}" on the ProductionScript or scene so the Auto-Director automatically frames wide establishing beats, rule-of-thirds angled closeups, over-the-shoulder shots, listener reaction cutaways, and split-screen peak moments.
   - Supported "shotMode" values on cameraKeyframes: "wide", "medium_two_shot", "over_shoulder_left", "over_shoulder_right", "closeup_speaker", "closeup_left", "closeup_right", "reaction_cut", "angle_left", "angle_right", "split_screen".
   - PODCAST / INTERVIEW MODE (${isPodcast ? 'ACTIVE — FOLLOW STRICTLY' : 'Use whenever background is podcast_studio or cameraMode is podcast'}):
     * Seat hosts/guests at x: 0.28 (facing: 1) and x: 0.72 (facing: -1) with "basePose": "sit" and "y": 0.85.
     * Use "lean_in", "think_chin", "nod_agree", and "desk_slam" alongside "laugh", "gasp", and "shrug".
   - Keep "shake": 0 for all normal dialogue, walking, and podcast shots. ONLY use subtle impact shake (0.12 to 0.24 max) for a brief 0.4s explosion/slam beat.
   - Space standing actors cleanly horizontally (e.g. x: 0.30 and x: 0.70 in 16:9; x: 0.36 and x: 0.64 in 9:16) with facing: 1 or -1.

3. DISTINCT KOKORO VOICES & EMOTION-DRIVEN DELIVERY:
   - Assign a UNIQUE Kokoro "voice" ID to EVERY character in "characters[]" from: ${KOKORO_VOICE_CATALOG.join(', ')}.
   - NEVER give two characters the same voice!
   - Set "emotionTone" on dialogue lines (e.g. "excited", "nervous", "angry", "confident", "sad", "surprised", "curious", "happy") so voice delivery matches the scene.

4. EXPRESSIVE ACTING & THIN STUDIO INK OUTLINES:
   - Use thin studio outlines: set "outlineWidth": 1.35 (allowed 1.1 to 1.55) on every character so glossy iris highlights, crescent happy eyes, and brow/mouth curves read sharply.
   - Add 2–3 emotionKeyframes per actor per scene. Combine simultaneous emotions (e.g. {"scared": 0.65, "determined": 0.45}, {"happy": 0.92, "excited": 0.75}, {"angry": 0.85}, {"surprised": 0.9}) so vector reaction cues trigger naturally.
   - Use pose-to-pose acting actions on both speakers and listeners ("lean_in", "think_chin", "nod_agree", "desk_slam", "gasp", "shrug", "facepalm", "look_around", "wave", "point", "laugh", "celebrate"). Keep idle actors calmly planted.
   - Whenever an actor walks, animate their "positionKeyframes" smoothly across X over the exact duration of the "walk" actionTrack.

5. DISTINCT CHARACTERS (NO DUPLICATES):
   - ${opts.castMode === 'custom_only' ? 'Design distinct original characters in "characters[]" with unique IDs, contrasting hair, outfits, skinColor, proportions, and colorOverrides.' : `Create distinct original characters in "characters[]" for each role (or pick distinct presets from: ${presetList}).`}
   - NEVER assign the same characterId to two actors in the same scene!
   - Keep the exact same characterId across every scene so character identity never drifts.

============================================================
EXACT ALLOWED ENGINE VOCABULARY (USE ONLY THESE IDs)
============================================================
- Camera Modes: cinematic, podcast, standard
- Camera Shot Modes: wide, medium_two_shot, over_shoulder_left, over_shoulder_right, closeup_speaker, closeup_left, closeup_right, reaction_cut, angle_left, angle_right, split_screen
- Backgrounds: podcast_studio, laboratory, cafe_diner, neighborhood_street, police_precinct, rooftop_night, cozy_living_room, office_desk, city_street, forest_trail, classroom, tv_studio, studio_backdrop
- Scene Props: bomb_device, lab_console, street_lamp, wooden_crate
- Base Poses: stand, crouch, sit
- Actions: idle, walk, run, sprint, jump, point, wave, shrug, lean_in, think_chin, nod_agree, desk_slam, clap, punch, kick, dodge, laugh, cry, panic, tremble, celebrate, facepalm, look_around, gasp, hold_prop
- Emotions (0.0 to 1.0): scared, happy, sad, angry, surprised, disgusted, confident, determined, confused, suspicious, excited, nervous, embarrassed, bored, curious, frustrated, smug
- Kokoro Voices: am_michael, af_heart, am_adam, af_bella, bm_george, bf_emma, am_fenrir, af_nicole
- Face Overrides:
  - brows: auto, neutral, worried, angry, raised, skeptical, sad
  - eyes: auto, neutral, wide, suspicious, squint, closed, wink_l, wink_r, rolled
  - mouth: auto, neutral, smile, grin, frown, nervous_smile, open_gasp, grit_teeth, smirk, pout
- Head Shapes: oval, round, square, pear, chiseled
- Eye Styles: large_round, almond, sharp_narrow, heavy_lidded, wide_anime, tired_droop
- Brow Styles: natural, thick_bold, arched, thin_sharp, bushy
- Nose Styles: rounded, pointed, button, aquiline, broad
- Ear Styles: round, pointed, lobed, gauged
- Hair IDs: ${listIds('hair')}
- Facial Hair IDs: ${listIds('facialHair')}
- Headwear IDs: ${listIds('headwear')}
- Eyewear IDs: ${listIds('eyewear')}
- Upper Body IDs: ${listIds('upperBody')}
- Lower Body IDs: ${listIds('lowerBody')}
- Footwear IDs: ${listIds('footwear')}
- Piercing IDs: ${listIds('piercing')}
- Tattoo IDs: ${listIds('tattoo')} (surfaces: forehead, cheek_l, cheek_r, neck, chest, upper_arm_l, forearm_l, upper_arm_r, forearm_r, thigh_l, shin_r)
- Accessory IDs: ${listIds('accessory')}
- Handheld Prop IDs: ${listIds('prop')}

============================================================
REQUIRED OUTPUT FORMAT
============================================================
Output ONLY valid JSON matching ProductionScript v1.0.0:
{
  "schemaVersion": "1.0.0",
  "id": "prod_slug_001",
  "title": "Short Title",
  "renderStyle": "2.5d_parallax",
  "cameraMode": "${cameraMode}",
  "aspectRatio": "${opts.aspectRatio}",
  "fps": 30,
  "characters": [
    {
      "schemaVersion": "1.0.0",
      "id": "char_lead_1",
      "name": "Alex",
      "voice": "am_michael",
      "body": {
        "height": 1.0, "headSize": 1.0, "shoulderWidth": 1.0, "torsoLength": 1.0,
        "armLength": 1.0, "legLength": 1.0, "bodyThickness": 1.0, "limbThickness": 1.0,
        "neckThickness": 1.0, "handSize": 1.0, "footSize": 1.0, "headShape": "oval",
        "skinColor": "#F3D2B8", "outlineColor": "#18181B", "outlineWidth": 1.35
      },
      "face": {
        "eyeStyle": "large_round", "eyeColor": "#2563EB", "browStyle": "natural",
        "noseStyle": "rounded", "earStyle": "round", "mouthStyle": "procedural",
        "freckles": false, "blush": 0.12, "wrinkles": false, "darkCircles": false,
        "eyeBags": false, "dimples": false, "missingTooth": false, "crookedTeeth": false,
        "mole": "none", "facePaint": "none", "splitEyebrow": "none", "scars": []
      },
      "equipment": {
        "hair": "hair_messy_001", "facialHair": "none", "headwear": "none",
        "eyewear": "none", "upperBody": "hoodie", "lowerBody": "jeans",
        "footwear": "sneakers", "piercings": [], "tattoos": [],
        "accessories": [], "propRight": "none", "propLeft": "none",
        "colorOverrides": { "hair": { "main": "#292929" }, "upperBody": { "main": "#2563EB" } }
      }
    }
  ],
  "scenes": [
    {
      "id": "scene_1",
      "title": "01. Establishing Beat",
      "durationSec": 5.0,
      "background": "${opts.preferredBackgrounds?.[0] ?? (isPodcast ? 'podcast_studio' : 'neighborhood_street')}",
      "cameraMode": "${cameraMode}",
      "transitionIn": "fade",
      "transitionDurationSec": 0.35,
      "cameraKeyframes": [
        { "timeSec": 0, "zoom": 1.0, "panX": 0, "panY": 0, "shake": 0, "shotMode": "wide" },
        { "timeSec": 1.5, "zoom": 1.54, "panX": 0, "panY": 0, "shake": 0, "shotMode": "${isPodcast ? 'angle_left' : 'over_shoulder_right'}" },
        { "timeSec": 3.5, "zoom": 1.0, "panX": 0, "panY": 0, "shake": 0, "shotMode": "split_screen" }
      ],
      "actors": [
        {
          "id": "actor_1",
          "characterId": "char_lead_1",
          "positionKeyframes": [{ "timeSec": 0, "x": ${isPodcast ? '0.28' : '0.32'}, "y": 0.85, "scale": 1.0, "facing": 1 }],
          "actionTracks": [{ "startSec": 0, "endSec": 5.0, "basePose": "${isPodcast ? 'sit' : 'stand'}", "type": "lean_in", "intensity": 0.9 }],
          "emotionKeyframes": [
            { "timeSec": 0, "emotion": { "curious": 0.65 }, "faceOverrides": { "brows": "auto", "eyes": "auto", "mouth": "auto" } },
            { "timeSec": 2.8, "emotion": { "surprised": 0.88 }, "faceOverrides": { "brows": "raised", "eyes": "wide", "mouth": "auto" } }
          ]
        }
      ],
      "props": [],
      "dialogue": [
        {
          "id": "line_1",
          "actorId": "actor_1",
          "speakerName": "Alex",
          "emotionTone": "curious",
          "text": "Wait, did you hear what happened today?",
          "startSec": 0.3,
          "endSec": 2.4,
          "phonemes": []
        }
      ]
    }
  ]
}`;
}
