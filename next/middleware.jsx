// app/middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("userId")?.value;

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
      if (request.nextUrl.pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
    if (apiResponse.ok) {
      const userData = await apiResponse.json();
      if (userData.GitHubId !== null) {
        if (request.nextUrl.pathname.startsWith("/login")) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
      } else if (request.nextUrl.pathname !== "/login/link" &&
        (request.nextUrl.pathname !== "/login/authorize" || !request.nextUrl.searchParams.get("code"))) {
        return NextResponse.redirect(new URL("/login/link", request.url));
      }
    } else {
      const response = NextResponse.next();
      response.cookies.delete("token");
      response.cookies.delete("userId");
      if (request.nextUrl.pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  } else if (request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
