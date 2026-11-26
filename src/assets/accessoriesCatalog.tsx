/**
 * Procedural SVG Headwear, Eyewear, Piercings, Tattoos, Accessories & Props Catalog
 */

import React from 'react';
import { BodyMetrics } from '../engine/character/bodyGeometry';
import { TattooAttachment } from '../schemas/character.schema';
import { AssetColorTokens, AssetDefinition } from './types';

export const HEADWEAR_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'No Headwear', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#1E293B', secondary: '#0F172A', highlight: '#FBBF24' } },
  { id: 'baseball_cap', name: 'Baseball Cap', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#DC2626', secondary: '#991B1B', highlight: '#F8FAFC' } },
  { id: 'beanie', name: 'Knit Beanie', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#D97706', secondary: '#B45309', highlight: '#FCD34D' } },
  { id: 'police_cap_001', name: 'Police Peak Cap', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#1E3A5F', secondary: '#0F172A', highlight: '#FBBF24' } },
  { id: 'cowboy_hat', name: 'Cowboy Hat', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#78350F', secondary: '#451A03', highlight: '#D97706' }, hasBackLayer: true },
  { id: 'fedora', name: 'Detective Fedora', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#44403C', secondary: '#1C1917', highlight: '#78716C' }, hasBackLayer: true },
  { id: 'top_hat', name: 'Formal Top Hat', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#18181B', secondary: '#991B1B', highlight: '#3F3F46' } },
  { id: 'crown', name: 'Royal Crown', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#F59E0B', secondary: '#B45309', highlight: '#EF4444' } },
  { id: 'hard_hat', name: 'Safety Hard Hat', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#EAB308', secondary: '#CA8A04', highlight: '#FEF08A' } },
  { id: 'headphones_head', name: 'Studio Headphones', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#1E293B', secondary: '#38BDF8', highlight: '#94A3B8' } },
  { id: 'headband', name: 'Athletic Headband', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#EF4444', secondary: '#F8FAFC', highlight: '#B91C1C' } },
  { id: 'gas_mask', name: 'Respirator Gas Mask', category: 'headwear', attachment: 'head', layer: 'headwear_front', defaultColors: { main: '#27272A', secondary: '#52525B', highlight: '#38BDF8' } },
];

export const EYEWEAR_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'No Eyewear', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#18181B', secondary: '#93C5FD', highlight: '#FFFFFF' } },
  { id: 'round_glasses', name: 'Round Spectacles', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#1E293B', secondary: '#BAE6FD', highlight: '#FFFFFF' } },
  { id: 'square_glasses', name: 'Square Frames', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#18181B', secondary: '#BAE6FD', highlight: '#FFFFFF' } },
  { id: 'sunglasses', name: 'Dark Sunglasses', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#0F172A', secondary: '#1E293B', highlight: '#38BDF8' } },
  { id: 'aviators', name: 'Gold Aviators', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#D97706', secondary: '#1E293B', highlight: '#FCD34D' } },
  { id: 'safety_goggles', name: 'Lab Safety Goggles', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#475569', secondary: '#7DD3FC', highlight: '#FFFFFF' } },
  { id: 'monocle', name: 'Brass Monocle', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#D97706', secondary: '#BAE6FD', highlight: '#FDE68A' } },
  { id: 'eyepatch', name: 'Tactical Eyepatch', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#18181B', secondary: '#3F3F46', highlight: '#71717A' } },
  { id: 'visor', name: 'Tech Visor', category: 'eyewear', attachment: 'head', layer: 'eyewear', defaultColors: { main: '#0EA5E9', secondary: '#0369A1', highlight: '#E0F2FE' } },
];

export const PIERCING_ASSETS: AssetDefinition[] = [
  { id: 'ear_stud', name: 'Silver Ear Stud', category: 'piercing', attachment: 'head', layer: 'piercing', defaultColors: { main: '#E2E8F0', secondary: '#94A3B8', highlight: '#FFFFFF' } },
  { id: 'ear_hoop', name: 'Gold Ear Hoop', category: 'piercing', attachment: 'head', layer: 'piercing', defaultColors: { main: '#F59E0B', secondary: '#B45309', highlight: '#FEF3C7' } },
  { id: 'nose_stud', name: 'Nose Stud', category: 'piercing', attachment: 'head', layer: 'piercing', defaultColors: { main: '#E2E8F0', secondary: '#94A3B8', highlight: '#FFFFFF' } },
  { id: 'septum_ring', name: 'Septum Ring', category: 'piercing', attachment: 'head', layer: 'piercing', defaultColors: { main: '#D4D4D8', secondary: '#71717A', highlight: '#FFFFFF' } },
  { id: 'eyebrow_ring', name: 'Eyebrow Ring', category: 'piercing', attachment: 'head', layer: 'piercing', defaultColors: { main: '#D4D4D8', secondary: '#71717A', highlight: '#FFFFFF' } },
  { id: 'lip_ring', name: 'Lip Ring', category: 'piercing', attachment: 'head', layer: 'piercing', defaultColors: { main: '#D4D4D8', secondary: '#71717A', highlight: '#FFFFFF' } },
];

export const TATTOO_ASSETS: AssetDefinition[] = [
  { id: 'tattoo_tribal_band', name: 'Tribal Band', category: 'tattoo', attachment: 'forearmL', layer: 'tattoo', defaultColors: { main: '#1F3A3D', secondary: '#0F172A', highlight: '#334155' } },
  { id: 'tattoo_lightning', name: 'Bolt Motif', category: 'tattoo', attachment: 'neck', layer: 'tattoo', defaultColors: { main: '#1F3A3D', secondary: '#0F172A', highlight: '#334155' } },
  { id: 'tattoo_star_cluster', name: 'Star Cluster', category: 'tattoo', attachment: 'forearmR', layer: 'tattoo', defaultColors: { main: '#1E293B', secondary: '#0F172A', highlight: '#334155' } },
  { id: 'tattoo_cyber_circuit', name: 'Circuit Trace', category: 'tattoo', attachment: 'upperArmL', layer: 'tattoo', defaultColors: { main: '#0F4C5C', secondary: '#0F172A', highlight: '#38BDF8' } },
  { id: 'tattoo_dagger_rose', name: 'Dagger Crest', category: 'tattoo', attachment: 'torso', layer: 'tattoo', defaultColors: { main: '#1F3A3D', secondary: '#7F1D1D', highlight: '#334155' } },
  { id: 'tattoo_tear_drop', name: 'Teardrop Ink', category: 'tattoo', attachment: 'head', layer: 'tattoo', defaultColors: { main: '#1E293B', secondary: '#0F172A', highlight: '#334155' } },
];

export const ACCESSORY_ASSETS: AssetDefinition[] = [
  { id: 'watch_001', name: 'Field Watch', category: 'accessory', attachment: 'forearmL', layer: 'accessory', defaultColors: { main: '#1E293B', secondary: '#94A3B8', highlight: '#F8FAFC' } },
  { id: 'radio_001', name: 'Shoulder Radio', category: 'accessory', attachment: 'torso', layer: 'accessory', defaultColors: { main: '#18181B', secondary: '#3F3F46', highlight: '#22C55E' } },
  { id: 'necktie', name: 'Classic Necktie', category: 'accessory', attachment: 'torso', layer: 'accessory', defaultColors: { main: '#B91C1C', secondary: '#7F1D1D', highlight: '#F87171' } },
  { id: 'bow_tie', name: 'Formal Bow Tie', category: 'accessory', attachment: 'torso', layer: 'accessory', defaultColors: { main: '#991B1B', secondary: '#450A0A', highlight: '#EF4444' } },
  { id: 'gold_chain', name: 'Cuban Link Chain', category: 'accessory', attachment: 'torso', layer: 'accessory', defaultColors: { main: '#F59E0B', secondary: '#B45309', highlight: '#FEF08A' } },
  { id: 'scarf', name: 'Winter Scarf', category: 'accessory', attachment: 'torso', layer: 'accessory', defaultColors: { main: '#0369A1', secondary: '#0C4A6E', highlight: '#7DD3FC' }, physics: { enabled: true, stiffness: 0.5, damping: 0.75 } },
  { id: 'backpack', name: 'Canvas Backpack', category: 'accessory', attachment: 'torso', layer: 'behind_body', defaultColors: { main: '#334155', secondary: '#1E293B', highlight: '#F59E0B' } },
  { id: 'belt_utility', name: 'Utility Belt', category: 'accessory', attachment: 'pelvis', layer: 'accessory', defaultColors: { main: '#1C1917', secondary: '#292524', highlight: '#D4D4D8' } },
  { id: 'gloves', name: 'Fingerless / Work Gloves', category: 'accessory', attachment: 'handL', layer: 'accessory', defaultColors: { main: '#1E293B', secondary: '#334155', highlight: '#64748B' } },
];

export const PROP_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'Empty Hand', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#334155', secondary: '#0F172A', highlight: '#38BDF8' } },
  { id: 'smartphone', name: 'Smartphone', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#1E293B', secondary: '#0F172A', highlight: '#38BDF8' } },
  { id: 'microphone', name: 'Stage Microphone', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#334155', secondary: '#94A3B8', highlight: '#F8FAFC' } },
  { id: 'flashlight', name: 'Tactical Flashlight', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#18181B', secondary: '#52525B', highlight: '#FEF08A' } },
  { id: 'coffee_cup', name: 'Takeaway Coffee', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#F8FAFC', secondary: '#92400E', highlight: '#1E293B' } },
  { id: 'clipboard', name: 'Lab Clipboard', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#92400E', secondary: '#F8FAFC', highlight: '#3B82F6' } },
  { id: 'wrench', name: 'Steel Wrench', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#94A3B8', secondary: '#475569', highlight: '#F8FAFC' } },
  { id: 'megaphone', name: 'Megaphone', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#DC2626', secondary: '#F8FAFC', highlight: '#1E293B' } },
  { id: 'defusal_pliers', name: 'Wire Cutters', category: 'prop', attachment: 'handR', layer: 'prop', defaultColors: { main: '#DC2626', secondary: '#64748B', highlight: '#F8FAFC' } },
];

export function renderHeadwearBack(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;

  if (id === 'cowboy_hat' || id === 'fedora') {
    return (
      <ellipse
        cx={0}
        cy={cy - ry * 0.52}
        rx={rx * 1.58}
        ry={10}
        fill={colors.secondary}
        stroke={oc}
        strokeWidth={ow}
      />
    );
  }
  return null;
}

export function renderHeadwearFront(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none') return null;

  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const top = cy - ry;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;

  switch (id) {
    case 'baseball_cap':
      return (
        <g>
          <path
            d={`M ${-rx * 1.02} ${cy - ry * 0.4} C ${-rx * 1.05} ${top - 18}, ${rx * 1.05} ${top - 18}, ${rx * 1.02} ${cy - ry * 0.4} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
          />
          <path
            d={`M ${-rx * 0.9} ${cy - ry * 0.42} Q ${rx * 0.35} ${cy - ry * 0.56} ${rx * 1.52} ${cy - ry * 0.25} Q ${rx * 0.9} ${cy - ry * 0.16} ${-rx * 0.2} ${cy - ry * 0.34} Z`}
            fill={colors.secondary}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={top - 12} r={3.5} fill={colors.highlight} stroke={oc} strokeWidth={1.2} />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path
            d={`M ${-rx * 1.04} ${cy - ry * 0.35} C ${-rx * 1.05} ${top - 22}, ${rx * 1.05} ${top - 22}, ${rx * 1.04} ${cy - ry * 0.35} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
          />
          <rect
            x={-rx * 1.07}
            y={cy - ry * 0.52}
            width={rx * 2.14}
            height={16}
            rx={6}
            fill={colors.secondary}
            stroke={oc}
            strokeWidth={ow}
          />
          <line x1={-rx * 0.4} y1={cy - ry * 0.52} x2={-rx * 0.4} y2={cy - ry * 0.52 + 16} stroke={oc} strokeWidth={1.4} opacity={0.45} />
          <line x1={0} y1={cy - ry * 0.52} x2={0} y2={cy - ry * 0.52 + 16} stroke={oc} strokeWidth={1.4} opacity={0.45} />
          <line x1={rx * 0.4} y1={cy - ry * 0.52} x2={rx * 0.4} y2={cy - ry * 0.52 + 16} stroke={oc} strokeWidth={1.4} opacity={0.45} />
        </g>
      );
    case 'police_cap_001':
      return (
        <g>
          <path
            d={`M ${-rx * 1.02} ${cy - ry * 0.46} L ${-rx * 1.18} ${top - 18} Q 0 ${top - 28} ${rx * 1.18} ${top - 18} L ${rx * 1.02} ${cy - ry * 0.46} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          {/* Cap Band */}
          <rect x={-rx * 1.03} y={cy - ry * 0.58} width={rx * 2.06} height={11} rx={2} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.85} />
          {/* Visor Peak */}
          <path
            d={`M ${-rx * 0.96} ${cy - ry * 0.45} Q 0 ${cy - ry * 0.12} ${rx * 0.96} ${cy - ry * 0.45} Q 0 ${cy - ry * 0.34} ${-rx * 0.96} ${cy - ry * 0.45} Z`}
            fill="#0F172A"
            stroke={oc}
            strokeWidth={ow * 0.85}
          />
          {/* Gold Shield Emblem */}
          <polygon points={`0,${top - 13} 7,${top - 6} 5,${top + 3} -5,${top + 3} -7,${top - 6}`} fill={colors.highlight} stroke={oc} strokeWidth={1.3} />
        </g>
      );
    case 'fedora':
      return (
        <g>
          <path
            d={`M ${-rx * 0.92} ${cy - ry * 0.48} L ${-rx * 0.68} ${top - 26} Q 0 ${top - 18} ${rx * 0.68} ${top - 26} L ${rx * 0.92} ${cy - ry * 0.48} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <rect x={-rx * 0.9} y={cy - ry * 0.6} width={rx * 1.8} height={9} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <path d={`M ${-rx * 1.48} ${cy - ry * 0.44} Q 0 ${cy - ry * 0.24} ${rx * 1.48} ${cy - ry * 0.44}`} fill="none" stroke={oc} strokeWidth={ow * 1.1} strokeLinecap="round" />
        </g>
      );
    case 'cowboy_hat':
      return (
        <g>
          <path
            d={`M ${-rx * 0.86} ${cy - ry * 0.48} C ${-rx * 0.72} ${top - 32}, ${-rx * 0.2} ${top - 18}, 0 ${top - 22} C ${rx * 0.2} ${top - 18}, ${rx * 0.72} ${top - 32}, ${rx * 0.86} ${cy - ry * 0.48} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
          />
          <rect x={-rx * 0.85} y={cy - ry * 0.58} width={rx * 1.7} height={7} fill={colors.highlight} stroke={oc} strokeWidth={1.3} />
          <path d={`M ${-rx * 1.6} ${cy - ry * 0.54} Q 0 ${cy - ry * 0.28} ${rx * 1.6} ${cy - ry * 0.54}`} fill="none" stroke={oc} strokeWidth={ow * 1.2} strokeLinecap="round" />
        </g>
      );
    case 'top_hat':
      return (
        <g>
          <rect x={-rx * 0.84} y={top - 48} width={rx * 1.68} height={64} rx={4} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <rect x={-rx * 0.84} y={top + 4} width={rx * 1.68} height={11} fill={colors.secondary} stroke={oc} strokeWidth={ow * 0.8} />
          <ellipse cx={0} cy={top + 16} rx={rx * 1.38} ry={8} fill={colors.main} stroke={oc} strokeWidth={ow} />
        </g>
      );
    case 'crown':
      return (
        <g>
          <polygon
            points={`${-rx * 0.75},${top + 8} ${-rx * 0.82},${top - 22} ${-rx * 0.35},${top - 6} 0,${top - 30} ${rx * 0.35},${top - 6} ${rx * 0.82},${top - 22} ${rx * 0.75},${top + 8}`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <circle cx={0} cy={top - 4} r={4} fill={colors.highlight} stroke={oc} strokeWidth={1.2} />
          <circle cx={-rx * 0.48} cy={top - 2} r={3} fill="#38BDF8" stroke={oc} strokeWidth={1.1} />
          <circle cx={rx * 0.48} cy={top - 2} r={3} fill="#38BDF8" stroke={oc} strokeWidth={1.1} />
        </g>
      );
    case 'hard_hat':
      return (
        <g>
          <path
            d={`M ${-rx * 1.08} ${cy - ry * 0.38} C ${-rx * 1.08} ${top - 24}, ${rx * 1.08} ${top - 24}, ${rx * 1.08} ${cy - ry * 0.38} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
          />
          <rect x={-rx * 0.2} y={top - 20} width={rx * 0.4} height={24} rx={3} fill={colors.highlight} stroke={oc} strokeWidth={1.3} />
          <path d={`M ${-rx * 1.18} ${cy - ry * 0.38} Q 0 ${cy - ry * 0.25} ${rx * 1.24} ${cy - ry * 0.36}`} fill="none" stroke={oc} strokeWidth={ow * 1.3} strokeLinecap="round" />
        </g>
      );
    case 'headphones_head':
      return (
        <g>
          <path
            d={`M ${-rx * 1.06} ${cy} C ${-rx * 1.12} ${top - 26}, ${rx * 1.12} ${top - 26}, ${rx * 1.06} ${cy}`}
            fill="none"
            stroke={colors.main}
            strokeWidth={7}
            strokeLinecap="round"
          />
          <rect x={-rx * 1.24} y={cy - 14} width={14} height={28} rx={7} fill={colors.main} stroke={oc} strokeWidth={ow * 0.85} />
          <rect x={rx * 1.24 - 14} y={cy - 14} width={14} height={28} rx={7} fill={colors.main} stroke={oc} strokeWidth={ow * 0.85} />
          <circle cx={-rx * 1.12} cy={cy} r={3} fill={colors.secondary} />
          <circle cx={rx * 1.12} cy={cy} r={3} fill={colors.secondary} />
        </g>
      );
    case 'headband':
      return (
        <rect
          x={-rx * 1.02}
          y={cy - ry * 0.62}
          width={rx * 2.04}
          height={12}
          rx={4}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow * 0.85}
        />
      );
    case 'gas_mask':
      return (
        <g>
          <path
            d={`M ${-rx * 0.82} ${cy - ry * 0.16} Q 0 ${cy - ry * 0.32} ${rx * 0.82} ${cy - ry * 0.16} L ${rx * 0.72} ${cy + ry * 0.78} Q 0 ${cy + ry * 1.02} ${-rx * 0.72} ${cy + ry * 0.78} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          {/* Goggle lenses */}
          <circle cx={-rx * 0.38} cy={cy - ry * 0.04} r={rx * 0.24} fill={colors.highlight} stroke={oc} strokeWidth={ow} />
          <circle cx={rx * 0.38} cy={cy - ry * 0.04} r={rx * 0.24} fill={colors.highlight} stroke={oc} strokeWidth={ow} />
          {/* Filter canisters */}
          <circle cx={0} cy={cy + ry * 0.56} r={rx * 0.26} fill={colors.secondary} stroke={oc} strokeWidth={ow} />
          <circle cx={0} cy={cy + ry * 0.56} r={rx * 0.12} fill={colors.main} />
        </g>
      );
    default:
      return null;
  }
}

export function renderEyewear(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none') return null;

  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const eyeY = cy - ry * 0.04;
  const ex = rx * 0.41;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth * 0.85;

  switch (id) {
    case 'round_glasses':
      return (
        <g>
          <circle cx={-ex} cy={eyeY} r={rx * 0.28} fill={colors.secondary} fillOpacity={0.22} stroke={colors.main} strokeWidth={2.6} />
          <circle cx={ex} cy={eyeY} r={rx * 0.28} fill={colors.secondary} fillOpacity={0.22} stroke={colors.main} strokeWidth={2.6} />
          <path d={`M ${-ex + rx * 0.28} ${eyeY} Q 0 ${eyeY - 4} ${ex - rx * 0.28} ${eyeY}`} fill="none" stroke={colors.main} strokeWidth={2.4} />
          <line x1={-rx * 0.98} y1={eyeY - 2} x2={-ex - rx * 0.28} y2={eyeY} stroke={colors.main} strokeWidth={2.2} />
          <line x1={rx * 0.98} y1={eyeY - 2} x2={ex + rx * 0.28} y2={eyeY} stroke={colors.main} strokeWidth={2.2} />
        </g>
      );
    case 'square_glasses':
      return (
        <g>
          <rect x={-ex - rx * 0.28} y={eyeY - ry * 0.2} width={rx * 0.56} height={ry * 0.38} rx={4} fill={colors.secondary} fillOpacity={0.22} stroke={colors.main} strokeWidth={2.8} />
          <rect x={ex - rx * 0.28} y={eyeY - ry * 0.2} width={rx * 0.56} height={ry * 0.38} rx={4} fill={colors.secondary} fillOpacity={0.22} stroke={colors.main} strokeWidth={2.8} />
          <line x1={-ex + rx * 0.28} y1={eyeY - 3} x2={ex - rx * 0.28} y2={eyeY - 3} stroke={colors.main} strokeWidth={2.6} />
        </g>
      );
    case 'sunglasses':
      return (
        <g>
          <rect x={-ex - rx * 0.31} y={eyeY - ry * 0.21} width={rx * 0.62} height={ry * 0.4} rx={6} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <rect x={ex - rx * 0.31} y={eyeY - ry * 0.21} width={rx * 0.62} height={ry * 0.4} rx={6} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <line x1={-ex + rx * 0.31} y1={eyeY - 4} x2={ex - rx * 0.31} y2={eyeY - 4} stroke={colors.main} strokeWidth={3.5} />
          <line x1={-ex - 6} y1={eyeY - 6} x2={-ex + 6} y2={eyeY + 6} stroke={colors.highlight} strokeWidth={2.2} strokeLinecap="round" opacity={0.65} />
          <line x1={ex - 6} y1={eyeY - 6} x2={ex + 6} y2={eyeY + 6} stroke={colors.highlight} strokeWidth={2.2} strokeLinecap="round" opacity={0.65} />
        </g>
      );
    case 'aviators':
      return (
        <g>
          <path d={`M ${-ex - rx * 0.32} ${eyeY - 8} L ${-ex + rx * 0.28} ${eyeY - 8} Q ${-ex + rx * 0.28} ${eyeY + 14} ${-ex - 2} ${eyeY + 14} Q ${-ex - rx * 0.32} ${eyeY + 12} ${-ex - rx * 0.32} ${eyeY - 8} Z`} fill={colors.secondary} fillOpacity={0.85} stroke={colors.main} strokeWidth={2.4} />
          <path d={`M ${ex - rx * 0.28} ${eyeY - 8} L ${ex + rx * 0.32} ${eyeY - 8} Q ${ex + rx * 0.32} ${eyeY + 12} ${ex + 2} ${eyeY + 14} Q ${ex - rx * 0.28} ${eyeY + 14} ${ex - rx * 0.28} ${eyeY - 8} Z`} fill={colors.secondary} fillOpacity={0.85} stroke={colors.main} strokeWidth={2.4} />
          <line x1={-ex + rx * 0.28} y1={eyeY - 7} x2={ex - rx * 0.28} y2={eyeY - 7} stroke={colors.main} strokeWidth={2.2} />
        </g>
      );
    case 'safety_goggles':
      return (
        <g>
          <rect x={-rx * 0.88} y={eyeY - ry * 0.26} width={rx * 1.76} height={ry * 0.52} rx={10} fill={colors.secondary} fillOpacity={0.35} stroke={colors.main} strokeWidth={3.2} />
          <line x1={-rx * 0.65} y1={eyeY - 7} x2={-rx * 0.45} y2={eyeY + 7} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" opacity={0.65} />
        </g>
      );
    case 'monocle':
      return (
        <g>
          <circle cx={ex} cy={eyeY} r={rx * 0.28} fill={colors.secondary} fillOpacity={0.2} stroke={colors.main} strokeWidth={2.8} />
          <path d={`M ${ex + rx * 0.28} ${eyeY + 2} Q ${ex + rx * 0.42} ${eyeY + 24} ${ex + rx * 0.25} ${eyeY + 46}`} fill="none" stroke={colors.main} strokeWidth={1.6} strokeDasharray="2 2" />
        </g>
      );
    case 'eyepatch':
      return (
        <g>
          <line x1={-rx * 0.94} y1={eyeY - 12} x2={rx * 0.94} y2={eyeY + 8} stroke={colors.main} strokeWidth={2.8} />
          <path d={`M ${-ex - rx * 0.28} ${eyeY - 10} L ${-ex + rx * 0.28} ${eyeY - 10} Q ${-ex + rx * 0.26} ${eyeY + 14} ${-ex} ${eyeY + 14} Q ${-ex - rx * 0.26} ${eyeY + 14} ${-ex - rx * 0.28} ${eyeY - 10} Z`} fill={colors.main} stroke={oc} strokeWidth={ow} />
        </g>
      );
    case 'visor':
      return (
        <g>
          <path
            d={`M ${-rx * 0.96} ${eyeY - ry * 0.18} L ${rx * 0.96} ${eyeY - ry * 0.18} L ${rx * 0.84} ${eyeY + ry * 0.22} L ${-rx * 0.84} ${eyeY + ry * 0.22} Z`}
            fill={colors.main}
            fillOpacity={0.85}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <line x1={-rx * 0.65} y1={eyeY} x2={rx * 0.65} y2={eyeY} stroke={colors.highlight} strokeWidth={2.2} opacity={0.85} />
        </g>
      );
    default:
      return null;
  }
}

export function renderPiercings(
  piercingIds: string[],
  metrics: BodyMetrics
): React.ReactNode {
  if (!piercingIds.length) return null;
  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const eyeY = cy - ry * 0.04;
  const browY = eyeY - ry * 0.28;
  const noseY = cy + ry * 0.18;
  const mouthY = cy + ry * 0.47;

  return (
    <g>
      {piercingIds.includes('ear_stud') && (
        <>
          <circle cx={-rx * 1.06} cy={cy + 8} r={2.6} fill="#F8FAFC" stroke="#334155" strokeWidth={1} />
          <circle cx={rx * 1.06} cy={cy + 8} r={2.6} fill="#F8FAFC" stroke="#334155" strokeWidth={1} />
        </>
      )}
      {piercingIds.includes('ear_hoop') && (
        <>
          <circle cx={-rx * 1.07} cy={cy + 12} r={5} fill="none" stroke="#F59E0B" strokeWidth={2.2} />
          <circle cx={rx * 1.07} cy={cy + 12} r={5} fill="none" stroke="#F59E0B" strokeWidth={2.2} />
        </>
      )}
      {piercingIds.includes('nose_stud') && (
        <circle cx={rx * 0.12} cy={noseY + 1} r={1.8} fill="#F8FAFC" stroke="#334155" strokeWidth={0.8} />
      )}
      {piercingIds.includes('septum_ring') && (
        <path d={`M -4 ${noseY + 5} A 4 4 0 1 0 4 ${noseY + 5}`} fill="none" stroke="#D4D4D8" strokeWidth={2} strokeLinecap="round" />
      )}
      {piercingIds.includes('eyebrow_ring') && (
        <path d={`M ${-rx * 0.58} ${browY - 3} Q ${-rx * 0.65} ${browY + 1} ${-rx * 0.56} ${browY + 5}`} fill="none" stroke="#D4D4D8" strokeWidth={2} strokeLinecap="round" />
      )}
      {piercingIds.includes('lip_ring') && (
        <circle cx={rx * 0.22} cy={mouthY + 6} r={3.2} fill="none" stroke="#D4D4D8" strokeWidth={1.8} />
      )}
    </g>
  );
}

export function renderTattooOnSurface(
  tattoo: TattooAttachment,
  metrics: BodyMetrics
): React.ReactNode {
  const s = tattoo.scale ?? 1;
  const col = tattoo.color || '#1F3A3D';

  const drawMotif = () => {
    switch (tattoo.assetId) {
      case 'tattoo_tribal_band':
        return (
          <g stroke={col} strokeWidth={2.4} fill="none" strokeLinecap="round">
            <path d="M -8 -2 Q 0 2 8 -2" />
            <path d="M -8 4 Q 0 8 8 4" />
            <polygon points="0,-6 3,1 0,8 -3,1" fill={col} />
          </g>
        );
      case 'tattoo_lightning':
        return <polygon points="2,-8 -4,1 0,1 -3,9 5,-1 1,-1" fill={col} />;
      case 'tattoo_star_cluster':
        return (
          <g fill={col}>
            <polygon points="0,-6 1.8,-1.8 6,-1.8 2.6,1 3.8,5.4 0,2.8 -3.8,5.4 -2.6,1 -6,-1.8 -1.8,-1.8" />
            <circle cx={-8} cy={6} r={1.8} />
            <circle cx={7} cy={-5} r={1.5} />
          </g>
        );
      case 'tattoo_cyber_circuit':
        return (
          <g stroke={col} strokeWidth={1.8} fill="none">
            <polyline points="-6,-10 -6,0 4,6 4,14" />
            <circle cx={-6} cy={-10} r={2} fill={col} />
            <circle cx={4} cy={14} r={2} fill={col} />
          </g>
        );
      case 'tattoo_dagger_rose':
        return (
          <g stroke={col} strokeWidth={1.8} fill="none">
            <line x1={0} y1={-12} x2={0} y2={12} />
            <line x1={-6} y1={-4} x2={6} y2={-4} />
            <circle cx={0} cy={3} r={4} fill={col} opacity={0.7} />
          </g>
        );
      case 'tattoo_tear_drop':
        return <path d="M 0 -4 C 3 1, -3 1, 0 -4 Z" fill={col} />;
      default:
        return null;
    }
  };

  let x = 0;
  let y = 0;
  switch (tattoo.surface) {
    case 'forehead':
      x = 0; y = metrics.headCenterY - metrics.headRy * 0.62; break;
    case 'cheek_l':
      x = -metrics.headRx * 0.45; y = metrics.headCenterY + metrics.headRy * 0.25; break;
    case 'cheek_r':
      x = metrics.headRx * 0.45; y = metrics.headCenterY + metrics.headRy * 0.25; break;
    case 'neck':
      x = metrics.neckWidth * 0.42; y = -metrics.neckLen * 0.45; break;
    case 'chest':
      x = -metrics.shoulderHalfW * 0.35; y = -metrics.torsoLen * 0.72; break;
    case 'upper_arm_l':
    case 'upper_arm_r':
      x = 0; y = metrics.upperArmLen * 0.5; break;
    case 'forearm_l':
    case 'forearm_r':
      x = 0; y = metrics.forearmLen * 0.48; break;
    case 'thigh_l':
      x = 0; y = metrics.thighLen * 0.5; break;
    case 'shin_r':
      x = 0; y = metrics.shinLen * 0.45; break;
  }

  return (
    <g transform={`translate(${x}, ${y}) scale(${s})`} opacity={0.86}>
      {drawMotif()}
    </g>
  );
}

export function renderTorsoAccessories(
  ids: string[],
  metrics: BodyMetrics
): React.ReactNode {
  const tLen = metrics.torsoLen;
  const sw = metrics.shoulderHalfW;
  const topY = -tLen;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth * 0.78;

  return (
    <g>
      {ids.includes('necktie') && (
        <polygon
          points={`-4,${topY + 4} 4,${topY + 4} 6,${topY + 48} 0,${topY + 58} -6,${topY + 48}`}
          fill="#B91C1C"
          stroke={oc}
          strokeWidth={ow}
          strokeLinejoin="round"
        />
      )}
      {ids.includes('bow_tie') && (
        <g transform={`translate(0, ${topY + 6})`}>
          <polygon points="-13,-6 0,0 -13,6" fill="#991B1B" stroke={oc} strokeWidth={ow} />
          <polygon points="13,-6 0,0 13,6" fill="#991B1B" stroke={oc} strokeWidth={ow} />
          <circle cx={0} cy={0} r={3.2} fill="#7F1D1D" stroke={oc} strokeWidth={ow} />
        </g>
      )}
      {ids.includes('gold_chain') && (
        <path
          d={`M ${-sw * 0.38} ${topY + 4} Q 0 ${topY + 26} ${sw * 0.38} ${topY + 4}`}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={4.2}
          strokeDasharray="3 1"
          strokeLinecap="round"
        />
      )}
      {ids.includes('scarf') && (
        <g transform={`translate(0, ${topY + 4})`}>
          <rect x={-sw * 0.52} y={-4} width={sw * 1.04} height={14} rx={6} fill="#0369A1" stroke={oc} strokeWidth={ow} />
          <path d={`M ${sw * 0.12} 6 L ${sw * 0.36} 36 L ${sw * 0.14} 38 L ${sw * 0.02} 8 Z`} fill="#0284C7" stroke={oc} strokeWidth={ow} />
        </g>
      )}
      {ids.includes('radio_001') && (
        <g transform={`translate(${-sw * 0.64}, ${topY + 12})`}>
          <rect x={-5} y={-8} width={10} height={16} rx={2} fill="#18181B" stroke={oc} strokeWidth={1.3} />
          <line x1={-3} y1={-8} x2={-3} y2={-16} stroke="#3F3F46" strokeWidth={2} strokeLinecap="round" />
          <circle cx={2} cy={-3} r={1.8} fill="#22C55E" />
        </g>
      )}
    </g>
  );
}

export function renderProp(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none') return null;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth * 0.8;

  switch (id) {
    case 'smartphone':
      return (
        <g transform="translate(4, 2) rotate(-18)">
          <rect x={-8} y={-14} width={16} height={28} rx={3} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <rect x={-6} y={-11} width={12} height={21} rx={1.5} fill={colors.highlight} opacity={0.9} />
          <circle cx={0} cy={12} r={1.2} fill="#94A3B8" />
        </g>
      );
    case 'flashlight':
      return (
        <g transform="translate(4, 3) rotate(72)">
          <rect x={-4} y={-14} width={8} height={24} rx={2} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <polygon points="-6,-18 6,-18 4,-12 -4,-12" fill={colors.secondary} stroke={oc} strokeWidth={ow} />
          <polygon points="-5,-18 5,-18 14,-42 -14,-42" fill={colors.highlight} opacity={0.28} />
        </g>
      );
    case 'coffee_cup':
      return (
        <g transform="translate(5, 2) rotate(-6)">
          <polygon points="-8,-10 8,-10 6,12 -6,12" fill={colors.main} stroke={oc} strokeWidth={ow} />
          <rect x={-7} y={-2} width={14} height={8} fill={colors.secondary} opacity={0.85} />
          <rect x={-9} y={-13} width={18} height={4} rx={1.5} fill={colors.highlight} stroke={oc} strokeWidth={ow} />
        </g>
      );
    case 'clipboard':
      return (
        <g transform="translate(6, 4) rotate(-14)">
          <rect x={-12} y={-16} width={24} height={32} rx={2.5} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <rect x={-9} y={-11} width={18} height={24} fill={colors.secondary} />
          <rect x={-5} y={-18} width={10} height={5} rx={1} fill="#94A3B8" stroke={oc} strokeWidth={1.2} />
          <line x1={-6} y1={-4} x2={6} y2={-4} stroke="#64748B" strokeWidth={1.5} />
          <line x1={-6} y1={2} x2={6} y2={2} stroke="#64748B" strokeWidth={1.5} />
          <line x1={-6} y1={8} x2={3} y2={8} stroke="#64748B" strokeWidth={1.5} />
        </g>
      );
    case 'microphone':
      return (
        <g transform="translate(4, 2) rotate(-22)">
          <polygon points="-3,0 3,0 2,20 -2,20" fill={colors.main} stroke={oc} strokeWidth={ow} />
          <circle cx={0} cy={-4} r={7} fill={colors.secondary} stroke={oc} strokeWidth={ow} />
          <line x1={-6} y1={-4} x2={6} y2={-4} stroke={oc} strokeWidth={1.2} />
        </g>
      );
    case 'wrench':
      return (
        <g transform="translate(4, 2) rotate(-35)">
          <rect x={-3} y={-12} width={6} height={28} rx={2} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <path d="M -7 -16 A 7 7 0 1 1 7 -16 L 3 -11 L -3 -11 Z" fill={colors.main} stroke={oc} strokeWidth={ow} />
        </g>
      );
    case 'megaphone':
      return (
        <g transform="translate(6, 2) rotate(-12)">
          <polygon points="-4,-5 16,-14 16,10 -4,3" fill={colors.main} stroke={oc} strokeWidth={ow} strokeLinejoin="round" />
          <rect x={-6} y={2} width={5} height={10} rx={1.5} fill={colors.highlight} stroke={oc} strokeWidth={1.2} />
          <ellipse cx={16} cy={-2} rx={3} ry={12} fill={colors.secondary} stroke={oc} strokeWidth={ow} />
        </g>
      );
    case 'defusal_pliers':
      return (
        <g transform="translate(4, 2) rotate(-25)">
          <path d="M -2 0 L -5 16 M 2 0 L 5 16" stroke={colors.main} strokeWidth={3.5} strokeLinecap="round" />
          <polygon points="-4,0 0,-12 4,0" fill={colors.secondary} stroke={oc} strokeWidth={ow} />
        </g>
      );
    default:
      return null;
  }
}
