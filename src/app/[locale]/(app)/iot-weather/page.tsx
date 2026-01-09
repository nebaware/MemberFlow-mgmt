
"use client";

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { WeatherCard } from '@/components/iot-weather/weather-card';
import { IoTDeviceCard } from '@/components/iot-weather/iot-device-card';
import { DeviceRegistration } from '@/components/iot-weather/device-registration';
import type { WeatherAlert } from '@/lib/types';
import type { IoTDevice } from '@/lib/types/iot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, Router, Thermometer, CloudRain, CloudSun, CloudSnow, Cloud, RefreshCw, MapPin, Wind, Droplets, Eye, Sunrise, Sunset } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type React from 'react';
import { useTranslations } from 'next-intl';
import { useApp } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton';

const weatherIconMap: { [key: string]: React.ElementType } = {
  Thermometer: Thermometer,
  CloudRain: CloudRain,
  CloudSun: CloudSun,
  CloudSnow: CloudSnow,
  Cloud: Cloud,
};

const ETHIOPIAN_CITIES = [
  'Addis Ababa', 'Bahir Dar', 'Mekelle', 'Hawassa',
  'Dire Dawa', 'Gondar', 'Jimma', 'Adama'
];

export default function IoTWeatherPage() {
  const { toast } = useToast();
  const t = useTranslations();
  const { user } = useApp();
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState('Addis Ababa');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const fetchDevices = async () => {
    if (!user?.id) return;
    setDevicesLoading(true);
    try {
      const res = await fetch(`/api/iot/devices?farmerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (err) { }
    finally { setDevicesLoading(false); }
  };

  const fetchWeatherData = async (city: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/weather/real-time?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        setWeatherData(data);
        const alerts = data.alerts.map((alert: any, index: number) => ({
          id: `alert-${index}`,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          timestamp: new Date(),
          iconName: alert.icon,
        }));
        setWeatherAlerts(alerts);
        setLastUpdate(new Date());

        alerts.filter((a: any) => a.severity === 'High').forEach((alert: any) => {
          const IconComponent = weatherIconMap[alert.iconName] || Cloud;
          toast({
            variant: 'destructive',
            title: alert.type,
            description: alert.message,
          });
        });
      }
    } catch (err) { }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchWeatherData(selectedCity);
    fetchDevices();
    const interval = setInterval(() => {
      fetchWeatherData(selectedCity);
      fetchDevices();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedCity, user?.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 p-8 md:p-12 border border-blue-500/10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black font-outfit tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">
              {t('iot.title')}
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg font-medium">
              {t('iot.description')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/20 dark:bg-black/20 backdrop-blur-xl p-3 rounded-[2rem] border border-white/20">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-white/10 glass">
                {ETHIOPIAN_CITIES.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchWeatherData(selectedCity)}
              disabled={isLoading}
              className="rounded-full bg-white/10 border-white/20"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      {weatherData && (
        <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-2xl rounded-[3rem] overflow-hidden group">
          <div className="p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <MapPin className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-4xl font-black font-outfit uppercase tracking-tight">{weatherData.city}</h2>
                  <p className="text-xl font-bold text-muted-foreground/60">{weatherData.region}</p>
                </div>
              </div>
              <div className="text-center md:text-right space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                  Last sync: {lastUpdate.toLocaleTimeString()}
                </p>
                <div className="flex gap-2 justify-center md:justify-end">
                  {weatherData.simulated && <Badge variant="outline" className="rounded-full px-4 border-blue-500/20 text-blue-600 font-bold uppercase text-[10px]">Real-time simulation</Badge>}
                  {weatherData.season && <Badge className="rounded-full px-4 bg-blue-600 text-white font-bold uppercase text-[10px]">{weatherData.season} Season</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Thermometer, value: `${weatherData.current.temp}°C`, label: 'Temperature', sub: `Feels like ${weatherData.current.feels_like}°C`, color: 'text-red-500', bg: 'bg-red-500/10' },
                { icon: Droplets, value: `${weatherData.current.humidity}%`, label: 'Humidity', sub: weatherData.current.description, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { icon: Wind, value: weatherData.current.wind_speed, label: 'Wind Speed', sub: `${weatherData.current.wind_direction}° Direction`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Eye, value: weatherData.current.visibility, label: 'Visibility', sub: `${weatherData.current.clouds}% Cloud cover`, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((metric, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-muted/20 border border-white/5 text-center space-y-4 hover:bg-muted/30 transition-all group/metric">
                  <div className={`h-16 w-16 mx-auto rounded-2xl ${metric.bg} flex items-center justify-center transition-transform group-hover/metric:scale-110`}>
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black font-outfit">{metric.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{metric.label}</p>
                    <p className="text-xs font-bold text-muted-foreground/40 capitalize">{metric.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-12 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <Sunrise className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Sunrise</p>
                  <p className="text-xl font-black font-outfit lowercase">{weatherData.current.sunrise}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Sunset className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Sunset</p>
                  <p className="text-xl font-black font-outfit lowercase">{weatherData.current.sunset}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-8">
          <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
                <BellRing className="h-7 w-7 text-blue-600" />
                Alerts & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
              ) : weatherAlerts.length > 0 ? (
                weatherAlerts.map((alert) => (
                  <WeatherCard key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="text-center py-12 space-y-4 opacity-40">
                  <CloudSun className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-bold text-muted-foreground">All conditions are stable.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
                  <Router className="h-7 w-7 text-emerald-600" />
                  Connected Devices
                </CardTitle>
                {user && <DeviceRegistration farmerId={user.id.toString()} onDeviceAdded={fetchDevices} />}
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {devicesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-3xl" />)}
                </div>
              ) : devices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {devices.map((device) => (
                    <IoTDeviceCard key={device.id} device={device} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 space-y-8 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted/20">
                  <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                    <Router className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black font-outfit">{t('iot.no_devices') || 'No IoT devices connected'}</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-lg leading-relaxed">
                      Register your devices to monitor your farm's real-time health.
                    </p>
                  </div>
                  {user && <DeviceRegistration farmerId={user.id.toString()} onDeviceAdded={fetchDevices} />}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
