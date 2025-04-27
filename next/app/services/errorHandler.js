// /app/services/errorHandler.js
import { API_ERRORS } from "@/app/services/errorCodes";

/**
 * Gestion des erreurs API
 * 
 * @param {Response} res  - La réponse de l'API
 * @param {object} data - Le JSON retourné par l’API ({ error, ... })
 * @throws {Error} - Avec le message construit
 */
export function handleApiError(res, data) {
  const status = res.status;
  const key    = data.error;

  if (key && API_ERRORS[status]?.[key]) {
    throw new Error(API_ERRORS[status][key]);
  }

  const defaultMsg = API_ERRORS[status]?.default;
  if (defaultMsg) {
    const suffix = key ? ` : ${key}` : '';
    throw new Error(defaultMsg + suffix);
  }

  throw new Error(`Oups, une erreur s'est produite (code ${status}).`);
}
