/**
 * Animation Rig & Layered Motion Inspector
 */

import React from 'react';
import { EvaluatedFrame } from '../engine/animation/evaluator';
import { ActionType, AnimationConfig, BasePoseType } from '../schemas/character.schema';

interface AnimationInspectorProps {
  config: AnimationConfig;
  onChange: (next: AnimationConfig) => void;
  fps: number;
  onFpsChange: (fps: number) => void;
  evaluated: EvaluatedFrame;
}

const ACTION_GROUPS: Array<{ title: string; items: Array<{ id: ActionType; label: string }> }> = [
  {
    title: 'Basic Movement',
    items: [
      { id: 'idle', label: 'Idle' },
      { id: 'walk', label: 'Walk' },
      { id: 'run', label: 'Run' },
      { id: 'sprint', label: 'Sprint' },
      { id: 'jump', label: 'Jump' },
      { id: 'hold_prop', label: 'Hold Prop' },
    ],
  },
  {
    title: 'Interaction & Acting',
    items: [
      { id: 'wave', label: 'Wave' },
      { id: 'point', label: 'Point' },
      { id: 'shrug', label: 'Shrug' },
      { id: 'lean_in', label: 'Lean In' },
      { id: 'think_chin', label: 'Think Chin' },
      { id: 'nod_agree', label: 'Nod Agree' },
      { id: 'desk_slam', label: 'Desk Slam' },
      { id: 'clap', label: 'Clap' },
      { id: 'punch', label: 'Punch' },
      { id: 'kick', label: 'Kick' },
      { id: 'dodge', label: 'Dodge' },
    ],
  },
  {
    title: 'Reactions',
    items: [
      { id: 'laugh', label: 'Laugh' },
      { id: 'cry', label: 'Cry' },
      { id: 'panic', label: 'Panic' },
      { id: 'tremble', label: 'Tremble' },
      { id: 'celebrate', label: 'Celebrate' },
      { id: 'facepalm', label: 'Facepalm' },
      { id: 'look_around', label: 'Look Around' },
      { id: 'gasp', label: 'Gasp' },
    ],
  },
];

export const AnimationInspector: React.FC<AnimationInspectorProps> = ({
  config,
  onChange,
  fps,
  onFpsChange,
  evaluated,
}) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5 space-y-6">
      {/* Base Pose + FPS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-800">Base Pose Layer</div>
          <div className="grid grid-cols-3 gap-1">
            {(['stand', 'crouch', 'sit'] as BasePoseType[]).map((bp) => (
              <button
                key={bp}
                type="button"
                onClick={() => onChange({ ...config, basePose: bp })}
                className={`py-1.5 px-2 text-xs font-medium rounded-md border capitalize transition-colors ${
                  config.basePose === bp
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {bp}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-800">Frame Rate</div>
          <div className="grid grid-cols-2 gap-1">
            {[30, 60].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onFpsChange(rate)}
                className={`py-1.5 px-2 text-xs font-mono font-medium rounded-md border transition-colors ${
                  fps === rate
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

      {/* Action Library */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        {ACTION_GROUPS.map((grp) => (
          <div key={grp.title} className="space-y-2">
            <div className="text-xs font-semibold text-slate-800">{grp.title}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {grp.items.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => onChange({ ...config, action: act.id })}
                  className={`py-2 px-2 text-xs font-medium rounded-md border transition-colors truncate ${
                    config.action === act.id
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Timing & Physics Channels */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-800">Motion Parameters & Layers</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Action Intensity</span>
              <span className="font-mono tabular-nums text-slate-500">{config.actionIntensity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.5}
              step={0.05}
              value={config.actionIntensity}
              onChange={(e) => onChange({ ...config, actionIntensity: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Playback Speed</span>
              <span className="font-mono tabular-nums text-slate-500">{config.speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={2.5}
              step={0.05}
              value={config.speed}
              onChange={(e) => onChange({ ...config, speed: parseFloat(e.target.value) })}
              className="w-full studio-slider"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            ['enableBreathing', 'Breathing'],
            ['enableAutoBlink', 'Auto-Blink'],
            ['enablePhysics', 'Hair / Cloth Physics'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={Boolean(config[key as keyof AnimationConfig])}
                onChange={(e) =>
                  onChange({ ...config, [key]: e.target.checked })
                }
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Hand Pose Overrides */}
      <div className="space-y-2.5 pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-800">Hand Pose Channel Overrides</div>
        <div className="grid grid-cols-2 gap-3">
          {(['handPoseLeft', 'handPoseRight'] as const).map((sideKey) => (
            <div key={sideKey}>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                {sideKey === 'handPoseLeft' ? 'Left Hand' : 'Right Hand'}
              </label>
              <select
                value={config[sideKey] ?? 'auto'}
                onChange={(e) =>
                  onChange({
                    ...config,
                    [sideKey]: e.target.value as AnimationConfig['handPoseLeft'],
                  })
                }
                className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white"
              >
                <option value="auto">Auto (Action)</option>
                <option value="relaxed">Relaxed Fingers</option>
                <option value="open">Open Palm</option>
                <option value="fist">Closed Fist</option>
                <option value="point">Pointing</option>
                <option value="grip">Grip</option>
                <option value="peace">Peace Sign</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Deterministic Joint Telemetry Readout */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-800">Evaluated Pose Channels (Frame {evaluated.frame})</div>
        <div className="grid grid-cols-3 gap-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-md p-3">
          <div>
            <div className="text-[10px] text-slate-500">Pelvis Y</div>
            <div className="text-slate-900">{evaluated.pose.pelvisYOffset.toFixed(1)}px</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Torso Rot</div>
            <div className="text-slate-900">{evaluated.pose.torsoRot.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Head Rot</div>
            <div className="text-slate-900">{evaluated.pose.headRot.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Hair Swing</div>
            <div className="text-slate-900">{evaluated.pose.hairSwingDeg.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Cloth Swing</div>
            <div className="text-slate-900">{evaluated.pose.clothSwingDeg.toFixed(1)}°</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">Time</div>
            <div className="text-slate-900">{evaluated.timeSeconds.toFixed(2)}s</div>
          </div>
        </div>
      </div>
    </div>
  );
};
