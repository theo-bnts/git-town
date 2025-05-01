'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { enseignementUnitsRoute } from '@/app/services/routes';

/**
 * Récupère la liste des unités d’enseignement
 * GET /enseignement-units
 *
 * @param {string} token - Token d'authentification
 * @returns {Promise<object[]>} - Tableau d'UE
 */
export default async function getEnseignementUnits(token) {
  const url = enseignementUnitsRoute();

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
