# AI Features Troubleshooting - Step by Step

## Current Status
❌ AI Crop Advisor showing: "Failed to analyze image. Please try again."

## Critical Steps to Fix

### Step 1: Verify Environment File ✅
Check that `.env.local` has:
```env
GEMINI_API_KEY=AIzaSyB7Hjkj7M3Nq5OWRdieRiQyJtAQwCOcWBc
GEMINI_MODEL=googleai/gemini-2.0-flash
GEMINI_FALLBACK_MODEL=googleai/gemini-2.5-flash
```

**Status**: ✅ Confirmed - File is correct

### Step 2: RESTART Dev Server (CRITICAL!)
Environment variables are only loaded when the server starts.

**You MUST do this:**
```bash
# 1. Stop the current server
Press Ctrl+C in the terminal where npm run dev is running

# 2. Wait for it to fully stop

# 3. Start it again
npm run dev
```

**Status**: ⚠️ **HAVE YOU DONE THIS?**

### Step 3: Check Server Console
After restarting, look at your terminal where `npm run dev` is running.

**Look for:**
- ✅ Good: No warnings about "GEMINI_API_KEY not set"
- ✅ Good: Server starts without errors
- ❌ Bad: Any warnings about API key or Genkit
- ❌ Bad: Module not found errors

### Step 4: Test with Better Error Messages
I've updated the code to show the actual error message.

**After restarting the server:**
1. Go to: http://localhost:9002/ai-advisor
2. Upload an image
3. Open Browser Console (F12)
4. Look for the error message that starts with "AI Diagnosis Error:"

**This will tell us the REAL problem!**

### Step 5: Check Browser Console
Open DevTools (F12) and look for:
- Red errors
- The actual error message from the AI function
- Network errors (500, 404, etc.)

---

## Common Issues & Solutions

### Issue 1: "Server not restarted"
**Symptom**: Still getting generic error after changes
**Solution**: 
```bash
# Kill the server completely
Ctrl+C (maybe twice)

# Verify it's stopped (no "ready" message)

# Start fresh
npm run dev
```

### Issue 2: "Module not found"
**Symptom**: Server won't start, shows module errors
**Solution**:
```bash
npm install
npm run dev
```

### Issue 3: "API key not found"
**Symptom**: Console shows "GEMINI_API_KEY not set"
**Solution**:
- Verify `.env.local` exists in project root (not in src/)
- Check file has no typos in variable names
- Restart server after fixing

### Issue 4: "Model not found"
**Symptom**: Error mentions model not available
**Solution**:
Update `.env.local`:
```env
GEMINI_MODEL=googleai/gemini-2.0-flash
```

### Issue 5: "Network error"
**Symptom**: Can't reach Google API
**Solution**:
- Check internet connection
- Try: `node test-gemini-api.js`
- Verify firewall isn't blocking

---

## Debugging Checklist

Run through this checklist:

- [ ] `.env.local` file exists in project root
- [ ] `GEMINI_API_KEY` is set in `.env.local`
- [ ] `GEMINI_MODEL=googleai/gemini-2.0-flash` is set
- [ ] Dev server has been **FULLY RESTARTED** after changes
- [ ] No errors in server console on startup
- [ ] Browser console is open (F12) to see errors
- [ ] Uploaded a valid image file (JPG or PNG)
- [ ] Checked the actual error message in console

---

## What to Check Next

### 1. Server Terminal Output
When you restart the server, you should see:
```
✓ Ready in 3.2s
○ Local:        http://localhost:9002
```

**Should NOT see:**
```
⚠ Genkit: GEMINI_API_KEY not set
```

### 2. Browser Console (F12)
After uploading an image, you should see:
```
AI Diagnosis Error: [actual error message]
```

**Copy this error message** - it will tell us exactly what's wrong!

### 3. Network Tab (F12 → Network)
Check if there are any failed requests:
- Look for red/failed requests
- Check status codes (500, 404, etc.)
- Look at the response body

---

## Quick Test Commands

### Test 1: Verify API Key
```bash
node test-gemini-api.js
```
Should show: ✅ Available models for your API key

### Test 2: Check Environment
```bash
# Windows PowerShell
$env:GEMINI_API_KEY
# Should show your API key

# Or check the file directly
type .env.local
```

### Test 3: Verify Server is Using New Config
After restarting, the server should load the new environment variables.

---

## Next Steps

1. **RESTART THE SERVER** (if you haven't already)
2. Try uploading an image again
3. **Check browser console** for the actual error
4. **Report back** with the error message from console

The error message will tell us exactly what's wrong!

---

## Still Not Working?

If after following ALL steps above it still doesn't work:

1. Copy the **exact error message** from browser console
2. Copy any **server errors** from terminal
3. Verify you **restarted the server**
4. Share those error messages

---

**Remember**: Environment variables are ONLY loaded when the server starts. You MUST restart after changing `.env.local`!
