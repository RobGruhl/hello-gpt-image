#!/usr/bin/env node

/**
 * 04 — Streaming partial images
 * Receive 0-3 partial previews as the full image renders. Useful for UX
 * where you want to show progress. Each partial costs +100 output tokens.
 */

import 'dotenv/config';
import { stream, saveImage } from '../lib/gpt-image.js';

const prompt = 'A gorgeous image of a river made of white owl feathers, snaking its way through a serene winter landscape';

let count = 0;
for await (const chunk of stream(prompt, { partialImages: 2, quality: 'low' })) {
  const label = chunk.isFinal ? 'final' : `partial-${chunk.index}`;
  const path = `output/04-river-${label}.png`;
  saveImage(chunk.buffer, path);
  console.log(`[${++count}] ${path} (${chunk.buffer.length} bytes)`);
}
