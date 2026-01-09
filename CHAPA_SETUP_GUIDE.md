# 🔑 Chapa API Key Setup Guide

## Error: "Invalid API key or business cannot accept payment"

This means your Chapa API key is not configured or invalid.

## Quick Fix

### Option 1: Use Test Mode (Recommended for Development)

1. **Get Chapa Test API Key**:
   - Go to https://dashboard.chapa.co
   - Sign up for a free account
   - Navigate to Settings → API Keys
   - Copy your **Test Secret Key** (starts with `CHASECK_TEST-`)

2. **Add to `.env.local`**:
```env
CHAPA_SECRET_KEY=CHASECK_TEST-your_test_key_here
```

3. **Restart dev server**:
```bash
# Press Ctrl+C to stop
npm run dev
```

### Option 2: Use Wallet Payment (No API Key Needed)

If you don't want to set up Chapa right now, use **Wallet Balance** payment:

1. Go to checkout
2. Select "Wallet Balance" instead of "Chapa"
3. Payment will be instant (no external API needed)

## Getting Chapa API Keys

### Test Keys (Free):
1. Visit https://dashboard.chapa.co
2. Sign up (free)
3. Go to Settings → API Keys
4. Copy **Test Secret Key**

### Production Keys:
1. Complete KYC verification on Chapa dashboard
2. Get approved
3. Copy **Live Secret Key**
4. Use in production

## Environment Variables

Your `.env.local` should have:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/azmera_db

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Chapa Payment (Get from https://dashboard.chapa.co)
CHAPA_SECRET_KEY=CHASECK_TEST-your_test_key_here

# Optional - Telebirr
TELEBIRR_APP_ID=your_app_id
TELEBIRR_APP_KEY=your_app_key
```

## Testing Without Chapa

### Use Wallet Payment:
```
1. Login as demo user (has 5000 Birr balance)
2. Go to checkout
3. Select "Wallet Balance"
4. Click "Pay with Wallet"
5. ✅ Instant payment!
```

### Test Cards (When Chapa is configured):
Once you have a test key, use these test cards:

**Success:**
- Card: `4200 0000 0000 0000`
- CVV: Any 3 digits
- Expiry: Any future date

**Decline:**
- Card: `4100 0000 0000 0000`

## Troubleshooting

### Issue: "Invalid API key"
**Fix**: 
1. Check `.env.local` has `CHAPA_SECRET_KEY`
2. Ensure key starts with `CHASECK_TEST-` or `CHASECK-`
3. No spaces or quotes around the key
4. Restart dev server after adding

### Issue: "Business cannot accept payment"
**Fix**:
1. Verify your Chapa account is active
2. Check if test mode is enabled
3. Ensure no restrictions on your account

### Issue: Still not working
**Workaround**: Use Wallet payment instead:
- Select "Wallet Balance" on checkout
- No API key needed
- Works immediately

## Quick Test

### 1. Check if API key is loaded:
```bash
# In your terminal
echo $CHAPA_SECRET_KEY
```

Should show your key (or empty if not set)

### 2. Test wallet payment:
```
1. Go to /checkout/[order-id]
2. Select "Wallet Balance"
3. Should work without Chapa
```

### 3. Test Chapa payment:
```
1. Add CHAPA_SECRET_KEY to .env.local
2. Restart server
3. Go to checkout
4. Select "Chapa"
5. Should redirect to Chapa checkout
```

## Payment Methods Comparison

| Method | API Key Needed | Setup Time | Best For |
|--------|---------------|------------|----------|
| **Wallet** | ❌ No | Instant | Testing, frequent users |
| **Chapa** | ✅ Yes | 5 minutes | All customers, cards |
| **Telebirr** | ✅ Yes | Contact Ethio Telecom | Mobile users |

## Recommended Approach

### For Development:
1. ✅ Use **Wallet** payment (no setup)
2. ✅ Get Chapa **test** key (5 min setup)
3. ⏭️ Skip Telebirr (requires business account)

### For Production:
1. ✅ Get Chapa **production** key
2. ✅ Complete KYC verification
3. ✅ Set up Telebirr (optional)

## Next Steps

### Right Now:
**Option A - Use Wallet (Fastest)**:
- No setup needed
- Works immediately
- Perfect for testing

**Option B - Set up Chapa (5 minutes)**:
1. Go to https://dashboard.chapa.co
2. Sign up
3. Get test key
4. Add to `.env.local`
5. Restart server

### Later:
- Get production Chapa key
- Set up Telebirr
- Configure webhooks

## Summary

**Current Error**: No Chapa API key configured

**Quick Fix**: 
1. Use Wallet payment (no setup), OR
2. Get Chapa test key from https://dashboard.chapa.co

**5-Minute Setup**:
```bash
# 1. Get key from Chapa dashboard
# 2. Add to .env.local
echo "CHAPA_SECRET_KEY=CHASECK_TEST-your_key" >> .env.local

# 3. Restart
npm run dev
```

That's it! 🎉
