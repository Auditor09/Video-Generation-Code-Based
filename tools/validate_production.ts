#!/usr/bin/env npx tsx
/**
 * SpriteForge ProductionScript Strict Validator CLI
 * Usage: npx tsx tools/validate_production.ts path/to/file.production.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { KNOWN_ASSET_IDS } from '../src/assets/registry.ts';
import { CHARACTER_PRESETS, validateCharacterDefinition } from '../src/schemas/character.schema.ts';
import { ProductionScript } from '../src/schemas/production.schema.ts';

const VALID_BACKGROUNDS = new Set([
  'neighborhood_street',
  'forest_trail',
  'city_street',
  'rooftop_night',
  'cozy_living_room',
  'cafe_diner',
  'office_desk',
  'classroom',
  'laboratory',
  'police_precinct',
  'podcast_studio',
  'tv_studio',
  'studio_backdrop',
]);

const VALID_RENDER_STYLES = new Set([
  '2d_storybook',
  '2.5d_parallax',
  'studio_clean',
]);

const VALID_CHARACTER_TYPES = new Set(['cartoon', 'stickman']);

const VALID_CAMERA_MODES = new Set(['standard', 'podcast', 'cinematic']);

const VALID_SHOT_MODES = new Set([
  'wide',
  'medium_two_shot',
  'over_shoulder_left',
  'over_shoulder_right',
  'closeup_speaker',
  'closeup_left',
  'closeup_right',
  'reaction_cut',
  'angle_left',
  'angle_right',
  'split_screen',
]);

const VALID_ACTIONS = new Set([
  'idle', 'walk', 'run', 'sprint', 'jump', 'point', 'wave', 'shrug',
  'lean_in', 'think_chin', 'nod_agree', 'desk_slam',
  'clap', 'punch', 'kick', 'dodge', 'laugh', 'cry', 'panic', 'tremble',
  'celebrate', 'facepalm', 'look_around', 'gasp', 'hold_prop',
]);

const VALID_BASE_POSES = new Set(['stand', 'crouch', 'sit']);

const VALID_EMOTIONS = new Set([
  'scared', 'happy', 'sad', 'angry', 'surprised', 'disgusted',
  'confident', 'determined', 'confused', 'suspicious', 'excited',
  'nervous', 'embarrassed', 'bored', 'curious', 'frustrated', 'smug',
]);

function main() {
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: npx tsx tools/validate_production.ts <file.production.json>');
    process.exit(1);
  }

  const abs = path.resolve(process.cwd(), target);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }

  let data: ProductionScript;
  try {
    data = JSON.parse(fs.readFileSync(abs, 'utf-8')) as ProductionScript;
  } catch (err) {
    console.error('Invalid JSON:', (err as Error).message);
    process.exit(1);
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.schemaVersion !== '1.0.0') errors.push('schemaVersion must be "1.0.0"');
  if (!data.title) errors.push('title is required');
  if (data.aspectRatio !== '16:9' && data.aspectRatio !== '9:16') {
    errors.push(`aspectRatio must be "16:9" or "9:16" (got "${data.aspectRatio}")`);
  }
  if (data.renderStyle && !VALID_RENDER_STYLES.has(data.renderStyle)) {
    errors.push(`Invalid renderStyle "${data.renderStyle}". Use 2d_storybook, 2.5d_parallax, or studio_clean.`);
  }
  if (data.characterType && !VALID_CHARACTER_TYPES.has(data.characterType)) {
    errors.push(`Invalid characterType "${data.characterType}". Use cartoon or stickman.`);
  }
  if (data.cameraMode && !VALID_CAMERA_MODES.has(data.cameraMode)) {
    errors.push(`Invalid cameraMode "${data.cameraMode}". Use standard or podcast.`);
  }

  const presetIds = new Set(CHARACTER_PRESETS.map((p) => p.id));
  const charIds = new Set<string>();
  const usedVoices = new Set<string>();
  for (const ch of data.characters ?? []) {
    charIds.add(ch.id);
    if (ch.characterType && !VALID_CHARACTER_TYPES.has(ch.characterType)) {
      errors.push(`Character "${ch.id}": invalid characterType "${ch.characterType}".`);
    }
    if (ch.voice) {
      if (usedVoices.has(ch.voice)) {
        warnings.push(`Character "${ch.id}" shares voice "${ch.voice}" with another character. Give every character a distinct voice.`);
      }
      usedVoices.add(ch.voice);
    }
    const res = validateCharacterDefinition(ch, KNOWN_ASSET_IDS);
    for (const iss of res.issues) {
      if (iss.level === 'error') errors.push(`Character "${ch.id}": ${iss.message}`);
      else warnings.push(`Character "${ch.id}": ${iss.message}`);
    }
  }

  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    errors.push('ProductionScript must contain at least 1 scene.');
  } else {
    if (data.scenes.length < 2 && data.cameraMode !== 'podcast' && data.scenes[0]?.background !== 'podcast_studio') {
      warnings.push('Production contains only 1 scene; consider 2–5 scenes with location/framing shifts for studio pacing.');
    }
    data.scenes.forEach((sc, idx) => {
      const prefix = `Scene[${idx}] (${sc.id})`;
      if (!VALID_BACKGROUNDS.has(sc.background)) {
        errors.push(`${prefix}: invalid background "${sc.background}"`);
      }
      if (sc.renderStyle && !VALID_RENDER_STYLES.has(sc.renderStyle)) {
        errors.push(`${prefix}: invalid renderStyle "${sc.renderStyle}"`);
      }
      if (sc.cameraMode && !VALID_CAMERA_MODES.has(sc.cameraMode)) {
        errors.push(`${prefix}: invalid cameraMode "${sc.cameraMode}"`);
      }
      if (!sc.durationSec || sc.durationSec <= 0) {
        errors.push(`${prefix}: durationSec must be > 0`);
      }
      const effectiveCamMode = sc.cameraMode ?? data.cameraMode ?? 'standard';
      if (effectiveCamMode === 'standard' && (!sc.cameraKeyframes || sc.cameraKeyframes.length < 2)) {
        warnings.push(`${prefix}: fewer than 2 cameraKeyframes; add smooth zoom/pan keyframes for dynamic framing.`);
      }
      for (const ck of sc.cameraKeyframes ?? []) {
        if (ck.shake > 0.45) {
          warnings.push(`${prefix}: camera shake ${ck.shake} is too strong (> 0.45); keep shake 0 for normal shots and <= 0.3 for brief impacts.`);
        }
        if (ck.shotMode && !VALID_SHOT_MODES.has(ck.shotMode)) {
          errors.push(`${prefix}: invalid camera shotMode "${ck.shotMode}"`);
        }
      }

      const actorIds = new Set<string>();
      const usedCharIds = new Set<string>();
      for (const act of sc.actors ?? []) {
        actorIds.add(act.id);
        if (!charIds.has(act.characterId) && !presetIds.has(act.characterId)) {
          errors.push(
            `${prefix}: actor "${act.id}" references unknown characterId "${act.characterId}". Define it in script.characters[] or use an exact preset ID.`
          );
        }
        if (usedCharIds.has(act.characterId)) {
          errors.push(
            `${prefix}: multiple actors share identical characterId "${act.characterId}". Give each actor a unique character definition.`
          );
        }
        usedCharIds.add(act.characterId);
        for (const tr of act.actionTracks ?? []) {
          if (!VALID_ACTIONS.has(tr.type)) {
            errors.push(`${prefix}: invalid action "${tr.type}" on actor "${act.id}"`);
          }
          if (!VALID_BASE_POSES.has(tr.basePose)) {
            errors.push(`${prefix}: invalid basePose "${tr.basePose}" on actor "${act.id}"`);
          }
        }
        for (const ek of act.emotionKeyframes ?? []) {
          for (const key of Object.keys(ek.emotion ?? {})) {
            if (!VALID_EMOTIONS.has(key)) {
              errors.push(`${prefix}: unknown emotion "${key}" on actor "${act.id}"`);
            }
          }
        }
      }
      for (const line of sc.dialogue ?? []) {
        if (!actorIds.has(line.actorId)) {
          errors.push(`${prefix}: dialogue line "${line.id}" references unknown actorId "${line.actorId}"`);
        }
        if (line.endSec <= line.startSec) {
          errors.push(`${prefix}: dialogue line "${line.id}" has endSec <= startSec`);
        }
      }
    });
  }

  for (const w of warnings) console.warn(`WARNING: ${w}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`ERROR: ${e}`);
    process.exit(1);
  }

  console.log(`VALID: "${data.title}" (${data.scenes.length} scenes, ${data.renderStyle ?? '2.5d_parallax'}, ${data.aspectRatio}, ${data.fps} FPS)`);
}

main();
