// app/services/api/users/id/token/delToken.js
import { delTokenRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Suppression du token de l’utilisateur.
 * (DELETE /users/:userId/tokens/:tokenId)
 * 
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} token - Le token de l’utilisateur.
 * @returns {Promise<Object>} - L’objet contenant le message de succès.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function delToken(userId, token, tokenId) {
  const url = delTokenRoute(userId, tokenId);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (res.ok) return data;
  handleApiError(res, data);
}
