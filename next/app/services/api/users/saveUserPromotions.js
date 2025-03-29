import { handleApiError } from '@/app/services/errorHandler';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { userPromotionsRoute, deleteUserPromotion } from '@/app/services/routes';

const buildKey = promo =>
  `${promo.Diploma.Initialism}_${promo.PromotionLevel.Initialism}_${promo.Year}`;

/**
 * Enregistre les promotions d'un utilisateur.
 * (DELETE /users/:userId/promotions/:promotionId)
 * (PUT /users/:userId/promotions)
 * 
 * @param {number} userId - L'identifiant de l'utilisateur.
 * @param {object[]} newPromotions - La nouvelle liste des promotions.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - Les promotions supprimées et ajoutées.
 */
export default async function saveUserPromotions(userId, newPromotions, token) {
  const currentPromotions = await getUserPromotions(userId, token);
  
  const currentMapped = currentPromotions.map(cp => ({
    key: buildKey(cp.Promotion),
    id: cp.Promotion.Id  
  }));

  const newMapped = newPromotions.map(p => ({
    key: buildKey(p),
    promotion: p
  }));
  
  const removals = currentMapped.filter(cp =>
    !newMapped.some(np => np.key === cp.key)
  );
  
  const additions = newMapped.filter(np =>
    !currentMapped.some(cp => cp.key === np.key)
  );
  
  for (const removal of removals) {
    const endpoint = deleteUserPromotionRoute(userId, removal.id);
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw await handleApiError(res, errorData);
    }
  }
  
  for (const addition of additions) {
    const endpoint = userPromotionsRoute(userId);
    const promotionPayload = {
      Diploma: { Initialism: addition.promotion.Diploma.Initialism },
      PromotionLevel: { Initialism: addition.promotion.PromotionLevel.Initialism },
      Year: addition.promotion.Year
    };
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ Promotion: promotionPayload })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw await handleApiError(res, errorData);
    }
  }
  
  return { 
    removed: removals.map(r => r.id), 
    added: additions.map(a => a.key) 
  };
}
