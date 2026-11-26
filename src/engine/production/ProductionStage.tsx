/**
 * Multi-Scene Production Video Stage Renderer
 * Renders any frame of a ProductionScript (for both Studio Preview and Remotion Compositions).
 */

import React from 'react';
import { CharacterDefinition } from '../../schemas/character.schema';
import { ProductionScript } from '../../schemas/production.schema';
import { clamp, deterministicNoise } from '../animation/math';
import { CharacterRig } from '../character/CharacterRig';
import { renderSceneBackground, renderSceneForeground, renderSceneProp } from '../scene/scenePrimitives';
import { clampCameraToStage, evaluateProductionFrame, getActorHeadWorldTarget } from './sequencer';

interface ProductionStageProps {
  script: ProductionScript;
  frame: number;
  overrideCharacterMap?: Map<string, CharacterDefinition>;
  showSkeletonOverlay?: boolean;
}

export const ProductionStage: React.FC<ProductionStageProps> = ({
  script,
  frame,
  overrideCharacterMap,
  showSkeletonOverlay = false,
}) => {
  const isVertical = script.aspectRatio === '9:16';
  const width = isVertical ? 720 : 1280;
  const height = isVertical ? 1280 : 720;
  const evalProd = evaluateProductionFrame(script, frame, overrideCharacterMap);
  const renderStyle = evalProd.scene.renderStyle ?? script.renderStyle ?? '2.5d_parallax';
  const t = evalProd.sceneTimeSec;

  // Clamped subtle impact shake so camera never feels jittery or exposes canvas borders
  const safeShake = Math.min(0.45, Math.max(0, evalProd.camera.shake));
  const shakeX =
    safeShake > 0.02
      ? deterministicNoise(101, t * 24) * 5.0 * safeShake
      : 0;
  const shakeY =
    safeShake > 0.02
      ? deterministicNoise(202, t * 26) * 3.8 * safeShake
      : 0;

  const clampedCam = clampCameraToStage(
    evalProd.camera.zoom,
    evalProd.camera.panX + shakeX,
    evalProd.camera.panY + shakeY,
    width,
    height
  );
  const camZoom = clampedCam.zoom;
  const camX = clampedCam.panX;
  const camY = clampedCam.panY;
  const camTilt = evalProd.camera.tiltDeg ?? 0;

  const sortedActors = [...evalProd.actors].sort((a, b) => a.y - b.y);
  const isSplitScreen = evalProd.shotMode === 'split_screen' && evalProd.actors.length >= 2;
  const actorsByX = [...evalProd.actors].sort((a, b) => a.x - b.x);

  const renderWorld = (localCamX: number) => (
    <>
      {renderSceneBackground(evalProd.scene.background, width, height, t, localCamX, renderStyle)}
      {evalProd.props.map((p) => renderSceneProp(p, width, height, t))}
      {sortedActors.map((actor) => (
        <g
          key={actor.id}
          transform={`translate(${actor.x * width}, ${actor.y * height}) scale(${actor.scale * (isVertical ? 1.32 : 1.06)})`}
        >
          <CharacterRig
            character={actor.character}
            pose={actor.evaluated.pose}
            faceParams={actor.evaluated.face}
            showSkeletonOverlay={showSkeletonOverlay}
            facing={actor.facing}
            renderStyle={renderStyle}
            animTimeSec={t}
          />
        </g>
      ))}
      {renderSceneForeground(evalProd.scene.background, width, height, t, localCamX, renderStyle)}
    </>
  );

  const renderSplitPanel = (
    panelIdx: 0 | 1,
    targetActor: (typeof evalProd.actors)[number]
  ) => {
    const px = isVertical ? 0 : panelIdx === 0 ? 0 : width / 2;
    const py = isVertical ? (panelIdx === 0 ? 0 : height / 2) : 0;
    const pw = isVertical ? width : width / 2;
    const ph = isVertical ? height / 2 : height;
    const cx = px + pw / 2;
    const cy = py + ph / 2;

    const panelZoom = isVertical ? 1.48 : 1.56;
    const face = getActorHeadWorldTarget(targetActor, width, height, isVertical);
    const halfVisW = pw / (2 * panelZoom);
    const halfVisH = ph / (2 * panelZoom);

    // Frame face comfortably above center with slight lead room toward center, strictly clamped in stage
    const leadShiftX = (panelIdx === 0 ? pw * 0.05 : -pw * 0.05) / panelZoom;
    const headroomShiftY = (ph * 0.08) / panelZoom;
    const worldCenterX = clamp(face.x + leadShiftX - shakeX * 0.5, halfVisW, width - halfVisW);
    const worldCenterY = clamp(face.y + headroomShiftY - shakeY * 0.5, halfVisH, height - halfVisH);

    return (
      <g key={`split_panel_${panelIdx}`} clipPath={`url(#sf_split_clip_${panelIdx})`}>
        <g
          transform={`translate(${cx}, ${cy}) scale(${panelZoom}) translate(${-worldCenterX}, ${-worldCenterY})`}
        >
          {renderWorld(width / 2 - worldCenterX)}
        </g>
        {targetActor.isSpeaking && (
          <rect
            x={px + 3}
            y={py + 3}
            width={pw - 6}
            height={ph - 6}
            fill="none"
            stroke="#38BDF8"
            strokeWidth={3}
            opacity={0.78}
          />
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isSplitScreen ? (
          <>
            <defs>
              <clipPath id="sf_split_clip_0">
                <rect x={0} y={0} width={isVertical ? width : width / 2} height={isVertical ? height / 2 : height} />
              </clipPath>
              <clipPath id="sf_split_clip_1">
                <rect
                  x={isVertical ? 0 : width / 2}
                  y={isVertical ? height / 2 : 0}
                  width={isVertical ? width : width / 2}
                  height={isVertical ? height / 2 : height}
                />
              </clipPath>
            </defs>
            {renderSplitPanel(0, actorsByX[0])}
            {renderSplitPanel(1, actorsByX[actorsByX.length - 1])}
            {/* Clean Split-Screen Studio Divider */}
            {isVertical ? (
              <g>
                <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#09090B" strokeWidth={6} />
                <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#38BDF8" strokeWidth={1.8} opacity={0.7} />
              </g>
            ) : (
              <g>
                <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#09090B" strokeWidth={6} />
                <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#38BDF8" strokeWidth={1.8} opacity={0.7} />
              </g>
            )}
          </>
        ) : (
          <g
            transform={`translate(${width / 2}, ${height / 2}) rotate(${camTilt}) scale(${camZoom}) translate(${-width / 2 + camX}, ${-height / 2 + camY})`}
          >
            {renderWorld(camX)}
          </g>
        )}

        {/* Subtle CinemaToon Edge Vignette (frames focus without darkening the center) */}
        <defs>
          <radialGradient id="sf_stage_vignette" cx="50%" cy="48%" r="68%">
            <stop offset="68%" stopColor="#020617" stopOpacity="0" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.22" />
          </radialGradient>
        </defs>
        <rect
          width={width}
          height={height}
          fill="url(#sf_stage_vignette)"
          pointerEvents="none"
        />

        {/* Scene Transition Fade Overlay */}
        {evalProd.fadeOverlayOpacity > 0.01 && (
          <rect
            width={width}
            height={height}
            fill="#09090B"
            opacity={evalProd.fadeOverlayOpacity}
          />
        )}
      </svg>

      {/* Word-Highlighted Broadcast Captions */}
      {evalProd.activeCaption && (
        <div
          className={`absolute inset-x-0 flex justify-center px-6 pointer-events-none ${
            isVertical ? 'bottom-16' : 'bottom-8'
          }`}
        >
          <div className="max-w-[90%] bg-slate-950/85 text-white px-5 py-3 rounded-xl border border-white/15 shadow-lg text-center">
            <div className="text-[11px] font-medium text-sky-300 mb-0.5">
              {evalProd.activeCaption.speakerName}
            </div>
            <div className={`${isVertical ? 'text-xl' : 'text-lg'} font-display font-bold leading-snug tracking-tight`}>
              {evalProd.activeCaption.words.map((w, idx) => (
                <span
                  key={`cap_w_${idx}`}
                  className={
                    w.active
                      ? 'text-amber-300 underline decoration-amber-400/70 underline-offset-4'
                      : w.spoken
                      ? 'text-white'
                      : 'text-slate-300'
                  }
                >
                  {w.word}
                  {idx < evalProd.activeCaption!.words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
