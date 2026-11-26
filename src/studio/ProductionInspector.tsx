/**
 * Multi-Scene Production Sequencer Inspector
 * Includes 4 Showcase Productions, unified CinemaToon Camera Direction,
 * Idea -> Master Director Prompt Builder, Scene Sequence jumping, and JSON export/import.
 */

import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Copy, Download, Film, Sparkles, Upload } from 'lucide-react';
import { BACKGROUND_OPTIONS } from '../engine/scene/scenePrimitives';
import {
  EvaluatedProductionFrame,
  getProductionDurationSec,
} from '../engine/production/sequencer';
import { PRODUCTION_DEMOS } from '../examples/productionDemos';
import { BackgroundSceneId } from '../schemas/character.schema';
import { CameraMode, ProductionScript } from '../schemas/production.schema';
import { buildMasterDirectorPrompt, DirectorPromptOptions } from './promptGenerator';

interface ProductionInspectorProps {
  production: ProductionScript;
  onChange: (next: ProductionScript) => void;
  evaluatedProd: EvaluatedProductionFrame;
  onJumpToFrame: (frame: number) => void;
}

const TONES: Array<NonNullable<DirectorPromptOptions['tone']>> = [
  'suspense',
  'comedy',
  'action',
  'drama',
  'explainer',
];

const DURATIONS = [15, 25, 45, 60] as const;

const CAMERA_MODES: Array<{ id: CameraMode; label: string; hint: string }> = [
  { id: 'cinematic', label: 'Cinematic Auto', hint: 'OTS, closeups & reactions' },
  { id: 'podcast', label: 'Podcast Multi-Cam', hint: 'Angled cams + split peaks' },
  { id: 'standard', label: 'Manual Keyframes', hint: 'Custom script camera' },
];

