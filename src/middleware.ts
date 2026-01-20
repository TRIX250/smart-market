import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/welcome(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/subscribe(.*)',
  '/api/webhooks(.*)',
  '/api/webhook/flutterwave(.*)'
]);

const handler = clerkMiddleware(async (auth, req) => {
  try {
    const authData = await auth();
    const { userId, sessionClaims } = authData;

    const adminEmail = 'ishimwet822@gmail.com';
    const claims = sessionClaims as {
      email?: string;
      username?: string;
      publicMetadata?: { expiryDate?: any }
    } | null;

    const userEmail = claims?.email;
    const username = claims?.username;

    // 1. PUBLIC ROUTES (Landing, Auth, etc.)
    if (isPublicRoute(req)) {
      // If logged in as admin/owner, don't show the subscribe page
      if (userId && (userEmail?.toLowerCase() === adminEmail.toLowerCase() || username === 'trick_market')) {
        if (req.nextUrl.pathname === '/subscribe') {
          return NextResponse.redirect(new URL('/', req.url)); // Safe redirect to home
        }
      }
      return NextResponse.next();
    }

    // 2. USER AUTHENTICATION
    if (!userId) {
      // Construct a safe sign-in URL with redirect
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 3. AUTO-LOCK EXPIRED USERS
    const isAdminOrOwner =
      userEmail?.toLowerCase() === adminEmail.toLowerCase() ||
      username === 'trick_market';

    if (!isAdminOrOwner) {
      const expiry = claims?.publicMetadata?.expiryDate;
      if (expiry) {
        // Handle both string and numeric timestamp
        const expiryDate = new Date(Number(expiry) || expiry);
        if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
          return NextResponse.redirect(new URL('/subscribe', req.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Prevent the entire app from crashing if middleware has an issue (e.g. missing keys)
    console.error('Middleware execution error:', error);
    return NextResponse.next();
  }
});

export default handler;
export const proxy = handler;

export const config = {
  matcher: [
    // Standard Clerk matcher
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};