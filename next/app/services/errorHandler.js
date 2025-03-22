// /app/services/errorHandler.js
import { API_ERRORS } from "@/app/services/errorCodes";

/**
 * Gestion des erreurs API
 * 
 * @param {Response} res - La réponse de l'API
 * @param {object} data - Les données de la réponse
 * @returns {object} - L'erreur
 */
export function handleApiError(res, data) {
  const status = res.status;

  if (data.error && API_ERRORS[status] && API_ERRORS[status][data.error]) {
    throw new Error(API_ERRORS[status][data.error]);
  }
  
  if (API_ERRORS[status] && API_ERRORS[status].default) {
    throw new Error(API_ERRORS[status].default);
  }

  throw new Error(`Oups, une erreur s'est produite (code ${status}).`);
}
