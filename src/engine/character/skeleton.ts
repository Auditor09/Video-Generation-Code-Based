/**
 * Hierarchical Character Skeleton & Joint Limits
 * Computes deterministic 2D transforms and world joint positions for debugging & testing.
 */

import { BodyMetrics } from './bodyGeometry';

export type JointId =
  | 'pelvis'
  | 'torso'
  | 'neck'
  | 'head'
  | 'shoulderL'
  | 'elbowL'
  | 'wristL'
  | 'shoulderR'
  | 'elbowR'
  | 'wristR'
  | 'hipL'
  | 'kneeL'
  | 'ankleL'
  | 'hipR'
  | 'kneeR'
  | 'ankleR';

export interface RigPose {
  pelvisX: number;
  pelvisYOffset: number; // offset relative to restPelvisY
  pelvisRot: number;
  torsoRot: number;
  torsoScaleX: number;
  torsoScaleY: number;
  neckRot: number;
  headRot: number;
  headOffsetX: number;
  headOffsetY: number;
  upperArmLRot: number;
  forearmLRot: number;
  handLRot: number;
  upperArmRRot: number;
  forearmRRot: number;
  handRRot: number;
  thighLRot: number;
  shinLRot: number;
  footLRot: number;
  thighRRot: number;
  shinRRot: number;
  footRRot: number;
  // Secondary physics channels (deterministic)
  hairSwingDeg: number;
  clothSwingDeg: number;
  propSwingDeg: number;
  bodyShakeX: number;
  bodyShakeY: number;
  // Hand pose states
  handPoseL: 'relaxed' | 'fist' | 'point' | 'open' | 'grip' | 'peace';
  handPoseR: 'relaxed' | 'fist' | 'point' | 'open' | 'grip' | 'peace';
}

export const DEFAULT_RIG_POSE: RigPose = {
  pelvisX: 0,
  pelvisYOffset: 0,
  pelvisRot: 0,
  torsoRot: 0,
  torsoScaleX: 1,
  torsoScaleY: 1,
  neckRot: 0,
  headRot: 0,
  headOffsetX: 0,
  headOffsetY: 0,
  upperArmLRot: 8,
  forearmLRot: -14,
  handLRot: 0,
  upperArmRRot: -10,
  forearmRRot: -12,
  handRRot: 0,
  thighLRot: 3,
  shinLRot: 2,
  footLRot: -5,
  thighRRot: -3,
  shinRRot: 2,
  footRRot: 1,
  hairSwingDeg: 0,
  clothSwingDeg: 0,
  propSwingDeg: 0,
  bodyShakeX: 0,
  bodyShakeY: 0,
  handPoseL: 'relaxed',
  handPoseR: 'relaxed',
};

function clampAngle(deg: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, deg));
}

