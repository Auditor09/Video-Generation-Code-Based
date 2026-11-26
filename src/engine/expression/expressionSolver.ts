/**
 * Continuous Multi-Emotion Solver & Facial Region Override Engine (v2.0)
 * Maps weighted EmotionWeights + FaceRegionOverrides + Phonemes into rich, high-contrast SolvedFaceParameters.
 */

import {
  EmotionKey,
  EmotionWeights,
  ExpressionInput,
  PhonemeCode,
} from '../../schemas/character.schema';

export interface SolvedFaceParameters {
  // Brows (-1..1)
  browLHeight: number;
  browRHeight: number;
  browLTilt: number;   // + = inner up (worried/sad), - = inner down (angry)
  browRTilt: number;
  browCurve: number;   // + = arched, - = flat/furrowed

  // Eyes & Eyelids
  eyeOpenL: number;    // 0 (closed) .. 1.38 (wide)
  eyeOpenR: number;
  lidSlantL: number;   // + = sad/worried outer droop, - = angry/fierce inner slant
  lidSlantR: number;
  lowerLidL: number;   // 0..0.92 (squint / joyful cheek raise)
  lowerLidR: number;
  happyCrescentL: number; // 0..1 (^_^ smiling eye arc at high joy)
  happyCrescentR: number;
  eyeSquashL: number;     // 0..1 lower-cheek squash
  eyeSquashR: number;
  pupilScale: number;  // 0.36..1.35
  pupilGloss: number;  // 0.6..1.5
  gazeX: number;       // -1..1
  gazeY: number;       // -1..1

  // Mouth & Jaw
  mouthWidth: number;      // 0.52..1.38
  mouthCurve: number;      // -1 (deep frown) .. +1 (broad smile)
  mouthOpen: number;       // 0 (closed) .. 1.0 (wide open)
  mouthSkew: number;       // -0.65..0.65 (smirk/asymmetry)
  jawDropShift: number;    // 0..1 (subtle chin/mouth drop on wide vowels/shouts)
  lipTension: number;      // 0..1 (grit teeth / pressed)
  lipRoundness: number;    // 0..1 (O / Woo phoneme)
  teethShow: number;       // 0..1
  tongueShow: number;      // 0..1

  // Secondary emotional facial & reaction cues
  blushBoost: number;      // 0..1
  sweatDrop: number;       // 0..1
  stressTremble: number;   // 0..1
  tearLevel: number;       // 0..1
  angerVein: number;       // 0..1 (comic temple cross)
  shockLines: number;      // 0..1 (radial shock / surprise burst)
  sparkleLevel: number;    // 0..1 (twinkling joy/excitement stars)
  confusedMarks: number;   // 0..1 (floating ? cue)
  gloomLines: number;      // 0..1 (upper-face gloom shading)
  cheekSquint: number;     // 0..1 (joyful lower-lid cheek push)
  browFurrow: number;      // 0..1 (vertical furrow lines between brows)
  noseCrinkle: number;     // 0..1 (bridge crinkle on disgust/anger/smug)

