'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { promotionRoute, promotionsRoute } from '@/app/services/routes';

/**
 * Enregistrement d'une promotion
 * - PUT /promotions pour la création.
 * - PATCH /promotions/:promotionId pour la modification.
 *
 * @param {string|null} promotionId - L'identifiant de la promotion (null pour création).
 * @param {object} payload - Les données de la promotion.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - L'objet promotion créé ou modifié.
 */
export default async function savePromotions(promotionId, payload, token) {
  const url = promotionId ? promotionRoute(promotionId) : promotionsRoute();
  const method = promotionId ? 'PATCH' : 'PUT';

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

  return data;
}
