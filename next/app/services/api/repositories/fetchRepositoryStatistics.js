import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';
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
    error.code = API_ERRORS[400].INVALID_REPOSITORY_ID;
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

      const errorCodes = {
        404: API_ERRORS[404].STATISTICS_NOT_FOUND,
        403: API_ERRORS[403].NOT_REPOSITORY_MEMBER,
        423: API_ERRORS[423].ARCHIVED
      };

      if (errorCodes[res.status]) {
        const error = handleApiError(res, data);
        error.code = errorCodes[res.status];
        throw error;
      } 
      
      if (res.status === 409) {
        if (data?.code === 'NO_GITHUB_DATA' || data?.code === 'PENDING_STATISTICS') {
          const error = handleApiError(res, data);
          error.code = API_ERRORS[409][data.code];
          throw error;
        }
      }

      throw handleApiError(res, data);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw error;
  }
}
