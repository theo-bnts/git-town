'use client';

import { githubInviteRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Envoi d’une invitation à rejoindre l’organisation GitHub.
 * (POST /users/:userId/github)
 * 
 * @param {string} userId - L’identifiant de l’utilisateur.
 * @param {string} token - Le token d’authentification.
 * @returns {Promise<Object>} - La réponse du serveur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function postInvite(userId, token) {
  const url = githubInviteRoute(userId);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (res.ok) return data;
  handleApiError(res, data);
}
