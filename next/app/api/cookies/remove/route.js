import { NextResponse } from 'next/server';

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  const response = NextResponse.json({ success: true });
  response.cookies.delete(key);
  return response;
}
