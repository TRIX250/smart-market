import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isEmailAdmin, isUsernameAdmin } from './lib/auth-constants';

const isPublicRoute = createRouteMatcher([
  '/',
  '/welcome(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/subscribe(.*)',
  '/api/webhooks(.*)',
  '/api/webhook/flutterwave(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId, sessionClaims } = await auth();

    const claims = sessionClaims as {
      email?: string;
      username?: string;
      publicMetadata?: { expiryDate?: any }
    } | null;

    const userEmail = claims?.email;
    const username = claims?.username;

    const isAdminOrOwner = isEmailAdmin(userEmail) || isUsernameAdmin(username);

    // 1. PUBLIC ROUTES (Landing, Auth, etc.)
    if (isPublicRoute(req)) {
      // If logged in as admin/owner, don't show the subscribe page
      if (userId && isAdminOrOwner) {
        if (req.nextUrl.pathname === '/subscribe') {
          return NextResponse.redirect(new URL('/', req.url));
        }
      }
      return NextResponse.next();
    }

    // 2. USER AUTHENTICATION
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 3. AUTO-LOCK EXPIRED USERS
    if (!isAdminOrOwner) {
      const expiry = claims?.publicMetadata?.expiryDate;
      if (expiry) {
        const expiryDate = new Date(Number(expiry) || expiry);
        if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
          return NextResponse.redirect(new URL('/subscribe', req.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware execution error:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};