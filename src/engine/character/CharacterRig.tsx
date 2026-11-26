/**
 * Hierarchical Layered SVG Character Rig Renderer
 * Renders base stickman-inspired proportions, articulated limbs, segmented clothing,
 * procedural face, hair, headwear, eyewear, piercings, tattoos, accessories, and held props.
 */

import React, { useId } from 'react';
import {
  renderEyewear,
  renderHeadwearBack,
  renderHeadwearFront,
  renderPiercings,
  renderProp,
  renderTattooOnSurface,
  renderTorsoAccessories,
} from '../../assets/accessoriesCatalog';
import { renderFacialHair } from '../../assets/facialHairCatalog';
import { renderHairBack, renderHairFront } from '../../assets/hairCatalog';
import { resolveAssetColors } from '../../assets/registry';
import {
  renderFootwear,
  renderLowerBodyPelvis,
  renderSleeveForearm,
  renderSleeveUpperArm,
  renderTrouserShin,
  renderTrouserThigh,
  renderUpperBodyBack,
  renderUpperBodyTorso,
} from '../../assets/wardrobeCatalog';
import { CharacterDefinition, RenderStyle, TattooSurface } from '../../schemas/character.schema';
import { SolvedFaceParameters } from '../expression/expressionSolver';
import { ProceduralFace } from '../expression/ProceduralFace';
import { computeBodyMetrics, getHeadPath, shadeHex } from './bodyGeometry';
import { HandRenderer } from './HandRenderer';
import { computeSkeletonWorld, DEFAULT_RIG_POSE, RigPose } from './skeleton';

interface CharacterRigProps {
  character: CharacterDefinition;
  pose?: RigPose;
  faceParams: SolvedFaceParameters;
  showSkeletonOverlay?: boolean;
  facing?: 1 | -1;
  renderStyle?: RenderStyle;
  animTimeSec?: number;
}

