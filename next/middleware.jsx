import { NextResponse } from "next/server";

export async function middleware(request) {
  if (
    request.nextUrl.pathname === "/login/authorize" &&
    !request.nextUrl.searchParams.get("code")
  ) {
    return NextResponse.redirect(new URL("/login/link", request.url));
  }

  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("userId")?.value;

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

        // Cas : utilisateur non lié à GitHub
        if (!userData.GitHubId) {
          // Autoriser l'accès à /login/link et à /login/authorize (si un code est présent)
          if (
            request.nextUrl.pathname !== "/login/link" &&
            request.nextUrl.pathname !== "/login/authorize"
          ) {
            return NextResponse.redirect(new URL("/login/link", request.url));
          }
        }
        // Cas : utilisateur lié à GitHub
        else {
          if (userData.GitHubOrganizationMember) {
            // L'utilisateur lié et membre de l'organisation ne doit pas accéder aux pages de lien/autorisation
            if (
              request.nextUrl.pathname === "/login/authorize" ||
              request.nextUrl.pathname === "/login/link"
            ) {
              return NextResponse.redirect(new URL("/home", request.url));
            }
          } else {
            // Utilisateur lié mais non membre : il doit rester sur /login/authorize pour lancer l'invitation
            if (request.nextUrl.pathname !== "/login/authorize") {
              return NextResponse.redirect(new URL("/login/authorize", request.url));
            }
          }
        }
      } else {
        // Erreur API : rediriger vers /login et supprimer les cookies
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token", { path: "/" });
        response.cookies.delete("userId", { path: "/" });
        return response;
      }
    } catch (error) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token", { path: "/" });
      response.cookies.delete("userId", { path: "/" });
      return response;
    }
  } else if (request.nextUrl.pathname !== "/login") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token", { path: "/" });
    response.cookies.delete("userId", { path: "/" });
    return response;
  }

  // Si aucune redirection n'est nécessaire, laisser passer la requête
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
