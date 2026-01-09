import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export function useTranslatedToast() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const showToast = (options: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    action?: any;
  }) => {
    return toast({
      title: t(options.title),
      description: options.description ? t(options.description) : undefined,
      variant: options.variant,
      action: options.action as any,
    });
  };

  const showSuccess = (title: string, description?: string) => {
    return showToast({
      title,
      description,
      variant: 'default',
    });
  };

  const showError = (title: string, description?: string) => {
    return showToast({
      title,
      description,
      variant: 'destructive',
    });
  };

  return {
    toast: showToast,
    showSuccess,
    showError,
    t,
  };
}
