/**
 * Plant.id (Kindwise) API Service
 * Specialized in plant identification and disease diagnosis.
 */

const PLANT_ID_URL = 'https://plant.id/api/v3/identification';

export interface PlantIdDiagnosisResult {
    is_plant: boolean;
    is_healthy: boolean;
    suggestions: Array<{
        name: string;
        probability: number;
        details?: {
            description?: string;
            treatment?: Record<string, string[]>;
        };
    }>;
}

/**
 * Call Plant.id API to get specialist diagnosis
 */
export async function getSpecialistDiagnosis(photoDataUri: string): Promise<PlantIdDiagnosisResult | { error: string } | null> {
    const apiKey = process.env.PLANT_ID_API_KEY;

    if (!apiKey) {
        return { error: "PLANT_ID_API_KEY_MISSING" };
    }

    try {
        const response = await fetch(PLANT_ID_URL, {
            method: 'POST',
            headers: {
                'Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                images: [photoDataUri],
                health: 'all',
                similar_images: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            if (response.status === 429) {
                // Quota or rate limit — treat as a known, user-friendly safe-mode trigger
                return { error: 'PLANT_ID_RATE_LIMITED' };
            }
            return { error: `PLANT_ID_HTTP_${response.status}_${errorText.substring(0, 50)}` };
        }

        const data = await response.json();

        // Mapping v3 structure based on debug keys: is_healthy, is_plant, classification, disease
        const result = data.result || data;

        // If 'disease' is present, it likely contains our health suggestions
        const healthResult = result.disease || result.health_assessment || result.health;

        if (!healthResult) {
            return { error: "PLANT_ID_NO_DISEASE_DATA" };
        }

        return {
            is_plant: result.is_plant?.binary ?? result.is_plant ?? true,
            is_healthy: result.is_healthy?.binary ?? result.is_healthy ?? false,
            suggestions: healthResult.suggestions?.map((s: any) => ({
                name: s.name,
                probability: s.probability,
                details: s.details
            })) || []
        };
    } catch (error) {
        return { error: `PLANT_ID_FETCH_FAILED_${String(error).substring(0, 50)}` };
    }
}
