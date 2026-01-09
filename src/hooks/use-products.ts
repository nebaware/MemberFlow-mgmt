import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  location: string;
  stockQuantity: number;
  unit: string;
  status?: string;
  farmerId?: string;
  farmerName?: string;
  imageUrl?: string;
  createdAt?: string;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  stock?: number;
  unit?: string;
  quality?: string;
  status?: string;
}

// Helper to create auth headers
function getAuthHeaders(user: any): Record<string, string> {
  if (!user) return {};

  const headers: Record<string, string> = {};
  if (user.id) headers['x-user-id'] = String(user.id);
  if (user.role) headers['x-user-role'] = String(user.role);
  if (user.email) headers['x-user-email'] = String(user.email);

  return headers as unknown as Record<string, string>;
}

// Fetch all products
export function useProducts(sellerId?: string) {
  const { user } = useApp();

  return useQuery({
    queryKey: ['products', sellerId],
    queryFn: async () => {
      const url = sellerId
        ? `/api/products?sellerId=${sellerId}`
        : '/api/products';

      const res = await fetch(url, {
        headers: getAuthHeaders(user),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }

      return res.json() as Promise<Product[]>;
    },
    staleTime: 30 * 1000, // Data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
}

// Fetch single product
export function useProduct(productId: string) {
  const { user } = useApp();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productId}`, {
        headers: getAuthHeaders(user),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch product');
      }

      return res.json() as Promise<Product>;
    },
    enabled: !!productId,
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: UpdateProductData }) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user),
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update product');
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(user),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });

      toast({
        title: 'Success',
        description: 'Product removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Update stock (convenience function)
export function useUpdateStock() {
  const updateProduct = useUpdateProduct();

  return {
    ...updateProduct,
    updateStock: (productId: string, newStock: number) => {
      return updateProduct.mutate({ productId, data: { stock: newStock } });
    },
  };
}
