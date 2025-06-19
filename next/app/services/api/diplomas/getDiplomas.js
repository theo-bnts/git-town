'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { diplomasRoute } from '@/app/services/routes';

/**
 * Récupère la liste des diplômes
 * GET /diplomas
 *
 * @param {string} token - Token d'authentification
 * @returns {Promise<object[]>} - Tableau de diplômes
 */
export default async function getDiplomas(token) {
  const url = diplomasRoute();

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : [];

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
