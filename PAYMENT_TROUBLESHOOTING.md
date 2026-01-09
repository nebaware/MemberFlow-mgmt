# 🔧 Payment System Troubleshooting

## Issue 1: Chapa Not Showing in Payment Options

### Possible Causes:
1. Component not rendering
2. JavaScript error blocking render
3. Payment methods being filtered
4. Missing imports

### Solution Steps:

#### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red errors
4. Common errors:
   - "Cannot read property..."
   - "Module not found..."
   - "Unexpected token..."

#### Step 2: Verify Component is Rendering
Add debug output to `PaymentMethodSelector`:

```typescript
// In src/components/payment/payment-method-selector.tsx
// Add after paymentMethods definition:
console.log('Payment methods available:', paymentMethods.length);
console.log('Methods:', paymentMethods.map(m => m.name));
```

You should see in console:
```
Payment methods available: 3
Methods: ['Wallet Balance', 'Chapa', 'Telebirr']
```

#### Step 3: Check if All Methods Render
The component should show 3 radio buttons. If you only see 1 (Wallet), check:

1. **Are Chapa/Telebirr being filtered?**
   - All have `available: true`
   - Should all render

2. **Is there a CSS issue hiding them?**
   - Inspect element in DevTools
   - Check if elements exist but are hidden

#### Step 4: Verify Imports
Check `src/components/payment/payment-method-selector.tsx`:

```typescript
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
```

All icons should be imported.

## Issue 2: "Order Not Found" Error

### Cause:
The checkout page can't fetch the order from the database.

### Solution:

#### Option A: Create Test Order (Recommended)

Run this SQL script:
```bash
psql -U postgres -d azmera_db -f create-test-order.sql
```

This will:
1. Create a test order
2. Add order items
3. Display the checkout URL

#### Option B: Use Existing Order

Find an existing order:
```sql
SELECT id, order_number, status, payment_status 
FROM orders 
WHERE status = 'pending' AND buyer_id = 2
LIMIT 5;
```

Then go to:
```
http://localhost:3000/checkout/[order-id]
```

#### Option C: Create Order Manually

```sql
INSERT INTO orders (
  order_number, 
  buyer_id, 
  total_amount, 
  platform_fee,
  net_amount,
  status, 
  payment_status,
  delivery_address
)
VALUES (
  'ORD-2025-999', 
  2,  -- Your user ID
  1000.00,
  50.00,
  950.00,
  'pending', 
  'pending',
  'Your Address Here'
)
RETURNING id;
```

Use the returned ID in the URL.

## Issue 3: API Endpoint Not Working

### Check API Endpoint:

Test the order endpoint directly:
```bash
curl http://localhost:3000/api/orders/1
```

Expected response:
```json
{
  "id": 1,
  "orderNumber": "ORD-2025-001",
  "totalAmount": 1000,
  "items": [...]
}
```

If you get 404 or 500:
1. Check database connection
2. Verify order exists
3. Check API logs in terminal

## Issue 4: User Not Logged In

### Check User Context:

Add debug to checkout page:
```typescript
console.log('Current user:', user);
```

If `null`:
1. Use DemoUserSwitcher to login
2. Or set user manually in AppContext

## Complete Test Flow

### Step 1: Ensure Database is Running
```bash
# Check PostgreSQL status
pg_isready

# If not running, start it
# Windows: Start PostgreSQL service
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Step 2: Create Test Order
```bash
psql -U postgres -d azmera_db -f create-test-order.sql
```

### Step 3: Login as Test User
1. Open app: http://localhost:3000
2. Click DemoUserSwitcher (if available)
3. Select "Tigist Alemu (Buyer)"

### Step 4: Go to Checkout
Use the URL from Step 2:
```
http://localhost:3000/checkout/[order-id]
```

### Step 5: Verify Payment Methods Show
You should see:
- ✅ Wallet Balance (with balance shown)
- ✅ Chapa (with description)
- ✅ Telebirr (with description)

## Quick Fixes

### Fix 1: Reset Database Pool
If you see "pool is null" errors:
```bash
# Restart dev server
# Press Ctrl+C
npm run dev
```

### Fix 2: Clear Browser Cache
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Fix 3: Check Environment Variables
```bash
# Verify .env.local exists
cat .env.local

# Should have:
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CHAPA_SECRET_KEY=CHASECK_TEST-...
```

### Fix 4: Verify Tables Exist
```sql
-- Check if orders table exists
SELECT COUNT(*) FROM orders;

-- Check if order_items table exists
SELECT COUNT(*) FROM order_items;

-- If error, run setup script
\i setup-postgresql.sql
```

## Debug Checklist

- [ ] PostgreSQL is running
- [ ] Database tables exist
- [ ] Test order created
- [ ] User is logged in
- [ ] Environment variables set
- [ ] Dev server running
- [ ] No console errors
- [ ] API endpoint responds
- [ ] Payment methods render

## Still Not Working?

### Check These Files:

1. **PaymentMethodSelector**:
   - `src/components/payment/payment-method-selector.tsx`
   - Should have 3 methods defined

2. **Checkout Page**:
   - `src/app/(app)/checkout/[orderId]/page.tsx`
   - Should import PaymentMethodSelector

3. **Orders API**:
   - `src/app/api/orders/[id]/route.ts`
   - Should return order data

4. **Database**:
   - Orders table has data
   - Order items table has data

### Get Help:

1. Check browser console for errors
2. Check terminal for API errors
3. Check PostgreSQL logs
4. Review `TEST_PAYMENT.md` for more tests

## Success Indicators

When everything works:
- ✅ Checkout page loads
- ✅ Order details display
- ✅ 3 payment methods show
- ✅ Can select each method
- ✅ Pay button is enabled
- ✅ Clicking pay initiates payment

## Next Steps After Fix

1. Test wallet payment
2. Test Chapa payment (with test key)
3. Verify payment callback
4. Check order status updates
5. Test payment success page

---

**Need more help?** Check:
- `PAYMENT_SYSTEM_COMPLETE.md` - Full payment docs
- `CHECKOUT_INTEGRATION.md` - Checkout guide
- `PAYMENT_QUICK_START.md` - Quick setup
