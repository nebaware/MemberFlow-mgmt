import * as fs from 'fs';
import * as path from 'path';

/**
 * Groq Translation Service (FREE)
 * Uses Llama 3.1 8B via Groq's free API
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

const LANGUAGE_NAMES: Record<string, string> = {
    'en': 'English',
    'am': 'Amharic (አማርኛ)',
    'om': 'Oromifa (Afaan Oromoo)',
    'ti': 'Tigrinya (ትግርኛ)',
    'so': 'Somali (Soomaali)',
};

export interface GroqTranslationResult {
    diagnosis: string;
    solution: string;
}

export async function translateWithGroq(
    specialistData: string,
    language: string
): Promise<GroqTranslationResult | null> {
    const apiKey = process.env.GROQ_API_KEY;
    const logFile = path.join(process.cwd(), 'groq-debug.log');
    const log = (msg: string) => fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);

    log(`translateWithGroq called for ${language}`);

    if (!apiKey) {
        log('ERROR: GROQ_API_KEY missing');
        return null;
    }

    const langName = LANGUAGE_NAMES[language] || 'English';

    const system = `You are an expert Ethiopian Agronomist. 
Translate technical plant diagnoses into ${langName}. 
Respond ONLY with a JSON object containing "diagnosis" and "solution" fields.`;

    const user = `TECHNICAL DATA:
${specialistData}

Respond ONLY in ${langName} as JSON.`;

    try {
        const resp = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user }
                ],
                temperature: 0.1,
                max_tokens: 2048,
                // response_format: { type: 'json_object' }
            }),
        });

        if (!resp.ok) {
            const errorText = await resp.text();
            log(`ERROR: API Response NOT OK (${resp.status}): ${errorText}`);
            return null;
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content;
        log(`RAW CONTENT: ${content?.substring(0, 200)}...`);

        if (!content) return null;

        try {
            const parsed = JSON.parse(content);
            return {
                diagnosis: parsed.diagnosis || "Medical Diagnosis",
                solution: parsed.solution || "Treatment advice not available."
            };
        } catch (pe) {
            log(`JSON PARSE ERROR: ${pe}`);
            return null;
        }
    } catch (err) {
        log(`FATAL ERROR: ${err}`);
        return null;
    }
}
