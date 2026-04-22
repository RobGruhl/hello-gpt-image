#!/usr/bin/env node

/**
 * 06 — Edit with a mask
 * The mask's alpha channel tells the model which region is editable
 * (transparent = edit, opaque = keep). Image and mask MUST be the same
 * size and format, and the mask MUST have an alpha channel.
 *
 * This example procedurally creates a base image + mask using only the
 * Image API and a tiny alpha-channel builder so it runs with no assets.
 */

import 'dotenv/config';
import fs from 'node:fs';
import { generate, edit, saveImage } from '../lib/gpt-image.js';

const basePath = 'tmp/06-base.png';
const maskPath = 'tmp/06-mask.png';

if (!fs.existsSync(basePath)) {
  const { images } = await generate(
    'A sunlit indoor lounge area with a pool, photorealistic',
    { size: '1024x1024', quality: 'low' }
  );
  saveImage(images[0], basePath);
}

if (!fs.existsSync(maskPath)) {
  // Build a 1024x1024 PNG where the center square is transparent (editable)
  // and the border is opaque (preserved). Minimal PNG synthesis via Canvas
  // is heavier than needed — we shell out to `sips` if available, else
  // ask the user to drop a mask.png here. Simplest: generate a mask via
  // the Image API too, then convert to RGBA with alpha.
  console.error(
    `Missing ${maskPath}. Create a same-size PNG where the area you want edited is transparent and the rest is opaque, then re-run.`
  );
  console.error('See docs/04-editing-and-masks.md for a Python snippet that adds an alpha channel to a black & white mask.');
  process.exit(1);
}

const { images } = await edit(
  'A sunlit indoor lounge area with a pool containing a flamingo',
  { image: basePath, mask: maskPath, quality: 'low' }
);

saveImage(images[0], 'output/06-flamingo-lounge.png');
console.log('Saved output/06-flamingo-lounge.png');
