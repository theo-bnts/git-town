import { githubRoute } from "@/app/services/routes";
import { API_ERRORS } from "@/app/services/errorCodes";

/**
 * Lie un compte GitHub au compte utilisateur.
 * (POST /users/:userId/github)
 *
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} code - Le code d’autorisation GitHub.
 * @param {string} token - Le token d’authentification (Bearer).
 * @returns {Promise<Object>} - La réponse du serveur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function postGithub(userId, code, token) {
  const url = githubRoute(userId);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ OAuthCode: code.trim() }),
  });
  const data = await res.json();

  if (res.ok) return data;
  
  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_OAUTH_APP_CODE);
  }
  if (res.status === 403) {
    throw new Error(API_ERRORS.FORBIDDEN.INSUFFICIENT_PERMISSIONS);
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_USER_ID);
  }
  if (res.status === 409) {
    throw new Error(API_ERRORS.CONFLICT.GITHUB_ID_ALREADY_DEFINED);
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la liaison GitHub.");
}
