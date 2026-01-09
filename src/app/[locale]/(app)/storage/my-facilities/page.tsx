
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function ManageMyFacilitiesPage() {
  return (
    <>
      <PageTitle 
        title="Manage My Storage Facilities" 
        description="Update details, availability, and pricing for your listed storage units." 
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            My Listed Facilities
          </CardTitle>
          <CardDescription>
            A list of your registered storage facilities with management options will appear here. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>You have not listed any storage facilities yet.</p>
            <p className="text-sm">Use the 'Add New Facility' section to list your storage spaces.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
