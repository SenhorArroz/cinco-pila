import { auth } from "~/server/auth/config";
import { NextResponse } from "next/server";

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // 1. Permitir acesso à página inicial (Landing Page) e Login sem estar logado
  if (pathname === "/" || pathname.startsWith("/login")) {
    // Se o usuário já estiver logado e tentar acessar login, manda pro dashboard
    if (isLoggedIn && pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Se não estiver logado e tentar acessar qualquer outra página, redireciona para login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    // Opcional: adicionar callbackUrl
    // loginUrl.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});
