'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateRoute, templatesRoute } from '@/app/services/routes';

/**
 * Enregistre un template
 * (PUT /templates ou PATCH /templates/:templateId)
 *
 * @param {string} templateId - L'identifiant du template (optionnel).
 * @param {object} payload - Les données du template à enregistrer.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 * @throws {Error} - En cas d'erreur lors de l'enregistrement.
 */
export default async function saveTemplate(templateId, payload, token) {
  const url    = templateId ? templateRoute(templateId) : templatesRoute();
  const method = templateId ? 'PATCH' : 'PUT';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
