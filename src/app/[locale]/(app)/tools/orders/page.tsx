
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export default function ToolOrdersPage() {
  return (
    <>
      <PageTitle 
        title="Tool & Equipment Orders" 
        description="Track sales and manage orders for your agricultural tools." 
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Order History
          </CardTitle>
          <CardDescription>
            Details of orders for your tools and equipment will be displayed here. This feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>No tool orders to display yet.</p>
            <p className="text-sm">When customers purchase your tools, orders will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
