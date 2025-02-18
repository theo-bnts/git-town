import { passwordRoute } from "@/app/services/routes";
import { API_ERRORS } from "@/app/services/errorCodes";

/**
 * Inscription via définition d’un mot de passe à l’aide d’un code temporaire.
 * (POST /users/:userId/password)
 *
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} temporaryCode - Le code temporaire envoyé par e-mail.
 * @param {string} newPassword - Le nouveau mot de passe à définir.
 * @returns {Promise<Object>} - La réponse du serveur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export async function postPassword(userId, temporaryCode, newPassword) {
  const url = passwordRoute(userId);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      TemporaryCode: temporaryCode.trim(),
      Password: newPassword.trim(),
    }),
  });
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_TEMPORARY_CODE);
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_USER_ID);
  }
  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de l'inscription.");
}
