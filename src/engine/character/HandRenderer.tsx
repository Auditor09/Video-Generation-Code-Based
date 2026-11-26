/**
 * Detailed Articulated Cartoon Hand & Finger Renderer
 * Supports relaxed, fist, point, open, grip, and peace poses + optional glove coloring.
 */

import React from 'react';
import { BodyMetrics, shadeHex } from './bodyGeometry';

export type HandPose = 'relaxed' | 'fist' | 'point' | 'open' | 'grip' | 'peace';

interface HandRendererProps {
  side: 'L' | 'R';
  pose: HandPose;
  metrics: BodyMetrics;
  hasGloves?: boolean;
  isStickman?: boolean;
}

export const HandRenderer: React.FC<HandRendererProps> = ({
  side,
  pose,
  metrics,
  hasGloves = false,
  isStickman = false,
}) => {
  const s = metrics.handScale;
  const flip = side === 'L' ? -1 : 1;
  const fill = hasGloves ? '#1E293B' : isStickman ? '#FFFFFF' : metrics.skinColor;
  const shadow = hasGloves ? '#0F172A' : isStickman ? '#E2E8F0' : shadeHex(metrics.skinColor, -0.16);
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth * 0.68;

  if (isStickman) {
    return (
      <g transform={`scale(${flip * s}, ${s})`}>
        {pose === 'fist' || pose === 'grip' ? (
          <circle cx={0} cy={4} r={5.4} fill={hasGloves ? '#1E293B' : oc} stroke={oc} strokeWidth={ow} />
        ) : pose === 'point' ? (
          <g>
            <circle cx={0} cy={3} r={4.6} fill={fill} stroke={oc} strokeWidth={ow} />
            <line x1={2} y1={5} x2={3} y2={17} stroke={oc} strokeWidth={2.6} strokeLinecap="round" />
            <line x1={3.5} y1={1} x2={8.5} y2={5} stroke={oc} strokeWidth={2.2} strokeLinecap="round" />
          </g>
        ) : pose === 'peace' ? (
          <g>
            <circle cx={0} cy={3} r={4.6} fill={fill} stroke={oc} strokeWidth={ow} />
            <line x1={-1.5} y1={6} x2={-4.5} y2={16.5} stroke={oc} strokeWidth={2.3} strokeLinecap="round" />
            <line x1={2} y1={6} x2={5.5} y2={16.5} stroke={oc} strokeWidth={2.3} strokeLinecap="round" />
          </g>
        ) : pose === 'open' ? (
          <g>
            <circle cx={0} cy={3.5} r={5} fill={fill} stroke={oc} strokeWidth={ow} />
            <line x1={-4} y1={2} x2={-9} y2={7} stroke={oc} strokeWidth={2.0} strokeLinecap="round" />
            <line x1={-2.5} y1={6.5} x2={-4.5} y2={14} stroke={oc} strokeWidth={2.0} strokeLinecap="round" />
            <line x1={0} y1={7.5} x2={0} y2={15.5} stroke={oc} strokeWidth={2.0} strokeLinecap="round" />
            <line x1={2.5} y1={6.5} x2={4.5} y2={14} stroke={oc} strokeWidth={2.0} strokeLinecap="round" />
          </g>
        ) : (
          <circle cx={0} cy={4} r={5.0} fill={fill} stroke={oc} strokeWidth={ow} />
        )}
      </g>
    );
  }

  return (
    <g transform={`scale(${flip * s}, ${s})`}>
      {pose === 'fist' && (
        <g>
          <rect x={-7} y={-2} width={14} height={13} rx={5} fill={fill} stroke={oc} strokeWidth={ow} />
          <path d="M -6 3 L 6 3" stroke={oc} strokeWidth={ow * 0.7} />
          <path d="M -3 0 L -3 7 M 1 0 L 1 7 M 4 1 L 4 7" stroke={oc} strokeWidth={ow * 0.55} />
          <rect x={-9} y={1} width={6} height={8} rx={3} fill={shadow} stroke={oc} strokeWidth={ow * 0.85} />
        </g>
      )}

      {pose === 'grip' && (
        <g>
          <rect x={-6.5} y={-2} width={13} height={14} rx={5} fill={fill} stroke={oc} strokeWidth={ow} />
          <path d="M -5 3 L 5 3 M -5 7 L 5 7" stroke={oc} strokeWidth={ow * 0.65} />
          <rect x={-8.5} y={0} width={6} height={7} rx={3} fill={fill} stroke={oc} strokeWidth={ow * 0.85} />
        </g>
      )}

      {pose === 'point' && (
        <g>
          {/* Palm */}
          <rect x={-6.5} y={-2} width={13} height={12} rx={5} fill={fill} stroke={oc} strokeWidth={ow} />
          {/* Extended index finger */}
          <rect x={1.8} y={7} width={4.8} height={14} rx={2.4} fill={fill} stroke={oc} strokeWidth={ow * 0.85} />
          {/* Curled fingers */}
          <rect x={-5.5} y={6} width={7.2} height={6} rx={3} fill={shadow} stroke={oc} strokeWidth={ow * 0.75} />
          {/* Thumb on upper edge */}
          <path d="M 5.5 0 Q 11.5 3.5 7.5 8.5" fill={fill} stroke={oc} strokeWidth={ow * 0.85} strokeLinecap="round" />
        </g>
      )}

      {pose === 'peace' && (
        <g>
          <rect x={-6.5} y={-2} width={13} height={11} rx={5} fill={fill} stroke={oc} strokeWidth={ow} />
          <rect x={-2} y={6} width={4.2} height={14} rx={2} transform="rotate(-12 0 6)" fill={fill} stroke={oc} strokeWidth={ow * 0.8} />
          <rect x={2} y={6} width={4.2} height={14} rx={2} transform="rotate(14 4 6)" fill={fill} stroke={oc} strokeWidth={ow * 0.8} />
          <rect x={-6} y={5} width={6} height={6} rx={2.5} fill={shadow} stroke={oc} strokeWidth={ow * 0.75} />
        </g>
      )}

      {pose === 'open' && (
        <g>
          <ellipse cx={0} cy={4} rx={6.8} ry={6.5} fill={fill} stroke={oc} strokeWidth={ow} />
          {/* Thumb + 4 Fingers */}
          <rect x={-11} y={1} width={4} height={9} rx={2} transform="rotate(35 -9 1)" fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={-6.5} y={7} width={3.4} height={11} rx={1.7} transform="rotate(12 -5 7)" fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={-2.2} y={8} width={3.5} height={12.5} rx={1.75} fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={2} y={7.5} width={3.4} height={11.5} rx={1.7} transform="rotate(-10 3 7.5)" fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={5.5} y={6.5} width={3} height={9.5} rx={1.5} transform="rotate(-22 6 6.5)" fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
        </g>
      )}

      {pose === 'relaxed' && (
        <g>
          <ellipse cx={0} cy={3.5} rx={6.4} ry={6.2} fill={fill} stroke={oc} strokeWidth={ow} />
          {/* Thumb */}
          <rect x={-9} y={1} width={4} height={8.5} rx={2} transform="rotate(22 -7 1)" fill={fill} stroke={oc} strokeWidth={ow * 0.78} />
          {/* Four articulated fingers gently curved */}
          <rect x={-5.2} y={7} width={3.4} height={9.5} rx={1.7} fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={-1.6} y={7.6} width={3.5} height={10.5} rx={1.75} fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={2.0} y={7.2} width={3.3} height={9.5} rx={1.65} fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
          <rect x={5.2} y={6.2} width={2.9} height={7.8} rx={1.45} transform="rotate(-10 6 6)" fill={fill} stroke={oc} strokeWidth={ow * 0.75} />
        </g>
      )}
    </g>
  );
};
