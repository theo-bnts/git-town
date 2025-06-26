import { replicateUsersPromotionRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Réplique les utilisateurs d’une promotion vers une autre.
 * (POST /promotions/:sourceId/replicate-users  { Id: targetId })
 *
 * @param {string} sourceId - Id de la promotion dont on copie les utilisateurs.
 * @param {string} targetId - Id de la promotion qui va recevoir les utilisateurs.
 * @param {string} token - Token d'authentification
 * @returns {Promise<Object|null>} - Réponse JSON de l’API ou null si pas de contenu.
 */
export default async function replicateUsersPromotion(sourceId, targetId, token) {
  const url = replicateUsersPromotionRoute(sourceId);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ Id: targetId }),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (res.ok) {
    return data;
  }

  handleApiError(res, data);
}
