import { withAuth } from "next-auth/middleware";
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    // English, Amharic, Oromo, Tigrinya, Somali
    locales: ['en', 'am', 'om', 'ti', 'so'],

    // Used when no locale matches
    defaultLocale: 'en'
});

const authMiddleware = withAuth(
    function onSuccess(req) {
        return intlMiddleware(req);
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;
                const isAdminPath = pathname.match(/^\/(?:en|am|om|ti|so)\/admin/) || pathname.startsWith('/admin');

                if (isAdminPath) {
                    return token?.role === 'admin' || token?.role === 'ADMIN';
                }
                return token != null;
            },
        },
        pages: {
            signIn: '/en/login',
        },
    }
);

export default function middleware(req: NextRequest) {
    // Robust public pages regex
    const publicPathnameRegex = /^\/(?:en|am|om|ti|so)?\/?(login|register|join|market|about|auth\/.*)?\/?$/i;
    const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname) || req.nextUrl.pathname === '/';

    // Also allow root path with locale only
    const isLocaleOnly = /^\/(en|am|om|ti|so)\/?$/i.test(req.nextUrl.pathname);

    if (isPublicPage || isLocaleOnly) {
        return intlMiddleware(req);
    } else {
        // @ts-ignore
        return (authMiddleware as any)(req);
    }
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
