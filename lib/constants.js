/**
 * OpenAI Image generation constants.
 * Sources: https://developers.openai.com/api/docs/guides/image-generation
 */

// Image API models (client.images.*)
export const IMAGE_MODELS = {
  GPT_IMAGE_2: 'gpt-image-2',          // Latest, recommended
  GPT_IMAGE_1_5: 'gpt-image-1.5',
  GPT_IMAGE_1: 'gpt-image-1',
  GPT_IMAGE_1_MINI: 'gpt-image-1-mini',
  DALLE_2: 'dall-e-2',                 // Supports variations endpoint
};

// Mainline models that support image_generation tool in Responses API
export const RESPONSES_MODELS = {
  GPT_5_4: 'gpt-5.4',
};

export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS.GPT_IMAGE_2;
export const DEFAULT_RESPONSES_MODEL = RESPONSES_MODELS.GPT_5_4;

// Popular sizes for gpt-image-2. gpt-image-2 accepts any resolution meeting
// the constraints below; these are the well-exercised defaults.
export const SIZES = {
  SQUARE: '1024x1024',
  LANDSCAPE: '1536x1024',
  PORTRAIT: '1024x1536',
  SQUARE_2K: '2048x2048',
  LANDSCAPE_2K: '2048x1152',
  LANDSCAPE_4K: '3840x2160',           // experimental (>2K)
  PORTRAIT_4K: '2160x3840',            // experimental
  AUTO: 'auto',
};

// gpt-image-2 size constraints:
//   - max edge <= 3840px
//   - both edges multiples of 16
//   - long:short ratio <= 3:1
//   - total pixels in [655_360, 8_294_400]
export const SIZE_CONSTRAINTS = {
  MAX_EDGE: 3840,
  EDGE_MULTIPLE: 16,
  MAX_RATIO: 3,
  MIN_PIXELS: 655_360,
  MAX_PIXELS: 8_294_400,
};

export const QUALITY = {
  LOW: 'low',       // fast drafts, thumbnails
  MEDIUM: 'medium',
  HIGH: 'high',
  AUTO: 'auto',     // default
};

export const FORMAT = {
  PNG: 'png',       // default
  JPEG: 'jpeg',     // faster than png, supports output_compression
  WEBP: 'webp',     // supports output_compression
};

export const BACKGROUND = {
  AUTO: 'auto',
  OPAQUE: 'opaque',
  // TRANSPARENT: 'transparent', // NOT supported by gpt-image-2
};

export const MODERATION = {
  AUTO: 'auto',     // default
  LOW: 'low',       // less restrictive
};

// Pricing in USD per image for common sizes. See pricing page for full table.
// Reference: https://developers.openai.com/api/docs/pricing#image-generation
export const PRICING = {
  'gpt-image-2': {
    low:    { '1024x1024': 0.006, '1024x1536': 0.005, '1536x1024': 0.005 },
    medium: { '1024x1024': 0.053, '1024x1536': 0.041, '1536x1024': 0.041 },
    high:   { '1024x1024': 0.211, '1024x1536': 0.165, '1536x1024': 0.165 },
  },
  'gpt-image-1.5': {
    low:    { '1024x1024': 0.009, '1024x1536': 0.013, '1536x1024': 0.013 },
    medium: { '1024x1024': 0.034, '1024x1536': 0.050, '1536x1024': 0.050 },
    high:   { '1024x1024': 0.133, '1024x1536': 0.200, '1536x1024': 0.200 },
  },
  'gpt-image-1': {
    low:    { '1024x1024': 0.011, '1024x1536': 0.016, '1536x1024': 0.016 },
    medium: { '1024x1024': 0.042, '1024x1536': 0.063, '1536x1024': 0.063 },
    high:   { '1024x1024': 0.167, '1024x1536': 0.250, '1536x1024': 0.250 },
  },
  'gpt-image-1-mini': {
    low:    { '1024x1024': 0.005, '1024x1536': 0.006, '1536x1024': 0.006 },
    medium: { '1024x1024': 0.011, '1024x1536': 0.015, '1536x1024': 0.015 },
    high:   { '1024x1024': 0.036, '1024x1536': 0.052, '1536x1024': 0.052 },
  },
};

// Each partial image streamed costs +100 output tokens.
export const PARTIAL_IMAGE_TOKEN_COST = 100;
