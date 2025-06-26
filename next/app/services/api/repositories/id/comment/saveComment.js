'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoryCommentRoute } from '@/app/services/routes';

/**
 * Enregistre / met à jour le commentaire d’un dépôt
 * (PATCH /repositories/:repoId/comment)
 *
 * @param {string|number} repoId
 * @param {string} comment – nouveau texte
 * @param {string} token
 * @returns {Promise<void>}
 */
export default async function saveComment(repoId, comment, token) {
  const url = repositoryCommentRoute(repoId);

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ Comment: comment }),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) return Promise.reject(handleApiError(res, data));
  return;
}
