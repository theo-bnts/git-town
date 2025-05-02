import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { expectedShape } from './expectedRepositoryStatisticsShape';
import { hasAllProperties } from '@/app/utils/objectUtils';

export async function fetchRepositoryStatistics(
  repositoryId,
  { 
    retryDelay = Number(process.env.NEXT_PUBLIC_MAX_DELAY ?? 2000), 
    maxRetries = Number(process.env.NEXT_PUBLIC_MAX_RETRIES ?? 6), 
    signal 
  } = {},
) {
  let retries = 0;

  async function fetchStats() {
    const url = repositoryStatisticsRoute(repositoryId);
    const res = await fetchWithAuth(url, { signal });
    if (!res.ok) throw new Error('Erreur lors de la récupération des statistiques');
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
  }

  return fetchStats();
}
