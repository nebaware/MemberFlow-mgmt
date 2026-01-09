# AI Features Setup & Troubleshooting

## 🚨 Current Issue
AI features (Crop Advisor, Pricing Assistant, Cooperative Planner) are showing "Failed to analyze" errors.

## ✅ Quick Fix

### Step 1: Test Your API Key
```bash
node test-gemini-api.js
```

This will verify if your Gemini API key is valid and working.

### Step 2: Get a Valid API Key (if needed)

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Update `.env.local`:

```env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 3: Use Compatible Model

Your `.env.local` should have:

```env
GEMINI_API_KEY=AIzaSy...your_key_here
GEMINI_MODEL=googleai/gemini-1.5-flash
GEMINI_FALLBACK_MODEL=googleai/gemini-1.5-pro
```

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🔍 Troubleshooting

### Error: "Failed to analyze image"

**Cause**: API key is invalid or model not accessible

**Solution**:
1. Run `node test-gemini-api.js` to verify key
2. Get new key from https://aistudio.google.com/app/apikey
3. Update `.env.local`
4. Restart server

### Error: "Model not found"

**Cause**: The model specified doesn't exist or isn't available for your key

**Solution**: Update `.env.local`:
```env
GEMINI_MODEL=googleai/gemini-1.5-flash
```

Available models:
- `googleai/gemini-1.5-flash` (Recommended - Fast & Free)
- `googleai/gemini-1.5-pro` (More capable)
- `googleai/gemini-pro` (Older, widely available)

### Error: "API key not set"

**Cause**: `.env.local` file missing or not loaded

**Solution**:
1. Ensure `.env.local` exists in project root
2. Add: `GEMINI_API_KEY=your_key_here`
3. Restart dev server

---

## 📋 Verification Checklist

- [ ] `.env.local` file exists in project root
- [ ] `GEMINI_API_KEY` is set in `.env.local`
- [ ] API key is valid (test with `node test-gemini-api.js`)
- [ ] Model is set to `googleai/gemini-1.5-flash`
- [ ] Dev server has been restarted after changes
- [ ] No console errors about "API key not set"

---

## 🎯 Testing AI Features

### 1. AI Crop Advisor
- Navigate to: `/ai-advisor`
- Upload a crop image
- Select response language
- Click "Diagnose Disease"
- Should see diagnosis and solution

### 2. Pricing Assistant
- Navigate to: `/pricing-assistant`
- Fill in product details
- Select response language
- Click "Get AI Suggestion"
- Should see pricing recommendation

### 3. Cooperative Planner
- Navigate to: `/cooperative-planner`
- Fill in farm information
- Select response language
- Click "Generate Cooperative Plan"
- Should see planting recommendations

---

## 🔧 Advanced Configuration

### Using Different Models

Edit `.env.local`:

```env
# For faster responses (recommended)
GEMINI_MODEL=googleai/gemini-1.5-flash

# For more detailed analysis
GEMINI_MODEL=googleai/gemini-1.5-pro

# Fallback if primary model fails
GEMINI_FALLBACK_MODEL=googleai/gemini-1.5-flash
```

### Rate Limits

Free tier limits:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

If you hit limits, wait a minute and try again.

---

## 📞 Still Not Working?

### Check Server Logs

Look for errors in your terminal where `npm run dev` is running:

```
✅ Good: No errors about API key
❌ Bad: "GEMINI_API_KEY not set"
❌ Bad: "Model not found"
❌ Bad: "API_KEY_INVALID"
```

### Check Browser Console

Open browser DevTools (F12) and look for errors:

```
✅ Good: No red errors
❌ Bad: "Failed to fetch"
❌ Bad: "500 Internal Server Error"
```

### Verify API Key Format

Your API key should:
- Start with `AIzaSy`
- Be about 39 characters long
- Have no spaces or quotes

Example: `AIzaSyB7Hjkj7M3Nq5OWRdieRiQyJtAQwCOcWBc`

---

## 🎉 Success Indicators

When everything is working:

1. **Test script passes**:
   ```
   ✅ API Key is VALID and working!
   ```

2. **No console warnings** about API key

3. **AI features return results** instead of errors

4. **Server logs show** successful API calls

---

## 📚 Additional Resources

- Gemini API Docs: https://ai.google.dev/docs
- Get API Key: https://aistudio.google.com/app/apikey
- Genkit Docs: https://firebase.google.com/docs/genkit
- Model List: https://ai.google.dev/models/gemini

---

**Last Updated**: December 2024
