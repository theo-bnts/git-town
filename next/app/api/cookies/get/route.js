// /app/api/cookies/get/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  const value = request.cookies.get(key)?.value ?? null;
  return NextResponse.json({ value });
}
