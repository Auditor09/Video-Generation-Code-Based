/**
 * Scene Director & JSON Production Script Inspector
 */

import React, { useState } from 'react';
import { Copy, Check, Scissors, Plus, Trash2 } from 'lucide-react';
import {
  ActionType,
  CHARACTER_PRESETS,
  CURRENT_SCHEMA_VERSION,
  SceneDefinition,
} from '../schemas/character.schema';
import { BACKGROUND_OPTIONS } from '../engine/scene/scenePrimitives';

interface SceneInspectorProps {
  scene: SceneDefinition;
  onChange: (next: SceneDefinition) => void;
  primaryCharacterId: string;
}

export const SCENE_PRESETS: Array<{ label: string; build: (primaryId: string) => SceneDefinition }> = [
  {
    label: 'Bomb Defusal',
    build: (primaryId) => ({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      scene: 'bomb_defusal',
      background: 'laboratory',
      renderStyle: '2.5d_parallax',
      aspectRatio: '16:9',
      camera: { zoom: 1.0, panX: 0, panY: 0, shake: 0 },
      actors: [
        {
          id: 'actor_1',
          characterId: primaryId,
          position: { x: 0.34, y: 0.84 },
          scale: 1.0,
          facing: 1,
          basePose: 'crouch',
          actions: [{ type: 'tremble', intensity: 0.65 }],
          emotion: { scared: 0.75, determined: 0.45 },
          faceOverrides: { brows: 'worried', mouth: 'nervous_smile' },
          dialogue: 'Which wire is the real timer?!',
        },
        {
          id: 'actor_2',
          characterId: 'char_lab_scientist',
          position: { x: 0.74, y: 0.82 },
          scale: 0.98,
          facing: -1,
          basePose: 'stand',
          actions: [{ type: 'point', intensity: 1.0 }],
          emotion: { nervous: 0.7, surprised: 0.35 },
          dialogue: 'Cut the blue wire, not red!',
        },
      ],
      props: [
        {
          id: 'prop_bomb',
          type: 'bomb_device',
          position: { x: 0.52, y: 0.85 },
          scale: 1.15,
          state: { countdownSeconds: 18, armed: true, wiresCut: [] },
        },
      ],
    }),
  },
  {
    label: 'Precinct Briefing',
    build: (primaryId) => ({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      scene: 'precinct_briefing',
      background: 'police_precinct',
      aspectRatio: '16:9',
      camera: { zoom: 1.0, panX: 0, panY: 0, shake: 0 },
      actors: [
        {
          id: 'actor_1',
          characterId: primaryId,
          position: { x: 0.36, y: 0.84 },
          scale: 1.0,
          facing: 1,
          basePose: 'stand',
          actions: [{ type: 'hold_prop', intensity: 1.0 }],
          emotion: { determined: 0.8, suspicious: 0.35 },
          dialogue: 'Look at the timeline on the board.',
        },
        {
          id: 'actor_2',
          characterId: 'char_detective_noir',
          position: { x: 0.68, y: 0.84 },
          scale: 1.0,
          facing: -1,
          basePose: 'stand',
          actions: [{ type: 'shrug', intensity: 0.8 }],
          emotion: { smug: 0.5, bored: 0.3 },
          dialogue: 'That alibi does not hold up.',
        },
      ],
      props: [],
    }),
  },
  {
    label: 'Podcast Studio',
    build: (primaryId) => ({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      scene: 'podcast_episode',
      background: 'podcast_studio',
      renderStyle: '2.5d_parallax',
      aspectRatio: '16:9',
      camera: { zoom: 1.0, panX: 0, panY: 0, shake: 0 },
      actors: [
        {
          id: 'actor_host',
          characterId: primaryId,
          position: { x: 0.28, y: 0.85 },
          scale: 1.0,
          facing: 1,
          basePose: 'sit',
          actions: [{ type: 'idle', intensity: 1.0 }],
          emotion: { happy: 0.65, excited: 0.4 },
          dialogue: 'Wait until you hear what happened next!',
        },
        {
          id: 'actor_guest',
          characterId: 'char_street_skater',
          position: { x: 0.72, y: 0.85 },
          scale: 1.0,
          facing: -1,
          basePose: 'sit',
          actions: [{ type: 'gasp', intensity: 0.9 }],
          emotion: { surprised: 0.85, confused: 0.35 },
          dialogue: 'No way—did they really do that?!',
        },
      ],
      props: [],
    }),
  },
  {
    label: 'Rooftop Shorts (9:16)',
    build: (primaryId) => ({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      scene: 'rooftop_confrontation',
      background: 'rooftop_night',
      aspectRatio: '9:16',
      camera: { zoom: 1.1, panX: 0, panY: 0, shake: 0 },
      actors: [
        {
          id: 'actor_1',
          characterId: primaryId,
          position: { x: 0.5, y: 0.78 },
          scale: 1.12,
          facing: 1,
          basePose: 'stand',
          actions: [{ type: 'wave', intensity: 1.0 }],
          emotion: { confident: 0.8, excited: 0.4 },
          dialogue: 'Welcome to the night shift.',
        },
      ],
      props: [
        { id: 'lamp_1', type: 'street_lamp', position: { x: 0.2, y: 0.76 }, scale: 1.0 },
      ],
    }),
  },
];

