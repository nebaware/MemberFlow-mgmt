import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import '../globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import ClipboardPolyfill from '@/components/ui/clipboard-polyfill';
import { OfflineIndicator } from '@/components/shared/offline-indicator';

// Note: removed usage of next/font/google because Turbopack in some
// environments emits internal imports that VS Code's Problems panel flags
// (e.g. @vercel/turbopack-next/internal/font/google/font). We now load
// fonts via CSS in `globals.css` to avoid that runtime resolution error.

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: '/images/azmera-icon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/images/azmera-icon.svg',
    apple: '/images/azmera-icon.svg',
  },
  manifest: '/manifest.json',
};

import { SessionProvider } from '@/components/providers/session-provider';

// ... imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AppProvider>
                <ReactQueryProvider>
                  <ClipboardPolyfill />
                  {children}
                  <OfflineIndicator />
                  <Toaster />
                </ReactQueryProvider>
              </AppProvider>
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
