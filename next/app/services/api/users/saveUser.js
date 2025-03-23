import { handleApiError } from "@/app/services/errorHandler";
import { userRoute, usersRoute } from "@/app/services/routes";
import saveUserPromotions from "./saveUserPromotions";

/**
 * Enregistrement d'un utilisateur.
 * Utilise PUT /users pour créer un utilisateur et PATCH /users/:userId pour modifier.
 * Avant de lancer l'appel API, si aucune Id n'est présente, tente de récupérer l'utilisateur via son EmailAddress.
 * Ensuite, si un Id est disponible, compare les champs essentiels et les promotions.
 * Si aucune modification n'est détectée, la requête n'est pas envoyée.
 * En cas de mise à jour, la propriété Id n'est pas envoyée dans le payload.
 * Si la propriété "Promotions" est présente dans userData, la synchronisation se fait via saveUserPromotions.
 *
 * @param {object} userData - Les données de l'utilisateur.
 *        Pour une modification, userData peut ne pas contenir d'Id, auquel cas l'EmailAddress est utilisé.
 *        La propriété Promotions est un tableau d'objets promotion (contenant Diploma, PromotionLevel et Year).
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - L'utilisateur (éventuellement enrichi d'une clé "promotionsSync").
 */
export default async function saveUser(userId, payload, token) {
  let url, method;
  if (userId) {
    // Mise à jour via PATCH
    url = userRoute(userId); // L'ID est utilisé dans l’URL
    method = "PATCH";
  } else {
    // Création via PUT
    url = usersRoute();
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)  // Le payload ne contient que les champs modifiés
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }

  // Synchronisation des promotions si nécessaire
  if (userId && payload.Promotions) {
    try {
      const promoResult = await saveUserPromotions(userId, payload.Promotions, token);
      data.promotionsSync = promoResult;
    } catch (error) {
      console.error("Erreur lors de la synchronisation des promotions:", error);
      return Promise.reject(error);
    }
  }
  return data;
}
