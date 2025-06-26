import { temporaryCodeRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Demande la génération d’un code temporaire pour l’inscription.
 * (POST /users/:userId/temporary-code)
 *
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @returns {Promise<Object>} - La réponse du serveur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function postTemporaryCode(userId) {
  const url = temporaryCodeRoute(userId);
  const res = await fetch(url, 
    { 
      method: 'POST' 
    });
  const data = await res.json();

  if (res.ok) return data;
  throw handleApiError(res, data);
}
