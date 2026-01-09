# Translation Coverage Guide

## 🎯 Complete Translation Coverage

This guide ensures translations are applied to **every** part of your application.

## ✅ Current Status

### What's Already Translated
- ✅ Core navigation
- ✅ Dashboard pages
- ✅ Marketplace
- ✅ Payment system (basic)
- ✅ Orders
- ✅ Profile

### What Needs Translation
- ⚠️ Transportation pages (hardcoded)
- ⚠️ Tools pages (hardcoded)
- ⚠️ Storage pages (hardcoded)
- ⚠️ Learning pages (hardcoded)
- ⚠️ Forms and validation messages
- ⚠️ API responses
- ⚠️ Error messages
- ⚠️ Success notifications

## 📋 Translation Checklist

### 1. Page Titles & Descriptions

**Before:**
```tsx
<PageTitle 
  title="My Delivery Schedule" 
  description="View your upcoming deliveries"
/>
```

**After:**
```tsx
<PageTitle 
  title={t('transport.schedule.title')} 
  description={t('transport.schedule.description')}
/>
```

### 2. Button Labels

**Before:**
```tsx
<Button>Mark as Sold</Button>
```

**After:**
```tsx
<Button>{t('products.mark_sold')}</Button>
```

### 3. Form Labels

**Before:**
```tsx
<Label>Email Address</Label>
```

**After:**
```tsx
<Label>{t('auth.email')}</Label>
```

### 4. Validation Messages

**Before:**
```tsx
if (!email) {
  setError('Email is required');
}
```

**After:**
```tsx
if (!email) {
  setError(t('validation.required'));
}
```

### 5. Success/Error Messages

**Before:**
```tsx
toast({
  title: "Success",
  description: "Product created successfully",
});
```

**After:**
```tsx
toast({
  title: t('common.success'),
  description: t('response.success.created'),
});
```

### 6. API Responses

**Before:**
```ts
return NextResponse.json({ error: 'Order not found' }, { status: 404 });
```

**After:**
```ts
return NextResponse.json({ 
  error: t('response.error.not_found') 
}, { status: 404 });
```

### 7. Placeholder Text

**Before:**
```tsx
<Input placeholder="Search products..." />
```

**After:**
```tsx
<Input placeholder={t('market.search')} />
```

### 8. ARIA Labels

**Before:**
```tsx
<button aria-label="Close dialog">
  <X />
</button>
```

**After:**
```tsx
<button aria-label={t('common.close')}>
  <X />
</button>
```

## 🔧 Implementation Steps

### Step 1: Update Page Components

Find all pages with hardcoded text:

```bash
# Search for hardcoded titles
grep -r "title=\"" src/app --include="*.tsx"
```

Update each one:

```tsx
// src/app/(app)/transportation/schedule/page.tsx
import { useLanguage } from '@/lib/i18n';

export default function SchedulePage() {
  const { t } = useLanguage();
  
  return (
    <PageTitle 
      title={t('transport.schedule.title')} 
      description={t('transport.schedule.description')}
    />
  );
}
```

### Step 2: Update Forms

```tsx
// Before
<form>
  <Label>Product Name</Label>
  <Input placeholder="Enter product name" />
  <Button>Submit</Button>
</form>

// After
<form>
  <Label>{t('product.name')}</Label>
  <Input placeholder={t('product.name_placeholder')} />
  <Button>{t('common.submit')}</Button>
</form>
```

### Step 3: Update API Routes

```tsx
// src/app/api/products/route.ts
import { getTranslation } from '@/lib/i18n/server'; // Server-side translation

export async function POST(request: Request) {
  const t = getTranslation(request); // Get language from request
  
  try {
    // ... logic
    return NextResponse.json({
      message: t('response.success.created')
    });
  } catch (error) {
    return NextResponse.json({
      error: t('response.error.generic')
    }, { status: 500 });
  }
}
```

### Step 4: Update Validation

```tsx
// lib/validation.ts
import { useLanguage } from '@/lib/i18n';

export function useFormValidation() {
  const { t } = useLanguage();
  
  return {
    required: (value: string) => {
      if (!value) return t('validation.required');
      return null;
    },
    email: (value: string) => {
      if (!value.includes('@')) return t('validation.email');
      return null;
    },
  };
}
```

### Step 5: Update Notifications

```tsx
// hooks/use-notifications.ts
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  return {
    success: (key: string) => {
      toast({
        title: t('common.success'),
        description: t(key),
      });
    },
    error: (key: string) => {
      toast({
        title: t('common.error'),
        description: t(key),
        variant: 'destructive',
      });
    },
  };
}
```

