
import type { WeatherAlert } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Cloud, Sun, Thermometer, CloudRain, CloudSun, CloudSnow } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WeatherCardProps {
  alert: WeatherAlert;
}

const iconMap: { [key: string]: React.ElementType } = {
  Thermometer: Thermometer,
  CloudRain: CloudRain,
  CloudSun: CloudSun,
  CloudSnow: CloudSnow,
  Cloud: Cloud, // Default
};

export function WeatherCard({ alert }: WeatherCardProps) {
  const Icon = iconMap[alert.iconName] || Cloud;

  let severityConfig = {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-600",
    glow: "shadow-green-500/5"
  };

  switch (alert.severity) {
    case 'High':
      severityConfig = {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-600",
        glow: "shadow-red-500/5"
      };
      break;
    case 'Medium':
      severityConfig = {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-600",
        glow: "shadow-orange-500/5"
      };
      break;
    case 'Low':
      severityConfig = {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-600",
        glow: "shadow-blue-500/5"
      };
      break;
  }

  return (
    <div className={`p-6 rounded-[2rem] border ${severityConfig.border} ${severityConfig.bg} ${severityConfig.glow} shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] flex gap-4 items-start group`}>
      <div className={`h-12 w-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shrink-0 border border-white/20 group-hover:scale-110 transition-transform ${severityConfig.text}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-black uppercase tracking-widest">{alert.type}</h3>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${severityConfig.border} bg-white/10 uppercase`}>
            {alert.severity}
          </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed">
          {alert.message}
        </p>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          <AlertCircle className="h-3 w-3" />
          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
