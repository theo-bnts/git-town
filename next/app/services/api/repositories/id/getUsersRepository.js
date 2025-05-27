'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { repositoryUsersRoute } from '@/app/services/routes';

/**
 * Récupère la liste des utilisateurs d'un dépôt
 * GET /repositories/:repositoryId/users
 * 
 * @param {string} repositoryId - ID du dépôt
 * @param {string} token - Token d'authentification
 * @returns {Promise<object[]>} - Tableau d'utilisateurs du dépôt
 */
export default async function getUsersRepository(repositoryId, token) {
  const url = repositoryUsersRoute(repositoryId);
  
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  let data;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : [];
  } catch (error) {
    data = [];
  }

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  
  return data;
}
