
"use client";

import { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, PackageCheck, MapPin, Truck, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Delivery {
  id: string;
  orderId: string;
  productName: string;
  pickupLocation: string;
  dropoffLocation: string;
  scheduledDate: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'completed';
  transporterId?: string;
  buyerId?: string;
  sellerId?: string;
  deliveryFee?: number;
}

export default function MySchedulePage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadDeliveries = async (silent = false) => {
    if (!silent) setIsLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      // Get user ID (in production, from auth context)
      const userId = '1';
      
      // Try to fetch from API
      try {
        const response = await fetch(`/api/transportation?userId=${userId}&role=transporter`);
        if (response.ok) {
          const apiData = await response.json();
          // Filter for accepted and in-transit deliveries
          const myDeliveries = apiData.filter((d: Delivery) => 
            d.transporterId === userId && 
            ['accepted', 'in_transit', 'delivered'].includes(d.status)
          );
          setDeliveries(myDeliveries);
          
          // Save to localStorage for persistence
          localStorage.setItem('azmera_my_deliveries', JSON.stringify(myDeliveries));
          return;
        }
      } catch (apiError) {
        console.log('API not available, using localStorage');
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('azmera_my_deliveries');
      if (stored) {
        setDeliveries(JSON.parse(stored));
      } else {
        setDeliveries([]);
      }
    } catch (error) {
      console.error('Error loading deliveries:', error);
      setDeliveries([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDeliveries();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDeliveries(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsDelivered = async (deliveryId: string) => {
    try {
      // Update via API
      const response = await fetch(`/api/transportation/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      if (response.ok) {
        // Update local state
        setDeliveries(prevDeliveries =>
          prevDeliveries.map(delivery =>
            delivery.id === deliveryId 
              ? { ...delivery, status: 'delivered' as const } 
              : delivery
          )
        );

        toast({
          title: "Delivery Marked as Complete!",
          description: `Delivery ${deliveryId} marked. The buyer will be notified to confirm receipt.`,
        });

        // Reload to get fresh data
        loadDeliveries(true);
      } else {
        throw new Error('Failed to update delivery status');
      }
    } catch (error) {
      // Fallback to localStorage update
      const updated = deliveries.map(delivery =>
        delivery.id === deliveryId 
          ? { ...delivery, status: 'delivered' as const } 
          : delivery
      );
      setDeliveries(updated);
      localStorage.setItem('azmera_my_deliveries', JSON.stringify(updated));

      toast({
        title: "Delivery Marked as Complete!",
        description: `Delivery ${deliveryId} marked. The buyer will be notified to confirm receipt.`,
      });
    }
  };

  const handleStartDelivery = async (deliveryId: string) => {
    try {
      const response = await fetch(`/api/transportation/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_transit' }),
      });

      if (response.ok) {
        setDeliveries(prevDeliveries =>
          prevDeliveries.map(delivery =>
            delivery.id === deliveryId 
              ? { ...delivery, status: 'in_transit' as const } 
              : delivery
          )
        );

        toast({
          title: "Delivery Started!",
          description: `Delivery ${deliveryId} is now in transit.`,
        });

        loadDeliveries(true);
      }
    } catch (error) {
      const updated = deliveries.map(delivery =>
        delivery.id === deliveryId 
          ? { ...delivery, status: 'in_transit' as const } 
          : delivery
      );
      setDeliveries(updated);
      localStorage.setItem('azmera_my_deliveries', JSON.stringify(updated));

      toast({
        title: "Delivery Started!",
        description: `Delivery ${deliveryId} is now in transit.`,
      });
    }
  };
  
  const getStatusBadgeVariant = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'completed':
        return 'outline';
      case 'in_transit':
        return 'secondary';
      case 'accepted':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: Delivery['status']) => {
    switch (status) {
      case 'accepted':
        return 'Scheduled';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered - Awaiting Confirmation';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle 
          title="My Delivery Schedule" 
          description="View your upcoming and confirmed deliveries. Mark deliveries as complete upon arrival." 
        />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <PageTitle 
          title="My Delivery Schedule" 
          description="View your upcoming and confirmed deliveries. Mark deliveries as complete upon arrival." 
        />
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => loadDeliveries(true)}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Upcoming Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Your schedule is currently empty.</p>
              <p className="text-sm mt-2">Accepted delivery requests will populate your schedule.</p>
              <Button asChild className="mt-4">
                <a href="/transportation">View Available Requests</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {deliveries.map(delivery => (
            <Card key={delivery.id} className="shadow-md">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      Delivery ID: {delivery.id}
                    </CardTitle>
                    <CardDescription>Order: {delivery.orderId}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(delivery.status)}>
                    {getStatusLabel(delivery.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Product:</p>
                  <p className="text-sm text-muted-foreground">{delivery.productName}</p>
                </div>
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Pickup:</p>
                    <p className="text-muted-foreground">{delivery.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Dropoff:</p>
                    <p className="text-muted-foreground">{delivery.dropoffLocation}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                  <span>Scheduled: {format(new Date(delivery.scheduledDate), "PPP p")}</span>
                </div>
                {delivery.deliveryFee && (
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <span>Delivery Fee: {delivery.deliveryFee} Birr</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {delivery.status === 'accepted' && (
                  <Button 
                    onClick={() => handleStartDelivery(delivery.id)} 
                    className="flex-1"
                  >
                    <Truck className="mr-2 h-4 w-4" /> Start Delivery
                  </Button>
                )}
                {delivery.status === 'in_transit' && (
                  <Button 
                    onClick={() => handleMarkAsDelivered(delivery.id)} 
                    className="flex-1"
                  >
                    <PackageCheck className="mr-2 h-4 w-4" /> Mark as Delivered
                  </Button>
                )}
                {delivery.status === 'delivered' && (
                  <p className="text-sm text-muted-foreground italic">
                    Awaiting buyer's confirmation to release your payment.
                  </p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
