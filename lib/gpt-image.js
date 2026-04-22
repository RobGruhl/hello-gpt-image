/**
 * Canonical OpenAI Image generation client.
 *
 * Wraps both surfaces from https://developers.openai.com/api/docs/guides/image-generation:
 *   - Image API (client.images.*)        — one-shot generate/edit/stream
 *   - Responses API (client.responses.*) — conversational, multi-turn editing
 *
 * Design rules:
 *   - No console.log (callers decide logging)
 *   - Throws on error (callers decide error handling)
 *   - Returns decoded Buffers (not base64 strings)
 *   - Accepts explicit apiKey or falls back to OPENAI_API_KEY
 */

import fs from 'node:fs';
import OpenAI, { toFile } from 'openai';
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_RESPONSES_MODEL,
} from './constants.js';

// -- Client construction --

function resolveKey(apiKey) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set (pass to createClient or set env var)');
  return key;
}

export function createClient(apiKey) {
  return new OpenAI({ apiKey: resolveKey(apiKey) });
}

// Lazy default singleton so callers can just `import { generate } from ...`
let _defaultClient;
function defaultClient() {
  if (!_defaultClient) _defaultClient = createClient();
  return _defaultClient;
}

// -- Image API: generate --

/**
 * Generate one or more images from a prompt via the Image API.
 *
 * @param {string} prompt
 * @param {object} [opts]
 * @param {string} [opts.model='gpt-image-2']
 * @param {string} [opts.size='auto']              - '1024x1024', '1536x1024', etc.
 * @param {string} [opts.quality='auto']           - 'low' | 'medium' | 'high' | 'auto'
 * @param {string} [opts.format='png']             - 'png' | 'jpeg' | 'webp'
 * @param {number} [opts.compression]              - 0-100, only for jpeg/webp
 * @param {string} [opts.background='auto']        - 'auto' | 'opaque' (not 'transparent' on gpt-image-2)
 * @param {string} [opts.moderation='auto']        - 'auto' | 'low'
 * @param {number} [opts.n=1]                      - number of images to return
 * @param {OpenAI} [opts.client]
 * @param {string} [opts.apiKey]
 * @returns {Promise<{images: Buffer[], raw: object}>}
 */
export async function generate(prompt, opts = {}) {
  const client = opts.client || (opts.apiKey ? createClient(opts.apiKey) : defaultClient());
  const req = {
    model: opts.model || DEFAULT_IMAGE_MODEL,
    prompt,
  };
  if (opts.size)         req.size = opts.size;
  if (opts.quality)      req.quality = opts.quality;
  if (opts.format)       req.output_format = opts.format;
  if (opts.compression != null) req.output_compression = opts.compression;
  if (opts.background)   req.background = opts.background;
  if (opts.moderation)   req.moderation = opts.moderation;
  if (opts.n)            req.n = opts.n;

  const result = await client.images.generate(req);
  const images = result.data.map(d => Buffer.from(d.b64_json, 'base64'));
  return { images, raw: result };
}

// -- Image API: edit --

/**
 * Edit an image (or compose from reference images) via the Image API.
 *
 * @param {string} prompt
 * @param {object} opts
 * @param {string|string[]} opts.image             - Path(s) to reference image(s)
 * @param {string} [opts.mask]                     - Path to mask image (PNG with alpha channel)
 * @param {string} [opts.model='gpt-image-2']
 * @param {string} [opts.size]
 * @param {string} [opts.quality]
 * @param {string} [opts.format]
 * @param {number} [opts.compression]
 * @param {number} [opts.n=1]
 * @param {OpenAI} [opts.client]
 * @param {string} [opts.apiKey]
 * @returns {Promise<{images: Buffer[], raw: object}>}
 */
