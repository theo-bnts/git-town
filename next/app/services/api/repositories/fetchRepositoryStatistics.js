import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { handleApiError, handleNetworkError } from '@/app/services/errorHandler';
import { API_ERRORS } from '@/app/services/errorCodes';

/**
 * Récupère les statistiques d'un dépôt
 * @param {string} repositoryId - ID du dépôt
 * @param {object} options - Options de requête
 * @returns {Promise<object>} - Données de statistiques
 */
export async function fetchRepositoryStatistics(repositoryId, options = {}) {
  const { signal } = options;

  if (!repositoryId) {
    const error = new Error(API_ERRORS[400].INVALID_REPOSITORY_ID);
    error.code = "INVALID_REPOSITORY_ID";
    throw error;
  }

  try {
    const url = repositoryStatisticsRoute(repositoryId);
    const res = await fetchWithAuth(url, { signal });
    
    if (!res.ok) {
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        // Si le parsing échoue, on garde data vide
      }

      throw handleApiError(res, data);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    throw handleNetworkError(error);
  }
}
