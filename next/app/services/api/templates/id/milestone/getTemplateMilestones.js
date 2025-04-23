'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { templateMilestonesRoute } from '@/app/services/routes';

/**
 * Récupère les milestones d'un template
 * (GET /templates/:templateId/milestones)
 *
 * @param {string} templateId - L'identifiant du template.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object[]>} - La liste des milestones du template.
 * @throws {Error} - En cas d'erreur lors de la récupération.
 */
export default async function getTemplateMilestones(templateId, token) {
  const url = templateMilestonesRoute(templateId);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  const text = await res.text();
  const data = text ? JSON.parse(text) : [];

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
