/**
 * Procedural SVG Scene, Camera, Background & Animated Prop Renderer
 * Supports 16:9 and 9:16 aspect ratios, multi-actor compositions, parallax, and deterministic prop states.
 */

import React from 'react';
import {
  AnimationConfig,
  CHARACTER_PRESETS,
  CharacterDefinition,
  SceneDefinition,
} from '../../schemas/character.schema';
import { evaluateAnimationFrame } from '../animation/evaluator';
import { clamp, deterministicNoise } from '../animation/math';
import { CharacterRig } from '../character/CharacterRig';
import { renderSceneBackground, renderSceneForeground, renderSceneProp } from './scenePrimitives';

interface SceneCanvasProps {
  scene: SceneDefinition;
  primaryCharacter: CharacterDefinition;
  frame: number;
  fps: number;
  showSkeletonOverlay?: boolean;
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  scene,
  primaryCharacter,
  frame,
  fps,
  showSkeletonOverlay = false,
}) => {
  const isVertical = scene.aspectRatio === '9:16';
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;
  const t = frame / Math.max(1, fps);
  const renderStyle = scene.renderStyle ?? '2.5d_parallax';

  const safeShake = Math.min(0.45, Math.max(0, scene.camera.shake));
  const shakeX = safeShake > 0.02 ? deterministicNoise(101, t * 24) * 5 * safeShake : 0;
  const shakeY = safeShake > 0.02 ? deterministicNoise(202, t * 26) * 3.8 * safeShake : 0;

  const camZoom = Math.max(0.6, Math.min(2.0, scene.camera.zoom));
  const maxPanX = camZoom >= 1 ? (width / 2) * (1 - 1 / camZoom) : 0;
  const maxPanY = camZoom >= 1 ? (height / 2) * (1 - 1 / camZoom) : 0;
  const camX = clamp(scene.camera.panX + shakeX, -maxPanX, maxPanX);
  const camY = clamp(scene.camera.panY + shakeY, -maxPanY, maxPanY);

  const sortedActors = [...scene.actors].sort((a, b) => a.position.y - b.position.y);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full block select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        transform={`translate(${width / 2}, ${height / 2}) scale(${camZoom}) translate(${-width / 2 + camX}, ${-height / 2 + camY})`}
      >
        {renderSceneBackground(scene.background, width, height, t, camX, renderStyle)}

        {scene.props.map((p) => renderSceneProp(p, width, height, t))}

        {sortedActors.map((actor, idx) => {
          const charDef =
            actor.character ??
            (actor.characterId === primaryCharacter.id
              ? primaryCharacter
              : CHARACTER_PRESETS.find((p) => p.id === actor.characterId) ?? primaryCharacter);

          const primaryAction = actor.actions[0];
          const animCfg: AnimationConfig = {
            basePose: actor.basePose ?? 'stand',
            action: primaryAction?.type ?? 'idle',
            actionIntensity: primaryAction?.intensity ?? 1.0,
            speed: 1.0,
            enableBreathing: true,
            enableAutoBlink: true,
            enablePhysics: true,
          };

          const evaluated = evaluateAnimationFrame(frame + idx * 7, fps, animCfg, {
            emotion: actor.emotion,
            faceOverrides: actor.faceOverrides,
          });

          const ax = actor.position.x * width;
          const ay = actor.position.y * height;
          const sc = (actor.scale ?? 1.0) * (isVertical ? 1.32 : 1.06);

          return (
            <g key={actor.id} transform={`translate(${ax}, ${ay}) scale(${sc})`}>
              <CharacterRig
                character={charDef}
                pose={evaluated.pose}
                faceParams={evaluated.face}
                showSkeletonOverlay={showSkeletonOverlay}
                facing={actor.facing ?? 1}
                renderStyle={renderStyle}
                animTimeSec={t}
              />

              {actor.dialogue && actor.dialogue.trim() !== '' && (
                <g transform="translate(0, -345)">
                  <rect
                    x={-110}
                    y={-42}
                    width={220}
                    height={42}
                    rx={10}
                    fill="#FFFFFF"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                  />
                  <polygon points="-8,0 8,0 0,12" fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
                  <rect x={-9} y={-3} width={18} height={5} fill="#FFFFFF" />
                  <text
                    x={0}
                    y={-17}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="#0F172A"
                    fontFamily="DM Sans, sans-serif"
                  >
                    {actor.dialogue.slice(0, 32)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {renderSceneForeground(scene.background, width, height, t, camX, renderStyle)}
      </g>
    </svg>
  );
};