## 🌐 Server-Side Translation

For API routes and server components, create a server-side translation helper:

```tsx
// lib/i18n/server.ts
import { headers } from 'next/headers';
import { translations } from './translations';
import type { Language } from './types';

export function getTranslation(request?: Request) {
  // Get language from Accept-Language header or cookie
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language');
  
  // Parse language (simplified)
  const lang = (acceptLanguage?.split(',')[0]?.split('-')[0] || 'en') as Language;
  
  return (key: string, fallback?: string) => {
    return translations[lang]?.[key] || translations.en?.[key] || fallback || key;
  };
}
```

## 🔄 Dynamic Content Translation

For user-generated content or database content:

```tsx
// Store content in multiple languages
interface Product {
  id: string;
  name_en: string;
  name_am: string;
  name_om: string;
  name_ti: string;
  name_so: string;
  description_en: string;
  description_am: string;
  // ...
}

// Display based on current language
function ProductCard({ product }: { product: Product }) {
  const { language } = useLanguage();
  
  const name = product[`name_${language}`] || product.name_en;
  const description = product[`description_${language}`] || product.description_en;
  
  return (
    <div>
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
}
```

## 🚨 Common Issues & Solutions

### Issue 1: Translations Not Updating

**Problem:** Changed language but UI doesn't update

**Solution:** Ensure component uses `useLanguage()` hook
```tsx
const { t, language } = useLanguage();

// Force re-render when language changes
useEffect(() => {
  // Component will re-render
}, [language]);
```

### Issue 2: Server Components

**Problem:** `useLanguage()` doesn't work in server components

**Solution:** Use server-side translation helper
```tsx
import { getTranslation } from '@/lib/i18n/server';

export default async function ServerComponent() {
  const t = getTranslation();
  
  return <h1>{t('common.welcome')}</h1>;
}
```

### Issue 3: API Responses

**Problem:** API returns English even when user selected another language

**Solution:** Pass language in request headers
```tsx
// Client
const { language } = useLanguage();

fetch('/api/products', {
  headers: {
    'Accept-Language': language,
  },
});

// Server
export async function GET(request: Request) {
  const lang = request.headers.get('Accept-Language') || 'en';
  const t = getTranslation(request);
  
  return NextResponse.json({
    message: t('response.success')
  });
}
```

### Issue 4: Form Validation

**Problem:** Validation messages in English only

**Solution:** Use translation in validation schema
```tsx
import { z } from 'zod';
import { useLanguage } from '@/lib/i18n';

function useValidationSchema() {
  const { t } = useLanguage();
  
  return z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(8, t('validation.minLength')),
  });
}
```

## 📊 Coverage Tracking

Create a script to track translation coverage:

```tsx
// scripts/check-translation-coverage.ts
import { translations } from '../src/lib/i18n/translations';

const languages = ['en', 'am', 'om', 'ti', 'so'];
const englishKeys = Object.keys(translations.en);

languages.forEach(lang => {
  const langKeys = Object.keys(translations[lang]);
  const missing = englishKeys.filter(key => !langKeys.includes(key));
  
  console.log(`${lang}: ${langKeys.length}/${englishKeys.length} keys`);
  if (missing.length > 0) {
    console.log(`Missing: ${missing.join(', ')}`);
  }
});
```

## ✅ Final Checklist

- [ ] All page titles translated
- [ ] All page descriptions translated
- [ ] All button labels translated
- [ ] All form labels translated
- [ ] All placeholder text translated
- [ ] All validation messages translated
- [ ] All success messages translated
- [ ] All error messages translated
- [ ] All API responses translated
- [ ] All ARIA labels translated
- [ ] All tooltips translated
- [ ] All confirmation dialogs translated
- [ ] All status messages translated
- [ ] All navigation items translated
- [ ] All breadcrumbs translated

## 🎯 Priority Order

1. **High Priority** (User-facing)
   - Page titles and descriptions
   - Navigation
   - Buttons and actions
   - Form labels

2. **Medium Priority** (Interactions)
   - Validation messages
   - Success/error notifications
   - Confirmation dialogs
   - Tooltips

3. **Low Priority** (Technical)
   - API error messages
   - Console logs
   - Debug messages

## 📚 Resources

- Translation files: `src/lib/i18n/translations/`
- Server helper: `src/lib/i18n/server.ts`
- Hook: `src/lib/i18n/context.tsx`
- Components: `src/components/language/`

---

**Next Steps:**
1. Run coverage check script
2. Update high-priority items first
3. Test each language
4. Get native speaker review
5. Deploy incrementally
