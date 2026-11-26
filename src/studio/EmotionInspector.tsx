/**
 * Emotion Lab & Facial Region Override Inspector
 * Supports continuous multi-emotion blending, regional overrides, gaze control, and phoneme lip-sync testing.
 */

import React from 'react';
import {
  BrowOverride,
  EmotionKey,
  ExpressionInput,
  EyeOverride,
  MouthOverride,
  PhonemeCode,
} from '../schemas/character.schema';

interface EmotionInspectorProps {
  expression: ExpressionInput;
  onChange: (next: ExpressionInput) => void;
  dialogueDemoActive: boolean;
  onToggleDialogueDemo: () => void;
}

const ALL_EMOTIONS: Array<{ key: EmotionKey; label: string }> = [
  { key: 'happy', label: 'Happy' },
  { key: 'scared', label: 'Scared' },
  { key: 'determined', label: 'Determined' },
  { key: 'angry', label: 'Angry' },
  { key: 'sad', label: 'Sad' },
  { key: 'surprised', label: 'Surprised' },
  { key: 'suspicious', label: 'Suspicious' },
  { key: 'confident', label: 'Confident' },
  { key: 'nervous', label: 'Nervous' },
  { key: 'excited', label: 'Excited' },
  { key: 'confused', label: 'Confused' },
  { key: 'disgusted', label: 'Disgusted' },
  { key: 'embarrassed', label: 'Embarrassed' },
  { key: 'frustrated', label: 'Frustrated' },
  { key: 'curious', label: 'Curious' },
  { key: 'smug', label: 'Smug' },
  { key: 'bored', label: 'Bored' },
];

const EMOTION_MIX_PRESETS: Array<{ label: string; input: ExpressionInput }> = [
  {
    label: 'Neutral',
    input: { emotion: {}, faceOverrides: { brows: 'auto', eyes: 'auto', mouth: 'auto' }, phoneme: 'X' },
  },
  {
    label: 'Bomb Defusal Focus',
    input: {
      emotion: { scared: 0.7, determined: 0.5, nervous: 0.4 },
      faceOverrides: { brows: 'worried', eyes: 'auto', mouth: 'nervous_smile' },
      phoneme: 'X',
    },
  },
  {
    label: 'Suspicious Smug',
    input: {
      emotion: { suspicious: 0.65, smug: 0.6 },
      faceOverrides: { brows: 'skeptical', eyes: 'suspicious', mouth: 'smirk' },
      phoneme: 'X',
    },
  },
  {
    label: 'Pure Panic',
    input: {
      emotion: { scared: 0.95, surprised: 0.6 },
      faceOverrides: { brows: 'auto', eyes: 'wide', mouth: 'open_gasp' },
      phoneme: 'X',
    },
  },
  {
    label: 'Ecstatic',
    input: {
      emotion: { happy: 0.85, excited: 0.75 },
      faceOverrides: { brows: 'auto', eyes: 'auto', mouth: 'grin' },
      phoneme: 'X',
    },
  },
];

const PHONEMES: Array<{ code: PhonemeCode; hint: string }> = [
  { code: 'X', hint: 'Rest' },
  { code: 'A', hint: 'P/B/M' },
  { code: 'B', hint: 'K/S/T' },
  { code: 'C', hint: 'EH/AE' },
  { code: 'D', hint: 'AH' },
  { code: 'E', hint: 'OH' },
  { code: 'F', hint: 'OO/W' },
  { code: 'G', hint: 'F/V' },
  { code: 'H', hint: 'L' },
];

