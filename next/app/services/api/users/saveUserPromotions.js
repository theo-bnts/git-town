import { handleApiError } from '@/app/services/errorHandler';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { userPromotionsRoute, deleteUserPromotionRoute } from '@/app/services/routes';

/**
 * Pour la comparaison, on travaille uniquement avec des id (chaînes).
 */
const buildKey = promo => String(promo);

/**
 * Enregistre les promotions d'un utilisateur.
 * • Supprime les associations obsolètes via DELETE.
 * • Ajoute les nouvelles associations via PUT.
 * 
 * @param {number|string} userId - L'identifiant de l'utilisateur.
 * @param {string[]} newPromotions - La nouvelle liste des identifiants de promotion.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - Les promotions supprimées et ajoutées.
 */
export default async function saveUserPromotions(userId, newPromotions, token) {
  const currentPromotions = await getUserPromotions(userId, token);
  const currentMapped = currentPromotions.map(p => ({
    key: buildKey(p.Id),
    id: p.Id
  }));

  const newMapped = newPromotions.map(id => ({
    key: buildKey(id),
    promotion: id
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
      throw handleApiError(res, errorData);
    }
  }

  for (const addition of additions) {
    const endpoint = userPromotionsRoute(userId);
    const promotionPayload = { Id: String(addition.promotion) };

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ Promotion: promotionPayload })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw handleApiError(res, errorData);
    }
  }

  return {
    removed: removals.map(r => r.id),
    added: additions.map(a => a.key)
  };
}
