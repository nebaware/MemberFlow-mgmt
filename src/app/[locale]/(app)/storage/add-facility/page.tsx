
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusSquare } from 'lucide-react';
import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';

export default function AddStorageFacilityPage() {
  return (
    <RoleGuard requiredRole="storage_provider">
      <PageTitle
        title="List New Storage Facility"
        description="Add your agricultural storage facility to our network."
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusSquare className="h-5 w-5 text-primary" />
            Facility Registration Form
          </CardTitle>
          <CardDescription>
            A form to enter details about your storage facility (location, type, capacity, features, pricing) will be available here.
            This feature is currently under development. For now, you can register as a Storage Provider via the "Join" page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>The detailed facility listing form is coming soon.</p>
            <p className="text-sm mb-4">In the meantime, ensure you have registered as a Storage Provider.</p>
            <Button asChild>
              <Link href="/join?tab=storage_provider">Register as Storage Provider</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </RoleGuard>
  );
}
