#!/usr/bin/env node

/**
 * 05 — Compose a new image from reference images
 * The edits endpoint accepts one or more input images. Without a mask, it
 * treats them as visual references to compose a new scene from.
 *
 * Pre-req: run example 01 first so output/01-otter.png exists. This example
 * uses the otter and a freshly-generated teapot as two references.
 */

import 'dotenv/config';
import { generate, edit, saveImage } from '../lib/gpt-image.js';
import fs from 'node:fs';

const refs = ['tmp/ref-otter.png', 'tmp/ref-teapot.png'];

// Prep reference images if missing
if (!fs.existsSync(refs[0])) {
  const { images } = await generate('A photo of a playful otter on a rock', { quality: 'low' });
  saveImage(images[0], refs[0]);
}
if (!fs.existsSync(refs[1])) {
  const { images } = await generate('A rustic ceramic teapot on a wooden table', { quality: 'low' });
  saveImage(images[0], refs[1]);
}

const { images } = await edit(
  "A photorealistic still life combining the otter and the teapot from the reference images, warm afternoon light",
  { image: refs, quality: 'low' }
);

saveImage(images[0], 'output/05-composed.png');
console.log('Saved output/05-composed.png');
