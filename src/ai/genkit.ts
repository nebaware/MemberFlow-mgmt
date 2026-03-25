import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Read API key from environment. Genkit's Google plugin will look for
// GEMINI_API_KEY or GOOGLE_API_KEY; prefer GEMINI_API_KEY if both are set.
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Allow overriding the model via env var if the default model isn't available
// for the developer's API key. This is convenient for local dev/test.
const configuredModel = process.env.GEMINI_MODEL || 'googleai/gemini-1.5-flash';

const plugins = [];
if (apiKey) {
  // Pass the key explicitly to the googleAI plugin so the app doesn't
  // rely on implicit global env lookup inside the library during build.
  plugins.push(googleAI({ apiKey } as any));
} else {
  // Warn in development so it's clear why Genkit features are disabled.
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      'Genkit: GEMINI_API_KEY or GOOGLE_API_KEY not set. AI features that use the Google/ Gemini plugin will be disabled for local development.\n' +
      'Create a `.env.local` at the project root with `GEMINI_API_KEY=your_key` (or set GOOGLE_API_KEY) and restart the dev server.'
    );
  }
}

export const ai = genkit({
  plugins,
  // model can be overridden with GEMINI_MODEL in `.env.local`
  model: configuredModel,
});
