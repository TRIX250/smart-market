import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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
  const { userId, sessionClaims } = await auth();
  const adminEmail = 'ishimwet822@gmail.com';

  const claims = sessionClaims as {
    email?: string;
    username?: string;
    publicMetadata?: { expiryDate?: string }
  } | null;

  const userEmail = claims?.email;
  const username = claims?.username;

  // 1. PUBLIC ROUTES (Landing, Auth, etc.)
  if (isPublicRoute(req)) {
    // Admin should never see the subscribe page
    if (userId && (userEmail?.toLowerCase() === adminEmail.toLowerCase() || username === 'trick_market')) {
      if (req.nextUrl.pathname === '/subscribe') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return NextResponse.next();
  }

  // 2. USER AUTHENTICATION
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // 3. AUTO-LOCK EXPIRED USERS
  const isAdminOrOwner =
    userEmail?.toLowerCase() === adminEmail.toLowerCase() ||
    username === 'trick_market';

  if (!isAdminOrOwner) {
    const expiry = claims?.publicMetadata?.expiryDate;
    if (expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate < new Date()) {
        return NextResponse.redirect(new URL('/subscribe', req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};