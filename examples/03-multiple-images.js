#!/usr/bin/env node

/**
 * 03 — Generate multiple images in one request
 * The `n` parameter returns multiple variations from the same prompt.
 */

import 'dotenv/config';
import { generate, saveImage } from '../lib/gpt-image.js';

const { images } = await generate(
  'A minimalist logo for a coffee shop called "Ember", warm earth tones',
  { n: 3, quality: 'low', size: '1024x1024' }
);

images.forEach((buf, i) => {
  const path = saveImage(buf, `output/03-ember-${i + 1}.png`);
  console.log(`Saved ${path}`);
});
