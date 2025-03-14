// /app/api/cookies/set/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const value = searchParams.get('value');

  const response = NextResponse.json({ success: true });
  response.cookies.set(key, value, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: false,
    expires: new Date(Date.now() + 60 * 60 * 1000),  
  });
  return response;
}
