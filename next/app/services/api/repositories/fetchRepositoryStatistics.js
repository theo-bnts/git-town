import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { hasAllProperties } from '@/app/utils/objectUtils';
import { handleApiError } from '@/app/services/errorHandler';
import { REPOSITORY_STATS_CONFIG } from '@/app/config/config';
import { REPOSITORY_STATISTICS_SHAPES as shapes } from './expectedResultsShape';

/**
 * Valide les données de statistiques reçues
 */
export function validateRepositoryStats(data, fullValidation = false) {
  if (!data) return { 
    valid: false, 
    message: 'Aucune donnée de statistiques disponible' 
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
    throw new Error("L'identifiant du dépôt est requis");
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
        return Promise.reject(handleApiError(res, data));
      }
      
      const data = await res.json();

      // Vérification simplifiée
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
        return { data, loading: true, retry: true };
      }

      return { data, loading: false, retry: false };
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      
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
