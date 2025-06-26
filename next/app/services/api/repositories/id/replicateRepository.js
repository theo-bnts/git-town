import { replicateSourceRepositoryRoute } from '@/app/services/routes';
import { handleApiError } from '@/app/services/errorHandler';

/**
 * Réplique un dépôt vers un autre.
 * (POST /repositories/:sourceId/replicate { Id: targetId })
 * 
 * @param {string} sourceId - Id du dépôt source à répliquer.
 * @param {string} targetId - Id du dépôt cible qui va recevoir la réplique
 * @param {string} token - Token d'authentification
 * @returns {Promise<Object|null>} - Réponse JSON de l’API ou null si
 */
export default async function replicateRepository(sourceId, targetId, token) {
  const url = replicateSourceRepositoryRoute(sourceId);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ Id: targetId }),
  });
  
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  
  if (res.ok) {
    return data;
  }
  
  throw handleApiError(res, data);
}