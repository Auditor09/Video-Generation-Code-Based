#!/usr/bin/env node
/**
 * SpriteForge Remotion CLI Renderer
 * Usage:
 *   node render.mjs --input ../../examples/productions/bomb_defusal.production.json --output ../../out/bomb_defusal.mp4
 *   node render.mjs --input ../../examples/productions/bomb_defusal.production.json --output ../../out/char.webm --transparent
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const inputPath = path.resolve(
  process.cwd(),
  getArg('--input', '../../examples/productions/bomb_defusal.production.json')
);
const outputPath = path.resolve(
  process.cwd(),
  getArg('--output', '../../out/spriteforge_output.mp4')
);
const isTransparent = process.argv.includes('--transparent');

if (!fs.existsSync(inputPath)) {
  console.error(`Input ProductionScript JSON not found: ${inputPath}`);
  process.exit(1);
}

const script = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

console.log(`Bundling SpriteForge Remotion composition...`);
const bundleLocation = await bundle({
  entryPoint: path.resolve(__dirname, 'src/index.ts'),
  publicDir: path.resolve(__dirname, '../../public'),
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: 'SpriteForgeVideo',
  inputProps: { script },
});

console.log(
  `Rendering "${script.title}" (${composition.width}x${composition.height} @ ${composition.fps} FPS, ${composition.durationInFrames} frames)...`
);

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: isTransparent ? 'vp9' : 'h264',
  imageFormat: isTransparent ? 'png' : 'jpeg',
  outputLocation: outputPath,
  inputProps: { script },
});

console.log(`Render complete: ${outputPath}`);
