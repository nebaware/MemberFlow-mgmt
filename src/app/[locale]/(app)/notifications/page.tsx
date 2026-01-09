
"use client";

import { useEffect, useMemo, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationItem } from '@/components/notifications/notification-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bell, TrendingUp, CloudRain, ShoppingBag, Award, CloudSnow, ShieldCheck, MailCheck, DollarSign, PackageCheck, Truck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import type React from 'react';
import type { Notification } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const notificationIconMap: { [key: string]: React.ElementType } = {
  TrendingUp: TrendingUp,
  CloudRain: CloudRain,
  ShoppingBag: ShoppingBag,
  Award: Award,
  CloudSnow: CloudSnow,
  ShieldCheck: ShieldCheck,
  MailCheck: MailCheck,
  DollarSign: DollarSign,
  PackageCheck: PackageCheck,
  Truck: Truck,
  AlertTriangle: AlertTriangle,
  Bell: Bell, // Fallback
};

// Helper to map API types to icon names
const getIconNameForType = (type: string): string => {
  switch (type) {
    case 'PriceAlert': return 'TrendingUp';
    case 'WeatherUpdate': return 'CloudRain';
    case 'NewOrder': return 'ShoppingBag';
    case 'LearningReward': return 'Award';
    case 'EscrowPaymentMade': return 'ShieldCheck';
    case 'DeliveryConfirmationRequired': return 'MailCheck';
    case 'PaymentReleasedToSeller': return 'DollarSign';
    case 'PaymentReleasedToTransporter': return 'DollarSign';
    case 'DeliveryMarkedByTransporter': return 'PackageCheck';
    case 'dispute_created': return 'AlertTriangle';
    case 'dispute_resolved': return 'ShieldCheck';
    case 'order_paid': return 'DollarSign';
    case 'order_shipped': return 'Truck';
    case 'order_delivered': return 'PackageCheck';
    default: return 'Bell';
  }
};

// Helper to generate href based on notification data
const getHrefForNotification = (n: any): string => {
  if (n.orderId) return `/orders/${n.orderId}`;
  if (n.type === 'WeatherUpdate') return '/iot-weather';
  if (n.type === 'LearningReward') return '/learning';
  if (n.type === 'PriceAlert') return '/market';
  return '#';
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const transformedNotifications = data.notifications.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: new Date(n.createdAt),
          read: n.read,
          iconName: getIconNameForType(n.type),
          href: getHrefForNotification(n),
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ notificationIds: 'all' }),
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        toast({ title: "Updated", description: "All notifications marked as read." });
      }
    } catch (error) { }
    finally { setIsMarkingAll(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600/10 to-purple-600/5 p-8 md:p-12 border border-indigo-500/10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black font-outfit tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase">
              {t('notifications.title')}
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg font-medium">
              Stay updated with your latest activities, order status, and market alerts.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 dark:bg-black/20 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20">
              <span className="text-sm font-black uppercase tracking-widest text-indigo-600">{unreadCount} UNREAD</span>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll || loading}
                className="rounded-2xl glass border-indigo-500/20 h-12 px-6 font-black uppercase tracking-widest text-[10px]"
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <Card className="bg-white/40 dark:bg-black/20 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black font-outfit flex items-center gap-3">
            <Bell className="h-7 w-7 text-indigo-600" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-420px)]">
            {loading ? (
              <div className="p-20 text-center space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-600 animate-spin mx-auto"></div>
                <p className="text-lg font-bold text-muted-foreground">Syncing your activity...</p>
              </div>
            ) : sortedNotifications.length > 0 ? (
              <div className="divide-y divide-white/10">
                {sortedNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 space-y-8 opacity-40">
                <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black font-outfit">{t('notif.no_notifications')}</p>
                  <p className="text-lg font-medium text-muted-foreground">You're all caught up!</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
