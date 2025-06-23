// app/services/api/users/id/repositories/deleteUserRepository.js
import { delUserRepositoryRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Supprime le lien entre un utilisateur et un dépôt.
 * (DELETE /users/:userId/repositories/:repoId)
 *
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} repoId - L’identifiant du dépôt.
 * @param {string} token - Le token d’authentification.
 * @returns {Promise<void>}
 * @throws {Error} - En cas d’erreur sur la suppression.
 */
export default async function deleteUserRepository(userId, repoId, token) {
  const endpoint = delUserRepositoryRoute(userId, repoId);
  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json();
    throw handleApiError(res, data);
  }
}
