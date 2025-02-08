'use client';
// app/login/authorize/page.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthorizePage() {
  const searchParams = useSearchParams();

  const code = searchParams.get('code');

  useEffect(() => {
      console.log(code);
  });
}
