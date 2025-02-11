// app/middleware.js
import { NextResponse } from "next/server";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    if (token) {
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (apiResponse.ok) {
        return NextResponse.redirect(new URL("/home", request.url));
      } else if (apiResponse.status === 401) {
        const data = await apiResponse.json();
        if (data.error === "INVALID_TOKEN") {
          const response = NextResponse.next();
          response.cookies.delete("token");
          return response;
        }
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (apiResponse.status === 401) {
    const data = await apiResponse.json();
    if (data.error === "INVALID_TOKEN") {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/home", "/login/authorize", "/login/link"],
};