  // Posture influence hints for Animation Engine
  postureSlump: number;    // -1 (confident chest up) .. +1 (slumped)
  shoulderRaise: number;   // 0..1 (tense/scared)
  headTiltDeg: number;     // -16..16
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface EmotionProfile {
  browHeight?: number;
  browTilt?: number;
  browAsym?: number;
  browCurve?: number;
  eyeOpen?: number;
  lidSlant?: number;
  lowerLid?: number;
  happyCrescent?: number;
  eyeSquash?: number;
  pupilScale?: number;
  pupilGloss?: number;
  mouthWidth?: number;
  mouthCurve?: number;
  mouthOpen?: number;
  mouthSkew?: number;
  lipTension?: number;
  lipRoundness?: number;
  teethShow?: number;
  blushBoost?: number;
  sweatDrop?: number;
  stressTremble?: number;
  tearLevel?: number;
  angerVein?: number;
  shockLines?: number;
  sparkleLevel?: number;
  confusedMarks?: number;
  gloomLines?: number;
  cheekSquint?: number;
  browFurrow?: number;
  noseCrinkle?: number;
  postureSlump?: number;
  shoulderRaise?: number;
  headTiltDeg?: number;
}

const EMOTION_PROFILES: Record<EmotionKey, EmotionProfile> = {
  scared: {
    browHeight: 0.84,
    browTilt: 0.94,
    browCurve: 0.68,
    eyeOpen: 0.38,
    lidSlant: 0.62,
    pupilScale: -0.58,
    pupilGloss: -0.15,
    mouthWidth: 0.1,
    mouthCurve: -0.82,
    mouthOpen: 0.56,
    lipTension: 0.55,
    teethShow: 0.72,
    sweatDrop: 0.9,
    stressTremble: 0.92,
    shockLines: 0.58,
    browFurrow: 0.62,
    shoulderRaise: 0.76,
    postureSlump: 0.36,
  },
  happy: {
    browHeight: 0.38,
    browCurve: 0.64,
    eyeOpen: -0.06,
    lowerLid: 0.68,
    happyCrescent: 0.85,
    eyeSquash: 0.75,
    pupilScale: 0.22,
    pupilGloss: 0.35,
    mouthWidth: 0.3,
    mouthCurve: 0.98,
    mouthOpen: 0.38,
    teethShow: 0.9,
    blushBoost: 0.38,
    sparkleLevel: 0.62,
    cheekSquint: 0.9,
    postureSlump: -0.24,
  },
  sad: {
    browHeight: -0.06,
    browTilt: 0.98,
    browCurve: 0.28,
    eyeOpen: -0.24,
    lidSlant: 0.94,
    lowerLid: 0.36,
    pupilScale: 0.14,
    pupilGloss: 0.25,
    mouthWidth: -0.24,
    mouthCurve: -0.94,
    mouthOpen: 0.08,
    tearLevel: 0.94,
    gloomLines: 0.84,
    browFurrow: 0.56,
    postureSlump: 0.68,
    headTiltDeg: 9,
  },
  angry: {
    browHeight: -0.64,
    browTilt: -1.0,
    browCurve: -0.6,
    eyeOpen: -0.2,
    lidSlant: -0.98,
    lowerLid: 0.5,
    eyeSquash: 0.45,
    pupilScale: -0.32,
    mouthWidth: 0.22,
    mouthCurve: -0.9,
    mouthOpen: 0.42,
    lipTension: 0.94,
    teethShow: 0.94,
    angerVein: 0.94,
    browFurrow: 0.98,
    noseCrinkle: 0.78,
    shoulderRaise: 0.38,
    postureSlump: -0.2,
    headTiltDeg: -5,
  },
  surprised: {
    browHeight: 0.98,
    browCurve: 0.94,
    eyeOpen: 0.44,
    pupilScale: -0.5,
    pupilGloss: 0.25,
    mouthWidth: -0.32,
    mouthCurve: -0.04,
    mouthOpen: 0.92,
    lipRoundness: 0.76,
    shockLines: 0.96,
    shoulderRaise: 0.52,
  },
  disgusted: {
    browHeight: -0.36,
    browTilt: -0.62,
    browAsym: 0.42,
    eyeOpen: -0.38,
    lidSlant: -0.5,
    lowerLid: 0.68,
    eyeSquash: 0.55,
    mouthWidth: -0.14,
    mouthCurve: -0.78,
    mouthOpen: 0.14,
    mouthSkew: -0.42,
    lipTension: 0.68,
    browFurrow: 0.74,
    noseCrinkle: 0.92,
    headTiltDeg: -6,
  },
  confident: {
    browHeight: 0.22,
    browAsym: 0.42,
    browCurve: 0.38,
    eyeOpen: -0.1,
    lidSlant: -0.2,
    lowerLid: 0.32,
    pupilGloss: 0.2,
    mouthWidth: 0.2,
    mouthCurve: 0.72,
    mouthSkew: 0.36,
    cheekSquint: 0.36,
    postureSlump: -0.58,
    headTiltDeg: -4,
  },
  determined: {
    browHeight: -0.38,
    browTilt: -0.72,
    browCurve: -0.25,
    eyeOpen: -0.14,
    lidSlant: -0.68,
    lowerLid: 0.42,
    mouthWidth: 0.06,
    mouthCurve: -0.24,
    lipTension: 0.74,
    browFurrow: 0.78,
    noseCrinkle: 0.28,
    postureSlump: -0.42,
  },
  confused: {
    browHeight: 0.28,
    browAsym: 0.92,
    browTilt: 0.34,
    eyeOpen: 0.14,
    lidSlant: 0.22,
    mouthWidth: -0.2,
    mouthCurve: -0.3,
    mouthSkew: 0.46,
    confusedMarks: 0.94,
    headTiltDeg: 13,
  },
  suspicious: {
    browHeight: -0.32,
    browTilt: -0.52,
    browAsym: 0.72,
    eyeOpen: -0.46,
    lidSlant: -0.46,
    lowerLid: 0.66,
    eyeSquash: 0.48,
    mouthWidth: -0.16,
    mouthCurve: -0.28,
    mouthSkew: -0.34,
    lipTension: 0.58,
    browFurrow: 0.56,
    headTiltDeg: -5,
  },
  excited: {
    browHeight: 0.72,
    browCurve: 0.8,
    eyeOpen: 0.3,
    pupilScale: 0.32,
    pupilGloss: 0.48,
    lowerLid: 0.48,
    happyCrescent: 0.35,
    eyeSquash: 0.45,
    mouthWidth: 0.36,
    mouthCurve: 1.0,
    mouthOpen: 0.76,
    teethShow: 0.96,
    blushBoost: 0.42,
    sparkleLevel: 0.98,
    cheekSquint: 0.82,
    postureSlump: -0.45,
  },
  nervous: {
    browHeight: 0.5,
    browTilt: 0.78,
    browCurve: 0.38,
    eyeOpen: 0.16,
    lidSlant: 0.56,
    pupilScale: -0.3,
    mouthWidth: 0.16,
    mouthCurve: -0.28,
    mouthOpen: 0.18,
    lipTension: 0.78,
    teethShow: 0.72,
    sweatDrop: 0.94,
    stressTremble: 0.68,
    browFurrow: 0.44,
    shoulderRaise: 0.48,
  },
  embarrassed: {
    browHeight: 0.3,
    browTilt: 0.64,
    eyeOpen: -0.18,
    lidSlant: 0.46,
    lowerLid: 0.4,
    mouthWidth: -0.1,
    mouthCurve: 0.24,
    mouthSkew: -0.26,
    blushBoost: 1.0,
    sweatDrop: 0.62,
    gloomLines: 0.2,
    headTiltDeg: 9,
  },
  bored: {
    browHeight: -0.24,
    browCurve: -0.18,
    eyeOpen: -0.54,
    lidSlant: 0.14,
    lowerLid: 0.24,
    pupilGloss: -0.22,
    mouthWidth: -0.16,
    mouthCurve: -0.28,
    gloomLines: 0.46,
    postureSlump: 0.48,
    headTiltDeg: 6,
  },
  curious: {
    browHeight: 0.58,
    browAsym: 0.54,
    browCurve: 0.54,
    eyeOpen: 0.26,
    pupilScale: 0.22,
    pupilGloss: 0.22,
    mouthWidth: -0.12,
    mouthCurve: 0.2,
    mouthOpen: 0.16,
    lipRoundness: 0.26,
    confusedMarks: 0.48,
    headTiltDeg: 11,
  },
  frustrated: {
    browHeight: -0.52,
    browTilt: -0.86,
    browCurve: -0.44,
    eyeOpen: -0.34,
    lidSlant: -0.82,
    lowerLid: 0.52,
    mouthWidth: 0.18,
    mouthCurve: -0.72,
    mouthOpen: 0.28,
    lipTension: 0.9,
    teethShow: 0.84,
    sweatDrop: 0.42,
    angerVein: 0.72,
    browFurrow: 0.9,
    noseCrinkle: 0.62,
    shoulderRaise: 0.36,
  },
  smug: {
    browHeight: 0.18,
    browAsym: 0.78,
    eyeOpen: -0.36,
    lidSlant: -0.32,
    lowerLid: 0.48,
    eyeSquash: 0.38,
    mouthWidth: 0.18,
    mouthCurve: 0.64,
    mouthSkew: 0.6,
    blushBoost: 0.16,
    cheekSquint: 0.44,
    noseCrinkle: 0.24,
    postureSlump: -0.38,
    headTiltDeg: -6,
  },
};

export function solveExpression(input: ExpressionInput): SolvedFaceParameters {
  const weights: EmotionWeights = input.emotion || {};

  let totalWeight = 0;
  for (const k of Object.keys(weights) as EmotionKey[]) {
    totalWeight += Math.max(0, Math.min(1, weights[k] ?? 0));
  }
  const normFactor = totalWeight > 1.35 ? 1.35 / totalWeight : 1.0;

  let browHeight = 0;
  let browTilt = 0;
  let browAsym = 0;
  let browCurve = 0.12;
  let eyeOpen = 1.0;
  let lidSlant = 0;
  let lowerLid = 0;
  let happyCrescent = 0;
  let eyeSquash = 0;
  let pupilScale = 1.0;
  let pupilGloss = 1.0;
  let mouthWidth = 1.0;
  let mouthCurve = 0.06;
  let mouthOpen = 0;
  let mouthSkew = 0;
  let lipTension = 0;
  let lipRoundness = 0;
  let teethShow = 0;
  let blushBoost = 0;
  let sweatDrop = 0;
  let stressTremble = 0;
  let tearLevel = 0;
  let angerVein = 0;
  let shockLines = 0;
  let sparkleLevel = 0;
  let confusedMarks = 0;
  let gloomLines = 0;
  let cheekSquint = 0;
  let browFurrow = 0;
  let noseCrinkle = 0;
  let postureSlump = 0;
  let shoulderRaise = 0;
  let headTiltDeg = 0;

  for (const key of Object.keys(weights) as EmotionKey[]) {
    const rawW = weights[key] ?? 0;
    const w = clamp(rawW, 0, 1) * normFactor;
    if (w <= 0.001) continue;
    const p = EMOTION_PROFILES[key];
    if (!p) continue;

    browHeight += (p.browHeight ?? 0) * w;
    browTilt += (p.browTilt ?? 0) * w;
    browAsym += (p.browAsym ?? 0) * w;
    browCurve += (p.browCurve ?? 0) * w;
    eyeOpen += (p.eyeOpen ?? 0) * w;
    lidSlant += (p.lidSlant ?? 0) * w;
    lowerLid += (p.lowerLid ?? 0) * w;
    happyCrescent += (p.happyCrescent ?? 0) * w;
    eyeSquash += (p.eyeSquash ?? 0) * w;
    pupilScale += (p.pupilScale ?? 0) * w;
    pupilGloss += (p.pupilGloss ?? 0) * w;
    mouthWidth += (p.mouthWidth ?? 0) * w;
    mouthCurve += (p.mouthCurve ?? 0) * w;
    mouthOpen += (p.mouthOpen ?? 0) * w;
    mouthSkew += (p.mouthSkew ?? 0) * w;
    lipTension += (p.lipTension ?? 0) * w;
    lipRoundness += (p.lipRoundness ?? 0) * w;
    teethShow += (p.teethShow ?? 0) * w;
    blushBoost += (p.blushBoost ?? 0) * w;
    sweatDrop += (p.sweatDrop ?? 0) * w;
    stressTremble += (p.stressTremble ?? 0) * w;
    tearLevel += (p.tearLevel ?? 0) * w;
    angerVein += (p.angerVein ?? 0) * w;
    shockLines += (p.shockLines ?? 0) * w;
    sparkleLevel += (p.sparkleLevel ?? 0) * w;
    confusedMarks += (p.confusedMarks ?? 0) * w;
    gloomLines += (p.gloomLines ?? 0) * w;
    cheekSquint += (p.cheekSquint ?? 0) * w;
    browFurrow += (p.browFurrow ?? 0) * w;
    noseCrinkle += (p.noseCrinkle ?? 0) * w;
    postureSlump += (p.postureSlump ?? 0) * w;
    shoulderRaise += (p.shoulderRaise ?? 0) * w;
    headTiltDeg += (p.headTiltDeg ?? 0) * w;
  }

  let browLHeight = browHeight + browAsym * 0.48;
  let browRHeight = browHeight - browAsym * 0.28;
  let browLTilt = browTilt;
  let browRTilt = browTilt;
  let eyeOpenL = eyeOpen;
  let eyeOpenR = eyeOpen;
  let lidSlantL = lidSlant + browAsym * 0.16;
  let lidSlantR = lidSlant - browAsym * 0.24;
  let lowerLidL = lowerLid;
  let lowerLidR = lowerLid;
  let happyCrescentL = happyCrescent;
  let happyCrescentR = happyCrescent;
  let eyeSquashL = eyeSquash;
  let eyeSquashR = eyeSquash;
  let gazeX = input.gazeX ?? 0;
  let gazeY = input.gazeY ?? 0;

  // Suppress happy crescents if strong negative emotion overrides
  if (shockLines > 0.45 || angerVein > 0.45 || tearLevel > 0.4) {
    happyCrescentL *= 0.2;
    happyCrescentR *= 0.2;
  }

  const ov = input.faceOverrides;
  if (ov?.brows && ov.brows !== 'auto') {
    switch (ov.brows) {
      case 'neutral':
        browLHeight = 0; browRHeight = 0; browLTilt = 0; browRTilt = 0; browCurve = 0.12;
        break;
      case 'worried':
        browLHeight = 0.42; browRHeight = 0.42; browLTilt = 0.94; browRTilt = 0.94; browCurve = 0.38;
        lidSlantL = Math.max(lidSlantL, 0.58); lidSlantR = Math.max(lidSlantR, 0.58);
        break;
      case 'angry':
        browLHeight = -0.58; browRHeight = -0.58; browLTilt = -1.0; browRTilt = -1.0; browCurve = -0.48;
        lidSlantL = Math.min(lidSlantL, -0.86); lidSlantR = Math.min(lidSlantR, -0.86);
        break;
      case 'raised':
        browLHeight = 0.88; browRHeight = 0.88; browLTilt = 0.12; browRTilt = 0.12; browCurve = 0.82;
        break;
      case 'skeptical':
        browLHeight = -0.32; browRHeight = 0.66; browLTilt = -0.48; browRTilt = 0.22;
        lidSlantL = -0.4; lidSlantR = 0.16;
        break;
      case 'sad':
        browLHeight = 0.08; browRHeight = 0.08; browLTilt = 0.92; browRTilt = 0.92;
        lidSlantL = Math.max(lidSlantL, 0.76); lidSlantR = Math.max(lidSlantR, 0.76);
        break;
    }
  }

  if (ov?.eyes && ov.eyes !== 'auto') {
    switch (ov.eyes) {
      case 'neutral':
        eyeOpenL = 1.0; eyeOpenR = 1.0; lowerLidL = 0; lowerLidR = 0; lidSlantL = 0; lidSlantR = 0;
        happyCrescentL = 0; happyCrescentR = 0;
        break;
      case 'wide':
        eyeOpenL = 1.35; eyeOpenR = 1.35; lowerLidL = 0; lowerLidR = 0;
        happyCrescentL = 0; happyCrescentR = 0;
        break;
      case 'suspicious':
        eyeOpenL = 0.56; eyeOpenR = 0.56; lowerLidL = 0.56; lowerLidR = 0.56;
        happyCrescentL = 0; happyCrescentR = 0;
        break;
      case 'squint':
        eyeOpenL = 0.42; eyeOpenR = 0.42; lowerLidL = 0.66; lowerLidR = 0.66;
        break;
      case 'closed':
        eyeOpenL = 0; eyeOpenR = 0;
        break;
      case 'wink_l':
        eyeOpenL = 0; eyeOpenR = 1.08; happyCrescentL = Math.max(happyCrescentL, 0.75);
        break;
      case 'wink_r':
        eyeOpenL = 1.08; eyeOpenR = 0; happyCrescentR = Math.max(happyCrescentR, 0.75);
        break;
      case 'rolled':
        eyeOpenL = 0.96; eyeOpenR = 0.96; gazeY = -0.88; gazeX = 0.28;
        happyCrescentL = 0; happyCrescentR = 0;
        break;
    }
  }

  let tongueShow = 0;

  if (ov?.mouth && ov.mouth !== 'auto') {
    switch (ov.mouth) {
      case 'neutral':
        mouthWidth = 0.95; mouthCurve = 0; mouthOpen = 0; mouthSkew = 0; lipTension = 0.1; teethShow = 0; lipRoundness = 0;
        break;
      case 'smile':
        mouthWidth = 1.18; mouthCurve = 0.82; mouthOpen = 0.1; teethShow = 0.36; lipRoundness = 0;
        break;
      case 'grin':
        mouthWidth = 1.32; mouthCurve = 0.98; mouthOpen = 0.44; teethShow = 0.98; lipRoundness = 0;
        break;
      case 'frown':
        mouthWidth = 0.88; mouthCurve = -0.9; mouthOpen = 0.04; teethShow = 0; lipRoundness = 0;
        break;
      case 'nervous_smile':
        mouthWidth = 1.16; mouthCurve = 0.24; mouthOpen = 0.26; lipTension = 0.8; teethShow = 0.94; lipRoundness = 0;
        break;
      case 'open_gasp':
        mouthWidth = 0.68; mouthCurve = -0.15; mouthOpen = 0.88; lipRoundness = 0.76; teethShow = 0.18;
        break;
      case 'grit_teeth':
        mouthWidth = 1.2; mouthCurve = -0.4; mouthOpen = 0.28; lipTension = 0.98; teethShow = 0.98; lipRoundness = 0;
        break;
      case 'smirk':
        mouthWidth = 1.08; mouthCurve = 0.5; mouthOpen = 0; mouthSkew = 0.6; lipRoundness = 0;
        break;
      case 'pout':
        mouthWidth = 0.7; mouthCurve = -0.52; mouthOpen = 0; lipRoundness = 0.28;
        break;
    }
  }

  // Apply Rhubarb-compatible Phoneme / Viseme modulation while preserving underlying emotion
  if (input.phoneme && input.phoneme !== 'X') {
    const ph = applyPhonemeShape(input.phoneme);
    mouthOpen = clamp(lerpNum(mouthOpen * 0.42, ph.open, 0.84), 0, 1);
    mouthWidth = clamp(lerpNum(mouthWidth, ph.width, 0.56), 0.52, 1.38);
    lipRoundness = clamp(lerpNum(lipRoundness, ph.round, 0.78), 0, 1);
    teethShow = clamp(Math.max(teethShow * 0.45, ph.teeth), 0, 1);
    tongueShow = clamp(ph.tongue, 0, 1);
  }

  // Apply automatic or manual blink
  if (typeof input.blinkOverride === 'number') {
    const b = clamp(input.blinkOverride, 0, 1);
    eyeOpenL = eyeOpenL * (1 - b);
    eyeOpenR = eyeOpenR * (1 - b);
  }

  const jawDropShift = clamp(mouthOpen * 0.85, 0, 1);

  return {
    browLHeight: clamp(browLHeight, -1, 1),
    browRHeight: clamp(browRHeight, -1, 1),
    browLTilt: clamp(browLTilt, -1, 1),
    browRTilt: clamp(browRTilt, -1, 1),
    browCurve: clamp(browCurve, -0.85, 1),
    eyeOpenL: clamp(eyeOpenL, 0, 1.38),
    eyeOpenR: clamp(eyeOpenR, 0, 1.38),
    lidSlantL: clamp(lidSlantL, -1, 1),
    lidSlantR: clamp(lidSlantR, -1, 1),
    lowerLidL: clamp(lowerLidL, 0, 0.92),
    lowerLidR: clamp(lowerLidR, 0, 0.92),
    happyCrescentL: clamp(happyCrescentL, 0, 1),
    happyCrescentR: clamp(happyCrescentR, 0, 1),
    eyeSquashL: clamp(eyeSquashL, 0, 1),
    eyeSquashR: clamp(eyeSquashR, 0, 1),
    pupilScale: clamp(pupilScale, 0.36, 1.35),
    pupilGloss: clamp(pupilGloss, 0.6, 1.5),
    gazeX: clamp(gazeX, -1, 1),
    gazeY: clamp(gazeY, -1, 1),
    mouthWidth: clamp(mouthWidth, 0.52, 1.38),
    mouthCurve: clamp(mouthCurve, -1, 1),
    mouthOpen: clamp(mouthOpen, 0, 1),
    mouthSkew: clamp(mouthSkew, -0.65, 0.65),
    jawDropShift,
    lipTension: clamp(lipTension, 0, 1),
    lipRoundness: clamp(lipRoundness, 0, 1),
    teethShow: clamp(teethShow, 0, 1),
    tongueShow: clamp(tongueShow, 0, 1),
    blushBoost: clamp(blushBoost, 0, 1),
    sweatDrop: clamp(sweatDrop, 0, 1),
    stressTremble: clamp(stressTremble, 0, 1),
    tearLevel: clamp(tearLevel, 0, 1),
    angerVein: clamp(angerVein, 0, 1),
    shockLines: clamp(shockLines, 0, 1),
    sparkleLevel: clamp(sparkleLevel, 0, 1),
    confusedMarks: clamp(confusedMarks, 0, 1),
    gloomLines: clamp(gloomLines, 0, 1),
    cheekSquint: clamp(cheekSquint, 0, 1),
    browFurrow: clamp(browFurrow, 0, 1),
    noseCrinkle: clamp(noseCrinkle, 0, 1),
    postureSlump: clamp(postureSlump, -1, 1),
    shoulderRaise: clamp(shoulderRaise, 0, 1),
    headTiltDeg: clamp(headTiltDeg, -16, 16),
  };
}

function applyPhonemeShape(code: PhonemeCode): {
  open: number;
  width: number;
  round: number;
  teeth: number;
  tongue: number;
} {
  switch (code) {
    case 'A': // Closed consonants P, B, M
      return { open: 0.02, width: 0.95, round: 0, teeth: 0, tongue: 0 };
    case 'B': // Slightly open consonants K, S, T, EE
      return { open: 0.28, width: 1.08, round: 0, teeth: 0.85, tongue: 0.1 };
    case 'C': // Mid open EH, AE
      return { open: 0.54, width: 1.12, round: 0.1, teeth: 0.74, tongue: 0.45 };
    case 'D': // Wide open AH
      return { open: 0.9, width: 1.05, round: 0.15, teeth: 0.65, tongue: 0.78 };
    case 'E': // Rounded OH
      return { open: 0.64, width: 0.74, round: 0.76, teeth: 0.25, tongue: 0.3 };
    case 'F': // Tight rounded OO, W
      return { open: 0.38, width: 0.6, round: 0.95, teeth: 0.1, tongue: 0 };
    case 'G': // F / V labiodental
      return { open: 0.2, width: 1.02, round: 0, teeth: 0.9, tongue: 0 };
    case 'H': // L dental
      return { open: 0.46, width: 0.98, round: 0.1, teeth: 0.65, tongue: 0.88 };
    case 'X':
    default:
      return { open: 0, width: 1.0, round: 0, teeth: 0, tongue: 0 };
  }
}
