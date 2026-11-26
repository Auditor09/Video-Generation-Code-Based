/**
 * Procedural SVG Facial Hair Catalog
 */

import React from 'react';
import { BodyMetrics } from '../engine/character/bodyGeometry';
import { AssetColorTokens, AssetDefinition } from './types';

export const FACIAL_HAIR_ASSETS: AssetDefinition[] = [
  { id: 'none', name: 'Clean Shaven', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#292929', secondary: '#494949', highlight: '#686868' } },
  { id: 'stubble', name: '5 O’Clock Stubble', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#3F3F46', secondary: '#52525B', highlight: '#71717A' } },
  { id: 'full_beard', name: 'Full Beard', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#382B24', secondary: '#4F3E35', highlight: '#6B5549' } },
  { id: 'short_beard', name: 'Trimmed Short Beard', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#382B24', secondary: '#4F3E35', highlight: '#6B5549' } },
  { id: 'long_beard', name: 'Long Beard', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#4B5563', secondary: '#6B7280', highlight: '#9CA3AF' } },
  { id: 'goatee', name: 'Goatee', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#27272A', secondary: '#3F3F46', highlight: '#52525B' } },
  { id: 'circle_beard', name: 'Circle Beard', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#27272A', secondary: '#3F3F46', highlight: '#52525B' } },
  { id: 'van_dyke', name: 'Van Dyke', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#27272A', secondary: '#3F3F46', highlight: '#52525B' } },
  { id: 'mustache_chevron_001', name: 'Chevron Mustache', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#382B24', secondary: '#4F3E35', highlight: '#6B5549' } },
  { id: 'pencil_mustache', name: 'Pencil Mustache', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#18181B', secondary: '#27272A', highlight: '#3F3F46' } },
  { id: 'handlebar_mustache', name: 'Handlebar Mustache', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#4A3222', secondary: '#694833', highlight: '#8F6448' } },
  { id: 'horseshoe_mustache', name: 'Horseshoe Mustache', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#4A3222', secondary: '#694833', highlight: '#8F6448' } },
  { id: 'sideburns', name: 'Thick Sideburns', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#382B24', secondary: '#4F3E35', highlight: '#6B5549' } },
  { id: 'soul_patch', name: 'Soul Patch', category: 'facialHair', attachment: 'head', layer: 'facial_hair', defaultColors: { main: '#27272A', secondary: '#3F3F46', highlight: '#52525B' } },
];

export function renderFacialHair(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens
): React.ReactNode {
  if (!id || id === 'none') return null;

  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const mouthY = cy + ry * 0.47;
  const noseY = cy + ry * 0.18;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth * 0.85;

  switch (id) {
    case 'stubble':
      return (
        <g opacity={0.32} fill={colors.main}>
          <path d={`M ${-rx * 0.86} ${cy + ry * 0.25} Q 0 ${cy + ry * 1.15} ${rx * 0.86} ${cy + ry * 0.25} Q ${rx * 0.72} ${cy + ry * 0.85} 0 ${cy + ry * 0.98} Q ${-rx * 0.72} ${cy + ry * 0.85} ${-rx * 0.86} ${cy + ry * 0.25} Z`} />
        </g>
      );
    case 'full_beard':
      return (
        <path
          d={`M ${-rx * 0.94} ${cy + ry * 0.12} C ${-rx * 1.02} ${cy + ry * 0.92}, ${-rx * 0.45} ${cy + ry * 1.24}, 0 ${cy + ry * 1.26} C ${rx * 0.45} ${cy + ry * 1.24}, ${rx * 1.02} ${cy + ry * 0.92}, ${rx * 0.94} ${cy + ry * 0.12} Q ${rx * 0.65} ${mouthY - 6} ${rx * 0.35} ${mouthY - 12} Q 0 ${mouthY - 16} ${-rx * 0.35} ${mouthY - 12} Q ${-rx * 0.65} ${mouthY - 6} ${-rx * 0.94} ${cy + ry * 0.12} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'short_beard':
      return (
        <path
          d={`M ${-rx * 0.9} ${cy + ry * 0.18} C ${-rx * 0.88} ${cy + ry * 0.85}, ${-rx * 0.42} ${cy + ry * 1.06}, 0 ${cy + ry * 1.06} C ${rx * 0.42} ${cy + ry * 1.06}, ${rx * 0.88} ${cy + ry * 0.85}, ${rx * 0.9} ${cy + ry * 0.18} Q ${rx * 0.55} ${mouthY - 3} 0 ${mouthY - 9} Q ${-rx * 0.55} ${mouthY - 3} ${-rx * 0.9} ${cy + ry * 0.18} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'long_beard':
      return (
        <path
          d={`M ${-rx * 0.94} ${cy + ry * 0.14} C ${-rx * 1.04} ${cy + ry * 1.1}, ${-rx * 0.52} ${cy + ry * 1.65}, 0 ${cy + ry * 1.85} C ${rx * 0.52} ${cy + ry * 1.65}, ${rx * 1.04} ${cy + ry * 1.1}, ${rx * 0.94} ${cy + ry * 0.14} Q ${rx * 0.5} ${mouthY - 8} 0 ${mouthY - 12} Q ${-rx * 0.5} ${mouthY - 8} ${-rx * 0.94} ${cy + ry * 0.14} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'goatee':
      return (
        <path
          d={`M ${-rx * 0.28} ${mouthY + 12} Q 0 ${cy + ry * 1.15} ${rx * 0.28} ${mouthY + 12} Q 0 ${mouthY + 18} ${-rx * 0.28} ${mouthY + 12} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'circle_beard':
      return (
        <path
          d={`M ${-rx * 0.42} ${mouthY - 6} Q 0 ${mouthY - 14} ${rx * 0.42} ${mouthY - 6} C ${rx * 0.5} ${cy + ry * 0.95}, ${rx * 0.25} ${cy + ry * 1.08}, 0 ${cy + ry * 1.08} C ${-rx * 0.25} ${cy + ry * 1.08}, ${-rx * 0.5} ${cy + ry * 0.95}, ${-rx * 0.42} ${mouthY - 6} Z M ${-rx * 0.24} ${mouthY + 2} Q 0 ${mouthY + 10} ${rx * 0.24} ${mouthY + 2} Q 0 ${mouthY - 4} ${-rx * 0.24} ${mouthY + 2} Z`}
          fill={colors.main}
          fillRule="evenodd"
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'van_dyke':
      return (
        <g fill={colors.main} stroke={oc} strokeWidth={ow}>
          <path d={`M ${-rx * 0.44} ${mouthY - 5} Q ${-rx * 0.15} ${mouthY - 15} 0 ${mouthY - 8} Q ${rx * 0.15} ${mouthY - 15} ${rx * 0.44} ${mouthY - 5} Q 0 ${mouthY - 8} ${-rx * 0.44} ${mouthY - 5} Z`} />
          <path d={`M ${-rx * 0.22} ${mouthY + 11} L 0 ${cy + ry * 1.18} L ${rx * 0.22} ${mouthY + 11} Z`} />
        </g>
      );
    case 'mustache_chevron_001':
      return (
        <path
          d={`M ${-rx * 0.48} ${mouthY - 3} Q ${-rx * 0.16} ${noseY + 5} 0 ${noseY + 7} Q ${rx * 0.16} ${noseY + 5} ${rx * 0.48} ${mouthY - 3} Q ${rx * 0.22} ${mouthY - 8} 0 ${mouthY - 7} Q ${-rx * 0.22} ${mouthY - 8} ${-rx * 0.48} ${mouthY - 3} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
          strokeLinejoin="round"
        />
      );
    case 'pencil_mustache':
      return (
        <path
          d={`M ${-rx * 0.44} ${mouthY - 7} Q ${-rx * 0.15} ${mouthY - 12} 0 ${mouthY - 9} Q ${rx * 0.15} ${mouthY - 12} ${rx * 0.44} ${mouthY - 7}`}
          fill="none"
          stroke={colors.main}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      );
    case 'handlebar_mustache':
      return (
        <path
          d={`M ${-rx * 0.62} ${mouthY - 10} C ${-rx * 0.68} ${mouthY + 2}, ${-rx * 0.24} ${mouthY + 2}, 0 ${mouthY - 9} C ${rx * 0.24} ${mouthY + 2}, ${rx * 0.68} ${mouthY + 2}, ${rx * 0.62} ${mouthY - 10} C ${rx * 0.48} ${mouthY - 5}, ${rx * 0.22} ${mouthY - 14}, 0 ${mouthY - 13} C ${-rx * 0.22} ${mouthY - 14}, ${-rx * 0.48} ${mouthY - 5}, ${-rx * 0.62} ${mouthY - 10} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'horseshoe_mustache':
      return (
        <path
          d={`M ${-rx * 0.46} ${mouthY + 18} L ${-rx * 0.46} ${mouthY - 6} Q 0 ${mouthY - 17} ${rx * 0.46} ${mouthY - 6} L ${rx * 0.46} ${mouthY + 18} L ${rx * 0.3} ${mouthY + 18} L ${rx * 0.3} ${mouthY - 2} Q 0 ${mouthY - 8} ${-rx * 0.3} ${mouthY - 2} L ${-rx * 0.3} ${mouthY + 18} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
          strokeLinejoin="round"
        />
      );
    case 'sideburns':
      return (
        <g fill={colors.main} stroke={oc} strokeWidth={ow}>
          <path d={`M ${-rx * 0.99} ${cy - ry * 0.2} L ${-rx * 0.82} ${cy - ry * 0.2} L ${-rx * 0.78} ${cy + ry * 0.36} L ${-rx * 0.96} ${cy + ry * 0.36} Z`} />
          <path d={`M ${rx * 0.99} ${cy - ry * 0.2} L ${rx * 0.82} ${cy - ry * 0.2} L ${rx * 0.78} ${cy + ry * 0.36} L ${rx * 0.96} ${cy + ry * 0.36} Z`} />
        </g>
      );
    case 'soul_patch':
      return (
        <polygon
          points={`${-5},${mouthY + 10} ${5},${mouthY + 10} 0,${mouthY + 21}`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow * 0.7}
        />
      );
    default:
      return null;
  }
}
