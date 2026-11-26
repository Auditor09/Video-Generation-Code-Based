/**
 * SpriteForge Studio Application
 * Standalone Procedural Character Creator, Emotion Lab, Deterministic Animation Rig, and Scene Director.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Bone,
  FlipHorizontal2,
  Pause,
  Play,
  SkipBack,
  StepBack,
  StepForward,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  evaluateAnimationFrame,
  evaluateDialoguePhoneme,
} from './engine/animation/evaluator';
import { CharacterRig } from './engine/character/CharacterRig';
import { ProductionStage } from './engine/production/ProductionStage';
import {
  evaluateProductionFrame,
  getProductionDurationSec,
} from './engine/production/sequencer';
import { SceneCanvas } from './engine/scene/SceneCanvas';
import { PRODUCTION_DEMOS } from './examples/productionDemos';
import {
  AnimationConfig,
  CHARACTER_PRESETS,
  CharacterDefinition,
  ExpressionInput,
  SceneDefinition,
} from './schemas/character.schema';
import { ProductionScript } from './schemas/production.schema';
import { AnimationInspector } from './studio/AnimationInspector';
import { CharacterInspector } from './studio/CharacterInspector';
import { EmotionInspector } from './studio/EmotionInspector';
import { ExportImportModal } from './studio/ExportImportModal';
import { ProductionInspector } from './studio/ProductionInspector';
import { SCENE_PRESETS, SceneInspector } from './studio/SceneInspector';

type WorkspaceMode = 'character' | 'emotion' | 'animation' | 'scene';
type StageBackdrop = 'drafting' | 'dark' | 'transparent';

export default function App() {
  const [mode, setMode] = useState<WorkspaceMode>('character');
  const [character, setCharacter] = useState<CharacterDefinition>(() =>
    structuredClone(CHARACTER_PRESETS[0])
  );

  const [expression, setExpression] = useState<ExpressionInput>({
    emotion: { determined: 0.4 },
    faceOverrides: { brows: 'auto', eyes: 'auto', mouth: 'auto' },
    phoneme: 'X',
  });

  const [animConfig, setAnimConfig] = useState<AnimationConfig>({
    basePose: 'stand',
    action: 'idle',
    actionIntensity: 1.0,
    speed: 1.0,
    enableBreathing: true,
    enableAutoBlink: true,
    enablePhysics: true,
    handPoseLeft: 'auto',
    handPoseRight: 'auto',
  });

  const [scene, setScene] = useState<SceneDefinition>(() =>
    SCENE_PRESETS[0].build(CHARACTER_PRESETS[0].id)
  );
  const [sceneSubMode, setSceneSubMode] = useState<'single' | 'production'>('single');
  const [production, setProduction] = useState<ProductionScript>(() =>
    structuredClone(PRODUCTION_DEMOS[0].script)
  );

  // Playback & Stage Viewport State
  const [fps, setFps] = useState<number>(30);
  const [frame, setFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [dialogueDemoActive, setDialogueDemoActive] = useState<boolean>(false);
  const [backdrop, setBackdrop] = useState<StageBackdrop>('drafting');
  const [stageZoom, setStageZoom] = useState<number>(1.0);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [showSkeletonOverlay, setShowSkeletonOverlay] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  const characterSvgRef = useRef<SVGSVGElement | null>(null);
  const isProdMode = mode === 'scene' && sceneSubMode === 'production';
  const activeFps = isProdMode ? Math.max(1, production.fps || 30) : fps;
  const totalFrames = isProdMode
    ? Math.max(1, Math.round(getProductionDurationSec(production) * activeFps))
    : fps * 6; // 6-second deterministic loop window

  // Deterministic frame-stepped playback timer
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    let lastTime = performance.now();
    let acc = 0;
    const frameDuration = 1000 / activeFps;

    const tick = (now: number) => {
      const dt = Math.min(100, now - lastTime);
      lastTime = now;
      acc += dt;
      if (acc >= frameDuration) {
        const steps = Math.floor(acc / frameDuration);
        acc -= steps * frameDuration;
        setFrame((prev) => (prev + steps) % totalFrames);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, activeFps, totalFrames]);

  // Evaluate current deterministic frame
  const safeFrame = frame % totalFrames;
  const timeSec = safeFrame / activeFps;
  const activePhoneme = dialogueDemoActive
    ? evaluateDialoguePhoneme(timeSec % 2.8)
    : expression.phoneme;

  const evaluated = evaluateAnimationFrame(safeFrame, activeFps, animConfig, {
    ...expression,
    phoneme: activePhoneme,
  });

  const overrideCharMap = new Map<string, CharacterDefinition>([[character.id, character]]);
  const evaluatedProd = evaluateProductionFrame(production, safeFrame, overrideCharMap);

  const getCharacterSvgMarkup = (): string | null => {
    const svgEl = characterSvgRef.current;
    if (!svgEl) return null;
    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return new XMLSerializer().serializeToString(clone);
  };

  const backdropClass =
    backdrop === 'dark'
      ? 'drafting-grid-dark'
      : backdrop === 'transparent'
      ? 'checker-transparent'
      : 'drafting-grid-light';

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Bar Contract: 3 zones (Wordmark — 4 nav links — 1 primary CTA) */}
      <header className="h-14 px-6 border-b border-slate-200 bg-white flex items-center justify-between gap-8 shrink-0">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setMode('character');
          }}
          className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          SpriteForge
        </a>

        <nav className="flex items-center gap-6 overflow-x-auto">
          {(
            [
              ['character', 'Character Studio'],
              ['emotion', 'Emotion Lab'],
              ['animation', 'Animation Rig'],
              ['scene', 'Scene Director'],
            ] as Array<[WorkspaceMode, string]>
          ).map(([id, label]) => {
            const active = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'border-blue-600 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Export JSON
          </button>
        </div>
      </header>

      {/* Main 2-Column Studio Workbench */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12">
        {/* Left/Center Interactive Viewport */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[460px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
          {/* Viewport Toolbar */}
          <div className="h-11 px-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-white shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
              <span className="font-medium text-slate-800 truncate">
                {isProdMode ? evaluatedProd.scene.title : character.name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Frame {String(safeFrame).padStart(3, '0')}/{totalFrames}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeFps} FPS</span>
              {mode === 'scene' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">
                    {isProdMode ? production.aspectRatio : scene.aspectRatio}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Backdrop Switcher */}
              {mode !== 'scene' && (
                <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-md mr-1">
                  {(
                    [
                      ['drafting', 'Grid'],
                      ['dark', 'Dark'],
                      ['transparent', 'Alpha'],
                    ] as Array<[StageBackdrop, string]>
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBackdrop(id)}
                      className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                        backdrop === id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSkeletonOverlay((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                  showSkeletonOverlay
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
                title="Toggle skeleton pivot overlay"
              >
                <Bone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Rig</span>
              </button>

              {mode !== 'scene' && (
                <>
                  <button
                    type="button"
                    onClick={() => setFacing((f) => (f === 1 ? -1 : 1))}
                    className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    title="Flip character facing"
                  >
                    <FlipHorizontal2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStageZoom((z) => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                    className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono tabular-nums text-slate-500 w-10 text-center">
                    {Math.round(stageZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setStageZoom((z) => Math.min(1.75, Number((z + 0.15).toFixed(2))))}
                    className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Primary Stage Canvas */}
          <div className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 ${mode === 'scene' ? 'bg-slate-900' : backdropClass}`}>
            {mode === 'scene' ? (
              <div
                className={`bg-white shadow-lg overflow-hidden border border-slate-700 ${
                  (isProdMode ? production.aspectRatio : scene.aspectRatio) === '9:16'
                    ? 'h-full max-h-[640px] aspect-[9/16]'
                    : 'w-full max-w-[960px] aspect-[16/9]'
                }`}
              >
                {isProdMode ? (
                  <ProductionStage
                    script={production}
                    frame={safeFrame}
                    overrideCharacterMap={overrideCharMap}
                    showSkeletonOverlay={showSkeletonOverlay}
                  />
                ) : (
                  <SceneCanvas
                    scene={scene}
                    primaryCharacter={character}
                    frame={safeFrame}
                    fps={activeFps}
                    showSkeletonOverlay={showSkeletonOverlay}
                  />
                )}
              </div>
            ) : (
              <svg
                ref={characterSvgRef}
                viewBox="-220 -420 440 480"
                className="w-full h-full max-h-[620px] select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform={`scale(${stageZoom})`}>
                  <CharacterRig
                    character={character}
                    pose={evaluated.pose}
                    faceParams={evaluated.face}
                    showSkeletonOverlay={showSkeletonOverlay}
                    facing={facing}
                    animTimeSec={timeSec}
                  />
                </g>
              </svg>
            )}
          </div>

          {/* Deterministic Timeline Transport Bar */}
          <div className="h-12 px-4 border-t border-slate-200 bg-white flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setFrame(0);
                }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                title="Jump to frame 0"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setFrame((f) => (f - 1 + totalFrames) % totalFrames);
                }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                title="Previous frame"
              >
                <StepBack className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setFrame((f) => (f + 1) % totalFrames);
                }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                title="Next frame"
              >
                <StepForward className="w-4 h-4" />
              </button>
            </div>

            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={safeFrame}
              onChange={(e) => {
                setIsPlaying(false);
                setFrame(parseInt(e.target.value, 10));
              }}
              aria-label="Timeline frame scrubber"
              className="flex-1 studio-slider"
            />

            <span className="text-xs font-mono tabular-nums text-slate-500 w-16 text-right">
              {timeSec.toFixed(2)}s
            </span>
          </div>
        </section>

        {/* Right Inspector Panel */}
        <aside className="lg:col-span-5 xl:col-span-4 bg-white min-h-0 flex flex-col">
          {mode === 'character' && (
            <CharacterInspector character={character} onChange={setCharacter} />
          )}
          {mode === 'emotion' && (
            <EmotionInspector
              expression={expression}
              onChange={setExpression}
              dialogueDemoActive={dialogueDemoActive}
              onToggleDialogueDemo={() => setDialogueDemoActive((v) => !v)}
            />
          )}
          {mode === 'animation' && (
            <AnimationInspector
              config={animConfig}
              onChange={setAnimConfig}
              fps={fps}
              onFpsChange={setFps}
              evaluated={evaluated}
            />
          )}
          {mode === 'scene' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSceneSubMode('single')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sceneSubMode === 'single'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single Scene
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSceneSubMode('production');
                    setFrame(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sceneSubMode === 'production'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Production (Multi-Scene)
                </button>
              </div>
              <div className="flex-1 min-h-0">
                {sceneSubMode === 'production' ? (
                  <ProductionInspector
                    production={production}
                    onChange={setProduction}
                    evaluatedProd={evaluatedProd}
                    onJumpToFrame={(f) => {
                      setIsPlaying(false);
                      setFrame(f);
                    }}
                  />
                ) : (
                  <SceneInspector
                    scene={scene}
                    onChange={setScene}
                    primaryCharacterId={character.id}
                  />
                )}
              </div>
            </div>
          )}
        </aside>
      </main>

      <ExportImportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        character={character}
        onImportCharacter={(imported) => {
          setCharacter(imported);
          setMode('character');
        }}
        getCharacterSvgMarkup={getCharacterSvgMarkup}
      />
    </div>
  );
}
