/**
 * CinemaToon 2.5D Showcase Productions (4 Ready-to-Play Multi-Beat Examples)
 */

import { CHARACTER_PRESETS } from '../schemas/character.schema';
import { ProductionScript } from '../schemas/production.schema';

function clonePreset(id: string, fallbackIdx = 0) {
  const found = CHARACTER_PRESETS.find((c) => c.id === id) ?? CHARACTER_PRESETS[fallbackIdx];
  return structuredClone(found);
}

/**
 * Demo 2 (Canonical Bomb Defusal Test Fixture): 8.0s 2-scene thriller in laboratory
 */
export const SAMPLE_PRODUCTION_SCRIPT: ProductionScript = {
  schemaVersion: '1.0.0',
  id: 'prod_bomb_defusal_001',
  title: 'The Blue Wire Dilemma',
  renderStyle: '2.5d_parallax',
  cameraMode: 'standard',
  aspectRatio: '16:9',
  fps: 30,
  characters: [
    clonePreset('char_police_officer', 0),
    clonePreset('char_lab_scientist', 1),
  ],
  scenes: [
    {
      id: 'scene_1_tension',
      title: '01. Countdown Tension',
      durationSec: 4.5,
      background: 'laboratory',
      transitionIn: 'fade',
      transitionDurationSec: 0.4,
      cameraKeyframes: [
        { timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 },
        { timeSec: 3.0, zoom: 1.18, panX: 36, panY: -14, shake: 0 },
        { timeSec: 4.5, zoom: 1.24, panX: 44, panY: -18, shake: 0.14 },
      ],
      actors: [
        {
          id: 'actor_officer',
          characterId: 'char_police_officer',
          positionKeyframes: [
            { timeSec: 0, x: 0.32, y: 0.85, scale: 1.0, facing: 1 },
            { timeSec: 3.5, x: 0.35, y: 0.85, scale: 1.0, facing: 1 },
          ],
          actionTracks: [
            { startSec: 0, endSec: 2.5, basePose: 'crouch', type: 'tremble', intensity: 0.65 },
            { startSec: 2.5, endSec: 4.5, basePose: 'crouch', type: 'gasp', intensity: 1.0 },
          ],
          emotionKeyframes: [
            {
              timeSec: 0,
              emotion: { scared: 0.68, determined: 0.45 },
              faceOverrides: { brows: 'worried', mouth: 'nervous_smile' },
            },
            {
              timeSec: 4.0,
              emotion: { scared: 0.92, nervous: 0.72, surprised: 0.45 },
              faceOverrides: { brows: 'worried', eyes: 'wide' },
            },
          ],
        },
        {
          id: 'actor_scientist',
          characterId: 'char_lab_scientist',
          positionKeyframes: [{ timeSec: 0, x: 0.74, y: 0.83, scale: 0.98, facing: -1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.2, basePose: 'stand', type: 'lean_in', intensity: 0.85 },
            { startSec: 2.2, endSec: 4.5, basePose: 'stand', type: 'point', intensity: 1.0 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { nervous: 0.6, confused: 0.4 } },
            { timeSec: 2.4, emotion: { determined: 0.85, scared: 0.45 } },
          ],
        },
      ],
      props: [
        {
          id: 'prop_bomb',
          type: 'bomb_device',
          position: { x: 0.52, y: 0.85 },
          scale: 1.15,
          state: { countdownSeconds: 12, armed: true, wiresCut: [] },
        },
      ],
      dialogue: [
        {
          id: 'line_1',
          actorId: 'actor_officer',
          speakerName: 'Officer Miller',
          emotionTone: 'nervous',
          text: 'Doctor, both wires look identical under this light!',
          startSec: 0.3,
          endSec: 2.4,
          phonemes: [
            { startSec: 0.3, endSec: 0.55, phoneme: 'B' },
            { startSec: 0.55, endSec: 0.8, phoneme: 'D' },
            { startSec: 0.8, endSec: 1.05, phoneme: 'A' },
            { startSec: 1.05, endSec: 1.35, phoneme: 'E' },
            { startSec: 1.35, endSec: 1.65, phoneme: 'C' },
            { startSec: 1.65, endSec: 1.95, phoneme: 'F' },
            { startSec: 1.95, endSec: 2.25, phoneme: 'B' },
            { startSec: 2.25, endSec: 2.4, phoneme: 'X' },
          ],
        },
        {
          id: 'line_2',
          actorId: 'actor_scientist',
          speakerName: 'Dr. Elena Vance',
          emotionTone: 'determined',
          text: 'Trust the schematic. Cut the blue wire right now!',
          startSec: 2.5,
          endSec: 4.4,
          phonemes: [
            { startSec: 2.5, endSec: 2.75, phoneme: 'B' },
            { startSec: 2.75, endSec: 3.0, phoneme: 'C' },
            { startSec: 3.0, endSec: 3.25, phoneme: 'A' },
            { startSec: 3.25, endSec: 3.55, phoneme: 'D' },
            { startSec: 3.55, endSec: 3.85, phoneme: 'F' },
            { startSec: 3.85, endSec: 4.2, phoneme: 'E' },
            { startSec: 4.2, endSec: 4.4, phoneme: 'X' },
          ],
        },
      ],
    },
    {
      id: 'scene_2_relief',
      title: '02. Wire Cut & Relief',
      durationSec: 3.5,
      background: 'laboratory',
      transitionIn: 'fade',
      transitionDurationSec: 0.35,
      cameraKeyframes: [
        { timeSec: 0, zoom: 1.15, panX: 0, panY: 0, shake: 0 },
        { timeSec: 2.0, zoom: 1.0, panX: 0, panY: 0, shake: 0 },
      ],
      actors: [
        {
          id: 'actor_officer',
          characterId: 'char_police_officer',
          positionKeyframes: [{ timeSec: 0, x: 0.35, y: 0.85, scale: 1.0, facing: 1 }],
          actionTracks: [
            { startSec: 0, endSec: 1.2, basePose: 'stand', type: 'shrug', intensity: 0.8 },
            { startSec: 1.2, endSec: 3.5, basePose: 'stand', type: 'celebrate', intensity: 1.0 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { surprised: 0.5, nervous: 0.3 } },
            { timeSec: 1.2, emotion: { happy: 0.92, excited: 0.78, confident: 0.6 } },
          ],
        },
        {
          id: 'actor_scientist',
          characterId: 'char_lab_scientist',
          positionKeyframes: [{ timeSec: 0, x: 0.72, y: 0.83, scale: 0.98, facing: -1 }],
          actionTracks: [{ startSec: 0, endSec: 3.5, basePose: 'stand', type: 'clap', intensity: 0.9 }],
          emotionKeyframes: [{ timeSec: 0, emotion: { happy: 0.88, excited: 0.68 } }],
        },
      ],
      props: [
        {
          id: 'prop_bomb',
          type: 'bomb_device',
          position: { x: 0.52, y: 0.85 },
          scale: 1.15,
          state: { countdownSeconds: 7, armed: false, wiresCut: [1] },
        },
      ],
      dialogue: [
        {
          id: 'line_3',
          actorId: 'actor_officer',
          speakerName: 'Officer Miller',
          emotionTone: 'happy',
          text: 'Timer stopped! Never making me guess colors again.',
          startSec: 0.4,
          endSec: 3.2,
          phonemes: [
            { startSec: 0.4, endSec: 0.7, phoneme: 'B' },
            { startSec: 0.7, endSec: 1.05, phoneme: 'D' },
            { startSec: 1.05, endSec: 1.4, phoneme: 'A' },
            { startSec: 1.4, endSec: 1.8, phoneme: 'E' },
            { startSec: 1.8, endSec: 2.2, phoneme: 'C' },
            { startSec: 2.2, endSec: 2.6, phoneme: 'H' },
            { startSec: 2.6, endSec: 3.0, phoneme: 'B' },
            { startSec: 3.0, endSec: 3.2, phoneme: 'X' },
          ],
        },
      ],
    },
  ],
};

