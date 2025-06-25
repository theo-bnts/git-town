'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoryCommentRoute } from '@/app/services/routes';

/**
 * Récupère le commentaire d’un dépôt
 * (GET /repositories/:repoId/comment)
 *
 * @param {string|number} repoId
 * @param {string} token
 * @returns {Promise<{ Comment: string }>}
 */
export default async function getComment(repoId, token) {
  const url = repositoryCommentRoute(repoId);

  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : { Comment: '' };

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return data;
}
