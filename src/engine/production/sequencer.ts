/**
 * Deterministic Multi-Scene Production Sequencer & Auto-Director (CinemaToon v2.0)
 * Evaluates any frame in a ProductionScript with cinematic/podcast shot selection,
 * rule-of-thirds face framing, reaction cutaways, split-screen peaks, and strict bounds clamping.
 */

import {
  ActionType,
  BasePoseType,
  CHARACTER_PRESETS,
  CharacterDefinition,
  EmotionKey,
  EmotionWeights,
  FaceRegionOverrides,
  PhonemeCode,
  ScenePropSpec,
} from '../../schemas/character.schema';
import {
  ActorEmotionKeyframe,
  ActorPositionKeyframe,
  CameraKeyframe,
  CameraShotMode,
  DialogueLineSpec,
  ProductionScene,
  ProductionScript,
} from '../../schemas/production.schema';
import { evaluateAnimationFrame, EvaluatedFrame } from '../animation/evaluator';
import { clamp, cubicBezier, lerp } from '../animation/math';
import { computeBodyMetrics } from '../character/bodyGeometry';
import { blendRigPoses, computeSkeletonWorld } from '../character/skeleton';

export interface EvaluatedActorState {
  id: string;
  character: CharacterDefinition;
  x: number;
  y: number;
  scale: number;
  facing: 1 | -1;
  isSitting: boolean;
  isSpeaking: boolean;
  evaluated: EvaluatedFrame;
}

export interface EvaluatedCaptionState {
  speakerName: string;
  text: string;
  words: Array<{ word: string; active: boolean; spoken: boolean }>;
}

export interface EvaluatedProductionFrame {
  globalFrame: number;
  globalTimeSec: number;
  totalDurationSec: number;
  totalFrames: number;
  sceneIndex: number;
  scene: ProductionScene;
  sceneTimeSec: number;
  sceneFrame: number;
  fadeOverlayOpacity: number;
  shotMode: CameraShotMode;
  activeSpeakerId: string | null;
  camera: {
    zoom: number;
    panX: number;
    panY: number;
    shake: number;
    tiltDeg: number;
  };
  actors: EvaluatedActorState[];
  props: ScenePropSpec[];
  activeCaption: EvaluatedCaptionState | null;
}

export function getProductionDurationSec(script: ProductionScript): number {
  return script.scenes.reduce((acc, s) => acc + Math.max(0.1, s.durationSec), 0);
}

function interpolateCamera(
  keyframes: CameraKeyframe[],
  t: number,
  durationSec: number
): CameraKeyframe {
  if (!keyframes.length) {
    const u = Math.min(1, t / Math.max(1, durationSec));
    return {
      timeSec: t,
      zoom: lerp(1.0, 1.06, u),
      panX: Math.sin(u * Math.PI) * 10,
      panY: 0,
      shake: 0,
      shotMode: 'wide',
      tiltDeg: 0,
    };
  }
  const sorted = [...keyframes].sort((a, b) => a.timeSec - b.timeSec);
  if (sorted.length === 1) {
    const base = sorted[0];
    const u = Math.min(1, t / Math.max(1, durationSec));
    return {
      timeSec: t,
      zoom: Math.max(1.0, base.zoom) + u * 0.06,
      panX: base.panX + Math.sin(u * Math.PI) * 12,
      panY: base.panY,
      shake: base.shake,
      shotMode: base.shotMode ?? 'wide',
      tiltDeg: base.tiltDeg ?? 0,
    };
  }
  if (t <= sorted[0].timeSec) return sorted[0];
  if (t >= sorted[sorted.length - 1].timeSec) return sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t >= a.timeSec && t <= b.timeSec) {
      const span = Math.max(1e-5, b.timeSec - a.timeSec);
      const u = cubicBezier(0.25, 0.1, 0.25, 1.0, (t - a.timeSec) / span);
      return {
        timeSec: t,
        zoom: lerp(a.zoom, b.zoom, u),
        panX: lerp(a.panX, b.panX, u),
        panY: lerp(a.panY, b.panY, u),
        shake: lerp(a.shake, b.shake, u),
        shotMode: u < 0.5 ? a.shotMode : b.shotMode,
        tiltDeg: lerp(a.tiltDeg ?? 0, b.tiltDeg ?? 0, u),
      };
    }
  }
  return sorted[sorted.length - 1];
}