/**
 * Demo 1: Late-Night Podcast Debate (Podcast Multi-Cam, Reaction Cutaways & Split-Screen)
 */
export const PODCAST_DEBATE_DEMO: ProductionScript = {
  schemaVersion: '1.0.0',
  id: 'prod_podcast_debate_001',
  title: 'Late-Night Podcast: The Leak',
  renderStyle: '2.5d_parallax',
  cameraMode: 'podcast',
  aspectRatio: '16:9',
  fps: 30,
  characters: [
    clonePreset('char_host_marcus', 4),
    clonePreset('char_professor_sterling', 7),
  ],
  scenes: [
    {
      id: 'pod_scene_1',
      title: '01. Live Studio Debate',
      durationSec: 11.0,
      background: 'podcast_studio',
      cameraMode: 'podcast',
      transitionIn: 'fade',
      transitionDurationSec: 0.35,
      cameraKeyframes: [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0, shotMode: 'wide' }],
      actors: [
        {
          id: 'actor_marcus',
          characterId: 'char_host_marcus',
          positionKeyframes: [{ timeSec: 0, x: 0.28, y: 0.85, scale: 1.0, facing: 1 }],
          actionTracks: [
            { startSec: 0, endSec: 3.2, basePose: 'sit', type: 'lean_in', intensity: 0.9 },
            { startSec: 3.2, endSec: 6.2, basePose: 'sit', type: 'think_chin', intensity: 0.85 },
            { startSec: 6.2, endSec: 8.6, basePose: 'sit', type: 'desk_slam', intensity: 1.0 },
            { startSec: 8.6, endSec: 11.0, basePose: 'sit', type: 'laugh', intensity: 0.9 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { curious: 0.7, confident: 0.5 } },
            { timeSec: 3.4, emotion: { suspicious: 0.75, confused: 0.4 } },
            { timeSec: 6.3, emotion: { surprised: 0.92, excited: 0.85 } },
            { timeSec: 8.8, emotion: { happy: 0.92, excited: 0.7 } },
          ],
        },
        {
          id: 'actor_sterling',
          characterId: 'char_professor_sterling',
          positionKeyframes: [{ timeSec: 0, x: 0.72, y: 0.85, scale: 1.0, facing: -1 }],
          actionTracks: [
            { startSec: 0, endSec: 3.0, basePose: 'sit', type: 'nod_agree', intensity: 0.85 },
            { startSec: 3.0, endSec: 6.4, basePose: 'sit', type: 'point', intensity: 0.9 },
            { startSec: 6.4, endSec: 8.8, basePose: 'sit', type: 'gasp', intensity: 0.95 },
            { startSec: 8.8, endSec: 11.0, basePose: 'sit', type: 'shrug', intensity: 0.8 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { smug: 0.55, confident: 0.7 } },
            { timeSec: 3.1, emotion: { confident: 0.88, determined: 0.65 } },
            { timeSec: 6.5, emotion: { angry: 0.82, surprised: 0.65 } },
            { timeSec: 8.9, emotion: { happy: 0.88, smug: 0.5 } },
          ],
        },
      ],
      props: [],
      dialogue: [
        {
          id: 'pod_d1',
          actorId: 'actor_marcus',
          speakerName: 'Marcus Cole',
          emotionTone: 'curious',
          text: 'Professor, you actually saw the classified blueprint last night?',
          startSec: 0.4,
          endSec: 3.0,
          phonemes: [],
        },
        {
          id: 'pod_d2',
          actorId: 'actor_sterling',
          speakerName: 'Prof. Sterling',
          emotionTone: 'confident',
          text: 'Every page, Marcus—and the prototype ran backwards.',
          startSec: 3.3,
          endSec: 6.0,
          phonemes: [],
        },
        {
          id: 'pod_d3',
          actorId: 'actor_marcus',
          speakerName: 'Marcus Cole',
          emotionTone: 'excited',
          text: 'Wait—they built a time engine in a basement?!',
          startSec: 6.3,
          endSec: 8.5,
          phonemes: [],
        },
        {
          id: 'pod_d4',
          actorId: 'actor_sterling',
          speakerName: 'Prof. Sterling',
          emotionTone: 'happy',
          text: 'And they forgot to unplug the coffee machine first!',
          startSec: 8.8,
          endSec: 10.7,
          phonemes: [],
        },
      ],
    },
  ],
};

