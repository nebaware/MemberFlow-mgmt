import { logger } from '@/lib/logger';

/**
 * Standardized AI Output interface
 */
export interface AIResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    isRateLimited?: boolean;
    isMock?: boolean;
}

/**
 * Orchestrator options
 */
interface OrchestratorOptions {
    maxRetries?: number;
    initialDelay?: number;
    fallbackModel?: string;
}

/**
 * sleep helper for backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Reliable AI Orchestrator
 * Sequentially tries multiple model tiers to overcome rate limits.
 */
export async function invokeAI<T>(
    promptFn: any,
    input: any,
    options: OrchestratorOptions = {}
): Promise<AIResult<T>> {
    const {
        maxRetries = 1,
        initialDelay = 500,
        fallbackModel = 'googleai/gemini-1.5-flash',
    } = options;

    const tier2Fallback = 'googleai/gemini-1.5-flash-8b';

    // Ordered list of models to try
    const modelsToTry = [
        undefined, // Primary (from configuredModel)
        fallbackModel,
        tier2Fallback
    ];

    let lastError: any;

    // Outer loop for retries (standard transient errors)
    for (let attempt = 0; attempt <= maxRetries; attempt++) {

        // Inner loop - try each model tier
        for (const model of modelsToTry) {
            try {
                if (attempt > 0 || model !== undefined) {
                    const delay = model !== undefined ? 200 : initialDelay; // Minimum delay for fallback
                    await sleep(delay);
                }

                logger.info(`AI Invocation attempt ${attempt} using model: ${model || 'Primary'}`);

                const { output } = await promptFn(input, model ? { model } : undefined);

                if (!output) {
                    throw new Error('AI returned empty output');
                }

                return { success: true, data: output };

            } catch (err: any) {
                const msg = String(err?.message || err).toLowerCase();
                lastError = err;
                const isRateLimited = msg.includes('429') || msg.includes('too many requests') || msg.includes('quota exceeded');

                if (isRateLimited) {
                    logger.warn(`Model ${model || 'Primary'} rate limited. Trying next tier...`);
                    continue; // Try next model in inner loop
                }

                if (msg.includes('location') || msg.includes('not supported')) {
                    return {
                        success: false,
                        error: "This Gemini API key is not supported in your current region or location. Please try a different API key or use a VPN.",
                        isRateLimited: false
                    };
                }

                // If it's a structural error (e.g. wrong input), don't bother trying other models
                if (msg.includes('invalid') || msg.includes('schema') || msg.includes('permission')) {
                    break;
                }

                // For other transient errors (fetch failed etc), continue to next model
                continue;
            }
        }

        // If we exhausted all models in this attempt, wait for backoff before next outer retry
        if (attempt < maxRetries) {
            await sleep(initialDelay * Math.pow(2, attempt));
        }
    }

    return {
        success: false,
        error: "Our AI service is currently at maximum capacity. This usually happens on free-tier API keys during high usage. Please try again in 1-2 minutes or use a paid Gemini API key for higher limits.",
        isRateLimited: true
    };
}
