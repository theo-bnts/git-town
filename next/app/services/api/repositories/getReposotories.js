'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoriesRoute } from '@/app/services/routes';

/**
 * Récupération de la liste des dépôts
 * GET /repositories
 * 
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - Les dépôts
 * @throws {Error} - En cas d'erreur de la requête
 */
export default async function getRepositories(token) {
  const url = repositoriesRoute();
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  let data;
  try {
    data = await res.json();
  } catch (error) {
    data = {};
  }

  if (!res.ok) {
    handleApiError(res, data);
  }

  return data;
}