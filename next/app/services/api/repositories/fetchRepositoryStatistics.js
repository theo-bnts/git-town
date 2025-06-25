import { fetchWithAuth } from '@/app/services/auth';
import { repositoryStatisticsRoute } from '@/app/services/routes';
import { handleApiError, handleNetworkError } from '@/app/services/errorHandler';
import { API_ERRORS } from '@/app/services/errorCodes';

// Importation des données de simulation
import { 
  COMPLETE_STATS, 
  PARTIAL_STATS, 
  MINIMAL_STATS, 
  EMPTY_STATS 
} from '@/app/utils/test/mockStatisticsData';

/**
 * Récupère les statistiques d'un dépôt
 * @param {string} repositoryId - ID du dépôt
 * @param {object} options - Options de requête
 * @returns {Promise<object>} - Données de statistiques
 */
export async function fetchRepositoryStatistics(repositoryId, options = {}) {
  const { signal, simulateMode = null } = options;

  if (!repositoryId) {
    const error = new Error(API_ERRORS[400].INVALID_REPOSITORY_ID);
    error.code = "INVALID_REPOSITORY_ID";
    throw error;
  }

  // Mode simulation pour les tests
  if (simulateMode) {
    // Simuler un délai de réseau
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`[Simulation] Mode: ${simulateMode}`);
    
    // Retourner les données selon le mode de simulation
    switch (simulateMode) {
      case 'complete':
        return COMPLETE_STATS;
      case 'partial':
        return PARTIAL_STATS;
      case 'minimal':
        return MINIMAL_STATS;
      case 'empty':
        return EMPTY_STATS;
      case 'error':
        const error = new Error("Erreur simulée pour les tests");
        error.code = "SIMULATION_ERROR";
        throw error;
      case 'timeout':
        const timeoutError = new Error("Délai d'attente dépassé (simulation)");
        timeoutError.code = "GATEWAY_TIMEOUT";
        throw timeoutError;
      default:
        return PARTIAL_STATS;
    }
  }

  // Code original pour l'appel API réel
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
