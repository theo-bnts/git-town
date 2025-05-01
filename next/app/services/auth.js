import { getCookie } from '@/app/services/cookies';

function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  b64 += '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(b64);
  const bytes = new Uint8Array([...binary].map(ch => ch.charCodeAt(0)));
  return new TextDecoder().decode(bytes);
}

export function encodeUserInfo({ fullName, role }) {
  const json = JSON.stringify({ fullName, role });
  return base64UrlEncode(json);
}

export function decodeUserInfo(rawBase64Url) {
  if (!rawBase64Url) return null;
  try {
    const jsonString = base64UrlDecode(rawBase64Url);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

/**
 * Effectue un fetch en ajoutant automatiquement le token d'authentification.
 * @param {string} url
 * @param {object} [options]
 * @returns {Promise<Response>}
 */
export async function fetchWithAuth(url, options = {}) {
  // Récupère le token depuis les cookies (adapté à ton projet)
  const token = await getCookie('token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}
