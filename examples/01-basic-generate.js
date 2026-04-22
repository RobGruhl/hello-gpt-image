#!/usr/bin/env node

/**
 * 01 — Basic image generation
 * Simplest call: one prompt → one PNG via the Image API.
 */

import 'dotenv/config';
import { generate, saveImage } from '../lib/gpt-image.js';

const { images } = await generate(
  "A children's book drawing of a veterinarian using a stethoscope to listen to the heartbeat of a baby otter.",
  { quality: 'low' } // cheapest setting for smoke tests
);

const path = saveImage(images[0], 'output/01-otter.png');
console.log(`Saved ${path} (${images[0].length} bytes)`);
