"use client";

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  User, Mail, Phone, MapPin, Wallet, Shield,
  CheckCircle, XCircle, Clock, Edit, LogOut,
  TrendingUp, Package, Star, Activity, Calendar,
  DollarSign, ShoppingBag, Truck, Award, Settings,
  Bell, Palette, Save, Lock, AlertCircle, Languages
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, hasPermission, logout as authLogout } from '@/lib/auth/auth';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { RoleRequestForm } from '@/components/profile/role-request-form';
import { useSearchParams } from 'next/navigation';

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const t = useTranslations();
  const { toast } = useToast();

  const [fullUserData, setFullUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    activeListings: 0,
    rating: 0,
    totalEarnings: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/users?id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setFullUserData(data);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const ordersRes = await fetch('/api/orders');
        const productsRes = await fetch('/api/products');
        if (ordersRes.ok && productsRes.ok) {
          const orders = await ordersRes.json();
          const products = await productsRes.json();
          setStats({
            totalOrders: orders.length || 0,
            completedOrders: orders.filter((o: any) => o.status === 'delivered').length || 0,
            activeListings: products.filter((p: any) => p.sellerId === user?.id).length || 0,
            rating: 4.8,
            totalEarnings: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
            pendingPayments: orders.filter((o: any) => o.paymentStatus === 'pending').length || 0,
          });
        }
      } catch (err) { }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('azmera_demo_user');
    router.push('/login');
  };

  if (!user || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  const userData = fullUserData || user;
  const initials = userData?.name
    ? userData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600/10 to-purple-600/5 p-12 md:p-16 border border-indigo-500/10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <AvatarImage src={userData.profileImage} />
              <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-outfit">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-black p-2 rounded-full shadow-xl">
              {userData.verified ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <Clock className="h-6 w-6 text-amber-500" />}
            </div>
          </div>
          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="space-y-1">
              <h1 className="text-6xl font-black font-outfit tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase leading-none">
                {userData.name}
              </h1>
              <p className="text-xl font-medium text-muted-foreground opacity-60">
                Member since {new Date(userData.createdAt).getFullYear()} &bull; {userData.location || 'Ethiopia'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="rounded-full h-8 px-6 bg-indigo-600 text-[10px] font-black uppercase tracking-widest">{userData.role.replace('_', ' ')}</Badge>
              {userData.verified && <Badge className="rounded-full h-8 px-6 bg-emerald-500 text-[10px] font-black uppercase tracking-widest">Verified Partner</Badge>}
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="rounded-2xl border-rose-500/20 text-rose-600 font-black uppercase tracking-widest text-[10px] h-12 px-8 glass">
            {t('common.close')}
          </Button>
        </div>
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full space-y-8">
        <TabsList className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-2 rounded-[2rem] gap-2">
          <TabsTrigger value="profile" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
            <User className="mr-2 h-4 w-4" /> Identity
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all">
            <Settings className="mr-2 h-4 w-4" /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-8">
              <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 shadow-2xl text-center space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Trust Factor</h3>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-6 w-6 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-muted/30'}`} />
                    ))}
                  </div>
                  <p className="text-4xl font-black font-outfit">4.8</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Global Rating</p>
                </div>
                <Separator className="bg-white/10" />
                <div className="space-y-6 text-left">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 transition-colors">
                      <Mail className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-bold truncate flex-1">{userData.email}</p>
                  </div>
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 transition-colors">
                      <Phone className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-bold">{userData.phone || 'Not provided'}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-black uppercase tracking-widest opacity-60">Wallet Balance</h4>
                    <Wallet className="h-8 w-8 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold opacity-60">ETB</p>
                    <p className="text-5xl font-black font-outfit tracking-tighter tabular-nums leading-none">
                      {Number(userData.walletBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Escrow Locked</p>
                      <p className="text-xl font-black font-outfit">{Number(userData.escrowBalance || 0).toLocaleString()}</p>
                    </div>
                    <Button className="rounded-2xl h-12 px-6 bg-white text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:bg-white/90">Top Up</Button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
                  { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'text-emerald-500' },
                  { label: 'Act Listings', value: stats.activeListings, icon: Package, color: 'text-indigo-500' },
                  { label: 'Achievements', value: '12', icon: Award, color: 'text-amber-500' },
                ].map((stat, i) => (
                  <Card key={i} className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 shadow-xl hover:scale-105 transition-transform">
                    <div className="space-y-4">
                      <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
                      <div className="space-y-1">
                        <p className="text-3xl font-black font-outfit">{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-2xl space-y-10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black font-outfit uppercase tracking-tight flex items-center gap-3">
                    <Activity className="h-7 w-7 text-indigo-600" /> Account DNA
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Biography</p>
                      <p className="text-lg font-medium leading-relaxed opacity-80">{userData.bio || 'Professional contributor to the Azmera ecosystem.'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Field Size</p>
                        <p className="text-xl font-black font-outfit">{userData.farmSize || '--'} <span className="text-xs opacity-40">HA</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Experience</p>
                        <p className="text-xl font-black font-outfit">{userData.experienceYears || '--'} <span className="text-xs opacity-40">YRS</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Vehicle</p>
                        <p className="text-xl font-black font-outfit truncate">{userData.vehicleType || 'None'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Primary Tech</p>
                        <p className="text-xl font-black font-outfit truncate">{userData.specialization || 'General'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">Verification Protocol</h3>
                  <div className={`p-8 rounded-[2.5rem] border group transition-all duration-500 ${userData.verified ? 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5' : 'bg-amber-500/5 border-amber-500/20 shadow-amber-500/5'}`}>
                    <div className="flex items-center gap-6">
                      <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center border transition-colors ${userData.verified ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'}`}>
                        {userData.verified ? <Shield className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xl font-black font-outfit uppercase">{userData.verified ? 'Platform Verified' : 'Awaiting Review'}</p>
                        <p className="text-sm font-medium opacity-60">
                          {userData.verified ? 'Your documents were processed successfully. Full trust tier activated.' : 'Our administration is currently validating your provided credentials.'}
                        </p>
                      </div>
                      {userData.verificationStatus === 'rejected' && (
                        <Button className="rounded-2xl h-12 bg-rose-600 text-white font-black uppercase tracking-widest text-[10px]">Resubmit</Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="animate-in fade-in duration-500 delay-100">
              <ChangePasswordForm />
            </div>
            <div className="animate-in fade-in duration-500 delay-200">
              <RoleRequestForm currentRole={userData.role} defaultRole={searchParams.get('requestRole') || undefined} />
            </div>
            <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-2xl lg:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                  <Bell className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black font-outfit uppercase">Communication</h3>
                  <p className="text-sm font-medium text-muted-foreground opacity-60">Manage how Azmera reaches out to you.</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Email Dispatch', desc: 'Summary of orders, payments and escrow changes.', active: true },
                  { label: 'Market Vigil', desc: 'Critical price alerts for your favorited commodities.', active: true },
                  { label: 'Partner Insights', desc: 'Promotional content and productivity newsletters.', active: false },
                ].map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-white/30 dark:bg-black/10 rounded-2xl border border-white/10">
                    <div className="space-y-1">
                      <p className="text-md font-black font-outfit uppercase">{opt.label}</p>
                      <p className="text-xs font-medium text-muted-foreground opacity-60">{opt.desc}</p>
                    </div>
                    <Switch defaultChecked={opt.active} className="data-[state=checked]:bg-indigo-600" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
