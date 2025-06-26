import { NextResponse } from 'next/server';
import { userRoute } from '@/app/services/routes';
import { encodeUserInfo } from '@/app/services/auth';

export async function middleware(request) {
  const tokenValue = request.cookies.get('token')?.value;
  const userIdValue = request.cookies.get('userId')?.value;

  if (tokenValue && userIdValue) {
    try {
      const apiResponse = await fetch(userRoute(userIdValue), {
        method: 'GET',
        headers: { Authorization: `Bearer ${tokenValue}` },
      });

      if (apiResponse.ok) {
        const userData = await apiResponse.json();

        const serializedUserInfo = encodeUserInfo({
          fullName: userData.FullName,
          role: userData.Role.Keyword,
        });

        const nextResponse = NextResponse.next();
        nextResponse.cookies.set('userInfo', serializedUserInfo, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
        });

        if (!userData.GitHubId) {
          if (
            request.nextUrl.pathname === '/login/authorize' &&
            request.nextUrl.searchParams.get('code')
          ) {
            return nextResponse;
          } else if (request.nextUrl.pathname !== '/login/link') {
            return NextResponse.redirect(new URL('/login/link', request.url));
          }
        } else {
          if (!userData.GitHubOrganizationMember) {
            if (request.nextUrl.pathname !== '/login/authorize') {
              return NextResponse.redirect(
                new URL('/login/authorize', request.url)
              );
            }
          } else {
            if (request.nextUrl.pathname.startsWith('/login')) {
              return NextResponse.redirect(new URL('/', request.url));
            }
          }
        }

        return nextResponse;
      } else {
        const redirectResponse = NextResponse.redirect(
          new URL('/login', request.url)
        );
        ['token', 'userId', 'userInfo'].forEach((cookieName) => {
          redirectResponse.cookies.delete(cookieName, { path: '/' });
        });
        return redirectResponse;
      }
    } catch (fetchError) {
      const errorRedirectResponse = NextResponse.redirect(
        new URL('/login', request.url)
      );
      ['token', 'userId', 'userInfo'].forEach((cookieName) => {
        errorRedirectResponse.cookies.delete(cookieName, { path: '/' });
      });
      return errorRedirectResponse;
    }
  } else if (request.nextUrl.pathname !== '/login') {
    const loginRedirectResponse = NextResponse.redirect(
      new URL('/login', request.url)
    );
    ['token', 'userId', 'userInfo'].forEach((cookieName) => {
      loginRedirectResponse.cookies.delete(cookieName, { path: '/' });
    });
    return loginRedirectResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/cookies|_next/static|assets/pictures|favicon.ico).*)',
  ],
};
