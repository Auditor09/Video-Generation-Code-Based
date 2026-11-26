/**
 * Procedural SVG Wardrobe Catalog (Segmented Upper Body, Segmented Lower Body, Footwear)
 * All sleeves and trouser legs are segmented at elbows/knees so joints bend cleanly without stretching.
 */

import React from 'react';
import { BodyMetrics, shadeHex } from '../engine/character/bodyGeometry';
import { AssetColorTokens, AssetDefinition } from './types';

export const UPPER_BODY_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'Bare Torso', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#E2E8F0', secondary: '#CBD5E1', highlight: '#F8FAFC' } },
  { id: 'tshirt', name: 'Crew T-Shirt', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#2563EB', secondary: '#1D4ED8', highlight: '#60A5FA' } },
  { id: 'polo', name: 'Polo Shirt', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#0F766E', secondary: '#115E59', highlight: '#2DD4BF' } },
  { id: 'formal_shirt', name: 'Dress Shirt', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#F8FAFC', secondary: '#E2E8F0', highlight: '#FFFFFF' } },
  { id: 'hoodie', name: 'Pullover Hoodie', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#1E293B', secondary: '#0F172A', highlight: '#38BDF8' }, hasBackLayer: true },
  { id: 'leather_jacket', name: 'Leather Jacket', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#1C1917', secondary: '#292524', highlight: '#78716C' } },
  { id: 'denim_jacket', name: 'Denim Jacket', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#3B6EA5', secondary: '#29507A', highlight: '#93C5FD' } },
  { id: 'blazer_suit', name: 'Tailored Blazer', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#334155', secondary: '#1E293B', highlight: '#F8FAFC' } },
  { id: 'lab_coat', name: 'Scientist Lab Coat', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#F8FAFC', secondary: '#CBD5E1', highlight: '#0EA5E9' }, physics: { enabled: true, stiffness: 0.5, damping: 0.8 } },
  { id: 'police_uniform_001', name: 'Police Uniform', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#1E3A5F', secondary: '#142842', highlight: '#FBBF24' } },
  { id: 'sports_jersey', name: 'Athletic Jersey', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#DC2626', secondary: '#991B1B', highlight: '#F8FAFC' } },
  { id: 'tactical_vest', name: 'Tactical Armor Vest', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#3F4A3C', secondary: '#272E25', highlight: '#657360' } },
  { id: 'raincoat', name: 'Detective Trench Coat', category: 'upperBody', attachment: 'torso', layer: 'clothing_upper', defaultColors: { main: '#786B59', secondary: '#574C3F', highlight: '#A89780' }, physics: { enabled: true, stiffness: 0.5, damping: 0.8 } },
];

export const LOWER_BODY_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'Base Shorts', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#475569', secondary: '#334155', highlight: '#94A3B8' } },
  { id: 'jeans', name: 'Classic Jeans', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#2E588C', secondary: '#1E3D63', highlight: '#60A5FA' } },
  { id: 'police_trousers_001', name: 'Police Trousers', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#17253B', secondary: '#0F1826', highlight: '#3B82F6' } },
  { id: 'formal_trousers', name: 'Formal Slacks', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#27303F', secondary: '#1B222E', highlight: '#475569' } },
  { id: 'cargo_pants', name: 'Cargo Pants', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#57534E', secondary: '#44403C', highlight: '#78716C' } },
  { id: 'shorts', name: 'Chino Shorts', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#B48A5A', secondary: '#8F6A40', highlight: '#D6B489' } },
  { id: 'joggers', name: 'Athletic Joggers', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#334155', secondary: '#1E293B', highlight: '#F8FAFC' } },
  { id: 'skirt', name: 'Pleated Skirt', category: 'lowerBody', attachment: 'pelvis', layer: 'clothing_lower', defaultColors: { main: '#312E81', secondary: '#1E1B4B', highlight: '#6366F1' } },
];

export const FOOTWEAR_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'Barefoot', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#E2E8F0', secondary: '#CBD5E1', highlight: '#FFFFFF' } },
  { id: 'sneakers', name: 'Street Sneakers', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#DC2626', secondary: '#F8FAFC', highlight: '#1E293B' } },
  { id: 'running_shoes', name: 'Running Trainers', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#0284C7', secondary: '#F8FAFC', highlight: '#38BDF8' } },
  { id: 'formal_shoes', name: 'Oxford Dress Shoes', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#1C1917', secondary: '#44403C', highlight: '#78716C' } },
  { id: 'black_boots_001', name: 'Patrol Boots', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#18181B', secondary: '#27272A', highlight: '#52525B' } },
  { id: 'combat_boots', name: 'Tactical Combat Boots', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#292524', secondary: '#1C1917', highlight: '#78716C' } },
  { id: 'sandals', name: 'Strapped Sandals', category: 'footwear', attachment: 'footL', layer: 'footwear', defaultColors: { main: '#78350F', secondary: '#451A03', highlight: '#B45309' } },
];

export function hasLongSleeves(upperId: string): boolean {
  return !['none', 'tshirt', 'polo', 'sports_jersey', 'tactical_vest'].includes(upperId);
}

export function hasShortSleeves(upperId: string): boolean {
  return ['tshirt', 'polo', 'sports_jersey'].includes(upperId);
}

export function renderUpperBodyBack(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens,
  clothSwing = 0
): React.ReactNode {
  if (id === 'hoodie') {
    const sw = metrics.shoulderHalfW;
    const oc = metrics.outlineColor;
    const ow = metrics.outlineWidth;
    return (
      <g transform={`translate(0, ${-metrics.torsoLen})`}>
        <path
          d={`M ${-sw * 0.72} 8 Q ${-sw * 0.85} -16 0 -18 Q ${sw * 0.85} -16 ${sw * 0.72} 8 Z`}
          fill={colors.secondary}
          stroke={oc}
          strokeWidth={ow}
        />
      </g>
    );
  }
  if (id === 'lab_coat' || id === 'raincoat') {
    const ww = metrics.waistHalfW + 8;
    const oc = metrics.outlineColor;
    const ow = metrics.outlineWidth;
    return (
      <g transform={`rotate(${clothSwing * 0.4})`}>
        <path
          d={`M ${-ww * 0.95} -12 L ${-ww * 1.15} 52 Q 0 58 ${ww * 1.15} 52 L ${ww * 0.95} -12 Z`}
          fill={shadeHex(colors.main, -0.1)}
          stroke={oc}
          strokeWidth={ow}
          strokeLinejoin="round"
        />
      </g>
    );
  }
  return null;
}

export function renderUpperBodyTorso(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens,
  clothSwing = 0
): React.ReactNode {
  if (!id || id === 'none') return null;

  const tLen = metrics.torsoLen;
  const sw = metrics.shoulderHalfW + 3;
  const ww = metrics.waistHalfW + 3.5;
  const hw = metrics.hipHalfW + 3;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const topY = -tLen;

  const baseTorsoPath = `M ${-sw} ${topY + 4} Q 0 ${topY - 4} ${sw} ${topY + 4} Q ${ww + 3} ${topY * 0.42} ${hw} 4 Q 0 11 ${-hw} 4 Q ${-ww - 3} ${topY * 0.42} ${-sw} ${topY + 4} Z`;

  return (
    <g>
      {/* Main Torso Garment Shell */}
      <path d={baseTorsoPath} fill={colors.main} stroke={oc} strokeWidth={ow} strokeLinejoin="round" />

      {/* Style-specific tailored detailing */}
      {id === 'tshirt' && (
        <path
          d={`M ${-sw * 0.36} ${topY + 1} Q 0 ${topY + 14} ${sw * 0.36} ${topY + 1}`}
          fill="none"
          stroke={colors.secondary}
          strokeWidth={ow * 1.35}
          strokeLinecap="round"
        />
      )}

      {id === 'polo' && (
        <g>
          <polygon points={`${-sw * 0.34},${topY + 1} 0,${topY + 14} ${-sw * 0.14},${topY + 16}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <polygon points={`${sw * 0.34},${topY + 1} 0,${topY + 14} ${sw * 0.14},${topY + 16}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <line x1={0} y1={topY + 14} x2={0} y2={topY + 32} stroke={oc} strokeWidth={ow * 0.8} />
        </g>
      )}

      {id === 'formal_shirt' && (
        <g>
          <polygon points={`${-sw * 0.32},${topY + 1} 0,${topY + 13} ${-sw * 0.16},${topY + 16}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <polygon points={`${sw * 0.32},${topY + 1} 0,${topY + 13} ${sw * 0.16},${topY + 16}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <line x1={0} y1={topY + 13} x2={0} y2={4} stroke={colors.secondary} strokeWidth={ow * 0.9} />
          {[0.32, 0.54, 0.76].map((f, i) => (
            <circle key={i} cx={0} cy={topY * (1 - f)} r={1.8} fill={oc} />
          ))}
        </g>
      )}

      {id === 'hoodie' && (
        <g>
          {/* Front pocket */}
          <path
            d={`M ${-ww * 0.65} ${-26} L ${ww * 0.65} ${-26} L ${ww * 0.8} -4 L ${-ww * 0.8} -4 Z`}
            fill={colors.secondary}
            stroke={oc}
            strokeWidth={ow * 0.8}
            strokeLinejoin="round"
          />
          {/* Drawstrings */}
          <path d={`M -6 ${topY + 8} Q -7 ${topY + 26} -5 ${topY + 38}`} fill="none" stroke={colors.highlight} strokeWidth={2.2} strokeLinecap="round" />
          <path d={`M 6 ${topY + 8} Q 7 ${topY + 26} 5 ${topY + 38}`} fill="none" stroke={colors.highlight} strokeWidth={2.2} strokeLinecap="round" />
          {/* Ribbed hem */}
          <rect x={-hw} y={-2} width={hw * 2} height={8} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
        </g>
      )}

      {id === 'leather_jacket' && (
        <g>
          {/* Inner tee V */}
          <polygon points={`${-sw * 0.32},${topY + 1} ${sw * 0.32},${topY + 1} 0,${topY + 46}`} fill="#E2E8F0" stroke={oc} strokeWidth={ow * 0.8} />
          {/* Asymmetric zip & lapels */}
          <polygon points={`${-sw * 0.34},${topY + 2} ${-sw * 0.54},${topY + 24} ${-sw * 0.22},${topY + 36}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <polygon points={`${sw * 0.34},${topY + 2} ${sw * 0.54},${topY + 24} ${sw * 0.22},${topY + 36}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <line x1={4} y1={topY + 36} x2={4} y2={4} stroke={colors.highlight} strokeWidth={2.2} />
        </g>
      )}

      {id === 'denim_jacket' && (
        <g>
          <line x1={0} y1={topY + 10} x2={0} y2={4} stroke={oc} strokeWidth={ow * 0.85} />
          <rect x={-sw * 0.62} y={topY + 26} width={14} height={15} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <rect x={sw * 0.62 - 14} y={topY + 26} width={14} height={15} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
        </g>
      )}

      {id === 'blazer_suit' && (
        <g>
          <polygon points={`${-sw * 0.32},${topY + 1} ${sw * 0.32},${topY + 1} 0,${topY + 52}`} fill={colors.highlight} stroke={oc} strokeWidth={ow * 0.75} />
          <polygon points={`${-sw * 0.34},${topY + 1} ${-sw * 0.52},${topY + 28} 0,${topY + 52}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <polygon points={`${sw * 0.34},${topY + 1} ${sw * 0.52},${topY + 28} 0,${topY + 52}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <circle cx={0} cy={topY + 62} r={2.2} fill={oc} />
        </g>
      )}

      {id === 'lab_coat' && (
        <g transform={`rotate(${clothSwing * 0.15})`}>
          <polygon points={`${-sw * 0.26},${topY + 1} ${sw * 0.26},${topY + 1} 0,${topY + 48}`} fill={colors.highlight} opacity={0.35} stroke={oc} strokeWidth={ow * 0.7} />
          <line x1={0} y1={topY + 46} x2={0} y2={16} stroke={oc} strokeWidth={ow * 0.8} />
          <rect x={sw * 0.28} y={topY + 26} width={14} height={16} rx={1.5} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.65} />
          {/* Pocket pen */}
          <line x1={sw * 0.36} y1={topY + 20} x2={sw * 0.36} y2={topY + 28} stroke="#2563EB" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      )}

      {id === 'police_uniform_001' && (
        <g>
          {/* Collar */}
          <polygon points={`${-sw * 0.34},${topY + 1} 0,${topY + 14} ${-sw * 0.15},${topY + 17}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.75} />
          <polygon points={`${sw * 0.34},${topY + 1} 0,${topY + 14} ${sw * 0.15},${topY + 17}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.75} />
          {/* Tie */}
          <polygon points={`-3,${topY + 13} 3,${topY + 13} 4,${topY + 52} 0,${topY + 58} -4,${topY + 52}`} fill="#0F172A" stroke={oc} strokeWidth={1.1} />
          {/* Button placket */}
          <line x1={0} y1={topY + 58} x2={0} y2={4} stroke={oc} strokeWidth={ow * 0.65} />
          {/* Shoulder epaulettes */}
          <rect x={-sw + 2} y={topY + 1} width={14} height={5} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <rect x={sw - 16} y={topY + 1} width={14} height={5} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          {/* Breast pockets */}
          <rect x={-sw * 0.68} y={topY + 28} width={14} height={15} rx={1.5} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          <rect x={sw * 0.68 - 14} y={topY + 28} width={14} height={15} rx={1.5} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
          {/* Gold Shield Badge */}
          <path
            d={`M ${-sw * 0.48} ${topY + 17} L ${-sw * 0.32} ${topY + 17} L ${-sw * 0.3} ${topY + 25} Q ${-sw * 0.4} ${topY + 30} ${-sw * 0.5} ${topY + 25} Z`}
            fill={colors.highlight}
            stroke={oc}
            strokeWidth={1.2}
          />
        </g>
      )}

      {id === 'sports_jersey' && (
        <g>
          <path d={`M ${-sw * 0.36} ${topY + 1} Q 0 ${topY + 14} ${sw * 0.36} ${topY + 1}`} fill="none" stroke={colors.highlight} strokeWidth={3.2} />
          <text x={0} y={topY + 48} textAnchor="middle" fontSize={18} fontWeight="bold" fill={colors.highlight} fontFamily="Plus Jakarta Sans, sans-serif">
            07
          </text>
        </g>
      )}

      {id === 'tactical_vest' && (
        <g>
          <rect x={-ww * 0.85} y={topY + 14} width={ww * 1.7} height={tLen * 0.76} rx={5} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.9} />
          {/* MOLLE pouches */}
          <rect x={-ww * 0.7} y={-24} width={14} height={14} rx={2} fill={colors.highlight} stroke={oc} strokeWidth={1.3} />
          <rect x={ww * 0.7 - 14} y={-24} width={14} height={14} rx={2} fill={colors.highlight} stroke={oc} strokeWidth={1.3} />
          <line x1={-ww * 0.65} y1={topY + 34} x2={ww * 0.65} y2={topY + 34} stroke={oc} strokeWidth={2} />
        </g>
      )}

      {id === 'raincoat' && (
        <g>
          <polygon points={`${-sw * 0.42},${topY + 1} ${sw * 0.42},${topY + 1} 0,${topY + 42}`} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <line x1={0} y1={topY + 40} x2={0} y2={16} stroke={oc} strokeWidth={ow * 0.8} />
          <rect x={-ww - 2} y={-16} width={(ww + 2) * 2} height={7} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <rect x={-4} y={-17} width={8} height={9} rx={1} fill={colors.highlight} stroke={oc} strokeWidth={1.2} />
        </g>
      )}
    </g>
  );
}

export function renderSleeveUpperArm(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none' || id === 'tactical_vest') return null;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const w = metrics.upperArmW + 2.8;
  const isShort = hasShortSleeves(id);
  const len = isShort ? metrics.upperArmLen * 0.52 : metrics.upperArmLen + 2;

  return (
    <g>
      <path
        d={`M ${-w} 0 Q 0 -6 ${w} 0 L ${w * 0.92} ${len} Q 0 ${len + 3} ${-w * 0.92} ${len} Z`}
        fill={colors.main}
        stroke={oc}
        strokeWidth={ow * 0.92}
        strokeLinejoin="round"
      />
      {id === 'sports_jersey' && (
        <line x1={-w * 0.92} y1={len - 2} x2={w * 0.92} y2={len - 2} stroke={colors.highlight} strokeWidth={2.5} />
      )}
    </g>
  );
}

export function renderSleeveForearm(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!hasLongSleeves(id)) return null;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const wTop = metrics.upperArmW * 0.92 + 2.2;
  const wBot = metrics.forearmW + 2.5;
  const len = metrics.forearmLen - 2;

  return (
    <g>
      <path
        d={`M ${-wTop} -1 Q 0 -4 ${wTop} -1 L ${wBot} ${len} Q 0 ${len + 2} ${-wBot} ${len} Z`}
        fill={colors.main}
        stroke={oc}
        strokeWidth={ow * 0.92}
        strokeLinejoin="round"
      />
      {/* Cuff detail */}
      <rect
        x={-wBot - 0.5}
        y={len - 6}
        width={(wBot + 0.5) * 2}
        height={6}
        rx={1.5}
        fill={colors.secondary}
        stroke={oc}
        strokeWidth={ow * 0.72}
      />
    </g>
  );
}

export function renderLowerBodyPelvis(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens,
  clothSwing = 0
): React.ReactNode {
  if (!id || id === 'none') return null;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const hw = metrics.hipHalfW + 5;
  const ph = metrics.pelvisHeight;

  if (id === 'skirt') {
    return (
      <g transform={`rotate(${clothSwing * 0.25})`}>
        <path
          d={`M ${-hw * 0.95} -2 L ${hw * 0.95} -2 L ${hw * 1.55} ${ph * 2.4} Q 0 ${ph * 2.65} ${-hw * 1.55} ${ph * 2.4} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
          strokeLinejoin="round"
        />
        <line x1={-hw * 0.4} y1={2} x2={-hw * 0.65} y2={ph * 2.35} stroke={colors.secondary} strokeWidth={1.6} />
        <line x1={hw * 0.4} y1={2} x2={hw * 0.65} y2={ph * 2.35} stroke={colors.secondary} strokeWidth={1.6} />
      </g>
    );
  }

  return (
    <g>
      <path
        d={`M ${-hw} -2 L ${hw} -2 L ${hw * 1.04} ${ph} Q 0 ${ph + 4} ${-hw * 1.04} ${ph} Z`}
        fill={colors.main}
        stroke={oc}
        strokeWidth={ow}
        strokeLinejoin="round"
      />
      {/* Waistband / Fly */}
      <line x1={0} y1={0} x2={0} y2={ph * 0.72} stroke={colors.secondary} strokeWidth={ow * 0.7} />
    </g>
  );
}

export function renderTrouserThigh(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none' || id === 'skirt') return null;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const wTop = metrics.thighW + 3.2;
  const wBot = metrics.thighW * 0.85 + 2.8;
  const len = id === 'shorts' ? metrics.thighLen * 0.68 : metrics.thighLen + 2;

  return (
    <g>
      <path
        d={`M ${-wTop} -2 Q 0 -5 ${wTop} -2 L ${wBot} ${len} Q 0 ${len + 3} ${-wBot} ${len} Z`}
        fill={colors.main}
        stroke={oc}
        strokeWidth={ow * 0.92}
        strokeLinejoin="round"
      />
      {id === 'cargo_pants' && (
        <rect x={-wTop + 1} y={len * 0.42} width={wTop * 1.35} height={16} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
      )}
      {id === 'police_trousers_001' && (
        <line x1={0} y1={2} x2={0} y2={len} stroke={colors.highlight} strokeWidth={2.2} opacity={0.75} />
      )}
    </g>
  );
}

export function renderTrouserShin(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none' || id === 'shorts' || id === 'skirt') return null;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const wTop = metrics.thighW * 0.85 + 2.5;
  const wBot = metrics.shinW + 2.5;
  const len = metrics.shinLen - 3;

  return (
    <g>
      <path
        d={`M ${-wTop} -2 Q 0 -5 ${wTop} -2 L ${wBot} ${len} Q 0 ${len + 2} ${-wBot} ${len} Z`}
        fill={colors.main}
        stroke={oc}
        strokeWidth={ow * 0.92}
        strokeLinejoin="round"
      />
      {id === 'joggers' && (
        <rect x={-wBot - 0.5} y={len - 7} width={(wBot + 0.5) * 2} height={7} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.75} />
      )}
      {id === 'police_trousers_001' && (
        <line x1={0} y1={0} x2={0} y2={len - 2} stroke={colors.highlight} strokeWidth={2.2} opacity={0.75} />
      )}
    </g>
  );
}

export function renderFootwear(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const fl = metrics.footLen;
  const fh = metrics.footHeight;

  if (!id || id === 'none') {
    return (
      <path
        d={`M ${-fl * 0.25} -2 L ${fl * 0.68} ${fh * 0.35} Q ${fl * 0.75} ${fh} ${fl * 0.45} ${fh} L ${-fl * 0.28} ${fh} Q ${-fl * 0.36} ${fh * 0.4} ${-fl * 0.25} -2 Z`}
        fill={metrics.skinColor}
        stroke={oc}
        strokeWidth={ow * 0.9}
        strokeLinejoin="round"
      />
    );
  }

  if (id === 'sandals') {
    return (
      <g>
        <path
          d={`M ${-fl * 0.25} -2 L ${fl * 0.68} ${fh * 0.35} Q ${fl * 0.75} ${fh} ${fl * 0.45} ${fh} L ${-fl * 0.28} ${fh} Q ${-fl * 0.36} ${fh * 0.4} ${-fl * 0.25} -2 Z`}
          fill={metrics.skinColor}
          stroke={oc}
          strokeWidth={ow * 0.85}
        />
        <rect x={-fl * 0.3} y={fh * 0.72} width={fl * 1.05} height={4.5} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.7} />
        <path d={`M ${fl * 0.05} 1 L ${fl * 0.35} ${fh * 0.72}`} stroke={colors.main} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  }

  const isBoot = id === 'black_boots_001' || id === 'combat_boots';
  const cuffTop = isBoot ? -14 : -3;

  return (
    <g>
      <path
        d={`M ${-fl * 0.28} ${cuffTop} L ${fl * 0.22} ${cuffTop} L ${fl * 0.3} 1 L ${fl * 0.74} ${fh * 0.35} Q ${fl * 0.82} ${fh} ${fl * 0.55} ${fh} L ${-fl * 0.3} ${fh} Z`}
        fill={colors.main}
        stroke={oc}
        strokeWidth={ow * 0.92}
        strokeLinejoin="round"
      />
      {/* Sole */}
      <rect
        x={-fl * 0.31}
        y={fh * 0.7}
        width={fl * 1.12}
        height={fh * 0.36}
        rx={2}
        fill={id === 'sneakers' || id === 'running_shoes' ? colors.secondary : colors.secondary}
        stroke={oc}
        strokeWidth={ow * 0.75}
      />
      {/* Laces / Toe cap */}
      {(id === 'sneakers' || id === 'running_shoes') && (
        <path
          d={`M ${fl * 0.25} 1 L ${fl * 0.36} 3 M ${fl * 0.35} 3 L ${fl * 0.46} 5`}
          stroke={colors.secondary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}
