import { deleteUserPromotionRoute } from '@/app/services/routes';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Supprime tous les liens entre un utilisateur et ses promotions
 * (DELETE /users/:userId/promotions/:promotionId)
 *
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<void>} 
 * @throws {Error} - En cas d'erreur lors de la suppression d'un lien.
 */
export default async function deleteUserPromotions(userId, token) {
  const currentPromotions = await getUserPromotions(userId, token);
  
  await Promise.all(
    currentPromotions.map(async (promotionLink) => {
      const promotionId = promotionLink.Promotion.Id;
      const endpoint = deleteUserPromotionRoute(userId, promotionId);
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw handleApiError(res, data);
      }
    })
  );
}
