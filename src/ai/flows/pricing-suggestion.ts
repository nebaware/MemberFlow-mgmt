// PricingSuggestion.ts
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { invokeAI, AIResult } from '@/ai/orchestrator';

const PricingSuggestionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productQuality: z.string().describe('The quality of the product (e.g., excellent, good, fair).'),
  marketTrends: z.string().describe('Current market trends for the product.'),
  seasonality: z.string().describe('Seasonality factors affecting the product.'),
  currentPrice: z.number().describe('The current price of the product.'),
  language: z
    .enum(['en', 'am', 'om', 'ti', 'so'])
    .optional()
    .describe('The language for the response: en (English), am (Amharic), om (Oromifa), ti (Tigrinya), or so (Somali). Defaults to English.'),
});
export type PricingSuggestionInput = z.infer<typeof PricingSuggestionInputSchema>;

const PricingSuggestionOutputSchema = z.object({
  suggestedPrice: z.number().describe('The AI-suggested price for the product.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type PricingSuggestionOutput = z.infer<typeof PricingSuggestionOutputSchema>;

/**
 * Reliable Pricing Suggestion
 */
export async function getPricingSuggestion(input: PricingSuggestionInput): Promise<AIResult<PricingSuggestionOutput>> {
  return invokeAI<PricingSuggestionOutput>(pricingSuggestionPrompt, input);
}

const pricingSuggestionPrompt = ai.definePrompt({
  name: 'pricingSuggestionPrompt',
  input: { schema: PricingSuggestionInputSchema },
  output: { schema: PricingSuggestionOutputSchema },
  prompt: `You are an AI pricing assistant for Ethiopian farmers. Based on the product name, quality, market trends, seasonality, and current price, suggest an optimal price for the product.

LANGUAGE INSTRUCTION:
Language code: {{language}}
- If language is "am": Respond ONLY in Amharic (አማርኛ) using Ge'ez script for ALL text. Do not use English.
- If language is "om": Respond ONLY in Oromifa (Afaan Oromoo) using Latin script. Do not use English.
- If language is "ti": Respond ONLY in Tigrinya (ትግርኛ) using Ge'ez script. Do not use English.
- If language is "so": Respond ONLY in Somali (Soomaali) using Latin script. Do not use English.
- If language is "en" or not specified: Respond in English.

Product Name: {{{productName}}}
Product Quality: {{{productQuality}}}
Market Trends: {{{marketTrends}}}
Seasonality: {{{seasonality}}}
Current Price: {{{currentPrice}}}

Consider all factors to give best pricing suggestion in terms of maximizing revenue for Ethiopian market conditions.

Your suggested price:`,
});

export const pricingSuggestionFlow = ai.defineFlow(
  {
    name: 'pricingSuggestionFlow',
    inputSchema: PricingSuggestionInputSchema,
    outputSchema: PricingSuggestionOutputSchema,
  },
  async input => {
    const result = await getPricingSuggestion(input);
    if (!result.success) throw new Error(result.error);
    return result.data!;
  }
);
