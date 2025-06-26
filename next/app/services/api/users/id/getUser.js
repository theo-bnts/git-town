import { handleApiError } from '@/app/services/errorHandler';
import { userRoute } from '@/app/services/routes';

/**
 * Vérication des informations de l’utilisateur.
 * (GET /users/:userId)
 * 
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} token - Le token d’authentification.
 * @returns {Promise<Object>} - Les informations de l’utilisateur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function getUser(userId, token) {
  const url = userRoute(userId);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (res.ok)
    return data;

  throw handleApiError(res, data);
}
