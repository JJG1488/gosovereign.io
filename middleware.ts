import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // Protected routes that require authentication
  const protectedPaths = ["/wizard", "/dashboard", "/billing"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing protected route without auth, redirect to login
  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user tries to access auth pages, redirect to wizard
  const authPaths = ["/auth/login", "/auth/signup"];
  const isAuthPath = authPaths.some(
    (path) => request.nextUrl.pathname === path
  );

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/wizard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     * - api routes (let them handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
