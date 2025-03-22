'use client';

import { userPromotions } from '@/app/services/routes';

/**
 * Récupération des promotions de l'utilisateur
 * GET /users/:userId/promotions
 * 
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - Les promotions de l'utilisateur
 * @throws {Error} - En cas d'erreur de la requête
 */
export default async function getUserPromotions(userId, token) {
  const url = userPromotions(userId);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  let data;
  try {
    data = await res.json();
  } catch (error) {
    data = {};
  }

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}