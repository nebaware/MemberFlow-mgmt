"use client";

import { PageTitle } from '@/components/shared/page-title';
import { CourseCard } from '@/components/learning/course-card';
// Removed mock data import - using only real PostgreSQL data
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LearningHubPage() {
  const t = useTranslations();

  const [modules, setModules] = useState<any[]>([]);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [loading, setLoading] = useState(true);

  // For demo purposes, using a mock user ID. In production, get from auth context
  const currentUserId = 1;

  // Fetch modules and user progress
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch learning modules
        const modulesRes = await fetch('/api/learning');
        if (modulesRes.ok) {
          const modulesData = await modulesRes.json();
          if (Array.isArray(modulesData) && modulesData.length > 0) {
            setModules(modulesData as any);
          }
        }

        // Fetch user progress
        const progressRes = await fetch(`/api/learning/progress?userId=${currentUserId}`);
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setEarnedPoints(progressData.earnedPoints || 0);
          setTotalPoints(progressData.totalPoints || 0);
          setProgressPercentage(progressData.progressPercentage || 0);
          setCompletedModules(progressData.completedModules || 0);
          setTotalModules(progressData.totalModules || 0);
        } else {
          // Fallback to calculating from modules
          const total = modules.reduce((sum, mod) => sum + mod.rewardPoints, 0);
          setTotalPoints(total);
        }
      } catch (err) {
        console.error('Failed to fetch learning data', err);
        // No fallback - show empty state
        setModules([]);
        setEarnedPoints(0);
        setTotalPoints(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <PageTitle
        title={t('learning.title')}
        description={t('learning.description')}
      />

      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-yellow-500" /> {t('learning.points')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">{t('learning.points')}:</p>
                <p className="font-semibold text-lg text-primary">
                  {earnedPoints} / {totalPoints} {t('learning.points')}
                </p>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {t('learning.modules_completed', { completed: completedModules, total: totalModules })}
                </p>
                {progressPercentage < 100 && (
                  <p className="text-xs text-muted-foreground">{t('learning.continue')}</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <CourseCard key={module.id} module={module as any} />
        ))}
      </div>
    </>
  );
}
