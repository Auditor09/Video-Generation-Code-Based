#!/usr/bin/env npx tsx
/**
 * SpriteForge Master Director Prompt CLI
 * Generates an engine-synced Master Prompt from a plain-English idea.
 * Usage:
 *   npx tsx tools/print_director_prompt.ts --idea "A rookie cop defuses a bomb" --aspect 9:16 --duration 25 --tone suspense
 */

import { BackgroundSceneId, CharacterType, RenderStyle } from '../src/schemas/character.schema.ts';
import { buildMasterDirectorPrompt, DirectorPromptOptions } from '../src/studio/promptGenerator.ts';

function getArg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const idea = getArg('--idea', '');
if (!idea.trim()) {
  console.error(
    'Usage: npx tsx tools/print_director_prompt.ts --idea "<your plain English idea>" [--aspect 16:9|9:16] [--duration 30] [--tone suspense|comedy|action|drama|explainer] [--backgrounds bg1,bg2] [--camera-style dramatic|dynamic|steady|podcast]'
  );
  process.exit(1);
}

const aspect = (getArg('--aspect', '16:9') === '9:16' ? '9:16' : '16:9') as '16:9' | '9:16';
const duration = parseInt(getArg('--duration', aspect === '9:16' ? '25' : '45'), 10);
const tone = getArg('--tone', 'suspense') as DirectorPromptOptions['tone'];
const castMode = (getArg('--cast', 'presets_and_custom') === 'custom_only'
  ? 'custom_only'
  : 'presets_and_custom') as DirectorPromptOptions['castMode'];

const rawStyle = getArg('--style', '2.5d_parallax');
const renderStyle: RenderStyle =
  rawStyle === '2d_storybook' || rawStyle === 'studio_clean' ? rawStyle : '2.5d_parallax';

const rawCharType = getArg('--character-type', 'cartoon');
const characterType: CharacterType = rawCharType === 'stickman' ? 'stickman' : 'cartoon';

const rawBackgrounds = getArg('--backgrounds', '');
const preferredBackgrounds = rawBackgrounds
  ? (rawBackgrounds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean) as BackgroundSceneId[])
  : undefined;

const rawCam = getArg('--camera-style', 'dramatic');
const cameraStyle: DirectorPromptOptions['cameraStyle'] =
  rawCam === 'steady' || rawCam === 'dynamic' || rawCam === 'podcast' ? rawCam : 'dramatic';

console.log(
  buildMasterDirectorPrompt({
    idea,
    aspectRatio: aspect,
    targetDurationSec: Number.isFinite(duration) ? duration : 30,
    tone,
    castMode,
    renderStyle,
    characterType,
    preferredBackgrounds,
    cameraStyle,
  })
);
