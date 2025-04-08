// /app/services/api/promotions/id/deletePromotion.js
'use client';

import { promotionRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Supprime une promotion
 * (DELETE /promotions/:promotionId)
 *
 * @param {string} promotionId - L'identifiant de la promotion à supprimer.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - La réponse de l'API.
 * @throws {Error} - En cas d'erreur lors de la suppression.
 */
export default async function deletePromotion(promotionId, token) {
  const url = promotionRoute(promotionId);
  let res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  let text = await res.text();
  let data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
