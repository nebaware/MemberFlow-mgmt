// 'use server'
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { invokeAI, AIResult } from '@/ai/orchestrator';
import { getSpecialistDiagnosis } from '@/ai/services/plant-id';
import { translateWithGroq } from '@/ai/services/groq-translator';

const DiagnosePestDiseaseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z
    .enum(['en', 'am', 'om', 'ti', 'so'])
    .optional()
    .default('en')
    .describe('The language for the response: en (English), am (Amharic), om (Oromifa), ti (Tigrinya), or so (Somali). Defaults to English.'),
  specialistData: z
    .string()
    .optional()
    .describe('Optional JSON data from specialist plant diagnosis engine.'),
});
export type DiagnosePestDiseaseInput = z.infer<typeof DiagnosePestDiseaseInputSchema>;

const DiagnosePestDiseaseOutputSchema = z.object({
  diagnosis: z.string().describe('The AI-backed diagnosis of potential pests or diseases.'),
  solution: z.string().describe('Potential solutions or links to expert advice.'),
});
export type DiagnosePestDiseaseOutput = z.infer<typeof DiagnosePestDiseaseOutputSchema>;

/**
 * Hybrid AI Diagnosis: Specialist + Linguist
 * 1. Specialist (Plant.id): Identifies exact medical plant issues.
 * 2. Translator (Gemini first, then Groq free fallback): Localizes findings.
 * 3. English fallback if both translation services are unavailable.
 */
export async function diagnosePestDisease(input: DiagnosePestDiseaseInput): Promise<AIResult<DiagnosePestDiseaseOutput>> {
  // Step 1: Specialist Diagnosis (Plant.id)
  // Use provided specialist data if available (e.g. for testing); otherwise call API
  let specialistResult: any = null;
  if (input.specialistData) {
    try {
      specialistResult = JSON.parse(input.specialistData);
      console.log('Using provided specialistData override');
    } catch (e) {
      console.warn('Failed to parse specialistData override, calling API...');
    }
  }

  if (!specialistResult) {
    specialistResult = await getSpecialistDiagnosis(input.photoDataUri);
    console.log('Specialist result keys:', specialistResult ? Object.keys(specialistResult).join(',') : 'null');
  }

  const hasSpecialistData = specialistResult && (('suggestions' in specialistResult && specialistResult.suggestions.length > 0) || (specialistResult.is_plant !== undefined));
  console.log('hasSpecialistData:', hasSpecialistData);
  const specialistContext = hasSpecialistData
    ? (typeof specialistResult === 'string' ? specialistResult : JSON.stringify(specialistResult))
    : "Not available";

  // Step 2a: Try Gemini for translation
  const geminiResult = await invokeAI<DiagnosePestDiseaseOutput>(prompt, {
    ...input,
    specialistData: specialistContext
  });

  if (geminiResult.success) {
    return geminiResult;
  }

  // Step 2b: Gemini failed → Try Groq (free fallback)
  if (hasSpecialistData) {
    const groqResult = await translateWithGroq(specialistContext, input.language || 'en');

    if (groqResult) {
      return {
        success: true,
        data: {
          diagnosis: groqResult.diagnosis,
          solution: groqResult.solution,
        },
      };
    }

    // Step 3: Both Gemini and Groq failed — return English technical data
    const top = (specialistResult as any).suggestions[0];
    return {
      success: true,
      data: {
        diagnosis: `${top.name} (${Math.round(top.probability * 100)}% accuracy)`,
        solution: "Translation service is currently unavailable. Our specialist engine has identified the issue above. Please consult local agricultural extension services for treatment advice.",
      },
      isMock: true,
    };
  }

  // No specialist data + Gemini failed
  if (specialistResult && 'error' in specialistResult) {
    const technicalError = `Specialist Error: ${specialistResult.error}. Translation Error: ${geminiResult.error}`;
    // Log full details for debugging, but return a short, user-facing code
    // eslint-disable-next-line no-console
    console.error('AI Diagnosis failure (specialist + translator):', technicalError);

    let publicErrorCode = 'AI_SERVICE_UNAVAILABLE';
    if (String(specialistResult.error).includes('PLANT_ID_RATE_LIMITED')) {
      publicErrorCode = 'SPECIALIST_RATE_LIMITED';
    } else if (String(specialistResult.error).includes('API_KEY')) {
      publicErrorCode = 'SPECIALIST_KEY_ERROR';
    } else if (String(geminiResult.error || '').toLowerCase().includes('location')) {
      publicErrorCode = 'GEMINI_REGION_RESTRICTED';
    }

    return {
      success: false,
      error: publicErrorCode,
      isRateLimited: geminiResult.isRateLimited,
    };
  }

  return {
    ...geminiResult,
    // Normalize unexpected failures to a short error code so the UI can map to friendly copy
    error: geminiResult.success ? undefined : (geminiResult.error || 'AI_SERVICE_UNAVAILABLE'),
  };
}

const prompt = ai.definePrompt({
  name: 'diagnosePestDiseasePrompt',
  input: {
    schema: DiagnosePestDiseaseInputSchema
  },
  output: { schema: DiagnosePestDiseaseOutputSchema },
  prompt: `
LANGUAGE INSTRUCTION (CRITICAL):
Output Language: {{language}}
- If "am": Respond ONLY in Amharic (አማርኛ). Use Ge'ez script.
- If "om": Respond ONLY in Oromifa (Afaan Oromoo). Use Latin script.
- If "ti": Respond ONLY in Tigrinya (ትግርኛ). Use Ge'ez script.
- If "so": Respond ONLY in Somali (Soomaali). Use Latin script.
- If "en": Respond in English.

ROLE:
You are an expert Ethiopian Agronomist and Translator. Your goal is to provide a highly accurate crop diagnosis and practical solutions for Ethiopian farmers.

INPUTS:
1. Specialist Data: {{specialistData}}
2. Photo: {{media url=photoDataUri}}

INSTRUCTIONS:
- If "Specialist Data" is available, use its findings as the primary source for the diagnosis (medical name, probability).
- If "Specialist Data" is NOT available or empty, analyze the image directly to provide your best diagnosis.
- Translate the diagnosis and solutions into the requested language ({{language}}).
- Provide practical, traditional, and modern organic solutions suitable for Ethiopian farming conditions.
- Ensure the tone is helpful and encouraging for a farmer.

Response JSON should strictly follow this schema:
{
  "diagnosis": "Name of disease/pest + confidence",
  "solution": "Clear, actionable steps in local language"
}
`,
});

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