export const EmotionInspector: React.FC<EmotionInspectorProps> = ({
  expression,
  onChange,
  dialogueDemoActive,
  onToggleDialogueDemo,
}) => {
  const setWeight = (key: EmotionKey, val: number) => {
    const next = { ...expression.emotion };
    if (val <= 0.01) {
      delete next[key];
    } else {
      next[key] = val;
    }
    onChange({ ...expression, emotion: next });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5 space-y-6">
      {/* Mixed Emotion Presets */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Blended Expression Presets</span>
          <button
            type="button"
            onClick={() => onChange({ emotion: {}, faceOverrides: { brows: 'auto', eyes: 'auto', mouth: 'auto' }, phoneme: 'X' })}
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_MIX_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(structuredClone(p.input))}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Independent Facial Region Overrides */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-800">Facial Region Overrides</div>
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Brows</label>
            <select
              value={expression.faceOverrides?.brows ?? 'auto'}
              onChange={(e) =>
                onChange({
                  ...expression,
                  faceOverrides: { ...expression.faceOverrides, brows: e.target.value as BrowOverride },
                })
              }
              className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white"
            >
              <option value="auto">Auto (Blend)</option>
              <option value="neutral">Neutral</option>
              <option value="worried">Worried</option>
              <option value="angry">Angry</option>
              <option value="raised">Raised</option>
              <option value="skeptical">Skeptical</option>
              <option value="sad">Sad</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Eyes</label>
            <select
              value={expression.faceOverrides?.eyes ?? 'auto'}
              onChange={(e) =>
                onChange({
                  ...expression,
                  faceOverrides: { ...expression.faceOverrides, eyes: e.target.value as EyeOverride },
                })
              }
              className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white"
            >
              <option value="auto">Auto (Blend)</option>
              <option value="neutral">Neutral</option>
              <option value="wide">Wide</option>
              <option value="suspicious">Suspicious</option>
              <option value="squint">Squint</option>
              <option value="closed">Closed</option>
              <option value="wink_l">Wink Left</option>
              <option value="wink_r">Wink Right</option>
              <option value="rolled">Eye Roll</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Mouth</label>
            <select
              value={expression.faceOverrides?.mouth ?? 'auto'}
              onChange={(e) =>
                onChange({
                  ...expression,
                  faceOverrides: { ...expression.faceOverrides, mouth: e.target.value as MouthOverride },
                })
              }
              className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white"
            >
              <option value="auto">Auto (Blend)</option>
              <option value="neutral">Neutral</option>
              <option value="smile">Smile</option>
              <option value="grin">Big Grin</option>
              <option value="frown">Frown</option>
              <option value="nervous_smile">Nervous Smile</option>
              <option value="open_gasp">Open Gasp</option>
              <option value="grit_teeth">Grit Teeth</option>
              <option value="smirk">Smirk</option>
              <option value="pout">Pout</option>
            </select>
          </div>
        </div>

        {/* Manual Gaze Control */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Gaze Horizontal</span>
              <span className="font-mono tabular-nums text-slate-500">{(expression.gazeX ?? 0).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={expression.gazeX ?? 0}
              onChange={(e) => onChange({ ...expression, gazeX: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Gaze Vertical</span>
              <span className="font-mono tabular-nums text-slate-500">{(expression.gazeY ?? 0).toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={expression.gazeY ?? 0}
              onChange={(e) => onChange({ ...expression, gazeY: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>
        </div>
      </div>

      {/* Rhubarb Lip-Sync Viseme Tester */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Rhubarb Lip-Sync Mouth Cues</span>
          <button
            type="button"
            onClick={onToggleDialogueDemo}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              dialogueDemoActive
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            {dialogueDemoActive ? 'Stop Speech Loop' : 'Play Speech Loop'}
          </button>
        </div>
        <div className="grid grid-cols-9 gap-1">
          {PHONEMES.map((ph) => {
            const active = (expression.phoneme ?? 'X') === ph.code && !dialogueDemoActive;
            return (
              <button
                key={ph.code}
                type="button"
                onClick={() => onChange({ ...expression, phoneme: ph.code })}
                className={`py-1.5 rounded border text-center transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-mono font-semibold">{ph.code}</div>
                <div className="text-[9px] opacity-75 truncate px-0.5">{ph.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continuous 17-Emotion Sliders */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-800">Continuous Emotion Mixer (0–100%)</div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          {ALL_EMOTIONS.map(({ key, label }) => {
            const val = expression.emotion[key] ?? 0;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={val > 0 ? 'font-semibold text-blue-700' : 'text-slate-600'}>{label}</span>
                  <span className="font-mono tabular-nums text-slate-500">{Math.round(val * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={val}
                  onChange={(e) => setWeight(key, parseFloat(e.target.value))}
                  className="w-full studio-slider"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
