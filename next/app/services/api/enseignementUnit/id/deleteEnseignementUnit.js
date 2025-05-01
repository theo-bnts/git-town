'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { enseignementUnitRoute } from '@/app/services/routes';

/**
 * Supprime une unité d’enseignement
 * DELETE /enseignement-units/:id
 *
 * @param {string} unitId - Id de l'UE à supprimer
 * @param {string} token  - Token d'authentification
 * @returns {Promise<object>} - Réponse de l'API
 */
export default async function deleteEnseignementUnit(unitId, token) {
  const url = enseignementUnitRoute(unitId);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