export async function edit(prompt, opts) {
  if (!opts || !opts.image) throw new Error('edit() requires opts.image (path or array of paths)');
  const client = opts.client || (opts.apiKey ? createClient(opts.apiKey) : defaultClient());

  const paths = Array.isArray(opts.image) ? opts.image : [opts.image];
  const images = await Promise.all(paths.map(p =>
    toFile(fs.createReadStream(p), null, { type: 'image/png' })
  ));

  const req = {
    model: opts.model || DEFAULT_IMAGE_MODEL,
    image: images.length === 1 ? images[0] : images,
    prompt,
  };
  if (opts.mask) {
    req.mask = await toFile(fs.createReadStream(opts.mask), null, { type: 'image/png' });
  }
  if (opts.size)         req.size = opts.size;
  if (opts.quality)      req.quality = opts.quality;
  if (opts.format)       req.output_format = opts.format;
  if (opts.compression != null) req.output_compression = opts.compression;
  if (opts.n)            req.n = opts.n;

  const result = await client.images.edit(req);
  const outImages = result.data.map(d => Buffer.from(d.b64_json, 'base64'));
  return { images: outImages, raw: result };
}

// -- Image API: streaming --

/**
 * Stream image generation, yielding partial images as they arrive.
 *
 * @param {string} prompt
 * @param {object} [opts]
 * @param {number} [opts.partialImages=2]          - 0-3; 0 = final only
 * @param {string} [opts.model='gpt-image-2']
 * @param {string} [opts.size]
 * @param {string} [opts.quality]
 * @param {OpenAI} [opts.client]
 * @param {string} [opts.apiKey]
 * @yields {{index: number, buffer: Buffer, isFinal: boolean}}
 */
export async function* stream(prompt, opts = {}) {
  const client = opts.client || (opts.apiKey ? createClient(opts.apiKey) : defaultClient());
  const req = {
    model: opts.model || DEFAULT_IMAGE_MODEL,
    prompt,
    stream: true,
    partial_images: opts.partialImages ?? 2,
  };
  if (opts.size)    req.size = opts.size;
  if (opts.quality) req.quality = opts.quality;

  const events = await client.images.generate(req);
  for await (const event of events) {
    if (event.type === 'image_generation.partial_image') {
      yield {
        index: event.partial_image_index,
        buffer: Buffer.from(event.b64_json, 'base64'),
        isFinal: false,
      };
    } else if (event.type === 'image_generation.completed') {
      yield {
        index: -1,
        buffer: Buffer.from(event.b64_json, 'base64'),
        isFinal: true,
      };
    }
  }
}

// -- Responses API --

/**
 * Generate an image via the Responses API image_generation tool.
 * Supports multi-turn editing via previousResponseId.
 *
 * @param {string} input                             - Prompt or follow-up instruction
 * @param {object} [opts]
 * @param {string} [opts.model='gpt-5.4']
 * @param {string} [opts.previousResponseId]         - For multi-turn iteration
 * @param {'auto'|'generate'|'edit'} [opts.action='auto']
 * @param {string} [opts.quality]                    - tool-level quality
 * @param {number} [opts.partialImages]              - enables streaming when > 0
 * @param {string} [opts.inputImageMaskFileId]       - Files API id for mask
 * @param {object[]} [opts.inputContent]             - override the `input` structure (e.g. include reference images)
 * @param {OpenAI} [opts.client]
 * @param {string} [opts.apiKey]
 * @returns {Promise<{images: Buffer[], revisedPrompt: string|null, responseId: string, raw: object}>}
 */
export async function generateViaResponses(input, opts = {}) {
  const client = opts.client || (opts.apiKey ? createClient(opts.apiKey) : defaultClient());

  const tool = { type: 'image_generation' };
  if (opts.action)       tool.action = opts.action;
  if (opts.quality)      tool.quality = opts.quality;
  if (opts.partialImages != null) tool.partial_images = opts.partialImages;
  if (opts.inputImageMaskFileId) tool.input_image_mask = { file_id: opts.inputImageMaskFileId };

  const req = {
    model: opts.model || DEFAULT_RESPONSES_MODEL,
    input: opts.inputContent ?? input,
    tools: [tool],
  };
  if (opts.previousResponseId) req.previous_response_id = opts.previousResponseId;

  const response = await client.responses.create(req);

  const calls = response.output.filter(o => o.type === 'image_generation_call');
  const images = calls.map(c => Buffer.from(c.result, 'base64'));
  const revisedPrompt = calls[0]?.revised_prompt ?? null;

  return { images, revisedPrompt, responseId: response.id, raw: response };
}

// -- Utility: save buffer(s) to disk --

export function saveImage(buffer, path) {
  fs.writeFileSync(path, buffer);
  return path;
}
