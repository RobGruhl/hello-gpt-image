#!/usr/bin/env node

/**
 * 07 — Multi-turn image iteration via the Responses API
 * The Responses API image_generation tool keeps state across turns using
 * previous_response_id. The mainline model (gpt-5.4) decides whether to
 * generate a new image or edit the prior one (override with action:'edit').
 */

import 'dotenv/config';
import { generateViaResponses, saveImage } from '../lib/gpt-image.js';

// Turn 1 — create
const first = await generateViaResponses(
  'Generate an image of a gray tabby cat hugging an otter with an orange scarf',
);
saveImage(first.images[0], 'output/07-turn1.png');
console.log(`Turn 1: ${first.responseId}`);
if (first.revisedPrompt) console.log(`  revised prompt: ${first.revisedPrompt}`);

// Turn 2 — iterate, referencing prior response
const second = await generateViaResponses(
  'Now make it look realistic',
  { previousResponseId: first.responseId }
);
saveImage(second.images[0], 'output/07-turn2.png');
console.log(`Turn 2: ${second.responseId}`);

// Turn 3 — force edit mode
const third = await generateViaResponses(
  'Add snow falling in the background',
  { previousResponseId: second.responseId, action: 'edit' }
);
saveImage(third.images[0], 'output/07-turn3.png');
console.log(`Turn 3: ${third.responseId}`);
