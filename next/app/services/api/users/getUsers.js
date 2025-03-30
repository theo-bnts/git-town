// app/services/api/users/getUsers.js
import { handleApiError } from '@/app/services/errorHandler';
import { usersRoute } from '@/app/services/routes';

/**
 * Récupération de la liste des utilisateurs.
 * (GET /users)
 * 
 * @param {string} token - Le token d’authentification.
 * @returns {Promise<Object>} - La liste des utilisateurs.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function getUsers(token) {
  const url = usersRoute();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (res.ok)
      return data;

  handleApiError(res, data);
}