function interpolatePosition(
  keyframes: ActorPositionKeyframe[],
  t: number
): { x: number; y: number; scale: number; facing: 1 | -1 } {
  if (!keyframes.length) {
    return { x: 0.5, y: 0.84, scale: 1.0, facing: 1 };
  }
  const sorted = [...keyframes].sort((a, b) => a.timeSec - b.timeSec);
  if (t <= sorted[0].timeSec) {
    return {
      x: sorted[0].x,
      y: sorted[0].y,
      scale: sorted[0].scale ?? 1,
      facing: sorted[0].facing ?? 1,
    };
  }
  const last = sorted[sorted.length - 1];
  if (t >= last.timeSec) {
    return {
      x: last.x,
      y: last.y,
      scale: last.scale ?? 1,
      facing: last.facing ?? 1,
    };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t >= a.timeSec && t <= b.timeSec) {
      const span = Math.max(1e-5, b.timeSec - a.timeSec);
      const u = cubicBezier(0.35, 0, 0.25, 1, (t - a.timeSec) / span);
      return {
        x: lerp(a.x, b.x, u),
        y: lerp(a.y, b.y, u),
        scale: lerp(a.scale ?? 1, b.scale ?? 1, u),
        facing: a.facing ?? b.facing ?? 1,
      };
    }
  }
  return { x: last.x, y: last.y, scale: last.scale ?? 1, facing: last.facing ?? 1 };
}

function interpolateEmotions(
  keyframes: ActorEmotionKeyframe[],
  t: number
): { emotion: EmotionWeights; faceOverrides?: FaceRegionOverrides } {
  if (!keyframes.length) return { emotion: {} };
  const sorted = [...keyframes].sort((a, b) => a.timeSec - b.timeSec);
  if (t <= sorted[0].timeSec) {
    return { emotion: sorted[0].emotion, faceOverrides: sorted[0].faceOverrides };
  }
  const last = sorted[sorted.length - 1];
  if (t >= last.timeSec) {
    return { emotion: last.emotion, faceOverrides: last.faceOverrides };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (t >= a.timeSec && t <= b.timeSec) {
      const span = Math.max(1e-5, b.timeSec - a.timeSec);
      const u = cubicBezier(0.3, 0, 0.3, 1, (t - a.timeSec) / span);
      const keys = new Set<EmotionKey>([
        ...(Object.keys(a.emotion) as EmotionKey[]),
        ...(Object.keys(b.emotion) as EmotionKey[]),
      ]);
      const blended: EmotionWeights = {};
      for (const k of keys) {
        const v = lerp(a.emotion[k] ?? 0, b.emotion[k] ?? 0, u);
        if (v > 0.005) blended[k] = v;
      }
      return {
        emotion: blended,
        faceOverrides: u < 0.5 ? a.faceOverrides : b.faceOverrides,
      };
    }
  }
  return { emotion: last.emotion, faceOverrides: last.faceOverrides };
}

interface ActionTrackChoice {
  basePose: BasePoseType;
  type: ActionType;
  intensity: number;
  speed: number;
  prev?: {
    basePose: BasePoseType;
    type: ActionType;
    intensity: number;
    speed: number;
  };
  blendAlpha: number;
}

const ACTION_BLEND_SEC = 0.38;

