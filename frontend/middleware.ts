import {NextRequest, NextResponse} from "next/server";
import { languages as locales, fallbackLng } from "@/lib/i18n/config";
import {ROUTES} from "@/constants/routes";

// Regex to skip static files (e.g., .css, .js, .png, ...)
const PUBLIC_FILE = /\.(.*)$/;

/*
 * Get the locale from the pathname
 * Example: "/vi/dashboard" => "vi"
 */
const getLocaleFromPath = (pathname: string): string | undefined => {
    return locales.find(
        (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    );
}

/**
 * Remove the locale prefix from a pathname
 * Example: "/vi/dashboard" (locale = "vi") => "/dashboard"
 */
const stripLocale = (pathname: string, locale?: string) => {
    if (!locale) return pathname;
    const re = new RegExp(`^/${locale}`);
    const stripped = pathname.replace(re, "");
    return stripped.length === 0 ? "/" : stripped;
}

/**
 * Add the locale prefix to a pathname
 * Example: "/dashboard" (locale = "vi") => "/vi/dashboard"
 */
const withLocale = (pathname: string, locale: string) => {
    return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}


/**
 * Ensure that all URLs contain a locale prefix.
 * If not, redirect to the fallback locale.
 */
const ensureLocale = (request: NextRequest): NextResponse | void => {
    const { pathname } = request.nextUrl;

    // Skip static files and API routes
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        PUBLIC_FILE.test(pathname)
    ) {
        return NextResponse.next();
    }

    // If no locale in the URL -> redirect to fallback locale
    const localeInPath = getLocaleFromPath(pathname);
    if (!localeInPath) {
        const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value || fallbackLng;
        const url = request.nextUrl.clone();
        url.pathname = withLocale(pathname, cookieLocale);
        return NextResponse.redirect(url);
    }
}



/**
 * Handle authentication guard:
 * <ul>
 *     <li>
 *         Redirect authenticated users away from public routes
 *     </li>
 *     <li>
 *         Redirect unauthenticated users away from protected routes
 *     </li>
 * </ul>
 */
const authGuard = (
    request: NextRequest,
    pathname: string,
    locale: string
): NextResponse | void => {
    const pathWithoutLocale = stripLocale(pathname, locale);

    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    const isAuth = !!accessToken || !!refreshToken;

    const guestOnlyPaths = [
        ROUTES.AUTH.SIGN_IN,
        ROUTES.AUTH.SIGN_UP,
        ROUTES.AUTH.RESET_PASSWORDS,
        ROUTES.LANDING
    ];
    const authOnlyPaths = [
        ROUTES.HOME,
        ROUTES.ONBOARDING,
        ROUTES.PREMIUM,
        ROUTES.PROFILE.ME.ROOT,
        ROUTES.CONNECTIONS.ROOT,
        ROUTES.STORY.ROOT,
        ROUTES.ADMIN.ROOT
    ];

    const isGuestOnlyRoute = guestOnlyPaths.some(
        (path) =>
            pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`));

    const isAuthOnlyRoute = authOnlyPaths.some(
        (path) =>
            pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`));

    // Redirect logged-in users away from guest-only pages (e.g. /signin → /dashboard)
    if (isAuth && isGuestOnlyRoute) {
        const url = request.nextUrl.clone();
        url.pathname = withLocale("/home", locale);
        return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users away from protected pages (e.g. /dashboard → /signin)
    if (isAuthOnlyRoute && !isAuth) {
        const url = request.nextUrl.clone();
        url.pathname = withLocale("/signin", locale);
        return NextResponse.redirect(url);
    }
}

const middleware = (request: NextRequest) => {
    // 1) Ensure locale prefix
    const localeResponse = ensureLocale(request);
    if (localeResponse) return localeResponse;

    // 2) Apply authentication guard
    const { pathname } = request.nextUrl;
    const locale = getLocaleFromPath(pathname)!;
    const authResponse = authGuard(request, pathname, locale);
    if (authResponse) return authResponse;

    return NextResponse.next();
}

export default middleware;

export const config = {
    matcher: [
        "/((?!_next|api|favicon.ico|.*\\..*).*)"
    ],
};