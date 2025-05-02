import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { expectedShape } from './expectedRepositoryStatisticsShape';
import { hasAllProperties } from '@/app/utils/objectUtils';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Récupère les statistiques d'un dépôt avec tentatives multiples
 * (GET /repositories/:repositoryId/statistics)
 *
 * 
 * @param {string} repositoryId - L'identifiant du dépôt
 * @param {object} options - Options de requête
 * @param {number} options.retryDelay - Délai en ms entre les tentatives (défaut: valeur de NEXT_PUBLIC_MAX_DELAY)
 * @param {number} options.maxRetries - Nombre maximum de tentatives (défaut: valeur de NEXT_PUBLIC_MAX_RETRIES)
 * @param {AbortSignal} options.signal - Signal pour annuler la requête
 * @returns {Promise<{data: object, loading: boolean, retry: boolean}>} - Données, état de chargement et besoin de réessayer
 * @throws {Error} - En cas d'erreur lors de la récupération
 */
export async function fetchRepositoryStatistics(
  repositoryId,
  { 
    retryDelay = Number(process.env.NEXT_PUBLIC_MAX_DELAY), 
    maxRetries = Number(process.env.NEXT_PUBLIC_MAX_RETRIES), 
    signal 
  } = {},
) {
  let retries = 0;

  async function fetchStats() {
    try {
      const url = repositoryStatisticsRoute(repositoryId);
      const res = await fetchWithAuth(url, { signal });
      
      if (!res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        return Promise.reject(handleApiError(res, data));
      }
      
      const data = await res.json();

      if (!hasAllProperties(data, expectedShape)) {
        if (retries < maxRetries) {
          retries++;
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchStats();
        }
        return { data, loading: true, retry: true };
      }

      return { data, loading: false, retry: false };
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      
      if (retries < maxRetries) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchStats();
      }
      
      throw error;
    }
  }

  return fetchStats();
}