function resolveActiveAction(
  tracks: ProductionScene['actors'][number]['actionTracks'],
  t: number
): ActionTrackChoice {
  const sorted = [...tracks].sort((a, b) => a.startSec - b.startSec);
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    if (t >= item.startSec && t < item.endSec) {
      const prevItem = i > 0 ? sorted[i - 1] : undefined;
      const elapsed = t - item.startSec;
      const blendAlpha =
        prevItem && elapsed < ACTION_BLEND_SEC
          ? cubicBezier(0.25, 0.1, 0.25, 1, elapsed / ACTION_BLEND_SEC)
          : 1.0;

      return {
        basePose: item.basePose,
        type: item.type,
        intensity: item.intensity ?? 1.0,
        speed: item.speed ?? 1.0,
        prev:
          prevItem && blendAlpha < 0.999
            ? {
                basePose: prevItem.basePose,
                type: prevItem.type,
                intensity: prevItem.intensity ?? 1.0,
                speed: prevItem.speed ?? 1.0,
              }
            : undefined,
        blendAlpha,
      };
    }
  }
  const last = sorted[sorted.length - 1];
  return last
    ? {
        basePose: last.basePose,
        type: last.type,
        intensity: last.intensity ?? 1.0,
        speed: last.speed ?? 1.0,
        blendAlpha: 1.0,
      }
    : { basePose: 'stand', type: 'idle', intensity: 1.0, speed: 1.0, blendAlpha: 1.0 };
}

function resolveDialogueLineAtTime(
  dialogue: DialogueLineSpec[],
  t: number
): DialogueLineSpec | null {
  for (const line of dialogue) {
    if (t >= line.startSec && t <= line.endSec) {
      return line;
    }
  }
  return null;
}

function resolveDialogueForActor(
  dialogue: DialogueLineSpec[],
  actorId: string,
  t: number
): PhonemeCode {
  for (const line of dialogue) {
    if (line.actorId !== actorId) continue;
    if (t >= line.startSec && t <= line.endSec) {
      const localT = t - line.startSec;
      for (const cue of line.phonemes) {
        if (t >= cue.startSec && t < cue.endSec) return cue.phoneme;
        if (localT >= cue.startSec && localT < cue.endSec) return cue.phoneme;
      }
      const syllableCycle = ['B', 'D', 'A', 'E', 'C', 'F'] as const;
      return syllableCycle[Math.floor(localT * 6.5) % syllableCycle.length];
    }
  }
  return 'X';
}

function resolveActiveCaption(
  dialogue: DialogueLineSpec[],
  t: number
): EvaluatedCaptionState | null {
  const line = resolveDialogueLineAtTime(dialogue, t);
  if (!line) return null;
  if (line.words && line.words.length > 0) {
    return {
      speakerName: line.speakerName,
      text: line.text,
      words: line.words.map((w) => ({
        word: w.word,
        active: t >= w.startSec && t <= w.endSec,
        spoken: t > w.endSec,
      })),
    };
  }
  const rawWords = line.text.trim().split(/\s+/).filter(Boolean);
  const span = Math.max(0.1, line.endSec - line.startSec);
  const wordDur = span / Math.max(1, rawWords.length);
  return {
    speakerName: line.speakerName,
    text: line.text,
    words: rawWords.map((w, idx) => {
      const ws = line.startSec + idx * wordDur;
      const we = ws + wordDur;
      return {
        word: w,
        active: t >= ws && t <= we,
        spoken: t > we,
      };
    }),
  };
}

const PEAK_EMOTION_TONES = new Set([
  'surprised',
  'scared',
  'angry',
  'excited',
  'panic',
  'shocked',
  'smug',
  'furious',
]);

/**
 * Computes exact SVG world-space center of an actor's head/face from their evaluated skeleton.
 */
export function getActorHeadWorldTarget(
  actor: Pick<EvaluatedActorState, 'character' | 'x' | 'y' | 'scale' | 'facing' | 'evaluated'>,
  stageW: number,
  stageH: number,
  isVertical: boolean
): { x: number; y: number } {
  const metrics = computeBodyMetrics(actor.character.body);
  const world = computeSkeletonWorld(metrics, actor.evaluated.pose);
  const headRad = (world.head.angleDeg * Math.PI) / 180;
  const faceLocalX = world.head.x - metrics.headCenterY * Math.sin(headRad);
  const faceLocalY = world.head.y + metrics.headCenterY * Math.cos(headRad);
  const actorMult = actor.scale * (isVertical ? 1.32 : 1.06);
  return {
    x: actor.x * stageW + faceLocalX * actorMult * actor.facing,
    y: actor.y * stageH + faceLocalY * actorMult,
  };
}

