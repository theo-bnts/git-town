'use client';

import { userPromotions } from '@/app/services/routes';

/**
 * Sauvegarde des promotions de l'utilisateur
 * PUT /users/:userId/promotions
 * 
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {object} promotionsData - Les promotions de l'utilisateur
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - Les promotions de l'utilisateur
 * @throws {Error} - En cas d'erreur de la requête
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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }

  return res.json();
}