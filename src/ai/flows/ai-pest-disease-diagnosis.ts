// 'use server'
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { invokeAI, AIResult } from '@/ai/orchestrator';

const DiagnosePestDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z
    .enum(['en', 'am', 'om', 'ti', 'so'])
    .optional()
    .describe('The language for the response: en (English), am (Amharic), om (Oromifa), ti (Tigrinya), or so (Somali). Defaults to English.'),
});
export type DiagnosePestDiseaseInput = z.infer<typeof DiagnosePestDiseaseInputSchema>;

const DiagnosePestDiseaseOutputSchema = z.object({
  diagnosis: z.string().describe('The AI-backed diagnosis of potential pests or diseases.'),
  solution: z.string().describe('Potential solutions or links to expert advice.'),
});
export type DiagnosePestDiseaseOutput = z.infer<typeof DiagnosePestDiseaseOutputSchema>;

/**
 * Reliable AI Diagnosis
 * Wraps the Genkit flow with retries, backoff, and fallback model logic.
 */
export async function diagnosePestDisease(input: DiagnosePestDiseaseInput): Promise<AIResult<DiagnosePestDiseaseOutput>> {
  return invokeAI<DiagnosePestDiseaseOutput>(prompt, input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePestDiseasePrompt',
  input: { schema: DiagnosePestDiseaseInputSchema },
  output: { schema: DiagnosePestDiseaseOutputSchema },
  prompt: `You are an expert in diagnosing plant diseases and pests, with knowledge of Ethiopian agriculture. Analyze the image of the crop and provide a diagnosis and potential solutions.

LANGUAGE INSTRUCTION:
Language code: {{language}}
- If language is "am": Respond ONLY in Amharic (አማርኛ) using Ge'ez script for ALL text. Do not use English.
- If language is "om": Respond ONLY in Oromifa (Afaan Oromoo) using Latin script. Do not use English.
- If language is "ti": Respond ONLY in Tigrinya (ትግርኛ) using Ge'ez script. Do not use English.
- If language is "so": Respond ONLY in Somali (Soomaali) using Latin script. Do not use English.
- If language is "en" or not specified: Respond in English.

Image: {{media url=photoDataUri}}

Provide:
1. A clear diagnosis of what pest or disease is affecting the crop
2. Practical solutions and treatment recommendations suitable for Ethiopian farmers

Diagnosis and Solutions:`,
});

// Deprecated in favor of direct prompt invocation via orchestrator for better error handling
// but kept for type compliance if needed elsewhere.
export const diagnosePestDiseaseFlow = ai.defineFlow(
  {
    name: 'diagnosePestDiseaseFlow',
    inputSchema: DiagnosePestDiseaseInputSchema,
    outputSchema: DiagnosePestDiseaseOutputSchema,
  },
  async input => {
    const result = await diagnosePestDisease(input);
    if (!result.success) throw new Error(result.error);
    return result.data!;
  }
);
