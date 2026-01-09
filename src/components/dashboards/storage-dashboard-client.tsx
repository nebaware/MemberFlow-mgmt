
"use client";

import { useTranslations } from 'next-intl';
import { Warehouse, Thermometer, Droplets, Box, Calendar, TrendingUp, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';

export function StorageDashboardClient() {
    const t = useTranslations();
    const { user } = useApp();

    const facilities = [
        {
            id: "STR-441-A",
            name: "North Gonder Cold Storage",
            type: "Cold Storage",
            capacity: 500,
            occupied: 412,
            unit: "Tons",
            temp: "-2°C",
            humidity: "45%",
            status: "optimal",
            activeBookings: 12
        },
        {
            id: "STR-441-B",
            name: "Batu Grain Silo 4",
            type: "Dry Storage / Silo",
            capacity: 1200,
            occupied: 600,
            unit: "Tons",
            temp: "22°C",
            humidity: "12%",
            status: "warning", // Maybe a sensor issue
            activeBookings: 5
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-indigo-600 border-none rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest opacity-60">Total Capacity Occupied</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black font-outfit">1,012</span>
                            <span className="text-xl opacity-60">/ 1,700 Tons</span>
                        </div>
                        <Progress value={(1012 / 1700) * 100} className="h-2 bg-white/20" />
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Warehouse className="h-24 w-24" />
                    </div>
                </Card>

                <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between group">
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Active Bookings</p>
                        <h3 className="text-4xl font-black font-outfit uppercase tracking-tight">17 <span className="text-sm opacity-40 font-bold ml-2">Units</span></h3>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                        <TrendingUp className="h-4 w-4" />
                        <span>+12% this month</span>
                    </div>
                </Card>

                <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between group">
                    <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Estimated Revenue</p>
                        <h3 className="text-4xl font-black font-outfit uppercase tracking-tight">156k <span className="text-sm opacity-40 font-bold ml-2">Birr</span></h3>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Paid via Escrow</span>
                    </div>
                </Card>
            </div>

            {/* Facility Management Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                        <CardHeader className="p-10 border-b border-white/5">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-3xl font-black font-outfit uppercase tracking-tight">Facility Inventory</CardTitle>
                                    <CardDescription className="text-base font-medium opacity-60">Monitor capacity and environmental metrics per unit.</CardDescription>
                                </div>
                                <Button variant="outline" className="rounded-2xl glass font-black uppercase tracking-widest text-[10px] h-10 px-6">
                                    Add Unit
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-white/5">
                                {facilities.map((fac) => (
                                    <div key={fac.id} className="p-10 hover:bg-white/5 transition-all group">
                                        <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={`rounded-full uppercase font-black text-[9px] tracking-widest ${fac.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}>
                                                        {fac.status}
                                                    </Badge>
                                                    <span className="text-xs font-black text-muted-foreground uppercase">{fac.id}</span>
                                                </div>
                                                <h4 className="text-3xl font-black font-outfit uppercase leading-none">{fac.name}</h4>
                                                <p className="text-sm font-medium opacity-60">{fac.type}</p>
                                            </div>

                                            <div className="flex gap-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                                        <Thermometer className="h-6 w-6 text-blue-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Temp</p>
                                                        <p className="text-lg font-black">{fac.temp}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                                        <Droplets className="h-6 w-6 text-indigo-500" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Humidity</p>
                                                        <p className="text-lg font-black">{fac.humidity}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 space-y-3">
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                                                <span className="text-muted-foreground/60">Capacity Fill Level</span>
                                                <span>{fac.occupied} / {fac.capacity} {fac.unit} ({Math.round((fac.occupied / fac.capacity) * 100)}%)</span>
                                            </div>
                                            <Progress value={(fac.occupied / fac.capacity) * 100} className="h-2.5 bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 overflow-hidden relative group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-indigo-500" />
                                </div>
                                <h4 className="text-xl font-black font-outfit uppercase tracking-tight">Recent Bookings</h4>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { client: "Green Valley Ltd", units: "50T", date: "2h ago" },
                                    { client: "Mojo Onion Coop", units: "125T", date: "Yesterday" },
                                    { client: "Zway Veggie Export", units: "80T", date: "3 days ago" }
                                ].map((b, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold">{b.client}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{b.date}</p>
                                        </div>
                                        <Badge variant="outline" className="rounded-lg font-black text-[9px]">{b.units}</Badge>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100">
                                View Comprehensive Logs
                            </Button>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-600/10 to-transparent border border-amber-500/10 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-amber-500" />
                            </div>
                            <h4 className="text-xl font-black font-outfit uppercase tracking-tight">Compliance Alert</h4>
                        </div>
                        <p className="text-sm font-medium opacity-60">
                            The health inspection for Batu Silo 4 is due in 3 days. Upload your new certification to maintain your verified provider status.
                        </p>
                        <Button className="w-full rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 font-black uppercase tracking-widest text-[10px] h-12">
                            Submit Certification
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
