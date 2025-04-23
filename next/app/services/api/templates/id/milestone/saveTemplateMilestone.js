'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateMilestoneRoute, templateMilestonesRoute } from '@/app/services/routes';

/**
 * Enregistre un milestone d'un template
 * (PUT /templates/:templateId/milestones ou PATCH /templates/:templateId/milestones/:milestoneId)
 *
 * @param {string} templateId - L'identifiant du template.
 * @param {string} [milestoneId] - L'identifiant du milestone à enregistrer (optionnel).
 * @param {object} payload - Les données à envoyer dans la requête.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 * @throws {Error} - En cas d'erreur lors de l'enregistrement.
 */
export default async function saveTemplateMilestone(templateId, milestoneId, payload, token) {
  const url    = milestoneId
    ? templateMilestoneRoute(templateId, milestoneId)
    : templateMilestonesRoute(templateId);
  const method = milestoneId ? 'PATCH' : 'PUT';

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
