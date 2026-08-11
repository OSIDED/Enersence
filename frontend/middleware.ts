import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * UX-layer route protection only. This checks whether the auth_token
 * cookie is PRESENT -- it does not (and cannot, in Edge middleware
 * without extra crypto setup) verify the JWT signature or expiry. Spring
 * Boot's JwtAuthFilter is the real authority: every API call still gets
 * validated there, and a 401 from any API call is handled by AuthContext
 * regardless of what this middleware decided. This just avoids flashing
 * protected UI before redirecting an obviously-logged-out visitor.
 */
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has("auth_token");
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasToken && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes (none exist here, Next.js is frontend-only)
     * - _next static/image files
     * - favicon
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
