"use client";

import { useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Package, PlusCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { useProducts, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/use-products';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RoleGuard } from '@/components/auth/role-guard';


export default function MyProductsPage() {
  const { user, canEditProduct } = useApp();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use React Query hooks
  const { data: products = [], isLoading, refetch } = useProducts(user?.id);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleEdit = (product: Product) => {
    // Check permission
    if (!canEditProduct(product.farmerId || '')) {
      alert('You do not have permission to edit this product');
      return;
    }
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    updateProduct.mutate(
      {
        productId: editingProduct.id,
        data: {
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          category: editingProduct.category,
          location: editingProduct.location,
          stock: editingProduct.stockQuantity,
          unit: editingProduct.unit,
        },
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDelete = async (product: Product) => {
    // Check permission
    if (!canEditProduct(product.farmerId || '')) {
      alert('You do not have permission to delete this product');
      return;
    }

    if (!confirm(`Are you sure you want to remove "${product.name}" from the marketplace?`)) {
      return;
    }

    deleteProduct.mutate(product.id);
  };

  const handleStockSold = async (product: Product) => {
    if (!product.stockQuantity || !product.unit) {
      alert('Product stock information is missing');
      return;
    }

    const qty = prompt(`How many ${product.unit} were sold?`);
    if (!qty || isNaN(Number(qty))) return;

    const quantitySold = Number(qty);
    const newStock = product.stockQuantity - quantitySold;

    if (newStock < 0) {
      alert('Cannot sell more than available stock');
      return;
    }

    // If stock reaches 0, ask if they want to remove the product
    if (newStock === 0) {
      const shouldRemove = confirm(
        `This was the last ${product.unit} of "${product.name}". Would you like to remove it from the marketplace?`
      );

      if (shouldRemove) {
        deleteProduct.mutate(product.id);
        return;
      }
    }

    // Update stock
    updateProduct.mutate({
      productId: product.id,
      data: { stock: newStock },
    });
  };

  const categories = ['Grains', 'Coffee', 'Vegetables', 'Fruits', 'Agricultural Technologies', 'Other'];

  // Show login prompt if no user
  if (!user) {
    return (
      <>
        <PageTitle title="My Products" description="Manage your listed products" />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to manage your products.
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <RoleGuard requiredRole={['farmer', 'tool_seller']}>
      <PageTitle
        title="My Products"
        description="Manage your listed products and inventory"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/products/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
            </Link>
          </Button>
        </div>
      </PageTitle>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Your Product Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{Number(product.price).toFixed(2)} Birr/{product.unit || 'unit'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (product.stockQuantity || 0) > 10
                              ? 'default'
                              : (product.stockQuantity || 0) > 0
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {product.stockQuantity || 0} {product.unit || 'units'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === 'active'
                              ? 'default'
                              : product.status === 'deleted'
                                ? 'destructive'
                                : 'outline'
                          }
                        >
                          {product.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStockSold(product)}
                          title="Mark as Sold"
                          disabled={updateProduct.isPending}
                        >
                          📦 Sold
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          title="Edit Product"
                          disabled={updateProduct.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product)}
                          title="Remove Product"
                          className="text-destructive hover:text-destructive"
                          disabled={deleteProduct.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table >

            </div >
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">You haven't listed any products yet.</p>
              <Button asChild>
                <Link href="/products/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> List Your First Product
                </Link>
              </Button>
            </div>
          )
          }
        </CardContent >
      </Card >

      {/* Edit Product Dialog */}
      < Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information and inventory
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (Birr)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={editingProduct.unit}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, unit: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stockQuantity: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) =>
                      setEditingProduct({ ...editingProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location/Origin</Label>
                <Input
                  id="location"
                  value={editingProduct.location}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, location: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateProduct.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProduct}
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </RoleGuard>
  );
}
