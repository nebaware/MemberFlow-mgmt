
"use client";

import { useTranslations } from 'next-intl';
import { ShieldCheck, Truck, GraduationCap, Warehouse, ArrowRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';

export default function VerificationCenterPage() {
  const t = useTranslations();
  const { user } = useApp();

  const verificationTracks = [
    {
      id: 'identity',
      title: 'Identity Verification',
      description: 'The foundation of trust on Azmera. Required for all financial transactions.',
      icon: ShieldCheck,
      status: user?.verified ? 'verified' : 'pending',
      color: 'blue',
      link: '/profile?tab=settings',
      requirements: ['Valid Government ID', 'Profile Photo', 'Phone Verification']
    },
    {
      id: 'professional',
      title: 'Professional Licensing',
      description: 'Apply for specialized roles like Transporter, Educator, or Storage Provider.',
      icon: Truck,
      status: user?.role?.toLowerCase() !== 'buyer' && user?.role?.toLowerCase() !== 'farmer' ? 'verified' : 'available',
      color: 'indigo',
      link: '/profile?tab=role-request',
      requirements: ['Business License', 'Commercial Insurance', 'Professional Credentials']
    },
    {
      id: 'farmer',
      title: 'Farmer Certification',
      description: 'Verified Farm status for premium marketplace positioning and trust.',
      icon: CheckCircle2,
      status: user?.role?.toLowerCase() === 'farmer' && user?.verified ? 'verified' : 'available',
      color: 'emerald',
      link: '/profile?tab=role-request',
      requirements: ['Land Ownership Proof', 'Organic Certification (Optional)', 'Farm Inspection']
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Immersive Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-900/40 to-indigo-900/20 p-12 md:p-16 border border-white/10 shadow-2xl">
        <div className="relative z-10 space-y-6 max-w-3xl">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs">
            Azmera Verification Center
          </Badge>
          <h1 className="text-6xl md:text-7xl font-black font-outfit tracking-tight text-white uppercase leading-none">
            Trust is our <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Currency</span>
          </h1>
          <p className="text-xl text-blue-100/60 font-medium leading-relaxed">
            Azmera is a verified community of agricultural professionals. Complete your verification tracks to unlock higher transaction limits, premium marketplace placement, and professional service tools.
          </p>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* Verification Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {verificationTracks.map((track) => (
          <Card key={track.id} className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl hover:border-white/20 transition-all duration-500 group flex flex-col">
            <CardHeader className="p-8 pb-4">
              <div className={`h-16 w-16 rounded-2xl bg-${track.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <track.icon className={`h-8 w-8 text-${track.color}-500`} />
              </div>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-2xl font-black font-outfit">{track.title}</CardTitle>
                {track.status === 'verified' && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-full">Verified</Badge>
                )}
                {track.status === 'pending' && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-full">Action Needed</Badge>
                )}
              </div>
              <CardDescription className="text-base font-medium opacity-60">
                {track.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4 mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">Requirements</p>
                <div className="space-y-3">
                  {track.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-white/20"></div>
                      <span className="text-sm font-medium opacity-80">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link href={track.link} passHref>
                <Button className="w-full h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold group">
                  {track.status === 'verified' ? 'View Credentials' : 'Start Verification'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Quote / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
        <div className="p-12 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 space-y-6">
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 rounded-full font-bold">
            Verified Partner Program
          </Badge>
          <h3 className="text-4xl font-black font-outfit tracking-tight uppercase">
            Why get <span className="text-emerald-500">Verified</span>?
          </h3>
          <ul className="space-y-4">
            {[
              "Higher withdrawal limits and faster payouts",
              "Access to professional service marketplaces",
              "Premium 'Verified' badge on all listings",
              "Exclusive access to regional cooperative groups"
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-lg font-medium opacity-80">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative p-12 rounded-[3rem] bg-indigo-600/10 border border-indigo-500/10 overflow-hidden group">
          <div className="relative z-10 space-y-6 text-center">
            <div className="h-20 w-20 rounded-[2rem] bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-indigo-400" />
            </div>
            <h3 className="text-3xl font-black font-outfit uppercase">Already applied?</h3>
            <p className="text-lg font-medium opacity-60">
              If you have already submitted your verification documents, you can track the status in your profile or contact our support team.
            </p>
            <Button variant="outline" className="h-12 px-8 rounded-2xl glass font-black uppercase tracking-widest text-[10px]">
              Support Center
            </Button>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <ShieldCheck className="h-48 w-48 text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}