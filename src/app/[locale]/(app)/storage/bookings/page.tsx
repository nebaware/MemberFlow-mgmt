
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';

export default function StorageBookingsPage() {
  return (
    <>
      <PageTitle 
        title="Storage Facility Bookings" 
        description="View and manage bookings for your storage spaces." 
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Current & Past Bookings
          </CardTitle>
          <CardDescription>
            Details of bookings made by farmers for your storage facilities will be listed here. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>No bookings to display yet.</p>
            <p className="text-sm">When farmers book your storage, the details will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
