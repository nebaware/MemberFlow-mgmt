# 🐛 Debug Payment Error

## Error: "payment failed [object Object]"

This means the error object isn't being properly converted to a readable message.

## Debug Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for the actual error message
4. It should show more details than "[object Object]"

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try payment again
4. Look for `/api/payments/initiate` request
5. Click on it
6. Check Response tab for actual error

### Step 3: Check Terminal/Server Logs
Look at your terminal where `npm run dev` is running. You should see:
```
Payment initiation error: [actual error message]
```

## Common Errors & Solutions

### Error: "Unauthorized"
**Cause**: No user logged in  
**Fix**: Login using DemoUserSwitcher

### Error: "Order not found"
**Cause**: Order doesn't exist in database  
**Fix**: Create order first using `create-test-order.sql`

### Error: "Insufficient wallet balance"
**Cause**: Wallet has less than order total  
**Fix**: 
- Use demo user with balance (Abebe has 5000 Birr)
- Or use Chapa/Telebirr instead

### Error: "Invalid API key" (Chapa)
**Cause**: Chapa key not configured  
**Fix**: Add `CHAPA_SECRET_KEY` to `.env.local`

### Error: "DATABASE not configured"
**Cause**: Database connection issue  
**Fix**: Check `DATABASE_URL` in `.env.local`

## Quick Test - Wallet Payment

### Prerequisites:
1. ✅ Database running
2. ✅ Order exists in database
3. ✅ User logged in (demo user)
4. ✅ User has wallet balance

### Test Steps:
```bash
# 1. Create test order
psql -U postgres -d azmera_db -f create-test-order.sql

# 2. Note the order ID from output

# 3. Go to checkout
http://localhost:3000/checkout/[order-id]

# 4. Select "Wallet Balance"

# 5. Click "Pay with Wallet"
```

### Expected Result:
```
✅ Payment Successful
✅ Order status: confirmed
✅ Payment status: in_escrow
✅ Wallet balance decreased
✅ Redirected to orders page
```

## Manual API Test

Test the payment API directly:

```bash
# Test wallet payment
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Content-Type: application/json" \
  -H "x-user-id: 2" \
  -H "x-user-role: buyer" \
  -d '{
    "orderId": "1",
    "paymentMethod": "wallet",
    "amount": 1000,
    "deliveryFee": 100
  }'
```

Expected response:
```json
{
  "success": true,
  "paymentMethod": "wallet",
  "transactionRef": "WALLET-1",
  "breakdown": {
    "subtotal": 1000,
    "deliveryFee": 100,
    "platformFee": 50,
    "totalAmount": 1100,
    "sellerAmount": 950
  }
}
```

## Check Database

### Verify user has balance:
```sql
SELECT id, name, wallet_balance 
FROM users 
WHERE id = 2;
```

Should show:
```
id | name          | wallet_balance
2  | Tigist Alemu  | 3000.00
```

### Verify order exists:
```sql
SELECT id, order_number, buyer_id, total_amount, status, payment_status
FROM orders
WHERE id = 1;
```

Should show order details.

## Common Issues

### Issue: User ID mismatch
**Problem**: Order buyer_id doesn't match logged-in user  
**Fix**: Ensure you're logged in as the buyer (user ID 2)

### Issue: Order already paid
**Problem**: Order status is not 'pending'  
**Fix**: Create a new order or reset order status:
```sql
UPDATE orders 
SET status = 'pending', payment_status = 'pending' 
WHERE id = 1;
```

### Issue: Wallet balance insufficient
**Problem**: User doesn't have enough balance  
**Fix**: 
```sql
UPDATE users 
SET wallet_balance = 5000 
WHERE id = 2;
```

## Enable Better Error Messages

Add this to see full error details:

### In Browser Console:
```javascript
// Check what the actual error is
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled error:', event.reason);
});
```

### In API Route:
Already added better error logging. Check your terminal for:
```
Payment initiation error: [detailed error]
```

## Recommended Fix

Since you're getting `[object Object]`, let's test with a simple approach:

1. **Open browser console** (F12)
2. **Try payment again**
3. **Look for error in console** - it will show the real error
4. **Share that error** and I can fix it specifically

Or try this quick test:

```bash
# Check if database is accessible
psql -U postgres -d azmera_db -c "SELECT COUNT(*) FROM orders;"

# Check if user has balance
psql -U postgres -d azmera_db -c "SELECT id, name, wallet_balance FROM users WHERE id = 2;"
```

Let me know what you see in the browser console and I'll fix the specific issue! 🔍
