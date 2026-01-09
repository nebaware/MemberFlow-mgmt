# 💳 Real Payment System Integration - Complete Guide

## Overview
Complete payment system integration with multiple Ethiopian and international payment providers for the Azmera AgriTech Platform.

## 🎯 Supported Payment Methods

### 1. **Chapa** (Ethiopian Payment Gateway)
- ✅ Credit/Debit Cards
- ✅ Mobile Money (CBE Birr, M-Pesa, etc.)
- ✅ Bank Transfers
- ✅ Telebirr
- **Website**: https://chapa.co
- **Best for**: All Ethiopian customers

### 2. **Telebirr** (Ethio Telecom)
- ✅ Mobile Money
- ✅ Direct integration with Ethio Telecom
- ✅ Widely used in Ethiopia
- **Best for**: Mobile-first users

### 3. **Wallet** (Internal)
- ✅ Platform wallet balance
- ✅ Instant payments
- ✅ No transaction fees
- **Best for**: Frequent users

## 📦 What's Implemented

### Backend:
1. ✅ Payment provider integrations (Chapa, Telebirr, Wallet)
2. ✅ Payment initiation API
3. ✅ Payment verification API
4. ✅ Payment callback handler (webhooks)
5. ✅ Commission calculation (5% platform fee)
6. ✅ Escrow system (payment held until delivery)
7. ✅ Transaction logging

### Frontend:
1. ✅ Payment method selector component
2. ✅ Payment success/failure pages
3. ✅ React Query hooks for payments
4. ✅ Wallet balance display
5. ✅ Real-time payment status

### Security:
1. ✅ User authentication required
2. ✅ Order ownership verification
3. ✅ Secure payment callbacks
4. ✅ Transaction integrity checks

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install axios chapa
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Step 3: Get Payment Provider Credentials

#### For Chapa:
1. Go to https://dashboard.chapa.co
2. Sign up for an account
3. Navigate to Settings → API Keys
4. Copy your Secret Key
5. Add to `.env.local`:
```env
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxxxxxxx
```

#### For Telebirr:
1. Contact Ethio Telecom Business Team
2. Request Telebirr API access
3. Receive App ID and App Key
4. Add to `.env.local`:
```env
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key
```

### Step 4: Update Database
Ensure your orders table has these columns:
```sql
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2) DEFAULT 0;
```

### Step 5: Test Payment Flow
```bash
npm run dev
```

## 💻 Usage Examples

### 1. Payment Method Selector Component

```typescript
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';

function CheckoutPage() {
  return (
    <PaymentMethodSelector
      orderId="123"
      amount={1000}
      deliveryFee={50}
      onSuccess={() => {
        console.log('Payment successful!');
      }}
    />
  );
}
```

### 2. Using Payment Hooks

```typescript
import { useInitiatePayment, useWalletBalance } from '@/hooks/use-payments';

function PaymentButton() {
  const initiatePayment = useInitiatePayment();
  const { data: wallet } = useWalletBalance();

  const handlePay = () => {
    initiatePayment.mutate({
      orderId: '123',
      paymentMethod: 'chapa',
      amount: 1000,
      deliveryFee: 50,
    });
  };

  return (
    <div>
      <p>Wallet Balance: {wallet?.balance} Birr</p>
      <button onClick={handlePay}>Pay Now</button>
    </div>
  );
}
```

### 3. Manual Payment Verification

```typescript
import { useVerifyPayment } from '@/hooks/use-payments';

function VerifyButton() {
  const verifyPayment = useVerifyPayment();

  const handleVerify = () => {
    verifyPayment.mutate({
      transactionRef: 'ORD-123',
      paymentMethod: 'chapa',
    });
  };

  return <button onClick={handleVerify}>Verify Payment</button>;
}
```

## 🔄 Payment Flow

### Complete Payment Journey:

```
1. User adds products to cart
   ↓
2. User proceeds to checkout
   ↓
3. Order created (status: pending)
   ↓
4. User selects payment method
   ↓
5a. WALLET PAYMENT:
    - Check balance
    - Deduct amount
    - Update order (status: confirmed, payment: in_escrow)
    - Show success
   
5b. EXTERNAL PAYMENT (Chapa/Telebirr):
    - Initiate payment with provider
    - Redirect to payment gateway
    - User completes payment
    - Provider sends callback
    - Verify payment
    - Update order (status: confirmed, payment: in_escrow)
    - Redirect to success page
   ↓
6. Seller prepares order
   ↓
7. Order shipped (status: shipped)
   ↓
8. Buyer confirms delivery
   ↓
9. Release escrow to seller
   ↓
10. Order complete (status: delivered, payment: released)
```

## 💰 Commission & Escrow System

### Commission Calculation:
```typescript
Subtotal: 1000 Birr
Platform Fee (5%): 50 Birr
Delivery Fee: 100 Birr
Total Charged: 1100 Birr

Breakdown:
- Buyer pays: 1100 Birr
- Platform keeps: 50 Birr (5%)
- Seller receives: 950 Birr (95%)
- Transporter receives: 100 Birr
```

