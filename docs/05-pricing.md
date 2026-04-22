# 05 — Pricing

Source: <https://developers.openai.com/api/docs/pricing#image-generation>

## Per-image output (USD)

| Model | Quality | 1024×1024 | 1024×1536 | 1536×1024 |
|---|---|---|---|---|
| **gpt-image-2** | low | $0.006 | $0.005 | $0.005 |
| gpt-image-2 | medium | $0.053 | $0.041 | $0.041 |
| gpt-image-2 | high | $0.211 | $0.165 | $0.165 |
| gpt-image-1.5 | low | $0.009 | $0.013 | $0.013 |
| gpt-image-1.5 | medium | $0.034 | $0.050 | $0.050 |
| gpt-image-1.5 | high | $0.133 | $0.200 | $0.200 |
| gpt-image-1 | low | $0.011 | $0.016 | $0.016 |
| gpt-image-1 | medium | $0.042 | $0.063 | $0.063 |
| gpt-image-1 | high | $0.167 | $0.250 | $0.250 |
| gpt-image-1-mini | low | $0.005 | $0.006 | $0.006 |
| gpt-image-1-mini | medium | $0.011 | $0.015 | $0.015 |
| gpt-image-1-mini | high | $0.036 | $0.052 | $0.052 |

`gpt-image-2` supports many more sizes; the larger non-square sizes can cost **less** than the square at the same quality because they use fewer output tokens.

## What you're billed for

A full request cost = input text tokens + input image tokens (edits only) + output image tokens.

- **Input text**: prompt tokens, priced per the mainline model (Responses API) or at the image-model input rate (Image API).
- **Input images** (edits): every reference image is high-fidelity on `gpt-image-2`, so reference-heavy edit calls can cost more than you'd expect.
- **Output image**: by quality × size, as above.
- **Streaming partials**: each partial image = **+100 output tokens**. With `partial_images: 2`, you pay +200 tokens over a non-streamed call.

## Cost-reduction tips

1. **Default to `quality: 'low'`** for any work you're still iterating on. ~35× cheaper than `high` on gpt-image-2 at 1024².
2. **Use `gpt-image-1-mini`** for drafts where you can tolerate older quality. It's the cheapest path.
3. **Use Image API over Responses API** for one-shot calls — you skip paying for gpt-5.4 tokens.
4. **JPEG is faster** than PNG; doesn't affect price but lowers latency-related retries.
5. **Set `partial_images: 0`** unless you're actually rendering partials to a user.
6. **Cache with Files API** (Responses) for repeated reference images — upload once, reference by `file_id` in many turns instead of re-uploading bytes.

## Token table for pre-gpt-image-2 models

For `gpt-image-1`, `gpt-image-1-mini`, `gpt-image-1.5`, image output tokens are deterministic per size × quality:

| Quality | 1024×1024 | 1024×1536 | 1536×1024 |
|---|---|---|---|
| Low | 272 | 408 | 400 |
| Medium | 1,056 | 1,584 | 1,568 |
| High | 4,160 | 6,240 | 6,208 |

Multiply by the per-token output price on the pricing page. `gpt-image-2` doesn't publish a fixed token count per size — use the per-image table above, or OpenAI's in-dashboard calculator for non-standard sizes.
