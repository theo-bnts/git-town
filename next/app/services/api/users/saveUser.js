'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { userRoute, usersRoute } from '@/app/services/routes';
import saveUserPromotions from '@/app/services/api/users/saveUserPromotions';

/**
 * Extrait l'id de la promotion, que ce soit un objet ou une chaîne.
 */
const extractPromotionId = (p) => (typeof p === 'object' ? p.Id : p);

/**
 * Enregistrement d'un utilisateur.
 * - PUT /users pour la création.
 * - PATCH /users/:userId pour la modification.
 *
 * @param {number|string|null} userId - L'identifiant de l'utilisateur (null pour création).
 * @param {object} payload - Les données de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - L'utilisateur, incluant les synchronisations de promotions.
 */
export default async function saveUser(userId, payload, token) {
  const url = userId ? userRoute(userId) : usersRoute();
  const method = userId ? 'PATCH' : 'PUT';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }

  const effectiveUserId = userId || data.Id;

  if (effectiveUserId && payload.Promotions) {
    const promotionIds = payload.Promotions.map(extractPromotionId);
    const promoResult = await saveUserPromotions(
      effectiveUserId, 
      promotionIds, 
      token
    );
    data.promotionsSync = promoResult;
  }
  return data;
}
