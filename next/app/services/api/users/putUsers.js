// /app/services/api/users/putUsers.js

import { usersRoute } from "@/app/services/routes";
import { handleApiError } from "@/app/services/errorHandler";

/**
 * Ajout d’un utilisateur.
 * (PUT /users)
 * 
 * @param {string} token - Le token d’authentification.
 * @param {Object} user - Les informations de l’utilisateur.
 * @returns {Promise<Object>} - Les informations de l’utilisateur ajouté.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function putUsers(token, user) {
  const url = usersRoute();
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  const data = await res.json();

  if (res.ok)
      return data;

  handleApiError(res, data);
}
