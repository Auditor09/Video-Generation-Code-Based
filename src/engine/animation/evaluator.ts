/**
 * Layered Deterministic Animation & Physics Evaluator (CinemaToon v2.0)
 * Uses Pose-to-Pose Spline Keyframes (Anticipation -> Impulse -> Overshoot/Settle -> Hold)
 * and evaluates frame-exact RigPose + SolvedFaceParameters for any frame N at any FPS.
 */

import {
  ActionType,
  AnimationConfig,
  BasePoseType,
  ExpressionInput,
  PhonemeCode,
} from '../../schemas/character.schema';
import { clampRigPose, DEFAULT_RIG_POSE, RigPose } from '../character/skeleton';
import { solveExpression, SolvedFaceParameters } from '../expression/expressionSolver';
import {
  clamp,
  cubicBezier,
  deterministicNoise,
  evaluateDeterministicBlink,
  lerp,
} from './math';

export interface EvaluatedFrame {
  frame: number;
  timeSeconds: number;
  pose: RigPose;
  face: SolvedFaceParameters;
  activeChannels: {
    basePose: BasePoseType;
    action: ActionType;
    breathing: boolean;
    autoBlink: boolean;
    physics: boolean;
    emotionModifierActive: boolean;
  };
}

export interface DialogueCue {
  startSec: number;
  endSec: number;
  phoneme: PhonemeCode;
}

export const SAMPLE_DIALOGUE_TIMELINE: DialogueCue[] = [
  { startSec: 0.2, endSec: 0.45, phoneme: 'B' },
  { startSec: 0.45, endSec: 0.72, phoneme: 'D' },
  { startSec: 0.72, endSec: 0.9, phoneme: 'A' },
  { startSec: 0.9, endSec: 1.18, phoneme: 'E' },
  { startSec: 1.18, endSec: 1.4, phoneme: 'C' },
  { startSec: 1.4, endSec: 1.62, phoneme: 'F' },
  { startSec: 1.62, endSec: 1.9, phoneme: 'D' },
  { startSec: 1.9, endSec: 2.15, phoneme: 'G' },
  { startSec: 2.15, endSec: 2.45, phoneme: 'H' },
  { startSec: 2.45, endSec: 2.75, phoneme: 'X' },
];

export function evaluateDialoguePhoneme(
  t: number,
  cues: DialogueCue[] = SAMPLE_DIALOGUE_TIMELINE
): PhonemeCode {
  for (const cue of cues) {
    if (t >= cue.startSec && t < cue.endSec) return cue.phoneme;
  }
  return 'X';
}

const DEG2RAD = Math.PI / 180;

type EaseKind = 'linear' | 'easeInOut' | 'easeOutQuart' | 'easeOutBack';

type NumericRigKeys = {
  [K in keyof RigPose]: RigPose[K] extends number ? K : never;
}[keyof RigPose];

interface PoseKeyframe {
  u: number;
  pose: Partial<Record<NumericRigKeys, number>>;
  handPoseL?: RigPose['handPoseL'];
  handPoseR?: RigPose['handPoseR'];
  ease?: EaseKind;
}