function lerpVal(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smoothly blends two RigPoses (used to crossfade actionTracks without snapping).
 */
export function blendRigPoses(a: RigPose, b: RigPose, u: number): RigPose {
  const t = Math.max(0, Math.min(1, u));
  return clampRigPose({
    pelvisX: lerpVal(a.pelvisX, b.pelvisX, t),
    pelvisYOffset: lerpVal(a.pelvisYOffset, b.pelvisYOffset, t),
    pelvisRot: lerpVal(a.pelvisRot, b.pelvisRot, t),
    torsoRot: lerpVal(a.torsoRot, b.torsoRot, t),
    torsoScaleX: lerpVal(a.torsoScaleX, b.torsoScaleX, t),
    torsoScaleY: lerpVal(a.torsoScaleY, b.torsoScaleY, t),
    neckRot: lerpVal(a.neckRot, b.neckRot, t),
    headRot: lerpVal(a.headRot, b.headRot, t),
    headOffsetX: lerpVal(a.headOffsetX, b.headOffsetX, t),
    headOffsetY: lerpVal(a.headOffsetY, b.headOffsetY, t),
    upperArmLRot: lerpVal(a.upperArmLRot, b.upperArmLRot, t),
    forearmLRot: lerpVal(a.forearmLRot, b.forearmLRot, t),
    handLRot: lerpVal(a.handLRot, b.handLRot, t),
    upperArmRRot: lerpVal(a.upperArmRRot, b.upperArmRRot, t),
    forearmRRot: lerpVal(a.forearmRRot, b.forearmRRot, t),
    handRRot: lerpVal(a.handRRot, b.handRRot, t),
    thighLRot: lerpVal(a.thighLRot, b.thighLRot, t),
    shinLRot: lerpVal(a.shinLRot, b.shinLRot, t),
    footLRot: lerpVal(a.footLRot, b.footLRot, t),
    thighRRot: lerpVal(a.thighRRot, b.thighRRot, t),
    shinRRot: lerpVal(a.shinRRot, b.shinRRot, t),
    footRRot: lerpVal(a.footRRot, b.footRRot, t),
    hairSwingDeg: lerpVal(a.hairSwingDeg, b.hairSwingDeg, t),
    clothSwingDeg: lerpVal(a.clothSwingDeg, b.clothSwingDeg, t),
    propSwingDeg: lerpVal(a.propSwingDeg, b.propSwingDeg, t),
    bodyShakeX: lerpVal(a.bodyShakeX, b.bodyShakeX, t),
    bodyShakeY: lerpVal(a.bodyShakeY, b.bodyShakeY, t),
    handPoseL: t < 0.5 ? a.handPoseL : b.handPoseL,
    handPoseR: t < 0.5 ? a.handPoseR : b.handPoseR,
  });
}

/**
 * Enforces anatomical joint limits so blended animations never produce broken limbs.
 * Note: In SVG (+Y down, +X forward), elbows naturally flex counter-clockwise (negative angles).
 */
export function clampRigPose(pose: RigPose): RigPose {
  return {
    ...pose,
    pelvisRot: clampAngle(pose.pelvisRot, -45, 45),
    torsoRot: clampAngle(pose.torsoRot, -55, 55),
    torsoScaleX: Math.max(0.82, Math.min(1.22, pose.torsoScaleX)),
    torsoScaleY: Math.max(0.82, Math.min(1.22, pose.torsoScaleY)),
    neckRot: clampAngle(pose.neckRot, -35, 35),
    headRot: clampAngle(pose.headRot, -48, 48),
    upperArmLRot: clampAngle(pose.upperArmLRot, -175, 175),
    forearmLRot: clampAngle(pose.forearmLRot, -152, 16),
    handLRot: clampAngle(pose.handLRot, -85, 85),
    upperArmRRot: clampAngle(pose.upperArmRRot, -175, 175),
    forearmRRot: clampAngle(pose.forearmRRot, -152, 16),
    handRRot: clampAngle(pose.handRRot, -85, 85),
    thighLRot: clampAngle(pose.thighLRot, -125, 125),
    shinLRot: clampAngle(pose.shinLRot, -18, 145),
    footLRot: clampAngle(pose.footLRot, -75, 75),
    thighRRot: clampAngle(pose.thighRRot, -125, 125),
    shinRRot: clampAngle(pose.shinRRot, -18, 145),
    footRRot: clampAngle(pose.footRRot, -75, 75),
    hairSwingDeg: clampAngle(pose.hairSwingDeg, -38, 38),
    clothSwingDeg: clampAngle(pose.clothSwingDeg, -35, 35),
    propSwingDeg: clampAngle(pose.propSwingDeg, -35, 35),
  };
}

export interface WorldPoint {
  x: number;
  y: number;
  angleDeg: number;
}

function transformPoint(
  origin: WorldPoint,
  localX: number,
  localY: number,
  addDeg: number
): WorldPoint {
  const rad = (origin.angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: origin.x + localX * cos - localY * sin,
    y: origin.y + localX * sin + localY * cos,
    angleDeg: origin.angleDeg + addDeg,
  };
}

/**
 * Computes exact world-space positions of every joint pivot for testing and overlay visualization.
 */
export function computeSkeletonWorld(
  metrics: BodyMetrics,
  pose: RigPose
): Record<JointId, WorldPoint> {
  const pelvis: WorldPoint = {
    x: pose.pelvisX + pose.bodyShakeX,
    y: metrics.restPelvisY + pose.pelvisYOffset + pose.bodyShakeY,
    angleDeg: pose.pelvisRot,
  };

  const torso = transformPoint(pelvis, 0, -4, pose.torsoRot);
  const neck = transformPoint(torso, 0, -metrics.torsoLen * pose.torsoScaleY, pose.neckRot);
  const head = transformPoint(neck, pose.headOffsetX, -metrics.neckLen + pose.headOffsetY, pose.headRot);

  const shoulderY = -metrics.torsoLen * pose.torsoScaleY + 10;
  const shoulderL = transformPoint(torso, -metrics.shoulderHalfW * pose.torsoScaleX, shoulderY, pose.upperArmLRot);
  const elbowL = transformPoint(shoulderL, 0, metrics.upperArmLen, pose.forearmLRot);
  const wristL = transformPoint(elbowL, 0, metrics.forearmLen, pose.handLRot);

  const shoulderR = transformPoint(torso, metrics.shoulderHalfW * pose.torsoScaleX, shoulderY, pose.upperArmRRot);
  const elbowR = transformPoint(shoulderR, 0, metrics.upperArmLen, pose.forearmRRot);
  const wristR = transformPoint(elbowR, 0, metrics.forearmLen, pose.handRRot);

  const hipL = transformPoint(pelvis, -metrics.hipHalfW, 4, pose.thighLRot);
  const kneeL = transformPoint(hipL, 0, metrics.thighLen, pose.shinLRot);
  const ankleL = transformPoint(kneeL, 0, metrics.shinLen, pose.footLRot);

  const hipR = transformPoint(pelvis, metrics.hipHalfW, 4, pose.thighRRot);
  const kneeR = transformPoint(hipR, 0, metrics.thighLen, pose.shinRRot);
  const ankleR = transformPoint(kneeR, 0, metrics.shinLen, pose.footRRot);

  return {
    pelvis,
    torso,
    neck,
    head,
    shoulderL,
    elbowL,
    wristL,
    shoulderR,
    elbowR,
    wristR,
    hipL,
    kneeL,
    ankleL,
    hipR,
    kneeR,
    ankleR,
  };
}
