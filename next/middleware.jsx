// middleware.js
import { NextResponse } from "next/server";
import { userRoute } from "@/app/services/routes";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("userId")?.value;

  if (token && userId) {
    try {
      const apiResponse = await fetch(
        userRoute(userId),
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (apiResponse.ok) {
        const userData = await apiResponse.json();

        if (!userData.GitHubId) {
          if (
            request.nextUrl.pathname === "/login/authorize" &&
            request.nextUrl.searchParams.get("code")
          ) {
            return NextResponse.next();
          } else if (request.nextUrl.pathname !== "/login/link") {
            return NextResponse.redirect(new URL("/login/link", request.url));
          }
        } else {
          if (!userData.GitHubOrganizationMember) {
            if (request.nextUrl.pathname !== "/login/authorize") {
              return NextResponse.redirect(new URL("/login/authorize", request.url));
            }
          } else {
            if (request.nextUrl.pathname.startsWith("/login")) {
              return NextResponse.redirect(new URL("/", request.url));
            }
          }
        }
      } else {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/cookies|_next/static|_next/image|favicon.ico).*)"],
};