/**
 * Demo 3: Rainy Street to Cozy Cafe (Multi-Location Walk + Interior Cut)
 */
export const STREET_TO_CAFE_DEMO: ProductionScript = {
  schemaVersion: '1.0.0',
  id: 'prod_street_to_cafe_001',
  title: 'Dusk Walk to Espresso',
  renderStyle: '2.5d_parallax',
  cameraMode: 'cinematic',
  aspectRatio: '16:9',
  fps: 30,
  characters: [
    clonePreset('char_street_skater', 2),
    clonePreset('char_producer_chloe', 5),
    clonePreset('char_cafe_barista', 6),
  ],
  scenes: [
    {
      id: 'stc_scene_1',
      title: '01. Dusk Neighborhood Walk',
      durationSec: 5.5,
      background: 'neighborhood_street',
      cameraMode: 'cinematic',
      transitionIn: 'fade',
      transitionDurationSec: 0.4,
      cameraKeyframes: [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 }],
      actors: [
        {
          id: 'actor_kai',
          characterId: 'char_street_skater',
          positionKeyframes: [
            { timeSec: 0, x: 0.2, y: 0.84, scale: 1.0, facing: 1 },
            { timeSec: 3.2, x: 0.38, y: 0.84, scale: 1.0, facing: 1 },
          ],
          actionTracks: [
            { startSec: 0, endSec: 3.2, basePose: 'stand', type: 'walk', intensity: 0.95 },
            { startSec: 3.2, endSec: 5.5, basePose: 'stand', type: 'shrug', intensity: 0.9 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { bored: 0.55, curious: 0.2 } },
            { timeSec: 3.1, emotion: { surprised: 0.72, happy: 0.45 } },
          ],
        },
        {
          id: 'actor_chloe',
          characterId: 'char_producer_chloe',
          positionKeyframes: [
            { timeSec: 0, x: 0.54, y: 0.84, scale: 0.98, facing: -1 },
            { timeSec: 3.2, x: 0.66, y: 0.84, scale: 0.98, facing: -1 },
          ],
          actionTracks: [
            { startSec: 0, endSec: 3.2, basePose: 'stand', type: 'walk', intensity: 0.95 },
            { startSec: 3.2, endSec: 5.5, basePose: 'stand', type: 'point', intensity: 0.95 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { curious: 0.65 } },
            { timeSec: 3.3, emotion: { excited: 0.82, happy: 0.75 } },
          ],
        },
      ],
      props: [{ id: 'lamp_s1', type: 'street_lamp', position: { x: 0.86, y: 0.76 }, scale: 1.0 }],
      dialogue: [
        {
          id: 'stc_d1',
          actorId: 'actor_kai',
          speakerName: 'Kai Vega',
          emotionTone: 'curious',
          text: 'Tell me that little corner cafe is still open.',
          startSec: 0.4,
          endSec: 2.8,
          phonemes: [],
        },
        {
          id: 'stc_d2',
          actorId: 'actor_chloe',
          speakerName: 'Chloe Park',
          emotionTone: 'excited',
          text: 'Lights are on! Race you to the espresso counter!',
          startSec: 3.1,
          endSec: 5.2,
          phonemes: [],
        },
      ],
    },
    {
      id: 'stc_scene_2',
      title: '02. Warm Cafe Counter',
      durationSec: 5.0,
      background: 'cafe_diner',
      cameraMode: 'cinematic',
      transitionIn: 'fade',
      transitionDurationSec: 0.4,
      cameraKeyframes: [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 }],
      actors: [
        {
          id: 'actor_chloe',
          characterId: 'char_producer_chloe',
          positionKeyframes: [{ timeSec: 0, x: 0.28, y: 0.84, scale: 1.0, facing: 1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.6, basePose: 'stand', type: 'wave', intensity: 0.9 },
            { startSec: 2.6, endSec: 5.0, basePose: 'stand', type: 'laugh', intensity: 0.95 },
          ],
          emotionKeyframes: [{ timeSec: 0, emotion: { happy: 0.92, excited: 0.78 } }],
        },
        {
          id: 'actor_maya',
          characterId: 'char_cafe_barista',
          positionKeyframes: [{ timeSec: 0, x: 0.7, y: 0.82, scale: 1.0, facing: -1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.4, basePose: 'stand', type: 'hold_prop', intensity: 0.9 },
            { startSec: 2.4, endSec: 5.0, basePose: 'stand', type: 'nod_agree', intensity: 0.95 },
          ],
          emotionKeyframes: [{ timeSec: 0, emotion: { happy: 0.95, smug: 0.35 } }],
        },
      ],
      props: [],
      dialogue: [
        {
          id: 'stc_d3',
          actorId: 'actor_maya',
          speakerName: 'Maya Brooks',
          emotionTone: 'happy',
          text: 'Two caramel lattes coming up—just beat the rain!',
          startSec: 0.4,
          endSec: 2.8,
          phonemes: [],
        },
        {
          id: 'stc_d4',
          actorId: 'actor_chloe',
          speakerName: 'Chloe Park',
          emotionTone: 'happy',
          text: 'You are an absolute lifesaver, Maya!',
          startSec: 3.0,
          endSec: 4.8,
          phonemes: [],
        },
      ],
    },
  ],
};

