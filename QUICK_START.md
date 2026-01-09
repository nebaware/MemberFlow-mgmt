# 🚀 Quick Start Guide

## What You Got

✅ **TanStack Query** - Modern data fetching with auto-caching  
✅ **Role-Based Security** - Users can only edit their own products  
✅ **Platform Revenue** - 5% commission system built-in  
✅ **React Query DevTools** - Visual debugging tool  

## 3-Minute Setup

### 1. Add User Switcher to Navigation

Open your navigation component and add:

```typescript
import { DemoUserSwitcher } from '@/components/demo/user-switcher';

// In your navigation JSX:
<DemoUserSwitcher />
```

### 2. Test It Out

1. **Start dev server**: `npm run dev`
2. **Open app**: http://localhost:3000
3. **Switch users**: Click the user dropdown
4. **Go to**: `/my-products`

### 3. Try These Scenarios

**As Farmer (Abebe):**
- ✅ Can edit products with seller_id = 1
- ❌ Cannot edit products from other sellers

**As Buyer (Tigist):**
- ❌ Cannot access product management
- ✅ Can only browse marketplace

**As Admin:**
- ✅ Can edit ALL products
- ✅ Can change product status
- ✅ Full control

## Using React Query

### Fetch Products
```typescript
import { useProducts } from '@/hooks/use-products';

const { data: products, isLoading } = useProducts();
// Auto-cached, auto-refetched every 60s
```

### Update Product
```typescript
import { useUpdateProduct } from '@/hooks/use-products';

const updateProduct = useUpdateProduct();

updateProduct.mutate({
  productId: '1',
  data: { stock: 50 }
});
// Instant UI update, syncs with server
```

### Delete Product
```typescript
import { useDeleteProduct } from '@/hooks/use-products';

const deleteProduct = useDeleteProduct();

deleteProduct.mutate('1');
// Auto-refetches product list
```

## Check Permissions

```typescript
import { useApp } from '@/contexts/AppContext';

const { user, canEditProduct, isAdmin } = useApp();

if (canEditProduct(productSellerId)) {
  // Show edit button
}

if (isAdmin()) {
  // Show admin controls
}
```

## Platform Commission

```typescript
import { calculateCommission, getCommissionRate } from '@/lib/auth-helpers';

// Get rate for category
const rate = getCommissionRate('Coffee'); // 0.04 (4%)

// Calculate commission
const { platformFee, sellerAmount } = calculateCommission(1000, rate);
// platformFee: 40 Birr (4%)
// sellerAmount: 960 Birr (96%)
```

## Commission Rates

| Category | Rate | Example (1000 Birr) |
|----------|------|---------------------|
| Standard | 5% | Platform: 50, Seller: 950 |
| Coffee | 4% | Platform: 40, Seller: 960 |
| Equipment | 7% | Platform: 70, Seller: 930 |
| Premium Seller | 3% | Platform: 30, Seller: 970 |

## React Query DevTools

1. Open browser DevTools (F12)
2. Look for "React Query" tab
3. See all queries in real-time!

**What you'll see:**
- Active queries
- Cached data
- Refetch timers
- Mutation history

## Security Flow

```
User Action (Edit Product)
    ↓
Frontend checks: canEditProduct()
    ↓
If allowed → Send request with auth headers
    ↓
Backend checks: getAuthUser() + canEditProduct()
    ↓
If authorized → Update database
    ↓
React Query invalidates cache
    ↓
Fresh data fetched automatically
    ↓
UI updates
```

## Common Tasks

### Mark Product as Sold
```typescript
// In My Products page
1. Click "📦 Sold" button
2. Enter quantity sold
3. Stock updates automatically
4. If stock = 0, prompted to remove
```

### Edit Product Details
```typescript
1. Click Edit icon
2. Update fields in dialog
3. Click "Save Changes"
4. UI updates instantly (optimistic)
5. Syncs with server in background
```

### Remove Product
```typescript
1. Click trash icon
2. Confirm deletion
3. Product soft-deleted (status = 'deleted')
4. Removed from marketplace
5. Product list auto-refreshes
```

## API Endpoints

### GET /api/products
Fetch all products (or by seller)
```bash
curl http://localhost:3000/api/products?sellerId=1
```

### GET /api/products/:id
Fetch single product
```bash
curl http://localhost:3000/api/products/1
```

### PUT /api/products/:id
Update product (requires auth)
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -H "x-user-role: farmer" \
  -d '{"stock": 50}'
```

### DELETE /api/products/:id
Delete product (requires auth)
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "x-user-id: 1" \
  -H "x-user-role: farmer"
```

## Troubleshooting

### "Unauthorized" Error
**Problem**: Trying to edit someone else's product  
**Solution**: Login as product owner or admin

### DevTools Not Showing
**Problem**: React Query tab missing  
**Solution**: Refresh page, check console for errors

### Cache Not Updating
**Problem**: Old data showing  
**Solution**: Check if mutation invalidates queries

### Stock Not Decreasing
**Problem**: Update not working  
**Solution**: Verify auth headers are sent

## Next Steps

1. ✅ Test all user roles
2. ✅ Verify permissions work
3. ✅ Check DevTools
4. ✅ Test optimistic updates
5. 🔄 Integrate revenue tracking in orders
6. 🔄 Create admin dashboard
7. 🔄 Add JWT authentication

## Files to Know

**Security:**
- `src/lib/auth-helpers.ts` - Security functions
- `src/contexts/AppContext.tsx` - User state

**React Query:**
- `src/hooks/use-products.ts` - Product hooks
- `src/components/providers/react-query-provider.tsx` - Provider

**Pages:**
- `src/app/(app)/my-products/page.tsx` - Seller management
- `src/app/(app)/admin/products/page.tsx` - Admin management

**API:**
- `src/app/api/products/[id]/route.ts` - Secured endpoints

## Demo Users

| Name | Role | ID | Can Edit Products |
|------|------|----|--------------------|
| Abebe Kebede | Farmer | 1 | seller_id = 1 |
| Tigist Alemu | Buyer | 2 | None |
| Yohannes Haile | Tool Seller | 5 | seller_id = 5 |
| Admin User | Admin | 999 | All products |

## That's It! 🎉

You're ready to use the new system. Switch users, edit products, and watch the magic happen in React Query DevTools!

**Questions?** Check `TANSTACK_QUERY_AND_SECURITY.md` for detailed docs.
