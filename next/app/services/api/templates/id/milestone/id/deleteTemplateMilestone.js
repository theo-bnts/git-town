'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateMilestoneRoute } from '@/app/services/routes';

/** Supprime un milestone d'un template
 * (DELETE /templates/:templateId/milestones/:milestoneId)
 * 
 * @param {string} templateId - L'identifiant du template.
 * @param {string} milestoneId - L'identifiant du milestone à supprimer.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 * @throws {Error} - En cas d'erreur lors de la suppression.
 */
export default async function deleteTemplateMilestone(templateId, milestoneId, token) {
  const url = templateMilestoneRoute(templateId, milestoneId);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