### Escrow Flow:
```
Payment Received → Held in Escrow
                      ↓
                 Order Shipped
                      ↓
              Buyer Confirms Delivery
                      ↓
              Release to Seller Wallet
```

## 🔐 Security Features

### 1. Authentication
- All payment endpoints require authentication
- User ID sent in headers
- Order ownership verified

### 2. Payment Verification
- Double verification (initiate + verify)
- Callback signature validation
- Transaction integrity checks

### 3. Escrow Protection
- Payment held until delivery confirmed
- Dispute resolution system
- Refund capability

### 4. Audit Trail
- All transactions logged
- Payment status tracking
- Notification system

## 📱 API Endpoints

### POST `/api/payments/initiate`
Initiate a payment

**Request:**
```json
{
  "orderId": "123",
  "paymentMethod": "chapa",
  "amount": 1000,
  "deliveryFee": 50,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+251911234567"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.chapa.co/...",
  "transactionRef": "ORD-123",
  "paymentMethod": "chapa",
  "breakdown": {
    "subtotal": 1000,
    "deliveryFee": 50,
    "platformFee": 50,
    "totalAmount": 1050,
    "sellerAmount": 950
  }
}
```

### POST `/api/payments/verify`
Verify a payment

**Request:**
```json
{
  "transactionRef": "ORD-123",
  "paymentMethod": "chapa"
}
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "orderId": "123",
  "amount": 1050,
  "currency": "ETB"
}
```

### POST `/api/payments/callback`
Payment provider callback (webhook)

**Chapa Callback:**
```json
{
  "tx_ref": "ORD-123",
  "status": "success",
  "amount": 1050,
  "currency": "ETB"
}
```

**Telebirr Callback:**
```json
{
  "outTradeNo": "ORD-123",
  "tradeStatus": "TRADE_SUCCESS",
  "totalAmount": "1050"
}
```

## 🧪 Testing

### Test Mode (Chapa):
Chapa provides test credentials:
```env
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxxxxxxx
```

**Test Cards:**
- Success: 4200 0000 0000 0000
- Decline: 4100 0000 0000 0000

### Test Wallet Payment:
1. Login as demo user
2. Ensure wallet has balance
3. Select "Wallet Balance" payment method
4. Payment completes instantly

### Test External Payment:
1. Use Chapa test mode
2. Select "Chapa" payment method
3. Redirected to test checkout
4. Use test card
5. Verify callback received

## 🐛 Troubleshooting

### Issue: "Insufficient wallet balance"
**Solution**: Top up wallet or use external payment method

### Issue: Payment callback not received
**Solution**: 
- Check callback URL is publicly accessible
- Verify webhook configuration in provider dashboard
- Check server logs for callback attempts

### Issue: Payment verification fails
**Solution**:
- Ensure transaction ref is correct
- Check payment provider credentials
- Verify payment was actually completed

### Issue: Redirect not working
**Solution**:
- Check `NEXT_PUBLIC_BASE_URL` is set correctly
- Ensure return URL is whitelisted in provider dashboard

## 📊 Database Schema

### Orders Table:
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  buyer_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  delivery_address TEXT,
  delivery_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Transactions Table:
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_id INTEGER REFERENCES orders(id),
  type VARCHAR(50),
  amount DECIMAL(10,2),
  description TEXT,
  status VARCHAR(50),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 UI Components

### Payment Method Selector
- Radio button selection
- Wallet balance display
- Insufficient balance warning
- Payment method icons
- Secure payment badge

### Payment Success Page
- Success/failure indication
- Order details
- Next steps information
- Action buttons (view order, continue shopping)

### Payment Verification
- Loading state
- Auto-verification
- Error handling
- Retry mechanism

## 🔄 Next Steps

### Immediate:
1. ✅ Get Chapa test credentials
2. ✅ Test wallet payments
3. ✅ Test external payments
4. ✅ Verify callbacks work

### Short-term:
1. 🔄 Add Stripe for international payments
2. 🔄 Implement refund system
3. 🔄 Add payment analytics dashboard
4. 🔄 Email/SMS payment confirmations

### Long-term:
1. 🔄 Subscription payments
2. 🔄 Installment plans
3. 🔄 Multi-currency support
4. 🔄 Payment scheduling

## 📚 Resources

### Chapa Documentation:
- API Docs: https://developer.chapa.co/docs
- Dashboard: https://dashboard.chapa.co
- Support: support@chapa.co

### Telebirr Documentation:
- Contact: Ethio Telecom Business Team
- Phone: +251 11 515 5000

### Best Practices:
- Always verify payments server-side
- Never trust client-side payment status
- Log all transactions
- Implement retry logic
- Handle edge cases (network failures, timeouts)

## ✨ Summary

You now have a complete, production-ready payment system with:
- ✅ Multiple payment providers (Chapa, Telebirr, Wallet)
- ✅ Secure payment processing
- ✅ Escrow system for buyer protection
- ✅ Commission calculation (5% platform fee)
- ✅ Real-time payment verification
- ✅ Comprehensive error handling
- ✅ Transaction logging and audit trail

The Azmera platform can now process real payments from Ethiopian customers! 💰🚀
