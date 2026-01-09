'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { invokeAI, AIResult } from '@/ai/orchestrator';

const CooperativePlannerInputSchema = z.object({
  region: z.string().describe('The farmer\'s region/location'),
  farmSize: z.number().describe('Farm size in hectares'),
  currentCrops: z.array(z.string()).describe('Currently planted crops'),
  availableResources: z.string().describe('Available resources (irrigation, equipment, etc.)'),
  marketData: z.string().describe('Current market supply data for the region'),
  seasonalInfo: z.string().describe('Current season and upcoming weather patterns'),
  language: z
    .enum(['en', 'am', 'om', 'ti', 'so'])
    .optional()
    .describe('The language for the response: en (English), am (Amharic), om (Oromifa), ti (Tigrinya), or so (Somali). Defaults to English.'),
});
export type CooperativePlannerInput = z.infer<typeof CooperativePlannerInputSchema>;

const CooperativePlannerOutputSchema = z.object({
  recommendedCrops: z.array(z.object({
    cropName: z.string(),
    plantingWindow: z.string(),
    expectedHarvestDate: z.string(),
    marketOutlook: z.string(),
    profitPotential: z.string(),
  })).describe('Recommended crops with timing and market outlook'),
  coordinationAdvice: z.string().describe('Advice on coordinating with other farmers to avoid oversupply'),
  riskFactors: z.array(z.string()).describe('Potential risks to consider'),
  diversificationStrategy: z.string().describe('Strategy for crop diversification'),
});
export type CooperativePlannerOutput = z.infer<typeof CooperativePlannerOutputSchema>;

/**
 * Reliable Cooperative Plan Generation
 */
export async function getCooperativePlan(input: CooperativePlannerInput): Promise<AIResult<CooperativePlannerOutput>> {
  return invokeAI<CooperativePlannerOutput>(cooperativePlannerPrompt, input);
}

const cooperativePlannerPrompt = ai.definePrompt({
  name: 'cooperativePlannerPrompt',
  input: { schema: CooperativePlannerInputSchema },
  output: { schema: CooperativePlannerOutputSchema },
  prompt: `You are an AI agricultural economist and cooperative planning expert for Ethiopian farmers. 
Your goal is to help farmers coordinate their planting schedules to maximize collective profits and avoid market oversupply.

LANGUAGE INSTRUCTION:
Language code: {{language}}
- If language is "am": Respond ONLY in Amharic (አማርኛ) using Ge'ez script for ALL text. Do not use English.
- If language is "om": Respond ONLY in Oromifa (Afaan Oromoo) using Latin script. Do not use English.
- If language is "ti": Respond ONLY in Tigrinya (ትግርኛ) using Ge'ez script. Do not use English.
- If language is "so": Respond ONLY in Somali (Soomaali) using Latin script. Do not use English.
- If language is "en" or not specified: Respond in English.

Analyze the following information:

Region: {{{region}}}
Farm Size: {{{farmSize}}} hectares
Current Crops: {{{currentCrops}}}
Available Resources: {{{availableResources}}}
Market Data: {{{marketData}}}
Seasonal Info: {{{seasonalInfo}}}

Provide strategic recommendations that:
1. Suggest crops with good market potential based on current supply/demand
2. Recommend optimal planting windows to avoid harvest gluts
3. Consider coordination with other farmers in the region
4. Balance profit potential with risk diversification
5. Account for Ethiopian agricultural seasons (Belg, Kiremt, Bega)
6. Consider export opportunities and local market needs

Focus on practical, actionable advice that helps farmers work together for mutual benefit.`,
});

export const cooperativePlannerFlow = ai.defineFlow(
  {
    name: 'cooperativePlannerFlow',
    inputSchema: CooperativePlannerInputSchema,
    outputSchema: CooperativePlannerOutputSchema,
  },
  async input => {
    const result = await getCooperativePlan(input);
    if (!result.success) throw new Error(result.error);
    return result.data!;
  }
);
