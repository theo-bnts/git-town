import { passwordRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

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
export default async function postPassword(userId, temporaryCode, newPassword) {
  const url = passwordRoute(userId);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      TemporaryCode: temporaryCode.trim(),
      Password: newPassword.trim(),
    }),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (res.ok) return data;
  handleApiError(res, data);
}
