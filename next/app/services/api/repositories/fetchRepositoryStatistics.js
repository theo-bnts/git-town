import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';

export async function fetchRepositoryStatistics(
  repositoryId,
  { retryDelay = 20000, maxRetries = 5, signal } = {},
) {
  let retries = 0;

  async function fetchStats() {
    const url = repositoryStatisticsRoute(repositoryId);
    const res = await fetchWithAuth(url, { signal });
    if (!res.ok) throw new Error('Erreur lors de la récupération des statistiques');
    const data = await res.json();

    const hasUndefined = (obj) => {
      if (obj === undefined) return true;
      if (obj && typeof obj === 'object') {
        return Object.values(obj).some(hasUndefined);
      }
      return false;
    };

    if (hasUndefined(data)) {
      if (retries < maxRetries) {
        retries++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchStats();
      }
      return { data, loading: true, retry: true };
    }

    return { data, loading: false, retry: false };
  }

  return fetchStats();
}
