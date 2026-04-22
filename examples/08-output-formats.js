#!/usr/bin/env node

/**
 * 08 — Output formats and compression
 * PNG is the default. JPEG is faster and supports output_compression (0-100).
 * WEBP also supports compression. gpt-image-2 does NOT support transparent
 * backgrounds — keep `background` at 'auto' or 'opaque'.
 */

import 'dotenv/config';
import { generate, saveImage } from '../lib/gpt-image.js';

const prompt = 'A retro travel poster of Mount Fuji at sunrise, art deco style';

// JPEG, 70% compression (fastest wall-clock on the server side)
const jpg = await generate(prompt, {
  format: 'jpeg',
  compression: 70,
  quality: 'low',
});
saveImage(jpg.images[0], 'output/08-fuji.jpg');

// WEBP, 60% compression
const webp = await generate(prompt, {
  format: 'webp',
  compression: 60,
  quality: 'low',
});
saveImage(webp.images[0], 'output/08-fuji.webp');

console.log(`Saved output/08-fuji.jpg (${jpg.images[0].length} bytes) and output/08-fuji.webp (${webp.images[0].length} bytes)`);