function easeInOut(u: number): number {
  const x = clamp(u, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function easeOutQuart(u: number): number {
  const x = clamp(u, 0, 1);
  return 1 - Math.pow(1 - x, 4);
}

function easeOutBack(u: number, s = 1.4): number {
  const x = clamp(u, 0, 1) - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
}

function applyEase(u: number, kind: EaseKind = 'easeInOut'): number {
  switch (kind) {
    case 'linear':
      return clamp(u, 0, 1);
    case 'easeOutQuart':
      return easeOutQuart(u);
    case 'easeOutBack':
      return easeOutBack(u, 1.35);
    case 'easeInOut':
    default:
      return easeInOut(u);
  }
}

/**
 * Evaluates a pose-to-pose spline clip at normalized progress u in [0, 1].
 * Channels omitted from keyframes hold their base pose value cleanly without jitter.
 */
function evaluatePoseClip(
  basePose: RigPose,
  keyframes: PoseKeyframe[],
  uRaw: number,
  intensity: number
): RigPose {
  const u = clamp(uRaw, 0, 1);
  if (keyframes.length === 0) return { ...basePose };

  const sorted = [...keyframes].sort((a, b) => a.u - b.u);
  let k0 = sorted[0];
  let k1 = sorted[sorted.length - 1];
  let segT = 1;

  if (u <= sorted[0].u) {
    k0 = sorted[0];
    k1 = sorted[0];
    segT = 0;
  } else if (u >= sorted[sorted.length - 1].u) {
    k0 = sorted[sorted.length - 1];
    k1 = sorted[sorted.length - 1];
    segT = 1;
  } else {
    for (let i = 0; i < sorted.length - 1; i++) {
      if (u >= sorted[i].u && u <= sorted[i + 1].u) {
        k0 = sorted[i];
        k1 = sorted[i + 1];
        const span = Math.max(1e-5, k1.u - k0.u);
        segT = applyEase((u - k0.u) / span, k1.ease ?? 'easeInOut');
        break;
      }
    }
  }

  const out: RigPose = { ...basePose };
  const keys = new Set<NumericRigKeys>([
    ...(Object.keys(k0.pose) as NumericRigKeys[]),
    ...(Object.keys(k1.pose) as NumericRigKeys[]),
  ]);

  for (const key of keys) {
    const baseVal = basePose[key];
    const v0 = k0.pose[key] !== undefined ? baseVal + (k0.pose[key]! - baseVal) * intensity : baseVal;
    const v1 = k1.pose[key] !== undefined ? baseVal + (k1.pose[key]! - baseVal) * intensity : baseVal;
    out[key] = lerp(v0, v1, segT);
  }

  if (k1.handPoseL && segT >= 0.35) out.handPoseL = k1.handPoseL;
  else if (k0.handPoseL) out.handPoseL = k0.handPoseL;

  if (k1.handPoseR && segT >= 0.35) out.handPoseR = k1.handPoseR;
  else if (k0.handPoseR) out.handPoseR = k0.handPoseR;

  return clampRigPose(out);
}

/**
 * Computes pelvis Y drop so the lowest stance foot stays cleanly planted on ground (y=0)
 * instead of floating or sinking through the floor during strides.
 */
function computeGroundedPelvisDrop(pose: RigPose): number {
  const thighNorm = 62;
  const shinNorm = 60;
  const restLen = thighNorm + shinNorm;
  const reachL =
    thighNorm * Math.cos(pose.thighLRot * DEG2RAD) +
    shinNorm * Math.cos((pose.thighLRot + pose.shinLRot) * DEG2RAD);
  const reachR =
    thighNorm * Math.cos(pose.thighRRot * DEG2RAD) +
    shinNorm * Math.cos((pose.thighRRot + pose.shinRRot) * DEG2RAD);
  return Math.max(0, restLen - Math.max(reachL, reachR));
}

function smoothWave(theta: number): number {
  const s = Math.sin(theta);
  return s + 0.08 * Math.sin(theta * 3);
}

function applyBasePose(pose: RigPose, basePose: BasePoseType): void {
  if (basePose === 'crouch') {
    pose.pelvisYOffset += 36;
    pose.torsoRot += 16;
    pose.neckRot -= 4;
    pose.headRot -= 12;
    pose.thighLRot = -54;
    pose.shinLRot = 92;
    pose.footLRot = -38;
    pose.thighRRot = -46;
    pose.shinRRot = 86;
    pose.footRRot = -40;
    pose.upperArmLRot = 12;
    pose.forearmLRot = -48;
    pose.handLRot = 8;
    pose.upperArmRRot = -22;
    pose.forearmRRot = -52;
    pose.handRRot = -8;
  } else if (basePose === 'sit') {
    pose.pelvisYOffset += 46;
    pose.torsoRot -= 2;
    pose.neckRot += 2;
    pose.thighLRot = -86;
    pose.shinLRot = 86;
    pose.footLRot = 0;
    pose.thighRRot = -82;
    pose.shinRRot = 84;
    pose.footRRot = -2;
    pose.upperArmLRot = -12;
    pose.forearmLRot = -54;
    pose.handLRot = -6;
    pose.upperArmRRot = -18;
    pose.forearmRRot = -50;
    pose.handRRot = 6;
  }
}

function cycleProgress(w: number, cycleDurationSec: number): number {
  const m = (w / cycleDurationSec) % 1;
  return m < 0 ? m + 1 : m;
}

function evaluateCoreMotionAtTime(
  t: number,
  anim: AnimationConfig,
  faceSolved: SolvedFaceParameters,
  isSpeaking = false
): RigPose {
  const base: RigPose = { ...DEFAULT_RIG_POSE };
  applyBasePose(base, anim.basePose);

  const intensity = clamp(anim.actionIntensity, 0, 1.5);
  const w = t * anim.speed;
  let pose: RigPose = { ...base };

  switch (anim.action) {
    case 'walk': {
      // Anatomical 4-phase stride: Contact -> Down -> Passing -> High-Point
      const cyc = w * 4.8;
      const isCrouch = anim.basePose === 'crouch';
      const crouchOffset = isCrouch ? -24 : 0;
      const crouchKnee = isCrouch ? 38 : 0;
      const strideAmp = (isCrouch ? 24 : 31) * intensity;

      const sL = smoothWave(cyc);
      const cL = Math.cos(cyc);
      const sR = -sL;
      const cR = -cL;

      pose.thighLRot = sL * strideAmp + crouchOffset;
      pose.thighRRot = sR * strideAmp + crouchOffset;

      const swingKneeL = Math.pow(Math.max(0, -Math.cos(cyc - 0.25)), 0.78) * 52 * intensity;
      const impactCushionL = Math.max(0, cL - 0.45) * 16 * intensity;
      pose.shinLRot = 5 + swingKneeL + impactCushionL + crouchKnee;

      const swingKneeR = Math.pow(Math.max(0, -Math.cos(cyc + Math.PI - 0.25)), 0.78) * 52 * intensity;
      const impactCushionR = Math.max(0, cR - 0.45) * 16 * intensity;
      pose.shinRRot = 5 + swingKneeR + impactCushionR + crouchKnee;

      const flatCompL = -(pose.thighLRot + pose.shinLRot);
      const flatCompR = -(pose.thighRRot + pose.shinRRot);
      const toeLiftL = Math.max(0, -Math.sin(cyc - 0.2)) * -11 * intensity;
      const pushOffL = Math.max(0, Math.sin(cyc + 0.2)) * 12 * intensity;
      const toeLiftR = Math.max(0, -Math.sin(cyc + Math.PI - 0.2)) * -11 * intensity;
      const pushOffR = Math.max(0, Math.sin(cyc + Math.PI + 0.2)) * 12 * intensity;
      pose.footLRot = flatCompL * 0.92 + toeLiftL + pushOffL;
      pose.footRRot = flatCompR * 0.92 + toeLiftR + pushOffR;

      if (isCrouch) {
        pose.pelvisYOffset = 22 + Math.abs(cL) * -5 * intensity;
      } else {
        pose.pelvisYOffset = computeGroundedPelvisDrop(pose) - Math.abs(cL) * 3.8 * intensity;
      }

      pose.pelvisRot = sL * 2.8 * intensity;
      pose.torsoRot = (isCrouch ? 18 : 5.5) * intensity + Math.sin(cyc * 2 - 0.35) * 1.5 * intensity;
      pose.neckRot = -Math.sin(cyc * 2 - 0.7) * 1.2 * intensity;
      pose.headRot = (isCrouch ? -12 : -3.8) * intensity + Math.cos(cyc * 2 - 0.4) * 1.2;

      const armAmp = 28 * intensity;
      pose.upperArmLRot = -Math.sin(cyc) * armAmp + 4;
      pose.forearmLRot = -18 - Math.max(0, Math.sin(cyc - 0.55)) * 22 * intensity - Math.sin(cyc - 0.55) * 5 * intensity;
      pose.handLRot = -Math.sin(cyc - 1.05) * 13 * intensity;

      pose.upperArmRRot = -Math.sin(cyc + Math.PI) * armAmp - 4;
      pose.forearmRRot = -18 - Math.max(0, Math.sin(cyc + Math.PI - 0.55)) * 22 * intensity - Math.sin(cyc + Math.PI - 0.55) * 5 * intensity;
      pose.handRRot = -Math.sin(cyc + Math.PI - 1.05) * 13 * intensity;
      break;
    }

    case 'run':
    case 'sprint': {
      const mult = anim.action === 'sprint' ? 1.28 : 1.0;
      const cyc = w * 8.4 * mult;
      const s = smoothWave(cyc);

      pose.torsoRot += 16 * mult * intensity + Math.sin(cyc * 2 - 0.3) * 2.6;
      pose.neckRot += -Math.sin(cyc * 2 - 0.7) * 1.8;
      pose.headRot += -11 * mult * intensity;

      pose.thighLRot = s * 52 * intensity - 10;
      pose.shinLRot = 10 + Math.pow(Math.max(0, -Math.cos(cyc - 0.22)), 0.75) * 78 * intensity;
      pose.footLRot = -(pose.thighLRot + pose.shinLRot) * 0.65 + Math.sin(cyc - 0.25) * 11;

      pose.thighRRot = -s * 52 * intensity - 10;
      pose.shinRRot = 10 + Math.pow(Math.max(0, Math.cos(cyc - 0.22)), 0.75) * 78 * intensity;
      pose.footRRot = -(pose.thighRRot + pose.shinRRot) * 0.65 - Math.sin(cyc - 0.25) * 11;

      pose.pelvisYOffset = computeGroundedPelvisDrop(pose) * 0.72 - Math.abs(s) * 13 * intensity;

      pose.upperArmLRot = -Math.sin(cyc) * 50 * intensity - 8;
      pose.forearmLRot = -70 - Math.max(0, Math.sin(cyc - 0.45)) * 24 * intensity;
      pose.handLRot = -Math.sin(cyc - 0.85) * 12 * intensity;
      pose.upperArmRRot = Math.sin(cyc) * 50 * intensity - 12;
      pose.forearmRRot = -70 - Math.max(0, -Math.sin(cyc - 0.45)) * 24 * intensity;
      pose.handRRot = Math.sin(cyc - 0.85) * 12 * intensity;
      pose.handPoseL = 'fist';
      pose.handPoseR = 'fist';
      break;
    }

    case 'jump': {
      const phase = cycleProgress(w, 1.15);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { pelvisYOffset: 0, torsoRot: 0 } },
          {
            u: 0.22,
            ease: 'easeInOut',
            pose: {
              pelvisYOffset: base.pelvisYOffset + 26,
              torsoRot: 14,
              torsoScaleY: 0.92,
              torsoScaleX: 1.06,
              thighLRot: -38,
              shinLRot: 68,
              footLRot: -30,
              thighRRot: -38,
              shinRRot: 68,
              footRRot: -30,
              upperArmLRot: 28,
              forearmLRot: -24,
              upperArmRRot: 20,
              forearmRRot: -28,
            },
          },
          {
            u: 0.48,
            ease: 'easeOutQuart',
            pose: {
              pelvisYOffset: base.pelvisYOffset - 72,
              torsoRot: -4,
              torsoScaleY: 1.07,
              torsoScaleX: 0.95,
              thighLRot: -24,
              shinLRot: 46,
              footLRot: 18,
              thighRRot: 12,
              shinRRot: 32,
              footRRot: 14,
              upperArmLRot: 148,
              forearmLRot: -16,
              upperArmRRot: -148,
              forearmRRot: -16,
            },
          },
          {
            u: 0.78,
            ease: 'easeInOut',
            pose: {
              pelvisYOffset: base.pelvisYOffset + 16,
              torsoRot: 10,
              torsoScaleY: 0.94,
              torsoScaleX: 1.05,
              thighLRot: -24,
              shinLRot: 44,
              footLRot: -20,
              thighRRot: -24,
              shinRRot: 44,
              footRRot: -20,
              upperArmLRot: 14,
              forearmLRot: -26,
              upperArmRRot: -18,
              forearmRRot: -26,
            },
          },
          { u: 1.0, ease: 'easeOutBack', pose: { pelvisYOffset: base.pelvisYOffset, torsoRot: 0 } },
        ],
        phase,
        intensity
      );
      break;
    }

    case 'wave': {
      // Anticipation dip -> crisp raise -> two friendly hand sweeps -> gentle settle
      const u = cycleProgress(w, 1.5);
      pose = evaluatePoseClip(
        base,
        [
          {
            u: 0.0,
            pose: { torsoRot: -2, upperArmRRot: -18, forearmRRot: -26, handRRot: 0, headRot: 0 },
            handPoseR: 'open',
          },
          {
            u: 0.16,
            ease: 'easeInOut',
            pose: { torsoRot: -4, upperArmRRot: -124, forearmRRot: -44, handRRot: -12, headRot: 4 },
            handPoseR: 'open',
          },
          {
            u: 0.36,
            ease: 'easeOutBack',
            pose: { torsoRot: -3, upperArmRRot: -138, forearmRRot: -16, handRRot: 18, headRot: 6 },
            handPoseR: 'open',
          },
          {
            u: 0.56,
            ease: 'easeInOut',
            pose: { torsoRot: -5, upperArmRRot: -130, forearmRRot: -52, handRRot: -18, headRot: 2 },
            handPoseR: 'open',
          },
          {
            u: 0.76,
            ease: 'easeOutBack',
            pose: { torsoRot: -3, upperArmRRot: -138, forearmRRot: -18, handRRot: 16, headRot: 6 },
            handPoseR: 'open',
          },
          {
            u: 1.0,
            ease: 'easeInOut',
            pose: { torsoRot: -2, upperArmRRot: -18, forearmRRot: -26, handRRot: 0, headRot: 0 },
            handPoseR: 'open',
          },
        ],
        u,
        intensity
      );
      break;
    }

    case 'point': {
      const u = cycleProgress(w, 1.6);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: -2, upperArmRRot: -24, forearmRRot: -62, handRRot: -8 }, handPoseR: 'point' },
          { u: 0.18, ease: 'easeInOut', pose: { torsoRot: -5, upperArmRRot: -34, forearmRRot: -88, handRRot: -10 }, handPoseR: 'point' },
          { u: 0.38, ease: 'easeOutBack', pose: { torsoRot: 7, upperArmRRot: -88, forearmRRot: -6, handRRot: 4, headRot: -3 }, handPoseR: 'point' },
          { u: 0.76, ease: 'easeInOut', pose: { torsoRot: 6, upperArmRRot: -85, forearmRRot: -8, handRRot: 2, headRot: -2 }, handPoseR: 'point' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: -2, upperArmRRot: -24, forearmRRot: -62, handRRot: -8 }, handPoseR: 'point' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'shrug': {
      const u = cycleProgress(w, 1.6);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 0, upperArmLRot: -12, forearmLRot: -48, upperArmRRot: -18, forearmRRot: -46, headOffsetY: 0, headRot: 0 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.18, ease: 'easeInOut', pose: { torsoRot: -2, upperArmLRot: -8, forearmLRot: -36, upperArmRRot: -14, forearmRRot: -36, headOffsetY: -1 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.42, ease: 'easeOutBack', pose: { torsoRot: 2, upperArmLRot: -34, forearmLRot: -96, handLRot: -20, upperArmRRot: -44, forearmRRot: -92, handRRot: 20, headOffsetY: 3.5, headRot: 8 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.78, ease: 'easeInOut', pose: { torsoRot: 2, upperArmLRot: -32, forearmLRot: -92, handLRot: -16, upperArmRRot: -42, forearmRRot: -88, handRRot: 16, headOffsetY: 3.0, headRot: 7 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 0, upperArmLRot: -12, forearmLRot: -48, upperArmRRot: -18, forearmRRot: -46, headOffsetY: 0, headRot: 0 }, handPoseL: 'open', handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'clap': {
      const u = cycleProgress(w, 0.56);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 1, upperArmLRot: -52, forearmLRot: -76, handLRot: -8, upperArmRRot: -42, forearmRRot: -84, handRRot: 8 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.42, ease: 'easeOutQuart', pose: { torsoRot: -1, upperArmLRot: -36, forearmLRot: -56, handLRot: 4, upperArmRRot: -26, forearmRRot: -62, handRRot: -4 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.65, ease: 'easeOutBack', pose: { torsoRot: 2, upperArmLRot: -55, forearmLRot: -78, handLRot: -10, upperArmRRot: -45, forearmRRot: -86, handRRot: 10 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 1, upperArmLRot: -52, forearmLRot: -76, handLRot: -8, upperArmRRot: -42, forearmRRot: -84, handRRot: 8 }, handPoseL: 'open', handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'punch': {
      const u = cycleProgress(w, 0.78);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: -6, upperArmRRot: 16, forearmRRot: -94, upperArmLRot: -18, forearmLRot: -98 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 0.24, ease: 'easeInOut', pose: { torsoRot: -16, upperArmRRot: 32, forearmRRot: -108, handRRot: -8, upperArmLRot: -28, forearmLRot: -94 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 0.42, ease: 'easeOutBack', pose: { torsoRot: 18, upperArmRRot: -92, forearmRRot: -4, handRRot: 8, upperArmLRot: -14, forearmLRot: -102 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 0.64, ease: 'easeInOut', pose: { torsoRot: 12, upperArmRRot: -78, forearmRRot: -14, handRRot: 4, upperArmLRot: -16, forearmLRot: -100 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: -6, upperArmRRot: 16, forearmRRot: -94, upperArmLRot: -18, forearmLRot: -98 }, handPoseL: 'fist', handPoseR: 'fist' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'kick': {
      const u = cycleProgress(w, 0.92);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 4, thighRRot: -8, shinRRot: 14, upperArmLRot: 10, forearmLRot: -36, upperArmRRot: -14, forearmRRot: -42 } },
          { u: 0.22, ease: 'easeInOut', pose: { torsoRot: -6, thighRRot: -34, shinRRot: 92, upperArmLRot: 16, forearmLRot: -44, upperArmRRot: -28, forearmRRot: -52 } },
          { u: 0.44, ease: 'easeOutBack', pose: { torsoRot: -16, thighRRot: -86, shinRRot: 4, footRRot: 12, upperArmLRot: 28, forearmLRot: -48, upperArmRRot: -48, forearmRRot: -54 } },
          { u: 0.7, ease: 'easeInOut', pose: { torsoRot: -10, thighRRot: -42, shinRRot: 76, upperArmLRot: 18, forearmLRot: -42, upperArmRRot: -30, forearmRRot: -48 } },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 4, thighRRot: -8, shinRRot: 14, upperArmLRot: 10, forearmLRot: -36, upperArmRRot: -14, forearmRRot: -42 } },
        ],
        u,
        intensity
      );
      break;
    }

    case 'dodge': {
      const u = cycleProgress(w, 1.15);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { pelvisX: 0, pelvisYOffset: base.pelvisYOffset, torsoRot: 0, headRot: 0, upperArmLRot: -22, forearmLRot: -68, upperArmRRot: -30, forearmRRot: -64 } },
          { u: 0.28, ease: 'easeOutQuart', pose: { pelvisX: -22, pelvisYOffset: base.pelvisYOffset + 14, torsoRot: -18, headRot: 12, upperArmLRot: -34, forearmLRot: -82, handLRot: -14, upperArmRRot: -40, forearmRRot: -78, handRRot: 14 } },
          { u: 0.65, ease: 'easeOutBack', pose: { pelvisX: 20, pelvisYOffset: base.pelvisYOffset + 12, torsoRot: 17, headRot: -11, upperArmLRot: -14, forearmLRot: -74, handLRot: 12, upperArmRRot: -22, forearmRRot: -72, handRRot: -12 } },
          { u: 1.0, ease: 'easeInOut', pose: { pelvisX: 0, pelvisYOffset: base.pelvisYOffset, torsoRot: 0, headRot: 0, upperArmLRot: -22, forearmLRot: -68, upperArmRRot: -30, forearmRRot: -64 } },
        ],
        u,
        intensity
      );
      break;
    }

    case 'laugh': {
      const u = cycleProgress(w, 0.9);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: -5, headRot: -8, pelvisYOffset: base.pelvisYOffset, upperArmLRot: -14, forearmLRot: -76, upperArmRRot: -24, forearmRRot: -72 } },
          { u: 0.25, ease: 'easeOutBack', pose: { torsoRot: -10, headRot: -16, pelvisYOffset: base.pelvisYOffset + 4, upperArmLRot: -18, forearmLRot: -84, handLRot: -10, upperArmRRot: -28, forearmRRot: -80, handRRot: 10 } },
          { u: 0.5, ease: 'easeInOut', pose: { torsoRot: -4, headRot: -6, pelvisYOffset: base.pelvisYOffset, upperArmLRot: -12, forearmLRot: -72, handLRot: 6, upperArmRRot: -20, forearmRRot: -68, handRRot: -6 } },
          { u: 0.75, ease: 'easeOutBack', pose: { torsoRot: -10, headRot: -15, pelvisYOffset: base.pelvisYOffset + 4, upperArmLRot: -18, forearmLRot: -82, handLRot: -10, upperArmRRot: -28, forearmRRot: -78, handRRot: 10 } },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: -5, headRot: -8, pelvisYOffset: base.pelvisYOffset, upperArmLRot: -14, forearmLRot: -76, upperArmRRot: -24, forearmRRot: -72 } },
        ],
        u,
        intensity
      );
      break;
    }

    case 'cry': {
      const u = cycleProgress(w, 1.1);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 9, headRot: 13, upperArmLRot: -124, forearmLRot: -84, upperArmRRot: -132, forearmRRot: -80 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.35, ease: 'easeOutBack', pose: { torsoRot: 13, headRot: 18, pelvisYOffset: base.pelvisYOffset + 3, upperArmLRot: -128, forearmLRot: -90, handLRot: -6, upperArmRRot: -136, forearmRRot: -86, handRRot: 6 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.7, ease: 'easeInOut', pose: { torsoRot: 8, headRot: 12, pelvisYOffset: base.pelvisYOffset, upperArmLRot: -122, forearmLRot: -82, handLRot: 4, upperArmRRot: -130, forearmRRot: -78, handRRot: -4 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 9, headRot: 13, upperArmLRot: -124, forearmLRot: -84, upperArmRRot: -132, forearmRRot: -80 }, handPoseL: 'open', handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'panic': {
      const u = cycleProgress(w, 0.68);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: -6, pelvisYOffset: base.pelvisYOffset - 2, upperArmLRot: -94, forearmLRot: -48, handLRot: -14, upperArmRRot: -152, forearmRRot: -42, handRRot: 14 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.45, ease: 'easeOutBack', pose: { torsoRot: 6, pelvisYOffset: base.pelvisYOffset - 6, upperArmLRot: -142, forearmLRot: -58, handLRot: 16, upperArmRRot: -108, forearmRRot: -56, handRRot: -16 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: -6, pelvisYOffset: base.pelvisYOffset - 2, upperArmLRot: -94, forearmLRot: -48, handLRot: -14, upperArmRRot: -152, forearmRRot: -42, handRRot: 14 }, handPoseL: 'open', handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'tremble': {
      pose.bodyShakeX += deterministicNoise(11, w * 18) * 3.0 * intensity;
      pose.bodyShakeY += deterministicNoise(23, w * 21) * 1.8 * intensity;
      pose.torsoRot += 5 + Math.sin(w * 9) * 1.3;
      pose.upperArmLRot = -14;
      pose.forearmLRot = -78 + Math.sin(w * 14) * 3.5;
      pose.upperArmRRot = -24;
      pose.forearmRRot = -74 - Math.sin(w * 14) * 3.5;
      break;
    }

    case 'celebrate': {
      const u = cycleProgress(w, 0.96);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { pelvisYOffset: base.pelvisYOffset, torsoRot: -2, upperArmLRot: 142, forearmLRot: -24, handLRot: -10, upperArmRRot: -144, forearmRRot: -24, handRRot: 10 }, handPoseL: 'peace', handPoseR: 'peace' },
          { u: 0.25, ease: 'easeOutBack', pose: { pelvisYOffset: base.pelvisYOffset - 16, torsoRot: 3, upperArmLRot: 164, forearmLRot: -14, handLRot: 14, upperArmRRot: -162, forearmRRot: -14, handRRot: -14 }, handPoseL: 'peace', handPoseR: 'peace' },
          { u: 0.52, ease: 'easeInOut', pose: { pelvisYOffset: base.pelvisYOffset, torsoRot: -3, upperArmLRot: 146, forearmLRot: -26, handLRot: -12, upperArmRRot: -146, forearmRRot: -26, handRRot: 12 }, handPoseL: 'peace', handPoseR: 'peace' },
          { u: 0.78, ease: 'easeOutBack', pose: { pelvisYOffset: base.pelvisYOffset - 12, torsoRot: 2, upperArmLRot: 160, forearmLRot: -16, handLRot: 12, upperArmRRot: -160, forearmRRot: -16, handRRot: -12 }, handPoseL: 'peace', handPoseR: 'peace' },
          { u: 1.0, ease: 'easeInOut', pose: { pelvisYOffset: base.pelvisYOffset, torsoRot: -2, upperArmLRot: 142, forearmLRot: -24, handLRot: -10, upperArmRRot: -144, forearmRRot: -24, handRRot: 10 }, handPoseL: 'peace', handPoseR: 'peace' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'facepalm': {
      const u = cycleProgress(w, 2.1);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 2, headRot: 4, upperArmRRot: -48, forearmRRot: -44, upperArmLRot: 8, forearmLRot: -20 }, handPoseR: 'open' },
          { u: 0.24, ease: 'easeOutBack', pose: { torsoRot: 7, headRot: 14, upperArmRRot: -142, forearmRRot: -76, handRRot: 8, upperArmLRot: 10, forearmLRot: -22 }, handPoseR: 'open' },
          { u: 0.72, ease: 'easeInOut', pose: { torsoRot: 8, headRot: 16, upperArmRRot: -138, forearmRRot: -74, handRRot: 4, upperArmLRot: 8, forearmLRot: -20 }, handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 2, headRot: 4, upperArmRRot: -48, forearmRRot: -44, upperArmLRot: 8, forearmLRot: -20 }, handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'look_around': {
      const u = cycleProgress(w, 2.2);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { headRot: 0, neckRot: 0, torsoRot: 0, upperArmLRot: 8, forearmLRot: -20, upperArmRRot: -12, forearmRRot: -22 } },
          { u: 0.24, ease: 'easeOutBack', pose: { headRot: -14, neckRot: -4, torsoRot: -5, upperArmLRot: 4, forearmLRot: -26, handLRot: -6, upperArmRRot: -18, forearmRRot: -28, handRRot: 6 } },
          { u: 0.48, ease: 'easeInOut', pose: { headRot: -12, neckRot: -3, torsoRot: -4, upperArmLRot: 5, forearmLRot: -24, upperArmRRot: -16, forearmRRot: -26 } },
          { u: 0.72, ease: 'easeOutBack', pose: { headRot: 14, neckRot: 4, torsoRot: 5, upperArmLRot: 12, forearmLRot: -26, handLRot: 6, upperArmRRot: -6, forearmRRot: -28, handRRot: -6 } },
          { u: 1.0, ease: 'easeInOut', pose: { headRot: 0, neckRot: 0, torsoRot: 0, upperArmLRot: 8, forearmLRot: -20, upperArmRRot: -12, forearmRRot: -22 } },
        ],
        u,
        intensity
      );
      break;
    }

    case 'gasp': {
      const u = cycleProgress(w, 1.45);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 0, pelvisYOffset: base.pelvisYOffset, upperArmLRot: -14, forearmLRot: -24, upperArmRRot: -20, forearmRRot: -24 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.14, ease: 'easeInOut', pose: { torsoRot: 3, pelvisYOffset: base.pelvisYOffset + 4, upperArmLRot: -8, forearmLRot: -18, upperArmRRot: -14, forearmRRot: -18 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.34, ease: 'easeOutBack', pose: { torsoRot: -9, pelvisYOffset: base.pelvisYOffset - 4, headRot: -4, upperArmLRot: -62, forearmLRot: -94, handLRot: -16, upperArmRRot: -76, forearmRRot: -92, handRRot: 16 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.78, ease: 'easeInOut', pose: { torsoRot: -7, pelvisYOffset: base.pelvisYOffset - 2, headRot: -3, upperArmLRot: -58, forearmLRot: -90, handLRot: -12, upperArmRRot: -72, forearmRRot: -88, handRRot: 12 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 0, pelvisYOffset: base.pelvisYOffset, upperArmLRot: -14, forearmLRot: -24, upperArmRRot: -20, forearmRRot: -24 }, handPoseL: 'open', handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'hold_prop': {
      const sway = Math.sin(w * 1.4) * 2.2;
      pose.upperArmRRot = -46 + sway;
      pose.forearmRRot = -56 + Math.sin(w * 1.4 - 0.5) * 2.8;
      pose.handPoseR = 'grip';
      pose.upperArmLRot = 8 - sway * 0.6;
      pose.forearmLRot = -20;
      break;
    }

    case 'lean_in': {
      const u = cycleProgress(w, 2.2);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 2, headRot: -1, upperArmLRot: -12, forearmLRot: -52, upperArmRRot: -20, forearmRRot: -54 }, handPoseR: 'open' },
          { u: 0.25, ease: 'easeOutBack', pose: { torsoRot: 13, neckRot: -4, headRot: -9, upperArmLRot: -34, forearmLRot: -68, handLRot: -8, upperArmRRot: -48, forearmRRot: -62, handRRot: 10 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 0.82, ease: 'easeInOut', pose: { torsoRot: 11, neckRot: -3, headRot: -8, upperArmLRot: -30, forearmLRot: -64, upperArmRRot: -44, forearmRRot: -58 }, handPoseL: 'open', handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 2, headRot: -1, upperArmLRot: -12, forearmLRot: -52, upperArmRRot: -20, forearmRRot: -54 }, handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'think_chin': {
      const u = cycleProgress(w, 2.4);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: -2, headRot: -4, upperArmLRot: -16, forearmLRot: -84, upperArmRRot: -52, forearmRRot: -104 }, handPoseR: 'open' },
          { u: 0.35, ease: 'easeOutBack', pose: { torsoRot: -4, headRot: -9, upperArmLRot: -18, forearmLRot: -88, upperArmRRot: -58, forearmRRot: -112, handRRot: -8 }, handPoseR: 'open' },
          { u: 0.72, ease: 'easeInOut', pose: { torsoRot: -3, headRot: -6, upperArmLRot: -18, forearmLRot: -86, upperArmRRot: -56, forearmRRot: -110, handRRot: -4 }, handPoseR: 'open' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: -2, headRot: -4, upperArmLRot: -16, forearmLRot: -84, upperArmRRot: -52, forearmRRot: -104 }, handPoseR: 'open' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'nod_agree': {
      const u = cycleProgress(w, 1.3);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: 0, headRot: 0, neckRot: 0 } },
          { u: 0.16, ease: 'easeInOut', pose: { torsoRot: -2, headRot: -5, neckRot: -2 } },
          { u: 0.38, ease: 'easeOutBack', pose: { torsoRot: 4, headRot: 12, neckRot: 4 } },
          { u: 0.62, ease: 'easeInOut', pose: { torsoRot: 1, headRot: -2, neckRot: 0 } },
          { u: 0.82, ease: 'easeOutBack', pose: { torsoRot: 3, headRot: 10, neckRot: 3 } },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: 0, headRot: 0, neckRot: 0 } },
        ],
        u,
        intensity
      );
      break;
    }

    case 'desk_slam': {
      const u = cycleProgress(w, 1.4);
      pose = evaluatePoseClip(
        base,
        [
          { u: 0.0, pose: { torsoRot: -2, upperArmLRot: -16, forearmLRot: -64, upperArmRRot: -22, forearmRRot: -62 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 0.22, ease: 'easeInOut', pose: { torsoRot: -11, headRot: -5, upperArmLRot: -86, forearmLRot: -72, upperArmRRot: -94, forearmRRot: -68 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 0.36, ease: 'easeOutQuart', pose: { torsoRot: 18, headRot: 6, pelvisYOffset: base.pelvisYOffset + 4, upperArmLRot: -34, forearmLRot: -48, upperArmRRot: -42, forearmRRot: -44 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 0.5, ease: 'easeOutBack', pose: { torsoRot: 12, headRot: 2, pelvisYOffset: base.pelvisYOffset + 1, upperArmLRot: -40, forearmLRot: -56, upperArmRRot: -46, forearmRRot: -52 }, handPoseL: 'fist', handPoseR: 'fist' },
          { u: 1.0, ease: 'easeInOut', pose: { torsoRot: -2, upperArmLRot: -16, forearmLRot: -64, upperArmRRot: -22, forearmRRot: -62 }, handPoseL: 'fist', handPoseR: 'fist' },
        ],
        u,
        intensity
      );
      break;
    }

    case 'idle':
    default: {
      // Studio-grade planted stillness: zero hip sway, zero arm waving, minimal breathing micro-settle only
      const breathWave = Math.sin(w * 1.2);
      pose.torsoRot += breathWave * 0.28 * intensity;
      pose.neckRot -= breathWave * 0.12 * intensity;
      pose.upperArmLRot += breathWave * 0.4 * intensity;
      pose.forearmLRot += breathWave * 0.45 * intensity;
      pose.upperArmRRot -= breathWave * 0.4 * intensity;
      pose.forearmRRot -= breathWave * 0.45 * intensity;
      break;
    }
  }

  // Layer 3: Subtle Organic Breathing
  if (anim.enableBreathing) {
    const breath = Math.sin(t * 1.5);
    pose.torsoScaleY += breath * 0.011;
    pose.torsoScaleX -= breath * 0.007;
    pose.headOffsetY += breath * -0.55;
  }

  // Layer 3b: Syllabic Phrased Conversational Acting when Speaking
  if (isSpeaking) {
    const phraseT = cycleProgress(t, 1.65);
    const phrasePulse = Math.sin(clamp(phraseT / 0.72, 0, 1) * Math.PI);
    const easedPulse = easeInOut(phrasePulse);
    const nod = Math.sin(t * 3.1) * 1.4 + easedPulse * 1.5;

    pose.headRot += nod;
    pose.neckRot += easedPulse * 0.6;
    pose.torsoRot += easedPulse * 1.3 + (anim.basePose === 'sit' ? 2.2 : 0);

    if (
      anim.action === 'idle' ||
      anim.action === 'look_around' ||
      anim.action === 'hold_prop' ||
      anim.action === 'nod_agree'
    ) {
      // Phrased gesture spline: single natural emphasis gesture per phrase, settles calmly between phrases
      const gestureArm = easedPulse * 16;
      const gestureForearm = easedPulse * 14;
      pose.upperArmRRot -= 8 + gestureArm;
      pose.forearmRRot -= 12 + gestureForearm;
      pose.handRRot += Math.sin(t * 2.6 - 0.6) * 7 * easedPulse;
      pose.handPoseR = easedPulse > 0.22 ? 'open' : 'relaxed';

      if (anim.action !== 'hold_prop') {
        const supportPulse = Math.sin(clamp(cycleProgress(t + 0.8, 2.1) / 0.68, 0, 1) * Math.PI);
        const sEased = easeInOut(supportPulse);
        pose.upperArmLRot -= 3 + sEased * 7;
        pose.forearmLRot -= 6 + sEased * 8;
        pose.handLRot -= Math.sin(t * 2.0) * 4 * sEased;
        pose.handPoseL = sEased > 0.38 ? 'open' : 'relaxed';
      }
    }
  }

  // Layer 4: Emotional Body Modifiers (additive, respecting joint clamps)
  pose.torsoRot += faceSolved.postureSlump * 9;
  pose.headRot += faceSolved.headTiltDeg;
  pose.upperArmLRot += faceSolved.shoulderRaise * 13;
  pose.upperArmRRot -= faceSolved.shoulderRaise * 13;

  if (faceSolved.stressTremble > 0.15) {
    pose.bodyShakeX += deterministicNoise(42, t * 24) * 2.2 * faceSolved.stressTremble;
    pose.bodyShakeY += deterministicNoise(99, t * 27) * 1.4 * faceSolved.stressTremble;
  }

  if (anim.handPoseLeft && anim.handPoseLeft !== 'auto') {
    pose.handPoseL = anim.handPoseLeft;
  }
  if (anim.handPoseRight && anim.handPoseRight !== 'auto') {
    pose.handPoseR = anim.handPoseRight;
  }

  return clampRigPose(pose);
}

/**
 * Evaluates natural held eye fixations with crisp 0.14s saccade transitions every ~2.5s.
 */
function evaluateSteppedGaze(seed: number, t: number, intervalSec = 2.5): number {
  const step = Math.floor(t / intervalSec);
  const localT = t - step * intervalSec;
  const saccadeDur = 0.14;
  const curTarget = deterministicNoise(seed, step * 1.73);
  if (step === 0 || localT >= saccadeDur) return curTarget;
  const prevTarget = deterministicNoise(seed, (step - 1) * 1.73);
  const u = clamp(localT / saccadeDur, 0, 1);
  const eased = u * u * (3 - 2 * u);
  return prevTarget + (curTarget - prevTarget) * eased;
}

export function evaluateAnimationFrame(
  frame: number,
  fps: number,
  anim: AnimationConfig,
  expression: ExpressionInput
): EvaluatedFrame {
  const safeFps = Math.max(1, fps);
  const t = Math.max(0, frame) / safeFps;

  const autoBlinkVal = anim.enableAutoBlink ? evaluateDeterministicBlink(t, 3.8) : 0;
  const saccadeX = evaluateSteppedGaze(7, t, 2.5) * 0.16;
  const saccadeY = evaluateSteppedGaze(13, t + 0.6, 2.9) * 0.08;

  const faceSolved = solveExpression({
    ...expression,
    gazeX: expression.gazeX ?? (anim.action === 'look_around' ? Math.sin(t * anim.speed * 2.2) * 0.72 : saccadeX),
    gazeY: expression.gazeY ?? saccadeY,
    blinkOverride: expression.blinkOverride ?? autoBlinkVal,
  });

  const isSpeaking = Boolean(expression.phoneme && expression.phoneme !== 'X');
  const pose = evaluateCoreMotionAtTime(t, anim, faceSolved, isSpeaking);

  // Layer 6: Deterministic Follow-Through Physics
  if (anim.enablePhysics) {
    const dt = 0.033;
    const prevPose = evaluateCoreMotionAtTime(Math.max(0, t - dt), anim, faceSolved, isSpeaking);
    const velHead = (pose.headRot - prevPose.headRot) / dt;
    const velTorso = (pose.torsoRot - prevPose.torsoRot) / dt;
    const velPelvisY = (pose.pelvisYOffset - prevPose.pelvisYOffset) / dt;
    const velArmR = (pose.forearmRRot - prevPose.forearmRRot) / dt;

    pose.hairSwingDeg = clamp(-velHead * 0.14 - velTorso * 0.1 - velPelvisY * 0.06, -30, 30);
    pose.clothSwingDeg = clamp(-velTorso * 0.16 - velPelvisY * 0.08, -28, 28);
    pose.propSwingDeg = clamp(-velArmR * 0.1, -24, 24);
  }

  const finalPose = clampRigPose(pose);

  return {
    frame,
    timeSeconds: t,
    pose: finalPose,
    face: faceSolved,
    activeChannels: {
      basePose: anim.basePose,
      action: anim.action,
      breathing: anim.enableBreathing,
      autoBlink: anim.enableAutoBlink,
      physics: anim.enablePhysics,
      emotionModifierActive:
        Math.abs(faceSolved.postureSlump) > 0.05 ||
        faceSolved.shoulderRaise > 0.05 ||
        faceSolved.stressTremble > 0.05,
    },
  };
}
