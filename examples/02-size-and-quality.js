#!/usr/bin/env node

/**
 * 02 — Size and quality
 * gpt-image-2 takes any resolution meeting its constraints (see lib/constants.js).
 * Quality 'low' is the right default for drafts/smoke tests — it's much faster.
 */

import 'dotenv/config';
import { generate, saveImage } from '../lib/gpt-image.js';
import { SIZES, QUALITY } from '../lib/constants.js';

const prompt = 'A beige coffee mug on a wooden table, soft morning light';

// Square low quality (fastest, cheapest)
const sq = await generate(prompt, { size: SIZES.SQUARE, quality: QUALITY.LOW });
saveImage(sq.images[0], 'output/02-square-low.png');

// Landscape medium quality
const land = await generate(prompt, { size: SIZES.LANDSCAPE, quality: QUALITY.MEDIUM });
saveImage(land.images[0], 'output/02-landscape-medium.png');

console.log('Saved output/02-square-low.png and output/02-landscape-medium.png');
