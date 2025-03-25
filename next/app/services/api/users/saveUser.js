// /app/services/api/users/saveUser.js

import { handleApiError } from "@/app/services/errorHandler";
import { usersRoute, userRoute } from "@/app/services/routes";

/**
 * Enregistrement d'un utilisateur
 * PUT /users
 * PATCH /users/:userId
 * 
 * @param {object} userData - Les données de l'utilisateur
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - L'utilisateur
 */
export default async function saveUser(userData, token) {
  let url, method;
  if (userData.Id) {
    url = userRoute(userData.Id);
    method = "PATCH";
  } else {
    url = usersRoute();
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    return Promise.reject(handleApiError(res, data));
  }

  return data;
}
