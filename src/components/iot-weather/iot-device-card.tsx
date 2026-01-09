
import type { IoTDevice } from '@/lib/types/iot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2, Router, Droplets, Gauge, Sprout, LocateFixed } from 'lucide-react';

interface IoTDeviceCardProps {
  device: IoTDevice;
}

const iconMap: { [key: string]: React.ElementType } = {
  Droplets: Droplets,
  Gauge: Gauge,
  Sprout: Sprout,
  LocateFixed: LocateFixed,
  TriangleAlert: AlertTriangle, // Note: AlertTriangle is also used for status, ensure distinction if needed
  Router: Router, // Default
};

export function IoTDeviceCard({ device }: IoTDeviceCardProps) {
  const Icon = iconMap[device.iconName] || Router;

  let statusConfig = {
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    icon: Wifi,
    glow: "shadow-gray-500/5",
    border: "border-gray-500/20"
  };

  switch (device.status) {
    case 'online':
      statusConfig = {
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        icon: Wifi,
        glow: "shadow-emerald-500/5",
        border: "border-emerald-500/20"
      };
      break;
    case 'offline':
      statusConfig = {
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        icon: WifiOff,
        glow: "shadow-rose-500/5",
        border: "border-rose-500/20"
      };
      break;
    case 'error':
      statusConfig = {
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        icon: AlertTriangle,
        glow: "shadow-amber-500/5",
        border: "border-amber-500/20"
      };
      break;
  }

  return (
    <Card className="group relative overflow-hidden bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-emerald-500/10 hover:border-emerald-500/20">
      <CardHeader className="p-6 pb-0 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform ${statusConfig.color}`}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black font-outfit uppercase tracking-tight leading-none">{device.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{device.type}</p>
          </div>
        </div>
        <div className={`h-10 px-4 rounded-full flex items-center gap-2 border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color} transition-all`}>
          <statusConfig.icon className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{device.status}</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Last active</p>
            <p className="text-xs font-bold">{new Date(device.lastSeen).toLocaleTimeString()}</p>
          </div>
          {device.batteryLevel !== undefined && (
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Power</p>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${device.batteryLevel}%` }}></div>
                </div>
                <span className="text-xs font-black">{device.batteryLevel}%</span>
              </div>
            </div>
          )}
        </div>

        {device.lastReading && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(device.lastReading.data).map(([key, value]) => (
              <div key={key} className="p-4 rounded-[1.5rem] bg-white/30 dark:bg-black/20 border border-white/10 group/item hover:bg-white/50 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-outfit">{value}</span>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-tighter">{device.lastReading?.unit || getUnit(key)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {device.metadata && (device.metadata.model || device.metadata.serialNumber) && (
          <div className="flex justify-between gap-4 pt-4 border-t border-white/10">
            {device.metadata.model && (
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">Hardware</p>
                <p className="text-[10px] font-bold">{device.metadata.model}</p>
              </div>
            )}
            {device.metadata.serialNumber && (
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">UUID</p>
                <p className="text-[10px] font-mono font-bold opacity-60 truncate max-w-[100px]">{device.metadata.serialNumber}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getUnit(key: string): string {
  if (key.includes('temp')) return '°C';
  if (key.includes('moist') || key.includes('humid')) return '%';
  if (key.includes('ph')) return '';
  if (key.includes('speed')) return ' km/h';
  if (key.includes('pressure')) return ' hPa';
  return '';
}
