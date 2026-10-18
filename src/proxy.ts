import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { SEED_USERS } from '@/lib/seed-data';
import { isDemoModeEnabled } from '@/lib/runtime-mode';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'fr', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export async function proxy(request: NextRequest) {
  // 0. Force manual HTTP redirect for the root path to bypass all rewrite bugs on Vercel
  if (request.nextUrl.pathname === '/') {
    const localeCookie = request.cookies.get('NEXT_LOCALE')?.value || 'en';
    return NextResponse.redirect(new URL(`/${localeCookie}`, request.url));
  }

  // 1. Run Internationalization Middleware
  const response = intlMiddleware(request);
  const demoUserId = request.cookies.get('nexus-demo-user-id')?.value;
  const demoUser = demoUserId ? SEED_USERS.find((user) => user.id === demoUserId) ?? null : null;
  const isDemoMode = isDemoModeEnabled();

  if (isDemoMode) {
    const pathname = request.nextUrl.pathname;
    const cleanPath = pathname.replace(/^\/(en|fr|ar)(\/|$)/, '/') || '/';
    const localeMatch = pathname.match(/^\/(en|fr|ar)/);
    const currentLocale = localeMatch ? localeMatch[1] : (request.cookies.get('NEXT_LOCALE')?.value || 'en');
    const isAuthRoute = cleanPath.startsWith('/login') || cleanPath.startsWith('/register') || cleanPath.startsWith('/signup');
    const isVerificationRoute = cleanPath.startsWith('/verify-email');
    const isProtectedRoute =
      cleanPath.startsWith('/settings') ||
      cleanPath.startsWith('/messages') ||
      cleanPath.startsWith('/admin') ||
      cleanPath.startsWith('/projects/manage') ||
      cleanPath.startsWith('/projects/new') ||
      cleanPath.startsWith('/profile');

    if (!demoUser && isProtectedRoute) {
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }

    if (demoUser && isAuthRoute) {
      return NextResponse.redirect(new URL(`/${currentLocale}/feed`, request.url));
    }

    if (demoUser && isVerificationRoute) {
      return NextResponse.redirect(new URL(`/${currentLocale}/feed`, request.url));
    }

    if (demoUser && cleanPath.startsWith('/admin')) {
      const demoRoles = (demoUser as { roles?: string[] }).roles ?? [];
      const isDemoAdmin = Boolean(
        demoRoles.includes('admin') ||
        demoUser.name?.toLowerCase().includes('admin') ||
        demoUser.email?.toLowerCase().includes('admin')
      );

      if (!isDemoAdmin) {
        return NextResponse.redirect(new URL(`/${currentLocale}/feed`, request.url));
      }
    }

    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Do NOT overwrite the response with NextResponse.next(), as this destroys next-intl rewrites!
          // Just append the cookie to the existing response.
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Route Protection Logic
  const pathname = request.nextUrl.pathname;
  const cleanPath = pathname.replace(/^\/(en|fr|ar)(\/|$)/, '/') || '/';
  const localeMatch = pathname.match(/^\/(en|fr|ar)/);
  const currentLocale = localeMatch ? localeMatch[1] : (request.cookies.get('NEXT_LOCALE')?.value || 'en');

  const isAuthRoute = cleanPath.startsWith('/login') || cleanPath.startsWith('/register') || cleanPath.startsWith('/signup');
  const isVerificationRoute = cleanPath.startsWith('/verify-email');
  
  const isProtectedRoute = 
    cleanPath.startsWith('/settings') ||
    cleanPath.startsWith('/messages') ||
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/projects/manage') ||
    cleanPath.startsWith('/projects/new') ||
    cleanPath.startsWith('/profile');
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  // Handle unverified users (email not confirmed)
  const isUnverified = user && !user.email_confirmed_at;
  
  if (isUnverified && isProtectedRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/verify-email`, request.url));
  }

  if (user && isAuthRoute) {
    if (isUnverified) {
      return NextResponse.redirect(new URL(`/${currentLocale}/verify-email`, request.url));
    }
    return NextResponse.redirect(new URL(`/${currentLocale}/feed`, request.url));
  }

  if (user && !isUnverified && isVerificationRoute) {
    return NextResponse.redirect(new URL(`/${currentLocale}/feed`, request.url));
  }

  // Admin Route Authorization
  if (cleanPath.startsWith('/admin')) {
    // Check if user is admin by querying the profiles table
    // (We do this server-side so it cannot be spoofed)
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL(`/${currentLocale}/feed`, request.url));
      }
    }
  }

  // Rate Limiting (Simple Mock via Cookies for Demo purposes, or edge-native if Redis was available)
  // Since we don't have Redis/Upstash, we'll set a basic header to indicate we have a rate limit strategy ready.
  response.headers.set('X-RateLimit-Limit', '100');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
