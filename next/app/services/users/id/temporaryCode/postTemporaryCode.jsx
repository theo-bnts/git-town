import { temporaryCodeRoute } from "@/app/services/routes";
import { API_ERRORS } from "@/app/services/errorCodes";

/**
 * Demande la génération d’un code temporaire pour l’inscription.
 * (POST /users/:userId/temporary-code)
 *
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @returns {Promise<Object>} - La réponse du serveur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export async function postTemporaryCode(userId) {
  const url = temporaryCodeRoute(userId);
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_USER_ID);
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la génération du code temporaire.");
}
