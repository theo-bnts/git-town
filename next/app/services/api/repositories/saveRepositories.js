'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoryRoute, repositoriesRoute } from '@/app/services/routes';

/**
 * Enregistre un dépôt
 * PUT /repositories ou PATCH /repositories/:repositoryId
 * 
 * @param {string|null} repositoryId - L'identifiant du dépôt (null pour création).
 * @param {object} payload - Les données du dépôt à enregistrer.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 */

export default async function saveRepositories(repositoryId, payload, token) {
  const url = repositoryId ? repositoryRoute(repositoryId) : repositoriesRoute();
  const method = repositoryId ? 'PATCH' : 'PUT';

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