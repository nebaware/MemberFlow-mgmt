"use client";

import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DeliveryRequestsPage() {
  const [requests, setRequests] = useState<any[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/transportation');
        if (!res.ok) {
          setRequests([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) setRequests(data as any[]);
      } catch (err) {
        console.error('Failed to fetch transportation requests', err);
        setRequests([]);
      }
    })();
  }, []);

  return (
    <>
      <PageTitle 
        title="Incoming Delivery Requests" 
        description="Manage new and ongoing transportation requests from users." 
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Active Requests
          </CardTitle>
          <CardDescription>
            New delivery requests will appear here for you to review and accept.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests === null ? (
            <div className="text-center py-10 text-muted-foreground">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>No active delivery requests at the moment.</p>
              <p className="text-sm">Requests created via the transportation form will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Request: {req.id} — {req.cropType}</p>
                      <p className="text-sm text-muted-foreground">From: {req.pickupLocation} → To: {req.dropoffLocation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Qty: {req.quantity}</p>
                      <p className="text-xs text-muted-foreground">Status: {req.status}</p>
                    </div>
                  </div>
                  {req.additionalNotes && <p className="mt-2 text-sm text-muted-foreground">Notes: {req.additionalNotes}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
