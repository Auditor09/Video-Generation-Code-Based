/**
 * SpriteForge Multi-Scene Production Script Schema (v1.0.0)
 * Drives automated Remotion video rendering, timed actions, smooth emotion transitions,
 * camera keyframes, audio tracks, Rhubarb phoneme cues, and word-level captions.
 */

import {
  ActionType,
  BasePoseType,
  CharacterDefinition,
  CharacterType,
  EmotionWeights,
  FaceRegionOverrides,
  PhonemeCode,
  RenderStyle,
  SceneDefinition,
  ScenePropSpec,
} from './character.schema';

export interface DialogueCue {
  startSec: number;
  endSec: number;
  phoneme: PhonemeCode;
}

export interface DialogueWordTiming {
  word: string;
  startSec: number;
  endSec: number;
}

export interface DialogueLineSpec {
  id: string;
  actorId: string;
  speakerName: string;
  text: string;
  voice?: string;
  emotionTone?: string;
  startSec: number;
  endSec: number;
  audioFile?: string;
  phonemes: DialogueCue[];
  words?: DialogueWordTiming[];
}

export interface ActorActionTrackItem {
  startSec: number;
  endSec: number;
  basePose: BasePoseType;
  type: ActionType;
  intensity?: number;
  speed?: number;
}

export interface ActorEmotionKeyframe {
  timeSec: number;
  emotion: EmotionWeights;
  faceOverrides?: FaceRegionOverrides;
}

export interface ActorPositionKeyframe {
  timeSec: number;
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  scale?: number;
  facing?: 1 | -1;
}

export type CameraMode = 'standard' | 'podcast' | 'cinematic';

export type CameraShotMode =
  | 'wide'
  | 'medium_two_shot'
  | 'over_shoulder_left'
  | 'over_shoulder_right'
  | 'closeup_speaker'
  | 'closeup_left'
  | 'closeup_right'
  | 'reaction_cut'
  | 'angle_left'
  | 'angle_right'
  | 'split_screen';

export interface CameraKeyframe {
  timeSec: number;
  zoom: number;
  panX: number;
  panY: number;
  shake: number;
  shotMode?: CameraShotMode;
  tiltDeg?: number;
}

export interface ProductionActorTrack {
  id: string;
  characterId: string;
  actionTracks: ActorActionTrackItem[];
  emotionKeyframes: ActorEmotionKeyframe[];
  positionKeyframes: ActorPositionKeyframe[];
}

export interface ProductionScene {
  id: string;
  title: string;
  durationSec: number;
  background: SceneDefinition['background'];
  renderStyle?: RenderStyle;
  cameraMode?: CameraMode;
  transitionIn?: 'cut' | 'fade';
  transitionDurationSec?: number;
  cameraKeyframes: CameraKeyframe[];
  actors: ProductionActorTrack[];
  props: ScenePropSpec[];
  dialogue: DialogueLineSpec[];
}

export interface ProductionScript {
  schemaVersion: '1.0.0';
  id: string;
  title: string;
  renderStyle?: RenderStyle;
  characterType?: CharacterType;
  cameraMode?: CameraMode;
  aspectRatio: '16:9' | '9:16';
  fps: number;
  characters: CharacterDefinition[];
  scenes: ProductionScene[];
  musicTrack?: {
    file: string;
    volume: number;
  };
}
