# ⚠️ CRITICAL: RESTART YOUR DEV SERVER NOW

## The Problem
Your AI features aren't working because **environment variables are only loaded when the server starts**.

Even though we updated `.env.local`, your running server is still using the OLD configuration.

## The Solution (Do This Now!)

### Step 1: Stop the Server
In the terminal where `npm run dev` is running:

```
Press Ctrl+C
```

Wait until you see the server has stopped (no more output).

### Step 2: Start the Server Again
```bash
npm run dev
```

Wait for it to show:
```
✓ Ready in X.Xs
○ Local:        http://localhost:9002
```

### Step 3: Test Again
1. Go to: http://localhost:9002/ai-advisor
2. Upload an image
3. Click "Diagnose Disease"

## What Changed

We updated your `.env.local` with:
```env
GEMINI_MODEL=googleai/gemini-2.0-flash
GEMINI_FALLBACK_MODEL=googleai/gemini-2.5-flash
```

And improved error messages to show the actual problem.

## After Restarting

If it still doesn't work:
1. Open Browser Console (F12)
2. Look for "AI Diagnosis Error:" message
3. Copy the full error message
4. Share it so we can see the real problem

## Why This Matters

Node.js/Next.js loads environment variables ONCE when the process starts. Changes to `.env.local` don't take effect until you restart.

**This is the #1 reason why "it's not working" after configuration changes!**

---

## Quick Checklist

- [ ] Stopped the dev server (Ctrl+C)
- [ ] Started it again (npm run dev)
- [ ] Waited for "Ready" message
- [ ] Tried the AI feature again
- [ ] If still failing, checked browser console for error

---

**DO THIS NOW, THEN TEST AGAIN!**