/**
 * Clamps camera zoom & pan strictly inside stage dimensions [0, stageW] x [0, stageH]
 * so out-of-bounds black background edges never appear in rendered frames.
 */
export function clampCameraToStage(
  zoom: number,
  panX: number,
  panY: number,
  stageW: number,
  stageH: number
): { zoom: number; panX: number; panY: number } {
  const safeZoom = Math.max(1.0, Math.min(2.1, zoom));
  const maxPanX = Math.max(0, (stageW / 2) * (1 - 1 / safeZoom));
  const maxPanY = Math.max(0, (stageH / 2) * (1 - 1 / safeZoom));
  return {
    zoom: safeZoom,
    panX: clamp(panX, -maxPanX, maxPanX),
    panY: clamp(panY, -maxPanY, maxPanY),
  };
}

function frameActorInViewport(
  actor: EvaluatedActorState,
  stageW: number,
  stageH: number,
  isVertical: boolean,
  zoom: number,
  targetScreenXRatio: number,
  targetScreenYRatio = 0.42
): { zoom: number; panX: number; panY: number } {
  const face = getActorHeadWorldTarget(actor, stageW, stageH, isVertical);
  const targetScreenX = stageW * targetScreenXRatio;
  const targetScreenY = stageH * targetScreenYRatio;
  const rawPanX = stageW / 2 - face.x + (targetScreenX - stageW / 2) / zoom;
  const rawPanY = stageH / 2 - face.y + (targetScreenY - stageH / 2) / zoom;
  return clampCameraToStage(zoom, rawPanX, rawPanY, stageW, stageH);
}

function frameMidpointTwoShot(
  actors: EvaluatedActorState[],
  stageW: number,
  stageH: number,
  isVertical: boolean,
  zoom = 1.16
): { zoom: number; panX: number; panY: number } {
  const sorted = [...actors].sort((a, b) => a.x - b.x);
  const fL = getActorHeadWorldTarget(sorted[0], stageW, stageH, isVertical);
  const fR = getActorHeadWorldTarget(sorted[sorted.length - 1], stageW, stageH, isVertical);
  const midX = (fL.x + fR.x) / 2;
  const midY = (fL.y + fR.y) / 2;
  const rawPanX = stageW / 2 - midX;
  const rawPanY = stageH / 2 - midY + (stageH * 0.42 - stageH / 2) / zoom;
  return clampCameraToStage(zoom, rawPanX, rawPanY, stageW, stageH);
}

function actorReactionScore(actor: EvaluatedActorState): number {
  const f = actor.evaluated.face;
  return Math.max(f.shockLines, f.angerVein, f.sweatDrop, f.confusedMarks, f.sparkleLevel);
}

function isPeakReactionMoment(
  actors: EvaluatedActorState[],
  activeLine: DialogueLineSpec | null
): boolean {
  if (activeLine?.emotionTone && PEAK_EMOTION_TONES.has(activeLine.emotionTone.toLowerCase())) {
    return true;
  }
  for (const act of actors) {
    const f = act.evaluated.face;
    if (f.shockLines >= 0.45 || f.angerVein >= 0.45 || f.sweatDrop >= 0.72) {
      return true;
    }
  }
  return false;
}