export const SceneInspector: React.FC<SceneInspectorProps> = ({
  scene,
  onChange,
  primaryCharacterId,
}) => {
  const [copied, setCopied] = useState(false);

  const copySceneJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(scene, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const bombProp = scene.props.find((p) => p.type === 'bomb_device');

  const toggleWireCut = (wireIdx: number) => {
    onChange({
      ...scene,
      props: scene.props.map((p) => {
        if (p.type !== 'bomb_device') return p;
        const curr = p.state?.wiresCut ?? [];
        const nextWires = curr.includes(wireIdx)
          ? curr.filter((w) => w !== wireIdx)
          : [...curr, wireIdx];
        const disarmed = nextWires.includes(1); // Blue wire disarms!
        return {
          ...p,
          state: {
            ...p.state,
            wiresCut: nextWires,
            armed: !disarmed,
          },
        };
      }),
    });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-5 space-y-6">
      {/* Scene Presets */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-slate-800">Scene Templates</div>
        <div className="flex flex-wrap gap-1.5">
          {SCENE_PRESETS.map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() => onChange(sp.build(primaryCharacterId))}
              className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format, Render Style & Background */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Composition Ratio</label>
            <div className="grid grid-cols-2 gap-1">
              {(['16:9', '9:16'] as const).map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => onChange({ ...scene, aspectRatio: ar })}
                  className={`py-1.5 text-xs font-mono font-medium rounded-md border transition-colors whitespace-nowrap ${
                    scene.aspectRatio === ar
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
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Background Scene</label>
            <select
              value={scene.background}
              onChange={(e) =>
                onChange({ ...scene, background: e.target.value as SceneDefinition['background'] })
              }
              className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white"
            >
              {BACKGROUND_OPTIONS.map((bg) => (
                <option key={bg.id} value={bg.id}>
                  {bg.label} ({bg.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Camera Rig */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Camera Transform</span>
          <button
            type="button"
            onClick={() => onChange({ ...scene, camera: { zoom: 1, panX: 0, panY: 0, shake: 0 } })}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Reset Camera
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {[
            ['Zoom', 'zoom', 0.6, 1.8, 0.05],
            ['Camera Shake', 'shake', 0, 1, 0.05],
            ['Pan X', 'panX', -200, 200, 5],
            ['Pan Y', 'panY', -150, 150, 5],
          ].map(([label, key, min, max, step]) => {
            const val = scene.camera[key as keyof SceneDefinition['camera']];
            return (
              <div key={String(key)} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-mono tabular-nums text-slate-500">{val.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={Number(min)}
                  max={Number(max)}
                  step={Number(step)}
                  value={val}
                  onChange={(e) =>
                    onChange({
                      ...scene,
                      camera: { ...scene.camera, [key as string]: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full studio-slider"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Bomb Prop Controls (when present) */}
      {bombProp && (
        <div className="space-y-2.5 pt-4 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-800">Interactive Bomb Prop State</div>
          <div className="flex items-center gap-2">
            {[
              { idx: 0, label: 'Red Wire', color: 'text-red-700 border-red-200 bg-red-50' },
              { idx: 1, label: 'Blue Wire', color: 'text-blue-700 border-blue-200 bg-blue-50' },
              { idx: 2, label: 'Yellow Wire', color: 'text-amber-700 border-amber-200 bg-amber-50' },
            ].map((w) => {
              const isCut = bombProp.state?.wiresCut?.includes(w.idx);
              return (
                <button
                  key={w.idx}
                  type="button"
                  onClick={() => toggleWireCut(w.idx)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    isCut ? 'bg-slate-900 text-white border-slate-900' : w.color
                  }`}
                >
                  <Scissors className="w-3 h-3" />
                  {isCut ? `${w.label} Cut` : `Cut ${w.label}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scene Actors */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Actors ({scene.actors.length})</span>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...scene,
                actors: [
                  ...scene.actors,
                  {
                    id: `actor_${Date.now()}`,
                    characterId: CHARACTER_PRESETS[2].id,
                    position: { x: 0.65, y: 0.84 },
                    scale: 1,
                    facing: -1,
                    basePose: 'stand',
                    actions: [{ type: 'idle', intensity: 1 }],
                    emotion: { curious: 0.6 },
                    dialogue: '',
                  },
                ],
              })
            }
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Actor
          </button>
        </div>

        {scene.actors.map((actor, idx) => (
          <div key={actor.id} className="p-3 rounded-md border border-slate-200 bg-slate-50/70 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <select
                value={actor.characterId}
                onChange={(e) => {
                  const next = [...scene.actors];
                  next[idx] = { ...actor, characterId: e.target.value };
                  onChange({ ...scene, actors: next });
                }}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white font-medium flex-1"
              >
                <option value={primaryCharacterId}>Current Custom Character</option>
                {CHARACTER_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    Preset: {p.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const next = [...scene.actors];
                  next[idx] = { ...actor, facing: actor.facing === -1 ? 1 : -1 };
                  onChange({ ...scene, actors: next });
                }}
                className="px-2 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-100"
              >
                Flip
              </button>
              {scene.actors.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...scene,
                      actors: scene.actors.filter((_, i) => i !== idx),
                    })
                  }
                  className="text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={actor.actions[0]?.type ?? 'idle'}
                onChange={(e) => {
                  const next = [...scene.actors];
                  next[idx] = { ...actor, actions: [{ type: e.target.value as ActionType, intensity: 1 }] };
                  onChange({ ...scene, actors: next });
                }}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
              >
                {[
                  'idle', 'walk', 'run', 'wave', 'point', 'shrug', 'lean_in',
                  'think_chin', 'nod_agree', 'desk_slam', 'tremble', 'panic',
                  'laugh', 'gasp', 'celebrate', 'hold_prop',
                ].map((a) => (
                  <option key={a} value={a}>
                    Action: {a}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Dialogue caption..."
                value={actor.dialogue ?? ''}
                onChange={(e) => {
                  const next = [...scene.actors];
                  next[idx] = { ...actor, dialogue: e.target.value };
                  onChange({ ...scene, actors: next });
                }}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Pos X</span>
                  <span className="font-mono tabular-nums">{Math.round(actor.position.x * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.02}
                  value={actor.position.x}
                  onChange={(e) => {
                    const next = [...scene.actors];
                    next[idx] = { ...actor, position: { ...actor.position, x: parseFloat(e.target.value) } };
                    onChange({ ...scene, actors: next });
                  }}
                  className="w-full studio-slider"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Depth Y</span>
                  <span className="font-mono tabular-nums">{Math.round(actor.position.y * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.68}
                  max={0.95}
                  step={0.01}
                  value={actor.position.y}
                  onChange={(e) => {
                    const next = [...scene.actors];
                    next[idx] = { ...actor, position: { ...actor.position, y: parseFloat(e.target.value) } };
                    onChange({ ...scene, actors: next });
                  }}
                  className="w-full studio-slider"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* JSON Script Output */}
      <div className="space-y-2 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">JSON Production Script</span>
          <button
            type="button"
            onClick={copySceneJson}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>
        </div>
        <pre className="p-3 rounded-md bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-48">
          {JSON.stringify(scene, null, 2)}
        </pre>
      </div>
    </div>
  );
};
