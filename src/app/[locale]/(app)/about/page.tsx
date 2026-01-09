"use client";

import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
  Target, Lightbulb, UsersRound, TrendingUp, Share2, Rocket, ShieldCheck,
  Leaf, ShoppingCart, Truck, BookOpen, DollarSign, Handshake, Award,
  BarChart2, Globe, Brain, UserPlus, PackageCheck, Zap
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { APP_NAME } from '@/lib/constants';
import { motion } from 'framer-motion';
import { ProjectStatus } from '@/components/about/project-status';
import { Roadmap } from '@/components/about/roadmap';

export default function AboutPage() {
  const t = useTranslations();

  const solutionFeatures = [
    { name: t('about.feature_marketplace'), description: t('about.feature_marketplace_desc'), icon: ShoppingCart },
    { name: t('about.feature_ai_planner'), description: t('about.feature_ai_planner_desc'), icon: Zap },
    { name: t('about.feature_ai_advisor'), description: t('about.feature_ai_advisor_desc'), icon: Brain },
    { name: t('about.feature_logistics'), description: t('about.feature_logistics_desc'), icon: Truck },
    { name: t('about.feature_mobile'), description: t('about.feature_mobile_desc'), icon: Globe },
    { name: t('about.feature_escrow'), description: t('about.feature_escrow_desc'), icon: ShieldCheck },
    { name: t('about.feature_learning'), description: t('about.feature_learning_desc'), icon: BookOpen }
  ];

  const keyFeatures = [
    { name: t('about.key_pricing'), icon: DollarSign, description: t('about.key_pricing_desc') },
    { name: t('about.key_cooperative'), icon: Zap, description: t('about.key_cooperative_desc') },
    { name: t('about.key_matching'), icon: UserPlus, description: t('about.key_matching_desc') },
    { name: t('about.key_dashboard'), icon: BarChart2, description: t('about.key_dashboard_desc') },
    { name: t('about.key_delivery'), icon: Truck, description: t('about.key_delivery_desc') },
    { name: t('about.key_language'), icon: Globe, description: t('about.key_language_desc') },
    { name: t('about.key_escrow'), icon: ShieldCheck, description: t('about.key_escrow_desc') },
    { name: t('about.key_advisor'), icon: Leaf, description: t('about.key_advisor_desc') }
  ];

  const howItWorksSteps = [
    { step: 1, title: t('about.step1_title'), description: t('about.step1_desc'), icon: UserPlus },
    { step: 2, title: t('about.step2_title'), description: t('about.step2_desc'), icon: Zap },
    { step: 3, title: t('about.step3_title'), description: t('about.step3_desc'), icon: ShieldCheck },
    { step: 4, title: t('about.step4_title'), description: t('about.step4_desc'), icon: PackageCheck },
    { step: 5, title: t('about.step5_title'), description: t('about.step5_desc'), icon: DollarSign }
  ];

  const businessModel = [
    { name: t('about.revenue_commission'), description: t('about.revenue_commission_desc'), icon: TrendingUp },
    { name: t('about.revenue_premium'), description: t('about.revenue_premium_desc'), icon: Award },
    { name: t('about.revenue_logistics'), description: t('about.revenue_logistics_desc'), icon: Truck },
    { name: t('about.revenue_advertising'), description: t('about.revenue_advertising_desc'), icon: ShoppingCart },
    { name: t('about.revenue_analytics'), description: t('about.revenue_analytics_desc'), icon: BarChart2 }
  ];

  const goToMarketPhases = [
    { phase: 1, title: t('about.phase1_title'), description: t('about.phase1_desc'), icon: Handshake },
    { phase: 2, title: t('about.phase2_title'), description: t('about.phase2_desc'), icon: UsersRound },
    { phase: 3, title: t('about.phase3_title'), description: t('about.phase3_desc'), icon: Rocket }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="overflow-hidden">
      <PageTitle
        title={t('about.page_title') || `${t('nav.about')}`}
        description={t('about.page_description')}
      />

      <div className="space-y-16 pb-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden shadow-2xl bg-gradient-to-br from-primary to-green-700 text-primary-foreground border-none relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <CardContent className="p-8 md:p-20 text-center flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] relative z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Leaf className="w-24 h-24 md:w-32 md:h-32 text-white/90 mb-6 drop-shadow-lg" />
              </motion.div>
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {APP_NAME}
              </motion.h1>
              <motion.p
                className="mt-4 text-xl sm:text-2xl md:text-3xl text-primary-foreground/90 font-light max-w-3xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {t('about.tagline')}
              </motion.p>
              <motion.p
                className="mt-8 text-lg md:text-xl max-w-2xl text-primary-foreground/80"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {t('about.hero_description')}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-time Project Status Section */}
        <ProjectStatus />

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full shadow-lg border-l-4 border-l-primary bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" /> {t('about.mission_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('about.mission_desc')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full shadow-lg border-l-4 border-l-green-600 bg-gradient-to-br from-background to-green-500/5">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-green-600" /> {t('about.vision_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('about.vision_desc')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Expectations / Roadmap Section */}
        <Roadmap />

        {/* Problem & Solution Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2 text-destructive">
                  <Target className="w-8 h-8" /> {t('about.problem_title')}
                </CardTitle>
                <CardDescription className="text-lg">{t('about.problem_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm font-bold">!</span>
                      <span>{t(`about.problem${i}`)}</span>
                    </li>
                  ))}
                </ul>
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                  <Image
                    src="https://placehold.co/600x338.png"
                    alt={t('about.problem_image_alt')}
                    width={600}
                    height={338}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    data-ai-hint="farmer struggle ethiopia"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-lg bg-primary/5 border-primary/20 h-full">
              <CardHeader>
                <CardTitle className="text-3xl flex items-center gap-2 text-primary">
                  <Lightbulb className="w-8 h-8" /> {t('about.solution_title')}
                </CardTitle>
                <CardDescription className="text-lg">{t('about.solution_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('about.solution_description')}
                </p>
                <div className="aspect-video bg-muted rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                  <Image
                    src="https://placehold.co/600x338.png"
                    alt={t('about.solution_image_alt')}
                    width={600}
                    height={338}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    data-ai-hint="app interface farm"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4">{t('about.core_features')}:</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {solutionFeatures.slice(0, 4).map(feature => (
                      <div key={feature.name} className="flex items-start gap-3 p-3 border rounded-lg bg-background/50 hover:bg-background transition-colors">
                        <feature.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm">{feature.name}</h5>
                          <p className="text-xs text-muted-foreground line-clamp-2">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Key Features Grid */}
        <section>
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center justify-center gap-2">
                <Zap className="w-8 h-8 text-primary" />
                {t('about.key_features_title')}
              </h2>
              <p className="text-muted-foreground text-lg">{t('about.key_features_subtitle')}</p>
            </motion.div>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {keyFeatures.map(feature => (
              <motion.div key={feature.name} variants={item}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-transparent hover:border-t-primary">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="p-3 rounded-full bg-primary/10 mb-4 text-primary">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How It Works */}
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 text-center pb-10 pt-10">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <Share2 className="text-primary" /> {t('about.how_it_works_title')}
            </CardTitle>
            <CardDescription className="text-lg">{t('about.how_it_works_subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x border-t">
              {howItWorksSteps.map((item, index) => (
                <div key={item.step} className="p-8 text-center hover:bg-muted/20 transition-colors group relative">
                  <div className="absolute top-4 right-4 text-6xl font-black text-muted/20 select-none group-hover:text-primary/10 transition-colors">
                    {item.step}
                  </div>
                  <div className="relative z-10 flex flex-col items-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg mb-3">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Opportunity & Business Model */}
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BarChart2 className="text-primary" /> {t('about.market_title')}
                </CardTitle>
                <CardDescription>{t('about.market_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3">{t('about.market_snapshot')}</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{t('about.market_target')}</span>
                        <span className="font-medium">{t('about.market_target_value')}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{t('about.market_gdp')}</span>
                        <span className="font-medium">{t('about.market_gdp_value')}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{t('about.market_farmers')}</span>
                        <span className="font-medium">{t('about.market_farmers_value')}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">{t('about.market_youth')}</span>
                        <span className="font-medium">{t('about.market_youth_value')}</span>
                      </li>
                      <li className="flex justify-between pt-1">
                        <span className="text-muted-foreground">{t('about.market_mobile')}</span>
                        <span className="font-medium">{t('about.market_mobile_value')}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('about.target_users')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        t('about.user_farmers'),
                        t('about.user_suppliers'),
                        t('about.user_buyers'),
                        t('about.user_transporters'),
                        t('about.user_educators')
                      ].map((user, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          {user}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="aspect-square bg-muted rounded-xl flex items-center justify-center overflow-hidden shadow-inner relative">
                    <Image
                      src="https://placehold.co/400x400.png"
                      alt={t('about.market_image_alt')}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                      data-ai-hint="ethiopia map agriculture graph"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 backdrop-blur-sm">
                      <p className="text-sm font-medium text-center">{t('about.market_gap_value')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg h-full bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <TrendingUp className="text-primary" /> {t('about.business_model_title')}
                </CardTitle>
                <CardDescription>{t('about.business_model_subtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {businessModel.map((strategy, index) => (
                  <div key={strategy.name} className="flex gap-4 p-3 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                    <div className="shrink-0 mt-1">
                      <strategy.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{strategy.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{strategy.description}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-center font-medium text-primary">
                    {t('about.business_model_note')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Go-to-Market & Security */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Rocket className="text-primary" /> {t('about.gtm_title')}
              </CardTitle>
              <CardDescription>{t('about.gtm_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative pl-4 border-l-2 border-muted ml-4">
                {goToMarketPhases.map((item, index) => (
                  <div key={item.phase} className="relative pl-6">
                    <div className="absolute -left-[29px] top-0 w-10 h-10 rounded-full bg-background border-4 border-primary flex items-center justify-center z-10 shadow-sm">
                      <span className="font-bold text-sm">{item.phase}</span>
                    </div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-green-500/10">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ShieldCheck className="text-green-600" /> {t('about.security_title')}
              </CardTitle>
              <CardDescription>{t('about.security_subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  {t('about.security_measures')}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    t('about.security_encryption'),
                    t('about.security_escrow'),
                    t('about.security_verification'),
                    t('about.security_privacy'),
                    t('about.security_audit'),
                    t('about.security_compliance')
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  {t('about.trust_building')}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    t('about.trust_ratings'),
                    t('about.trust_transparent'),
                    t('about.trust_dispute'),
                    t('about.trust_support')
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Handshake className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl bg-gradient-to-r from-primary to-green-600 text-primary-foreground border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <CardContent className="p-12 text-center relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">{t('about.cta_title')}</h3>
              <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto text-lg">
                {t('about.cta_description')}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/join">
                  <Button size="lg" variant="secondary" className="gap-2 text-primary font-bold px-8 h-12 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <UserPlus className="w-5 h-5" />
                    {t('about.cta_join')}
                  </Button>
                </Link>
                <Link href="/market">
                  <Button size="lg" variant="outline" className="gap-2 bg-transparent text-white border-white hover:bg-white/10 px-8 h-12 text-lg">
                    <ShoppingCart className="w-5 h-5" />
                    {t('about.cta_marketplace')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
