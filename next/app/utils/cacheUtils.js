/**
 * Utilitaires de gestion du cache pour les statistiques
 */

const CACHE_KEYS = {
  REPO_STATS: 'repo_stats'
};

const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes par défaut

/**
 * Récupère des données du cache
 * @param {string} key - Clé de cache
 * @param {string} id - Identifiant de la ressource
 * @returns {Object|null} Données en cache ou null
 */
export function getFromCache(key, id) {
  if (typeof window === 'undefined') return null;
  
  try {
    const cacheKey = `${key}_${id}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp, ttl = DEFAULT_TTL } = JSON.parse(cached);
    
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    
    return { data, timestamp };
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
}

/**
 * Stocke des données en cache
 * @param {string} key - Clé de cache
 * @param {string} id - Identifiant de la ressource
 * @param {Object} data - Données à mettre en cache
 * @param {number} ttl - Durée de vie du cache (ms)
 */
export function saveToCache(key, id, data, ttl = DEFAULT_TTL) {
  if (typeof window === 'undefined') return;
  
  try {
    const cacheKey = `${key}_${id}`;
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde en cache:', error);
  }
}

export { CACHE_KEYS };