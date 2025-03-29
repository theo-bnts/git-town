import { userPromotionsRoute, deleteUserPromotionRoute } from "@/app/services/routes";
import { handleApiError } from "@/app/services/errorHandler";

/**
 * Supprime les liens entre un utilisateur et ses promotions
 * (DELETE /users/:userId/promotions)
 *
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<void>}
 * @throws {Error} - En cas d'erreur lors de la suppression.
 */
export default async function deleteUserPromotions(userId, token) {
  const getUrl = userPromotionsRoute(userId);
  let res = await fetch(getUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  let text = await res.text();
  let promotions = text ? JSON.parse(text) : [];
  
  if (!res.ok) {
    throw handleApiError(res, promotions);
  }
  
  await Promise.all(
    promotions.map(async (promotion) => {
      const deleteUrl = deleteUserPromotionRoute(userId, promotion.Id);
      const delRes = await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const delText = await delRes.text();
      const delData = delText ? JSON.parse(delText) : {};
      if (!delRes.ok) {
        throw handleApiError(delRes, delData);
      }
    })
  );
}
