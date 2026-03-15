import { auth } from "~/server/auth/config";
import { NextResponse } from "next/server";

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 1. ROTAS PÚBLICAS: Landing Page (/), Sobre (/sobre) e Login
  if (pathname === "/" || pathname === "/sobre" || pathname.startsWith("/login")) {
    
    // Se o usuário já estiver logado e tentar acessar login, manda pro dashboard
    if (isLoggedIn && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    
    return NextResponse.next();
  }

  // 2. PROTEÇÃO: Se não estiver logado, redireciona para login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});