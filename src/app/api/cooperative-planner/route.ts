import { NextRequest, NextResponse } from 'next/server';
import { getCooperativePlan } from '@/ai/flows/cooperative-planner';
import { dbQuery, isDbConfigured } from '@/lib/db/db';
import { securityMiddleware, withRateLimit } from '@/lib/security/security-middleware';

export async function POST(request: NextRequest) {
  // Apply security middleware with AI rate limiting
  const securityResult = await securityMiddleware(request, withRateLimit('ai', {
    allowedMethods: ['POST']
  }));

  if (securityResult) {
    return securityResult;
  }
  try {
    const body = await request.json();
    const { region, farmSize, currentCrops, availableResources, userId } = body;

    if (!region || !farmSize) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch market data from database
    let marketData = 'Current market data unavailable';
    if (isDbConfigured()) {
      try {
        const products = await dbQuery(
          `SELECT category, COUNT(*) as count, AVG(price) as avg_price 
           FROM products 
           WHERE location LIKE $1 
           GROUP BY category`,
          [`%${region}%`]
        );

        if (products.length > 0) {
          marketData = products.map((p: any) =>
            `${p.category}: ${p.count} listings, avg price ${parseFloat(p.avg_price).toFixed(2)} Birr`
          ).join('; ');
        }
      } catch (err) {
        console.error('Failed to fetch market data:', err);
      }
    }

    // Get seasonal info (simplified - in production, use weather API)
    const month = new Date().getMonth();
    let seasonalInfo = '';
    if (month >= 2 && month <= 5) {
      seasonalInfo = 'Belg (short rainy season) - good for quick-maturing crops';
    } else if (month >= 6 && month <= 9) {
      seasonalInfo = 'Kiremt (main rainy season) - optimal for major crops like teff, maize';
    } else {
      seasonalInfo = 'Bega (dry season) - focus on irrigation-dependent crops or harvesting';
    }

    // Get AI recommendation with language support
    const result = await getCooperativePlan({
      region,
      farmSize,
      currentCrops: currentCrops || [],
      availableResources: availableResources || 'Basic farming tools',
      marketData,
      seasonalInfo,
      language: body.language || 'en',
    });

    if (!result.success || !result.data) {
      // Throw to catch block to trigger fallback logic
      throw new Error(result.error || 'AI generation failed');
    }

    const plan = result.data;

    // Save recommendation to database if user is logged in
    if (userId && isDbConfigured()) {
      try {
        await dbQuery(
          `INSERT INTO ai_diagnoses (user_id, diagnosis, solution, crop_type)
           VALUES ($1, $2, $3, 'Cooperative Planning')`,
          [userId, JSON.stringify(plan.recommendedCrops), plan.coordinationAdvice]
        );
      } catch (err) {
        console.error('Failed to save plan:', err);
      }
    }

    return NextResponse.json(plan);
  } catch (err: any) {
    console.error('Cooperative planner error:', err);

    // Check if it's an API key issue
    const isApiKeyIssue = err?.message?.includes('API key') ||
      err?.message?.includes('fetch failed') ||
      err?.message?.includes('generativelanguage.googleapis.com');

    const errorMessage = isApiKeyIssue
      ? 'AI service not configured. Please add your GEMINI_API_KEY to .env.local file. See AI_SETUP.md for instructions.'
      : String(err?.message || err);

    return NextResponse.json({
      error: errorMessage,
      fallback: {
        recommendedCrops: [
          {
            cropName: 'Teff',
            plantingWindow: 'June-July (Kiremt season)',
            expectedHarvestDate: 'November-December',
            marketOutlook: 'Stable demand, good for food security',
            profitPotential: 'Medium to High'
          },
          {
            cropName: 'Chickpeas',
            plantingWindow: 'September-October',
            expectedHarvestDate: 'January-February',
            marketOutlook: 'Growing export demand',
            profitPotential: 'High'
          }
        ],
        coordinationAdvice: isApiKeyIssue
          ? '⚠️ AI service not configured. To get real AI recommendations, add your GEMINI_API_KEY to .env.local (see AI_SETUP.md). For now, here are general recommendations based on Ethiopian agricultural patterns.'
          : 'AI service temporarily unavailable. Please check back later.',
        riskFactors: ['Weather variability', 'Market price fluctuations', 'Pest outbreaks'],
        diversificationStrategy: 'Consider mixing staple crops (Teff, Maize) with cash crops (Coffee, Sesame) and pulses (Chickpeas, Lentils) for risk diversification.'
      }
    }, { status: 200 });
  }
}
