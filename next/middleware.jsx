// app/middleware.js
import { NextResponse } from "next/server";


export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("userId")?.value;

  // --- Page de login (publique) ---
  // Si l'utilisateur est authentifié, on vérifie son token
  if (token && userId) {
    let apiResponse;
    try {
      apiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      ); 
    } catch (error) {
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("userId");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (apiResponse.ok) {
      const userData = await apiResponse.json();
      // S'il n'a pas encore lié son compte GitHub, il doit aller sur /login/link
      if (userData.GitHubId !== null) {
        // Si il accède /login/.. on le redirige vers /home
        if (request.nextUrl.pathname.startsWith("/login")) {
          return NextResponse.redirect(new URL("/home", request.url));
        } // Si !githubId alors il doit aller sur /login/link ou /login/authorize si code
      } else if (request.nextUrl.pathname !== "/login/link" &&
        (request.nextUrl.pathname !== "/login/authorize" || !request.nextUrl.searchParams.get("code"))) {
        return NextResponse.redirect(new URL("/login/link", request.url));
      }
    } else {
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("userId");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else if (request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Le middleware s'applique à toutes les routes, sauf aux ressources statiques
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
