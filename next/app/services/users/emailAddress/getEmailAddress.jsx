import { publicUserRoute } from "@/app/services/routes";
import { API_ERRORS } from "@/app/services/errorCodes";

/**
 * Récupère les données publiques d’un utilisateur via son adresse e-mail.
 * (GET /users/:email/public)
 *
 * @param {string} emailAddress - L’adresse e-mail de l’utilisateur.
 * @returns {Promise<Object>} - Les données publiques de l’utilisateur.
 * @throws {Error} - En cas d’erreur de la requête.
 */
export async function getEmailAddress(emailAddress) {
  const url = publicUserRoute(emailAddress);
  const res = await fetch(url);
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_EMAIL_ADDRESS);
  }
  if (res.status === 429) {
    throw new Error(API_ERRORS.TOO_MANY_REQUESTS.RATE_LIMIT_EXCEEDED);
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la récupération de l'adresse e-mail.");
}