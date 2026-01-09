"use client";

import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';

export default function CooperativePlannerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const { toast } = useToast();
  const t = useTranslations();
  const locale = useLocale();
  const [responseLanguage, setResponseLanguage] = useState<'en' | 'am' | 'om' | 'ti' | 'so'>(locale as any || 'en');

  const [formData, setFormData] = useState({
    region: '',
    farmSize: '',
    currentCrops: '',
    availableResources: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPlan(null);

    try {
      const response = await fetch('/api/cooperative-planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          farmSize: parseFloat(formData.farmSize),
          currentCrops: formData.currentCrops.split(',').map(c => c.trim()).filter(Boolean),
          language: responseLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('common.error'));
      }

      setPlan(data);

      toast({
        title: t('common.success'),
        description: t('cooperative.plan_ready') || 'Your personalized cooperative planting plan is ready!',
      });

      // Scroll to results
      setTimeout(() => {
        document.getElementById('plan-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message || 'Failed to generate plan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-8 border border-blue-500/10">
        <div className="relative z-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('cooperative.title')}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            {t('cooperative.description')}
          </p>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-600/5 to-transparent p-8">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-black font-outfit tracking-tight">
              {t('cooperative.farm_info')}
            </CardTitle>
            <CardDescription className="text-base font-medium opacity-80">
              {t('cooperative.farm_info_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('ai.response_language') || 'Response Language'}</Label>
                <Select value={responseLanguage} onValueChange={(value: any) => setResponseLanguage(value)}>
                  <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                    <SelectItem value="om">Afaan Oromoo (Oromo)</SelectItem>
                    <SelectItem value="ti">ትግርኛ (Tigrinya)</SelectItem>
                    <SelectItem value="so">Soomaali (Somali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('cooperative.region')}</Label>
                  <Input
                    className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10"
                    placeholder={t('cooperative.region_placeholder')}
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('cooperative.farm_size')}</Label>
                  <Input
                    className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('cooperative.current_crops')}</Label>
                <Input
                  className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10"
                  placeholder={t('cooperative.crops_placeholder')}
                  value={formData.currentCrops}
                  onChange={(e) => setFormData({ ...formData, currentCrops: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('cooperative.resources')}</Label>
                <Textarea
                  className="rounded-xl bg-white/50 dark:bg-white/5 border-white/10 min-h-[120px]"
                  placeholder={t('cooperative.resources_placeholder')}
                  value={formData.availableResources}
                  onChange={(e) => setFormData({ ...formData, availableResources: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl text-lg font-bold" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Target className="mr-3 h-5 w-5" />
                )}
                {isLoading ? t('cooperative.generating') : t('cooperative.generate_plan')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-7 space-y-8" id="plan-results">
          {plan ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-green-600/10 to-transparent p-8">
                  <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    {t('cooperative.recommended_crops')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {plan.recommendedCrops?.map((crop: any, index: number) => (
                    <div key={index} className="p-6 rounded-2xl bg-muted/20 border border-white/5 space-y-4 group transition-all hover:bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black font-outfit uppercase tracking-tight">{crop.cropName}</h3>
                        <Badge className={`${crop.profitPotential?.includes('High') ? 'bg-green-500/20 text-green-600' : 'bg-blue-500/20 text-blue-600'} border-none px-4 py-1.5 rounded-full font-bold`}>
                          {crop.profitPotential}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <span className="block text-[10px] font-black text-muted-foreground uppercase mb-1">{t('cooperative.planting_window')}</span>
                          <p>{crop.plantingWindow}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <span className="block text-[10px] font-black text-muted-foreground uppercase mb-1">{t('cooperative.expected_harvest')}</span>
                          <p>{crop.expectedHarvestDate}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed italic border-l-4 border-green-500/40 pl-4 py-1">
                        {crop.marketOutlook}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black font-outfit flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      {t('cooperative.coordination_advice')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <p className="text-muted-foreground leading-relaxed">{plan.coordinationAdvice}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black font-outfit flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      {t('cooperative.diversification')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <p className="text-muted-foreground leading-relaxed">{plan.diversificationStrategy}</p>
                  </CardContent>
                </Card>
              </div>

              {plan.riskFactors && plan.riskFactors.length > 0 && (
                <Card className="bg-red-500/5 border border-red-500/20 shadow-2xl rounded-3xl overflow-hidden">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-black font-outfit flex items-center gap-3 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      {t('cooperative.risk_factors')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <ul className="space-y-2">
                      {plan.riskFactors.map((risk: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 text-red-900/80 dark:text-red-300">
                          <div className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0"></div>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/20">
              <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black font-outfit">{t('cooperative.no_plan')}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto text-lg leading-relaxed">
                  {t('cooperative.no_plan_desc')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex flex-col items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Smart Matching</span>
                </div>
                <div className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex flex-col items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Profit Focus</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
