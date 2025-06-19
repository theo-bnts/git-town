import { userRepositoryRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Récupère les dépôts d'un utilisateur.
 * (GET /users/:userId/repositories)
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @return {Promise<Array>} - La liste des dépôts de l'utilisateur.
 * @throws {Error} - En cas d'erreur lors de la récupération des dépôts.
 */

export default async function getUserRepositories(userId, token) {
  const endpoint = userRepositoryRoute(userId);
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json();
    throw handleApiError(res, data);
  }
  
  return res.json();
}
