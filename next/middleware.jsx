// app/middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("userId")?.value;
  const { pathname } = request.nextUrl;

  // --- Page de login (publique) ---
  if (pathname === "/login") {
    // Si l'utilisateur est authentifié, on vérifie son token
    if (token && userId) {
      try {
        const apiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (apiResponse.ok) {
          const userData = await apiResponse.json();
          // S'il n'a pas encore lié son compte GitHub, il doit aller sur /login/link
          if (userData.GitHubId === null) {
            return NextResponse.redirect(new URL("/login/link", request.url));
          } else {
            // Sinon, il est déjà authentifié : rediriger vers /home
            return NextResponse.redirect(new URL("/home", request.url));
          }
        } else {
          // En cas d'échec, on supprime les cookies pour permettre une nouvelle connexion
          const response = NextResponse.next();
          response.cookies.delete("token");
          response.cookies.delete("userId");
          return response;
        }
      } catch (error) {
        // En cas d'erreur (ex. réseau), on supprime les cookies et on autorise l'accès à /login
        const response = NextResponse.next();
        response.cookies.delete("token");
        response.cookies.delete("userId");
        return response;
      }
    }
    return NextResponse.next();
  }

  // --- Pour toutes les autres routes ---
  // Si token ou userId sont manquants, rediriger vers /login
  if (!token || !userId) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("userId");
    return response;
  }

  try {
    // Vérifier la validité du token via l'API
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!apiResponse.ok) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      response.cookies.delete("userId");
      return response;
    }
    const userData = await apiResponse.json();

    // Si on accède à /login/link :
    if (pathname === "/login/link") {
      // Si GitHubId est déjà renseigné, l'accès à /login/link n'est pas autorisé
      if (userData.GitHubId !== null) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
      return NextResponse.next();
    }

    // Pour toutes les autres routes :
    // Si GitHubId est null, l'utilisateur n'a pas finalisé la liaison GitHub
    if (userData.GitHubId === null) {
      return NextResponse.redirect(new URL("/login/link", request.url));
    }

    // Sinon, tout est valide et l'accès est autorisé
    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("userId");
    return response;
  }
}

export const config = {
  // Le middleware s'applique à toutes les routes, sauf aux ressources statiques
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
