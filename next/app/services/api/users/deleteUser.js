import { userRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';
import deleteUserPromotions from '@/app/services/api/users/deleteUserPromotions';

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
  let res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  let text = await res.text();
  let data = text ? JSON.parse(text) : {};
  
  if (!res.ok) {
    if (data.error === 'HAS_PROMOTIONS') {
      try {
        await deleteUserPromotions(userId, token);
      } catch (err) {
        return Promise.reject(
          new Error('Impossible de supprimer les liens de promotions: ' + err.message)
        );
      }
      res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      text = await res.text();
      data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        return Promise.reject(handleApiError(res, data));
      }
      return data;
    }
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
