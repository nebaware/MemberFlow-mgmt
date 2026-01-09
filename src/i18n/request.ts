import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Read locale from the request headers set by middleware
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
