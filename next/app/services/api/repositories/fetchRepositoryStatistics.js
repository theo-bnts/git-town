import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { expectedShape, minimumExpectedShape } from './expectedRepositoryStatisticsShape';
import { hasAllProperties } from '@/app/utils/objectUtils';
import { handleApiError } from '@/app/services/errorHandler';

const DEFAULT_BACKOFF_FACTOR = 1.5;

/**
 * Récupère les statistiques d'un dépôt avec tentatives multiples
 * (GET /repositories/:repositoryId/statistics)
 *
 * @param {string} repositoryId - L'identifiant du dépôt
 * @param {object} options - Options de requête
 * @param {number} options.initialDelay - Délai initial en ms (défaut: valeur de NEXT_PUBLIC_INITIAL_DELAY)
 * @param {number} options.maxRetries - Nombre maximum de tentatives (défaut: valeur de NEXT_PUBLIC_MAX_RETRIES)
 * @param {number} options.backoffFactor - Facteur pour le délai exponentiel (défaut: 1.5)
 * @param {AbortSignal} options.signal - Signal pour annuler la requête
 * @returns {Promise<{data: object, loading: boolean, retry: boolean}>} - Données, état de chargement et besoin de réessayer
 * @throws {Error} - En cas d'erreur lors de la récupération
 */
export async function fetchRepositoryStatistics(
  repositoryId,
  { 
    initialDelay = Number(process.env.NEXT_PUBLIC_INITIAL_DELAY || 1000), 
    maxRetries = Number(process.env.NEXT_PUBLIC_MAX_RETRIES || 3), 
    backoffFactor = DEFAULT_BACKOFF_FACTOR,
    signal 
  } = {},
) {
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

      if (!hasAllProperties(data, minimumExpectedShape)) {
        
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
