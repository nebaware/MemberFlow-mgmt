import { NextResponse } from 'next/server';
import { dbQuery, isDbConfigured } from '@/lib/db/db';

// GET user's learning progress
export async function GET(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get user's total earned points
    const progressRows = await dbQuery(
      `SELECT 
        COALESCE(SUM(points_earned), 0) as total_earned_points,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_modules,
        COUNT(*) as total_started_modules
       FROM user_learning_progress 
       WHERE user_id = $1`,
      [userId]
    );

    // Get total available points from all modules
    const modulesRows = await dbQuery(
      `SELECT COALESCE(SUM(reward_points), 0) as total_available_points,
       COUNT(*) as total_modules
       FROM learning_modules`
    );

    // Get detailed progress for each module
    const detailedProgress = await dbQuery(
      `SELECT 
        ulp.module_id,
        ulp.completed,
        ulp.progress_percentage,
        ulp.points_earned,
        ulp.completed_at,
        lm.title,
        lm.reward_points
       FROM user_learning_progress ulp
       JOIN learning_modules lm ON ulp.module_id = lm.id
       WHERE ulp.user_id = $1
       ORDER BY ulp.created_at DESC`,
      [userId]
    );

    const progress = progressRows[0] || { total_earned_points: 0, completed_modules: 0, total_started_modules: 0 };
    const modules = modulesRows[0] || { total_available_points: 0, total_modules: 0 };

    return NextResponse.json({
      earnedPoints: Number(progress.total_earned_points),
      totalPoints: Number(modules.total_available_points),
      completedModules: Number(progress.completed_modules),
      totalModules: Number(modules.total_modules),
      startedModules: Number(progress.total_started_modules),
      progressPercentage: modules.total_available_points > 0 
        ? (Number(progress.total_earned_points) / Number(modules.total_available_points)) * 100 
        : 0,
      detailedProgress
    });
  } catch (err: any) {
    console.error('Error fetching learning progress:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

// POST - Update user progress (mark module as completed or update progress)
export async function POST(request: Request) {
  try {
    if (!isDbConfigured()) {
      return NextResponse.json({ error: 'DATABASE not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, moduleId, completed, progressPercentage } = body;

    if (!userId || !moduleId) {
      return NextResponse.json({ error: 'userId and moduleId are required' }, { status: 400 });
    }

    // Get module reward points
    const moduleRows = await dbQuery(
      'SELECT reward_points FROM learning_modules WHERE id = $1',
      [moduleId]
    );

    if (moduleRows.length === 0) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const rewardPoints = moduleRows[0].reward_points;
    const pointsEarned = completed ? rewardPoints : 0;

    // Upsert progress
    const result = await dbQuery(
      `INSERT INTO user_learning_progress (user_id, module_id, completed, progress_percentage, points_earned, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, module_id) 
       DO UPDATE SET 
         completed = $3,
         progress_percentage = $4,
         points_earned = $5,
         completed_at = $6
       RETURNING *`,
      [
        userId,
        moduleId,
        completed || false,
        progressPercentage || 0,
        pointsEarned,
        completed ? new Date().toISOString() : null
      ]
    );

    return NextResponse.json(result[0], { status: 200 });
  } catch (err: any) {
    console.error('Error updating learning progress:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
