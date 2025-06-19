import { userRepositoryRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Ajoute un dépôt à un utilisateur.
 * (PUT /users/:userId/repositories)
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @param {Object} repository - Les données du dépôt à ajouter.
 * @param {string} token - Le token d'authentification.
 * @return {Promise<Object>} - Les données du dépôt ajouté.
 * @throws {Error} - En cas d'erreur lors de l'ajout du dépôt.
 */

export default async function putUserRepository(userId, repository, token) {
  const endpoint = userRepositoryRoute(userId);
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(repository),
  });

  if (!res.ok) {
    const data = await res.json();
    throw handleApiError(res, data);
  }

  return res.json();
}
