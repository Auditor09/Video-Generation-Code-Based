/**
 * Procedural SVG Hairstyles Catalog
 * Supports back/front layering, secondary shading, highlight strands, and physics swing.
 */

import React from 'react';
import { BodyMetrics, shadeHex } from '../engine/character/bodyGeometry';
import { AssetColorTokens, AssetDefinition } from './types';

export const HAIR_ASSETS: AssetDefinition[] = [
  { id: 'bald', name: 'Bald / Clean', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#292929', secondary: '#494949', highlight: '#686868' } },
  { id: 'buzz_cut', name: 'Buzz Cut', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#292929', secondary: '#494949', highlight: '#686868' } },
  { id: 'crew_cut', name: 'Crew Cut', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#3B2F2F', secondary: '#524242', highlight: '#6E5A5A' } },
  { id: 'hair_messy_001', name: 'Messy Short', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#292929', secondary: '#494949', highlight: '#686868' }, physics: { enabled: true, stiffness: 0.7, damping: 0.8 } },
  { id: 'side_part', name: 'Side Part', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#3D2B1F', secondary: '#573F2E', highlight: '#7A5942' } },
  { id: 'middle_part', name: 'Middle Part', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#27272A', secondary: '#3F3F46', highlight: '#71717A' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.6, damping: 0.7 } },
  { id: 'hair_slick_back', name: 'Slick Back', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#27272A', secondary: '#3F3F46', highlight: '#71717A' } },
  { id: 'pompadour', name: 'Pompadour', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#1C1917', secondary: '#44403C', highlight: '#78716C' } },
  { id: 'quiff', name: 'Textured Quiff', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#5C3A21', secondary: '#7B5030', highlight: '#A67249' } },
  { id: 'hair_spiky', name: 'Spiky', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#18181B', secondary: '#27272A', highlight: '#38BDF8' }, physics: { enabled: true, stiffness: 0.85, damping: 0.8 } },
  { id: 'undercut', name: 'Undercut Fade', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#2D2424', secondary: '#483838', highlight: '#6E5757' } },
  { id: 'curly', name: 'Curly Crown', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#3F271E', secondary: '#5A382C', highlight: '#7A4E3E' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.65, damping: 0.75 } },
  { id: 'wavy', name: 'Wavy Mid', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#4A3222', secondary: '#694833', highlight: '#8F6448' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.55, damping: 0.75 } },
  { id: 'long_straight', name: 'Long Straight', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#231F20', secondary: '#3B3537', highlight: '#5E5558' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.45, damping: 0.8 } },
  { id: 'ponytail', name: 'High Ponytail', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#4B2E1E', secondary: '#6B422B', highlight: '#8F5A3D' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.4, damping: 0.75 } },
  { id: 'twin_ponytails', name: 'Twin Tails', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#7C2D12', secondary: '#9A3412', highlight: '#EA580C' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.4, damping: 0.75 } },
  { id: 'hair_bun', name: 'Top Bun', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#78350F', secondary: '#92400E', highlight: '#B45309' }, hasBackLayer: true },
  { id: 'braids', name: 'Box Braids', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#18181B', secondary: '#27272A', highlight: '#52525B' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.5, damping: 0.8 } },
  { id: 'hair_afro', name: 'Full Afro', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#1C1917', secondary: '#292524', highlight: '#44403C' }, hasBackLayer: true },
  { id: 'mohawk', name: 'Punk Mohawk', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#B91C1C', secondary: '#DC2626', highlight: '#F87171' } },
  { id: 'mullet', name: 'Retro Mullet', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#5B3A29', secondary: '#7A4F38', highlight: '#9C684B' }, hasBackLayer: true, physics: { enabled: true, stiffness: 0.55, damping: 0.8 } },
  { id: 'receding', name: 'Receding Hairline', category: 'hair', attachment: 'head', layer: 'hair_front', defaultColors: { main: '#4B5563', secondary: '#6B7280', highlight: '#9CA3AF' } },
];

export function renderHairBack(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens,
  swingDeg = 0
): React.ReactNode {
  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const dark = shadeHex(colors.main, -0.2);

  switch (id) {
    case 'long_straight':
      return (
        <g transform={`translate(0, ${cy - ry * 0.2}) rotate(${swingDeg * 0.65}) translate(0, ${-(cy - ry * 0.2)})`}>
          <path
            d={`M ${-rx * 1.15} ${cy - ry * 0.45} Q ${-rx * 1.32} ${cy + ry * 0.8} ${-rx * 1.1} ${cy + ry * 1.95} L ${rx * 1.1} ${cy + ry * 1.95} Q ${rx * 1.32} ${cy + ry * 0.8} ${rx * 1.15} ${cy - ry * 0.45} Z`}
            fill={dark}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
        </g>
      );
    case 'wavy':
      return (
        <g transform={`translate(0, ${cy - ry * 0.2}) rotate(${swingDeg * 0.55}) translate(0, ${-(cy - ry * 0.2)})`}>
          <path
            d={`M ${-rx * 1.1} ${cy - ry * 0.4} C ${-rx * 1.4} ${cy + ry * 0.3}, ${-rx * 1.05} ${cy + ry * 0.9}, ${-rx * 1.25} ${cy + ry * 1.45} Q 0 ${cy + ry * 1.65} ${rx * 1.25} ${cy + ry * 1.45} C ${rx * 1.05} ${cy + ry * 0.9}, ${rx * 1.4} ${cy + ry * 0.3}, ${rx * 1.1} ${cy - ry * 0.4} Z`}
            fill={dark}
            stroke={oc}
            strokeWidth={ow}
          />
        </g>
      );
    case 'ponytail':
      return (
        <g transform={`translate(${rx * 0.5}, ${cy - ry * 0.72}) rotate(${swingDeg})`}>
          <path
            d={`M 0 0 C ${rx * 0.95} ${-ry * 0.15}, ${rx * 1.3} ${ry * 0.8}, ${rx * 0.75} ${ry * 1.65} C ${rx * 0.45} ${ry * 1.2}, ${rx * 0.35} ${ry * 0.6}, -4 ${ry * 0.22} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <circle cx={2} cy={4} r={6} fill={colors.highlight} stroke={oc} strokeWidth={ow * 0.75} />
        </g>
      );
    case 'twin_ponytails':
      return (
        <g>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * rx * 0.92}, ${cy - ry * 0.35}) rotate(${swingDeg * 0.8})`}>
              <path
                d={`M 0 0 C ${s * rx * 0.68} ${ry * 0.2}, ${s * rx * 0.85} ${ry * 1.1}, ${s * rx * 0.32} ${ry * 1.7} C ${s * rx * 0.15} ${ry * 1.15}, ${s * rx * 0.1} ${ry * 0.55}, 0 ${ry * 0.18} Z`}
                fill={colors.main}
                stroke={oc}
                strokeWidth={ow}
              />
              <circle cx={0} cy={2} r={5.5} fill={colors.highlight} stroke={oc} strokeWidth={ow * 0.7} />
            </g>
          ))}
        </g>
      );
    case 'hair_bun':
      return (
        <g transform={`translate(0, ${cy - ry * 1.18})`}>
          <circle cx={0} cy={0} r={rx * 0.44} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <path d={`M ${-rx * 0.28} -3 Q 0 -10 ${rx * 0.28} -3`} fill="none" stroke={colors.highlight} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 'braids':
      return (
        <g transform={`translate(0, ${cy - ry * 0.2}) rotate(${swingDeg * 0.5}) translate(0, ${-(cy - ry * 0.2)})`}>
          {[-1.12, -0.88, 0.88, 1.12].map((f, i) => (
            <g key={i} transform={`translate(${rx * f}, ${cy - ry * 0.15})`}>
              <rect x={-5} y={0} width={10} height={ry * 1.75} rx={5} fill={dark} stroke={oc} strokeWidth={ow * 0.85} />
              {[0.25, 0.55, 0.85, 1.15, 1.45].map((k, j) => (
                <line key={j} x1={-4} y1={ry * k} x2={4} y2={ry * k + 4} stroke={colors.highlight} strokeWidth={1.3} />
              ))}
            </g>
          ))}
        </g>
      );
    case 'hair_afro':
      return (
        <g>
          <circle cx={0} cy={cy - ry * 0.16} r={rx * 1.48} fill={colors.main} stroke={oc} strokeWidth={ow} />
          <circle cx={-rx * 0.9} cy={cy - ry * 0.65} r={rx * 0.62} fill={colors.main} />
          <circle cx={rx * 0.9} cy={cy - ry * 0.65} r={rx * 0.62} fill={colors.main} />
        </g>
      );
    case 'curly':
      return (
        <g>
          <ellipse cx={0} cy={cy - ry * 0.25} rx={rx * 1.24} ry={ry * 1.02} fill={dark} stroke={oc} strokeWidth={ow} />
        </g>
      );
    case 'mullet':
      return (
        <g transform={`translate(0, ${cy}) rotate(${swingDeg * 0.5}) translate(0, ${-cy})`}>
          <path
            d={`M ${-rx * 1.04} ${cy + ry * 0.1} L ${-rx * 1.22} ${cy + ry * 1.42} L ${-rx * 0.65} ${cy + ry * 1.25} L 0 ${cy + ry * 1.5} L ${rx * 0.65} ${cy + ry * 1.25} L ${rx * 1.22} ${cy + ry * 1.42} L ${rx * 1.04} ${cy + ry * 0.1} Z`}
            fill={dark}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
        </g>
      );
    case 'middle_part':
      return (
        <path
          d={`M ${-rx * 1.1} ${cy - ry * 0.35} Q ${-rx * 1.22} ${cy + ry * 0.5} ${-rx * 0.95} ${cy + ry * 0.95} L ${rx * 0.95} ${cy + ry * 0.95} Q ${rx * 1.22} ${cy + ry * 0.5} ${rx * 1.1} ${cy - ry * 0.35} Z`}
          fill={dark}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    default:
      return null;
  }
}

export function renderHairFront(
  id: string,
  metrics: BodyMetrics,
  colors: AssetColorTokens,
  swingDeg = 0
): React.ReactNode {
  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const cy = metrics.headCenterY;
  const top = cy - ry;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;

  switch (id) {
    case 'bald':
      return (
        <path
          d={`M ${-rx * 0.42} ${top + 10} Q ${-rx * 0.15} ${top + 5} ${rx * 0.15} ${top + 10}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.55}
        />
      );
    case 'buzz_cut':
      return (
        <path
          d={`M ${-rx * 0.95} ${cy - ry * 0.28} C ${-rx * 0.98} ${top - 2}, ${rx * 0.98} ${top - 2}, ${rx * 0.95} ${cy - ry * 0.28} Q 0 ${cy - ry * 0.62} ${-rx * 0.95} ${cy - ry * 0.28} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow * 0.9}
        />
      );
    case 'crew_cut':
      return (
        <path
          d={`M ${-rx * 0.98} ${cy - ry * 0.25} C ${-rx * 1.05} ${top - 12}, ${rx * 1.05} ${top - 12}, ${rx * 0.98} ${cy - ry * 0.25} Q 0 ${cy - ry * 0.68} ${-rx * 0.98} ${cy - ry * 0.25} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'hair_messy_001':
      return (
        <g transform={`translate(0, ${top}) rotate(${swingDeg * 0.22}) translate(0, ${-top})`}>
          <path
            d={`M ${-rx * 1.04} ${cy - ry * 0.15}
                C ${-rx * 1.15} ${cy - ry * 0.72}, ${-rx * 0.65} ${top - 14}, ${-rx * 0.15} ${top - 10}
                L ${rx * 0.08} ${top - 20} L ${rx * 0.35} ${top - 10}
                C ${rx * 0.85} ${top - 12}, ${rx * 1.15} ${cy - ry * 0.72}, ${rx * 1.04} ${cy - ry * 0.15}
                L ${rx * 0.82} ${cy - ry * 0.42}
                L ${rx * 0.55} ${cy - ry * 0.22}
                L ${rx * 0.32} ${cy - ry * 0.48}
                L ${0} ${cy - ry * 0.2}
                L ${-rx * 0.28} ${cy - ry * 0.5}
                L ${-rx * 0.6} ${cy - ry * 0.24}
                L ${-rx * 0.86} ${cy - ry * 0.42} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <path
            d={`M ${-rx * 0.45} ${top - 2} Q 0 ${top - 9} ${rx * 0.42} ${top - 1}`}
            fill="none"
            stroke={colors.highlight}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </g>
      );
    case 'side_part':
      return (
        <g>
          <path
            d={`M ${-rx * 1.02} ${cy - ry * 0.15} C ${-rx * 1.12} ${top - 10}, ${rx * 0.95} ${top - 16}, ${rx * 1.02} ${cy - ry * 0.15} Q ${rx * 0.35} ${cy - ry * 0.35} ${-rx * 0.32} ${cy - ry * 0.56} Q ${-rx * 0.68} ${cy - ry * 0.36} ${-rx * 1.02} ${cy - ry * 0.15} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <path
            d={`M ${-rx * 0.25} ${top - 3} Q ${rx * 0.32} ${top - 11} ${rx * 0.68} ${cy - ry * 0.55}`}
            fill="none"
            stroke={colors.highlight}
            strokeWidth={2.8}
            strokeLinecap="round"
          />
        </g>
      );
    case 'middle_part':
      return (
        <g>
          <path
            d={`M ${-rx * 1.06} ${cy + ry * 0.05} C ${-rx * 1.15} ${top - 10}, ${-rx * 0.18} ${top - 12}, 0 ${cy - ry * 0.66} C ${rx * 0.18} ${top - 12}, ${rx * 1.15} ${top - 10}, ${rx * 1.06} ${cy + ry * 0.05} Q ${rx * 0.62} ${cy - ry * 0.25} 0 ${cy - ry * 0.52} Q ${-rx * 0.62} ${cy - ry * 0.25} ${-rx * 1.06} ${cy + ry * 0.05} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
        </g>
      );
    case 'hair_slick_back':
      return (
        <g>
          <path
            d={`M ${-rx * 1.02} ${cy - ry * 0.22} C ${-rx * 1.08} ${top - 14}, ${rx * 1.08} ${top - 14}, ${rx * 1.02} ${cy - ry * 0.22} Q ${rx * 0.55} ${cy - ry * 0.65} 0 ${cy - ry * 0.72} Q ${-rx * 0.55} ${cy - ry * 0.65} ${-rx * 1.02} ${cy - ry * 0.22} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
          />
          <path d={`M ${-rx * 0.45} ${top + 1} Q 0 ${top - 6} ${rx * 0.45} ${top + 1}`} fill="none" stroke={colors.highlight} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case 'pompadour':
      return (
        <g>
          <path
            d={`M ${-rx * 1.0} ${cy - ry * 0.25} C ${-rx * 1.2} ${top - 34}, ${rx * 1.32} ${top - 36}, ${rx * 1.0} ${cy - ry * 0.25} Q ${rx * 0.45} ${cy - ry * 0.62} 0 ${cy - ry * 0.56} Q ${-rx * 0.5} ${cy - ry * 0.62} ${-rx * 1.0} ${cy - ry * 0.25} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <path d={`M ${-rx * 0.55} ${top - 12} Q 0 ${top - 26} ${rx * 0.65} ${top - 8}`} fill="none" stroke={colors.highlight} strokeWidth={3.2} strokeLinecap="round" />
        </g>
      );
    case 'quiff':
      return (
        <path
          d={`M ${-rx * 0.98} ${cy - ry * 0.22} C ${-rx * 1.04} ${top - 12}, ${-rx * 0.15} ${top - 30}, ${rx * 0.45} ${top - 18} C ${rx * 0.92} ${top - 8}, ${rx * 1.04} ${cy - ry * 0.45}, ${rx * 0.98} ${cy - ry * 0.22} Q 0 ${cy - ry * 0.6} ${-rx * 0.98} ${cy - ry * 0.22} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'hair_spiky':
      return (
        <g transform={`translate(0, ${top}) rotate(${swingDeg * 0.25}) translate(0, ${-top})`}>
          <path
            d={`M ${-rx * 1.02} ${cy - ry * 0.18}
                L ${-rx * 1.24} ${cy - ry * 0.58}
                L ${-rx * 0.85} ${cy - ry * 0.72}
                L ${-rx * 0.88} ${top - 18}
                L ${-rx * 0.42} ${top - 6}
                L ${-rx * 0.18} ${top - 28}
                L ${rx * 0.16} ${top - 8}
                L ${rx * 0.48} ${top - 24}
                L ${rx * 0.72} ${top - 4}
                L ${rx * 1.18} ${cy - ry * 0.65}
                L ${rx * 1.02} ${cy - ry * 0.18}
                Q ${rx * 0.48} ${cy - ry * 0.48} 0 ${cy - ry * 0.35}
                Q ${-rx * 0.48} ${cy - ry * 0.48} ${-rx * 1.02} ${cy - ry * 0.18} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <path d={`M ${-rx * 0.15} ${top - 18} L ${-rx * 0.08} ${top - 3}`} stroke={colors.highlight} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'undercut':
      return (
        <g>
          <path
            d={`M ${-rx * 0.82} ${cy - ry * 0.42} C ${-rx * 0.88} ${top - 18}, ${rx * 0.95} ${top - 22}, ${rx * 0.95} ${cy - ry * 0.22} Q ${rx * 0.35} ${cy - ry * 0.48} ${-rx * 0.82} ${cy - ry * 0.42} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
          />
          <path
            d={`M ${-rx * 0.96} ${cy - ry * 0.2} L ${-rx * 0.85} ${cy - ry * 0.45} M ${rx * 0.96} ${cy - ry * 0.2} L ${rx * 0.88} ${cy - ry * 0.42}`}
            stroke={colors.secondary}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      );
    case 'curly':
      return (
        <g>
          {[
            [-0.75, -0.58, 0.32],
            [-0.35, -0.82, 0.36],
            [0.12, -0.86, 0.38],
            [0.58, -0.74, 0.34],
            [0.86, -0.45, 0.28],
            [-0.92, -0.32, 0.26],
          ].map(([fx, fy, fr], i) => (
            <circle
              key={i}
              cx={rx * fx}
              cy={cy + ry * fy}
              r={rx * fr}
              fill={colors.main}
              stroke={oc}
              strokeWidth={ow * 0.85}
            />
          ))}
        </g>
      );
    case 'wavy':
    case 'long_straight':
      return (
        <path
          d={`M ${-rx * 1.08} ${cy - ry * 0.15} C ${-rx * 1.16} ${top - 12}, ${rx * 1.16} ${top - 12}, ${rx * 1.08} ${cy - ry * 0.15} Q ${rx * 0.55} ${cy - ry * 0.55} 0 ${cy - ry * 0.62} Q ${-rx * 0.55} ${cy - ry * 0.55} ${-rx * 1.08} ${cy - ry * 0.15} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'ponytail':
    case 'twin_ponytails':
    case 'hair_bun':
    case 'braids':
      return (
        <path
          d={`M ${-rx * 1.0} ${cy - ry * 0.22} C ${-rx * 1.04} ${top - 8}, ${rx * 1.04} ${top - 8}, ${rx * 1.0} ${cy - ry * 0.22} Q ${rx * 0.45} ${cy - ry * 0.6} 0 ${cy - ry * 0.52} Q ${-rx * 0.45} ${cy - ry * 0.6} ${-rx * 1.0} ${cy - ry * 0.22} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'hair_afro':
      return (
        <path
          d={`M ${-rx * 0.96} ${cy - ry * 0.3} Q 0 ${cy - ry * 0.68} ${rx * 0.96} ${cy - ry * 0.3}`}
          fill="none"
          stroke={oc}
          strokeWidth={ow}
          strokeLinecap="round"
        />
      );
    case 'mohawk':
      return (
        <g>
          <path
            d={`M ${-rx * 0.22} ${cy - ry * 0.62} L ${-rx * 0.32} ${top - 34} L ${0} ${top - 22} L ${rx * 0.15} ${top - 38} L ${rx * 0.26} ${cy - ry * 0.62} Z`}
            fill={colors.main}
            stroke={oc}
            strokeWidth={ow}
            strokeLinejoin="round"
          />
          <path d={`M 0 ${cy - ry * 0.7} L ${0.06 * rx} ${top - 28}`} stroke={colors.highlight} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'mullet':
      return (
        <path
          d={`M ${-rx * 1.02} ${cy - ry * 0.22} C ${-rx * 1.06} ${top - 12}, ${rx * 1.06} ${top - 12}, ${rx * 1.02} ${cy - ry * 0.22} L ${rx * 0.85} ${cy - ry * 0.45} L ${0} ${cy - ry * 0.35} L ${-rx * 0.85} ${cy - ry * 0.45} Z`}
          fill={colors.main}
          stroke={oc}
          strokeWidth={ow}
        />
      );
    case 'receding':
      return (
        <g fill={colors.main} stroke={oc} strokeWidth={ow * 0.85}>
          <path d={`M ${-rx * 1.02} ${cy - ry * 0.08} Q ${-rx * 1.05} ${cy - ry * 0.48} ${-rx * 0.68} ${cy - ry * 0.56} Q ${-rx * 0.82} ${cy - ry * 0.3} ${-rx * 0.92} ${cy - ry * 0.08} Z`} />
          <path d={`M ${rx * 1.02} ${cy - ry * 0.08} Q ${rx * 1.05} ${cy - ry * 0.48} ${rx * 0.68} ${cy - ry * 0.56} Q ${rx * 0.82} ${cy - ry * 0.3} ${rx * 0.92} ${cy - ry * 0.08} Z`} />
        </g>
      );
    default:
      return null;
  }
}
