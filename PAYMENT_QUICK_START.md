# 💳 Payment System - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Environment Variables
Copy `.env.example` to `.env.local` and add your keys:

```env
# Required
DATABASE_URL=postgresql://username:password@localhost:5432/azmera_db
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Chapa (Get from https://dashboard.chapa.co)
CHAPA_SECRET_KEY=CHASECK_TEST-your_test_key_here

# Optional - Telebirr (Contact Ethio Telecom)
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key
```

### Step 2: Update Database
Run this SQL to add payment columns:

```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2) DEFAULT 0;
```

### Step 3: Test It!
```bash
npm run dev
```

## 🎯 Quick Test

### Test Wallet Payment:
1. Login as demo user (Abebe - Farmer)
2. Ensure wallet has balance (5000 Birr by default)
3. Create an order
4. Select "Wallet Balance" payment
5. ✅ Payment completes instantly!

### Test Chapa Payment:
1. Get test key from https://dashboard.chapa.co
2. Add to `.env.local`
3. Create an order
4. Select "Chapa" payment
5. Use test card: `4200 0000 0000 0000`
6. ✅ Payment redirects and verifies!

## 📦 Using Payment Components

### In Checkout Page:
```typescript
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';

<PaymentMethodSelector
  orderId="123"
  amount={1000}
  deliveryFee={50}
  onSuccess={() => router.push('/orders/123')}
/>
```

### Check Wallet Balance:
```typescript
import { useWalletBalance } from '@/hooks/use-payments';

const { data: wallet } = useWalletBalance();
// wallet.balance = 5000
```

### Initiate Payment:
```typescript
import { useInitiatePayment } from '@/hooks/use-payments';

const initiatePayment = useInitiatePayment();

initiatePayment.mutate({
  orderId: '123',
  paymentMethod: 'chapa', // or 'telebirr' or 'wallet'
  amount: 1000,
  deliveryFee: 50,
});
```

## 💰 Payment Methods

| Method | Speed | Fees | Best For |
|--------|-------|------|----------|
| **Wallet** | Instant | 0% | Frequent users |
| **Chapa** | 2-5 min | 2.5% | All customers |
| **Telebirr** | 2-5 min | 1.5% | Mobile users |

## 🔄 Payment Flow

```
User Checkout
    ↓
Select Payment Method
    ↓
┌─────────────┬──────────────┐
│   Wallet    │   External   │
│  (Instant)  │ (Chapa/Tele) │
└─────────────┴──────────────┘
    ↓                ↓
Deduct Balance   Redirect to Gateway
    ↓                ↓
Order Confirmed  Complete Payment
    ↓                ↓
    └────────────────┘
            ↓
    Payment in Escrow
            ↓
    Seller Ships Order
            ↓
    Buyer Confirms
            ↓
    Release to Seller
```

## 💸 Commission Breakdown

**Example: 1000 Birr Order**

```
Subtotal:        1000 Birr
Platform Fee:      50 Birr (5%)
Delivery:         100 Birr
─────────────────────────
Total Charged:   1100 Birr

Distribution:
→ Platform:        50 Birr
→ Seller:         950 Birr
→ Transporter:    100 Birr
```

## 🔐 Security Features

✅ **User Authentication** - All payments require login  
✅ **Order Verification** - Only order owner can pay  
✅ **Escrow System** - Payment held until delivery  
✅ **Double Verification** - Initiate + Verify  
✅ **Transaction Logging** - Full audit trail  

## 📱 API Endpoints

### Initiate Payment
```bash
POST /api/payments/initiate
Headers: x-user-id, x-user-role
Body: {
  "orderId": "123",
  "paymentMethod": "chapa",
  "amount": 1000
}
```

### Verify Payment
```bash
POST /api/payments/verify
Body: {
  "transactionRef": "ORD-123",
  "paymentMethod": "chapa"
}
```

### Payment Callback (Webhook)
```bash
POST /api/payments/callback
# Called automatically by payment provider
```

## 🧪 Testing

### Chapa Test Cards:
- **Success**: `4200 0000 0000 0000`
- **Decline**: `4100 0000 0000 0000`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test Scenarios:

**1. Successful Wallet Payment:**
```typescript
// User has 5000 Birr balance
// Order total: 1000 Birr
// Result: ✅ Instant payment, balance = 4000
```

**2. Insufficient Balance:**
```typescript
// User has 500 Birr balance
// Order total: 1000 Birr
// Result: ❌ Error shown, suggest top-up
```

**3. External Payment:**
```typescript
// User selects Chapa
// Redirects to Chapa checkout
// Completes payment
// Callback received
// Order confirmed ✅
```

## 🐛 Common Issues

### "Insufficient wallet balance"
**Fix**: Top up wallet or use Chapa/Telebirr

### "Payment verification failed"
**Fix**: Check transaction ref is correct

### "Callback not received"
**Fix**: Ensure callback URL is publicly accessible

### "Redirect not working"
**Fix**: Set `NEXT_PUBLIC_BASE_URL` correctly

## 📊 Payment Status Flow

```
pending → in_escrow → released
   ↓          ↓          ↓
 Failed   Disputed   Refunded
```

## 🎨 UI Components

### Payment Method Selector
- Shows all available methods
- Displays wallet balance
- Warns if insufficient funds
- Secure payment badge

### Payment Success Page
- Auto-verifies payment
- Shows order details
- Next steps guide
- Action buttons

### Payment Failed Page
- Error explanation
- Retry button
- Support contact

## 📈 Revenue Tracking

### Platform Earnings:
```sql
-- Total platform revenue
SELECT SUM(platform_fee) as total_revenue 
FROM orders 
WHERE payment_status = 'released';

-- Revenue by payment method
SELECT 
  payment_method,
  COUNT(*) as transactions,
  SUM(platform_fee) as revenue
FROM orders
WHERE payment_status = 'released'
GROUP BY payment_method;
```

## 🔄 Next Steps

### Immediate:
1. ✅ Get Chapa test credentials
2. ✅ Test all payment methods
3. ✅ Verify callbacks work
4. ✅ Test escrow release

### Production:
1. 🔄 Get Chapa production keys
2. 🔄 Set up Telebirr (optional)
3. 🔄 Configure webhooks
4. 🔄 Enable email notifications
5. 🔄 Add payment analytics

## 📚 Resources

**Chapa:**
- Dashboard: https://dashboard.chapa.co
- Docs: https://developer.chapa.co/docs
- Support: support@chapa.co

**Telebirr:**
- Contact: Ethio Telecom Business Team
- Phone: +251 11 515 5000

## ✨ What You Got

✅ **3 Payment Methods** - Wallet, Chapa, Telebirr  
✅ **Escrow System** - Buyer protection  
✅ **5% Commission** - Platform revenue  
✅ **Real-time Verification** - Secure payments  
✅ **Transaction Logging** - Full audit trail  
✅ **React Query Integration** - Optimistic updates  
✅ **Mobile-friendly UI** - Great UX  

## 🎉 You're Ready!

Your Azmera platform can now process real payments from Ethiopian customers!

**Test it now:**
1. Login as demo user
2. Add product to cart
3. Checkout
4. Select payment method
5. Complete payment
6. See order confirmed! 🚀

---

**Need help?** Check `PAYMENT_SYSTEM_COMPLETE.md` for detailed documentation.
