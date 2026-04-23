# hello-gpt-image

Canonical reference for OpenAI image generation. Clean client, runnable examples, docs.

Covers both surfaces from the [official guide](https://developers.openai.com/api/docs/guides/image-generation):
**Image API** (`gpt-image-2`, one-shot) and **Responses API** (`gpt-5.4` + `image_generation` tool, multi-turn).

## Quick Start

```bash
cp .env.example .env      # add your sk-... key (verified org required for gpt-image-*)
bun install
node examples/01-basic-generate.js
```

First run creates `output/01-otter.png`. Cost: ~$0.006 at `quality: 'low'`.

## Two APIs

| API | Call | Model | When |
|---|---|---|---|
| Image API | `client.images.generate` / `.edit` | `gpt-image-2` | One-shot generate/edit, batch pipelines |
| Responses API | `client.responses.create` with `image_generation` tool | `gpt-5.4` | Multi-turn iteration, Files API refs, agents |

## Models

| Model | ID | Notes |
|---|---|---|
| GPT Image 2 | `gpt-image-2` | Latest, recommended. Any size ≤3840px. No transparent bg. |
| GPT Image 1.5 | `gpt-image-1.5` | Prior gen |
| GPT Image 1 | `gpt-image-1` | Supports transparent backgrounds |
| GPT Image 1 Mini | `gpt-image-1-mini` | Cheapest |
| DALL·E 2 | `dall-e-2` | Variations endpoint |

## Client Library

```js
import { generate, edit, stream, generateViaResponses, saveImage } from './lib/gpt-image.js';

// One-shot
const { images } = await generate('A fox in a snowy field', { quality: 'low' });
saveImage(images[0], 'output/fox.png');

// Compose from references
await edit('A basket with the items from these refs', { image: ['a.png', 'b.png', 'c.png'] });

// Inpainting
await edit('Put a flamingo in the pool', { image: 'room.png', mask: 'mask.png' });

// Streaming partials
for await (const chunk of stream('An icy river', { partialImages: 2 })) {
  saveImage(chunk.buffer, `river-${chunk.isFinal ? 'final' : chunk.index}.png`);
}

// Multi-turn via Responses API
const r1 = await generateViaResponses('A cat hugging an otter');
const r2 = await generateViaResponses('Now make it realistic', { previousResponseId: r1.responseId });

// Explicit key (vs env var)
import { createClient } from './lib/gpt-image.js';
const client = createClient('sk-...');
await generate('...', { client });
```

## Examples

| # | File | What |
|---|---|---|
| 01 | `01-basic-generate.js` | Smallest possible generate() call |
| 02 | `02-size-and-quality.js` | Size presets, quality tiers |
| 03 | `03-multiple-images.js` | `n > 1`, multiple variations per request |
| 04 | `04-streaming.js` | Partial-image streaming |
| 05 | `05-edit-with-references.js` | Compose a new image from multiple reference images |
| 06 | `06-edit-with-mask.js` | Inpainting with an alpha-channel mask |
| 07 | `07-responses-multi-turn.js` | Multi-turn iteration via Responses API |
| 08 | `08-output-formats.js` | JPEG / WebP with compression |

## Docs

- [API Reference](docs/01-api-reference.md) — Both surfaces, request/response shapes
- [Image API vs Responses API](docs/02-image-api-vs-responses.md) — Decision guide
- [Sizes, Quality, Formats](docs/03-sizes-quality-formats.md) — Constraints + presets
- [Editing and Masks](docs/04-editing-and-masks.md) — Reference composition, mask alpha channel
- [Pricing](docs/05-pricing.md) — Per-image costs, cost-reduction tactics
- [Consistency Workflow](docs/06-consistency-workflow.md) — Characters, style, worlds across many generations (graphic novels, storyboards, series)

## Notes

- `gpt-image-*` models require [API Organization Verification](https://help.openai.com/en/articles/10910291-api-organization-verification).
- Examples default to `quality: 'low'` so smoke tests cost ~$0.01/run on gpt-image-2.
- `output/` and `tmp/` are gitignored.