/**
 * Demo 4: Precinct to Moonlit Rooftop (Noir Case Briefing + Rooftop Standoff)
 */
export const PRECINCT_TO_ROOFTOP_DEMO: ProductionScript = {
  schemaVersion: '1.0.0',
  id: 'prod_precinct_rooftop_001',
  title: 'Night Watch: Rooftop Clue',
  renderStyle: '2.5d_parallax',
  cameraMode: 'cinematic',
  aspectRatio: '16:9',
  fps: 30,
  characters: [
    clonePreset('char_detective_noir', 3),
    clonePreset('char_police_officer', 0),
  ],
  scenes: [
    {
      id: 'ptr_scene_1',
      title: '01. Evidence Board Briefing',
      durationSec: 5.0,
      background: 'police_precinct',
      cameraMode: 'cinematic',
      transitionIn: 'fade',
      transitionDurationSec: 0.35,
      cameraKeyframes: [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 }],
      actors: [
        {
          id: 'actor_harlan',
          characterId: 'char_detective_noir',
          positionKeyframes: [{ timeSec: 0, x: 0.32, y: 0.84, scale: 1.0, facing: 1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.5, basePose: 'stand', type: 'think_chin', intensity: 0.9 },
            { startSec: 2.5, endSec: 5.0, basePose: 'stand', type: 'point', intensity: 1.0 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { suspicious: 0.85, determined: 0.6 } },
          ],
        },
        {
          id: 'actor_miller',
          characterId: 'char_police_officer',
          positionKeyframes: [{ timeSec: 0, x: 0.7, y: 0.84, scale: 1.0, facing: -1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.6, basePose: 'stand', type: 'nod_agree', intensity: 0.85 },
            { startSec: 2.6, endSec: 5.0, basePose: 'stand', type: 'lean_in', intensity: 0.9 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { determined: 0.78, curious: 0.45 } },
            { timeSec: 2.7, emotion: { surprised: 0.72, determined: 0.7 } },
          ],
        },
      ],
      props: [],
      dialogue: [
        {
          id: 'ptr_d1',
          actorId: 'actor_harlan',
          speakerName: 'Inspector Harlan',
          emotionTone: 'suspicious',
          text: 'Every signal ping leads straight to the north tower roof.',
          startSec: 0.4,
          endSec: 2.7,
          phonemes: [],
        },
        {
          id: 'ptr_d2',
          actorId: 'actor_miller',
          speakerName: 'Officer Miller',
          emotionTone: 'determined',
          text: 'Grab the flashlights—we move before midnight.',
          startSec: 2.9,
          endSec: 4.8,
          phonemes: [],
        },
      ],
    },
    {
      id: 'ptr_scene_2',
      title: '02. Moonlit Rooftop Discovery',
      durationSec: 5.0,
      background: 'rooftop_night',
      cameraMode: 'cinematic',
      transitionIn: 'fade',
      transitionDurationSec: 0.45,
      cameraKeyframes: [{ timeSec: 0, zoom: 1.0, panX: 0, panY: 0, shake: 0 }],
      actors: [
        {
          id: 'actor_harlan',
          characterId: 'char_detective_noir',
          positionKeyframes: [{ timeSec: 0, x: 0.34, y: 0.84, scale: 1.0, facing: 1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.6, basePose: 'stand', type: 'look_around', intensity: 0.9 },
            { startSec: 2.6, endSec: 5.0, basePose: 'stand', type: 'gasp', intensity: 0.95 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { determined: 0.75 } },
            { timeSec: 2.6, emotion: { surprised: 0.9, angry: 0.45 } },
          ],
        },
        {
          id: 'actor_miller',
          characterId: 'char_police_officer',
          positionKeyframes: [{ timeSec: 0, x: 0.72, y: 0.84, scale: 1.0, facing: -1 }],
          actionTracks: [
            { startSec: 0, endSec: 2.6, basePose: 'stand', type: 'hold_prop', intensity: 0.95 },
            { startSec: 2.6, endSec: 5.0, basePose: 'stand', type: 'point', intensity: 1.0 },
          ],
          emotionKeyframes: [
            { timeSec: 0, emotion: { nervous: 0.6 } },
            { timeSec: 2.6, emotion: { determined: 0.92, angry: 0.6 } },
          ],
        },
      ],
      props: [{ id: 'crate_r1', type: 'wooden_crate', position: { x: 0.86, y: 0.82 }, scale: 1.0 }],
      dialogue: [
        {
          id: 'ptr_d3',
          actorId: 'actor_miller',
          speakerName: 'Officer Miller',
          emotionTone: 'determined',
          text: 'Wait—someone left the relay transmitter powered on!',
          startSec: 0.5,
          endSec: 2.7,
          phonemes: [],
        },
        {
          id: 'ptr_d4',
          actorId: 'actor_harlan',
          speakerName: 'Inspector Harlan',
          emotionTone: 'angry',
          text: 'They are still inside the building. Lock the exits!',
          startSec: 2.9,
          endSec: 4.8,
          phonemes: [],
        },
      ],
    },
  ],
};

export const PRODUCTION_DEMOS: Array<{
  id: string;
  label: string;
  tagline: string;
  script: ProductionScript;
}> = [
  {
    id: PODCAST_DEBATE_DEMO.id,
    label: 'Podcast Debate',
    tagline: 'Multi-cam closeups, lean-ins & split-screen reactions',
    script: PODCAST_DEBATE_DEMO,
  },
  {
    id: SAMPLE_PRODUCTION_SCRIPT.id,
    label: 'Blue Wire Lab',
    tagline: '2-scene thriller with countdown prop & emotional shifts',
    script: SAMPLE_PRODUCTION_SCRIPT,
  },
  {
    id: STREET_TO_CAFE_DEMO.id,
    label: 'Street to Cafe',
    tagline: 'Grounded walk cycle transitioning into warm cafe interior',
    script: STREET_TO_CAFE_DEMO,
  },
  {
    id: PRECINCT_TO_ROOFTOP_DEMO.id,
    label: 'Noir Rooftop',
    tagline: 'Evidence briefing cutting to moonlit rooftop mystery',
    script: PRECINCT_TO_ROOFTOP_DEMO,
  },
];
