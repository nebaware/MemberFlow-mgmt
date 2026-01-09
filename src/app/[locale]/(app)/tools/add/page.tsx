
import { PageTitle } from '@/components/shared/page-title';
import { AddProductForm } from '@/components/products/add-product-form'; // Re-using for now, could be specialized
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PackagePlus } from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';

export default function AddToolPage() {
  return (
    <RoleGuard requiredRole="tool_seller">
      <PageTitle
        title="Add New Tool or Equipment"
        description="List your agricultural tools, machinery, or equipment on the marketplace."
      />
      {/* 
        Ideally, this would be a specialized form for tools. 
        For now, reusing AddProductForm and instructing users to select 'Agricultural Technologies' category.
      */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PackagePlus className="text-primary h-6 w-6" /> Listing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please use the form below to list your tool or equipment. Ensure you select the <strong>'Agricultural Technologies'</strong> category.
            Provide detailed descriptions, specifications, and clear images for best results.
          </p>
        </CardContent>
      </Card>
      <AddProductForm />
    </RoleGuard>
  );
}
