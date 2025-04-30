// app/hooks/useAuthToken.js
import { useState, useEffect } from 'react';
import { getCookie } from '@/app/services/cookies';

export default function useAuthToken() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    getCookie('token').then(setToken);
  }, []);
  return token;
}
