// /app/services/api/users/saveUser.js

import { handleApiError } from "@/app/services/errorHandler";
import { userRoute, usersRoute } from "@/app/services/routes";
import saveUserPromotions from "./saveUserPromotions";

/**
 * Enregistrement d'un utilisateur.
 * (PUT /users) 
 * (PATCH /users/:userId)
 * 
 * @param {object} userData - Les données de l'utilisateur.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<object>} - L'utilisateur.
 */
export default async function saveUser(userId, payload, token) {
  let url, method;
  if (userId) {
    url = userRoute(userId);
    method = "PATCH";
  } else {
    url = usersRoute();
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }

  if (userId && payload.Promotions) {
    try {
      const promoResult = await saveUserPromotions(userId, payload.Promotions, token);
      data.promotionsSync = promoResult;
    } catch (error) {
      return Promise.reject(error);
    }
  }
  return data;
}
