'use client';

import { handleApiError } from '@/app/services/errorHandler';
import { promotionLevelsRoute } from '@/app/services/routes';

/**
 * Récupère la liste des niveaux de promotion
 * GET /promotion-levels
 * 
 * @param {string} token - Token d'authentification
 * @returns {Promise<object[]>} - Tableau de niveaux de promotion
 */
export default async function getPromotionLevels(token) {
  const url = promotionLevelsRoute();
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const text = await res.text();
  const data = text ? JSON.parse(text) : [];
  
  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }
  return data;
}
