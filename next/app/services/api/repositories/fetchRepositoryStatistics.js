import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { minimumExpectedShape } from './expectedRepositoryStatisticsShape';
import { hasAllProperties } from '@/app/utils/objectUtils';
import { handleApiError } from '@/app/services/errorHandler';
import { REPOSITORY_STATS_CONFIG } from '@/app/config/requestConfig';
import { getFromCache, saveToCache, CACHE_KEYS } from '@/app/utils/cacheUtils';

/**
 * Récupère les statistiques d'un dépôt avec tentatives multiples
 * 
 * @param {string} repositoryId - L'identifiant du dépôt
 * @param {object} options - Options de requête
 * @param {number} options.initialDelay - Délai initial en ms
 * @param {number} options.maxRetries - Nombre maximum de tentatives
 * @param {number} options.backoffFactor - Facteur pour le délai exponentiel
 * @param {boolean} options.backgroundMode - Si true, utilise la config pour traitement en arrière-plan
 * @param {AbortSignal} options.signal - Signal pour annuler la requête
 * @param {boolean} options.skipCache - Si true, ignore le cache
 * @param {number} options.cacheTtl - Durée de vie du cache en ms
 * @returns {Promise<{data: object, loading: boolean, retry: boolean, fromCache?: boolean, cacheTimestamp?: number}>}
 * @throws {Error} - En cas d'erreur lors de la récupération
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
    signal,
    skipCache = false,
    cacheTtl
  } = options;

  let retries = 0;

  if (!repositoryId) {
    throw new Error("L'identifiant du dépôt est requis");
  }
  
  if (!skipCache) {
    const cached = getFromCache(CACHE_KEYS.REPO_STATS, repositoryId);
    if (cached) {
      return { 
        data: cached.data, 
        loading: false, 
        retry: false,
        fromCache: true,
        cacheTimestamp: cached.timestamp
      };
    }
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

      if (!hasAllProperties(data, minimumExpectedShape)) {
        
        if (retries < maxRetries) {
          retries++;
          const delay = initialDelay * Math.pow(backoffFactor, retries - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchStats();
        }
        return { data, loading: true, retry: true };
      }

      saveToCache(CACHE_KEYS.REPO_STATS, repositoryId, data, cacheTtl);

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
