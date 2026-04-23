# hello-gpt-image

OpenAI image generation — `gpt-image-2` via the Image API, plus multi-turn editing via the Responses API (`gpt-5.4` + `image_generation` tool).

## File Map

```
lib/constants.js     — Models, sizes, quality, formats, per-image pricing
lib/gpt-image.js     — Canonical client: generate(), edit(), stream(), generateViaResponses(), createClient(), saveImage()
examples/01-08       — Runnable examples (node examples/01-basic-generate.js)
docs/01-06           — API reference, Image API vs Responses, sizes/quality/formats, editing+masks, pricing, consistency workflow
```

## Two APIs

1. **Image API** (`client.images.*`) — stateless. `generate` / `edit` / streaming. Model: `gpt-image-2`.
2. **Responses API** (`client.responses.*`) — conversational. Image generation is a **tool** on a mainline model (`gpt-5.4`). State threaded via `previous_response_id`. Supports Files API references and multi-turn edits.

Client returns: `generate/edit/generateViaResponses` → `{ images: Buffer[], raw }`. `stream()` is an async generator yielding `{ index, buffer, isFinal }`.

## Key Gotchas

- **Org verification required** for all gpt-image-* models. Unverified orgs get 403s even with a valid key.
- **`gpt-image-2` does NOT support `background: 'transparent'`**. Use `auto` or `opaque`; for transparent PNGs fall back to `gpt-image-1` or post-process.
- **`input_fidelity` is not settable on gpt-image-2** — it always processes inputs at high fidelity, so edit calls with many references burn more input tokens than you'd expect.
- **Masks need an alpha channel**, not just black-and-white. If your tool exports grayscale, copy it into the alpha channel (see `docs/04-editing-and-masks.md`).
- **Masking is prompt-guided**, not pixel-exact. Describe the change in the prompt as well as drawing the mask.
- **Size constraints on gpt-image-2**: edges multiples of 16, ≤3840px, ratio ≤3:1, pixel count in [655_360, 8_294_400]. `auto` is the safe default.
- **Streaming partials cost +100 output tokens each**. `partial_images: 0` for production unless you're rendering them.
- **Responses API is more expensive than Image API** for one-shots — you pay gpt-5.4 tokens on top of image output. Only reach for it when you actually need multi-turn or Files-API refs.
- **`action: 'edit'` errors if no image is in context.** Default to `'auto'` and let the model decide.
- **Complex prompts at `quality: 'high'` can take up to 2 minutes.** Bump your HTTP client's timeout.
- **The API returns base64 in `b64_json` / `result`**, not URLs. This client decodes to `Buffer` for you.

## Copy to New Project

1. Copy `lib/gpt-image.js` and `lib/constants.js`
2. `bun install dotenv openai`
3. Add `OPENAI_API_KEY` to `.env` (verified org)
4. Import what you need:
   ```js
   import 'dotenv/config';
   import { generate, edit, stream, generateViaResponses, saveImage } from './lib/gpt-image.js';
   ```
5. Default to `quality: 'low'` while iterating; bump to `medium`/`high` only for final renders.

## Running Examples

```bash
node examples/01-basic-generate.js       # smoke test (low-quality PNG)
node examples/04-streaming.js            # partial images
node examples/07-responses-multi-turn.js # multi-turn via Responses API
```

All examples use `dotenv/config`, write to `output/`, and use `quality: 'low'` to keep smoke-test cost near $0.01/run.
