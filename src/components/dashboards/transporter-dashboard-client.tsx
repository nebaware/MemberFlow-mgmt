
"use client";

import { useTranslations } from 'next-intl';
import { Truck, MapPin, Package, Clock, TrendingUp, CheckCircle2, AlertCircle, Calendar, ArrowRight, Wallet, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export function TransporterDashboardClient() {
    const t = useTranslations();
    const { user } = useApp();
    const [isAvailable, setIsAvailable] = useState(true);

    const activeJobs = [
        {
            id: "JOB-7721",
            customer: "Abebe Farms",
            pickup: "Bishoftu, Oromia",
            dropoff: "Addis Ababa Market",
            cargo: "2.5 Tons Premium Teff",
            status: "in_transit",
            progress: 65,
            eta: "14:30 Today"
        },
        {
            id: "JOB-7724",
            customer: "Keffa Coffee Coop",
            pickup: "Jimma, Keffa",
            dropoff: "Djibouti Port Express",
            cargo: "120 Bags Arabica Coffee",
            status: "scheduled",
            progress: 0,
            eta: "Tomorrow 08:00"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Immersive Stats Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 border-none rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <Badge className="bg-white/20 text-white border-white/30 rounded-full px-4 py-1 font-bold">
                                Elite Transporter
                            </Badge>
                            <div className="flex items-center gap-2 text-white/60">
                                <BadgeCheck className="h-5 w-5 text-blue-300" />
                                <span className="text-xs font-black uppercase tracking-widest">Verified Prof.</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-widest opacity-60 mb-1">Total Earnings</p>
                            <h2 className="text-5xl font-black font-outfit leading-none">
                                42,850.00 <span className="text-xl opacity-60 uppercase">Birr</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Monthly Jobs</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black font-outfit">28</span>
                                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Rating</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black font-outfit">4.92</span>
                                    <CheckCircle2 className="h-4 w-4 text-blue-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                </Card>

                <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between group">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-4">Live Status</p>
                        <div className="flex items-center gap-4">
                            <div className={`h-4 w-4 rounded-full ${isAvailable ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 opacity-50'}`}></div>
                            <h3 className="text-2xl font-black font-outfit uppercase tracking-tight">{isAvailable ? 'Available' : 'Busy'}</h3>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className={`w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 ${isAvailable ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                    >
                        {isAvailable ? 'Go Offline' : 'Set to Available'}
                    </Button>
                </Card>

                <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between group overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-4">Quick Stats</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold opacity-60">Fuel Efficiency</span>
                                <span className="text-sm font-black">Good</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold opacity-60">Fleet Health</span>
                                <span className="text-sm font-black">100%</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-indigo-500/20">
                        <Truck className="h-24 w-24 rotate-12" />
                    </div>
                </Card>
            </div>

            {/* Active Jobs Section */}
            <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black font-outfit uppercase tracking-tight">Active Delivery Jobs</CardTitle>
                        <CardDescription className="text-base font-medium opacity-60">Real-time tracking of orders in your possession.</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-2xl glass font-black uppercase tracking-widest text-[10px] h-10 px-6">
                        View Job History
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        {activeJobs.map((job) => (
                            <div key={job.id} className="p-10 hover:bg-white/5 transition-colors group">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                                    <div className="lg:col-span-3 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`rounded-full uppercase font-black text-[9px] tracking-widest ${job.status === 'in_transit' ? 'bg-blue-500' : 'bg-muted'}`}>
                                                {job.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs font-black text-muted-foreground uppercase">{job.id}</span>
                                        </div>
                                        <h4 className="text-xl font-black font-outfit uppercase">{job.customer}</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Package className="h-4 w-4" />
                                            <span className="font-medium">{job.cargo}</span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="flex items-center gap-4 relative">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                                <div className="h-10 w-0.5 bg-indigo-500/20 border-dashed border-l"></div>
                                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Pickup</p>
                                                    <p className="text-sm font-bold">{job.pickup}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dropoff</p>
                                                    <p className="text-sm font-bold">{job.dropoff}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-muted-foreground/60">Progress</span>
                                                <span className="text-indigo-400">{job.progress}%</span>
                                            </div>
                                            <Progress value={job.progress} className="h-2 bg-white/5" />
                                        </div>
                                        <div className="flex items-center gap-3 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-widest">ETA: {job.eta}</span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 flex justify-end">
                                        <Button className="rounded-2xl h-12 w-full lg:w-auto px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/10 font-black uppercase tracking-widest text-[10px]">
                                            Handle Job
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recommended Routes / Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/10 rounded-[2.5rem] p-10 flex items-center justify-between group overflow-hidden">
                    <div className="space-y-4 relative z-10">
                        <h4 className="text-2xl font-black font-outfit uppercase tracking-tight">Express Marketplace</h4>
                        <p className="text-sm font-medium opacity-60 max-w-xs">
                            Browse the transport bidding board to find new jobs and maximize your return per kilometer.
                        </p>
                        <Button variant="outline" className="rounded-xl border-emerald-500/30 text-emerald-500 glass font-black uppercase tracking-widest text-[10px]">
                            Bidding Board
                        </Button>
                    </div>
                    <Wallet className="h-24 w-24 text-emerald-500/10 -rotate-12 group-hover:scale-110 transition-transform duration-500" />
                </Card>

                <Card className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 rounded-[2.5rem] p-10 flex items-center justify-between group overflow-hidden">
                    <div className="space-y-4 relative z-10">
                        <h4 className="text-2xl font-black font-outfit uppercase tracking-tight">Route Optimization</h4>
                        <p className="text-sm font-medium opacity-60 max-w-xs">
                            Use Azmera AI to find the most efficient routes avoiding seasonal flooding and checkpoints.
                        </p>
                        <Button variant="outline" className="rounded-xl border-blue-500/30 text-blue-500 glass font-black uppercase tracking-widest text-[10px]">
                            Launch Planner
                        </Button>
                    </div>
                    <MapPin className="h-24 w-24 text-blue-500/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                </Card>
            </div>
        </div>
    );
}
