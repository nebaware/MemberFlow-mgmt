# Testing Payment System

## Issue: Chapa not showing in payment options

### Quick Test:

1. **Check if PaymentMethodSelector is rendering**:
   - Open browser console (F12)
   - Go to checkout page
   - Check for any JavaScript errors

2. **Verify payment methods array**:
   The component defines 3 methods:
   - Wallet Balance
   - Chapa
   - Telebirr

3. **Check if they're being filtered out**:
   - All have `available: true`
   - Should all render

### Debug Steps:

1. **Open checkout page**:
```
http://localhost:3000/checkout/[orderId]
```

2. **Check browser console** for errors

3. **Inspect the PaymentMethodSelector component**:
   - Should see 3 radio buttons
   - Wallet, Chapa, Telebirr

### If Chapa still not showing:

Check if the component is actually rendering the methods. Add this temporarily to see:

```typescript
// In PaymentMethodSelector component
console.log('Payment methods:', paymentMethods);
console.log('Selected method:', selectedMethod);
```

### Order Not Found Issue:

The checkout page needs an order ID. To test:

1. **Create a test order first**:
```sql
INSERT INTO orders (order_number, buyer_id, total_amount, status, payment_status, delivery_address)
VALUES ('ORD-TEST-001', 1, 1000, 'pending', 'pending', 'Test Address, Addis Ababa');
```

2. **Get the order ID**:
```sql
SELECT id FROM orders WHERE order_number = 'ORD-TEST-001';
```

3. **Go to checkout**:
```
http://localhost:3000/checkout/[that-id]
```

### Quick Fix - Create Test Order:

Run this in your PostgreSQL:

```sql
-- Create test order
INSERT INTO orders (
  order_number, 
  buyer_id, 
  total_amount, 
  platform_fee,
  net_amount,
  status, 
  payment_status, 
  delivery_address,
  delivery_type
)
VALUES (
  'ORD-TEST-' || FLOOR(RANDOM() * 10000), 
  1, 
  1000.00,
  50.00,
  950.00,
  'pending', 
  'pending', 
  'Test Address, Addis Ababa',
  'delivery'
)
RETURNING id, order_number;

-- Add order items
INSERT INTO order_items (
  order_id,
  product_id,
  seller_id,
  product_name,
  quantity,
  unit_price,
  total_price,
  seller_amount,
  platform_commission
)
SELECT 
  (SELECT id FROM orders WHERE order_number LIKE 'ORD-TEST-%' ORDER BY created_at DESC LIMIT 1),
  1,
  1,
  'Test Product',
  1,
  1000.00,
  1000.00,
  950.00,
  50.00;
```

Then use the returned order ID in the URL.

### Alternative - Use Existing Order:

```sql
-- Find existing orders
SELECT id, order_number, status, payment_status 
FROM orders 
WHERE status = 'pending'
LIMIT 5;
```

Use one of those IDs.

### If Payment Methods Still Not Showing:

The issue might be that the component is not rendering at all. Check:

1. **Is PaymentMethodSelector imported correctly?**
2. **Are there any TypeScript errors?**
3. **Is the component wrapped in proper providers?**

### Manual Test - Bypass Component:

Create a simple test in checkout page:

```typescript
// Temporarily add this to checkout page
<div className="border p-4">
  <h3>Debug Info:</h3>
  <p>Order ID: {order?.id}</p>
  <p>Total: {order?.totalAmount}</p>
  <p>User: {user?.name}</p>
</div>
```

This will help identify if the issue is with:
- Order fetching
- User context
- Component rendering
