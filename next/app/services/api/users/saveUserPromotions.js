import { handleApiError } from '@/app/services/errorHandler';
import getUserPromotions from '@/app/services/api/users/getUserPromotions';
import { userPromotions, deleteUserPromotion } from '@/app/services/routes';

const buildKey = promo =>
  `${promo.Diploma.Initialism}_${promo.PromotionLevel.Initialism}_${promo.Year}`;

export default async function saveUserPromotions(userId, newPromotions, token) {
  // Récupère les promotions actuelles associées à l'utilisateur
  const currentPromotions = await getUserPromotions(userId, token);
  
  // On suppose que currentPromotions renvoie un tableau d'objets contenant :
  // { UserPromotionId, Promotion }
  const currentMapped = currentPromotions.map(cp => ({
    key: buildKey(cp.Promotion),
    // Utilisation de l'id de la promotion pour la suppression
    // (L'API attend que l'id envoyé corresponde à l'id de la promotion)
    id: cp.Promotion.Id  
  }));

  const newMapped = newPromotions.map(p => ({
    key: buildKey(p),
    promotion: p  // l'objet promotion complet attendu par l'API lors de l'ajout
  }));
  
  // Promotions à supprimer : présentes dans currentMapped mais absentes dans newMapped
  const removals = currentMapped.filter(cp =>
    !newMapped.some(np => np.key === cp.key)
  );
  
  // Promotions à ajouter : présentes dans newMapped mais absentes de currentMapped
  const additions = newMapped.filter(np =>
    !currentMapped.some(cp => cp.key === np.key)
  );
  
  // Traitement des suppressions via DELETE /users/:UserId/promotions/:UserPromotionId
  for (const removal of removals) {
    const endpoint = deleteUserPromotion(userId, removal.id);
    console.log("Suppression endpoint:", endpoint);
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw await handleApiError(res, errorData);
    }
  }
  
  // Traitement des ajouts via PUT /users/:UserId/promotions
  for (const addition of additions) {
    const endpoint = userPromotions(userId);
    // Préparation du payload dans le format attendu
    const promotionPayload = {
      Diploma: { Initialism: addition.promotion.Diploma.Initialism },
      PromotionLevel: { Initialism: addition.promotion.PromotionLevel.Initialism },
      Year: addition.promotion.Year
    };
    console.log("Ajout endpoint:", endpoint, "body:", { Promotion: promotionPayload });
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
  
  return { removed: removals.map(r => r.id), added: additions.map(a => a.key) };
}
