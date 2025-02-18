import { tokenRoute } from "@/app/services/routes";
import { API_ERRORS } from "@/app/services/errorCodes";

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

  if (res.status === 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_PASSWORD);
  }
  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la connexion.");
}