export const ProductionInspector: React.FC<ProductionInspectorProps> = ({
  production,
  onChange,
  evaluatedProd,
  onJumpToFrame,
}) => {
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [idea, setIdea] = useState(
    'Two coworkers walk down a quiet neighborhood street at dusk, then hurry into a cozy cafe when it starts raining.'
  );
  const [tone, setTone] = useState<NonNullable<DirectorPromptOptions['tone']>>('comedy');
  const [targetDurationSec, setTargetDurationSec] = useState<number>(25);
  const [preferredBackgrounds, setPreferredBackgrounds] = useState<BackgroundSceneId[]>([
    'neighborhood_street',
    'cafe_diner',
  ]);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [showImportBox, setShowImportBox] = useState(false);
  const [importDraft, setImportDraft] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const totalSec = getProductionDurationSec(production);
  const fps = Math.max(1, production.fps || 30);
  const activeCameraMode: CameraMode = production.cameraMode ?? 'cinematic';

  const derivedCameraStyle: NonNullable<DirectorPromptOptions['cameraStyle']> =
    activeCameraMode === 'podcast'
      ? 'podcast'
      : activeCameraMode === 'cinematic'
      ? 'dramatic'
      : 'dynamic';

  const togglePreferredBackground = (bgId: BackgroundSceneId) => {
    setPreferredBackgrounds((prev) =>
      prev.includes(bgId) ? prev.filter((id) => id !== bgId) : [...prev, bgId]
    );
  };

  const masterPrompt = useMemo(
    () =>
      buildMasterDirectorPrompt({
        idea: idea.trim() || 'A short character-driven story.',
        aspectRatio: production.aspectRatio,
        targetDurationSec,
        tone,
        preferredBackgrounds,
        cameraStyle: derivedCameraStyle,
      }),
    [idea, production.aspectRatio, targetDurationSec, tone, preferredBackgrounds, derivedCameraStyle]
  );

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(masterPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 1800);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(production, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(production, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${production.id || 'production'}.production.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    try {
      const cleaned = importDraft
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');
      const parsed = JSON.parse(cleaned) as ProductionScript;
      if (!parsed || !Array.isArray(parsed.scenes) || !Array.isArray(parsed.characters)) {
        setImportError('JSON must include "characters" and "scenes" arrays.');
        return;
      }
      onChange({
        ...parsed,
        schemaVersion: '1.0.0',
        aspectRatio: parsed.aspectRatio === '9:16' ? '9:16' : '16:9',
        fps: parsed.fps === 60 ? 60 : 30,
      });
      setImportError(null);
      setShowImportBox(false);
      setImportDraft('');
      onJumpToFrame(0);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  let runningStartSec = 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5 space-y-6">
      {/* Showcase Productions (4 Ready-to-Play Examples) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Showcase Productions</span>
          <span className="text-[11px] font-mono text-slate-500">CinemaToon 2.5D</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRODUCTION_DEMOS.map((demo) => {
            const active = production.id === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => {
                  onChange(structuredClone(demo.script));
                  onJumpToFrame(0);
                }}
                className={`px-2.5 py-2 rounded-md border text-left transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-medium truncate">{demo.label}</div>
                <div className={`text-[10px] truncate ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                  {demo.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header, Format & Auto-Director Camera Mode */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Film className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="text"
              value={production.title}
              onChange={(e) => onChange({ ...production, title: e.target.value })}
              className="text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5 min-w-0 flex-1"
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
            {totalSec.toFixed(1)}s · {production.scenes.length} scenes
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(['16:9', '9:16'] as const).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => onChange({ ...production, aspectRatio: ar })}
                  className={`py-1.5 text-xs font-mono font-medium rounded-md border transition-colors ${
                    production.aspectRatio === ar
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Render Rate
            </label>
            <div className="grid grid-cols-2 gap-1">
              {[30, 60].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onChange({ ...production, fps: rate })}
                  className={`py-1.5 text-xs font-mono font-medium rounded-md border transition-colors ${
                    production.fps === rate
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {rate} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            Auto-Director Camera Framing
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {CAMERA_MODES.map((cm) => (
              <button
                key={cm.id}
                type="button"
                onClick={() => onChange({ ...production, cameraMode: cm.id })}
                className={`px-2 py-1.5 rounded-md border text-left transition-colors ${
                  activeCameraMode === cm.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-medium whitespace-nowrap truncate">{cm.label}</div>
                <div
                  className={`text-[10px] truncate ${
                    activeCameraMode === cm.id ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {cm.hint}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Idea -> Master Director Prompt Generator */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">
              Idea → Master Director Prompt
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
            {production.aspectRatio} · {activeCameraMode}
          </span>
        </div>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={3}
          placeholder="Describe your video idea in plain words..."
          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none resize-y"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Tone & Pacing
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as NonNullable<DirectorPromptOptions['tone']>)}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Target Length
            </label>
            <select
              value={targetDurationSec}
              onChange={(e) => setTargetDurationSec(Number(e.target.value))}
              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              {DURATIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}s
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-medium text-slate-500">
              Background Scene Options ({preferredBackgrounds.length || 'auto'})
            </label>
            {preferredBackgrounds.length > 0 && (
              <button
                type="button"
                onClick={() => setPreferredBackgrounds([])}
                className="text-[11px] text-slate-500 hover:text-slate-900"
              >
                Auto-select
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {BACKGROUND_OPTIONS.map((bg) => {
              const selected = preferredBackgrounds.includes(bg.id);
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => togglePreferredBackground(bg.id)}
                  className={`px-2 py-1 rounded border text-left text-[11px] transition-colors truncate ${
                    selected
                      ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {bg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium whitespace-nowrap transition-colors"
          >
            {promptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {promptCopied ? 'Copied Prompt' : 'Copy Master Prompt for OpenCode'}
          </button>
          <button
            type="button"
            onClick={() => setShowPromptPreview((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:border-slate-300 text-xs font-medium text-slate-700 whitespace-nowrap"
          >
            {showPromptPreview ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            Preview
          </button>
        </div>

        {showPromptPreview && (
          <pre className="p-2.5 rounded-md bg-slate-900 text-slate-100 text-[10px] leading-relaxed font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
            {masterPrompt}
          </pre>
        )}
      </div>

      {/* Multi-Scene Sequence Timeline */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-800">Scene Sequence</div>
        <div className="space-y-2">
          {production.scenes.map((sc, idx) => {
            const startSec = runningStartSec;
            runningStartSec += sc.durationSec;
            const isCurrent = evaluatedProd.sceneIndex === idx;
            const startFrame = Math.round(startSec * fps);

            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => onJumpToFrame(startFrame)}
                className={`w-full text-left p-3 rounded-md border transition-colors ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {sc.title}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                    {startSec.toFixed(1)}s–{(startSec + sc.durationSec).toFixed(1)}s
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{sc.background.replace('_', ' ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{sc.actors.length} actors</span>
                  <span aria-hidden="true">·</span>
                  <span>{sc.dialogue.length} lines</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Production JSON Export / Load */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-800">
            ProductionScript JSON
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowImportBox((v) => !v);
                setImportError(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              Load JSON
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              Save .json
            </button>
          </div>
        </div>

        {showImportBox && (
          <div className="space-y-2 p-2.5 rounded-md border border-slate-200 bg-slate-50">
            <textarea
              value={importDraft}
              onChange={(e) => setImportDraft(e.target.value)}
              rows={4}
              placeholder="Paste ProductionScript JSON generated by OpenCode or Qwen/Hermes..."
              className="w-full rounded border border-slate-200 bg-white p-2 text-[11px] font-mono text-slate-800 focus:border-blue-600 focus:outline-none"
            />
            {importError && <p className="text-[11px] text-red-600">{importError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyImport}
                className="px-3 py-1 rounded bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
              >
                Load into Stage
              </button>
            </div>
          </div>
        )}

        <pre className="p-3 rounded-md bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-56">
          {JSON.stringify(production, null, 2)}
        </pre>
      </div>
    </div>
  );
};
