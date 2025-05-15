import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { hasAllProperties } from '@/app/utils/objectUtils';
import { handleApiError } from '@/app/services/errorHandler';
import { REPOSITORY_STATS_CONFIG } from '@/app/config/config';
import { REPOSITORY_STATISTICS_SHAPES as shapes } from './expectedResultsShape';
import { API_ERRORS } from '@/app/services/errorCodes';

/**
 * Erreurs spécifiques aux statistiques de dépôt
 */
export const REPOSITORY_STATS_ERRORS = {
  PENDING: 'PENDING_STATISTICS',
  NOT_FOUND: 'STATISTICS_NOT_FOUND',
  NO_DATA: 'NO_GITHUB_DATA',
  ARCHIVED: 'ARCHIVED',
  FORBIDDEN: 'NOT_REPOSITORY_MEMBER',
  INVALID_ID: 'INVALID_REPOSITORY_ID'
};

/**
 * Valide les données de statistiques reçues
 */
export function validateRepositoryStats(data, fullValidation = false) {
  if (!data) return { 
    valid: false, 
    message: API_ERRORS[404].STATISTICS_NOT_FOUND || 'Aucune donnée de statistiques disponible' 
  };
  
  const shapeToCheck = fullValidation ? shapes.complete : shapes.minimal;
  
  if (!hasAllProperties(data, shapeToCheck)) {
    return { 
      valid: false, 
      partial: true,
      message: 'Format de données incomplet: certaines données pourraient manquer' 
    };
  }
  
  return { valid: true, partial: false };
}

/**
 * Récupère les statistiques d'un dépôt avec tentatives multiples
 */
export async function fetchRepositoryStatistics(
  repositoryId,
  options = {}
) {
  const configType = options.backgroundMode ? 'background' : 'standard';
  const defaultConfig = REPOSITORY_STATS_CONFIG[configType];
  
  const { 
    initialDelay = defaultConfig.initialDelay,
    maxRetries = defaultConfig.maxRetries,
    backoffFactor = defaultConfig.backoffFactor,
    signal
  } = options;

  let retries = 0;

  if (!repositoryId) {
    const error = new Error(API_ERRORS[400].INVALID_REPOSITORY_ID);
    error.code = REPOSITORY_STATS_ERRORS.INVALID_ID;
    throw error;
  }

  async function fetchStats() {
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

        if (res.status === 404) {
          const error = handleApiError(res, data);
          error.code = REPOSITORY_STATS_ERRORS.NOT_FOUND;
          return Promise.reject(error);
        } else if (res.status === 403) {
          const error = handleApiError(res, data);
          error.code = REPOSITORY_STATS_ERRORS.FORBIDDEN;
          return Promise.reject(error);
        } else if (res.status === 423) {
          const error = handleApiError(res, data);
          error.code = REPOSITORY_STATS_ERRORS.ARCHIVED;
          return Promise.reject(error);
        }

        return Promise.reject(handleApiError(res, data));
      }
      
      const data = await res.json();

      if (data.processing === true) {
        if (retries < maxRetries) {
          retries++;
          const delay = initialDelay * Math.pow(backoffFactor, retries - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchStats();
        }
        
        const error = new Error(API_ERRORS[409].PENDING_STATISTICS);
        error.code = REPOSITORY_STATS_ERRORS.PENDING;
        return Promise.reject(error);
      }

      const hasMinimumData = Boolean(
        data?.Global?.Commits?.Weekly?.Counts || 
        (Array.isArray(data?.Users) && data.Users.length > 0)
      );

      if (!hasMinimumData) {
        if (retries < maxRetries) {
          retries++;
          const delay = initialDelay * Math.pow(backoffFactor, retries - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchStats();
        }
        
        if (data && Object.keys(data).length === 0) {
          const error = new Error(API_ERRORS[409].NO_GITHUB_DATA);
          error.code = REPOSITORY_STATS_ERRORS.NO_DATA;
          return Promise.reject(error);
        }
        
        return { data, loading: true, retry: true };
      }

      return { data, loading: false, retry: false };
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      
      if (error.code) throw error;
      
      if (retries < maxRetries) {
        retries++;
        const delay = initialDelay * Math.pow(backoffFactor, retries - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchStats();
      }
      
      throw error;
    }
  }

  return fetchStats();
}
