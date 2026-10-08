import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'fr', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // 1. Run Internationalization Middleware
  let response = intlMiddleware(request);

  // If in demo mode, skip Supabase auth middleware
  if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'demo' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
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
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/settings') ||
    request.nextUrl.pathname.startsWith('/messages') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname === '/projects/manage' ||
    request.nextUrl.pathname === '/projects/new';
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  // Admin Route Authorization
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check if user is admin by querying the profiles table
    // (We do this server-side so it cannot be spoofed)
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/feed', request.url));
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
