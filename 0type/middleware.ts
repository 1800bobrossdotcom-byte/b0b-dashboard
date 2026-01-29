import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ════════════════════════════════════════════════════════════════════════════
// 0TYPE BETA ACCESS CONTROL
// Only the landing page is public - all tools are in private beta
// ════════════════════════════════════════════════════════════════════════════

// Routes that are publicly accessible
const PUBLIC_ROUTES = [
  '/',                    // Landing page
  '/api/health',          // Health check
];

// Routes that require beta access
const PROTECTED_PREFIXES = [
  '/fonts',
  '/studio', 
  '/sketchpad',
  '/brushes',
  '/compare',
  '/diagnostic',
  '/direct-test',
  '/test',
  '/test-lab',
  '/verify',
];

// Beta access key (in production, use proper auth)
const BETA_KEY = process.env.ZEROTYPE_BETA_KEY || 'b0b-beta-2026';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Allow API routes (they have their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Allow static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }
  
  // Check if route is protected
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  
  if (isProtected) {
    // Check for beta access
    const betaKey = request.cookies.get('zerotype-beta')?.value;
    const headerKey = request.headers.get('x-beta-key');
    const queryKey = request.nextUrl.searchParams.get('beta');
    
    const hasAccess = 
      betaKey === BETA_KEY || 
      headerKey === BETA_KEY ||
      queryKey === BETA_KEY;
    
    if (!hasAccess) {
      // Redirect to landing page with beta message
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('access', 'beta');
      
      const response = NextResponse.redirect(url);
      
      // If query param provided, set cookie for future visits
      if (queryKey === BETA_KEY) {
        response.cookies.set('zerotype-beta', BETA_KEY, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
        
        // Redirect back to requested page with cookie set
        return NextResponse.redirect(request.nextUrl);
      }
      
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
