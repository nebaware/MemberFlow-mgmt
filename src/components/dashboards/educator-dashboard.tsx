"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, TrendingUp, RefreshCw, GraduationCap, FileText, Award, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

export function EducatorDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    completionRate: 0,
    totalEarnings: 0,
  });
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      // Get user ID from localStorage (real logged-in user)
      const userStr = localStorage.getItem('azmera_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || '4'; // Default to educator user ID from sample data
      
      // Fetch real data from PostgreSQL
      let totalStudents = 0;
      let activeCourses = 0;
      let completionRate = 0;
      let totalEarnings = 0;
      
      try {
        // Fetch learning modules created by this educator
        const modulesResponse = await fetch(`/api/learning/modules?educatorId=${userId}`);
        if (modulesResponse.ok) {
          const modules = await modulesResponse.json();
          activeCourses = Array.isArray(modules) ? modules.filter((m: any) => m.status === 'published').length : 0;
          
          // Calculate total enrollments and earnings from modules
          if (Array.isArray(modules)) {
            totalStudents = modules.reduce((sum: number, m: any) => sum + (m.enrollment_count || 0), 0);
            
            // Calculate earnings from paid courses
            totalEarnings = modules.reduce((sum: number, m: any) => {
              const enrollments = m.enrollment_count || 0;
              const price = parseFloat(m.price) || 0;
              return sum + (enrollments * price);
            }, 0);
          }
        }
        
        // Fetch enrollments to calculate completion rate
        const enrollmentsResponse = await fetch(`/api/learning/enrollments?educatorId=${userId}`);
        if (enrollmentsResponse.ok) {
          const enrollments = await enrollmentsResponse.json();
          if (Array.isArray(enrollments) && enrollments.length > 0) {
            const totalProgress = enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0);
            completionRate = totalProgress / enrollments.length;
          }
        }
      } catch (apiError) {
        console.log('API error, showing zero state:', apiError);
      }

      setStats({
        totalStudents,
        activeCourses,
        completionRate,
        totalEarnings,
      });

      // Generate real activity messages
      const activity: string[] = [];
      
      if (activeCourses > 0) {
        activity.push(`${activeCourses} active ${activeCourses === 1 ? 'course' : 'courses'} available`);
      }
      
      if (totalStudents > 0) {
        activity.push(`${totalStudents} ${totalStudents === 1 ? 'student' : 'students'} enrolled in your courses`);
      }
      
      if (completionRate > 0) {
        activity.push(`${completionRate.toFixed(1)}% average course completion rate`);
      }
      
      if (totalEarnings > 0) {
        activity.push(`Earned ${totalEarnings.toFixed(2)} Birr from teaching`);
      }
      
      // Show helpful message if no data
      if (activity.length === 0) {
        activity.push('No courses created yet - Start by creating your first course!');
        activity.push('Share your knowledge and earn from teaching');
      }
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading educator dashboard:', error);
      setRecentActivity(['Error loading data. Please refresh.']);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: t('dashboard.total_students'), value: stats.totalStudents.toString(), icon: Users, trend: stats.totalStudents > 0 ? `${stats.totalStudents} enrolled` : 'No students yet', trendColor: 'text-blue-500', link: '/learning' },
    { title: t('dashboard.active_courses'), value: stats.activeCourses.toString(), icon: BookOpen, trend: stats.activeCourses > 0 ? 'Active' : 'Create course', trendColor: 'text-green-500', link: '/learning/my-content' },
    { title: t('dashboard.completion_rate'), value: stats.completionRate.toFixed(1) + '%', icon: Award, trend: stats.completionRate > 0 ? 'Avg completion' : 'No data', trendColor: 'text-green-500', link: '/learning/my-content' },
    { title: t('dashboard.total_earnings'), value: Number(stats.totalEarnings).toFixed(0) + ' Birr', icon: TrendingUp, trend: stats.totalEarnings > 0 ? 'From teaching' : 'No earnings yet', trendColor: 'text-green-500', link: '/earnings' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={() => loadDashboardData(true)} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.trend && <p className={`text-xs ${stat.trendColor}`}>{stat.trend} {t('dashboard.from_last')}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
            <CardDescription>{t('dashboard.educator_actions_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/learning/create"><FileText className="mr-2 h-4 w-4" />{t('dashboard.create_course')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/learning/my-content"><BookOpen className="mr-2 h-4 w-4" />{t('dashboard.manage_courses')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/consultations"><MessageSquare className="mr-2 h-4 w-4" />{t('dashboard.consultations')}</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/earnings"><TrendingUp className="mr-2 h-4 w-4" />{t('dashboard.view_earnings')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
            <CardDescription>{t('dashboard.teaching_stats')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentActivity.map((activity, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
