/**
 * Character Creator Inspector Panel
 * Handles presets, body proportions, facial geometry, hairstyles, wardrobe, tattoos, scars, and accessories.
 */

import React, { useState } from 'react';
import { Plus, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import {
  ACCESSORY_ASSETS,
  EYEWEAR_ASSETS,
  HEADWEAR_ASSETS,
  PIERCING_ASSETS,
  PROP_ASSETS,
  TATTOO_ASSETS,
} from '../assets/accessoriesCatalog';
import { FACIAL_HAIR_ASSETS } from '../assets/facialHairCatalog';
import { HAIR_ASSETS } from '../assets/hairCatalog';
import { KNOWN_ASSET_IDS, resolveAssetColors } from '../assets/registry';
import {
  FOOTWEAR_ASSETS,
  LOWER_BODY_ASSETS,
  UPPER_BODY_ASSETS,
} from '../assets/wardrobeCatalog';
import {
  BrowStyle,
  CHARACTER_PRESETS,
  CharacterDefinition,
  EarStyle,
  EyeStyle,
  HeadShape,
  NoseStyle,
  ScarLocation,
  TattooSurface,
  validateCharacterDefinition,
} from '../schemas/character.schema';

interface CharacterInspectorProps {
  character: CharacterDefinition;
  onChange: (next: CharacterDefinition) => void;
}

type SubTab = 'body' | 'face' | 'hair' | 'wardrobe' | 'details' | 'accessories';

const SKIN_SWATCHES = ['#FDE2CE', '#F7D9C4', '#F3D2B8', '#E5BA9C', '#C68C63', '#9A633E', '#6B4226'];
const HAIR_SWATCHES = ['#18181B', '#292929', '#382B24', '#5C3A21', '#8A3B23', '#D97706', '#6B7280', '#E5E7EB', '#B91C1C', '#2563EB'];
const EYE_SWATCHES = ['#3A2618', '#4B3621', '#3B4D6B', '#2E6F5E', '#52525B', '#0284C7', '#7C3AED'];

export const CharacterInspector: React.FC<CharacterInspectorProps> = ({
  character,
  onChange,
}) => {
  const [subTab, setSubTab] = useState<SubTab>('body');

  const validation = validateCharacterDefinition(character, KNOWN_ASSET_IDS);

  const updateBody = <K extends keyof CharacterDefinition['body']>(
    key: K,
    val: CharacterDefinition['body'][K]
  ) => {
    onChange({
      ...character,
      body: { ...character.body, [key]: val },
    });
  };

  const updateFace = <K extends keyof CharacterDefinition['face']>(
    key: K,
    val: CharacterDefinition['face'][K]
  ) => {
    onChange({
      ...character,
      face: { ...character.face, [key]: val },
    });
  };

  const updateEquip = <K extends keyof CharacterDefinition['equipment']>(
    key: K,
    val: CharacterDefinition['equipment'][K]
  ) => {
    onChange({
      ...character,
      equipment: { ...character.equipment, [key]: val },
    });
  };

  const updateSlotColor = (
    slotKey: string,
    assetId: string,
    channel: 'main' | 'secondary' | 'highlight',
    hex: string
  ) => {
    const current = resolveAssetColors(assetId, slotKey, character.equipment.colorOverrides);
    onChange({
      ...character,
      equipment: {
        ...character.equipment,
        colorOverrides: {
          ...character.equipment.colorOverrides,
          [slotKey]: {
            ...current,
            [channel]: hex,
          },
        },
      },
    });
  };

  const toggleArrayItem = (arr: string[], item: string): string[] =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  const renderSlider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onVal: (v: number) => void,
    unit = 'x'
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-mono tabular-nums text-slate-500">
          {value.toFixed(2)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onVal(parseFloat(e.target.value))}
        className="w-full studio-slider"
      />
    </div>
  );

  const renderColorRow = (
    label: string,
    slotKey: string,
    assetId: string,
    swatches?: string[]
  ) => {
    const resolved = resolveAssetColors(assetId, slotKey, character.equipment.colorOverrides);
    return (
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{label} Colors</span>
          <div className="flex items-center gap-2">
            {(['main', 'secondary', 'highlight'] as const).map((ch) => (
              <label key={ch} className="flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
                <span className="capitalize">{ch === 'main' ? 'Base' : ch === 'secondary' ? 'Trim' : 'Accent'}</span>
                <input
                  type="color"
                  value={resolved[ch]}
                  onChange={(e) => updateSlotColor(slotKey, assetId, ch, e.target.value)}
                  className="w-5 h-5 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
              </label>
            ))}
          </div>
        </div>
        {swatches && (
          <div className="flex flex-wrap gap-1.5">
            {swatches.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => updateSlotColor(slotKey, assetId, 'main', hex)}
                className={`w-5 h-5 rounded-full border transition-transform hover:scale-110 ${
                  resolved.main.toLowerCase() === hex.toLowerCase()
                    ? 'border-slate-900 ring-2 ring-blue-500/40'
                    : 'border-slate-300'
                }`}
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Preset Bar */}
      <div className="px-5 py-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={character.name}
            onChange={(e) => onChange({ ...character, name: e.target.value })}
            aria-label="Character name"
            className="text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none py-0.5 flex-1 min-w-0"
          />
          <button
            type="button"
            onClick={() => onChange(structuredClone(CHARACTER_PRESETS[0]))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap shrink-0"
            title="Reset to default character"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {CHARACTER_PRESETS.map((preset) => {
            const active = character.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange(structuredClone(preset))}
                className={`px-2 py-1.5 text-[11px] font-medium rounded-md border transition-colors truncate text-left ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
                title={preset.description ?? preset.name}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {validation.issues.length > 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {validation.issues.map((iss, idx) => (
                <div key={idx}>{iss.message}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Sub-Tabs */}
      <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center gap-1 overflow-x-auto">
        {(
          [
            ['body', 'Body'],
            ['face', 'Face'],
            ['hair', 'Hair'],
            ['wardrobe', 'Wardrobe'],
            ['details', 'Details & Ink'],
            ['accessories', 'Gear & Props'],
          ] as Array<[SubTab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              subTab === id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active Sub-Tab Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {subTab === 'body' && (
          <>
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-800">Head Silhouette</div>
              <div className="grid grid-cols-5 gap-1.5">
                {(['oval', 'round', 'square', 'pear', 'chiseled'] as HeadShape[]).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => updateBody('headShape', sh)}
                    className={`py-2 px-1 text-xs font-medium rounded-md border capitalize transition-colors ${
                      character.body.headShape === sh
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Skin & Ink Outline</div>
              <div className="flex flex-wrap items-center gap-2">
                {SKIN_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateBody('skinColor', hex)}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                      character.body.skinColor.toLowerCase() === hex.toLowerCase()
                        ? 'border-slate-900 ring-2 ring-blue-500/40'
                        : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
                <input
                  type="color"
                  value={character.body.skinColor}
                  onChange={(e) => updateBody('skinColor', e.target.value)}
                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                  title="Custom skin color"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {renderSlider('Outline Weight', character.body.outlineWidth, 0.8, 3.5, 0.05, (v) => updateBody('outlineWidth', v), 'px')}
                <div className="flex items-center justify-between text-xs pt-3">
                  <span className="font-medium text-slate-700">Ink Color</span>
                  <input
                    type="color"
                    value={character.body.outlineColor}
                    onChange={(e) => updateBody('outlineColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Proportions & Build</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
                {renderSlider('Overall Height', character.body.height, 0.75, 1.3, 0.02, (v) => updateBody('height', v))}
                {renderSlider('Head Scale', character.body.headSize, 0.75, 1.35, 0.02, (v) => updateBody('headSize', v))}
                {renderSlider('Shoulder Width', character.body.shoulderWidth, 0.75, 1.35, 0.02, (v) => updateBody('shoulderWidth', v))}
                {renderSlider('Torso Length', character.body.torsoLength, 0.75, 1.3, 0.02, (v) => updateBody('torsoLength', v))}
                {renderSlider('Body Thickness', character.body.bodyThickness, 0.65, 1.5, 0.02, (v) => updateBody('bodyThickness', v))}
                {renderSlider('Limb Thickness', character.body.limbThickness, 0.65, 1.45, 0.02, (v) => updateBody('limbThickness', v))}
                {renderSlider('Arm Length', character.body.armLength, 0.75, 1.3, 0.02, (v) => updateBody('armLength', v))}
                {renderSlider('Leg Length', character.body.legLength, 0.75, 1.35, 0.02, (v) => updateBody('legLength', v))}
                {renderSlider('Hand Size', character.body.handSize, 0.75, 1.4, 0.02, (v) => updateBody('handSize', v))}
                {renderSlider('Foot Size', character.body.footSize, 0.75, 1.4, 0.02, (v) => updateBody('footSize', v))}
              </div>
            </div>
          </>
        )}

        {subTab === 'face' && (
          <>
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-800">Eye Style & Iris Color</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ['large_round', 'Large Round'],
                    ['almond', 'Almond'],
                    ['sharp_narrow', 'Sharp'],
                    ['heavy_lidded', 'Heavy Lid'],
                    ['wide_anime', 'Wide Expressive'],
                    ['tired_droop', 'Tired'],
                  ] as Array<[EyeStyle, string]>
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateFace('eyeStyle', id)}
                    className={`py-2 px-2 text-xs font-medium rounded-md border transition-colors truncate ${
                      character.face.eyeStyle === id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {EYE_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateFace('eyeColor', hex)}
                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${
                      character.face.eyeColor.toLowerCase() === hex.toLowerCase()
                        ? 'border-slate-900 ring-2 ring-blue-500/40'
                        : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <input
                  type="color"
                  value={character.face.eyeColor}
                  onChange={(e) => updateFace('eyeColor', e.target.value)}
                  className="w-6 h-6 rounded border border-slate-300 cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Eyebrows</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ['natural', 'Natural'],
                    ['thick_bold', 'Thick Bold'],
                    ['arched', 'Arched'],
                    ['thin_sharp', 'Thin Sharp'],
                    ['bushy', 'Bushy'],
                  ] as Array<[BrowStyle, string]>
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateFace('browStyle', id)}
                    className={`py-2 px-2 text-xs font-medium rounded-md border transition-colors ${
                      character.face.browStyle === id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Nose & Ears</div>
              <div className="grid grid-cols-5 gap-1.5">
                {(['rounded', 'pointed', 'button', 'aquiline', 'broad'] as NoseStyle[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateFace('noseStyle', id)}
                    className={`py-1.5 px-1 text-xs font-medium rounded-md border capitalize transition-colors ${
                      character.face.noseStyle === id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(['round', 'pointed', 'lobed', 'gauged'] as EarStyle[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => updateFace('earStyle', id)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md border capitalize transition-colors ${
                      character.face.earStyle === id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {id} ear
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {subTab === 'hair' && (
          <>
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-800">Hairstyle ({HAIR_ASSETS.length})</div>
              <div className="grid grid-cols-2 gap-1.5">
                {HAIR_ASSETS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => updateEquip('hair', h.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.hair === h.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
              {renderColorRow('Hair', 'hair', character.equipment.hair, HAIR_SWATCHES)}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Facial Hair ({FACIAL_HAIR_ASSETS.length})</div>
              <div className="grid grid-cols-2 gap-1.5">
                {FACIAL_HAIR_ASSETS.map((fh) => (
                  <button
                    key={fh.id}
                    type="button"
                    onClick={() => updateEquip('facialHair', fh.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.facialHair === fh.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {fh.name}
                  </button>
                ))}
              </div>
              {character.equipment.facialHair !== 'none' &&
                renderColorRow('Facial Hair', 'facialHair', character.equipment.facialHair, HAIR_SWATCHES)}
            </div>
          </>
        )}

        {subTab === 'wardrobe' && (
          <>
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-800">Upper Body</div>
              <div className="grid grid-cols-2 gap-1.5">
                {UPPER_BODY_ASSETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateEquip('upperBody', item.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.upperBody === item.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {character.equipment.upperBody !== 'none' &&
                renderColorRow('Upper Body', 'upperBody', character.equipment.upperBody)}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Lower Body</div>
              <div className="grid grid-cols-2 gap-1.5">
                {LOWER_BODY_ASSETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateEquip('lowerBody', item.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.lowerBody === item.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {character.equipment.lowerBody !== 'none' &&
                renderColorRow('Lower Body', 'lowerBody', character.equipment.lowerBody)}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Footwear</div>
              <div className="grid grid-cols-2 gap-1.5">
                {FOOTWEAR_ASSETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateEquip('footwear', item.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.footwear === item.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {character.equipment.footwear !== 'none' &&
                renderColorRow('Footwear', 'footwear', character.equipment.footwear)}
            </div>
          </>
        )}

        {subTab === 'details' && (
          <>
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-800">Facial Features & Marks</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['freckles', 'Freckles'],
                  ['darkCircles', 'Dark Circles'],
                  ['eyeBags', 'Eye Bags'],
                  ['wrinkles', 'Forehead Wrinkles'],
                  ['dimples', 'Smile Dimples'],
                  ['missingTooth', 'Missing Tooth'],
                  ['crookedTeeth', 'Crooked Teeth'],
                ].map(([key, label]) => {
                  const checked = Boolean(character.face[key as keyof CharacterDefinition['face']]);
                  return (
                    <label key={key} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          updateFace(key as keyof CharacterDefinition['face'], e.target.checked as never)
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>

              {renderSlider('Cheek Blush', character.face.blush, 0, 1, 0.05, (v) => updateFace('blush', v), '')}

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Beauty Mole</label>
                  <select
                    value={character.face.mole}
                    onChange={(e) => updateFace('mole', e.target.value as CharacterDefinition['face']['mole'])}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    <option value="none">None</option>
                    <option value="left_cheek">Left Cheek</option>
                    <option value="right_cheek">Right Cheek</option>
                    <option value="lip">Upper Lip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Split Eyebrow</label>
                  <select
                    value={character.face.splitEyebrow}
                    onChange={(e) => updateFace('splitEyebrow', e.target.value as CharacterDefinition['face']['splitEyebrow'])}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    <option value="none">None</option>
                    <option value="left">Left Brow</option>
                    <option value="right">Right Brow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Face Paint</label>
                  <select
                    value={character.face.facePaint}
                    onChange={(e) => updateFace('facePaint', e.target.value as CharacterDefinition['face']['facePaint'])}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white"
                  >
                    <option value="none">None</option>
                    <option value="eye_black">Eye Black</option>
                    <option value="war_stripes">War Stripes</option>
                    <option value="clown_star">Star Paint</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scars Editor */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Facial Scars</span>
                <button
                  type="button"
                  onClick={() =>
                    updateFace('scars', [
                      ...character.face.scars,
                      {
                        id: `scar_${Date.now()}`,
                        location: 'left_cheek',
                        angle: -20,
                        size: 1.0,
                        color: '#A36646',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Scar
                </button>
              </div>
              {character.face.scars.map((scar, idx) => (
                <div key={scar.id} className="p-3 rounded-md border border-slate-200 bg-slate-50/70 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={scar.location}
                      onChange={(e) => {
                        const next = [...character.face.scars];
                        next[idx] = { ...scar, location: e.target.value as ScarLocation };
                        updateFace('scars', next);
                      }}
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                    >
                      <option value="left_cheek">Left Cheek</option>
                      <option value="right_cheek">Right Cheek</option>
                      <option value="left_brow">Left Brow</option>
                      <option value="right_brow">Right Brow</option>
                      <option value="forehead">Forehead</option>
                      <option value="nose_bridge">Nose Bridge</option>
                      <option value="chin">Chin</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={scar.color}
                        onChange={(e) => {
                          const next = [...character.face.scars];
                          next[idx] = { ...scar, color: e.target.value };
                          updateFace('scars', next);
                        }}
                        className="w-5 h-5 rounded border border-slate-300 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateFace(
                            'scars',
                            character.face.scars.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {renderSlider('Angle', scar.angle, -60, 60, 2, (v) => {
                      const next = [...character.face.scars];
                      next[idx] = { ...scar, angle: v };
                      updateFace('scars', next);
                    }, '°')}
                    {renderSlider('Size', scar.size, 0.5, 1.8, 0.1, (v) => {
                      const next = [...character.face.scars];
                      next[idx] = { ...scar, size: v };
                      updateFace('scars', next);
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Piercings */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Piercings</div>
              <div className="grid grid-cols-2 gap-1.5">
                {PIERCING_ASSETS.map((p) => {
                  const active = character.equipment.piercings.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => updateEquip('piercings', toggleArrayItem(character.equipment.piercings, p.id))}
                      className={`py-1.5 px-3 text-left text-xs font-medium rounded-md border transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tattoos */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Body & Face Tattoos</span>
                <button
                  type="button"
                  onClick={() =>
                    updateEquip('tattoos', [
                      ...character.equipment.tattoos,
                      { assetId: 'tattoo_tribal_band', surface: 'forearm_l', color: '#1F3A3D', scale: 1 },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tattoo
                </button>
              </div>
              {character.equipment.tattoos.map((tat, idx) => (
                <div key={idx} className="p-2.5 rounded-md border border-slate-200 bg-slate-50/70 flex items-center gap-2">
                  <select
                    value={tat.assetId}
                    onChange={(e) => {
                      const next = [...character.equipment.tattoos];
                      next[idx] = { ...tat, assetId: e.target.value };
                      updateEquip('tattoos', next);
                    }}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white flex-1 min-w-0"
                  >
                    {TATTOO_ASSETS.map((ta) => (
                      <option key={ta.id} value={ta.id}>
                        {ta.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={tat.surface}
                    onChange={(e) => {
                      const next = [...character.equipment.tattoos];
                      next[idx] = { ...tat, surface: e.target.value as TattooSurface };
                      updateEquip('tattoos', next);
                    }}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                  >
                    <option value="forehead">Forehead</option>
                    <option value="cheek_l">Left Cheek</option>
                    <option value="cheek_r">Right Cheek</option>
                    <option value="neck">Neck</option>
                    <option value="chest">Chest</option>
                    <option value="upper_arm_l">L Upper Arm</option>
                    <option value="forearm_l">L Forearm</option>
                    <option value="upper_arm_r">R Upper Arm</option>
                    <option value="forearm_r">R Forearm</option>
                    <option value="thigh_l">L Thigh</option>
                    <option value="shin_r">R Shin</option>
                  </select>
                  <input
                    type="color"
                    value={tat.color}
                    onChange={(e) => {
                      const next = [...character.equipment.tattoos];
                      next[idx] = { ...tat, color: e.target.value };
                      updateEquip('tattoos', next);
                    }}
                    className="w-5 h-5 rounded border border-slate-300 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateEquip(
                        'tattoos',
                        character.equipment.tattoos.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {subTab === 'accessories' && (
          <>
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-slate-800">Headwear</div>
              <div className="grid grid-cols-2 gap-1.5">
                {HEADWEAR_ASSETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateEquip('headwear', item.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.headwear === item.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {character.equipment.headwear !== 'none' &&
                renderColorRow('Headwear', 'headwear', character.equipment.headwear)}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Eyewear</div>
              <div className="grid grid-cols-2 gap-1.5">
                {EYEWEAR_ASSETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateEquip('eyewear', item.id)}
                    className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                      character.equipment.eyewear === item.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              {character.equipment.eyewear !== 'none' &&
                renderColorRow('Eyewear', 'eyewear', character.equipment.eyewear)}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Wearable Accessories</div>
              <div className="grid grid-cols-2 gap-1.5">
                {ACCESSORY_ASSETS.map((acc) => {
                  const active = character.equipment.accessories.includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => updateEquip('accessories', toggleArrayItem(character.equipment.accessories, acc.id))}
                      className={`py-2 px-3 text-left text-xs font-medium rounded-md border transition-colors truncate ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {acc.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-800">Handheld Props (Right / Left Hand)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Right Hand</label>
                  <select
                    value={character.equipment.propRight}
                    onChange={(e) => updateEquip('propRight', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-2 bg-white"
                  >
                    {PROP_ASSETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Left Hand</label>
                  <select
                    value={character.equipment.propLeft}
                    onChange={(e) => updateEquip('propLeft', e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-md px-2.5 py-2 bg-white"
                  >
                    {PROP_ASSETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
