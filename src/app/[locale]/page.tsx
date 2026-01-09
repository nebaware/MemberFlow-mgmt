
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Store,
  Truck,
  GraduationCap,
  Warehouse,
  ShieldCheck,
  Leaf
} from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations('about'); // Reusing about translations for now, will optimize

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm mb-4">
              {t('tagline')}
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
              {t('page_title')}
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl selection:bg-green-100 dark:selection:bg-green-900">
              {t('hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild size="lg" className="gap-2 text-lg h-12 px-8 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 hover:shadow-green-600/40 transition-all">
                <Link href="/join">
                  {t('cta_join')} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg h-12 px-8 backdrop-blur-sm bg-background/50 hover:bg-accent/50">
                <Link href="/market">
                  {t('cta_marketplace')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">{t('core_features')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('solution_description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Store className="h-10 w-10 text-emerald-500" />}
              title={t('feature_marketplace')}
              description={t('feature_marketplace_desc')}
            />
            <FeatureCard
              icon={<Truck className="h-10 w-10 text-blue-500" />}
              title={t('feature_logistics')}
              description={t('feature_logistics_desc')}
            />
            <FeatureCard
              icon={<GraduationCap className="h-10 w-10 text-amber-500" />}
              title={t('feature_learning')}
              description={t('feature_learning_desc')}
            />
            <FeatureCard
              icon={<Leaf className="h-10 w-10 text-green-500" />}
              title={t('feature_ai')}
              description={t('feature_ai_desc')}
            />
            <FeatureCard
              icon={<Warehouse className="h-10 w-10 text-purple-500" />}
              title="Storage Solutions"
              description="Secure, climate-controlled storage for your harvest."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-10 w-10 text-indigo-500" />}
              title="Verified Trust"
              description="Identity and professional verification for safe trading."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-background/60 backdrop-blur-sm group">
      <CardHeader>
        <div className="p-3 w-fit rounded-2xl bg-muted/50 group-hover:bg-primary/10 transition-colors mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
