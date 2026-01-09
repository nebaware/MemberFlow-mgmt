
"use client";

import type { Notification } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bell, TrendingUp, CloudRain, ShoppingBag, Award, CloudSnow, ShieldCheck, MailCheck, DollarSign, PackageCheck } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';

interface NotificationItemProps {
  notification: Notification;
}

const iconMap: { [key: string]: React.ElementType } = {
  TrendingUp: TrendingUp,
  CloudRain: CloudRain,
  ShoppingBag: ShoppingBag,
  Award: Award,
  CloudSnow: CloudSnow,
  ShieldCheck: ShieldCheck,
  MailCheck: MailCheck,
  DollarSign: DollarSign,
  PackageCheck: PackageCheck,
  Bell: Bell, // Fallback
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const IconComponent = iconMap[notification.iconName] || Bell;
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const date = notification.timestamp instanceof Date
        ? notification.timestamp
        : new Date(notification.timestamp);

      if (isNaN(date.getTime())) {
        setTimeAgo('Recently');
      } else {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
      }
    } catch (error) {
      console.error('Error formatting notification date:', error);
      setTimeAgo('Recently');
    }
  }, [notification.timestamp]);

  const itemContent = (
    <div className={cn(
      "flex items-start gap-6 p-8 transition-all duration-300 relative group overflow-hidden",
      !notification.read ? "bg-indigo-600/5 hover:bg-indigo-600/10" : "hover:bg-muted/30"
    )}>
      <div className={cn(
        "flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center border border-white/20 dark:border-white/5 shadow-inner transition-transform group-hover:scale-110",
        !notification.read ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground"
      )}>
        <IconComponent className="h-7 w-7" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-lg font-black font-outfit uppercase tracking-tight truncate",
            !notification.read ? "text-indigo-600" : "text-foreground opacity-70"
          )}>
            {notification.title}
          </p>
          {timeAgo && (
            <time className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
              {timeAgo}
            </time>
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed max-w-2xl">{notification.message}</p>

        {notification.href && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
              Action required <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
      {!notification.read && (
        <div className="absolute top-8 right-8 h-3 w-3 rounded-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-pulse"></div>
      )}
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} className="block">
        {itemContent}
      </Link>
    );
  }

  return itemContent;
}
