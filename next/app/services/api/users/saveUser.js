// /app/services/api/users/saveUser.js
import { handleApiError } from '@/app/services/errorHandler';
import { userRoute, usersRoute } from '@/app/services/routes';
import saveUserPromotions from '@/app/services/api/users/saveUserPromotions';

/**
 * Enregistrement d'un utilisateur.
 * (PUT /users) pour la création 
 * (PATCH /users/:userId) pour la modification
 * 
 * @param {number|string|null} userId - L'identifiant de l'utilisateur (null pour création).
 * @param {object} payload - Les données de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - L'utilisateur.
 */
export default async function saveUser(userId, payload, token) {
  let url, method;
  if (userId) {
    url = userRoute(userId);
    method = 'PATCH';
  } else {
    url = usersRoute();
    method = 'PUT';
  }

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
    try {
      const promoResult = await saveUserPromotions(effectiveUserId, payload.Promotions, token);
      data.promotionsSync = promoResult;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  return data;
}