export const CharacterRig: React.FC<CharacterRigProps> = ({
  character,
  pose = DEFAULT_RIG_POSE,
  faceParams,
  showSkeletonOverlay = false,
  facing = 1,
  renderStyle = '2.5d_parallax',
  animTimeSec = 0,
}) => {
  const reactUid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const metrics = computeBodyMetrics(character.body);
  const { equipment, face } = character;
  const oc = metrics.outlineColor;
  const ow = metrics.outlineWidth;
  const detailOw = ow * 0.85;
  const isStickman = character.characterType === 'stickman';
  const stickStroke = Math.max(4.4, ow * 2.9);

  // Resolved asset color palettes
  const hairColors = resolveAssetColors(equipment.hair, 'hair', equipment.colorOverrides);
  const facialHairColors = resolveAssetColors(equipment.facialHair, 'facialHair', equipment.colorOverrides);
  const headwearColors = resolveAssetColors(equipment.headwear, 'headwear', equipment.colorOverrides);
  const eyewearColors = resolveAssetColors(equipment.eyewear, 'eyewear', equipment.colorOverrides);
  const upperColors = resolveAssetColors(equipment.upperBody, 'upperBody', equipment.colorOverrides);
  const lowerColors = resolveAssetColors(equipment.lowerBody, 'lowerBody', equipment.colorOverrides);
  const footwearColors = resolveAssetColors(equipment.footwear, 'footwear', equipment.colorOverrides);
  const propRightColors = resolveAssetColors(equipment.propRight, 'propRight', equipment.colorOverrides);
  const propLeftColors = resolveAssetColors(equipment.propLeft, 'propLeft', equipment.colorOverrides);

  const hasGloves = equipment.accessories.includes('gloves');
  const hasBackpack = equipment.accessories.includes('backpack');
  const hasBelt = equipment.accessories.includes('belt_utility');
  const hasWatch = equipment.accessories.includes('watch_001');

  const tattoosFor = (surface: TattooSurface) =>
    equipment.tattoos.filter((t) => t.surface === surface);

  const renderLimbSegment = (
    topW: number,
    botW: number,
    len: number,
    fill: string
  ) => (
    <g>
      <path
        d={`M ${-topW} 0 A ${topW} ${topW * 0.7} 0 0 1 ${topW} 0 L ${botW} ${len} A ${botW} ${botW * 0.7} 0 0 1 ${-botW} ${len} Z`}
        fill={fill}
        stroke={oc}
        strokeWidth={detailOw}
        strokeLinejoin="round"
      />
      <path
        d={`M ${-topW * 0.45} 4 L ${-botW * 0.45} ${len - 4}`}
        stroke="#FFFFFF"
        strokeWidth={Math.max(1.2, topW * 0.18)}
        strokeLinecap="round"
        opacity={0.16}
      />
    </g>
  );

  const renderEar = (side: 'L' | 'R') => {
    if (isStickman) return null;
    const sign = side === 'L' ? -1 : 1;
    const ex = sign * (metrics.headRx * 0.98);
    const ey = metrics.headCenterY + 2;
    const rx = face.earStyle === 'gauged' ? 8.5 : 7;
    const ry = face.earStyle === 'pointed' ? 12 : 10.5;
    return (
      <g key={`ear_${side}`} transform={`translate(${ex}, ${ey})`}>
        {face.earStyle === 'pointed' ? (
          <path
            d={`M 0 -8 Q ${sign * 14} -14 ${sign * 12} 4 Q ${sign * 6} 12 0 8 Z`}
            fill={metrics.skinShadow}
            stroke={oc}
            strokeWidth={detailOw * 0.9}
          />
        ) : (
          <ellipse
            cx={sign * 2}
            cy={0}
            rx={rx}
            ry={ry}
            fill={metrics.skinShadow}
            stroke={oc}
            strokeWidth={detailOw * 0.9}
          />
        )}
        <path
          d={`M ${sign * 1} -4 Q ${sign * 4.5} 0 ${sign * 1} 5`}
          fill="none"
          stroke={oc}
          strokeWidth={detailOw * 0.55}
          strokeLinecap="round"
        />
        {face.earStyle === 'gauged' && (
          <circle cx={sign * 2.5} cy={5} r={3.2} fill="#0F172A" stroke="#64748B" strokeWidth={1.1} />
        )}
      </g>
    );
  };

  const renderArm = (side: 'L' | 'R') => {
    const isLeft = side === 'L';
    const shoulderRatio = isStickman ? 0.52 : 1.0;
    const sx =
      (isLeft ? -metrics.shoulderHalfW : metrics.shoulderHalfW) *
      pose.torsoScaleX *
      shoulderRatio;
    const sy = -metrics.torsoLen * pose.torsoScaleY + 10;
    const uRot = isLeft ? pose.upperArmLRot : pose.upperArmRRot;
    const fRot = isLeft ? pose.forearmLRot : pose.forearmRRot;
    const hRot = isLeft ? pose.handLRot : pose.handRRot;
    const hPose = isLeft ? pose.handPoseL : pose.handPoseR;
    const propId = isLeft ? equipment.propLeft : equipment.propRight;
    const propColors = isLeft ? propLeftColors : propRightColors;

    return (
      <g key={`arm_${side}`} transform={`translate(${sx}, ${sy}) rotate(${uRot})`}>
        {isStickman ? (
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={metrics.upperArmLen}
            stroke={oc}
            strokeWidth={stickStroke * 0.88}
            strokeLinecap="round"
          />
        ) : (
          <>
            {renderLimbSegment(metrics.upperArmW, metrics.upperArmW * 0.9, metrics.upperArmLen, metrics.skinColor)}
            {tattoosFor(isLeft ? 'upper_arm_l' : 'upper_arm_r').map((t, i) => (
              <g key={i}>{renderTattooOnSurface(t, metrics)}</g>
            ))}
            {renderSleeveUpperArm(equipment.upperBody, metrics, upperColors)}
          </>
        )}

        {/* Forearm child joint at elbow */}
        <g transform={`translate(0, ${metrics.upperArmLen}) rotate(${fRot})`}>
          {isStickman ? (
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={metrics.forearmLen}
              stroke={oc}
              strokeWidth={stickStroke * 0.82}
              strokeLinecap="round"
            />
          ) : (
            <>
              {renderLimbSegment(metrics.upperArmW * 0.88, metrics.forearmW, metrics.forearmLen, metrics.skinColor)}
              {tattoosFor(isLeft ? 'forearm_l' : 'forearm_r').map((t, i) => (
                <g key={i}>{renderTattooOnSurface(t, metrics)}</g>
              ))}
              {renderSleeveForearm(equipment.upperBody, metrics, upperColors)}
            </>
          )}

          {/* Wrist Watch on Left Forearm */}
          {!isStickman && isLeft && hasWatch && (
            <g transform={`translate(0, ${metrics.forearmLen - 7})`}>
              <rect x={-metrics.forearmW - 1} y={-3} width={(metrics.forearmW + 1) * 2} height={6} rx={1.5} fill="#1E293B" stroke={oc} strokeWidth={1.1} />
              <circle cx={0} cy={0} r={4.2} fill="#F8FAFC" stroke="#1E293B" strokeWidth={1.2} />
              <line x1={0} y1={0} x2={0} y2={-2.5} stroke="#0F172A" strokeWidth={1.1} />
              <line x1={0} y1={0} x2={2} y2={0} stroke="#0F172A" strokeWidth={1.1} />
            </g>
          )}

          {/* Hand child joint at wrist */}
          <g transform={`translate(0, ${metrics.forearmLen}) rotate(${hRot})`}>
            <HandRenderer
              side={side}
              pose={propId && propId !== 'none' ? 'grip' : hPose}
              metrics={metrics}
              hasGloves={hasGloves}
              isStickman={isStickman}
            />
            {propId && propId !== 'none' && (
              <g transform={`rotate(${pose.propSwingDeg * 0.45})`}>
                {renderProp(propId, metrics, propColors)}
              </g>
            )}
          </g>
        </g>
      </g>
    );
  };

  const renderLeg = (side: 'L' | 'R') => {
    const isLeft = side === 'L';
    const hipRatio = isStickman ? 0.55 : 1.0;
    const hx = (isLeft ? -metrics.hipHalfW : metrics.hipHalfW) * hipRatio;
    const hy = 4;
    const tRot = isLeft ? pose.thighLRot : pose.thighRRot;
    const sRot = isLeft ? pose.shinLRot : pose.shinRRot;
    const fRot = isLeft ? pose.footLRot : pose.footRRot;

    return (
      <g key={`leg_${side}`} transform={`translate(${hx}, ${hy}) rotate(${tRot})`}>
        {isStickman ? (
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={metrics.thighLen}
            stroke={oc}
            strokeWidth={stickStroke * 0.96}
            strokeLinecap="round"
          />
        ) : (
          <>
            {renderLimbSegment(metrics.thighW, metrics.thighW * 0.84, metrics.thighLen, metrics.skinColor)}
            {isLeft && tattoosFor('thigh_l').map((t, i) => <g key={i}>{renderTattooOnSurface(t, metrics)}</g>)}
            {renderTrouserThigh(equipment.lowerBody, metrics, lowerColors)}
          </>
        )}

        {/* Shin child joint at knee */}
        <g transform={`translate(0, ${metrics.thighLen}) rotate(${sRot})`}>
          {isStickman ? (
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={metrics.shinLen}
              stroke={oc}
              strokeWidth={stickStroke * 0.9}
              strokeLinecap="round"
            />
          ) : (
            <>
              {renderLimbSegment(metrics.thighW * 0.82, metrics.shinW, metrics.shinLen, metrics.skinColor)}
              {!isLeft && tattoosFor('shin_r').map((t, i) => <g key={i}>{renderTattooOnSurface(t, metrics)}</g>)}
              {renderTrouserShin(equipment.lowerBody, metrics, lowerColors)}
            </>
          )}

          {/* Foot child joint at ankle */}
          <g transform={`translate(0, ${metrics.shinLen}) rotate(${fRot})`}>
            {isStickman ? (
              <g>
                <path
                  d={`M -4 0 L ${metrics.footLen * 0.88} 0 Q ${metrics.footLen * 0.96} ${metrics.footHeight * 0.55} ${metrics.footLen * 0.72} ${metrics.footHeight * 0.65} L -4 ${metrics.footHeight * 0.65} Z`}
                  fill={upperColors.main || oc}
                  stroke={oc}
                  strokeWidth={detailOw}
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              renderFootwear(equipment.footwear, metrics, footwearColors)
            )}
          </g>
        </g>
      </g>
    );
  };

  const skeletonPoints = showSkeletonOverlay ? computeSkeletonWorld(metrics, pose) : null;

  const pelvisX = pose.pelvisX + pose.bodyShakeX;
  const pelvisY = metrics.restPelvisY + pose.pelvisYOffset + pose.bodyShakeY;

  const torsoBasePath = `M ${-metrics.shoulderHalfW} ${-metrics.torsoLen + 4} Q 0 ${-metrics.torsoLen - 4} ${metrics.shoulderHalfW} ${-metrics.torsoLen + 4} Q ${metrics.waistHalfW + 3} ${-metrics.torsoLen * 0.42} ${metrics.hipHalfW} 2 Q 0 9 ${-metrics.hipHalfW} 2 Q ${-metrics.waistHalfW - 3} ${-metrics.torsoLen * 0.42} ${-metrics.shoulderHalfW} ${-metrics.torsoLen + 4} Z`;

  const shadowLift = Math.max(0.45, 1 - Math.max(0, -pose.pelvisYOffset) * 0.008);
  const is25D = renderStyle === '2.5d_parallax';
  const isStorybook = renderStyle === '2d_storybook';

  const stickHeadFill = shadeHex(metrics.skinColor, 0.72);
  const stickAccentColor = upperColors.main || '#2563EB';

  return (
    <g transform={`scale(${facing}, 1)`}>
      {/* Soft Ground Contact + Angled Ambient Cast Shadow (CinemaToon 2.5D depth) */}
      {(is25D || isStorybook) && (
        <ellipse
          cx={pelvisX - 34}
          cy={metrics.footHeight * 0.62 + 4}
          rx={Math.max(40, 64 * shadowLift)}
          ry={9.5 * shadowLift}
          transform="skewX(-34)"
          fill={is25D ? '#020617' : '#451A03'}
          opacity={is25D ? 0.18 : 0.14}
        />
      )}
      <ellipse
        cx={pelvisX}
        cy={metrics.footHeight * 0.55 + 2}
        rx={Math.max(25, 44 * shadowLift)}
        ry={7 * shadowLift}
        fill="#09090B"
        opacity={0.16}
      />

      {/* Pelvis Root Joint */}
      <g transform={`translate(${pelvisX}, ${pelvisY}) rotate(${pose.pelvisRot})`}>
        {/* Back leg (L) slightly recessed in depth */}
        <g opacity={0.93}>
          {renderLeg('L')}
        </g>
        {renderLeg('R')}

        {/* Pelvis / Hip Base + Lower Garment */}
        {isStickman ? (
          <line
            x1={-metrics.hipHalfW * 0.55}
            y1={4}
            x2={metrics.hipHalfW * 0.55}
            y2={4}
            stroke={oc}
            strokeWidth={stickStroke * 0.92}
            strokeLinecap="round"
          />
        ) : (
          <>
            <ellipse
              cx={0}
              cy={4}
              rx={metrics.hipHalfW + 3}
              ry={metrics.pelvisHeight * 0.65}
              fill={metrics.skinColor}
              stroke={oc}
              strokeWidth={detailOw}
            />
            {renderLowerBodyPelvis(equipment.lowerBody, metrics, lowerColors, pose.clothSwingDeg)}

            {/* Utility Belt */}
            {hasBelt && (
              <g transform="translate(0, -1)">
                <rect x={-metrics.hipHalfW - 4} y={-4} width={(metrics.hipHalfW + 4) * 2} height={8} rx={2} fill="#1C1917" stroke={oc} strokeWidth={detailOw * 0.75} />
                <rect x={-5} y={-5} width={10} height={10} rx={1.5} fill="#D4D4D8" stroke={oc} strokeWidth={1.1} />
                <rect x={-metrics.hipHalfW - 3} y={-3} width={8} height={11} rx={1.5} fill="#292524" stroke={oc} strokeWidth={1.0} />
              </g>
            )}
          </>
        )}

        {/* Torso Child Joint */}
        <g transform={`translate(0, -4) rotate(${pose.torsoRot}) scale(${pose.torsoScaleX}, ${pose.torsoScaleY})`}>
          {/* Behind-body Backpack */}
          {!isStickman && hasBackpack && (
            <g transform={`translate(0, ${-metrics.torsoLen * 0.85})`}>
              <rect x={-metrics.shoulderHalfW * 1.15} y={0} width={metrics.shoulderHalfW * 2.3} height={metrics.torsoLen * 0.68} rx={10} fill="#334155" stroke={oc} strokeWidth={detailOw} />
            </g>
          )}

          {/* Behind-body Coat Tail / Hoodie Hood */}
          {!isStickman && renderUpperBodyBack(equipment.upperBody, metrics, upperColors, pose.clothSwingDeg)}

          {/* Back Arm (Left) recessed slightly in depth */}
          <g opacity={0.93}>
            {renderArm('L')}
          </g>

          {/* Torso Base: Stickman Spine OR Full Cartoon Torso + Wardrobe */}
          {isStickman ? (
            <g>
              {/* Sleek stickman spine & shoulder crossbar */}
              <line
                x1={0}
                y1={6}
                x2={0}
                y2={-metrics.torsoLen + 4}
                stroke={oc}
                strokeWidth={stickStroke * 1.08}
                strokeLinecap="round"
              />
              <line
                x1={-metrics.shoulderHalfW * 0.52}
                y1={-metrics.torsoLen + 10}
                x2={metrics.shoulderHalfW * 0.52}
                y2={-metrics.torsoLen + 10}
                stroke={oc}
                strokeWidth={stickStroke * 0.92}
                strokeLinecap="round"
              />
              {/* Subtle color-coded stickman chest badge / tie accent so characters stay distinct */}
              {equipment.accessories.includes('necktie') ? (
                <path
                  d={`M -3 ${-metrics.torsoLen + 10} L 3 ${-metrics.torsoLen + 10} L 5 ${-metrics.torsoLen * 0.45} L 0 ${-metrics.torsoLen * 0.36} L -5 ${-metrics.torsoLen * 0.45} Z`}
                  fill={stickAccentColor}
                  stroke={oc}
                  strokeWidth={detailOw * 0.8}
                />
              ) : (
                <circle
                  cx={0}
                  cy={-metrics.torsoLen + 10}
                  r={4.2}
                  fill={stickAccentColor}
                  stroke={oc}
                  strokeWidth={detailOw * 0.8}
                />
              )}
            </g>
          ) : (
            <>
              <path d={torsoBasePath} fill={metrics.skinColor} stroke={oc} strokeWidth={detailOw} strokeLinejoin="round" />
              {tattoosFor('chest').map((t, i) => <g key={i}>{renderTattooOnSurface(t, metrics)}</g>)}

              {/* Upper Body Garment + Torso Accessories */}
              {renderUpperBodyTorso(equipment.upperBody, metrics, upperColors, pose.clothSwingDeg)}
              {renderTorsoAccessories(equipment.accessories, metrics)}

              {/* Backpack Straps over front shoulders */}
              {hasBackpack && (
                <g stroke="#1E293B" strokeWidth={4} strokeLinecap="round">
                  <line x1={-metrics.shoulderHalfW * 0.62} y1={-metrics.torsoLen + 4} x2={-metrics.waistHalfW * 0.75} y2={-6} />
                  <line x1={metrics.shoulderHalfW * 0.62} y1={-metrics.torsoLen + 4} x2={metrics.waistHalfW * 0.75} y2={-6} />
                </g>
              )}
            </>
          )}

          {/* Neck Child Joint */}
          <g transform={`translate(0, ${-metrics.torsoLen}) rotate(${pose.neckRot})`}>
            {isStickman ? (
              <line
                x1={0}
                y1={4}
                x2={0}
                y2={-metrics.neckLen}
                stroke={oc}
                strokeWidth={stickStroke * 0.9}
                strokeLinecap="round"
              />
            ) : (
              <>
                <rect
                  x={-metrics.neckWidth / 2}
                  y={-metrics.neckLen - 4}
                  width={metrics.neckWidth}
                  height={metrics.neckLen + 8}
                  rx={metrics.neckWidth * 0.35}
                  fill={metrics.skinShadow}
                  stroke={oc}
                  strokeWidth={detailOw}
                />
                {tattoosFor('neck').map((t, i) => <g key={i}>{renderTattooOnSurface(t, metrics)}</g>)}
              </>
            )}

            {/* Head Child Joint */}
            <g transform={`translate(${pose.headOffsetX}, ${-metrics.neckLen + pose.headOffsetY}) rotate(${pose.headRot})`}>
              {/* Behind-Head Layers: Hair Back + Headwear Back */}
              {renderHeadwearBack(equipment.headwear, metrics, headwearColors)}
              {renderHairBack(equipment.hair, metrics, hairColors, pose.hairSwingDeg)}

              {/* Ears */}
              {renderEar('L')}
              {renderEar('R')}

              {/* Head Base */}
              <path
                d={getHeadPath(
                  isStickman ? metrics.headRx * 1.03 : metrics.headRx,
                  isStickman ? metrics.headRy * 0.96 : metrics.headRy,
                  metrics.headCenterY,
                  isStickman ? 'round' : metrics.headShape
                )}
                fill={isStickman ? stickHeadFill : metrics.skinColor}
                stroke={oc}
                strokeWidth={isStickman ? Math.max(1.5, ow * 1.1) : ow}
                strokeLinejoin="round"
              />
              {/* Subtle 2.5D / Storybook atmospheric rim-light crescent */}
              {(is25D || isStorybook) && (
                <path
                  d={`M ${metrics.headRx * 0.3} ${metrics.headCenterY - metrics.headRy + 4} Q ${metrics.headRx * 0.94} ${metrics.headCenterY - metrics.headRy * 0.35} ${metrics.headRx * 0.86} ${metrics.headCenterY + metrics.headRy * 0.35}`}
                  fill="none"
                  stroke={is25D ? '#7DD3FC' : '#FEF3C7'}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  opacity={0.4}
                />
              )}

              {/* Head Tattoos */}
              {!isStickman && tattoosFor('forehead').map((t, i) => <g key={`tat_fh_${i}`}>{renderTattooOnSurface(t, metrics)}</g>)}
              {!isStickman && tattoosFor('cheek_l').map((t, i) => <g key={`tat_cl_${i}`}>{renderTattooOnSurface(t, metrics)}</g>)}
              {!isStickman && tattoosFor('cheek_r').map((t, i) => <g key={`tat_cr_${i}`}>{renderTattooOnSurface(t, metrics)}</g>)}

              {/* Procedural Face */}
              <ProceduralFace
                face={face}
                metrics={metrics}
                solved={faceParams}
                hairColor={hairColors.main}
                uid={reactUid}
                animTimeSec={animTimeSec}
                isStickman={isStickman}
              />

              {/* Facial Hair */}
              {renderFacialHair(equipment.facialHair, metrics, facialHairColors)}

              {/* Piercings */}
              {!isStickman && renderPiercings(equipment.piercings, metrics)}

              {/* Front Hair */}
              {renderHairFront(equipment.hair, metrics, hairColors, pose.hairSwingDeg)}

              {/* Eyewear */}
              {renderEyewear(equipment.eyewear, metrics, eyewearColors)}

              {/* Front Headwear */}
              {renderHeadwearFront(equipment.headwear, metrics, headwearColors)}
            </g>
          </g>

          {/* Front Arm (Right) */}
          {renderArm('R')}
        </g>
      </g>

      {/* Optional Skeleton Pivot & Bone Overlay */}
      {skeletonPoints && (
        <g pointerEvents="none">
          {[
            ['pelvis', 'torso'],
            ['torso', 'neck'],
            ['neck', 'head'],
            ['torso', 'shoulderL'],
            ['shoulderL', 'elbowL'],
            ['elbowL', 'wristL'],
            ['torso', 'shoulderR'],
            ['shoulderR', 'elbowR'],
            ['elbowR', 'wristR'],
            ['pelvis', 'hipL'],
            ['hipL', 'kneeL'],
            ['kneeL', 'ankleL'],
            ['pelvis', 'hipR'],
            ['hipR', 'kneeR'],
            ['kneeR', 'ankleR'],
          ].map(([a, b], idx) => {
            const pa = skeletonPoints[a as keyof typeof skeletonPoints];
            const pb = skeletonPoints[b as keyof typeof skeletonPoints];
            return (
              <line
                key={`bone_${idx}`}
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="3 2"
                opacity={0.85}
              />
            );
          })}
          {Object.entries(skeletonPoints).map(([joint, pt]) => (
            <g key={`joint_${joint}`} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle r={4} fill="#FFFFFF" stroke="#2563EB" strokeWidth={2} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
};
