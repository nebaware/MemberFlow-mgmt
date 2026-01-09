"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getPricingSuggestion, PricingSuggestionOutput } from "@/ai/flows/pricing-suggestion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { DollarSign, CheckCircle, AlertTriangle, Sparkles, TrendingUp, Languages, ArrowRight, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';


const pricingSchema = z.object({
  productName: z.string().min(2, "Product name is required."),
  productQuality: z.string().min(1, "Product quality is required."),
  marketTrends: z.string().min(5, "Market trends description is required."),
  seasonality: z.string().min(1, "Seasonality is required."),
  currentPrice: z.coerce.number().positive("Current price must be a positive number."),
});

type PricingFormValues = z.infer<typeof pricingSchema>;

const productQualities = ["Excellent", "Good", "Fair", "Average"];
const seasonalities = ["Peak Season", "Off Season", "Shoulder Season", "Year-round"];

export function PricingForm() {
  const { toast } = useToast();
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [suggestion, setSuggestion] = useState<PricingSuggestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseLanguage, setResponseLanguage] = useState<'en' | 'am' | 'om' | 'ti' | 'so'>(locale as any || 'en');

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      productName: "",
      productQuality: "",
      marketTrends: "",
      seasonality: "",
      currentPrice: 0,
    },
  });

  async function onSubmit(values: PricingFormValues) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {

      const result = await getPricingSuggestion({
        productName: values.productName,
        productQuality: values.productQuality,
        marketTrends: values.marketTrends,
        seasonality: values.seasonality,
        currentPrice: values.currentPrice,
        language: responseLanguage,
      });

      if (result.success && result.data) {
        setSuggestion(result.data);
        toast({
          title: t('suggestion_ready'),
          description: t('suggestion_desc', { product: values.productName }),
        });
      } else {
        setError(result.error || t('analysis_failed'));
        if (result.isRateLimited) {
          toast({
            title: "Service Busy",
            description: result.error,
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Pricing AI unexpected error:', err);
      setError(t('analysis_failed'));
    } finally {
      setIsLoading(false);
    }
  }

  const chartData = suggestion ? [
    { name: t('current_price'), price: form.getValues().currentPrice },
    { name: t('suggested_price'), price: suggestion.suggestedPrice },
  ] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-700">
      <Card className="lg:col-span-5 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-600/10 to-transparent p-8">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-black font-outfit tracking-tight">
            {t('product_details')}
          </CardTitle>
          <CardDescription className="text-base font-medium opacity-80">
            {t('product_details_desc')}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 pt-0 space-y-6">
            <CardContent className="px-0 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('response_language')}</label>
                <Select value={responseLanguage} onValueChange={(value: 'en' | 'am' | 'om' | 'ti' | 'so') => setResponseLanguage(value)}>
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

              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('product_name_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('product_name_placeholder')} {...field} className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="productQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('quality_label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10">
                            <SelectValue placeholder={t('quality_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productQualities.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seasonality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('seasonality_label')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10">
                            <SelectValue placeholder={t('seasonality_placeholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seasonalities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('current_price_label')}</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-blue-500" />
                        <Input type="number" className="h-14 pl-12 rounded-xl bg-white/50 dark:bg-white/5 border-white/10 text-xl font-bold font-outfit" placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketTrends"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">{t('market_trends_label')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('market_trends_placeholder')}
                        {...field}
                        className="rounded-xl bg-white/50 dark:bg-white/5 border-white/10 min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="px-0 pb-0">
              <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg font-bold shadow-xl transition-all hover:shadow-blue-500/20" disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-3 h-5 w-5" />
                )}
                {isLoading ? t('analyzing') : t('analyze_button')}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <div className="lg:col-span-7 space-y-8">
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden min-h-[500px] flex flex-col justify-center">
          <CardHeader className="bg-gradient-to-br from-purple-600/10 to-transparent p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black font-outfit tracking-tight flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  {t('ai_analysis_title')}
                </CardTitle>
                <CardDescription className="text-base font-medium opacity-80">{t('ai_analysis_desc')}</CardDescription>
              </div>
              {suggestion && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-4 py-1.5 rounded-full font-bold">
                  Target Identified
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-8">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-blue-500/10 animate-pulse"></div>
                  <div className="absolute top-0 left-0 h-32 w-32 rounded-full border-t-4 border-blue-600 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-blue-600 animate-bounce" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black font-outfit">{t('analyzing_market')}</h3>
                  <p className="text-muted-foreground font-medium">{t('comparing_markets')}</p>
                </div>
              </div>
            )}

            {error && !suggestion && (
              <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-bold font-outfit">{t('analysis_failed')}</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            )}

            {suggestion && !isLoading && (
              <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2rem] bg-muted/20 border border-white/5 space-y-1 text-center group transition-all hover:bg-muted/30">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">{t('current_price')}</span>
                    <p className="text-4xl font-black font-outfit">
                      {Number(form.getValues().currentPrice).toLocaleString()}
                    </p>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{t('common.birr')}</span>
                  </div>
                  <div className="p-8 rounded-[2rem] bg-green-500/10 border-2 border-green-500/20 space-y-1 text-center group transition-all hover:bg-green-500/15 shadow-2xl shadow-green-500/5">
                    <span className="text-xs font-black uppercase tracking-widest text-green-600/80">{t('suggested_price')}</span>
                    <p className="text-4xl font-black font-outfit text-green-600">
                      {suggestion.suggestedPrice.toLocaleString()}
                    </p>
                    <span className="text-xs font-bold text-green-600/60 uppercase">{t('common.birr')}</span>
                  </div>
                </div>

                <div className="h-[250px] w-full p-6 rounded-3xl bg-muted/10 border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          borderRadius: '1.5rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                          padding: '1rem'
                        }}
                      />
                      <Bar dataKey="price" radius={[12, 12, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#16a34a'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-2xl overflow-hidden group">
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-black font-outfit flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-blue-300" /> {t('ai_reasoning')}
                    </h3>
                    <p className="text-lg leading-relaxed font-medium text-blue-50/90 italic">
                      "{suggestion.reasoning}"
                    </p>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-10 flex items-center h-full">
                    <Languages className="h-32 w-32" />
                  </div>
                </div>

                <Button className="w-full h-16 rounded-[1.5rem] bg-green-600 hover:bg-green-700 text-xl font-black font-outfit tracking-tight shadow-xl hover:shadow-green-500/20 transition-all hover:-translate-y-1">
                  {t('apply_price')}
                </Button>
              </div>
            )}

            {!isLoading && !error && !suggestion && (
              <div className="text-center py-16 space-y-8">
                <div className="h-24 w-24 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-blue-500/10">
                  <TrendingUp className="h-10 w-10 text-blue-500/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black font-outfit">{t('ready_to_analyze')}</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto text-lg leading-relaxed">
                    {t('ready_desc')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex flex-col items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Market Scan</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/20 border border-white/5 flex flex-col items-center gap-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Trend Mapping</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
