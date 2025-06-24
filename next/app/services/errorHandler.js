import { API_ERRORS } from '@/app/services/errorCodes';

/**
 * Gestion des erreurs API
 * 
 * @param {Response} res - La réponse de l'API
 * @param {object} data - Le JSON retourné par l'API
 * @returns {Error} - L'erreur formatée
 */
export function handleApiError(res, data) {
  const status = res.status;
  const key = data.error || data.code;
  const error = new Error();
  error.status = status;
  
  if (status === 504) {
    error.message = API_ERRORS[504].default;
    error.code = "504";
    return error;
  }

  if (key && API_ERRORS[status]?.[key]) {
    error.message = API_ERRORS[status][key];
    error.code = key;
    return error;
  }

  const defaultMsg = API_ERRORS[status]?.default;
  if (defaultMsg) {
    const suffix = key ? ` : ${key}` : '';
    error.message = defaultMsg + suffix;
    error.code = `${status}`;
    return error;
  }

  error.message = `Oups, une erreur s'est produite (code ${status}).`;
  error.code = `ERROR_${status}`;
  return error;
}

/**
 * Gestion des erreurs réseau (hors API)
 * 
 * @param {Error} error - L'erreur originale
 * @returns {Error} - L'erreur enrichie
 */
export function handleNetworkError(error) {
  if (error.name === 'AbortError') return error;
  
  if (error.message?.includes('504') && !error.code) {
    error.code = "504";
    error.message = API_ERRORS[504].default;
    error.status = 504;
  }
  
  return error;
}
