"use client";

import { useLanguage } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Demo component showing language system usage
 * Can be used for testing or as a reference
 */
export function LanguageDemo() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{t('common.language', 'Language System Demo')}</CardTitle>
        <CardDescription>
          Testing multi-language support with 5 Ethiopian languages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Language */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Current Language</h3>
          <Badge variant="secondary" className="text-lg">
            {SUPPORTED_LANGUAGES[language].flag}{' '}
            {SUPPORTED_LANGUAGES[language].nativeName}
          </Badge>
        </div>

        {/* Language Buttons */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Switch Language</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => (
              <Button
                key={code}
                variant={language === code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage(code as any)}
              >
                {info.flag} {info.nativeName}
              </Button>
            ))}
          </div>
        </div>

        {/* Sample Translations */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Sample Translations</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-muted-foreground">Welcome:</span>
              <span className="font-medium">{t('common.welcome', 'Welcome')}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-muted-foreground">Loading:</span>
              <span className="font-medium">{t('common.loading')}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-muted-foreground">Success:</span>
              <span className="font-medium">{t('common.success')}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-muted-foreground">Dashboard:</span>
              <span className="font-medium">{t('nav.dashboard')}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted rounded">
              <span className="text-muted-foreground">Marketplace:</span>
              <span className="font-medium">{t('nav.marketplace')}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            ✅ Translations are stored in localStorage
            <br />
            ✅ Secure input validation and XSS prevention
            <br />
            ✅ Automatic fallback to English if translation missing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
