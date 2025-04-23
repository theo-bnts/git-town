'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateRoute } from '@/app/services/routes';

/**
 * Supprime un template
 * (DELETE /templates/:templateId)
 *
 * @param {string} templateId - L'identifiant du template à supprimer.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 * @throws {Error} - En cas d'erreur lors de la suppression.
 */
export default async function deleteTemplate(templateId, token) {
  const url = templateRoute(templateId);

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
