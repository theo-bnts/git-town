import { tokenRoute } from "@/app/services/routes";
import { handleApiError } from "@/app/services/errorHandler";

/**
 * Connexion de l’utilisateur pour récupérer un token.
 * (POST /users/:userId/token)
 *
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} password - Le mot de passe de l’utilisateur.
 * @returns {Promise<Object>} - L’objet contenant le token.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export async function postToken(userId, password) {
  const url = tokenRoute(userId);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Password: password.trim() }),
  });
  const data = await res.json();

  if (res.ok) return data;
  handleApiError(res, data);
}
