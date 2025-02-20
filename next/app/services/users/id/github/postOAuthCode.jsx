// app/services/users/id/github/postOAuthCode.jsx
import { githubOAuthRoute } from "@/app/services/routes";
import { handleApiError } from "@/app/services/errorHandler";

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
export default async function postOAuthCode(userId, code, token) {
  const url = githubOAuthRoute(userId);
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
  handleApiError(res, data);
}
