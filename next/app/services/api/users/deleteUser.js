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
  
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  
  if (!res.ok) {
    if (data.error === 'HAS_REPOSITORIES') {
      return Promise.reject(
        new Error(
          "Impossible de supprimer l'utilisateur car il possède encore des dépôts associés. " +
          "Veuillez d'abord supprimer ces associations."
        )
      );
    }
    return Promise.reject(handleApiError(res, data));
  }
  
  return data;
}