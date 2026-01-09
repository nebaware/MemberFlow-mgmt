
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench } from 'lucide-react';

export default function ManageInventoryPage() {
  return (
    <>
      <PageTitle 
        title="Manage Tool Inventory" 
        description="Update stock levels, pricing, and details for your listed tools and equipment." 
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            My Tool Listings
          </CardTitle>
          <CardDescription>
            A list of your tools and equipment with options to manage them will appear here. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>You have not listed any tools or equipment yet.</p>
            <p className="text-sm">Use the 'Add New Tool/Equipment' section to list your items.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