export function evaluateProductionFrame(
  script: ProductionScript,
  globalFrame: number,
  overrideCharacterMap?: Map<string, CharacterDefinition>
): EvaluatedProductionFrame {
  const fps = Math.max(1, script.fps || 30);
  const isVertical = script.aspectRatio === '9:16';
  const stageW = isVertical ? 720 : 1280;
  const stageH = isVertical ? 1280 : 720;

  const totalDurationSec = getProductionDurationSec(script);
  const totalFrames = Math.max(1, Math.round(totalDurationSec * fps));
  const clampedFrame = clamp(Math.floor(globalFrame), 0, totalFrames - 1);
  const globalTimeSec = clampedFrame / fps;

  let accSec = 0;
  let sceneIndex = 0;
  let scene = script.scenes[0];
  let sceneTimeSec = globalTimeSec;

  for (let i = 0; i < script.scenes.length; i++) {
    const s = script.scenes[i];
    const endSec = accSec + s.durationSec;
    if (globalTimeSec < endSec || i === script.scenes.length - 1) {
      sceneIndex = i;
      scene = s;
      sceneTimeSec = clamp(globalTimeSec - accSec, 0, s.durationSec);
      break;
    }
    accSec = endSec;
  }

  const sceneFrame = Math.round(sceneTimeSec * fps);

  let fadeOverlayOpacity = 0;
  if (scene.transitionIn === 'fade') {
    const fadeDur = scene.transitionDurationSec ?? 0.45;
    if (sceneTimeSec < fadeDur) {
      fadeOverlayOpacity = clamp(1 - sceneTimeSec / Math.max(0.01, fadeDur), 0, 1);
    }
  }

  const baseCamera = interpolateCamera(scene.cameraKeyframes, sceneTimeSec, scene.durationSec);
  const activeLine = resolveDialogueLineAtTime(scene.dialogue, sceneTimeSec);
  const activeSpeakerId = activeLine?.actorId ?? null;

  const charLookup = new Map<string, CharacterDefinition>();
  for (const c of CHARACTER_PRESETS) charLookup.set(c.id, c);
  for (const c of script.characters) charLookup.set(c.id, c);
  if (overrideCharacterMap) {
    for (const [k, v] of overrideCharacterMap.entries()) charLookup.set(k, v);
  }

  const actors: EvaluatedActorState[] = scene.actors.map((actorTrack, idx) => {
    const fallbackPool = script.characters.length > 0 ? script.characters : CHARACTER_PRESETS;
    const baseCharacter =
      charLookup.get(actorTrack.characterId) ??
      fallbackPool[idx % fallbackPool.length] ??
      CHARACTER_PRESETS[idx % CHARACTER_PRESETS.length];
    const character: CharacterDefinition =
      baseCharacter.characterType || !script.characterType
        ? baseCharacter
        : { ...baseCharacter, characterType: script.characterType };

    const pos = interpolatePosition(actorTrack.positionKeyframes, sceneTimeSec);
    const expr = interpolateEmotions(actorTrack.emotionKeyframes, sceneTimeSec);
    const act = resolveActiveAction(actorTrack.actionTracks, sceneTimeSec);
    const phoneme = resolveDialogueForActor(scene.dialogue, actorTrack.id, sceneTimeSec);
    const isSpeaking = activeSpeakerId === actorTrack.id || phoneme !== 'X';

    const animFrameIdx = sceneFrame + idx * 5;
    const exprInput = {
      emotion: expr.emotion,
      faceOverrides: expr.faceOverrides,
      phoneme,
    };

    let evaluated = evaluateAnimationFrame(
      animFrameIdx,
      fps,
      {
        basePose: act.basePose,
        action: act.type,
        actionIntensity: act.intensity,
        speed: act.speed,
        enableBreathing: true,
        enableAutoBlink: true,
        enablePhysics: true,
      },
      exprInput
    );

    if (act.prev && act.blendAlpha < 0.999) {
      const prevEval = evaluateAnimationFrame(
        animFrameIdx,
        fps,
        {
          basePose: act.prev.basePose,
          action: act.prev.type,
          actionIntensity: act.prev.intensity,
          speed: act.prev.speed,
          enableBreathing: true,
          enableAutoBlink: true,
          enablePhysics: true,
        },
        exprInput
      );
      evaluated = {
        ...evaluated,
        pose: blendRigPoses(prevEval.pose, evaluated.pose, act.blendAlpha),
      };
    }

    return {
      id: actorTrack.id,
      character,
      x: pos.x,
      y: pos.y,
      scale: pos.scale,
      facing: pos.facing,
      isSitting: act.basePose === 'sit',
      isSpeaking,
      evaluated,
    };
  });

  // Resolve CinemaToon Auto-Director camera framing
  const resolvedMode = scene.cameraMode ?? script.cameraMode ?? (scene.background === 'podcast_studio' ? 'podcast' : 'standard');
  const isPodcastMode = resolvedMode === 'podcast';
  const isCinematicMode = resolvedMode === 'cinematic';

  let shotMode: CameraShotMode = baseCamera.shotMode ?? 'wide';
  let camZoom = Math.max(1.0, baseCamera.zoom);
  let camPanX = baseCamera.panX;
  let camPanY = baseCamera.panY;
  // Level broadcast horizon by default unless custom non-podcast/non-cinematic explicit tilt
  let camTiltDeg = isPodcastMode || isCinematicMode ? 0 : baseCamera.tiltDeg ?? 0;

  const hasExplicitShot = Boolean(baseCamera.shotMode && baseCamera.shotMode !== 'wide');
  const peakMoment = actors.length >= 2 && isPeakReactionMoment(actors, activeLine);

  if (shotMode === 'split_screen' && actors.length >= 2) {
    camZoom = 1.0;
    camPanX = 0;
    camPanY = 0;
    camTiltDeg = 0;
  } else if (shotMode === 'medium_two_shot' && actors.length >= 2) {
    const framed = frameMidpointTwoShot(actors, stageW, stageH, isVertical, clamp(camZoom, 1.12, 1.32));
    camZoom = framed.zoom;
    camPanX = framed.panX;
    camPanY = framed.panY;
    camTiltDeg = 0;
  } else if ((shotMode === 'over_shoulder_left' || shotMode === 'over_shoulder_right') && actors.length >= 2) {
    const sortedByX = [...actors].sort((a, b) => a.x - b.x);
    const targetActor = shotMode === 'over_shoulder_left' ? sortedByX[sortedByX.length - 1] : sortedByX[0];
    const leadRatio = shotMode === 'over_shoulder_left' ? 0.58 : 0.42;
    const otsZoom = clamp(camZoom < 1.24 ? 1.38 : camZoom, 1.24, 1.56);
    const framed = frameActorInViewport(targetActor, stageW, stageH, isVertical, otsZoom, leadRatio, 0.43);
    camZoom = framed.zoom;
    camPanX = framed.panX;
    camPanY = framed.panY;
    camTiltDeg = 0;
  } else if (shotMode === 'reaction_cut' && actors.length >= 2) {
    const listener =
      actors.find((a) => a.id !== activeSpeakerId) ??
      [...actors].sort((a, b) => actorReactionScore(b) - actorReactionScore(a))[0];
    const isLeft = listener.x < 0.5;
    const rxZoom = clamp(camZoom < 1.35 ? 1.56 : camZoom, 1.35, 1.85);
    const framed = frameActorInViewport(listener, stageW, stageH, isVertical, rxZoom, isLeft ? 0.41 : 0.59, 0.42);
    camZoom = framed.zoom;
    camPanX = framed.panX;
    camPanY = framed.panY;
    camTiltDeg = 0;
  } else if ((isPodcastMode || isCinematicMode) && actors.length >= 2 && !hasExplicitShot) {
    if (sceneTimeSec < 0.32) {
      shotMode = 'wide';
      camZoom = lerp(1.0, 1.04, sceneTimeSec / 0.32);
      camPanX = 0;
      camPanY = 0;
      camTiltDeg = 0;
    } else if (peakMoment) {
      shotMode = 'split_screen';
      camZoom = 1.0;
      camPanX = 0;
      camPanY = 0;
      camTiltDeg = 0;
    } else if (activeSpeakerId && activeLine) {
      const speakerIdx = actors.findIndex((a) => a.id === activeSpeakerId);
      const speaker = speakerIdx >= 0 ? actors[speakerIdx] : null;
      const listener = actors.find((a) => a.id !== activeSpeakerId) ?? null;

      if (speaker) {
        const lineSpan = Math.max(0.2, activeLine.endSec - activeLine.startSec);
        const u = clamp((sceneTimeSec - activeLine.startSec) / lineSpan, 0, 1);

        // Reaction cutaway when listener reacts strongly during last 28% of a longer line
        const listenerReacting = Boolean(listener && lineSpan >= 2.2 && u >= 0.72 && actorReactionScore(listener) >= 0.48);
        const target = listenerReacting && listener ? listener : speaker;
        const targetIdx = actors.findIndex((a) => a.id === target.id);
        const isLeftActor = target.x < 0.5 || targetIdx === 0;

        if (listenerReacting) {
          shotMode = 'reaction_cut';
        } else if (isCinematicMode && u < 0.45 && lineSpan >= 2.0) {
          shotMode = isLeftActor ? 'over_shoulder_right' : 'over_shoulder_left';
        } else {
          shotMode = isLeftActor ? 'angle_left' : 'angle_right';
        }

        const pushEase = cubicBezier(0.25, 0.1, 0.25, 1, clamp((sceneTimeSec - activeLine.startSec) / 0.28, 0, 1));
        const baseEndZoom =
          shotMode === 'over_shoulder_left' || shotMode === 'over_shoulder_right'
            ? (isVertical ? 1.3 : 1.38)
            : (isVertical ? 1.44 : 1.56);
        const endZoom = baseEndZoom + u * 0.05;
        const targetZoom = lerp(Math.max(1.16, endZoom - 0.12), endZoom, pushEase);
        const framed = frameActorInViewport(
          target,
          stageW,
          stageH,
          isVertical,
          targetZoom,
          isLeftActor ? 0.41 : 0.59,
          0.42
        );
        camZoom = framed.zoom;
        camPanX = framed.panX;
        camPanY = framed.panY;
        camTiltDeg = 0;
      }
    } else {
      shotMode = 'medium_two_shot';
      const framed = frameMidpointTwoShot(actors, stageW, stageH, isVertical, 1.14);
      camZoom = framed.zoom;
      camPanX = framed.panX;
      camPanY = framed.panY;
      camTiltDeg = 0;
    }
  } else if (
    (shotMode === 'closeup_speaker' ||
      shotMode === 'closeup_left' ||
      shotMode === 'closeup_right' ||
      shotMode === 'angle_left' ||
      shotMode === 'angle_right') &&
    actors.length > 0
  ) {
    const sortedByX = [...actors].sort((a, b) => a.x - b.x);
    const targetActor =
      shotMode === 'closeup_left' || shotMode === 'angle_left'
        ? sortedByX[0]
        : shotMode === 'closeup_right' || shotMode === 'angle_right'
        ? sortedByX[sortedByX.length - 1]
        : actors.find((a) => a.id === activeSpeakerId) ?? actors[0];

    const safeCloseupZoom = clamp(camZoom < 1.32 ? 1.56 : camZoom, 1.32, 1.9);
    const hasManualPan = Math.abs(baseCamera.panX) >= 1 || Math.abs(baseCamera.panY) >= 1;
    if (!hasManualPan) {
      const leadRatio =
        shotMode === 'angle_left' || shotMode === 'closeup_left'
          ? 0.41
          : shotMode === 'angle_right' || shotMode === 'closeup_right'
          ? 0.59
          : targetActor.facing === 1
          ? 0.44
          : 0.56;
      const framed = frameActorInViewport(targetActor, stageW, stageH, isVertical, safeCloseupZoom, leadRatio, 0.42);
      camZoom = framed.zoom;
      camPanX = framed.panX;
      camPanY = framed.panY;
    } else {
      camZoom = safeCloseupZoom;
    }
    camTiltDeg = 0;
  }

  // Final hard viewport bounds clamp so zero black out-of-bounds margins ever appear
  const clampedCam = clampCameraToStage(camZoom, camPanX, camPanY, stageW, stageH);
  camZoom = clampedCam.zoom;
  camPanX = clampedCam.panX;
  camPanY = clampedCam.panY;

  const activeCaption = resolveActiveCaption(scene.dialogue, sceneTimeSec);

  return {
    globalFrame: clampedFrame,
    globalTimeSec,
    totalDurationSec,
    totalFrames,
    sceneIndex,
    scene,
    sceneTimeSec,
    sceneFrame,
    fadeOverlayOpacity,
    shotMode,
    activeSpeakerId,
    camera: {
      zoom: camZoom,
      panX: camPanX,
      panY: camPanY,
      shake: baseCamera.shake,
      tiltDeg: camTiltDeg,
    },
    actors,
    props: scene.props,
    activeCaption,
  };
}
