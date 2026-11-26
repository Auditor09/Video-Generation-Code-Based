/**
 * Procedural Vector Face Renderer (v2.0 — CinemaToon Studio Face)
 * Renders layered radial-gradient eyes, happy crescent arcs (^_^), crease folds,
 * slanted eyelids, sculpted tapered brows, nose crinkle, jaw-drop mouth articulation,
 * teeth, tongue, scars, freckles, blush hatching, sweat, tears, and vector cues.
 */

import React from 'react';
import { FaceConfig, ScarLocation } from '../../schemas/character.schema';
import { BodyMetrics, shadeHex } from '../character/bodyGeometry';
import { SolvedFaceParameters } from './expressionSolver';

interface ProceduralFaceProps {
  face: FaceConfig;
  metrics: BodyMetrics;
  solved: SolvedFaceParameters;
  hairColor?: string;
  uid: string;
  animTimeSec?: number;
  isStickman?: boolean;
}

export const ProceduralFace: React.FC<ProceduralFaceProps> = ({
  face,
  metrics,
  solved,
  hairColor = '#27272A',
  uid,
  animTimeSec = 0,
  isStickman = false,
}) => {
  const cx = 0;
  const cy = metrics.headCenterY;
  const rx = metrics.headRx;
  const ry = metrics.headRy;
  const ow = metrics.outlineWidth;
  const oc = metrics.outlineColor;

  const eyeSpacing = rx * 0.42;
  const eyeY = cy - ry * 0.04;
  const browY = eyeY - ry * 0.32;
  const noseY = cy + ry * 0.18;
  const mouthY = cy + ry * 0.49 + solved.jawDropShift * 3.4;

  const browColor = shadeHex(hairColor, -0.14);
  const browHighlight = shadeHex(hairColor, 0.16);
  const lidFill = isStickman ? shadeHex(metrics.skinColor, 0.56) : metrics.skinShadow;
  const lowerLidFill = isStickman ? shadeHex(metrics.skinColor, 0.72) : metrics.skinColor;
  const skinCrease = isStickman ? '#94A3B8' : shadeHex(metrics.skinColor, -0.22);

  // Studio-proportioned eyes (slightly larger & cleaner silhouettes for unmistakable readability)
  const eyeDims = (() => {
    switch (face.eyeStyle) {
      case 'almond':
        return { rx: rx * 0.23, ry: ry * 0.175 };
      case 'sharp_narrow':
        return { rx: rx * 0.235, ry: ry * 0.14 };
      case 'heavy_lidded':
        return { rx: rx * 0.22, ry: ry * 0.17 };
      case 'wide_anime':
        return { rx: rx * 0.245, ry: ry * 0.235 };
      case 'tired_droop':
        return { rx: rx * 0.22, ry: ry * 0.175 };
      case 'large_round':
      default:
        return { rx: rx * 0.235, ry: ry * 0.205 };
    }
  })();

  const renderEye = (side: 'L' | 'R') => {
    const sign = side === 'L' ? -1 : 1;
    const ex = cx + sign * eyeSpacing;
    const open = side === 'L' ? solved.eyeOpenL : solved.eyeOpenR;
    const lidSlant = side === 'L' ? solved.lidSlantL : solved.lidSlantR;
    const lowerLid = side === 'L' ? solved.lowerLidL : solved.lowerLidR;
    const happyCrescent = side === 'L' ? solved.happyCrescentL : solved.happyCrescentR;
    const eyeSquash = side === 'L' ? solved.eyeSquashL : solved.eyeSquashR;

    const erx = eyeDims.rx * (1 + eyeSquash * 0.06);
    const openScale = Math.max(0.08, Math.min(1.32, open));
    const ery = eyeDims.ry * openScale * (1 - eyeSquash * 0.08);

    const clipId = `eye_clip_${uid}_${side}`;
    const irisGradId = `iris_grad_${uid}_${side}`;
    const irisRadius = Math.min(erx, eyeDims.ry) * 0.6;
    const pupilRadius = Math.max(1.7, irisRadius * 0.48 * solved.pupilScale);
    const gx = solved.gazeX * erx * 0.32;
    const gy = solved.gazeY * eyeDims.ry * 0.28;

    const isClosed = open <= 0.09;
    const isHappyArc = !isClosed && happyCrescent >= 0.64;

    const heavyUpper =
      face.eyeStyle === 'heavy_lidded'
        ? 0.22
        : face.eyeStyle === 'tired_droop'
        ? 0.18
        : 0;

    const baseDrop =
      Math.max(0, 1 - open + heavyUpper + Math.abs(lidSlant) * 0.28) * eyeDims.ry * 1.16;
    const slantOffset = lidSlant * eyeDims.ry * 0.56;
    const innerLidY = -ery + baseDrop - slantOffset;
    const outerLidY = -ery + baseDrop + slantOffset;
    const midLidY = (innerLidY + outerLidY) * 0.5 - (lidSlant < -0.2 ? 1.2 : 2.8);

    const innerX = -sign * erx * 1.14;
    const outerX = sign * erx * 1.14;
    const hasUpperLid = baseDrop > 0.6 || Math.abs(lidSlant) > 0.14;

    const lowerLidRise = lowerLid * eyeDims.ry * 1.06;
    const joyArcCurve =
      solved.cheekSquint > 0.42 ? solved.cheekSquint * eyeDims.ry * 0.48 : 0;

    return (
      <g key={`eye_${side}`} transform={`translate(${ex}, ${eyeY})`}>
        {/* Dark circles / eye bags */}
        {(face.darkCircles || face.eyeBags) && (
          <path
            d={`M ${-erx * 0.85} ${eyeDims.ry * 0.62} Q 0 ${eyeDims.ry * 1.32} ${erx * 0.85} ${eyeDims.ry * 0.62}`}
            fill="none"
            stroke={face.darkCircles ? shadeHex(metrics.skinColor, -0.24) : shadeHex(metrics.skinColor, -0.15)}
            strokeWidth={face.darkCircles ? 2.1 : 1.2}
            strokeLinecap="round"
            opacity={0.68}
          />
        )}

        {/* Happy Crescent (^_^) Eye OR Closed Blink Lid OR Layered Iris Eye */}
        {isClosed || isHappyArc ? (
          <g>
            {isHappyArc ? (
              <>
                <path
                  d={`M ${-erx * 0.96} 3.2 Q 0 ${-eyeDims.ry * 0.95} ${erx * 0.96} 3.2`}
                  fill="none"
                  stroke={oc}
                  strokeWidth={ow * 1.35}
                  strokeLinecap="round"
                />
                {/* Cheek push arc under happy crescent */}
                <path
                  d={`M ${-erx * 0.68} 6.2 Q 0 3.8 ${erx * 0.68} 6.2`}
                  fill="none"
                  stroke={skinCrease}
                  strokeWidth={ow * 0.55}
                  strokeLinecap="round"
                  opacity={0.55}
                />
              </>
            ) : (
              <path
                d={
                  solved.cheekSquint > 0.45
                    ? `M ${-erx} 2.5 Q 0 ${-eyeDims.ry * 0.72} ${erx} 2.5`
                    : `M ${-erx} 0.5 Q 0 ${eyeDims.ry * 0.44} ${erx} 0.5`
                }
                fill="none"
                stroke={oc}
                strokeWidth={ow * 1.08}
                strokeLinecap="round"
              />
            )}
          </g>
        ) : (
          <>
            <defs>
              <clipPath id={clipId}>
                <ellipse cx={0} cy={0} rx={erx} ry={ery} />
              </clipPath>
              <radialGradient id={irisGradId} cx="50%" cy="42%" r="58%">
                <stop offset="0%" stopColor={shadeHex(face.eyeColor, 0.25)} />
                <stop offset="68%" stopColor={face.eyeColor} />
                <stop offset="100%" stopColor={shadeHex(face.eyeColor, -0.45)} />
              </radialGradient>
            </defs>

            {/* Clean warm-white sclera */}
            <ellipse cx={0} cy={0} rx={erx} ry={ery} fill="#FFFFFF" />

            {/* Clipped Iris + Limbal Ring + Pupil + Gloss Catchlights + Anatomical Lids */}
            <g clipPath={`url(#${clipId})`}>
              {/* Soft upper sclera cast shadow */}
              <ellipse
                cx={0}
                cy={-ery * 0.88}
                rx={erx * 1.18}
                ry={ery * 0.46}
                fill="#CBD5E1"
                opacity={0.42}
              />

              {/* Iris + Limbal Ring */}
              <circle
                cx={gx}
                cy={gy}
                r={irisRadius}
                fill={`url(#${irisGradId})`}
                stroke={shadeHex(face.eyeColor, -0.5)}
                strokeWidth={0.95}
              />
              {/* Subtle lower iris bounce highlight */}
              <ellipse
                cx={gx}
                cy={gy + irisRadius * 0.44}
                rx={irisRadius * 0.54}
                ry={irisRadius * 0.22}
                fill={shadeHex(face.eyeColor, 0.46)}
                opacity={0.52}
              />

              {/* Pupil */}
              <circle cx={gx} cy={gy} r={pupilRadius} fill="#0F172A" />

              {/* Crisp studio catchlights */}
              <circle
                cx={gx - irisRadius * 0.34}
                cy={gy - irisRadius * 0.34}
                r={Math.max(1.2, irisRadius * (solved.sparkleLevel > 0.45 ? 0.32 : 0.24) * solved.pupilGloss * 0.88)}
                fill="#FFFFFF"
              />
              <circle
                cx={gx + irisRadius * 0.28}
                cy={gy + irisRadius * 0.26}
                r={Math.max(0.8, irisRadius * 0.11 * solved.pupilGloss * 0.85)}
                fill="#FFFFFF"
                opacity={0.88}
              />

              {/* Watery sad lower-lid tear meniscus */}
              {solved.tearLevel > 0.22 && (
                <path
                  d={`M ${-erx} ${ery * 0.52} Q 0 ${ery * 0.84} ${erx} ${ery * 0.52} L ${erx} ${ery * 1.2} L ${-erx} ${ery * 1.2} Z`}
                  fill="#BAE6FD"
                  opacity={Math.min(0.9, solved.tearLevel * 0.92)}
                />
              )}

              {/* Slanted Anatomical Upper Eyelid */}
              {hasUpperLid && (
                <g>
                  <path
                    d={`M ${innerX} ${-ery * 1.65} L ${outerX} ${-ery * 1.65} L ${outerX} ${outerLidY} Q 0 ${midLidY} ${innerX} ${innerLidY} Z`}
                    fill={lidFill}
                  />
                  <path
                    d={`M ${innerX} ${innerLidY} Q 0 ${midLidY} ${outerX} ${outerLidY}`}
                    fill="none"
                    stroke={oc}
                    strokeWidth={ow * 0.96}
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Curved Lower Eyelid / Cheek Push */}
              {lowerLidRise > 0.5 && (
                <g>
                  <path
                    d={`M ${-erx * 1.14} ${ery + 2} Q 0 ${ery - lowerLidRise - joyArcCurve} ${erx * 1.14} ${ery + 2} L ${erx * 1.14} ${ery * 1.6} L ${-erx * 1.14} ${ery * 1.6} Z`}
                    fill={lowerLidFill}
                  />
                  <path
                    d={`M ${-erx * 1.05} ${ery + 1} Q 0 ${ery - lowerLidRise - joyArcCurve} ${erx * 1.05} ${ery + 1}`}
                    fill="none"
                    stroke={oc}
                    strokeWidth={ow * 0.72}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>

            {/* Clean thin eye outline + top lash accent */}
            <ellipse
              cx={0}
              cy={0}
              rx={erx}
              ry={ery}
              fill="none"
              stroke={oc}
              strokeWidth={ow * 0.72}
            />
            {!hasUpperLid && (
              <path
                d={`M ${-erx * 0.95} ${-ery * 0.22} Q 0 ${-ery * 1.15} ${erx * 0.95} ${-ery * 0.22}`}
                fill="none"
                stroke={oc}
                strokeWidth={ow * 1.05}
                strokeLinecap="round"
              />
            )}

            {/* Delicate upper eyelid crease line */}
            <path
              d={`M ${-erx * 0.68} ${-ery * 1.12} Q 0 ${-ery * 1.32} ${erx * 0.68} ${-ery * 1.12}`}
              fill="none"
              stroke={skinCrease}
              strokeWidth={ow * 0.44}
              strokeLinecap="round"
              opacity={0.55}
            />

            {/* Joyful crinkle / cheek crow's foot */}
            {solved.cheekSquint > 0.5 && (
              <path
                d={`M ${sign * erx * 0.92} ${ery * 0.18} Q ${sign * erx * 1.16} ${ery * 0.24} ${sign * erx * 1.12} ${ery * 0.48}`}
                fill="none"
                stroke={oc}
                strokeWidth={ow * 0.55}
                strokeLinecap="round"
                opacity={0.55}
              />
            )}
          </>
        )}

        {/* Smooth glistening teardrop when sad */}
        {solved.tearLevel > 0.42 && (
          (() => {
            const tearCycle = (animTimeSec * 0.55 + (side === 'L' ? 0 : 0.42)) % 1;
            const tearY = ery * 0.78 + tearCycle * 8.5;
            const tearAlpha = Math.sin(tearCycle * Math.PI) * Math.min(0.94, solved.tearLevel);
            return (
              <g transform={`translate(${sign * erx * 0.56}, ${tearY})`} opacity={tearAlpha}>
                <path
                  d="M 0 -4.2 C 2.7 -0.6, 2.9 3.4, 0 3.8 C -2.9 3.4, -2.7 -0.6, 0 -4.2 Z"
                  fill="#7DD3FC"
                  stroke="#0284C7"
                  strokeWidth={0.75}
                />
                <circle cx={-0.7} cy={0.8} r={0.9} fill="#FFFFFF" opacity={0.92} />
              </g>
            );
          })()
        )}
      </g>
    );
  };

  const renderBrow = (side: 'L' | 'R') => {
    const sign = side === 'L' ? -1 : 1;
    const bx = cx + sign * eyeSpacing;
    const h = side === 'L' ? solved.browLHeight : solved.browRHeight;
    const tilt = side === 'L' ? solved.browLTilt : solved.browRTilt;
    const bw = eyeDims.rx * 1.18;

    const yOff = -h * 11.0;
    const innerLift = tilt * 8.6;
    const outerLift = -tilt * 4.4;
    const arch = solved.browCurve * 7.4;

    const baseThick =
      face.browStyle === 'bushy'
        ? ow * 2.25
        : face.browStyle === 'thick_bold'
        ? ow * 1.8
        : face.browStyle === 'thin_sharp'
        ? ow * 0.92
        : ow * 1.38;

    const innerX = -sign * bw * 0.88;
    const outerX = sign * bw * 0.98;
    const innerY = -innerLift;
    const outerY = -outerLift;
    const midY = -arch - (face.browStyle === 'arched' ? 4.4 : 0);

    const halfIn = baseThick * 0.8;
    const halfMid = baseThick * 0.64;
    const halfOut = baseThick * 0.24;

    const hasSplit =
      (side === 'L' && face.splitEyebrow === 'left') ||
      (side === 'R' && face.splitEyebrow === 'right');

    const browPath = [
      `M ${innerX} ${innerY - halfIn}`,
      `Q 0 ${midY - halfMid} ${outerX} ${outerY - halfOut}`,
      `Q ${outerX + sign * 1.4} ${outerY} ${outerX} ${outerY + halfOut}`,
      `Q 0 ${midY + halfMid} ${innerX} ${innerY + halfIn}`,
      `Q ${innerX - sign * 2.0} ${innerY} ${innerX} ${innerY - halfIn} Z`,
    ].join(' ');

    return (
      <g key={`brow_${side}`} transform={`translate(${bx}, ${browY + yOff})`}>
        <path
          d={browPath}
          fill={browColor}
          stroke={oc}
          strokeWidth={ow * 0.42}
          strokeLinejoin="round"
        />
        {/* Crisp upper brow rim highlight */}
        <path
          d={`M ${innerX * 0.72} ${innerY - halfIn * 0.55} Q 0 ${midY - halfMid * 0.55} ${outerX * 0.68} ${outerY - halfOut * 0.55}`}
          fill="none"
          stroke={browHighlight}
          strokeWidth={0.85}
          strokeLinecap="round"
          opacity={0.42}
        />
        {hasSplit && (
          <line
            x1={sign * 4}
            y1={-7}
            x2={sign * 2}
            y2={4}
            stroke={isStickman ? '#FFFFFF' : metrics.skinColor}
            strokeWidth={2.0}
          />
        )}
      </g>
    );
  };

  const renderNose = () => {
    const nw = rx * 0.14;
    const liftY = -solved.noseCrinkle * 1.6;
    return (
      <g transform={`translate(0, ${liftY})`}>
        {(() => {
          switch (face.noseStyle) {
            case 'pointed':
              return (
                <path
                  d={`M 0 ${noseY - 11} L ${nw * 0.95} ${noseY + 2} Q 0 ${noseY + 5} ${-nw * 0.35} ${noseY + 3}`}
                  fill={isStickman ? 'none' : metrics.skinShadow}
                  stroke={oc}
                  strokeWidth={ow * 0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            case 'button':
              return (
                <path
                  d={`M ${-nw * 0.55} ${noseY} Q 0 ${noseY + 6} ${nw * 0.55} ${noseY}`}
                  fill="none"
                  stroke={oc}
                  strokeWidth={ow * 0.75}
                  strokeLinecap="round"
                />
              );
            case 'aquiline':
              return (
                <path
                  d={`M -1 ${noseY - 14} Q ${nw * 1.15} ${noseY - 3} ${nw * 0.65} ${noseY + 4} Q 0 ${noseY + 6} ${-nw * 0.45} ${noseY + 2}`}
                  fill="none"
                  stroke={oc}
                  strokeWidth={ow * 0.74}
                  strokeLinecap="round"
                />
              );
            case 'broad':
              return (
                <path
                  d={`M ${-nw * 0.9} ${noseY + 1} Q 0 ${noseY + 7} ${nw * 0.9} ${noseY + 1}`}
                  fill={isStickman ? 'none' : metrics.skinShadow}
                  stroke={oc}
                  strokeWidth={ow * 0.75}
                  strokeLinecap="round"
                />
              );
            case 'rounded':
            default:
              return (
                <path
                  d={`M ${-nw * 0.4} ${noseY - 7} Q ${nw * 0.95} ${noseY + 1} ${-nw * 0.25} ${noseY + 4}`}
                  fill="none"
                  stroke={oc}
                  strokeWidth={ow * 0.72}
                  strokeLinecap="round"
                />
              );
          }
        })()}

        {/* Nose bridge crinkle on disgust / anger / snarl */}
        {solved.noseCrinkle > 0.35 && (
          <g stroke={skinCrease} strokeWidth={ow * 0.55} strokeLinecap="round" opacity={Math.min(0.75, solved.noseCrinkle)}>
            <path d={`M -3.5 ${noseY - 11} Q 0 ${noseY - 9} 3.5 ${noseY - 11}`} fill="none" />
            <path d={`M -2.5 ${noseY - 8} Q 0 ${noseY - 6.5} 2.5 ${noseY - 8}`} fill="none" />
          </g>
        )}
      </g>
    );
  };

  const renderMouth = () => {
    const roundScale = 1 - solved.lipRoundness * 0.44;
    const baseW = rx * 0.44 * solved.mouthWidth * roundScale;
    const openH = solved.mouthOpen * ry * 0.42;
    const curve = solved.mouthCurve;
    const skewY = solved.mouthSkew * 7.8;
    const yL = -skewY * 0.45;
    const yR = skewY * 0.45;

    // 1. Closed or nearly-closed expressive mouth line
    if (openH < 2.6) {
      const curveOffset = curve * 15.8;
      const isWavy = solved.stressTremble > 0.48;
      return (
        <g transform={`translate(${cx}, ${mouthY})`}>
          <path
            d={`M ${-baseW * 0.48} ${curveOffset * 0.5 + 4.5} Q 0 ${curveOffset * 0.5 + 7.5} ${baseW * 0.48} ${curveOffset * 0.5 + 4.5}`}
            fill="none"
            stroke={skinCrease}
            strokeWidth={ow * 0.62}
            strokeLinecap="round"
            opacity={0.45}
          />
          {isWavy ? (
            <path
              d={`M ${-baseW} ${yL} Q ${-baseW * 0.5} ${curveOffset * 0.35 - 3.8} 0 ${curveOffset * 0.55} Q ${baseW * 0.5} ${curveOffset * 0.35 + 3.8} ${baseW} ${yR}`}
              fill="none"
              stroke={oc}
              strokeWidth={ow * 0.96}
              strokeLinecap="round"
            />
          ) : (
            <path
              d={`M ${-baseW} ${yL} Q 0 ${curveOffset} ${baseW} ${yR}`}
              fill="none"
              stroke={oc}
              strokeWidth={ow * 0.96}
              strokeLinecap="round"
            />
          )}
          {(face.dimples || Math.abs(curve) > 0.35) && (
            <>
              <path
                d={`M ${-baseW - 2.5} ${yL - 2.5} Q ${-baseW - 5} ${yL + 1} ${-baseW - 2.5} ${yL + 4}`}
                fill="none"
                stroke={oc}
                strokeWidth={ow * 0.5}
                strokeLinecap="round"
                opacity={0.6}
              />
              <path
                d={`M ${baseW + 2.5} ${yR - 2.5} Q ${baseW + 5} ${yR + 1} ${baseW + 2.5} ${yR + 4}`}
                fill="none"
                stroke={oc}
                strokeWidth={ow * 0.5}
                strokeLinecap="round"
                opacity={0.6}
              />
            </>
          )}
        </g>
      );
    }

    // 2. Clenched / Gritted Teeth
    const isClenched = solved.lipTension > 0.58 && solved.mouthOpen < 0.46;
    if (isClenched) {
      const gritH = Math.max(6.8, openH * 1.18);
      const archLift = curve * 6.8;
      const cornerY = -archLift * 0.45;
      const topMidY = -gritH * 0.55 + archLift * 0.35;
      const botMidY = gritH * 0.55 + archLift * 0.55;
      const gritPath = `M ${-baseW} ${yL + cornerY} Q 0 ${topMidY} ${baseW} ${yR + cornerY} Q ${baseW * 0.92} ${yR + cornerY + 2} ${baseW * 0.88} ${yR + cornerY + gritH * 0.25} Q 0 ${botMidY} ${-baseW * 0.88} ${yL + cornerY + gritH * 0.25} Q ${-baseW * 0.92} ${yL + cornerY + 2} ${-baseW} ${yL + cornerY} Z`;
      const gritClipId = `grit_clip_${uid}`;

      return (
        <g transform={`translate(${cx}, ${mouthY})`}>
          <defs>
            <clipPath id={gritClipId}>
              <path d={gritPath} />
            </clipPath>
          </defs>
          <path d={gritPath} fill="#FFFFFF" />
          <g clipPath={`url(#${gritClipId})`}>
            <path
              d={`M ${-baseW} ${(yL + yR) * 0.5 + cornerY + archLift * 0.15} Q 0 ${(topMidY + botMidY) * 0.5} ${baseW} ${(yL + yR) * 0.5 + cornerY + archLift * 0.15}`}
              fill="none"
              stroke="#64748B"
              strokeWidth={0.9}
            />
            {[-0.48, 0, 0.48].map((tx, idx) => (
              <line
                key={idx}
                x1={baseW * tx}
                y1={topMidY - 2}
                x2={baseW * tx}
                y2={botMidY + 2}
                stroke="#CBD5E1"
                strokeWidth={0.8}
              />
            ))}
          </g>
          <path
            d={gritPath}
            fill="none"
            stroke={oc}
            strokeWidth={ow * 0.88}
            strokeLinejoin="round"
          />
        </g>
      );
    }

    // 3. Open Articulated Mouth
    const mouthClipId = `mouth_clip_${uid}`;
    let topMidY: number;
    let botMidY: number;
    let cornerY: number;

    if (solved.lipRoundness > 0.44) {
      cornerY = 0;
      topMidY = -openH * 0.84;
      botMidY = openH * 0.98;
    } else if (curve >= 0.1) {
      cornerY = -curve * 4.6;
      topMidY = -openH * 0.22 + curve * 1.2;
      botMidY = openH * 1.06 + curve * 9.2;
    } else {
      const frownStrength = Math.abs(curve);
      cornerY = frownStrength * 5.4;
      topMidY = -openH * 0.64 - frownStrength * 3.8;
      botMidY = openH * 0.74 + cornerY * 0.35;
    }

    const mouthPath = `M ${-baseW} ${yL + cornerY} Q 0 ${topMidY} ${baseW} ${yR + cornerY} Q 0 ${botMidY} ${-baseW} ${yL + cornerY} Z`;
    const teethHeight = Math.max(3.8, Math.abs(botMidY - topMidY) * 0.28);

    return (
      <g transform={`translate(${cx}, ${mouthY})`}>
        <defs>
          <clipPath id={mouthClipId}>
            <path d={mouthPath} />
          </clipPath>
        </defs>

        <path d={mouthPath} fill="#4C111E" />

        <g clipPath={`url(#${mouthClipId})`}>
          {(solved.tongueShow > 0.08 || openH > 5.5) && (
            <ellipse
              cx={0}
              cy={botMidY * 0.82 + 2}
              rx={baseW * 0.64}
              ry={Math.max(4.5, Math.abs(botMidY - topMidY) * 0.44)}
              fill="#EA6579"
            />
          )}

          {solved.teethShow > 0.14 && (
            <g>
              <path
                d={`M ${-baseW * 0.94} ${topMidY - 5} L ${baseW * 0.94} ${topMidY - 5} L ${baseW * 0.94} ${topMidY + teethHeight} Q 0 ${topMidY + teethHeight + 2.2} ${-baseW * 0.94} ${topMidY + teethHeight} Z`}
                fill="#FFFFFF"
              />
              {face.missingTooth && (
                <rect
                  x={baseW * 0.14}
                  y={topMidY - 2}
                  width={baseW * 0.26}
                  height={teethHeight + 4}
                  fill="#4C111E"
                />
              )}
              {face.crookedTeeth && (
                <path
                  d={`M ${-baseW * 0.3} ${topMidY} L ${-baseW * 0.22} ${topMidY + teethHeight} M ${baseW * 0.25} ${topMidY} L ${baseW * 0.3} ${topMidY + teethHeight}`}
                  stroke="#94A3B8"
                  strokeWidth={0.9}
                />
              )}
            </g>
          )}

          {curve < -0.25 && solved.teethShow > 0.6 && Math.abs(botMidY - topMidY) > 10 && (
            <path
              d={`M ${-baseW * 0.86} ${botMidY - teethHeight * 0.72} Q 0 ${botMidY - teethHeight * 0.95} ${baseW * 0.86} ${botMidY - teethHeight * 0.72} L ${baseW * 0.86} ${botMidY + 5} L ${-baseW * 0.86} ${botMidY + 5} Z`}
              fill="#F8FAFC"
            />
          )}
        </g>

        <path
          d={mouthPath}
          fill="none"
          stroke={oc}
          strokeWidth={ow * 0.86}
          strokeLinejoin="round"
        />

        <path
          d={`M ${-baseW * 0.42} ${botMidY * 0.85 + 4.5} Q 0 ${botMidY * 0.85 + 7.2} ${baseW * 0.42} ${botMidY * 0.85 + 4.5}`}
          fill="none"
          stroke={skinCrease}
          strokeWidth={ow * 0.55}
          strokeLinecap="round"
          opacity={0.42}
        />
      </g>
    );
  };

  const renderScar = (loc: ScarLocation, angle: number, size: number, color: string, idx: number) => {
    const coords: Record<ScarLocation, [number, number]> = {
      left_cheek: [-rx * 0.52, cy + ry * 0.25],
      right_cheek: [rx * 0.52, cy + ry * 0.25],
      forehead: [rx * 0.28, cy - ry * 0.55],
      left_brow: [-eyeSpacing, browY + 2],
      right_brow: [eyeSpacing, browY + 2],
      chin: [rx * 0.14, cy + ry * 0.75],
      nose_bridge: [0, noseY - 10],
    };
    const [sx, sy] = coords[loc] ?? [0, cy];
    const len = 14 * size;
    return (
      <g key={`scar_${idx}`} transform={`translate(${sx}, ${sy}) rotate(${angle})`}>
        <line x1={0} y1={-len / 2} x2={0} y2={len / 2} stroke={color} strokeWidth={2.0} strokeLinecap="round" />
        <line x1={-3} y1={-len * 0.22} x2={3} y2={-len * 0.22} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <line x1={-3} y1={len * 0.22} x2={3} y2={len * 0.22} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
      </g>
    );
  };

  const totalBlush = Math.min(1, face.blush + solved.blushBoost);
  const pulse = 1 + Math.sin(animTimeSec * 8) * 0.06;
  const sweatCycle = (animTimeSec * 0.65) % 1;
  const sweatY = sweatCycle * 9;
  const sweatAlpha = Math.sin(sweatCycle * Math.PI) * Math.min(0.92, solved.sweatDrop);
  const gloomGradId = `gloom_grad_${uid}`;

  return (
    <g>
      {/* Subtle Upper-Face Gloom Shading Gradient (sad / bored / dread) */}
      {solved.gloomLines > 0.28 && (
        <>
          <defs>
            <linearGradient id={gloomGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" stopOpacity={Math.min(0.45, solved.gloomLines * 0.45)} />
              <stop offset="100%" stopColor="#1E293B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ellipse
            cx={0}
            cy={cy - ry * 0.48}
            rx={rx * 0.88}
            ry={ry * 0.46}
            fill={`url(#${gloomGradId})`}
          />
        </>
      )}

      {/* Blush Glow + Delicate Studio Cheek Hatching */}
      {totalBlush > 0.05 && (
        <g opacity={totalBlush * 0.58}>
          <ellipse cx={-eyeSpacing * 1.15} cy={eyeY + eyeDims.ry * 1.2} rx={rx * 0.22} ry={ry * 0.095} fill="#FB7185" />
          <ellipse cx={eyeSpacing * 1.15} cy={eyeY + eyeDims.ry * 1.2} rx={rx * 0.22} ry={ry * 0.095} fill="#FB7185" />
          {totalBlush > 0.42 && (
            <g stroke="#E11D48" strokeWidth={0.95} strokeLinecap="round" opacity={0.5}>
              {[-1, 1].map((s) => (
                <g key={`blush_hatch_${s}`} transform={`translate(${s * eyeSpacing * 1.15}, ${eyeY + eyeDims.ry * 1.2})`}>
                  <line x1={-4.5} y1={2} x2={-2} y2={-2.5} />
                  <line x1={0} y1={2.5} x2={2.5} y2={-2} />
                  <line x1={4.5} y1={2} x2={7} y2={-2.5} />
                </g>
              ))}
            </g>
          )}
        </g>
      )}

      {/* Face Paint */}
      {face.facePaint === 'eye_black' && (
        <g opacity={0.88}>
          <rect x={-eyeSpacing - 10} y={eyeY + eyeDims.ry + 2} width={20} height={6} rx={2} fill="#18181B" />
          <rect x={eyeSpacing - 10} y={eyeY + eyeDims.ry + 2} width={20} height={6} rx={2} fill="#18181B" />
        </g>
      )}
      {face.facePaint === 'war_stripes' && (
        <g opacity={0.85}>
          <path d={`M ${-rx * 0.75} ${eyeY + 8} L ${-rx * 0.3} ${eyeY + 14}`} stroke="#DC2626" strokeWidth={4} strokeLinecap="round" />
          <path d={`M ${rx * 0.75} ${eyeY + 8} L ${rx * 0.3} ${eyeY + 14}`} stroke="#DC2626" strokeWidth={4} strokeLinecap="round" />
        </g>
      )}
      {face.facePaint === 'clown_star' && (
        <polygon
          points={`${eyeSpacing},${eyeY - 18} ${eyeSpacing + 5},${eyeY - 6} ${eyeSpacing + 17},${eyeY - 6} ${eyeSpacing + 7},${eyeY + 2} ${eyeSpacing + 11},${eyeY + 14} ${eyeSpacing},${eyeY + 6} ${eyeSpacing - 11},${eyeY + 14} ${eyeSpacing - 7},${eyeY + 2} ${eyeSpacing - 17},${eyeY - 6} ${eyeSpacing - 5},${eyeY - 6}`}
          fill="#2563EB"
          opacity={0.4}
        />
      )}

      {/* Freckles */}
      {face.freckles && (
        <g fill={shadeHex(metrics.skinColor, -0.3)} opacity={0.7}>
          {[-1, 1].map((s) => (
            <g key={s}>
              <circle cx={s * eyeSpacing * 0.95} cy={noseY + 2} r={1.2} />
              <circle cx={s * eyeSpacing * 1.15} cy={noseY + 5} r={1.1} />
              <circle cx={s * eyeSpacing * 1.05} cy={noseY + 8} r={1.3} />
              <circle cx={s * eyeSpacing * 1.32} cy={noseY + 2} r={1.0} />
            </g>
          ))}
        </g>
      )}

      {/* Wrinkles */}
      {face.wrinkles && (
        <g stroke={shadeHex(metrics.skinColor, -0.22)} strokeWidth={1.1} fill="none" strokeLinecap="round">
          <path d={`M ${-rx * 0.35} ${cy - ry * 0.56} Q 0 ${cy - ry * 0.62} ${rx * 0.35} ${cy - ry * 0.56}`} />
          <path d={`M ${-rx * 0.25} ${cy - ry * 0.67} Q 0 ${cy - ry * 0.72} ${rx * 0.25} ${cy - ry * 0.67}`} />
        </g>
      )}

      {/* Scars */}
      {face.scars.map((sc, idx) => renderScar(sc.location, sc.angle, sc.size, sc.color, idx))}

      {/* Eyes & Sculpted Tapered Brows */}
      {renderEye('L')}
      {renderEye('R')}
      {renderBrow('L')}
      {renderBrow('R')}

      {/* Inner Brow Furrow Tension Lines */}
      {solved.browFurrow > 0.35 && (
        <g stroke={oc} strokeWidth={ow * 0.62} strokeLinecap="round" opacity={Math.min(0.68, solved.browFurrow)}>
          <path d={`M -3.5 ${browY + 1} Q -2 ${browY - 4} -4.5 ${browY - 8.5}`} fill="none" />
          <path d={`M 3.5 ${browY + 1} Q 2 ${browY - 4} 4.5 ${browY - 8.5}`} fill="none" />
        </g>
      )}

      {/* Nose & Articulated Mouth */}
      {!isStickman && renderNose()}
      {renderMouth()}

      {/* Beauty Mole */}
      {face.mole !== 'none' && (
        <circle
          cx={face.mole === 'left_cheek' ? -rx * 0.48 : face.mole === 'right_cheek' ? rx * 0.48 : rx * 0.28}
          cy={face.mole === 'lip' ? mouthY - 5 : noseY + 8}
          r={1.7}
          fill="#27272A"
        />
      )}

      {/* Smooth Eased Sweat Drop */}
      {solved.sweatDrop > 0.32 && (
        <g transform={`translate(${rx * 0.84}, ${cy - ry * 0.42 + sweatY})`} opacity={sweatAlpha}>
          <path
            d="M 0 -5.5 C 3.8 -0.8, 4.0 4.5, 0 5.0 C -4.0 4.5, -3.8 -0.8, 0 -5.5 Z"
            fill="#7DD3FC"
            stroke="#0284C7"
            strokeWidth={0.95}
          />
          <circle cx={-1.0} cy={1.0} r={1.2} fill="#FFFFFF" opacity={0.92} />
        </g>
      )}

      {/* Crisp Vector Comic Anger Cross-Vein */}
      {solved.angerVein > 0.45 && (
        <g
          transform={`translate(${rx * 0.72}, ${cy - ry * 0.7}) scale(${pulse})`}
          stroke="#EF4444"
          strokeWidth={1.75}
          strokeLinecap="round"
          fill="none"
          opacity={Math.min(0.94, solved.angerVein)}
        >
          <path d="M -5.5 -1.8 Q -1.8 -1.8 -1.8 -5.5" />
          <path d="M 5.5 -1.8 Q 1.8 -1.8 1.8 -5.5" />
          <path d="M -5.5 2.4 Q -1.8 2.4 -1.8 6.0" />
          <path d="M 5.5 2.4 Q 1.8 2.4 1.8 6.0" />
        </g>
      )}

      {/* Vector-Crafted Shock Radial Lines + ! Mark */}
      {solved.shockLines > 0.48 && (
        <g transform={`scale(${pulse})`} opacity={Math.min(0.94, solved.shockLines)}>
          <g stroke="#F59E0B" strokeWidth={1.75} strokeLinecap="round">
            <line x1={rx * 1.05} y1={cy - ry * 0.72} x2={rx * 1.32} y2={cy - ry * 0.92} />
            <line x1={rx * 1.12} y1={cy - ry * 0.45} x2={rx * 1.38} y2={cy - ry * 0.54} />
            <line x1={-rx * 1.05} y1={cy - ry * 0.72} x2={-rx * 1.32} y2={cy - ry * 0.92} />
            <line x1={-rx * 1.12} y1={cy - ry * 0.45} x2={-rx * 1.38} y2={cy - ry * 0.54} />
          </g>
          {solved.shockLines > 0.65 && (
            <g transform={`translate(${rx * 1.18}, ${cy - ry * 0.96}) rotate(10)`}>
              <rect x={-1.8} y={-11} width={3.6} height={11} rx={1.8} fill="#F59E0B" stroke="#0F172A" strokeWidth={0.8} />
              <circle cx={0} cy={3.5} r={2.0} fill="#F59E0B" stroke="#0F172A" strokeWidth={0.8} />
            </g>
          )}
        </g>
      )}

      {/* Twinkling Joy/Excitement Vector Sparkles */}
      {solved.sparkleLevel > 0.5 && (
        <g fill="#FBBF24" stroke="#FEF08A" strokeWidth={0.6} opacity={Math.min(0.92, solved.sparkleLevel)}>
          {[
            { x: rx * 1.12, y: cy - ry * 0.52, s: 6.4 * (0.85 + 0.2 * Math.sin(animTimeSec * 5.2)) },
            { x: -rx * 1.08, y: cy - ry * 0.64, s: 4.8 * (0.85 + 0.2 * Math.cos(animTimeSec * 4.6)) },
          ].map((sp, i) => (
            <path
              key={`spark_${i}`}
              d={`M ${sp.x} ${sp.y - sp.s} Q ${sp.x + sp.s * 0.2} ${sp.y - sp.s * 0.2} ${sp.x + sp.s} ${sp.y} Q ${sp.x + sp.s * 0.2} ${sp.y + sp.s * 0.2} ${sp.x} ${sp.y + sp.s} Q ${sp.x - sp.s * 0.2} ${sp.y + sp.s * 0.2} ${sp.x - sp.s} ${sp.y} Q ${sp.x - sp.s * 0.2} ${sp.y - sp.s * 0.2} ${sp.x} ${sp.y - sp.s} Z`}
            />
          ))}
        </g>
      )}

      {/* Vector-Crafted Confused Question Mark */}
      {solved.confusedMarks > 0.5 && (
        <g
          transform={`translate(${rx * 1.1}, ${cy - ry * 0.92 + Math.sin(animTimeSec * 3.2) * 2.0}) rotate(12)`}
          opacity={Math.min(0.92, solved.confusedMarks)}
        >
          <path
            d="M -4 -9 C -4 -14, 4.5 -14, 4.5 -9.5 C 4.5 -6, 0 -5.2, 0 -1.5"
            fill="none"
            stroke="#38BDF8"
            strokeWidth={3.0}
            strokeLinecap="round"
          />
          <circle cx={0} cy={3.2} r={1.9} fill="#38BDF8" />
        </g>
      )}
    </g>
  );
};
