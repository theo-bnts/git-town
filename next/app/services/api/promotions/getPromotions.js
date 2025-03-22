'use client';

import { handleApiError } from "@/app/services/errorHandler";
import { promotionsRoute } from "../../routes";

/**
 * Réupération de la liste des promotions
 * GET /promotions
 * 
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - Les promotions
 * @throws {Error} - En cas d'erreur de la requête
 */
export default async function getPromotions(token) {
  const url = promotionsRoute();
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
    handleApiError(res, data);
  }

  return data;
}
