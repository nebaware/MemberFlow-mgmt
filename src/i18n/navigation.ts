import { createNavigation } from 'next-intl/navigation';

// Support 5 Ethiopian languages: English, Amharic, Oromo, Tigrinya, Somali
export const locales = ['en', 'am', 'om', 'ti', 'so'] as const;
export const localePrefix = 'always'; // Default

export const { Link, redirect, usePathname, useRouter } =
    createNavigation({ locales, localePrefix });
