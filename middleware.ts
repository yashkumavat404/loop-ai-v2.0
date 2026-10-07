import NextAuth from "next-auth";

import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;

  const isAuthenticated = Boolean(request.auth);

  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/signup");

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return Response.redirect(loginUrl);
  }

  if (
    isAuthenticated &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
