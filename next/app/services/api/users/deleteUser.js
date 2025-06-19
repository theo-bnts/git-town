import { userRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Supprime un utilisateur
 * (DELETE /users/:userId)
 *
 * @param {string} userId - L'identifiant de l'utilisateur à supprimer.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 * @throws {Error} - En cas d'erreur lors de la suppression.
 */
export default async function deleteUser(userId, token) {
  const url = userRoute(userId);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw handleApiError(res, data);
  }
}