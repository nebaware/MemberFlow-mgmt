# API Quota Exceeded - Solutions

## Problem Identified ✅
Your Gemini API has exceeded its free tier quota:
```
429 Too Many Requests - Quota exceeded for gemini-2.0-flash
```

## Immediate Solution

### Option 1: Switch to Different Model (DONE)
I've updated your `.env.local` to use `gemini-1.5-flash` which has separate quota limits.

**Restart your server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

Then try again. The 1.5 models have different quota limits.

---

## If Still Hitting Limits

### Option 2: Wait for Quota Reset
Free tier quotas reset:
- **Per minute**: Wait 1 minute
- **Per day**: Wait until tomorrow (resets at midnight Pacific Time)

Current limits for free tier:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

### Option 3: Get a New API Key
If you've been testing a lot, create a fresh API key:

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the new key
4. Update `.env.local`:
   ```env
   GEMINI_API_KEY=YOUR_NEW_KEY_HERE
   ```
5. Restart server

### Option 4: Use Mock Data (Temporary)
While waiting for quota to reset, you can use mock responses.

Update `src/components/ai-advisor/diagnosis-form.tsx`:

```typescript
// Add this at the top of the onSubmit function
const USE_MOCK = true; // Set to false when quota is available

if (USE_MOCK) {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockResult = {
    diagnosis: "Early Blight (Alternaria solani)",
    solution: "Apply copper-based fungicides every 7-10 days. Remove infected leaves. Ensure proper plant spacing for air circulation. Avoid overhead watering. Rotate crops annually."
  };
  setDiagnosisResult(mockResult);
  return;
}
```

### Option 5: Upgrade to Paid Plan
For production use, consider upgrading:
- Go to: https://console.cloud.google.com/
- Enable billing for your project
- Much higher limits (up to 1,000 requests per minute)

---

## Check Your Current Usage

Visit: https://ai.dev/usage?tab=rate-limit

This shows:
- How many requests you've made
- When your quota resets
- Which models have quota available

---

## Best Practices to Avoid Quota Issues

### 1. Use Efficient Models
```env
# Fastest, lowest quota usage
GEMINI_MODEL=googleai/gemini-1.5-flash

# More capable but uses more quota
GEMINI_MODEL=googleai/gemini-1.5-pro
```

### 2. Implement Rate Limiting
Add delays between requests in your code.

### 3. Cache Results
Store AI responses to avoid repeated calls for same input.

### 4. Use Fallback Models
```env
GEMINI_MODEL=googleai/gemini-1.5-flash
GEMINI_FALLBACK_MODEL=googleai/gemini-1.5-pro
```

### 5. Monitor Usage
Regularly check: https://ai.dev/usage

---

## Available Models & Quota

Different models have separate quotas:

| Model | Speed | Quota Pool | Best For |
|-------|-------|------------|----------|
| gemini-1.5-flash | Fast | Separate | Most requests |
| gemini-1.5-pro | Slower | Separate | Complex tasks |
| gemini-2.0-flash | Fastest | Separate | Simple tasks |
| gemini-2.5-flash | Fast | Separate | Latest features |

**Tip**: If one model hits quota, switch to another!

---

## Current Configuration

Your `.env.local` now has:
```env
GEMINI_MODEL=googleai/gemini-1.5-flash
GEMINI_FALLBACK_MODEL=googleai/gemini-1.5-pro
```

This should work if you haven't exhausted the 1.5 model quota.

---

## Testing After Changes

1. **Restart server** (Ctrl+C, then `npm run dev`)
2. Wait 1 minute (to clear per-minute quota)
3. Try uploading ONE image
4. If it works: ✅ You're good!
5. If still quota error: Wait until tomorrow or get new API key

---

## Error Messages Explained

### "Quota exceeded for metric: generate_content_free_tier_requests"
- You've hit the daily request limit (1,500/day)
- **Solution**: Wait until tomorrow or upgrade

### "Quota exceeded for metric: generate_content_free_tier_input_token_count"
- You've hit the daily token limit (1M tokens/day)
- **Solution**: Wait until tomorrow or upgrade

### "Please retry in 20.809565384s"
- You've hit the per-minute limit (15/minute)
- **Solution**: Wait 21 seconds and try again

---

## Quick Actions

### Right Now:
1. ✅ Switched to gemini-1.5-flash (done)
2. Restart your server
3. Wait 1 minute
4. Try ONE request

### If Still Failing:
- Check usage: https://ai.dev/usage
- Get new API key: https://aistudio.google.com/app/apikey
- Or wait until tomorrow

### For Production:
- Enable billing: https://console.cloud.google.com/
- Implement caching
- Add rate limiting
- Monitor usage regularly

---

**Next Step**: Restart your server and try again with the new model!
