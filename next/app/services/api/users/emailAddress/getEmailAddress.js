// /app/services/api/users/emailAddress/getEmailAddress.js

import { publicRoute } from "@/app/services/routes";
import { handleApiError } from "@/app/services/errorHandler";

/**
 * Récupère les données publiques d’un utilisateur via son adresse e-mail.
 * (GET /users/:email/public)
 *
 * @param {string} emailAddress - L’adresse e-mail de l’utilisateur.
 * @returns {Promise<Object>} - Les données publiques de l’utilisateur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export default async function getEmailAddress(emailAddress) {
  const url = publicRoute(emailAddress);
  const res = await fetch(url);
  const data = await res.json();

  if (res.ok) return data;
  handleApiError(res, data);
}
