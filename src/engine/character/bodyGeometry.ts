/**
 * Parametric Body Metrics & Color Utilities
 * Computes consistent local proportions & attachment coordinates without breaking joint alignment.
 */

import { BodyConfig, HeadShape } from '../../schemas/character.schema';

export interface BodyMetrics {
  scale: number;
  headRx: number;
  headRy: number;
  headCenterY: number; // relative to head pivot (base of head)
  headShape: HeadShape;
  neckLen: number;
  neckWidth: number;
  torsoLen: number;
  shoulderHalfW: number;
  waistHalfW: number;
  hipHalfW: number;
  pelvisHeight: number;
  upperArmLen: number;
  forearmLen: number;
  upperArmW: number;
  forearmW: number;
  handScale: number;
  thighLen: number;
  shinLen: number;
  thighW: number;
  shinW: number;
  footLen: number;
  footHeight: number;
  restPelvisY: number; // negative Y above ground (y=0)
  outlineWidth: number;
  skinColor: string;
  skinShadow: string;
  skinHighlight: string;
  outlineColor: string;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function shadeHex(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  if (factor < 0) {
    const t = 1 + factor;
    return rgbToHex(r * t, g * t, b * t);
  }
  return rgbToHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor);
}

export function computeBodyMetrics(body: BodyConfig): BodyMetrics {
  const hScale = clamp(body.height, 0.7, 1.35);
  const headScale = clamp(body.headSize, 0.7, 1.4);
  const shScale = clamp(body.shoulderWidth, 0.7, 1.4);
  const torsoScale = clamp(body.torsoLength, 0.7, 1.35);
  const armScale = clamp(body.armLength, 0.7, 1.35);
  const legScale = clamp(body.legLength, 0.7, 1.4);
  const thick = clamp(body.bodyThickness, 0.6, 1.55);
  const limbThick = clamp(body.limbThickness, 0.6, 1.5);
  const neckThick = clamp(body.neckThickness, 0.65, 1.45);

  const headRx = 42 * headScale * (0.95 + 0.05 * thick);
  const headRy = 47 * headScale;
  const headCenterY = -headRy + 4;

  const neckLen = 15 * hScale;
  const neckWidth = 14 * neckThick;

  const torsoLen = 96 * hScale * torsoScale;
  const shoulderHalfW = 28 * shScale * (0.85 + 0.15 * thick);
  const waistHalfW = 18 * thick;
  const hipHalfW = 15 * (0.88 + 0.12 * thick);
  const pelvisHeight = 18 * hScale;

  const upperArmLen = 52 * hScale * armScale;
  const forearmLen = 48 * hScale * armScale;
  const upperArmW = 10.5 * limbThick;
  const forearmW = 8.5 * limbThick;

  const thighLen = 62 * hScale * legScale;
  const shinLen = 60 * hScale * legScale;
  const thighW = 13.5 * limbThick;
  const shinW = 10.2 * limbThick;

  const footLen = 28 * clamp(body.footSize, 0.7, 1.45);
  const footHeight = 11 * clamp(body.footSize, 0.7, 1.45);

  const restPelvisY = -(thighLen + shinLen + footHeight * 0.55);

  return {
    scale: hScale,
    headRx,
    headRy,
    headCenterY,
    headShape: body.headShape,
    neckLen,
    neckWidth,
    torsoLen,
    shoulderHalfW,
    waistHalfW,
    hipHalfW,
    pelvisHeight,
    upperArmLen,
    forearmLen,
    upperArmW,
    forearmW,
    handScale: clamp(body.handSize, 0.7, 1.45),
    thighLen,
    shinLen,
    thighW,
    shinW,
    footLen,
    footHeight,
    restPelvisY,
    outlineWidth: clamp(body.outlineWidth, 0.75, 4.0),
    skinColor: body.skinColor,
    skinShadow: shadeHex(body.skinColor, -0.14),
    skinHighlight: shadeHex(body.skinColor, 0.12),
    outlineColor: body.outlineColor,
  };
}

/**
 * Generates an expressive procedural SVG path for the head silhouette according to HeadShape.
 */
export function getHeadPath(rx: number, ry: number, cy: number, shape: HeadShape): string {
  const top = cy - ry;
  const bottom = cy + ry;
  switch (shape) {
    case 'round':
      return `M 0 ${top} C ${rx * 1.15} ${top}, ${rx * 1.15} ${bottom}, 0 ${bottom} C ${-rx * 1.15} ${bottom}, ${-rx * 1.15} ${top}, 0 ${top} Z`;
    case 'square':
      return `M 0 ${top} C ${rx * 0.9} ${top}, ${rx * 1.05} ${top + ry * 0.25}, ${rx * 1.02} ${cy + ry * 0.35} C ${rx * 0.98} ${bottom - ry * 0.12}, ${rx * 0.68} ${bottom}, 0 ${bottom} C ${-rx * 0.68} ${bottom}, ${-rx * 0.98} ${bottom - ry * 0.12}, ${-rx * 1.02} ${cy + ry * 0.35} C ${-rx * 1.05} ${top + ry * 0.25}, ${-rx * 0.9} ${top}, 0 ${top} Z`;
    case 'pear':
      return `M 0 ${top} C ${rx * 0.78} ${top}, ${rx * 0.92} ${cy - ry * 0.1}, ${rx * 1.08} ${cy + ry * 0.42} C ${rx * 1.14} ${bottom - ry * 0.08}, ${rx * 0.62} ${bottom}, 0 ${bottom} C ${-rx * 0.62} ${bottom}, ${-rx * 1.14} ${bottom - ry * 0.08}, ${-rx * 1.08} ${cy + ry * 0.42} C ${-rx * 0.92} ${cy - ry * 0.1}, ${-rx * 0.78} ${top}, 0 ${top} Z`;
    case 'chiseled':
      return `M 0 ${top} C ${rx * 0.92} ${top}, ${rx * 1.05} ${cy - ry * 0.2}, ${rx * 0.96} ${cy + ry * 0.3} L ${rx * 0.46} ${bottom - 3} Q 0 ${bottom + 2} ${-rx * 0.46} ${bottom - 3} L ${-rx * 0.96} ${cy + ry * 0.3} C ${-rx * 1.05} ${cy - ry * 0.2}, ${-rx * 0.92} ${top}, 0 ${top} Z`;
    case 'oval':
    default:
      return `M 0 ${top} C ${rx * 0.98} ${top}, ${rx * 1.06} ${cy - ry * 0.15}, ${rx * 0.98} ${cy + ry * 0.32} C ${rx * 0.88} ${bottom - ry * 0.08}, ${rx * 0.48} ${bottom}, 0 ${bottom} C ${-rx * 0.48} ${bottom}, ${-rx * 0.88} ${bottom - ry * 0.08}, ${-rx * 0.98} ${cy + ry * 0.32} C ${-rx * 1.06} ${cy - ry * 0.15}, ${-rx * 0.98} ${top}, 0 ${top} Z`;
  }
}
