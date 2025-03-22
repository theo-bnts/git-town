'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { userPromotions } from '@/app/services/routes';

/**
 * Sauvegarde des promotions de l'utilisateur
 * PUT /users/:userId/promotions
 * 
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {object} promotionsData - Les promotions de l'utilisateur
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - Les promotions de l'utilisateur
 */
export default async function saveUserPromotions(userId, promotionsData, token) {
  const url = userPromotions(userId);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(promotionsData)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }

  return data;
}
