'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { rolesRoute } from '@/app/services/routes';

/**
 * Récupère la liste des rôles
 * GET /roles
 * 
 * @param {string} token - Token d'authentification
 * @returns {Promise<object[]>} - Tableau de rôles
 */
export default async function getRoles(token) {
  const url = rolesRoute();

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
