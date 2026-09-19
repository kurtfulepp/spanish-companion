import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { requireSupabaseConfig } from '@/lib/supabase/config';
import { hasAdminPrivilege } from '@/lib/admin-access';

function addSecurityHeaders(response: NextResponse, allowCamera = false, allowMicrophone = false) {
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; object-src 'none'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; media-src 'self' blob:; upgrade-insecure-requests",
  );
  response.headers.set('Permissions-Policy', `camera=${allowCamera ? '(self)' : '()'}, geolocation=(), microphone=${allowMicrophone ? '(self)' : '()'}`);
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  // The title screen is public; learning routes still require authentication.
  if (request.nextUrl.pathname === '/') return addSecurityHeaders(response);
  const { url, publishableKey } = requireSupabaseConfig();
  const supabase = createServerClient(
    url,
    publishableKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const isSignIn = request.nextUrl.pathname === '/sign-in';
  const isJoin = request.nextUrl.pathname === '/join';
  const isAuthCallback = request.nextUrl.pathname === '/auth/confirm';

  function redirectWithSession(url: URL) {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return addSecurityHeaders(redirect);
  }

  if (!isAuthenticated && !isSignIn && !isJoin && !isAuthCallback) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return addSecurityHeaders(NextResponse.json({ error: 'Authentication required' }, { status: 401 }));
    }
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return redirectWithSession(url);
  }

  const path = request.nextUrl.pathname;
  const isAdminPage = path === '/admin' || path.startsWith('/admin/');
  const isAdminApi = path === '/api/admin' || path.startsWith('/api/admin/');
  if (isAdminPage || isAdminApi) {
    let permitted = false;
    try {
      const { data: current, error } = await supabase.auth.getUser();
      permitted = !error && hasAdminPrivilege(current.user);
    } catch { /* Deny if Supabase cannot verify the current privilege. */ }
    if (!permitted) {
      const denied = isAdminApi
        ? NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        : new NextResponse('Not found', { status: 404 });
      denied.headers.set('Cache-Control', 'private, no-store');
      response.cookies.getAll().forEach(cookie => denied.cookies.set(cookie));
      return addSecurityHeaders(denied);
    }
    response.headers.set('Cache-Control', 'private, no-store');
  }

  // Join always opens account creation; Sign in may reuse a valid session.
  if (isAuthenticated && isSignIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/home';
    return redirectWithSession(url);
  }

  return addSecurityHeaders(response, isAuthenticated && path === '/vocabulary/from-photo', isAuthenticated && path === '/conversation');
}
